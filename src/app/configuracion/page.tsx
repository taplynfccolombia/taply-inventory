'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { logout, login } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Trash2, Shield, Info, LogOut, KeyRound, Eye, EyeOff } from 'lucide-react'

type ResetStep = 'idle' | 'confirm1' | 'confirm2' | 'resetting' | 'done' | 'error'

export default function ConfiguracionPage() {
  const router = useRouter()
  const [resetStep, setResetStep] = useState<ResetStep>('idle')
  const [confirmText, setConfirmText] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Cambiar contraseña
  const [showChangePwd, setShowChangePwd] = useState(false)
  const [pwdForm, setPwdForm] = useState({ current: '', newPass: '', confirm: '' })
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  // Cerrar sesión
  const [showLogout, setShowLogout] = useState(false)

  async function handleReset() {
    setResetStep('resetting')
    setErrorMsg('')
    try {
      const { error: e1 } = await supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (e1) throw new Error(`Ventas: ${e1.message}`)
      const { error: e2 } = await supabase.from('cash_flow').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (e2) throw new Error(`Cash flow: ${e2.message}`)
      const { error: e3 } = await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (e3) throw new Error(`Clientes: ${e3.message}`)
      const { error: e4 } = await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (e4) throw new Error(`Tareas: ${e4.message}`)
      const { error: e5b } = await supabase.from('content_board').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (e5b) throw new Error(`Contenido: ${e5b.message}`)
      const { error: e5c } = await supabase.from('goals').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (e5c) throw new Error(`Metas: ${e5c.message}`)
      const { error: e5 } = await supabase.from('inventory').update({ quantity: 0, notes: 'Stock físico único. Toda venta (Essential o Custom) descuenta 1 unidad.' }).eq('item_name', 'Tarjeta Negra Matte Base')
      if (e5) throw new Error(`Inventario: ${e5.message}`)
      setResetStep('done')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido')
      setResetStep('error')
    }
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwdError(''); setPwdSuccess('')
    if (!login(pwdForm.current)) { setPwdError('La contraseña actual es incorrecta.'); return }
    if (pwdForm.newPass.length < 6) { setPwdError('La nueva contraseña debe tener al menos 6 caracteres.'); return }
    if (pwdForm.newPass !== pwdForm.confirm) { setPwdError('Las contraseñas nuevas no coinciden.'); return }
    localStorage.setItem('taply_custom_password', pwdForm.newPass)
    setPwdSuccess('✅ Contraseña actualizada correctamente.')
    setPwdForm({ current: '', newPass: '', confirm: '' })
    setTimeout(() => { setShowChangePwd(false); setPwdSuccess('') }, 2000)
  }

  function handleLogout() {
    logout()
    router.push('/')
    window.location.reload()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }} className="taply-gradient-text">Configuración</h1>
        <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>Ajustes del sistema y seguridad</p>
      </div>

      {/* Info del sistema */}
      <div style={{ borderRadius: '16px', padding: '24px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Info size={18} style={{ color: '#00cfff' }} />
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>Información del Sistema</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { label: 'Versión', value: 'v1.0.0' },
            { label: 'Stack', value: 'Next.js 16 + Supabase' },
            { label: 'Base de datos', value: 'PostgreSQL (Supabase)' },
            { label: 'Región', value: 'Canada Central' },
            { label: 'Productos', value: 'Taply Essential / Taply Custom' },
            { label: 'Moneda', value: 'COP (Peso Colombiano)' },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f' }}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f0f0f0' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Seguridad */}
      <div style={{ borderRadius: '16px', padding: '24px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Shield size={18} style={{ color: '#00cfff' }} />
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>Seguridad</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Cambiar contraseña */}
          <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #1f1f1f' }}>
            <button onClick={() => setShowChangePwd(!showChangePwd)}
              style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0d0d0d', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <KeyRound size={18} style={{ color: '#00cfff' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f0f0f0' }}>Cambiar contraseña</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>Actualiza la contraseña de acceso al sistema</p>
                </div>
              </div>
            </button>

            {showChangePwd && (
              <div style={{ padding: '20px', borderTop: '1px solid #1f1f1f', backgroundColor: '#0d0d0d' }}>
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { key: 'current', label: 'Contraseña actual', placeholder: 'Tu contraseña actual' },
                    { key: 'newPass', label: 'Nueva contraseña', placeholder: 'Mínimo 6 caracteres' },
                    { key: 'confirm', label: 'Confirmar nueva contraseña', placeholder: 'Repite la nueva contraseña' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>{label}</label>
                      <div style={{ position: 'relative' }}>
                        <input type={showPwd ? 'text' : 'password'} value={pwdForm[key as keyof typeof pwdForm]}
                          onChange={e => setPwdForm(p => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder}
                          style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#161616', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
                        {key === 'current' && (
                          <button type="button" onClick={() => setShowPwd(!showPwd)}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                            {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {pwdError && <p style={{ margin: 0, fontSize: '12px', color: '#ff4d4d' }}>{pwdError}</p>}
                  {pwdSuccess && <p style={{ margin: 0, fontSize: '12px', color: '#00ff94' }}>{pwdSuccess}</p>}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button type="submit"
                      style={{ flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: 'none', background: 'linear-gradient(90deg, #00cfff, #00ff94)', color: '#0d0d0d' }}>
                      Guardar contraseña
                    </button>
                    <button type="button" onClick={() => { setShowChangePwd(false); setPwdForm({ current: '', newPass: '', confirm: '' }); setPwdError('') }}
                      style={{ padding: '10px 16px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Cerrar sesión */}
          <div style={{ borderRadius: '12px', border: '1px solid #1f1f1f' }}>
            <button onClick={() => setShowLogout(!showLogout)}
              style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0d0d0d', border: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <LogOut size={18} style={{ color: '#ff4d4d' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f0f0f0' }}>Cerrar sesión</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>Salir del sistema — necesitarás tu contraseña para volver</p>
                </div>
              </div>
            </button>
            {showLogout && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid #1f1f1f', backgroundColor: '#0d0d0d' }}>
                <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#9ca3af' }}>
                  ¿Estás seguro que quieres cerrar sesión?
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleLogout}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: 'none', backgroundColor: '#ff4d4d', color: '#fff' }}>
                    Sí, cerrar sesión
                  </button>
                  <button onClick={() => setShowLogout(false)}
                    style={{ padding: '10px 16px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zona de peligro */}
      <div style={{ borderRadius: '16px', padding: '24px', backgroundColor: '#161616', border: '1px solid #ff4d4d22' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Shield size={18} style={{ color: '#ff4d4d' }} />
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#ff4d4d' }}>Zona de Peligro</h2>
        </div>
        <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
          Las acciones de esta sección son irreversibles. Úsalas solo para pruebas o reinicio completo del sistema.
        </p>

        {resetStep === 'idle' && (
          <div style={{ borderRadius: '12px', padding: '20px', backgroundColor: '#ff4d4d08', border: '1px solid #ff4d4d22' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <AlertTriangle size={22} style={{ color: '#ff4d4d', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 700, color: '#f0f0f0' }}>Resetear Sistema Completo</h3>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#9ca3af', lineHeight: '1.6' }}>
                  Eliminará <strong style={{ color: '#ff4d4d' }}>permanentemente</strong> todas las ventas, clientes, movimientos de caja, tareas y contenido. El inventario quedará en 0. <strong style={{ color: '#ff4d4d' }}>No se puede deshacer.</strong>
                </p>
                <button onClick={() => setResetStep('confirm1')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: '1px solid #ff4d4d44', backgroundColor: '#ff4d4d11', color: '#ff4d4d' }}>
                  <Trash2 size={15} /> Resetear Todo el Sistema
                </button>
              </div>
            </div>
          </div>
        )}

        {resetStep === 'confirm1' && (
          <div style={{ borderRadius: '12px', padding: '20px', backgroundColor: '#ff4d4d08', border: '1px solid #ff4d4d33' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <AlertTriangle size={18} style={{ color: '#ffb547' }} />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ffb547' }}>Primera confirmación</h3>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#9ca3af' }}>¿Estás seguro de que quieres eliminar TODOS los datos del sistema?</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setResetStep('confirm2')}
                style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: 'none', backgroundColor: '#ffb547', color: '#0d0d0d' }}>
                Sí, continuar
              </button>
              <button onClick={() => setResetStep('idle')}
                style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {resetStep === 'confirm2' && (
          <div style={{ borderRadius: '12px', padding: '20px', backgroundColor: '#ff4d4d08', border: '1px solid #ff4d4d44' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <AlertTriangle size={18} style={{ color: '#ff4d4d' }} />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ff4d4d' }}>Confirmación final</h3>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#9ca3af' }}>Escribe <strong style={{ color: '#ff4d4d' }}>RESETEAR</strong> para confirmar:</p>
            <input type="text" value={confirmText} onChange={e => setConfirmText(e.target.value)}
              placeholder="Escribe RESETEAR"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #ff4d4d33', color: '#f0f0f0', boxSizing: 'border-box', marginBottom: '14px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleReset} disabled={confirmText !== 'RESETEAR'}
                style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: confirmText === 'RESETEAR' ? 'pointer' : 'not-allowed', border: 'none',
                  backgroundColor: confirmText === 'RESETEAR' ? '#ff4d4d' : '#2a2a2a',
                  color: confirmText === 'RESETEAR' ? '#fff' : '#6b7280' }}>
                ⚠ Resetear Permanentemente
              </button>
              <button onClick={() => { setResetStep('idle'); setConfirmText('') }}
                style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {resetStep === 'resetting' && (
          <div style={{ borderRadius: '12px', padding: '32px', backgroundColor: '#ff4d4d08', border: '1px solid #ff4d4d22', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#ffb547' }}>Reseteando el sistema...</p>
          </div>
        )}

        {resetStep === 'done' && (
          <div style={{ borderRadius: '12px', padding: '32px', backgroundColor: '#00ff940d', border: '1px solid #00ff9422', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>✅</div>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#00ff94' }}>Sistema reseteado exitosamente</p>
            <p style={{ margin: '8px 0 20px', fontSize: '13px', color: '#6b7280' }}>Todos los registros han sido eliminados.</p>
            <button onClick={() => { setResetStep('idle'); setConfirmText('') }}
              style={{ padding: '10px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: 'none', background: 'linear-gradient(90deg, #00cfff, #00ff94)', color: '#0d0d0d' }}>
              Listo
            </button>
          </div>
        )}

        {resetStep === 'error' && (
          <div style={{ borderRadius: '12px', padding: '20px', backgroundColor: '#ff4d4d0d', border: '1px solid #ff4d4d33' }}>
            <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700, color: '#ff4d4d' }}>Error durante el reseteo</p>
            <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#9ca3af' }}>{errorMsg}</p>
            <button onClick={() => { setResetStep('idle'); setConfirmText('') }}
              style={{ padding: '8px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
              Volver
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
