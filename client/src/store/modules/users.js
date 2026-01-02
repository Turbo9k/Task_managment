import api from '../../services/api'

const state = {
  users: [],
  currentUser: null,
  isLoading: false,
  error: null
}

const getters = {
  users: state => state.users,
  currentUser: state => state.currentUser,
  isLoading: state => state.isLoading,
  error: state => state.error,
  userById: state => id => state.users.find(u => u.id === parseInt(id))
}

const mutations = {
  SET_LOADING(state, loading) {
    state.isLoading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  SET_USERS(state, users) {
    state.users = users
  },
  ADD_USER(state, user) {
    const existingIndex = state.users.findIndex(u => u.id === user.id)
    if (existingIndex !== -1) {
      state.users.splice(existingIndex, 1, user)
    } else {
      state.users.push(user)
    }
  },
  UPDATE_USER(state, user) {
    const index = state.users.findIndex(u => u.id === user.id)
    if (index !== -1) {
      state.users.splice(index, 1, user)
    }
  },
  REMOVE_USER(state, userId) {
    state.users = state.users.filter(u => u.id !== userId)
  },
  SET_CURRENT_USER(state, user) {
    state.currentUser = user
  },
  CLEAR_USERS(state) {
    state.users = []
    state.currentUser = null
  }
}

const actions = {
  async fetchUsers({ commit }, search = '') {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await api.get('/users', { params: { search } })
      commit('SET_USERS', response.data)
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch users'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchUser({ commit }, userId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await api.get(`/users/${userId}`)
      commit('SET_CURRENT_USER', response.data)
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch user'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateUser({ commit }, { userId, userData }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await api.put(`/users/${userId}`, userData)
      commit('UPDATE_USER', response.data)
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update user'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteUser({ commit }, userId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      await api.delete(`/users/${userId}`)
      commit('REMOVE_USER', userId)
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete user'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchUserStats({ commit }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await api.get('/users/stats')
      return response.data
    } catch (error) {
      // If endpoint doesn't exist, return default stats
      if (error.response?.status === 404) {
        return {
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          projectsCount: 0
        }
      }
      const message = error.response?.data?.error || 'Failed to fetch user stats'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchUserActivity({ commit }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await api.get('/users/activity')
      return response.data
    } catch (error) {
      // If endpoint doesn't exist, return empty array
      if (error.response?.status === 404) {
        return []
      }
      const message = error.response?.data?.error || 'Failed to fetch user activity'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
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
