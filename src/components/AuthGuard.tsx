'use client'

import { useEffect, useState } from 'react'
import { checkAuth, login, logout } from '@/lib/auth'
import { TaplyLogo } from './TaplyLogo'
import { Lock, Eye, EyeOff, LogOut, KeyRound } from 'lucide-react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [changeForm, setChangeForm] = useState({ current: '', newPass: '', confirm: '' })
  const [changeError, setChangeError] = useState('')
  const [changeSuccess, setChangeSuccess] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => { setIsAuth(checkAuth()) }, [])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    setTimeout(() => {
      const ok = login(password)
      if (ok) { setIsAuth(true) }
      else { setError('Contraseña incorrecta. Inténtalo de nuevo.'); setPassword('') }
      setLoading(false)
    }, 600)
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setChangeError(''); setChangeSuccess('')
    if (!login(changeForm.current)) { setChangeError('La contraseña actual es incorrecta.'); return }
    if (changeForm.newPass.length < 6) { setChangeError('La nueva contraseña debe tener al menos 6 caracteres.'); return }
    if (changeForm.newPass !== changeForm.confirm) { setChangeError('Las contraseñas nuevas no coinciden.'); return }
    localStorage.setItem('taply_custom_password', changeForm.newPass)
    setChangeSuccess('Contraseña actualizada correctamente.')
    setChangeForm({ current: '', newPass: '', confirm: '' })
    setTimeout(() => { setShowChangePassword(false); setChangeSuccess('') }, 2000)
  }

  if (isAuth === null) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #00cfff22', borderTopColor: '#00cfff', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!isAuth) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <TaplyLogo size="lg" showText={true} />
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Sistema de Gestión NFC</p>
          </div>
          <div style={{ borderRadius: '20px', padding: '40px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#00cfff0d', border: '1px solid #00cfff22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={18} style={{ color: '#00cfff' }} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#f0f0f0' }}>Acceso al sistema</h1>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>Ingresa tu contraseña para continuar</p>
              </div>
            </div>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    placeholder="Ingresa tu contraseña" autoFocus
                    style={{ width: '100%', padding: '14px 48px 14px 16px', borderRadius: '12px', fontSize: '15px', outline: 'none', backgroundColor: '#0d0d0d', border: `1px solid ${error ? '#ff4d4d44' : '#2a2a2a'}`, color: '#f0f0f0', boxSizing: 'border-box' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {error && <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#ff4d4d' }}>{error}</p>}
              </div>
              <button type="submit" disabled={loading || !password}
                style={{ padding: '14px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: loading || !password ? 'not-allowed' : 'pointer', border: 'none', marginTop: '8px',
                  background: loading || !password ? '#2a2a2a' : 'linear-gradient(90deg, #00cfff, #00ff94)',
                  color: loading || !password ? '#6b7280' : '#0d0d0d' }}>
                {loading ? 'Verificando...' : 'Entrar'}
              </button>
            </form>
          </div>
          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#374151' }}>
            Taply NFC · Sistema privado de gestión
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <>
      {children}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 100, display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={() => setShowChangePassword(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: '#161616', border: '1px solid #1f1f1f', color: '#6b7280' }}
          onMouseEnter={e => { (e.currentTarget).style.color = '#00cfff'; (e.currentTarget).style.borderColor = '#00cfff22' }}
          onMouseLeave={e => { (e.currentTarget).style.color = '#6b7280'; (e.currentTarget).style.borderColor = '#1f1f1f' }}>
          <KeyRound size={13} /> Cambiar contraseña
        </button>
        <button onClick={() => setShowLogoutConfirm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: '#161616', border: '1px solid #1f1f1f', color: '#6b7280' }}
          onMouseEnter={e => { (e.currentTarget).style.color = '#ff4d4d'; (e.currentTarget).style.borderColor = '#ff4d4d22' }}
          onMouseLeave={e => { (e.currentTarget).style.color = '#6b7280'; (e.currentTarget).style.borderColor = '#1f1f1f' }}>
          <LogOut size={13} /> Cerrar sesión
        </button>
      </div>

      {showLogoutConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#0d0d0dcc', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '100%', maxWidth: '380px', borderRadius: '20px', padding: '32px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <LogOut size={20} style={{ color: '#ff4d4d' }} />
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#f0f0f0' }}>Cerrar sesión</h2>
            </div>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
              Tendrás que ingresar tu contraseña nuevamente para acceder al sistema.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { logout(); setIsAuth(false); setShowLogoutConfirm(false) }}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none', backgroundColor: '#ff4d4d', color: '#fff' }}>
                Cerrar sesión
              </button>
              <button onClick={() => setShowLogoutConfirm(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangePassword && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#0d0d0dcc', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '100%', maxWidth: '420px', borderRadius: '20px', padding: '32px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#00cfff0d', border: '1px solid #00cfff22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KeyRound size={16} style={{ color: '#00cfff' }} />
              </div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#f0f0f0' }}>Cambiar contraseña</h2>
            </div>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { key: 'current', label: 'Contraseña actual', placeholder: 'Tu contraseña actual' },
                { key: 'newPass', label: 'Nueva contraseña', placeholder: 'Mínimo 6 caracteres' },
                { key: 'confirm', label: 'Confirmar nueva contraseña', placeholder: 'Repite la nueva contraseña' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>{label}</label>
                  <input type="password" value={changeForm[key as keyof typeof changeForm]}
                    onChange={e => setChangeForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
                </div>
              ))}
              {changeError && <p style={{ margin: 0, fontSize: '13px', color: '#ff4d4d' }}>{changeError}</p>}
              {changeSuccess && <p style={{ margin: 0, fontSize: '13px', color: '#00ff94' }}>{changeSuccess}</p>}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none', background: 'linear-gradient(90deg, #00cfff, #00ff94)', color: '#0d0d0d' }}>
                  Guardar
                </button>
                <button type="button" onClick={() => { setShowChangePassword(false); setChangeForm({ current: '', newPass: '', confirm: '' }); setChangeError('') }}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
