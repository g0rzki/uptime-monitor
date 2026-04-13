import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const register = (email, password) =>
  api.post('/auth/register', { email, password })

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password })
  localStorage.setItem('token', res.data.access_token)
  return res.data
}

export const logout = () => localStorage.removeItem('token')

export const getToken = () => localStorage.getItem('token')