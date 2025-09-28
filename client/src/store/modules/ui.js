const state = {
  darkMode: localStorage.getItem('darkMode') === 'true',
  sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
  currentView: 'dashboard',
  notifications: [],
  unreadNotifications: 0
}

const getters = {
  darkMode: state => state.darkMode,
  sidebarCollapsed: state => state.sidebarCollapsed,
  currentView: state => state.currentView,
  notifications: state => state.notifications,
  unreadNotifications: state => state.unreadNotifications
}

const mutations = {
  TOGGLE_DARK_MODE(state) {
    state.darkMode = !state.darkMode
    localStorage.setItem('darkMode', state.darkMode)
    
    // Update document class
    if (state.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },
  SET_DARK_MODE(state, darkMode) {
    state.darkMode = darkMode
    localStorage.setItem('darkMode', darkMode)
    
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },
  TOGGLE_SIDEBAR(state) {
    state.sidebarCollapsed = !state.sidebarCollapsed
    localStorage.setItem('sidebarCollapsed', state.sidebarCollapsed)
  },
  SET_SIDEBAR_COLLAPSED(state, collapsed) {
    state.sidebarCollapsed = collapsed
    localStorage.setItem('sidebarCollapsed', collapsed)
  },
  SET_CURRENT_VIEW(state, view) {
    state.currentView = view
  },
  SET_NOTIFICATIONS(state, notifications) {
    state.notifications = notifications
    state.unreadNotifications = notifications.filter(n => !n.is_read).length
  },
  ADD_NOTIFICATION(state, notification) {
    state.notifications.unshift(notification)
    if (!notification.is_read) {
      state.unreadNotifications++
    }
  },
  MARK_NOTIFICATION_READ(state, notificationId) {
    const notification = state.notifications.find(n => n.id === notificationId)
    if (notification && !notification.is_read) {
      notification.is_read = true
      state.unreadNotifications--
    }
  },
  MARK_ALL_NOTIFICATIONS_READ(state) {
    state.notifications.forEach(n => n.is_read = true)
    state.unreadNotifications = 0
  }
}

const actions = {
  toggleDarkMode({ commit }) {
    commit('TOGGLE_DARK_MODE')
  },
  setDarkMode({ commit }, darkMode) {
    commit('SET_DARK_MODE', darkMode)
  },
  toggleSidebar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  setSidebarCollapsed({ commit }, collapsed) {
    commit('SET_SIDEBAR_COLLAPSED', collapsed)
  },
  setCurrentView({ commit }, view) {
    commit('SET_CURRENT_VIEW', view)
  },
  setNotifications({ commit }, notifications) {
    commit('SET_NOTIFICATIONS', notifications)
  },
  addNotification({ commit }, notification) {
    commit('ADD_NOTIFICATION', notification)
  },
  markNotificationRead({ commit }, notificationId) {
    commit('MARK_NOTIFICATION_READ', notificationId)
  },
  markAllNotificationsRead({ commit }) {
    commit('MARK_ALL_NOTIFICATIONS_READ')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
