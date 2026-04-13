import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register, login } from '../api/auth'

export default function Register({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(email, password)
      await login(email, password)
      onLogin()
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Błąd rejestracji')
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>
            Uptime Monitor
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--label)' }}>Utwórz nowe konto</p>
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
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--label)', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Hasło (min. 8 znaków)</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={8}
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
              Zarejestruj się
            </button>
          </form>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--label)', textAlign: 'center', marginTop: '16px' }}>
          Masz już konto?{' '}
          <Link to="/login" style={{ color: 'var(--accent2)', textDecoration: 'none' }}>Zaloguj się</Link>
        </p>
      </div>
    </div>
  )
}