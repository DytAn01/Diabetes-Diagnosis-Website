import { createContext, useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('auth_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(localStorage.getItem('access_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const response = await axiosClient.get('/auth/profile')
        setUser(response.data)
        localStorage.setItem('auth_user', JSON.stringify(response.data))
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [token])

  const login = (userData, accessToken) => {
    setUser(userData)
    setToken(accessToken)
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('auth_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('auth_user')
  }

  const updateUser = (nextUser) => {
    setUser(nextUser)
    if (nextUser) {
      localStorage.setItem('auth_user', JSON.stringify(nextUser))
    } else {
      localStorage.removeItem('auth_user')
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
