import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On app start, restore token and user from localStorage
    const savedToken = localStorage.getItem('movieapp_token')
    const savedUser  = localStorage.getItem('movieapp_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (tokenValue, userData) => {
    localStorage.setItem('movieapp_token', tokenValue)
    localStorage.setItem('movieapp_user', JSON.stringify(userData))
    setToken(tokenValue)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('movieapp_token')
    localStorage.removeItem('movieapp_user')
    setToken(null)
    setUser(null)
  }

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData }
    localStorage.setItem('movieapp_user', JSON.stringify(merged))
    setUser(merged)
  }

  const isAdmin = () => user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
