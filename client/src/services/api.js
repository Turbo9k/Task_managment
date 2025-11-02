import axios from 'axios'
import { useToast } from 'vue-toastification'
import store from '../store'

const toast = useToast()

// Determine API URL based on environment
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use the Vercel deployment URL with /api prefix
    return process.env.VUE_APP_API_URL || 'https://task-managment-488ma0643-iansia.vercel.app/api'
  }
  return process.env.VUE_APP_API_URL || 'http://localhost:3000/api'
}

// Create axios instance
const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = store.getters['auth/token']
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response } = error
    
    if (response) {
      const { status, data } = response
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          store.dispatch('auth/logout')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
          
        case 403:
          // Forbidden
          toast.error(data.error || 'Access denied')
          break
          
        case 404:
          // Not found
          toast.error(data.error || 'Resource not found')
          break
          
        case 422:
          // Validation error
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => {
              toast.error(err.msg || err.message || 'Validation error')
            })
          } else {
            toast.error(data.error || 'Validation error')
          }
          break
          
        case 429:
          // Rate limited
          toast.error('Too many requests. Please try again later.')
          break
          
        case 500:
          // Server error
          toast.error('Server error. Please try again later.')
          break
          
        default:
          if (data && data.error) {
            toast.error(data.error)
          } else {
            toast.error('An unexpected error occurred')
          }
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.')
    } else {
      // Other error
      toast.error('An unexpected error occurred')
    }
    
    return Promise.reject(error)
  }
)

export default api
