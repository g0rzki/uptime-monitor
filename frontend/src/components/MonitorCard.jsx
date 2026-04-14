import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { deleteMonitor } from '../api/monitors'

// Karta monitora na dashboardzie — klik otwiera szczegóły, × usuwa
export default function MonitorCard({ monitor, onDeleted }) {
  const navigate = useNavigate()

  const handleDelete = async (e) => {
    e.stopPropagation() // Nie propaguj kliknięcia do navigate
    if (!confirm(`Usunąć monitor ${monitor.url}?`)) return
    await deleteMonitor(monitor.id)
    onDeleted() // Odśwież listę w Dashboard
  }

  return (
    <div
      onClick={() => navigate(`/monitors/${monitor.id}`)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '14px 16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#5ab4ff50'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <StatusBadge isUp={monitor.is_active} />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '13px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {monitor.url}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--label)', marginTop: '2px' }}>
            co {monitor.interval_minutes} min
          </p>
        </div>
      </div>
      <button
        onClick={handleDelete}
        title="Usuń monitor"
        style={{ color: 'var(--dim)', fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '12px', padding: '4px 6px', borderRadius: '4px', transition: 'color 0.2s, background 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#ff5f57'; e.currentTarget.style.background = '#ff5f5715' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--dim)'; e.currentTarget.style.background = 'none' }}
      >
        ×
      </button>
    </div>
  )
}