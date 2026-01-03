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
      const response = await api.get('/auth/me')
      commit('SET_USER', response.data.user)
      commit('SET_TOKEN', state.token)
    } catch (error) {
      console.error('Auth check failed:', error)
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        console.log('Network error during auth check, continuing without auth')
      } else {
        commit('LOGOUT')
      }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async login({ commit }, credentials) {
    commit('SET_LOADING', true)
    
    try {
      const response = await api.post('/auth/login', credentials)
      const { token, user } = response.data
      
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
      
      toast.success('Welcome back!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed'
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
      console.log('Social login - setting token')
      // Set token first so API calls use it
      commit('SET_TOKEN', token)
      
      console.log('Social login - calling /auth/me')
      // Verify the token with backend
      const response = await api.get('/auth/me')
      
      console.log('Social login - user data received:', response.data)
      commit('SET_USER', response.data.user)
      
      toast.success(`Welcome! Signed in with ${provider}`)
      return { success: true }
    } catch (error) {
      console.error('Social login error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Error message:', error.message)
      
      const message = error.response?.data?.error || error.message || 'Social login failed'
      toast.error(message)
      commit('LOGOUT') // Clear invalid token
      return { success: false, error: message }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async logout({ commit, dispatch }) {
    try {
      // Disconnect socket
      await dispatch('socket/disconnect')
      
      // Clear auth state
      commit('LOGOUT')
      
      // Clear other modules
      commit('projects/CLEAR_PROJECTS')
      commit('tasks/CLEAR_TASKS')
      commit('users/CLEAR_USERS')
      
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  async updateProfile({ commit }, profileData) {
    try {
      // Log what we're sending (truncate avatar for logging)
      const logData = {
        ...profileData,
        avatar: profileData.avatar ? profileData.avatar.substring(0, 50) + '...' : null
      }
      console.log('[Auth] Updating profile:', logData)
      
      const response = await api.put('/users/profile', profileData)
      commit('SET_USER', response.data)
      toast.success('Profile updated successfully')
      return { success: true }
    } catch (error) {
      console.error('[Auth] Profile update error:', error)
      console.error('[Auth] Error response:', error.response?.data)
      const message = error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || 'Profile update failed'
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
