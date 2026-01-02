import axios from 'axios'
import { useToast } from 'vue-toastification'
import store from '../store'

const toast = useToast()

// This function is no longer used - API URL is set directly below
// Keeping for reference but apiBaseURL is set inline

// Get API URL - force runtime detection
let apiBaseURL = '/api'; // Default to relative path

if (typeof window !== 'undefined') {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || 
                     hostname === '127.0.0.1' ||
                     hostname.startsWith('192.168.') ||
                     hostname.startsWith('10.') ||
                     hostname.startsWith('172.');
  
  // Only use localhost if we're actually on localhost
  if (isLocalhost) {
    apiBaseURL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';
    console.log('API URL (localhost detected):', apiBaseURL);
  } else {
    // Production - always use relative path
    apiBaseURL = '/api';
    console.log('API URL (production - relative):', apiBaseURL, 'from', window.location.origin);
  }
} else {
  // SSR fallback
  apiBaseURL = process.env.VUE_APP_API_URL || '/api';
}

// Create axios instance
const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Log the actual baseURL being used
console.log('Axios baseURL set to:', api.defaults.baseURL);

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
          // Forbidden - usually means invalid token, log out and redirect
          if (data.error && data.error.includes('token')) {
            // Invalid/expired token - log out and redirect to login
            store.dispatch('auth/logout')
            toast.error('Your session has expired. Please log in again.')
            if (window.location.pathname !== '/login') {
              window.location.href = '/login'
            }
          } else {
            // Other 403 errors (permission denied)
            toast.error(data.error || 'Access denied')
          }
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
      // Network error - provide more details
      console.error('Network error details:', {
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        }
      });
      toast.error(`Network error: ${error.message || 'Unable to connect to server. Please check your connection.'}`);
    } else {
      // Other error
      console.error('Request setup error:', error);
      toast.error(`Request error: ${error.message || 'An unexpected error occurred'}`);
    }
    
    return Promise.reject(error)
  }
)

export default api
