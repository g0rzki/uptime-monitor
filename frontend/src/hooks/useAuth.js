import { useState, useEffect } from 'react'
import { getToken, logout } from '../api/auth'

export function useAuth() {
  // Stan auth synchronizowany z localStorage przy montowaniu komponentu
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken())

  useEffect(() => {
    setIsAuthenticated(!!getToken())
  }, [])

  const signOut = () => {
    logout()
    setIsAuthenticated(false)
  }

  return { isAuthenticated, setIsAuthenticated, signOut }
}