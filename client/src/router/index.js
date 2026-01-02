import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Auth/Login.vue'),
    meta: { requiresAuth: false, hideForAuth: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Auth/Register.vue'),
    meta: { requiresAuth: false, hideForAuth: true }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('../views/Auth/Callback.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('../views/Projects.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetail',
    component: () => import('../views/ProjectDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('../views/Tasks.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../views/Calendar.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('../views/Analytics.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated']
  const isLoading = store.state.auth.isLoading
  const hasToken = store.getters['auth/token']
  const hasUser = store.getters['auth/user']

  // If we just logged in (coming from login page with user set), trust the login
  if (from.path === '/login' && hasUser && hasToken) {
    console.log('Just logged in, skipping auth check')
    next()
    return
  }

  // If we have a token and user but aren't marked as authenticated, trust it
  if (hasToken && hasUser && !isAuthenticated) {
    console.log('Has token and user, marking as authenticated')
    store.commit('auth/SET_USER', hasUser)
    next()
    return
  }

  // If we have a token but no user, check auth (but only if not coming from login)
  if (hasToken && !hasUser && !isAuthenticated && to.meta.requiresAuth && from.path !== '/login') {
    console.log('Has token but no user, checking auth...')
    await store.dispatch('auth/checkAuth')
  }

  // Wait for auth check to complete
  if (isLoading) {
    await new Promise(resolve => {
      const unwatch = store.watch(
        state => state.auth.isLoading,
        (newValue) => {
          if (!newValue) {
            unwatch()
            resolve()
          }
        }
      )
    })
  }

  // Check if route requires authentication
  const finalAuthState = store.getters['auth/isAuthenticated'] || (hasToken && hasUser)
  if (to.meta.requiresAuth && !finalAuthState) {
    console.log('Route requires auth but user not authenticated, redirecting to login')
    next('/login')
    return
  }

  // Redirect authenticated users away from auth pages
  if (to.meta.hideForAuth && finalAuthState) {
    next('/dashboard')
    return
  }

  next()
})

export default router
