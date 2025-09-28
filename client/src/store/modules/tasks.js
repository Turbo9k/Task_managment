import api from '../../services/api'

const state = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  filters: {
    status: null,
    assignee: null,
    priority: null,
    search: ''
  }
}

const getters = {
  tasks: state => state.tasks,
  currentTask: state => state.currentTask,
  isLoading: state => state.isLoading,
  error: state => state.error,
  filters: state => state.filters,
  taskById: state => id => state.tasks.find(t => t.id === parseInt(id)),
  filteredTasks: state => {
    let filtered = [...state.tasks]
    
    if (state.filters.status) {
      filtered = filtered.filter(task => task.status === state.filters.status)
    }
    
    if (state.filters.assignee) {
      filtered = filtered.filter(task => task.assignee_id === parseInt(state.filters.assignee))
    }
    
    if (state.filters.priority) {
      filtered = filtered.filter(task => task.priority === state.filters.priority)
    }
    
    if (state.filters.search) {
      const search = state.filters.search.toLowerCase()
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search)
      )
    }
    
    return filtered
  },
  tasksByStatus: state => {
    const grouped = {
      todo: [],
      in_progress: [],
      review: [],
      done: []
    }
    
    state.tasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task)
      }
    })
    
    return grouped
  },
  overdueTasks: state => {
    const now = new Date()
    return state.tasks.filter(task => 
      task.due_date && 
      new Date(task.due_date) < now && 
      task.status !== 'done'
    )
  }
}

const mutations = {
  SET_LOADING(state, loading) {
    state.isLoading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  SET_TASKS(state, tasks) {
    state.tasks = tasks
  },
  ADD_TASK(state, task) {
    state.tasks.unshift(task)
  },
  UPDATE_TASK(state, task) {
    const index = state.tasks.findIndex(t => t.id === task.id)
    if (index !== -1) {
      state.tasks.splice(index, 1, task)
    }
  },
  REMOVE_TASK(state, taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId)
  },
  SET_CURRENT_TASK(state, task) {
    state.currentTask = task
  },
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters }
  },
  CLEAR_FILTERS(state) {
    state.filters = {
      status: null,
      assignee: null,
      priority: null,
      search: ''
    }
  },
  ADD_COMMENT(state, { taskId, comment }) {
    const task = state.tasks.find(t => t.id === taskId)
    if (task) {
      if (!task.comments) {
        task.comments = []
      }
      task.comments.push(comment)
    }
  },
  CLEAR_TASKS(state) {
    state.tasks = []
    state.currentTask = null
  }
}

const actions = {
  async fetchTasks({ commit }, projectId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await api.get(`/tasks/project/${projectId}`)
      commit('SET_TASKS', response.data)
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch tasks'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchTask({ commit }, taskId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await api.get(`/tasks/${taskId}`)
      commit('SET_CURRENT_TASK', response.data)
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch task'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createTask({ commit }, taskData) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await api.post('/tasks', taskData)
      commit('ADD_TASK', response.data)
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create task'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateTask({ commit }, { taskId, taskData }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData)
      commit('UPDATE_TASK', response.data)
      if (state.currentTask && state.currentTask.id === taskId) {
        commit('SET_CURRENT_TASK', response.data)
      }
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update task'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteTask({ commit }, taskId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      await api.delete(`/tasks/${taskId}`)
      commit('REMOVE_TASK', taskId)
      if (state.currentTask && state.currentTask.id === taskId) {
        commit('SET_CURRENT_TASK', null)
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete task'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async addComment({ commit }, { taskId, content }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await api.post(`/tasks/${taskId}/comments`, { content })
      commit('ADD_COMMENT', { taskId, comment: response.data })
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to add comment'
      commit('SET_ERROR', message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  setFilters({ commit }, filters) {
    commit('SET_FILTERS', filters)
  },

  clearFilters({ commit }) {
    commit('CLEAR_FILTERS')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
