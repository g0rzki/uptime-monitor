import { useState, useEffect } from 'react'
import { getToken, logout } from '../api/auth'

export function useAuth() {
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