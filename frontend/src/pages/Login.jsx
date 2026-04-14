import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      onLogin() // Ustawia isAuthenticated w App.jsx
      navigate('/dashboard')
    } catch {
      setError('Nieprawidłowy email lub hasło')
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>
            Uptime Monitor
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--label)' }}>Zaloguj się do swojego konta</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--label)', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 12px', fontSize: '13px', color: 'var(--text)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#5ab4ff'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--label)', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Hasło</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 12px', fontSize: '13px', color: 'var(--text)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#5ab4ff'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            {error && <p style={{ fontSize: '12px', color: '#ff5f57' }}>{error}</p>}
            <button
              type="submit"
              style={{ background: '#5affa3', color: '#0d0f14', border: 'none', borderRadius: '4px', padding: '9px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Zaloguj się
            </button>
          </form>
          <div
            onClick={() => { setEmail('demo@demo.com'); setPassword('demo1234') }}
            style={{ marginTop: '16px', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#5affa3'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <p style={{ fontSize: '10px', color: 'var(--label)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Konto demo</p>
            <p style={{ fontSize: '12px', color: 'var(--dim)', fontFamily: 'monospace' }}>demo@demo.com / demo1234</p>
            <p style={{ fontSize: '10px', color: 'var(--label)', marginTop: '4px' }}>Kliknij żeby wypełnić</p>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--label)', textAlign: 'center', marginTop: '16px' }}>
          <Link to="/status" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            Zobacz status serwisów ↗
          </Link>
        </p>

        <p style={{ fontSize: '12px', color: 'var(--label)', textAlign: 'center', marginTop: '16px' }}>
          Nie masz konta?{' '}
          <Link to="/register" style={{ color: 'var(--accent2)', textDecoration: 'none' }}>Zarejestruj się</Link>
        </p>
      </div>
    </div>
  )
}