import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function ResponseChart({ checks }) {
  const data = [...checks].reverse().map(c => ({
    time: new Date(c.checked_at).toLocaleTimeString(),
    ms: c.response_time_ms,
    up: c.is_up
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="time" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11 }} unit="ms" />
        <Tooltip formatter={(v) => [`${v}ms`, 'Response time']} />
        <Line
          type="monotone"
          dataKey="ms"
          stroke="#2E75B6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}