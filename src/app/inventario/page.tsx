'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCOP, formatDateTime } from '@/lib/utils'
import { useIsMobile } from '@/lib/hooks'
import { Package, Plus, Minus, AlertTriangle } from 'lucide-react'

interface InventoryLog {
  id: string
  created_at: string
  change_type: 'add' | 'subtract' | 'sale' | 'cancel'
  quantity_change: number
  quantity_after: number
  notes: string | null
}

export default function InventarioPage() {
  const isMobile = useIsMobile()
  const [stock, setStock] = useState(0)
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [loading, setLoading] = useState(true)
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add')
  const [quantity, setQuantity] = useState('1')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function fetchData() {
    const [inventoryRes, logsRes] = await Promise.all([
      supabase.from('inventory').select('*').eq('item_name', 'Tarjeta Negra Matte Base').single(),
      supabase.from('inventory_logs').select('*').order('created_at', { ascending: false }).limit(50),
    ])
    setStock(inventoryRes.data?.quantity ?? 0)
    setLogs(logsRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function handleAdjust() {
    const qty = Number(quantity)
    if (qty <= 0) { setMessage({ type: 'error', text: 'La cantidad debe ser mayor a 0.' }); return }
    if (adjustType === 'subtract' && qty > stock) {
      setMessage({ type: 'error', text: `No puedes restar más del stock actual (${stock} uds).` }); return
    }
    setSaving(true); setMessage(null)
    const newStock = adjustType === 'add' ? stock + qty : stock - qty
    const { error: invError } = await supabase.from('inventory').update({ quantity: newStock }).eq('item_name', 'Tarjeta Negra Matte Base')
    if (invError) { setMessage({ type: 'error', text: 'Error al actualizar el inventario.' }); setSaving(false); return }
    await supabase.from('inventory_logs').insert([{
      change_type: adjustType,
      quantity_change: adjustType === 'add' ? qty : -qty,
      quantity_after: newStock,
      notes: notes.trim() || null,
    }])
    setMessage({ type: 'success', text: `Stock ${adjustType === 'add' ? 'aumentado' : 'reducido'} correctamente. Nuevo stock: ${newStock} uds.` })
    setQuantity('1'); setNotes('')
    fetchData()
    setSaving(false)
  }

  const stockStatus = stock === 0 ? 'sin_stock' : stock < 5 ? 'bajo' : 'ok'
  const stockColor = stockStatus === 'sin_stock' ? '#ff4d4d' : stockStatus === 'bajo' ? '#ffb547' : '#00ff94'
  const stockLabel = stockStatus === 'sin_stock' ? '🚨 Sin Stock' : stockStatus === 'bajo' ? '⚠ Stock Bajo' : '✅ Stock OK'

  const LOG_LABELS: Record<string, { label: string; color: string }> = {
    add:      { label: '+ Agregado',    color: '#00ff94' },
    subtract: { label: '− Restado',     color: '#ffb547' },
    sale:     { label: '↓ Venta',       color: '#00cfff' },
    cancel:   { label: '↑ Cancelación', color: '#a78bfa' },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <div>
        <h1 style={{ margin: 0, fontSize: isMobile ? '24px' : '32px', fontWeight: 900 }} className="taply-gradient-text">Inventario</h1>
        <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>Control de stock — Tarjeta Negra Matte Base</p>
      </div>

      {/* KPIs stock */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '16px' }}>
        <div style={{ borderRadius: '16px', padding: '24px', backgroundColor: stockColor + '0d', border: `1px solid ${stockColor}22`, textAlign: 'center' }}>
          <Package size={28} style={{ color: stockColor, margin: '0 auto 12px', display: 'block' }} />
          <p style={{ margin: 0, fontSize: '56px', fontWeight: 900, color: stockColor, lineHeight: 1 }}>{stock}</p>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#6b7280' }}>unidades disponibles</p>
          <span style={{ display: 'inline-block', marginTop: '10px', padding: '4px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, backgroundColor: stockColor + '0d', color: stockColor, border: `1px solid ${stockColor}33` }}>
            {stockLabel}
          </span>
        </div>
        <div style={{ borderRadius: '16px', padding: '24px', backgroundColor: '#161616', border: '1px solid #1f1f1f', textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6b7280' }}>Valor del stock</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#00cfff' }}>{formatCOP(stock * 2000)}</p>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#374151' }}>× $2.000 costo/unidad</p>
        </div>
        <div style={{ borderRadius: '16px', padding: '24px', backgroundColor: '#161616', border: '1px solid #1f1f1f', textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6b7280' }}>Movimientos registrados</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#00ff94' }}>{logs.length}</p>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#374151' }}>últimos 50 movimientos</p>
        </div>
      </div>

      {/* Alerta */}
      {stockStatus !== 'ok' && (
        <div style={{ padding: '14px 20px', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px',
          backgroundColor: stockStatus === 'sin_stock' ? '#ff4d4d0d' : '#ffb5470d',
          border: `1px solid ${stockStatus === 'sin_stock' ? '#ff4d4d22' : '#ffb54722'}` }}>
          <AlertTriangle size={18} style={{ color: stockColor, flexShrink: 0, marginTop: '2px' }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: stockColor }}>
            {stockStatus === 'sin_stock'
              ? '🚨 Sin stock disponible. No puedes registrar ventas completadas hasta reabastecer.'
              : `⚠ Stock bajo: solo quedan ${stock} unidad${stock !== 1 ? 'es' : ''}. Considera reabastecer pronto.`}
          </span>
        </div>
      )}

      {/* Ajuste manual */}
      <div style={{ borderRadius: '16px', padding: '24px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>Ajuste Manual de Stock</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Tipo de ajuste</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {([
                  { type: 'add',      label: '+ Agregar', icon: Plus,  color: '#00ff94', bg: '#00ff940d', border: '#00ff9433' },
                  { type: 'subtract', label: '− Restar',  icon: Minus, color: '#ffb547', bg: '#ffb5470d', border: '#ffb54733' },
                ] as const).map(({ type, label, icon: Icon, color, bg, border }) => (
                  <button key={type} onClick={() => setAdjustType(type)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                      backgroundColor: adjustType === type ? bg : '#0d0d0d',
                      border: adjustType === type ? `1px solid ${border}` : '1px solid #2a2a2a',
                      color: adjustType === type ? color : '#6b7280' }}>
                    <Icon size={16} /> {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Cantidad</label>
              <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '16px', fontWeight: 700, outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box', textAlign: 'center' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Motivo (opcional)</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Ej: Compra a proveedor, corrección de conteo..."
              style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
          </div>

          {Number(quantity) > 0 && (
            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#6b7280' }}>{stock}</span>
              <span style={{ fontSize: '16px', color: adjustType === 'add' ? '#00ff94' : '#ffb547' }}>
                {adjustType === 'add' ? `+${quantity}` : `-${quantity}`}
              </span>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>=</span>
              <span style={{ fontSize: '22px', fontWeight: 900, color: adjustType === 'add' ? '#00ff94' : '#ffb547' }}>
                {adjustType === 'add' ? stock + Number(quantity) : Math.max(0, stock - Number(quantity))} uds
              </span>
            </div>
          )}

          {message && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '14px',
              backgroundColor: message.type === 'success' ? '#00ff940d' : '#ff4d4d0d',
              border: `1px solid ${message.type === 'success' ? '#00ff9422' : '#ff4d4d22'}`,
              color: message.type === 'success' ? '#00ff94' : '#ff4d4d' }}>
              {message.text}
            </div>
          )}

          <button onClick={handleAdjust} disabled={saving || Number(quantity) <= 0}
            style={{ padding: '14px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', border: 'none',
              background: saving ? '#2a2a2a' : 'linear-gradient(90deg, #00cfff, #00ff94)',
              color: saving ? '#6b7280' : '#0d0d0d', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Guardando...' : `Confirmar ${adjustType === 'add' ? 'Aumento' : 'Reducción'} de Stock`}
          </button>
        </div>
      </div>

      {/* Historial */}
      <div>
        <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 700, color: '#f0f0f0' }}>Historial de Movimientos</h2>
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #1f1f1f' }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: isMobile ? '500px' : 'auto' }}>
              <thead>
                <tr style={{ backgroundColor: '#161616', borderBottom: '1px solid #1f1f1f' }}>
                  {['Fecha', 'Tipo', 'Cambio', 'Stock resultante', 'Motivo'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(5)].map((_, j) => (
                        <td key={j} style={{ padding: '12px 16px' }}>
                          <div style={{ height: '14px', borderRadius: '6px', backgroundColor: '#1f1f1f' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#4b5563' }}>
                      <Package size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                      No hay movimientos registrados aún.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, i) => {
                    const logStyle = LOG_LABELS[log.change_type] ?? { label: log.change_type, color: '#6b7280' }
                    return (
                      <tr key={log.id} style={{ backgroundColor: i % 2 === 0 ? '#0d0d0d' : '#111111', borderBottom: '1px solid #161616' }}>
                        <td style={{ padding: '12px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDateTime(log.created_at)}</td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                            backgroundColor: logStyle.color + '0d', color: logStyle.color, border: `1px solid ${logStyle.color}22` }}>
                            {logStyle.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: log.quantity_change > 0 ? '#00ff94' : '#ff4d4d', whiteSpace: 'nowrap' }}>
                          {log.quantity_change > 0 ? `+${log.quantity_change}` : log.quantity_change}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#f0f0f0', whiteSpace: 'nowrap' }}>{log.quantity_after} uds</td>
                        <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{log.notes ?? '—'}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
