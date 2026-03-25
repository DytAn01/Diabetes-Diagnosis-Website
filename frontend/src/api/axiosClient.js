import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const requestUrl = (error.config?.url || '').toLowerCase()
    const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register')

    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('auth_user')
    }
    return Promise.reject(error)
  }
)

export default axiosClient
