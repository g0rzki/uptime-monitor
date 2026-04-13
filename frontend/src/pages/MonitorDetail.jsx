import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMonitors, getChecks, updateMonitor } from '../api/monitors'
import StatusBadge from '../components/StatusBadge'
import ResponseChart from '../components/ResponseChart'

export default function MonitorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [monitor, setMonitor] = useState(null)
  const [checks, setChecks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [monitorsRes, checksRes] = await Promise.all([
          getMonitors(),
          getChecks(id)
        ])
        const found = monitorsRes.data.find(m => m.id === Number(id))
        if (!found) { navigate('/dashboard'); return }
        setMonitor(found)
        setChecks(checksRes.data)
      } catch {
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const toggleActive = async () => {
    await updateMonitor(id, { is_active: !monitor.is_active })
    setMonitor(m => ({ ...m, is_active: !m.is_active }))
  }

  const lastCheck = checks[0]
  const avgResponse = checks.filter(c => c.response_time_ms).length
    ? Math.round(checks.filter(c => c.response_time_ms).reduce((s, c) => s + c.response_time_ms, 0) / checks.filter(c => c.response_time_ms).length)
    : null

  if (loading) return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '13px', color: 'var(--label)' }}>Ładowanie...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ color: 'var(--label)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', transition: 'color 0.2s', padding: '0' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--label)'}
        >
          ←
        </button>
        <span style={{ fontSize: '13px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {monitor.url}
        </span>
      </header>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <StatusBadge isUp={lastCheck?.is_up ?? true} />
            <p style={{ fontSize: '11px', color: 'var(--label)' }}>
              Ostatni check: {lastCheck ? new Date(lastCheck.checked_at).toLocaleString() : '—'}
            </p>
            {avgResponse && (
              <p style={{ fontSize: '11px', color: 'var(--label)' }}>Średni czas: {avgResponse}ms</p>
            )}
          </div>
          <button
            onClick={toggleActive}
            style={{
              fontSize: '12px',
              padding: '7px 14px',
              borderRadius: '4px',
              border: `1px solid ${monitor.is_active ? 'var(--border)' : '#5affa330'}`,
              color: monitor.is_active ? 'var(--label)' : '#5affa3',
              background: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {monitor.is_active ? 'Wstrzymaj' : 'Wznów'}
          </button>
        </div>

        {checks.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
            <p style={{ fontSize: '11px', color: 'var(--label)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Response time
            </p>
            <ResponseChart checks={checks} />
          </div>
        )}

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
          <p style={{ fontSize: '11px', color: 'var(--label)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Historia ({checks.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {checks.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: '600', color: c.is_up ? '#5affa3' : '#ff5f57' }}>
                  {c.is_up ? 'UP' : 'DOWN'}
                </span>
                <span style={{ color: 'var(--dim)' }}>
                  {c.response_time_ms ? `${c.response_time_ms}ms` : '—'}
                </span>
                <span style={{ color: 'var(--label)', fontSize: '11px' }}>
                  {new Date(c.checked_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}