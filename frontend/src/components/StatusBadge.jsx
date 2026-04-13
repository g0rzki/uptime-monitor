// Pill z kolorowym wskaźnikiem statusu — zielony UP, czerwony DOWN
export default function StatusBadge({ isUp }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '3px 10px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      letterSpacing: '0.05em',
      background: isUp ? '#5affa315' : '#ff5f5715',
      color: isUp ? '#5affa3' : '#ff5f57',
      border: `1px solid ${isUp ? '#5affa330' : '#ff5f5730'}`,
    }}>
      <span style={{
        width: '6px', height: '6px',
        borderRadius: '50%',
        background: isUp ? '#5affa3' : '#ff5f57',
        boxShadow: isUp ? '0 0 6px #5affa3' : '0 0 6px #ff5f57',
      }} />
      {isUp ? 'UP' : 'DOWN'}
    </span>
  )
}