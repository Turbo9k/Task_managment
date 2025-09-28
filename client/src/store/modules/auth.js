import api from '../../services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()

const state = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
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
      commit('LOGOUT')
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
      const response = await api.put('/users/profile', profileData)
      commit('SET_USER', response.data)
      toast.success('Profile updated successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed'
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
