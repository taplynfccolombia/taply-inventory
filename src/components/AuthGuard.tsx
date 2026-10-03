'use client'

import { useEffect, useState } from 'react'
import { checkAuth, login, logout } from '@/lib/auth'
import { TaplyLogo } from './TaplyLogo'
import { Lock, Eye, EyeOff } from 'lucide-react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

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

  return <>{children}</>
}
