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
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
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
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  // Redirect authenticated users away from auth pages
  if (to.meta.hideForAuth && isAuthenticated) {
    next('/dashboard')
    return
  }

  next()
})

export default router
