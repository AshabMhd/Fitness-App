import { createContext, useContext, useState, useEffect } from 'react'
import { auth, user as userApi } from '../utils/api'

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
  const [privacyMode, setPrivacyMode] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('fitpulse-privacy-mode') === '1'
  })

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
    window.localStorage.setItem('fitpulse-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    const basePx = 16
    const sizes = { sm: 14, md: 16, lg: 18, xl: 20 }
    const px = sizes[fontSize] ?? basePx
    const scale = px / basePx

    document.documentElement.style.fontSize = `${basePx}px`
    document.documentElement.style.setProperty('--fitpulse-text-scale', String(scale))
    document.documentElement.dataset.textSize = fontSize

    if (typeof document.documentElement.style.zoom !== 'undefined') {
      document.documentElement.style.zoom = scale === 1 ? '1' : String(scale)
    } else {
      document.documentElement.style.fontSize = `${px}px`
    }

    window.localStorage.setItem('fitpulse-font-size', fontSize)
  }, [fontSize])

  useEffect(() => {
    window.localStorage.setItem('fitpulse-privacy-mode', privacyMode ? '1' : '0')
    document.documentElement.dataset.privacyMode = privacyMode ? 'on' : 'off'
  }, [privacyMode])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const profile = await userApi.getProfile()
        if (!cancelled) setUser({ token, ...profile })
      } catch {
        localStorage.removeItem('token')
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
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

  const refreshUser = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const profile = await userApi.getProfile()
      setUser({ token, ...profile })
    } catch (e) {
      console.error(e)
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    refreshUser,
    loading,
    darkMode,
    setDarkMode,
    fontSize,
    setFontSize,
    privacyMode,
    setPrivacyMode
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}