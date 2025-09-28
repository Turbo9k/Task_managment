import { createStore } from 'vuex'
import auth from './modules/auth'
import projects from './modules/projects'
import tasks from './modules/tasks'
import users from './modules/users'
import socket from './modules/socket'
import modals from './modules/modals'
import ui from './modules/ui'

export default createStore({
  modules: {
    auth,
    projects,
    tasks,
    users,
    socket,
    modals,
    ui
  },
  strict: process.env.NODE_ENV !== 'production'
})
