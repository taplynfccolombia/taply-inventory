'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { CashFlow } from '@/lib/supabase'
import { formatCOP, formatDateTime, CASH_FLOW_CATEGORY_LABELS, PAYMENT_METHOD_LABELS, exportToCSV } from '@/lib/utils'
import { Wallet, Plus, X, TrendingUp, TrendingDown, Download } from 'lucide-react'

interface SaleByPayment {
  payment_method: string
  total: number
  count: number
}

export default function FlujoCajaPage() {
  const [flows, setFlows] = useState<CashFlow[]>([])
  const [salesByPayment, setSalesByPayment] = useState<SaleByPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState({
    type: 'egreso' as 'ingreso' | 'egreso',
    category: 'otro',
    description: '',
    amount: '',
  })

  async function fetchData() {
    const [flowsRes, salesRes] = await Promise.all([
      supabase.from('cash_flow').select('*').order('flow_date', { ascending: false }),
      supabase.from('sales').select('payment_method, total_revenue').eq('status', 'completada'),
    ])
    setFlows(flowsRes.data ?? [])
    const salesData = salesRes.data ?? []
    const grouped: Record<string, { total: number; count: number }> = {}
    salesData.forEach(s => {
      if (!grouped[s.payment_method]) grouped[s.payment_method] = { total: 0, count: 0 }
      grouped[s.payment_method].total += Number(s.total_revenue)
      grouped[s.payment_method].count += 1
    })
    setSalesByPayment(Object.entries(grouped).map(([method, data]) => ({ payment_method: method, ...data })).sort((a, b) => b.total - a.total))
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const totalIngresos = flows.filter(f => f.type === 'ingreso').reduce((acc, f) => acc + Number(f.amount), 0)
  const totalEgresos = flows.filter(f => f.type === 'egreso').reduce((acc, f) => acc + Number(f.amount), 0)
  const balance = totalIngresos - totalEgresos

  async function handleSubmit() {
    if (!form.description.trim()) { setMessage({ type: 'error', text: 'La descripción es obligatoria.' }); return }
    if (!form.amount || Number(form.amount) <= 0) { setMessage({ type: 'error', text: 'El monto debe ser mayor a 0.' }); return }
    setSaving(true); setMessage(null)
    const { error } = await supabase.from('cash_flow').insert([{
      type: form.type, category: form.category,
      description: form.description.trim(), amount: Number(form.amount),
    }])
    if (error) { setMessage({ type: 'error', text: 'Error al guardar el movimiento.' }) }
    else {
      setMessage({ type: 'success', text: 'Movimiento registrado exitosamente.' })
      setForm({ type: 'egreso', category: 'otro', description: '', amount: '' })
      setShowForm(false); fetchData()
    }
    setSaving(false)
  }

  function handleExportCSV() {
    const data = flows.map(f => ({
      Fecha: formatDateTime(f.flow_date),
      Tipo: f.type === 'ingreso' ? 'Ingreso' : 'Egreso',
      Categoría: CASH_FLOW_CATEGORY_LABELS[f.category] ?? f.category,
      Descripción: f.description,
      'Monto (COP)': f.type === 'ingreso' ? Number(f.amount) : -Number(f.amount),
    }))
    exportToCSV(data, 'Taply_FlujoCaja')
  }

  const egresoCategories = ['compra_inventario', 'impresion', 'imprevisto', 'retiro', 'otro']
  const ingresoCategories = ['venta', 'otro']
  const categories = form.type === 'egreso' ? egresoCategories : ingresoCategories

  const PAYMENT_ICONS: Record<string, string> = { efectivo: '💵', transferencia: '🏦', nequi: '🟣', daviplata: '🔴', otro: '💳' }
  const PAYMENT_COLORS: Record<string, { color: string; bg: string; border: string }> = {
    efectivo:      { color: '#00ff94', bg: '#00ff940d', border: '#00ff9422' },
    transferencia: { color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22' },
    nequi:         { color: '#a78bfa', bg: '#a78bfa0d', border: '#a78bfa22' },
    daviplata:     { color: '#ff4d4d', bg: '#ff4d4d0d', border: '#ff4d4d22' },
    otro:          { color: '#ffb547', bg: '#ffb5470d', border: '#ffb54722' },
  }
  const totalVentas = salesByPayment.reduce((acc, s) => acc + s.total, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }} className="taply-gradient-text">Flujo de Caja</h1>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>Registro de ingresos, egresos e imprevistos</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} disabled={flows.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', borderRadius: '12px', fontWeight: 600, fontSize: '13px', cursor: flows.length === 0 ? 'not-allowed' : 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
            <Download size={15} /> CSV
          </button>
          <button onClick={() => { setShowForm(!showForm); setMessage(null) }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none',
              background: showForm ? '#1f1f1f' : 'linear-gradient(90deg, #00cfff, #00ff94)',
              color: showForm ? '#9ca3af' : '#0d0d0d' }}>
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancelar' : 'Nuevo Movimiento'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        {[
          { label: 'Total Ingresos', value: formatCOP(totalIngresos), color: '#00ff94', bg: '#00ff940d', border: '#00ff9422', icon: TrendingUp },
          { label: 'Total Egresos',  value: formatCOP(totalEgresos),  color: '#ff4d4d', bg: '#ff4d4d0d', border: '#ff4d4d22', icon: TrendingDown },
          { label: 'Balance Neto',   value: formatCOP(balance),
            color: balance >= 0 ? '#00cfff' : '#ff4d4d',
            bg:    balance >= 0 ? '#00cfff0d' : '#ff4d4d0d',
            border:balance >= 0 ? '#00cfff22' : '#ff4d4d22', icon: Wallet },
        ].map(({ label, value, color, bg, border, icon: Icon }) => (
          <div key={label} style={{ borderRadius: '16px', padding: '28px', backgroundColor: bg, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Icon size={20} style={{ color }} />
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>{label}</span>
            </div>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 900, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Desglose por medio de pago */}
      {salesByPayment.length > 0 && (
        <div style={{ borderRadius: '16px', padding: '24px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>💳 Ingresos por Medio de Pago</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            {['efectivo', 'transferencia', 'nequi', 'daviplata', 'otro'].map(method => {
              const data = salesByPayment.find(s => s.payment_method === method)
              const pc = PAYMENT_COLORS[method]
              const pct = totalVentas > 0 && data ? Math.round((data.total / totalVentas) * 100) : 0
              return (
                <div key={method} style={{ borderRadius: '12px', padding: '16px', backgroundColor: data ? pc.bg : '#0d0d0d', border: `1px solid ${data ? pc.border : '#1f1f1f'}` }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>{PAYMENT_ICONS[method]}</div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: data ? pc.color : '#374151' }}>{PAYMENT_METHOD_LABELS[method]}</p>
                  <p style={{ margin: '6px 0 2px', fontSize: '18px', fontWeight: 900, color: data ? pc.color : '#374151' }}>{data ? formatCOP(data.total) : '$0'}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>{data ? `${data.count} venta${data.count !== 1 ? 's' : ''} · ${pct}%` : 'Sin ventas'}</p>
                  {data && totalVentas > 0 && (
                    <div style={{ marginTop: '8px', height: '4px', borderRadius: '2px', backgroundColor: '#2a2a2a', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, backgroundColor: pc.color, borderRadius: '2px', transition: 'width 0.5s ease' }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div style={{ borderRadius: '16px', padding: '32px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 700, color: '#f0f0f0' }}>Registrar Movimiento</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px' }}>Tipo</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {(['ingreso', 'egreso'] as const).map(t => (
                  <button key={t} onClick={() => setForm(p => ({ ...p, type: t, category: 'otro' }))}
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                      backgroundColor: form.type === t ? (t === 'ingreso' ? '#00ff940d' : '#ff4d4d0d') : '#0d0d0d',
                      border: form.type === t ? `1px solid ${t === 'ingreso' ? '#00ff9433' : '#ff4d4d33'}` : '1px solid #2a2a2a',
                      color: form.type === t ? (t === 'ingreso' ? '#00ff94' : '#ff4d4d') : '#6b7280' }}>
                    {t === 'ingreso' ? '↑ Ingreso' : '↓ Egreso'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px' }}>Categoría</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }}>
                {categories.map(cat => <option key={cat} value={cat}>{CASH_FLOW_CATEGORY_LABELS[cat]}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px' }}>Descripción *</label>
              <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Ej: Compra de 20 tarjetas al proveedor"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px' }}>Monto (COP) *</label>
              <input type="number" min="1" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                placeholder="Ej: 40000"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
            </div>
          </div>
          {message && (
            <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '10px', fontSize: '14px',
              backgroundColor: message.type === 'success' ? '#00ff940d' : '#ff4d4d0d',
              border: `1px solid ${message.type === 'success' ? '#00ff9422' : '#ff4d4d22'}`,
              color: message.type === 'success' ? '#00ff94' : '#ff4d4d' }}>
              {message.text}
            </div>
          )}
          <button onClick={handleSubmit} disabled={saving}
            style={{ marginTop: '24px', padding: '12px 32px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', border: 'none',
              background: saving ? '#2a2a2a' : 'linear-gradient(90deg, #00cfff, #00ff94)',
              color: saving ? '#6b7280' : '#0d0d0d', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Guardando...' : 'Registrar Movimiento'}
          </button>
        </div>
      )}

      {/* Tabla */}
      <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #1f1f1f' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#161616', borderBottom: '1px solid #1f1f1f' }}>
              {['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '16px 20px', fontWeight: 600, color: '#6b7280' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #161616' }}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} style={{ padding: '16px 20px' }}>
                      <div style={{ height: '16px', borderRadius: '6px', backgroundColor: '#1f1f1f' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : flows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#4b5563' }}>
                  <Wallet size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                  Aún no hay movimientos registrados.
                </td>
              </tr>
            ) : (
              flows.map((flow, i) => (
                <tr key={flow.id} style={{ backgroundColor: i % 2 === 0 ? '#0d0d0d' : '#111111', borderBottom: '1px solid #161616' }}>
                  <td style={{ padding: '16px 20px', color: '#6b7280' }}>{formatDateTime(flow.flow_date)}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                      backgroundColor: flow.type === 'ingreso' ? '#00ff940d' : '#ff4d4d0d',
                      color: flow.type === 'ingreso' ? '#00ff94' : '#ff4d4d' }}>
                      {flow.type === 'ingreso' ? '↑ Ingreso' : '↓ Egreso'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#9ca3af' }}>{CASH_FLOW_CATEGORY_LABELS[flow.category] ?? flow.category}</td>
                  <td style={{ padding: '16px 20px', color: '#f0f0f0' }}>{flow.description}</td>
                  <td style={{ padding: '16px 20px', fontWeight: 700, color: flow.type === 'ingreso' ? '#00ff94' : '#ff4d4d' }}>
                    {flow.type === 'ingreso' ? '+' : '-'}{formatCOP(flow.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
