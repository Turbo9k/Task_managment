import { io } from 'socket.io-client'
import { useToast } from 'vue-toastification'

const toast = useToast()

const state = {
  socket: null,
  isConnected: false,
  onlineUsers: new Map(),
  editingTasks: new Map(),
  typingUsers: new Map()
}

const getters = {
  isConnected: state => state.isConnected,
  onlineUsers: state => Array.from(state.onlineUsers.values()),
  editingTasks: state => state.editingTasks,
  typingUsers: state => state.typingUsers
}

const mutations = {
  SET_SOCKET(state, socket) {
    state.socket = socket
  },
  SET_CONNECTED(state, connected) {
    state.isConnected = connected
  },
  ADD_ONLINE_USER(state, user) {
    state.onlineUsers.set(user.id, user)
  },
  REMOVE_ONLINE_USER(state, userId) {
    state.onlineUsers.delete(userId)
  },
  SET_EDITING_TASK(state, { taskId, user, isEditing }) {
    if (isEditing) {
      state.editingTasks.set(taskId, user)
    } else {
      state.editingTasks.delete(taskId)
    }
  },
  SET_TYPING_USER(state, { taskId, user, isTyping }) {
    const key = `${taskId}-${user.id}`
    if (isTyping) {
      state.typingUsers.set(key, user)
    } else {
      state.typingUsers.delete(key)
    }
  },
  CLEAR_SOCKET(state) {
    if (state.socket) {
      state.socket.disconnect()
      state.socket = null
    }
    state.isConnected = false
    state.onlineUsers.clear()
    state.editingTasks.clear()
    state.typingUsers.clear()
  }
}

const actions = {
  async connect({ commit, state, rootGetters }) {
    if (state.socket) {
      return
    }

    const token = rootGetters['auth/token']
    if (!token) {
      return
    }

    try {
      // Determine socket URL - use same logic as API
      const isLocalhost = typeof window !== 'undefined' && 
                         (window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1');
      const socketUrl = process.env.VUE_APP_SOCKET_URL || 
                       (isLocalhost ? 'http://localhost:3000' : window.location.origin);
      
      const socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling']
      })

      commit('SET_SOCKET', socket)

      // Connection events
      socket.on('connect', () => {
        console.log('🔌 Socket connected')
        commit('SET_CONNECTED', true)
      })

      socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected')
        commit('SET_CONNECTED', false)
      })

      socket.on('connect_error', (error) => {
        console.error('🔌 Socket connection error:', error)
        commit('SET_CONNECTED', false)
      })

      // User events
      socket.on('user_joined', ({ user }) => {
        commit('ADD_ONLINE_USER', user)
        toast.info(`${user.name} joined the project`)
      })

      socket.on('user_left', ({ user }) => {
        commit('REMOVE_ONLINE_USER', user.id)
        toast.info(`${user.name} left the project`)
      })

      socket.on('user_status_changed', ({ userId, status }) => {
        const user = state.onlineUsers.get(userId)
        if (user) {
          user.status = status
          commit('ADD_ONLINE_USER', user)
        }
      })

      // Task events
      socket.on('task_created', (task) => {
        // Handle in tasks module
        commit('tasks/ADD_TASK', task, { root: true })
        toast.success(`New task: ${task.title}`)
      })

      socket.on('task_updated', (task) => {
        commit('tasks/UPDATE_TASK', task, { root: true })
      })

      socket.on('task_deleted', ({ id }) => {
        commit('tasks/REMOVE_TASK', id, { root: true })
        toast.info('Task deleted')
      })

      socket.on('task_editing_status', ({ taskId, user, isEditing }) => {
        commit('SET_EDITING_TASK', { taskId, user, isEditing })
      })

      socket.on('task_comment_added', ({ taskId, comment }) => {
        commit('tasks/ADD_COMMENT', { taskId, comment }, { root: true })
        toast.info(`New comment on task`)
      })

      socket.on('comment_typing_status', ({ taskId, user, isTyping }) => {
        commit('SET_TYPING_USER', { taskId, user, isTyping })
      })

      // Project events
      socket.on('project_updated', (project) => {
        commit('projects/UPDATE_PROJECT', project, { root: true })
      })

      socket.on('project_deleted', ({ id }) => {
        commit('projects/REMOVE_PROJECT', id, { root: true })
        toast.info('Project deleted')
      })

      socket.on('member_added', (member) => {
        commit('projects/ADD_MEMBER', member, { root: true })
        toast.success(`${member.name} added to project`)
      })

      socket.on('member_removed', ({ userId }) => {
        commit('projects/REMOVE_MEMBER', userId, { root: true })
        toast.info('Member removed from project')
      })

    } catch (error) {
      console.error('Socket connection failed:', error)
      toast.error('Failed to connect to real-time updates')
    }
  },

  async disconnect({ commit }) {
    commit('CLEAR_SOCKET')
  },

  joinProject({ state }, projectId) {
    if (state.socket) {
      state.socket.emit('join_project', projectId)
    }
  },

  leaveProject({ state }, projectId) {
    if (state.socket) {
      state.socket.emit('leave_project', projectId)
    }
  },

  emitTaskEditing({ state }, { taskId, projectId, isEditing }) {
    if (state.socket) {
      state.socket.emit('task_editing', { taskId, projectId, isEditing })
    }
  },

  emitCommentTyping({ state }, { taskId, projectId, isTyping }) {
    if (state.socket) {
      state.socket.emit('comment_typing', { taskId, projectId, isTyping })
    }
  },

  updateStatus({ state }, status) {
    if (state.socket) {
      state.socket.emit('update_status', status)
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
