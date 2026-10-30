'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { loginWithSupabase } from '@/lib/auth'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { TaplyLogo } from './TaplyLogo'
import { Navbar } from './Navbar'
import type { Session } from '@supabase/supabase-js'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogin() {
    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico.')
      return
    }
    if (!password.trim()) {
      setError('Por favor ingresa tu contraseña.')
      return
    }
    if (submitting) return

    setSubmitting(true)
    setError('')
    const res = await loginWithSupabase(email, password)
    if (!res.success) {
      setError(
        res.error === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos.'
          : (res.error ?? 'Error al iniciar sesión.')
      )
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #00cfff22', borderTopColor: '#00cfff', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (!session) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
        <TaplyLogo size="lg" />
        <div style={{ width: '100%', borderRadius: '20px', padding: '32px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
          <h1 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 900, color: '#f0f0f0', textAlign: 'center' }}>Acceso al sistema</h1>
          <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>Ingresa con tu cuenta de administrador</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '7px' }}>Correo electrónico</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
                  placeholder="admin@taply.co"
                  autoFocus
                  style={{ width: '100%', padding: '13px 16px 13px 40px', borderRadius: '12px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: error ? '1px solid #ff4d4d' : '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '7px' }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
                  placeholder="Tu contraseña"
                  style={{ width: '100%', padding: '13px 42px 13px 40px', borderRadius: '12px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: error ? '1px solid #ff4d4d' : '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <p style={{ margin: 0, fontSize: '13px', color: '#ff4d4d', textAlign: 'center' }}>{error}</p>}
            <button
              onClick={handleLogin}
              disabled={submitting}
              style={{ padding: '14px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', border: 'none', background: submitting ? '#2a2a2a' : 'linear-gradient(90deg, #00cfff, #00ff94)', color: submitting ? '#6b7280' : '#0d0d0d', cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? 'Iniciando sesión...' : 'Entrar'}
            </button>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: '#374151', textAlign: 'center' }}>Taply Inventory v1.0 · Sistema de Gestión NFC</p>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0d0d0d' }}>
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
