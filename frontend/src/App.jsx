import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { getToken, logout } from './api/auth'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MonitorDetail from './pages/MonitorDetail'

export default function App() {
  // Stan auth oparty na obecności tokenu JWT w localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken())

  const handleLogin = () => setIsAuthenticated(true)
  const handleLogout = () => { logout(); setIsAuthenticated(false) }

  return (
    <BrowserRouter>
      <Routes>
        {/* Publiczne — przekieruj na dashboard jeśli już zalogowany */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Register onLogin={handleLogin} />
        } />

        {/* Chronione — przekieruj na login jeśli niezalogowany */}
        <Route path="/dashboard" element={
          isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />
        } />
        <Route path="/monitors/:id" element={
          isAuthenticated ? <MonitorDetail /> : <Navigate to="/login" />
        } />

        {/* Fallback — przekieruj na odpowiednią stronę */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  )
}