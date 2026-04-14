import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getToken } from '../api/auth'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Backend zwraca datetime bez 'Z' — dodajemy żeby przeglądarka wiedziała że to UTC
const utc = (dateStr) => new Date(dateStr + 'Z').toLocaleString('pl-PL')

const formatUptime = (pct) => {
  if (pct === null || pct === undefined) return '—'
  return `${pct.toFixed(1)}%`
}

export default function StatusPage() {
  const navigate = useNavigate()
  const [monitors, setMonitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${BASE}/monitors/public/status`)
      setMonitors(res.data)
      setLastUpdated(new Date())
    } catch {
      // Cicha obsługa — brak danych nie psuje strony
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    // Odświeżaj co 60s — status page jest żywa
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  const allUp = monitors.length > 0 && monitors.every(m => m.is_up)
  const anyDown = monitors.some(m => m.is_up === false)

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5affa3', boxShadow: '0 0 8px #5affa3', display: 'inline-block' }} />
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Uptime Monitor</span>
        </div>
        <button
          onClick={() => navigate(getToken() ? '/dashboard' : '/login')}
          style={{ fontSize: '12px', color: 'var(--label)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--label)'}
        >
          {getToken() ? 'Dashboard →' : 'Zaloguj się →'}
        </button>
      </header>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Ogólny status */}
        <div style={{
          background: 'var(--surface)',
          border: `1px solid ${anyDown ? '#ff5f5750' : '#5affa330'}`,
          borderRadius: '8px',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{
            width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
            background: anyDown ? '#ff5f57' : '#5affa3',
            boxShadow: anyDown ? '0 0 8px #ff5f57' : '0 0 8px #5affa3'
          }} />
          <div>
            <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>
              {loading ? 'Sprawdzanie...' : anyDown ? 'Wykryto problemy' : 'Wszystkie systemy działają'}
            </p>
            {lastUpdated && (
              <p style={{ fontSize: '11px', color: 'var(--label)', marginTop: '2px' }}>
                Ostatnia aktualizacja: {lastUpdated.toLocaleTimeString('pl-PL')}
              </p>
            )}
          </div>
        </div>

        {/* Lista monitorów */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
          <p style={{ fontSize: '11px', color: 'var(--label)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Serwisy ({monitors.length})
          </p>

          {loading ? (
            <p style={{ fontSize: '13px', color: 'var(--label)' }}>Ładowanie...</p>
          ) : monitors.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--label)' }}>Brak danych.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {monitors.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '12px 1fr auto auto',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 0',
                    borderBottom: i < monitors.length - 1 ? '1px solid var(--border)' : 'none'
                  }}
                >
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                    background: m.is_up === null ? 'var(--border)' : m.is_up ? '#5affa3' : '#ff5f57'
                  }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '13px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.url.replace(/^https?:\/\//, '')}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--label)', marginTop: '2px' }}>
                      {m.last_checked ? utc(m.last_checked) : '—'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '11px', color: 'var(--label)' }}>24h</p>
                    <p style={{ fontSize: '12px', color: m.uptime_24h === 100 ? '#5affa3' : m.uptime_24h < 90 ? '#ff5f57' : 'var(--dim)' }}>
                      {formatUptime(m.uptime_24h)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '52px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--label)' }}>ping</p>
                    <p style={{ fontSize: '12px', color: 'var(--dim)' }}>
                      {m.response_time_ms ? `${m.response_time_ms}ms` : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p style={{ fontSize: '11px', color: 'var(--label)', textAlign: 'center' }}>
          Powered by{' '}
          <a href="https://github.com/g0rzki/uptime-monitor" target="_blank" rel="noreferrer" style={{ color: 'var(--accent2)', textDecoration: 'none' }}>
            Uptime Monitor
          </a>
          {' '}— odświeżanie co 60s
        </p>

      </main>
    </div>
  )
}