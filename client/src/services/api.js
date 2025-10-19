import axios from 'axios'
import { useToast } from 'vue-toastification'
import store from '../store'
import { mockApi } from './mockApi'

const toast = useToast()

// Determine API URL based on environment
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use the current Vercel deployment URL
    return 'https://task-managment-1kk6px26h-iansia.vercel.app'
  }
  return process.env.VUE_APP_API_URL || 'http://localhost:3000'
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
  async (error) => {
    const { response, config } = error
    
    // If it's a network error, try to use mock API
    if (!response && error.request) {
      console.log('Network error detected, falling back to mock API');
      
      // Try to use mock API for common endpoints
      try {
        const url = config.url;
        const method = config.method;
        
        if (url.includes('/auth/login') && method === 'post') {
          const mockResponse = await mockApi.login(config.data);
          return { data: mockResponse };
        }
        
        if (url.includes('/tasks') && method === 'get') {
          const mockResponse = await mockApi.getTasks();
          return { data: mockResponse };
        }
        
        if (url.includes('/projects') && method === 'get') {
          const mockResponse = await mockApi.getProjects();
          return { data: mockResponse };
        }
        
        if (url.includes('/users') && method === 'get') {
          const mockResponse = await mockApi.getUsers();
          return { data: mockResponse };
        }
        
        if (url.includes('/tasks') && method === 'post') {
          const mockResponse = await mockApi.createTask(config.data);
          return { data: mockResponse };
        }
        
        if (url.includes('/tasks/') && method === 'put') {
          const taskId = url.split('/').pop();
          const mockResponse = await mockApi.updateTask(parseInt(taskId), config.data);
          return { data: mockResponse };
        }
        
        if (url.includes('/tasks/') && method === 'delete') {
          const taskId = url.split('/').pop();
          const mockResponse = await mockApi.deleteTask(parseInt(taskId));
          return { data: mockResponse };
        }
        
        if (url.includes('/projects') && method === 'post') {
          const mockResponse = await mockApi.createProject(config.data);
          return { data: mockResponse };
        }
        
      } catch (mockError) {
        console.error('Mock API also failed:', mockError);
      }
      
      // Show a more helpful message
      toast.error('Network error. Using demo mode with sample data.');
    }
    
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
    } else {
      // Other error
      toast.error('An unexpected error occurred')
    }
    
    return Promise.reject(error)
  }
)

export default api
