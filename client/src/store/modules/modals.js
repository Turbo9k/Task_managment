const state = {
  showTaskModal: false,
  showProjectModal: false,
  showUserModal: false,
  showDeleteModal: false,
  modalData: null
}

const getters = {
  showTaskModal: state => state.showTaskModal,
  showProjectModal: state => state.showProjectModal,
  showUserModal: state => state.showUserModal,
  showDeleteModal: state => state.showDeleteModal,
  modalData: state => state.modalData
}

const mutations = {
  SHOW_TASK_MODAL(state, data = null) {
    state.showTaskModal = true
    state.modalData = data
  },
  HIDE_TASK_MODAL(state) {
    state.showTaskModal = false
    state.modalData = null
  },
  SHOW_PROJECT_MODAL(state, data = null) {
    state.showProjectModal = true
    state.modalData = data
  },
  HIDE_PROJECT_MODAL(state) {
    state.showProjectModal = false
    state.modalData = null
  },
  SHOW_USER_MODAL(state, data = null) {
    state.showUserModal = true
    state.modalData = data
  },
  HIDE_USER_MODAL(state) {
    state.showUserModal = false
    state.modalData = null
  },
  SHOW_DELETE_MODAL(state, data = null) {
    state.showDeleteModal = true
    state.modalData = data
  },
  HIDE_DELETE_MODAL(state) {
    state.showDeleteModal = false
    state.modalData = null
  }
}

const actions = {
  showTaskModal({ commit }, data = null) {
    commit('SHOW_TASK_MODAL', data)
  },
  hideTaskModal({ commit }) {
    commit('HIDE_TASK_MODAL')
  },
  showProjectModal({ commit }, data = null) {
    commit('SHOW_PROJECT_MODAL', data)
  },
  hideProjectModal({ commit }) {
    commit('HIDE_PROJECT_MODAL')
  },
  showUserModal({ commit }, data = null) {
    commit('SHOW_USER_MODAL', data)
  },
  hideUserModal({ commit }) {
    commit('HIDE_USER_MODAL')
  },
  showDeleteModal({ commit }, data = null) {
    commit('SHOW_DELETE_MODAL', data)
  },
  hideDeleteModal({ commit }) {
    commit('HIDE_DELETE_MODAL')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
