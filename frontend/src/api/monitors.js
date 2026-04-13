import axios from 'axios'
import { getToken } from './auth'

// Fabryka instancji axios z aktualnym tokenem JWT w nagłówku
// Wywołana jako funkcja żeby zawsze odczytać świeży token z localStorage
const api = () => axios.create({
  baseURL: '/api',
  headers: { Authorization: `Bearer ${getToken()}` }
})

export const getMonitors = () => api().get('/monitors')
export const createMonitor = (url, interval_minutes) => api().post('/monitors', { url, interval_minutes })
export const deleteMonitor = (id) => api().delete(`/monitors/${id}`)
export const updateMonitor = (id, data) => api().patch(`/monitors/${id}`, data)
export const getChecks = (id, limit = 50) => api().get(`/monitors/${id}/checks?limit=${limit}`)