import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api.setToken(token)
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const userData = await api.get('/me')
      setUser(userData)
    } catch (err) {
      console.error('Erreur récupération utilisateur:', err)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password })
    const { token: newToken, user: userData } = response

    localStorage.setItem('token', newToken)
    api.setToken(newToken)
    setToken(newToken)
    setUser(userData)

    return userData
  }

  const register = async (name, email, password) => {
    const response = await api.post('/register', { name, email, password })
    return response.user
  }

  const logout = () => {
    localStorage.removeItem('token')
    api.setToken(null)
    setToken(null)
    setUser(null)
  }

  const updatePassword = async (password, newPassword) => {
    await api.put('/api/password', { password, newPassword })
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}
