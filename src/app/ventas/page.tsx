'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Sale } from '@/lib/supabase'
import { PRODUCT_CONFIG } from '@/lib/supabase'
import { formatCOP, formatDateTime, PAYMENT_METHOD_LABELS, SALE_STATUS_LABELS, exportToCSV } from '@/lib/utils'
import { ShoppingCart, Plus, X, Ban, Download } from 'lucide-react'

interface ClientBasic {
  id: string
  full_name: string
  company: string | null
}

export default function VentasPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [clients, setClients] = useState<ClientBasic[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [stockQty, setStockQty] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'todas' | 'pendientes'>('todas')

  const [form, setForm] = useState({
    client_id: '',
    product_type: 'essential' as 'essential' | 'custom',
    quantity: '1',
    payment_method: 'efectivo' as 'efectivo' | 'transferencia' | 'nequi' | 'daviplata' | 'otro',
    status: 'completada' as 'completada' | 'pendiente' | 'cancelada',
    notes: '',
  })

  async function fetchData() {
    const [salesRes, clientsRes, inventoryRes] = await Promise.all([
      supabase.from('sales').select('*, client:clients(id, full_name, company)').order('sale_date', { ascending: false }),
      supabase.from('clients').select('id, full_name, company').order('full_name'),
      supabase.from('inventory').select('quantity').eq('item_name', 'Tarjeta Negra Matte Base').single(),
    ])
    setSales(salesRes.data ?? [])
    setClients((clientsRes.data ?? []) as ClientBasic[])
    setStockQty(inventoryRes.data?.quantity ?? 0)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const selectedProduct = PRODUCT_CONFIG[form.product_type]
  const totalRevenue = selectedProduct.unit_price * Number(form.quantity)
  const totalCost = selectedProduct.unit_cost * Number(form.quantity)
  const totalProfit = totalRevenue - totalCost

  async function handleSubmit() {
    const qty = Number(form.quantity)
    if (qty <= 0) { setMessage({ type: 'error', text: 'La cantidad debe ser mayor a 0.' }); return }
    if (form.status === 'completada' && qty > stockQty) {
      setMessage({ type: 'error', text: `Stock insuficiente. Solo hay ${stockQty} unidades.` }); return
    }
    setSaving(true); setMessage(null)
    const { error } = await supabase.from('sales').insert([{
      client_id: form.client_id || null,
      product_type: form.product_type,
      quantity: qty,
      unit_price: selectedProduct.unit_price,
      unit_cost: selectedProduct.unit_cost,
      payment_method: form.payment_method,
      status: form.status,
      notes: form.notes.trim() || null,
    }])
    if (error) { setMessage({ type: 'error', text: `Error: ${error.message}` }) }
    else {
      setMessage({ type: 'success', text: 'Venta registrada exitosamente.' })
      setForm({ client_id: '', product_type: 'essential', quantity: '1', payment_method: 'efectivo', status: 'completada', notes: '' })
      setShowForm(false); fetchData()
    }
    setSaving(false)
  }

  async function handleCancel(saleId: string) {
    setCancellingId(saleId)
    const { error } = await supabase.from('sales').update({ status: 'cancelada' }).eq('id', saleId)
    if (error) { setMessage({ type: 'error', text: 'Error al cancelar la venta.' }) }
    else { setMessage({ type: 'success', text: 'Venta cancelada y stock restaurado.' }); fetchData() }
    setCancellingId(null); setConfirmCancel(null)
  }

  async function handleMarkCompleted(saleId: string) {
    const { error } = await supabase.from('sales').update({ status: 'completada' }).eq('id', saleId)
    if (error) { setMessage({ type: 'error', text: 'Error al marcar como cobrada.' }) }
    else { setMessage({ type: 'success', text: '¡Venta marcada como cobrada!' }); fetchData() }
  }

  function handleExportCSV() {
    const data = sales.map(s => ({
      Fecha: formatDateTime(s.sale_date),
      Producto: PRODUCT_CONFIG[s.product_type].label,
      Cliente: (s.client as unknown as ClientBasic)?.full_name ?? '—',
      Cantidad: s.quantity,
      'Ingreso (COP)': s.total_revenue,
      'Costo (COP)': s.total_cost,
      'Ganancia (COP)': s.total_profit,
      'Método de Pago': PAYMENT_METHOD_LABELS[s.payment_method],
      Estado: SALE_STATUS_LABELS[s.status],
      Notas: s.notes ?? '',
    }))
    exportToCSV(data, 'Taply_Ventas')
  }

  const pendingSales = sales.filter(s => s.status === 'pendiente')
  const pendingRevenue = pendingSales.reduce((acc, s) => acc + Number(s.total_revenue), 0)
  const displaySales = activeTab === 'pendientes' ? pendingSales : sales

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }} className="taply-gradient-text">Ventas</h1>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>
            {sales.filter(s => s.status === 'completada').length} completadas
            {' · '}
            <span style={{ color: stockQty < 5 ? '#ff4d4d' : '#00ff94' }}>Stock: {stockQty} uds</span>
            {pendingSales.length > 0 && (
              <span style={{ color: '#ffb547', marginLeft: '8px' }}>
                · ⚠ {pendingSales.length} cobro{pendingSales.length !== 1 ? 's' : ''} pendiente{pendingSales.length !== 1 ? 's' : ''} ({formatCOP(pendingRevenue)})
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} disabled={sales.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', borderRadius: '12px', fontWeight: 600, fontSize: '13px', cursor: sales.length === 0 ? 'not-allowed' : 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
            <Download size={15} /> CSV
          </button>
          <button onClick={() => { setShowForm(!showForm); setMessage(null) }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none',
              background: showForm ? '#1f1f1f' : 'linear-gradient(90deg, #00cfff, #00ff94)',
              color: showForm ? '#9ca3af' : '#0d0d0d' }}>
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancelar' : 'Nueva Venta'}
          </button>
        </div>
      </div>

      {/* Alerta cobros pendientes */}
      {pendingSales.length > 0 && activeTab === 'todas' && (
        <div style={{ padding: '16px 20px', borderRadius: '12px', backgroundColor: '#ffb5470d', border: '1px solid #ffb54722', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#ffb547', fontWeight: 600 }}>
            ⚠ Tienes {pendingSales.length} venta{pendingSales.length !== 1 ? 's' : ''} pendiente{pendingSales.length !== 1 ? 's' : ''} de cobro por {formatCOP(pendingRevenue)}
          </span>
          <button onClick={() => setActiveTab('pendientes')}
            style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none', backgroundColor: '#ffb547', color: '#0d0d0d' }}>
            Ver pendientes
          </button>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div style={{ borderRadius: '16px', padding: '32px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 700, color: '#f0f0f0' }}>Registrar Nueva Venta</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px' }}>Producto</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {(['essential', 'custom'] as const).map(type => (
                  <button key={type} onClick={() => setForm(p => ({ ...p, product_type: type }))}
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                      backgroundColor: form.product_type === type ? '#00cfff0d' : '#0d0d0d',
                      border: form.product_type === type ? '1px solid #00cfff33' : '1px solid #2a2a2a',
                      color: form.product_type === type ? '#00cfff' : '#6b7280' }}>
                    {PRODUCT_CONFIG[type].label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px' }}>Cantidad</label>
              <input type="number" min="1" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px' }}>Cliente (opcional)</label>
              <select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }}>
                <option value="">— Sin cliente asignado —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}{c.company ? ` · ${c.company}` : ''}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px' }}>Método de pago</label>
              <select value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value as typeof form.payment_method }))}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }}>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px' }}>Estado</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as typeof form.status }))}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }}>
                {Object.entries(SALE_STATUS_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px' }}>Notas</label>
              <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Observaciones opcionales"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginTop: '24px', padding: '20px', borderRadius: '12px', backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {[
              { label: 'Ingreso',  value: formatCOP(totalRevenue), color: '#00cfff' },
              { label: 'Costo',    value: formatCOP(totalCost),    color: '#ff4d4d' },
              { label: 'Ganancia', value: formatCOP(totalProfit),  color: '#00ff94' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6b7280' }}>{label}</p>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: 900, color }}>{value}</p>
              </div>
            ))}
          </div>

          {message && showForm && (
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
            {saving ? 'Guardando...' : 'Registrar Venta'}
          </button>
        </div>
      )}

      {/* Mensaje global */}
      {message && !showForm && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '14px',
          backgroundColor: message.type === 'success' ? '#00ff940d' : '#ff4d4d0d',
          border: `1px solid ${message.type === 'success' ? '#00ff9422' : '#ff4d4d22'}`,
          color: message.type === 'success' ? '#00ff94' : '#ff4d4d' }}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '10px', backgroundColor: '#161616', border: '1px solid #1f1f1f', alignSelf: 'flex-start' }}>
        {([['todas', 'Todas las ventas'], ['pendientes', `Cobros pendientes ${pendingSales.length > 0 ? `(${pendingSales.length})` : ''}`]] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '8px 20px', borderRadius: '7px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none',
              backgroundColor: activeTab === tab ? (tab === 'pendientes' ? '#ffb5470d' : '#00cfff0d') : 'transparent',
              color: activeTab === tab ? (tab === 'pendientes' ? '#ffb547' : '#00cfff') : '#6b7280' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #1f1f1f' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#161616', borderBottom: '1px solid #1f1f1f' }}>
              {['Fecha', 'Producto', 'Cliente', 'Cant.', 'Ingreso', 'Ganancia', 'Pago', 'Estado', ''].map((h, i) => (
                <th key={i} style={{ textAlign: 'left', padding: '16px 20px', fontWeight: 600, color: '#6b7280' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #161616' }}>
                  {[...Array(9)].map((_, j) => (
                    <td key={j} style={{ padding: '16px 20px' }}>
                      <div style={{ height: '16px', borderRadius: '6px', backgroundColor: '#1f1f1f' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : displaySales.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: '#4b5563' }}>
                  <ShoppingCart size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                  {activeTab === 'pendientes' ? '¡No hay cobros pendientes!' : 'Aún no hay ventas registradas.'}
                </td>
              </tr>
            ) : (
              displaySales.map((sale, i) => {
                const clientData = sale.client as unknown as ClientBasic | null
                return (
                  <tr key={sale.id} style={{ backgroundColor: i % 2 === 0 ? '#0d0d0d' : '#111111', borderBottom: '1px solid #161616', opacity: sale.status === 'cancelada' ? 0.5 : 1 }}>
                    <td style={{ padding: '16px 20px', color: '#6b7280' }}>{formatDateTime(sale.sale_date)}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: '#00cfff' }}>{PRODUCT_CONFIG[sale.product_type].label}</td>
                    <td style={{ padding: '16px 20px', color: '#9ca3af' }}>{clientData?.full_name ?? '—'}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: '#f0f0f0' }}>{sale.quantity}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: '#00cfff' }}>{formatCOP(sale.total_revenue)}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: '#00ff94' }}>{formatCOP(sale.total_profit)}</td>
                    <td style={{ padding: '16px 20px', color: '#9ca3af' }}>{PAYMENT_METHOD_LABELS[sale.payment_method]}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                        backgroundColor: sale.status === 'completada' ? '#00ff940d' : sale.status === 'pendiente' ? '#ffb5470d' : '#ff4d4d0d',
                        color: sale.status === 'completada' ? '#00ff94' : sale.status === 'pendiente' ? '#ffb547' : '#ff4d4d' }}>
                        {SALE_STATUS_LABELS[sale.status]}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {sale.status === 'pendiente' ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleMarkCompleted(sale.id)} title="Marcar como cobrada"
                            style={{ padding: '6px', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#00ff940d', border: '1px solid #00ff9422', color: '#00ff94', display: 'flex', alignItems: 'center' }}>
                            ✓
                          </button>
                          {confirmCancel === sale.id ? (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <button onClick={() => handleCancel(sale.id)} disabled={cancellingId === sale.id}
                                style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: '#ffb547', color: '#0d0d0d' }}>
                                {cancellingId === sale.id ? '...' : 'Sí'}
                              </button>
                              <button onClick={() => setConfirmCancel(null)}
                                style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
                                No
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmCancel(sale.id)}
                              style={{ padding: '6px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #1f1f1f', color: '#374151', display: 'flex', alignItems: 'center' }}
                              onMouseEnter={e => { (e.currentTarget).style.backgroundColor = '#ffb5470d'; (e.currentTarget).style.color = '#ffb547' }}
                              onMouseLeave={e => { (e.currentTarget).style.backgroundColor = 'transparent'; (e.currentTarget).style.color = '#374151' }}>
                              <Ban size={15} />
                            </button>
                          )}
                        </div>
                      ) : sale.status === 'completada' ? (
                        confirmCancel === sale.id ? (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#ffb547' }}>¿Cancelar?</span>
                            <button onClick={() => handleCancel(sale.id)} disabled={cancellingId === sale.id}
                              style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: '#ffb547', color: '#0d0d0d' }}>
                              {cancellingId === sale.id ? '...' : 'Sí'}
                            </button>
                            <button onClick={() => setConfirmCancel(null)}
                              style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
                              No
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmCancel(sale.id)}
                            style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #1f1f1f', color: '#374151', display: 'flex', alignItems: 'center' }}
                            onMouseEnter={e => { (e.currentTarget).style.backgroundColor = '#ffb5470d'; (e.currentTarget).style.borderColor = '#ffb54722'; (e.currentTarget).style.color = '#ffb547' }}
                            onMouseLeave={e => { (e.currentTarget).style.backgroundColor = 'transparent'; (e.currentTarget).style.borderColor = '#1f1f1f'; (e.currentTarget).style.color = '#374151' }}>
                            <Ban size={15} />
                          </button>
                        )
                      ) : (
                        <span style={{ fontSize: '12px', color: '#374151' }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
