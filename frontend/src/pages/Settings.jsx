import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getToken, logout } from '../api/auth'

const api = () => axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { Authorization: `Bearer ${getToken()}` }
})

export default function Settings({ onLogout }) {
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)
    try {
      await api().patch('/users/me/password', {
        current_password: currentPassword,
        new_password: newPassword
      })
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setPasswordError(err.response?.data?.detail || 'Błąd zmiany hasła')
    }
  }

  const handleDeleteAccount = async (e) => {
    e.preventDefault()
    setDeleteError('')
    try {
      await api().delete('/users/me', { data: { password: deletePassword } })
      logout()
      onLogout()
      navigate('/login')
    } catch (err) {
      setDeleteError(err.response?.data?.detail || 'Błąd usunięcia konta')
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '8px 12px',
    fontSize: '13px',
    color: 'var(--text)',
    outline: 'none',
    boxSizing: 'border-box'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    color: 'var(--label)',
    marginBottom: '6px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase'
  }

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
        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Ustawienia konta</span>
      </header>

      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Zmiana hasła */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
          <p style={{ fontSize: '11px', color: 'var(--label)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Zmiana hasła
          </p>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Aktualne hasło</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#5ab4ff'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div>
              <label style={labelStyle}>Nowe hasło</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={8}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#5ab4ff'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            {passwordError && (
              <p style={{ fontSize: '12px', color: '#ff5f57' }}>
                {passwordError === 'This action is disabled for the demo account'
                  ? 'Zmiana hasła jest niedostępna dla konta demo.'
                  : passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p style={{ fontSize: '12px', color: '#5affa3' }}>Hasło zostało zmienione.</p>
            )}
            <button
              type="submit"
              style={{ background: '#5affa3', color: '#0d0f14', border: 'none', borderRadius: '4px', padding: '9px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s', alignSelf: 'flex-start', paddingLeft: '20px', paddingRight: '20px' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Zmień hasło
            </button>
          </form>
        </div>

        {/* Strefa niebezpieczna */}
        <div style={{ background: 'var(--surface)', border: '1px solid #ff5f5730', borderRadius: '8px', padding: '20px' }}>
          <p style={{ fontSize: '11px', color: '#ff5f57', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Strefa niebezpieczna
          </p>
          {!deleteConfirm ? (
            <div>
              <p style={{ fontSize: '13px', color: 'var(--dim)', marginBottom: '12px' }}>
                Usunięcie konta jest nieodwracalne. Wszystkie monitory i historia pingów zostaną usunięte.
              </p>
              <button
                onClick={() => setDeleteConfirm(true)}
                style={{ fontSize: '12px', color: '#ff5f57', background: 'none', border: '1px solid #ff5f5750', borderRadius: '4px', padding: '7px 14px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ff5f5715'; e.currentTarget.style.borderColor = '#ff5f57' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#ff5f5750' }}
              >
                Usuń konto
              </button>
            </div>
          ) : (
            <form onSubmit={handleDeleteAccount} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', color: 'var(--dim)' }}>
                Potwierdź hasłem żeby usunąć konto.
              </p>
              <div>
                <label style={labelStyle}>Hasło</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#ff5f57'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              {deleteError && (
                <p style={{ fontSize: '12px', color: '#ff5f57' }}>
                  {deleteError === 'This action is disabled for the demo account'
                    ? 'Usunięcie konta jest niedostępne dla konta demo.'
                    : deleteError}
                </p>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setDeleteConfirm(false); setDeleteError('') }}
                  style={{ fontSize: '12px', color: 'var(--label)', background: 'none', border: '1px solid var(--border)', borderRadius: '4px', padding: '7px 14px', cursor: 'pointer' }}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  style={{ fontSize: '12px', color: '#ff5f57', background: 'none', border: '1px solid #ff5f5750', borderRadius: '4px', padding: '7px 14px', cursor: 'pointer' }}
                >
                  Potwierdź usunięcie
                </button>
              </div>
            </form>
          )}
        </div>

      </main>
    </div>
  )
}