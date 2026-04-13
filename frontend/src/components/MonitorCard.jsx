import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { deleteMonitor } from '../api/monitors'

export default function MonitorCard({ monitor, onDeleted }) {
  const navigate = useNavigate()

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm(`Usunąć monitor ${monitor.url}?`)) return
    await deleteMonitor(monitor.id)
    onDeleted()
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
        style={{ color: 'var(--border)', fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '12px', transition: 'color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#ff5f57'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--border)'}
      >
        ×
      </button>
    </div>
  )
}