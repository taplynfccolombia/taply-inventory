'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { checkAuth, login } from '@/lib/auth'
import { Eye, EyeOff } from 'lucide-react'
import { TaplyLogo } from './TaplyLogo'
import { Navbar } from './Navbar'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const isPublicRoute = pathname.startsWith('/p/')

  useEffect(() => {
    if (isPublicRoute) { setLoading(false); return }
    setAuthenticated(checkAuth())
    setLoading(false)
  }, [isPublicRoute])

  // Ruta pública — sin login, sin navbar
  if (isPublicRoute) {
    return <>{children}</>
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #00cfff22', borderTopColor: '#00cfff', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (!authenticated) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
        <TaplyLogo size="lg" />
        <div style={{ width: '100%', borderRadius: '20px', padding: '32px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
          <h1 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 900, color: '#f0f0f0', textAlign: 'center' }}>Acceso al sistema</h1>
          <p style={{ margin: '0 0 28px', fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>Ingresa tu contraseña para continuar</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                onKeyDown={e => { if (e.key === 'Enter') { if (login(password)) { setAuthenticated(true) } else { setError('Contraseña incorrecta.') } } }}
                placeholder="Contraseña"
                autoFocus
                style={{ width: '100%', padding: '14px 44px 14px 16px', borderRadius: '12px', fontSize: '16px', outline: 'none', backgroundColor: '#0d0d0d', border: error ? '1px solid #ff4d4d' : '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p style={{ margin: 0, fontSize: '13px', color: '#ff4d4d', textAlign: 'center' }}>{error}</p>}
            <button
              onClick={() => { if (login(password)) { setAuthenticated(true) } else { setError('Contraseña incorrecta.') } }}
              style={{ padding: '14px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', border: 'none', background: 'linear-gradient(90deg, #00cfff, #00ff94)', color: '#0d0d0d', cursor: 'pointer' }}>
              Entrar
            </button>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: '#374151', textAlign: 'center' }}>Taply Inventory v1.0 · Sistema de Gestión NFC</p>
      </div>
    </div>
  )

  // Ruta protegida autenticada — con Navbar
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0d0d0d' }}>
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
