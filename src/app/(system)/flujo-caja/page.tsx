'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { CashFlow } from '@/lib/supabase'
import { formatCOP, formatDateTime, CASH_FLOW_CATEGORY_LABELS, PAYMENT_METHOD_LABELS, exportToCSV } from '@/lib/utils'
import { useIsMobile } from '@/lib/hooks'
import { Wallet, Plus, X, TrendingUp, TrendingDown, Download, Calendar } from 'lucide-react'

interface SaleByPayment { payment_method: string; total: number; count: number }
type PeriodFilter = 'todo' | 'mes' | 'semana' | 'personalizado'

export default function FlujoCajaPage() {
  const isMobile = useIsMobile()
  const [flows, setFlows] = useState<CashFlow[]>([])
  const [salesByPayment, setSalesByPayment] = useState<SaleByPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('todo')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [form, setForm] = useState({ type: 'egreso' as 'ingreso' | 'egreso', category: 'otro', description: '', amount: '' })

  function getDateRange(p: PeriodFilter) {
    const now = new Date()
    if (p === 'semana') { const from = new Date(now); from.setDate(from.getDate() - 7); return { from: from.toISOString(), to: now.toISOString() } }
    if (p === 'mes') { const from = new Date(now.getFullYear(), now.getMonth(), 1); return { from: from.toISOString(), to: now.toISOString() } }
    if (p === 'personalizado' && dateFrom && dateTo) return { from: `${dateFrom}T00:00:00`, to: `${dateTo}T23:59:59` }
    return null
  }

  async function fetchData() {
    setLoading(true)
    const range = getDateRange(periodFilter)
    let flowsQuery = supabase.from('cash_flow').select('*').order('flow_date', { ascending: false })
    let salesQuery = supabase.from('sales').select('payment_method, total_revenue').eq('status', 'completada')
    if (range) { flowsQuery = flowsQuery.gte('flow_date', range.from).lte('flow_date', range.to); salesQuery = salesQuery.gte('sale_date', range.from).lte('sale_date', range.to) }
    const [flowsRes, salesRes] = await Promise.all([flowsQuery, salesQuery])
    setFlows(flowsRes.data ?? [])
    const grouped: Record<string, { total: number; count: number }> = {}
    ;(salesRes.data ?? []).forEach(s => {
      if (!grouped[s.payment_method]) grouped[s.payment_method] = { total: 0, count: 0 }
      grouped[s.payment_method].total += Number(s.total_revenue); grouped[s.payment_method].count += 1
    })
    setSalesByPayment(Object.entries(grouped).map(([method, data]) => ({ payment_method: method, ...data })).sort((a, b) => b.total - a.total))
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [periodFilter, dateFrom, dateTo])

  const totalIngresos = flows.filter(f => f.type === 'ingreso').reduce((acc, f) => acc + Number(f.amount), 0)
  const totalEgresos = flows.filter(f => f.type === 'egreso').reduce((acc, f) => acc + Number(f.amount), 0)
  const balance = totalIngresos - totalEgresos

  async function handleSubmit() {
    if (!form.description.trim()) { setMessage({ type: 'error', text: 'La descripción es obligatoria.' }); return }
    if (!form.amount || Number(form.amount) <= 0) { setMessage({ type: 'error', text: 'El monto debe ser mayor a 0.' }); return }
    setSaving(true); setMessage(null)
    const { error } = await supabase.from('cash_flow').insert([{ type: form.type, category: form.category, description: form.description.trim(), amount: Number(form.amount) }])
    if (error) { setMessage({ type: 'error', text: 'Error al guardar.' }) }
    else { setMessage({ type: 'success', text: 'Movimiento registrado.' }); setForm({ type: 'egreso', category: 'otro', description: '', amount: '' }); setShowForm(false); fetchData() }
    setSaving(false)
  }

  function handleExportCSV() {
    exportToCSV(flows.map(f => ({ Fecha: formatDateTime(f.flow_date), Tipo: f.type === 'ingreso' ? 'Ingreso' : 'Egreso', Categoría: CASH_FLOW_CATEGORY_LABELS[f.category] ?? f.category, Descripción: f.description, 'Monto (COP)': f.type === 'ingreso' ? Number(f.amount) : -Number(f.amount) })), 'Taply_FlujoCaja')
  }

  const PAYMENT_ICONS: Record<string, string> = { efectivo: '💵', transferencia: '🏦', nequi: '🟣', daviplata: '🔴', otro: '💳' }
  const PAYMENT_COLORS: Record<string, { color: string; bg: string; border: string }> = {
    efectivo: { color: '#00ff94', bg: '#00ff940d', border: '#00ff9422' },
    transferencia: { color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22' },
    nequi: { color: '#a78bfa', bg: '#a78bfa0d', border: '#a78bfa22' },
    daviplata: { color: '#ff4d4d', bg: '#ff4d4d0d', border: '#ff4d4d22' },
    otro: { color: '#ffb547', bg: '#ffb5470d', border: '#ffb54722' },
  }
  const totalVentas = salesByPayment.reduce((acc, s) => acc + s.total, 0)
  const PERIOD_LABELS: Record<PeriodFilter, string> = { todo: 'Todo', mes: 'Mes', semana: 'Semana', personalizado: 'Fechas' }
  const egresoCategories = ['compra_inventario', 'impresion', 'imprevisto', 'retiro', 'otro']
  const ingresoCategories = ['venta', 'otro']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? '24px' : '32px', fontWeight: 900 }} className="taply-gradient-text">Flujo de Caja</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>Ingresos, egresos e imprevistos</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleExportCSV} disabled={flows.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
            <Download size={14} /> CSV
          </button>
          <button onClick={() => { setShowForm(!showForm); setMessage(null) }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: 'none',
              background: showForm ? '#1f1f1f' : 'linear-gradient(90deg, #00cfff, #00ff94)', color: showForm ? '#9ca3af' : '#0d0d0d' }}>
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Cancelar' : 'Nuevo'}
          </button>
        </div>
      </div>

      {/* Selector período */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '10px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
          {(['todo', 'mes', 'semana', 'personalizado'] as PeriodFilter[]).map(p => (
            <button key={p} onClick={() => setPeriodFilter(p)}
              style={{ flex: 1, padding: '8px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none',
                backgroundColor: periodFilter === p ? '#00cfff0d' : 'transparent', color: periodFilter === p ? '#00cfff' : '#6b7280' }}>
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
        {periodFilter === 'personalizado' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Calendar size={14} style={{ color: '#6b7280' }} />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#161616', border: '1px solid #2a2a2a', color: '#f0f0f0' }} />
            <span style={{ color: '#6b7280', fontSize: '12px' }}>—</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#161616', border: '1px solid #2a2a2a', color: '#f0f0f0' }} />
          </div>
        )}
      </div>

      {/* KPIs — 1 columna en móvil */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '16px' }}>
        {[
          { label: 'Total Ingresos', value: formatCOP(totalIngresos), color: '#00ff94', bg: '#00ff940d', border: '#00ff9422', icon: TrendingUp },
          { label: 'Total Egresos', value: formatCOP(totalEgresos), color: '#ff4d4d', bg: '#ff4d4d0d', border: '#ff4d4d22', icon: TrendingDown },
          { label: 'Balance Neto', value: formatCOP(balance), color: balance >= 0 ? '#00cfff' : '#ff4d4d', bg: balance >= 0 ? '#00cfff0d' : '#ff4d4d0d', border: balance >= 0 ? '#00cfff22' : '#ff4d4d22', icon: Wallet },
        ].map(({ label, value, color, bg, border, icon: Icon }) => (
          <div key={label} style={{ borderRadius: '14px', padding: '20px', backgroundColor: bg, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Icon size={18} style={{ color }} />
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>{label}</span>
            </div>
            <p style={{ margin: 0, fontSize: isMobile ? '24px' : '28px', fontWeight: 900, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Desglose por medio de pago */}
      {salesByPayment.length > 0 && (
        <div style={{ borderRadius: '16px', padding: '20px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#f0f0f0' }}>💳 Ingresos por Medio de Pago</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: '10px' }}>
            {['efectivo', 'transferencia', 'nequi', 'daviplata', 'otro'].map(method => {
              const data = salesByPayment.find(s => s.payment_method === method)
              const pc = PAYMENT_COLORS[method]
              const pct = totalVentas > 0 && data ? Math.round((data.total / totalVentas) * 100) : 0
              return (
                <div key={method} style={{ borderRadius: '12px', padding: '14px', backgroundColor: data ? pc.bg : '#0d0d0d', border: `1px solid ${data ? pc.border : '#1f1f1f'}` }}>
                  <div style={{ fontSize: '18px', marginBottom: '6px' }}>{PAYMENT_ICONS[method]}</div>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: data ? pc.color : '#374151' }}>{PAYMENT_METHOD_LABELS[method]}</p>
                  <p style={{ margin: '4px 0 2px', fontSize: '15px', fontWeight: 900, color: data ? pc.color : '#374151' }}>{data ? formatCOP(data.total) : '$0'}</p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>{data ? `${data.count} vta${data.count !== 1 ? 's' : ''} · ${pct}%` : '—'}</p>
                  {data && <div style={{ marginTop: '6px', height: '3px', borderRadius: '2px', backgroundColor: '#2a2a2a' }}><div style={{ height: '100%', width: `${pct}%`, backgroundColor: pc.color, borderRadius: '2px' }} /></div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div style={{ borderRadius: '16px', padding: '24px', backgroundColor: '#161616', border: '1px solid #1f1f1f', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>Registrar Movimiento</h2>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Tipo</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['ingreso', 'egreso'] as const).map(t => (
                <button key={t} onClick={() => setForm(p => ({ ...p, type: t, category: 'otro' }))}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    backgroundColor: form.type === t ? (t === 'ingreso' ? '#00ff940d' : '#ff4d4d0d') : '#0d0d0d',
                    border: form.type === t ? `1px solid ${t === 'ingreso' ? '#00ff9433' : '#ff4d4d33'}` : '1px solid #2a2a2a',
                    color: form.type === t ? (t === 'ingreso' ? '#00ff94' : '#ff4d4d') : '#6b7280' }}>
                  {t === 'ingreso' ? '↑ Ingreso' : '↓ Egreso'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Categoría</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }}>
              {(form.type === 'egreso' ? egresoCategories : ingresoCategories).map(cat => <option key={cat} value={cat}>{CASH_FLOW_CATEGORY_LABELS[cat]}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Descripción *</label>
            <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Ej: Compra de tarjetas al proveedor"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Monto (COP) *</label>
            <input type="number" min="1" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="Ej: 40000"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
          </div>
          {message && <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', backgroundColor: message.type === 'success' ? '#00ff940d' : '#ff4d4d0d', border: `1px solid ${message.type === 'success' ? '#00ff9422' : '#ff4d4d22'}`, color: message.type === 'success' ? '#00ff94' : '#ff4d4d' }}>{message.text}</div>}
          <button onClick={handleSubmit} disabled={saving}
            style={{ padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', border: 'none', background: saving ? '#2a2a2a' : 'linear-gradient(90deg, #00cfff, #00ff94)', color: saving ? '#6b7280' : '#0d0d0d', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Guardando...' : 'Registrar Movimiento'}
          </button>
        </div>
      )}

      {/* Tabla */}
      <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #1f1f1f' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: isMobile ? '480px' : 'auto' }}>
            <thead>
              <tr style={{ backgroundColor: '#161616', borderBottom: '1px solid #1f1f1f' }}>
                {['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(3)].map((_, i) => <tr key={i}>{[...Array(5)].map((_, j) => <td key={j} style={{ padding: '12px 16px' }}><div style={{ height: '14px', borderRadius: '6px', backgroundColor: '#1f1f1f' }} /></td>)}</tr>)
                : flows.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#4b5563' }}>
                    <Wallet size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                    {periodFilter !== 'todo' ? 'No hay movimientos en este período.' : 'Sin movimientos registrados.'}
                  </td></tr>
                ) : flows.map((flow, i) => (
                  <tr key={flow.id} style={{ backgroundColor: i % 2 === 0 ? '#0d0d0d' : '#111111', borderBottom: '1px solid #161616' }}>
                    <td style={{ padding: '12px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDateTime(flow.flow_date)}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, backgroundColor: flow.type === 'ingreso' ? '#00ff940d' : '#ff4d4d0d', color: flow.type === 'ingreso' ? '#00ff94' : '#ff4d4d' }}>
                        {flow.type === 'ingreso' ? '↑' : '↓'} {flow.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{CASH_FLOW_CATEGORY_LABELS[flow.category] ?? flow.category}</td>
                    <td style={{ padding: '12px 16px', color: '#f0f0f0' }}>{flow.description}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: flow.type === 'ingreso' ? '#00ff94' : '#ff4d4d', whiteSpace: 'nowrap' }}>
                      {flow.type === 'ingreso' ? '+' : '-'}{formatCOP(flow.amount)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
