import api from '../../services/api'

const state = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null
}

const getters = {
  projects: state => state.projects,
  currentProject: state => state.currentProject,
  isLoading: state => state.isLoading,
  error: state => state.error,
  projectById: state => id => state.projects.find(p => p.id === parseInt(id))
}

const mutations = {
  SET_LOADING(state, loading) {
    state.isLoading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  SET_PROJECTS(state, projects) {
    state.projects = projects
  },
  ADD_PROJECT(state, project) {
    state.projects.unshift(project)
  },
  UPDATE_PROJECT(state, project) {
    const index = state.projects.findIndex(p => p.id === project.id)
    if (index !== -1) {
      state.projects.splice(index, 1, project)
    }
  },
  REMOVE_PROJECT(state, projectId) {
    state.projects = state.projects.filter(p => p.id !== projectId)
  },
  SET_CURRENT_PROJECT(state, project) {
    state.currentProject = project
  },
  ADD_MEMBER(state, member) {
    if (state.currentProject && state.currentProject.members) {
      state.currentProject.members.push(member)
    }
  },
  REMOVE_MEMBER(state, userId) {
    if (state.currentProject && state.currentProject.members) {
      state.currentProject.members = state.currentProject.members.filter(m => m.id !== userId)
    }
  },
  CLEAR_PROJECTS(state) {
    state.projects = []
    state.currentProject = null
  }
}

const actions = {
  async fetchProjects({ commit }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await api.get('/projects')
      commit('SET_PROJECTS', response.data)
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch projects'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchProject({ commit }, projectId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await api.get(`/projects/${projectId}`)
      commit('SET_CURRENT_PROJECT', response.data)
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch project'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createProject({ commit }, projectData) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await api.post('/projects', projectData)
      commit('ADD_PROJECT', response.data)
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create project'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateProject({ commit }, { projectId, projectData }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await api.put(`/projects/${projectId}`, projectData)
      commit('UPDATE_PROJECT', response.data)
      if (state.currentProject && state.currentProject.id === projectId) {
        commit('SET_CURRENT_PROJECT', response.data)
      }
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update project'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteProject({ commit }, projectId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      await api.delete(`/projects/${projectId}`)
      commit('REMOVE_PROJECT', projectId)
      if (state.currentProject && state.currentProject.id === projectId) {
        commit('SET_CURRENT_PROJECT', null)
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete project'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async addMember({ commit }, { projectId, memberData }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await api.post(`/projects/${projectId}/members`, memberData)
      commit('ADD_MEMBER', response.data)
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to add member'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async removeMember({ commit }, { projectId, userId }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`)
      commit('REMOVE_MEMBER', userId)
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to remove member'
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
