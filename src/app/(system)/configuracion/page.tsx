'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { logout, changePassword, getPasswordStatus } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Trash2, Shield, Info, LogOut, KeyRound, Eye, EyeOff, Download, Upload, Database } from 'lucide-react'
import { useIsMobile } from '@/lib/hooks'

type ResetStep = 'idle' | 'confirm1' | 'confirm2' | 'resetting' | 'done' | 'error'

interface AppBackup {
  app: 'taply-inventory'
  formatVersion: 1
  exportedAt: string
  tables: {
    clients: Record<string, unknown>[]
    nfc_profiles: Record<string, unknown>[]
    sales: Record<string, unknown>[]
    inventory: Record<string, unknown>[]
  }
}

export default function ConfiguracionPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [resetStep, setResetStep] = useState<ResetStep>('idle')
  const [confirmText, setConfirmText] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [showChangePwd, setShowChangePwd] = useState(false)
  const [pwdForm, setPwdForm] = useState({ current: '', newPass: '', confirm: '' })
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<{ isDefault: boolean; expiryDate: Date | null } | null>(null)
  const backupInputRef = useRef<HTMLInputElement>(null)
  const [backupBusy, setBackupBusy] = useState(false)
  const [backupMessage, setBackupMessage] = useState('')
  const [backupError, setBackupError] = useState('')
  const [backupPreview, setBackupPreview] = useState<{ fileName: string; archive: AppBackup } | null>(null)
  const [backupConfirmText, setBackupConfirmText] = useState('')

  useEffect(() => {
    setPasswordStatus(getPasswordStatus())
  }, [])

  async function handleReset() {
    setResetStep('resetting'); setErrorMsg('')
    try {
      const { error: e1 } = await supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (e1) throw new Error(`Ventas: ${e1.message}`)
      const { error: e2 } = await supabase.from('cash_flow').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (e2) throw new Error(`Cash flow: ${e2.message}`)
      const { error: e3 } = await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (e3) throw new Error(`Clientes: ${e3.message}`)
      const { error: e4 } = await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (e4) throw new Error(`Tareas: ${e4.message}`)
      const { error: e5 } = await supabase.from('content_board').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (e5) throw new Error(`Contenido: ${e5.message}`)
      const { error: e6 } = await supabase.from('goals').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (e6) throw new Error(`Metas: ${e6.message}`)
      const { error: e7 } = await supabase.from('nfc_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (e7) throw new Error(`Perfiles NFC: ${e7.message}`)
      const { error: e8 } = await supabase.from('inventory').update({ quantity: 0 }).eq('item_name', 'Tarjeta Negra Matte Base')
      if (e8) throw new Error(`Inventario: ${e8.message}`)
      setResetStep('done')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido')
      setResetStep('error')
    }
  }

  async function handleDownloadBackup() {
    setBackupBusy(true); setBackupError(''); setBackupMessage('')
    try {
      const [clients, profiles, sales, inventory] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('nfc_profiles').select('*'),
        supabase.from('sales').select('*'),
        supabase.from('inventory').select('*'),
      ])
      if (clients.error) throw new Error(`Clientes: ${clients.error.message}`)
      if (profiles.error) throw new Error(`Perfiles NFC: ${profiles.error.message}`)
      if (sales.error) throw new Error(`Ventas: ${sales.error.message}`)
      if (inventory.error) throw new Error(`Inventario: ${inventory.error.message}`)
      const archive: AppBackup = {
        app: 'taply-inventory', formatVersion: 1, exportedAt: new Date().toISOString(),
        tables: { clients: clients.data ?? [], nfc_profiles: profiles.data ?? [], sales: sales.data ?? [], inventory: inventory.data ?? [] },
      }
      const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `taply-respaldo-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setBackupMessage(`Respaldo descargado: ${archive.tables.clients.length} clientes, ${archive.tables.nfc_profiles.length} perfiles QR, ${archive.tables.sales.length} ventas e inventario.`)
    } catch (err) {
      setBackupError(err instanceof Error ? err.message : 'No se pudo crear el respaldo.')
    } finally {
      setBackupBusy(false)
    }
  }

  async function handleBackupFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    setBackupError(''); setBackupMessage(''); setBackupPreview(null); setBackupConfirmText('')
    if (!file) return
    try {
      if (file.size > 50 * 1024 * 1024) throw new Error('El archivo supera el límite de 50 MB.')
      const parsed = JSON.parse(await file.text()) as Partial<AppBackup>
      const tables = parsed.tables
      if (parsed.app !== 'taply-inventory' || parsed.formatVersion !== 1 || !tables || !Array.isArray(tables.clients) || !Array.isArray(tables.nfc_profiles) || !Array.isArray(tables.sales) || !Array.isArray(tables.inventory)) {
        throw new Error('El archivo no es un respaldo Taply compatible.')
      }
      const hasValidIds = (rows: Record<string, unknown>[]) => rows.every(row => row && typeof row === 'object' && typeof row.id === 'string')
      if (!hasValidIds(tables.clients) || !hasValidIds(tables.nfc_profiles) || !hasValidIds(tables.sales) || !hasValidIds(tables.inventory)) {
        throw new Error('El respaldo contiene registros sin identificador válido.')
      }
      if (!tables.clients.every(row => typeof row.full_name === 'string') ||
          !tables.sales.every(row => typeof row.unit_price === 'number' && typeof row.quantity === 'number' && typeof row.total_revenue === 'number' && typeof row.total_cost === 'number' && typeof row.total_profit === 'number') ||
          !tables.inventory.every(row => typeof row.item_name === 'string')) {
        throw new Error('El respaldo contiene registros incompletos o de un formato no compatible.')
      }
      setBackupPreview({ fileName: file.name, archive: parsed as AppBackup })
    } catch (err) {
      setBackupError(err instanceof Error ? err.message : 'No se pudo leer el archivo.')
    }
  }

  async function handleRestoreBackup() {
    if (!backupPreview || backupConfirmText !== 'RESTAURAR') return
    setBackupBusy(true); setBackupError(''); setBackupMessage('')
    const { tables } = backupPreview.archive
    try {
      for (let offset = 0; offset < tables.clients.length; offset += 300) {
        const { error } = await supabase.from('clients').upsert(tables.clients.slice(offset, offset + 300) as never[], { onConflict: 'id' })
        if (error) throw new Error(`Clientes: ${error.message}`)
      }
      for (let offset = 0; offset < tables.nfc_profiles.length; offset += 300) {
        const { error } = await supabase.from('nfc_profiles').upsert(tables.nfc_profiles.slice(offset, offset + 300) as never[], { onConflict: 'id' })
        if (error) throw new Error(`Perfiles QR: ${error.message}`)
      }
      for (let offset = 0; offset < tables.sales.length; offset += 300) {
        const batch = tables.sales.slice(offset, offset + 300)
        const writableBatch = batch.map(row => Object.fromEntries(Object.entries(row).filter(([key]) => !['total_revenue', 'total_cost', 'total_profit'].includes(key))))
        const { error } = await supabase.from('sales').upsert(writableBatch as never[], { onConflict: 'id' })
        if (error) throw new Error(`Ventas: ${error.message}`)
        const { data: restoredSales, error: totalsError } = await supabase.from('sales').select('id, total_revenue, total_cost, total_profit').in('id', batch.map(row => String(row.id)))
        if (totalsError) throw new Error(`Verificación de ventas: ${totalsError.message}`)
        const expectedById = new Map(batch.map(row => [String(row.id), row]))
        const totalsMatch = (restoredSales ?? []).every(sale => {
          const expected = expectedById.get(String(sale.id))
          return expected && Math.abs(Number(sale.total_revenue) - Number(expected.total_revenue)) < 0.01 &&
            Math.abs(Number(sale.total_cost) - Number(expected.total_cost)) < 0.01 &&
            Math.abs(Number(sale.total_profit) - Number(expected.total_profit)) < 0.01
        })
        if (!totalsMatch || (restoredSales ?? []).length !== batch.length) {
          throw new Error('Los totales de una o más ventas no coinciden con el respaldo. La restauración se detuvo.')
        }
      }
      for (let offset = 0; offset < tables.inventory.length; offset += 300) {
        const { error } = await supabase.from('inventory').upsert(tables.inventory.slice(offset, offset + 300) as never[], { onConflict: 'id' })
        if (error) throw new Error(`Inventario: ${error.message}`)
      }
      setBackupMessage('Respaldo restaurado. Los registros con el mismo ID se actualizaron; los demás datos actuales se conservaron.')
      setBackupPreview(null); setBackupConfirmText('')
    } catch (err) {
      setBackupError(`La restauración se detuvo y puede haber aplicado algunos registros. ${err instanceof Error ? err.message : ''}`)
    } finally {
      setBackupBusy(false)
    }
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwdError(''); setPwdSuccess('')
    if (pwdForm.newPass !== pwdForm.confirm) { setPwdError('Las contraseñas nuevas no coinciden.'); return }
    const result = changePassword(pwdForm.current, pwdForm.newPass)
    if (!result.success) { setPwdError(result.error ?? 'Error desconocido.'); return }
    setPwdSuccess('✅ Contraseña actualizada correctamente.')
    setPwdForm({ current: '', newPass: '', confirm: '' })
    setPasswordStatus(getPasswordStatus())
    setTimeout(() => { setShowChangePwd(false); setPwdSuccess('') }, 2000)
  }

  function handleLogout() {
    logout()
    router.push('/')
    window.location.reload()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      <div>
        <h1 style={{ margin: 0, fontSize: isMobile ? '24px' : '32px', fontWeight: 900 }} className="taply-gradient-text">Configuración</h1>
        <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>Ajustes del sistema y seguridad</p>
      </div>

      {/* Info del sistema */}
      <div style={{ borderRadius: '16px', padding: '24px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Info size={18} style={{ color: '#00cfff' }} />
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>Información del Sistema</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
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

      {/* Respaldo */}
      <div style={{ borderRadius: '16px', padding: '24px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Database size={18} style={{ color: '#00cfff' }} />
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>Respaldo y restauración</h2>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: '12px', lineHeight: 1.6, color: '#6b7280' }}>
          Exporta clientes, perfiles QR, ventas e inventario en un archivo JSON. Al restaurarlo, los registros con el mismo ID se reemplazan por la copia y los demás datos actuales se conservan. El archivo contiene datos personales y financieros; guárdalo en un lugar privado.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleDownloadBackup} disabled={backupBusy}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(90deg, #00cfff, #00ff94)', color: '#0d0d0d', cursor: backupBusy ? 'wait' : 'pointer', fontSize: '13px', fontWeight: 700 }}>
            <Download size={15} /> {backupBusy ? 'Procesando...' : 'Descargar respaldo'}
          </button>
          <button onClick={() => backupInputRef.current?.click()} disabled={backupBusy}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 14px', borderRadius: '10px', border: '1px solid #2a2a2a', background: 'transparent', color: '#9ca3af', cursor: backupBusy ? 'wait' : 'pointer', fontSize: '13px', fontWeight: 700 }}>
            <Upload size={15} /> Elegir respaldo para restaurar
          </button>
          <input ref={backupInputRef} type="file" accept=".json,application/json" onChange={handleBackupFile} style={{ display: 'none' }} />
        </div>

        {backupMessage && <p role="status" style={{ margin: '14px 0 0', color: '#00ff94', fontSize: '12px' }}>{backupMessage}</p>}
        {backupError && <p role="alert" style={{ margin: '14px 0 0', color: '#ff4d4d', fontSize: '12px' }}>{backupError}</p>}

        {backupPreview && (
          <div style={{ marginTop: '16px', padding: '16px', borderRadius: '12px', backgroundColor: '#0d0d0d', border: '1px solid #ffb54733' }}>
            <p style={{ margin: '0 0 8px', color: '#ffb547', fontSize: '13px', fontWeight: 700 }}>Confirma la restauración de {backupPreview.fileName}</p>
            <p style={{ margin: '0 0 12px', color: '#9ca3af', fontSize: '12px' }}>
              {backupPreview.archive.tables.clients.length} clientes · {backupPreview.archive.tables.nfc_profiles.length} perfiles QR · {backupPreview.archive.tables.sales.length} ventas · {backupPreview.archive.tables.inventory.length} registros de inventario. Puede reemplazar registros actuales con el mismo ID.
            </p>
            <label style={{ display: 'block', marginBottom: '6px', color: '#9ca3af', fontSize: '12px' }}>Escribe RESTAURAR para confirmar</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input value={backupConfirmText} onChange={event => setBackupConfirmText(event.target.value)} placeholder="RESTAURAR"
                style={{ flex: '1 1 180px', padding: '10px 12px', borderRadius: '9px', border: '1px solid #2a2a2a', backgroundColor: '#161616', color: '#f0f0f0', outline: 'none' }} />
              <button onClick={handleRestoreBackup} disabled={backupBusy || backupConfirmText !== 'RESTAURAR'}
                style={{ padding: '10px 14px', borderRadius: '9px', border: 'none', backgroundColor: backupConfirmText === 'RESTAURAR' ? '#ffb547' : '#2a2a2a', color: backupConfirmText === 'RESTAURAR' ? '#0d0d0d' : '#6b7280', cursor: backupConfirmText === 'RESTAURAR' ? 'pointer' : 'not-allowed', fontSize: '12px', fontWeight: 700 }}>
                {backupBusy ? 'Restaurando...' : 'Restaurar respaldo'}
              </button>
              <button onClick={() => { setBackupPreview(null); setBackupConfirmText('') }} disabled={backupBusy}
                style={{ padding: '10px 14px', borderRadius: '9px', border: '1px solid #2a2a2a', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Cancelar</button>
            </div>
          </div>
        )}
      </div>

      {/* Seguridad */}
      <div style={{ borderRadius: '16px', padding: '24px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Shield size={18} style={{ color: '#00cfff' }} />
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>Seguridad</h2>
        </div>

        {/* Alerta contraseña por defecto */}
        {passwordStatus?.isDefault && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', backgroundColor: '#ffb5470d', border: '1px solid #ffb54722', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={15} style={{ color: '#ffb547', flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '13px', color: '#ffb547', fontWeight: 600 }}>
              Estás usando la contraseña por defecto. Se recomienda cambiarla.
            </p>
          </div>
        )}

        {/* Info sesión */}
        {passwordStatus?.expiryDate && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', backgroundColor: '#00cfff0d', border: '1px solid #00cfff22' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#00cfff' }}>
              🔐 Sesión activa · Expira: {passwordStatus.expiryDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Cambiar contraseña */}
          <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #1f1f1f' }}>
            <button onClick={() => setShowChangePwd(!showChangePwd)}
              style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0d0d0d', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <KeyRound size={18} style={{ color: '#00cfff' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f0f0f0' }}>Cambiar contraseña</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>Sesión se mantiene activa por 7 días</p>
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
              style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#0d0d0d', border: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: '12px' }}>
              <LogOut size={18} style={{ color: '#ff4d4d' }} />
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f0f0f0' }}>Cerrar sesión</p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>La sesión expira automáticamente a los 7 días</p>
              </div>
            </button>
            {showLogout && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid #1f1f1f', backgroundColor: '#0d0d0d' }}>
                <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#9ca3af' }}>¿Estás seguro que quieres cerrar sesión?</p>
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
          Las acciones de esta sección son irreversibles.
        </p>

        {resetStep === 'idle' && (
          <div style={{ borderRadius: '12px', padding: '20px', backgroundColor: '#ff4d4d08', border: '1px solid #ff4d4d22' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <AlertTriangle size={22} style={{ color: '#ff4d4d', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 700, color: '#f0f0f0' }}>Resetear Sistema Completo</h3>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#9ca3af', lineHeight: '1.6' }}>
                  Elimina <strong style={{ color: '#ff4d4d' }}>permanentemente</strong> todas las ventas, clientes, movimientos de caja, tareas, perfiles NFC y contenido. El inventario queda en 0.
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
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#9ca3af' }}>¿Estás seguro de que quieres eliminar TODOS los datos?</p>
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
            <input type="text" value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="Escribe RESETEAR"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #ff4d4d33', color: '#f0f0f0', boxSizing: 'border-box', marginBottom: '14px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleReset} disabled={confirmText !== 'RESETEAR'}
                style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: confirmText === 'RESETEAR' ? 'pointer' : 'not-allowed', border: 'none',
                  backgroundColor: confirmText === 'RESETEAR' ? '#ff4d4d' : '#2a2a2a', color: confirmText === 'RESETEAR' ? '#fff' : '#6b7280' }}>
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
