import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMonitors, createMonitor } from '../api/monitors'
import MonitorCard from '../components/MonitorCard'

export default function Dashboard({ onLogout }) {
  const [monitors, setMonitors] = useState([])
  const [url, setUrl] = useState('')
  const [interval, setInterval] = useState(5)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchMonitors = async () => {
    try {
      const res = await getMonitors()
      setMonitors(res.data)
    } catch {
      onLogout()
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMonitors() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createMonitor(url, interval)
      setUrl('')
      fetchMonitors()
    } catch (err) {
      setError(err.response?.data?.detail || 'Błąd dodawania monitora')
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5affa3', boxShadow: '0 0 8px #5affa3', display: 'inline-block' }} />
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Uptime Monitor</span>
        </div>
        <button
          onClick={() => { onLogout(); navigate('/login') }}
          style={{ fontSize: '12px', color: 'var(--label)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--label)'}
        >
          Wyloguj
        </button>
      </header>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <p style={{ fontSize: '11px', color: 'var(--label)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Dodaj monitor
          </p>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
              style={{ flex: '1', minWidth: '200px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 12px', fontSize: '13px', color: 'var(--text)', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#5ab4ff'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <select
              value={interval}
              onChange={e => setInterval(Number(e.target.value))}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 12px', fontSize: '13px', color: 'var(--label)', outline: 'none', cursor: 'pointer' }}
            >
              <option value={1}>co 1 min</option>
              <option value={5}>co 5 min</option>
              <option value={10}>co 10 min</option>
              <option value={30}>co 30 min</option>
            </select>
            <button
              type="submit"
              style={{ background: '#5affa3', color: '#0d0f14', border: 'none', borderRadius: '4px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Dodaj
            </button>
          </form>
          {error && <p style={{ fontSize: '12px', color: '#ff5f57', marginTop: '8px' }}>{error}</p>}
        </div>

        <div>
          <p style={{ fontSize: '11px', color: 'var(--label)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Monitory ({monitors.length})
          </p>
          {loading ? (
            <p style={{ fontSize: '13px', color: 'var(--label)' }}>Ładowanie...</p>
          ) : monitors.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--label)' }}>Brak monitorów — dodaj pierwszy powyżej.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {monitors.map(m => (
                <MonitorCard key={m.id} monitor={m} onDeleted={fetchMonitors} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}