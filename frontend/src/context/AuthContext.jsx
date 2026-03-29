import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('cinex_token')
    const savedUser  = localStorage.getItem('cinex_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (tokenValue, userData) => {
    localStorage.setItem('cinex_token', tokenValue)
    localStorage.setItem('cinex_user', JSON.stringify(userData))
    setToken(tokenValue)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('cinex_token')
    localStorage.removeItem('cinex_user')
    setToken(null)
    setUser(null)
  }

  const updateUser = (data) => {
    const merged = { ...user, ...data }
    localStorage.setItem('cinex_user', JSON.stringify(merged))
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
