import api from '../../services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()

const state = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: false
}

const getters = {
  isAuthenticated: state => state.isAuthenticated,
  user: state => state.user,
  token: state => state.token,
  isLoading: state => state.isLoading
}

const mutations = {
  SET_LOADING(state, loading) {
    state.isLoading = loading
  },
  SET_USER(state, user) {
    state.user = user
    state.isAuthenticated = !!user
    console.log('SET_USER called:', { 
      hasUser: !!user, 
      userId: user?.id, 
      email: user?.email,
      isAuthenticated: !!user 
    })
  },
  SET_TOKEN(state, token) {
    state.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  },
  LOGOUT(state) {
    state.user = null
    state.token = null
    state.isAuthenticated = false
    localStorage.removeItem('token')
  }
}

const actions = {
  async checkAuth({ commit, state }) {
    if (!state.token) {
      commit('SET_LOADING', false)
      return
    }

    commit('SET_LOADING', true)
    
    try {
      console.log('Checking auth with token:', state.token ? 'Token exists' : 'No token');
      const response = await api.get('/auth/me')
      console.log('Auth check successful:', response.data)
      commit('SET_USER', response.data.user)
      commit('SET_TOKEN', state.token)
    } catch (error) {
      console.error('Auth check failed:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      // Only logout on 401/403, not on network errors
      if (error.response) {
        const status = error.response.status
        if (status === 401 || status === 403) {
          console.log('Invalid token, logging out')
          commit('LOGOUT')
        } else {
          console.log('Auth check failed with status', status, 'but keeping session')
        }
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        console.log('Network error during auth check, continuing without auth')
        // Don't logout on network errors - might be temporary
      }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async login({ commit }, credentials) {
    commit('SET_LOADING', true)
    
    try {
      console.log('Attempting login to:', api.defaults.baseURL + '/auth/login');
      const response = await api.post('/auth/login', credentials)
      const { token, user } = response.data
      
      console.log('Login successful, setting token and user:', { 
        hasToken: !!token, 
        userId: user?.id,
        email: user?.email 
      });
      
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
      
      // Don't verify immediately - the token was just created, give it a moment
      // The router guard will check auth when navigating to dashboard
      console.log('Login complete, token set. Auth will be checked on navigation.')
      
      toast.success('Welcome back!')
      return { success: true }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        request: error.request ? 'Request made but no response' : 'No request made'
      });
      
      let message = 'Login failed';
      if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.message) {
        message = error.message;
      } else if (!error.response && error.request) {
        message = 'Network error: Unable to reach server. Please check your connection.';
      }
      
      toast.error(message)
      return { success: false, error: message }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async register({ commit }, userData) {
    commit('SET_LOADING', true)
    
    try {
      const response = await api.post('/auth/register', userData)
      const { token, user } = response.data
      
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
      
      toast.success('Account created successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async socialLogin({ commit }, { provider, token }) {
    commit('SET_LOADING', true)
    
    try {
      // Verify the token with backend
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      commit('SET_TOKEN', token)
      commit('SET_USER', response.data.user)
      
      toast.success(`Welcome! Signed in with ${provider}`)
      return { success: true }
    } catch (error) {
      const message = 'Social login failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async logout({ commit, dispatch }) {
    try {
      // Disconnect socket (use root: true for namespaced modules)
      try {
        await dispatch('socket/disconnect', null, { root: true })
      } catch (e) {
        // Socket might not be connected, ignore
        console.log('Socket disconnect skipped:', e.message)
      }
      
      // Clear auth state
      commit('LOGOUT')
      
      // Clear other modules (use commit with root: true for namespaced modules)
      try {
        commit('projects/CLEAR_PROJECTS', null, { root: true })
        commit('tasks/CLEAR_TASKS', null, { root: true })
        commit('users/CLEAR_USERS', null, { root: true })
      } catch (e) {
        // Modules might not be initialized, ignore
        console.log('Module clear skipped:', e.message)
      }
      
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local state even if other operations fail
      commit('LOGOUT')
    }
  },

  async updateProfile({ commit }, profileData) {
    try {
      const response = await api.put('/users/profile', profileData)
      commit('SET_USER', response.data)
      toast.success('Profile updated successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  async changePassword({ commit }, passwordData) {
    try {
      await api.put('/auth/change-password', passwordData)
      toast.success('Password changed successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Password change failed'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  async deleteAccount({ commit, dispatch }) {
    try {
      await api.delete('/users/account')
      
      // Clear all data and logout
      await dispatch('logout')
      
      toast.success('Account deleted successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Account deletion failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
