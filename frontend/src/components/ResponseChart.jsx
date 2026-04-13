import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

// Wykres liniowy response time — dane posortowane od najstarszych (reverse checks)
export default function ResponseChart({ checks }) {
  const data = [...checks].reverse().map(c => ({
    time: new Date(c.checked_at).toLocaleTimeString(),
    ms: c.response_time_ms,
    up: c.is_up
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2330" />
        <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#8a93aa' }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11, fill: '#8a93aa' }} unit="ms" />
        <Tooltip
          contentStyle={{ background: '#13161d', border: '1px solid #1e2330', borderRadius: '4px', fontSize: '12px' }}
          formatter={(v) => [`${v}ms`, 'Response time']}
        />
        <Line
          type="monotone"
          dataKey="ms"
          stroke="#5ab4ff"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#5ab4ff' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}