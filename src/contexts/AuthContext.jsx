import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    const saved = window.localStorage.getItem('fitpulse-theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window === 'undefined') return 'md'
    const saved = window.localStorage.getItem('fitpulse-font-size')
    return saved || 'md'
  })

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
    window.localStorage.setItem('fitpulse-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    const sizes = { sm: 14, md: 16, lg: 18, xl: 20 }
    document.documentElement.style.fontSize = sizes[fontSize] + 'px'
    window.localStorage.setItem('fitpulse-font-size', fontSize)
  }, [fontSize])

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token')
    if (token) {
      // Token exists, assume user is logged in
      // In a real app, you'd validate the token with the server
      setUser({ token })
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await auth.login({ email, password })
      localStorage.setItem('token', response.token)
      setUser(response.user)
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await auth.register(userData)
      localStorage.setItem('token', response.token)
      setUser(response.user)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    darkMode,
    setDarkMode,
    fontSize,
    setFontSize
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}