'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Settings, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react'

type ResetStep = 'idle' | 'confirm1' | 'confirm2' | 'resetting' | 'done' | 'error'

export default function ConfiguracionPage() {
  const [resetStep, setResetStep] = useState<ResetStep>('idle')
  const [confirmText, setConfirmText] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleReset() {
    setResetStep('resetting')
    setErrorMsg('')

    try {
      // 1. Eliminar ventas
      const { error: e1 } = await supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (e1) throw new Error(`Ventas: ${e1.message}`)

      // 2. Eliminar flujo de caja
      const { error: e2 } = await supabase.from('cash_flow').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (e2) throw new Error(`Cash flow: ${e2.message}`)

      // 3. Eliminar clientes
      const { error: e3 } = await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (e3) throw new Error(`Clientes: ${e3.message}`)

      // 4. Eliminar tareas
      const { error: e4 } = await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (e4) throw new Error(`Tareas: ${e4.message}`)

      // 5. Resetear inventario a 0
      const { error: e5 } = await supabase
        .from('inventory')
        .update({ quantity: 0, notes: 'Stock físico único. Toda venta (Essential o Custom) descuenta 1 unidad.' })
        .eq('item_name', 'Tarjeta Negra Matte Base')
      if (e5) throw new Error(`Inventario: ${e5.message}`)

      setResetStep('done')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido')
      setResetStep('error')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <Settings size={28} style={{ color: '#00cfff' }} />
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }} className="taply-gradient-text">
            Configuración
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
          Ajustes del sistema y herramientas de administración
        </p>
      </div>

      {/* Info del sistema */}
      <div style={{ borderRadius: '16px', padding: '28px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>
          Información del Sistema
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'Versión', value: 'v1.0.0' },
            { label: 'Stack', value: 'Next.js 16 + Supabase' },
            { label: 'Base de datos', value: 'PostgreSQL (Supabase)' },
            { label: 'Región', value: 'Canada Central' },
            { label: 'Productos', value: 'Taply Essential / Taply Custom' },
            { label: 'Moneda', value: 'COP (Peso Colombiano)' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '10px', backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f' }}>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>{label}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#f0f0f0' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zona de peligro */}
      <div style={{ borderRadius: '16px', padding: '28px', backgroundColor: '#161616', border: '1px solid #ff4d4d22' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <ShieldAlert size={20} style={{ color: '#ff4d4d' }} />
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#ff4d4d' }}>
            Zona de Peligro
          </h2>
        </div>
        <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#6b7280' }}>
          Las acciones de esta sección son irreversibles. Úsalas solo para pruebas o reinicio completo del sistema.
        </p>

        {/* Estado: idle */}
        {resetStep === 'idle' && (
          <div style={{ borderRadius: '12px', padding: '24px', backgroundColor: '#ff4d4d08', border: '1px solid #ff4d4d22' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <AlertTriangle size={24} style={{ color: '#ff4d4d', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 700, color: '#f0f0f0' }}>
                  Resetear Sistema Completo
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#9ca3af', lineHeight: '1.6' }}>
                  Esto eliminará <strong style={{ color: '#ff4d4d' }}>permanentemente</strong> todas las ventas, clientes, movimientos de caja y tareas. El inventario quedará en 0. Esta acción <strong style={{ color: '#ff4d4d' }}>no se puede deshacer</strong>.
                </p>
                <button onClick={() => setResetStep('confirm1')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: '1px solid #ff4d4d44', backgroundColor: '#ff4d4d11', color: '#ff4d4d' }}>
                  <Trash2 size={16} />
                  Resetear Todo el Sistema
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Estado: confirm1 */}
        {resetStep === 'confirm1' && (
          <div style={{ borderRadius: '12px', padding: '24px', backgroundColor: '#ff4d4d08', border: '1px solid #ff4d4d33' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertTriangle size={20} style={{ color: '#ffb547' }} />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ffb547' }}>
                Primera confirmación
              </h3>
            </div>
            <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#9ca3af' }}>
              ¿Estás seguro que quieres eliminar <strong style={{ color: '#f0f0f0' }}>TODOS los registros</strong> del sistema?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setResetStep('confirm2')}
                style={{ padding: '10px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none', backgroundColor: '#ffb547', color: '#0d0d0d' }}>
                Sí, continuar
              </button>
              <button onClick={() => setResetStep('idle')}
                style={{ padding: '10px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Estado: confirm2 — escribir RESETEAR */}
        {resetStep === 'confirm2' && (
          <div style={{ borderRadius: '12px', padding: '24px', backgroundColor: '#ff4d4d08', border: '1px solid #ff4d4d44' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertTriangle size={20} style={{ color: '#ff4d4d' }} />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ff4d4d' }}>
                Confirmación final
              </h3>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#9ca3af' }}>
              Para confirmar, escribe <strong style={{ color: '#ff4d4d', letterSpacing: '0.05em' }}>RESETEAR</strong> en el campo de abajo:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="Escribe RESETEAR"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: `1px solid ${confirmText === 'RESETEAR' ? '#ff4d4d' : '#2a2a2a'}`, color: '#f0f0f0', boxSizing: 'border-box', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleReset}
                disabled={confirmText !== 'RESETEAR'}
                style={{ padding: '10px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: confirmText === 'RESETEAR' ? 'pointer' : 'not-allowed', border: 'none',
                  backgroundColor: confirmText === 'RESETEAR' ? '#ff4d4d' : '#2a2a2a',
                  color: confirmText === 'RESETEAR' ? '#fff' : '#6b7280' }}>
                ⚠ Resetear Permanentemente
              </button>
              <button onClick={() => { setResetStep('idle'); setConfirmText('') }}
                style={{ padding: '10px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Estado: resetting */}
        {resetStep === 'resetting' && (
          <div style={{ borderRadius: '12px', padding: '32px', backgroundColor: '#ff4d4d08', border: '1px solid #ff4d4d22', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#ffb547' }}>
              Reseteando el sistema...
            </p>
            <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6b7280' }}>
              Eliminando todos los registros. Por favor espera.
            </p>
          </div>
        )}

        {/* Estado: done */}
        {resetStep === 'done' && (
          <div style={{ borderRadius: '12px', padding: '32px', backgroundColor: '#00ff940d', border: '1px solid #00ff9422', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>✅</div>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#00ff94' }}>
              Sistema reseteado exitosamente
            </p>
            <p style={{ margin: '8px 0 20px', fontSize: '13px', color: '#6b7280' }}>
              Todos los registros han sido eliminados. El inventario está en 0.
            </p>
            <button onClick={() => { setResetStep('idle'); setConfirmText('') }}
              style={{ padding: '10px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none', background: 'linear-gradient(90deg, #00cfff, #00ff94)', color: '#0d0d0d' }}>
              Listo
            </button>
          </div>
        )}

        {/* Estado: error */}
        {resetStep === 'error' && (
          <div style={{ borderRadius: '12px', padding: '24px', backgroundColor: '#ff4d4d0d', border: '1px solid #ff4d4d33' }}>
            <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 700, color: '#ff4d4d' }}>
              Error durante el reseteo
            </p>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#9ca3af' }}>{errorMsg}</p>
            <button onClick={() => { setResetStep('idle'); setConfirmText('') }}
              style={{ padding: '10px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
              Volver
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
