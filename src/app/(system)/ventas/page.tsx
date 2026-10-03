'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Sale } from '@/lib/supabase'
import { PRODUCT_CONFIG } from '@/lib/supabase'
import { formatCOP, formatDateTime, PAYMENT_METHOD_LABELS, SALE_STATUS_LABELS, exportToCSV } from '@/lib/utils'
import { useIsMobile } from '@/lib/hooks'
import { ShoppingCart, Plus, X, Ban, Download, Search } from 'lucide-react'

interface ClientBasic { id: string; full_name: string; company: string | null }

export default function VentasPage() {
  const isMobile = useIsMobile()
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
  const [search, setSearch] = useState('')
  const [filterProduct, setFilterProduct] = useState<'todos' | 'essential' | 'custom'>('todos')
  const [filterPayment, setFilterPayment] = useState<string>('todos')

  const [form, setForm] = useState({
    client_id: '', product_type: 'essential' as 'essential' | 'custom', quantity: '1',
    payment_method: 'efectivo' as 'efectivo' | 'transferencia' | 'nequi' | 'daviplata' | 'otro',
    status: 'completada' as 'completada' | 'pendiente' | 'cancelada', notes: '',
  })

  async function fetchData() {
    const [salesRes, clientsRes, inventoryRes] = await Promise.all([
      supabase.from('sales').select('*, client:clients(id, full_name, company)').order('sale_date', { ascending: false }),
      supabase.from('clients').select('id, full_name, company').order('full_name'),
      supabase.from('inventory').select('quantity').eq('item_name', 'Tarjeta Negra Matte Base').single(),
    ])
    setSales(salesRes.data ?? []); setClients((clientsRes.data ?? []) as ClientBasic[]); setStockQty(inventoryRes.data?.quantity ?? 0); setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const selectedProduct = PRODUCT_CONFIG[form.product_type]
  const totalRevenue = selectedProduct.unit_price * Number(form.quantity)
  const totalCost = selectedProduct.unit_cost * Number(form.quantity)
  const totalProfit = totalRevenue - totalCost

  async function handleSubmit() {
    const qty = Number(form.quantity)
    if (qty <= 0) { setMessage({ type: 'error', text: 'La cantidad debe ser mayor a 0.' }); return }
    if (form.status === 'completada' && qty > stockQty) { setMessage({ type: 'error', text: `Stock insuficiente. Solo hay ${stockQty} unidades.` }); return }
    setSaving(true); setMessage(null)
    const { error } = await supabase.from('sales').insert([{ client_id: form.client_id || null, product_type: form.product_type, quantity: qty, unit_price: selectedProduct.unit_price, unit_cost: selectedProduct.unit_cost, payment_method: form.payment_method, status: form.status, notes: form.notes.trim() || null }])
    if (error) { setMessage({ type: 'error', text: `Error: ${error.message}` }) }
    else { setMessage({ type: 'success', text: 'Venta registrada exitosamente.' }); setForm({ client_id: '', product_type: 'essential', quantity: '1', payment_method: 'efectivo', status: 'completada', notes: '' }); setShowForm(false); fetchData() }
    setSaving(false)
  }

  async function handleCancel(saleId: string) {
    setCancellingId(saleId)
    const { error } = await supabase.from('sales').update({ status: 'cancelada' }).eq('id', saleId)
    if (error) { setMessage({ type: 'error', text: 'Error al cancelar.' }) }
    else { setMessage({ type: 'success', text: 'Venta cancelada y stock restaurado.' }); fetchData() }
    setCancellingId(null); setConfirmCancel(null)
  }

  async function handleMarkCompleted(saleId: string) {
    const { error } = await supabase.from('sales').update({ status: 'completada' }).eq('id', saleId)
    if (error) { setMessage({ type: 'error', text: 'Error al marcar como cobrada.' }) }
    else { setMessage({ type: 'success', text: '¡Venta marcada como cobrada!' }); fetchData() }
  }

  const pendingSales = sales.filter(s => s.status === 'pendiente')
  const pendingRevenue = pendingSales.reduce((acc, s) => acc + Number(s.total_revenue), 0)
  const baseSales = activeTab === 'pendientes' ? pendingSales : sales
  const filteredSales = baseSales.filter(s => {
    const clientData = s.client as unknown as ClientBasic | null
    const matchSearch = search === '' || (clientData?.full_name ?? '').toLowerCase().includes(search.toLowerCase()) || PRODUCT_CONFIG[s.product_type].label.toLowerCase().includes(search.toLowerCase()) || (s.notes ?? '').toLowerCase().includes(search.toLowerCase())
    const matchProduct = filterProduct === 'todos' || s.product_type === filterProduct
    const matchPayment = filterPayment === 'todos' || s.payment_method === filterPayment
    return matchSearch && matchProduct && matchPayment
  })
  const totalFilteredRevenue = filteredSales.filter(s => s.status === 'completada').reduce((acc, s) => acc + Number(s.total_revenue), 0)
  const totalFilteredProfit = filteredSales.filter(s => s.status === 'completada').reduce((acc, s) => acc + Number(s.total_profit), 0)

  function handleExportCSV() {
    exportToCSV(filteredSales.map(s => ({ Fecha: formatDateTime(s.sale_date), Producto: PRODUCT_CONFIG[s.product_type].label, Cliente: (s.client as unknown as ClientBasic)?.full_name ?? '—', Cantidad: s.quantity, 'Ingreso (COP)': s.total_revenue, 'Costo (COP)': s.total_cost, 'Ganancia (COP)': s.total_profit, 'Método de Pago': PAYMENT_METHOD_LABELS[s.payment_method], Estado: SALE_STATUS_LABELS[s.status], Notas: s.notes ?? '' })), 'Taply_Ventas')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? '24px' : '32px', fontWeight: 900 }} className="taply-gradient-text">Ventas</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
            {sales.filter(s => s.status === 'completada').length} completadas · <span style={{ color: stockQty < 5 ? '#ff4d4d' : '#00ff94' }}>{stockQty < 5 ? '⚠ ' : ''}Stock: {stockQty} uds</span>
            {pendingSales.length > 0 && <span style={{ color: '#ffb547' }}> · ⚠ {pendingSales.length} pendiente{pendingSales.length !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleExportCSV} disabled={filteredSales.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
            <Download size={14} /> CSV
          </button>
          <button onClick={() => { setShowForm(!showForm); setMessage(null) }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: 'none',
              background: showForm ? '#1f1f1f' : 'linear-gradient(90deg, #00cfff, #00ff94)', color: showForm ? '#9ca3af' : '#0d0d0d' }}>
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Cancelar' : isMobile ? 'Nueva' : 'Nueva Venta'}
          </button>
        </div>
      </div>

      {/* Alertas */}
      {stockQty === 0 && <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#ff4d4d0d', border: '1px solid #ff4d4d22', fontSize: '13px', color: '#ff4d4d', fontWeight: 600 }}>🚨 Sin stock disponible. Reabastecer en Inventario antes de registrar ventas.</div>}
      {stockQty > 0 && stockQty < 5 && <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#ffb5470d', border: '1px solid #ffb54722', fontSize: '13px', color: '#ffb547', fontWeight: 600 }}>⚠ Stock bajo: {stockQty} unidad{stockQty !== 1 ? 'es' : ''}.</div>}
      {pendingSales.length > 0 && activeTab === 'todas' && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#ffb5470d', border: '1px solid #ffb54722', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#ffb547', fontWeight: 600 }}>⚠ {pendingSales.length} cobro{pendingSales.length !== 1 ? 's' : ''} por {formatCOP(pendingRevenue)}</span>
          <button onClick={() => setActiveTab('pendientes')} style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none', backgroundColor: '#ffb547', color: '#0d0d0d', whiteSpace: 'nowrap' }}>Ver</button>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div style={{ borderRadius: '16px', padding: '20px', backgroundColor: '#161616', border: '1px solid #1f1f1f', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>Nueva Venta</h2>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '7px' }}>Producto</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['essential', 'custom'] as const).map(type => (
                <button key={type} onClick={() => setForm(p => ({ ...p, product_type: type }))}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', backgroundColor: form.product_type === type ? '#00cfff0d' : '#0d0d0d', border: form.product_type === type ? '1px solid #00cfff33' : '1px solid #2a2a2a', color: form.product_type === type ? '#00cfff' : '#6b7280' }}>
                  {PRODUCT_CONFIG[type].label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '7px' }}>Cantidad</label>
              <input type="number" min="1" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '7px' }}>Estado</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as typeof form.status }))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }}>
                {Object.entries(SALE_STATUS_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '7px' }}>Cliente (opcional)</label>
            <select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }}>
              <option value="">— Sin cliente —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}{c.company ? ` · ${c.company}` : ''}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '7px' }}>Método de pago</label>
            <select value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value as typeof form.payment_method }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }}>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
          </div>
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {[{ label: 'Ingreso', value: formatCOP(totalRevenue), color: '#00cfff' }, { label: 'Costo', value: formatCOP(totalCost), color: '#ff4d4d' }, { label: 'Ganancia', value: formatCOP(totalProfit), color: '#00ff94' }].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 3px', fontSize: '11px', color: '#6b7280' }}>{label}</p>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 900, color }}>{value}</p>
              </div>
            ))}
          </div>
          {message && showForm && <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', backgroundColor: message.type === 'success' ? '#00ff940d' : '#ff4d4d0d', border: `1px solid ${message.type === 'success' ? '#00ff9422' : '#ff4d4d22'}`, color: message.type === 'success' ? '#00ff94' : '#ff4d4d' }}>{message.text}</div>}
          <button onClick={handleSubmit} disabled={saving}
            style={{ padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', border: 'none', background: saving ? '#2a2a2a' : 'linear-gradient(90deg, #00cfff, #00ff94)', color: saving ? '#6b7280' : '#0d0d0d', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Guardando...' : 'Registrar Venta'}
          </button>
        </div>
      )}

      {message && !showForm && <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', backgroundColor: message.type === 'success' ? '#00ff940d' : '#ff4d4d0d', border: `1px solid ${message.type === 'success' ? '#00ff9422' : '#ff4d4d22'}`, color: message.type === 'success' ? '#00ff94' : '#ff4d4d' }}>{message.text}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '10px', backgroundColor: '#161616', border: '1px solid #1f1f1f', alignSelf: 'flex-start' }}>
        {([['todas', 'Todas'], ['pendientes', `Pendientes${pendingSales.length > 0 ? ` (${pendingSales.length})` : ''}`]] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '8px 16px', borderRadius: '7px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: activeTab === tab ? (tab === 'pendientes' ? '#ffb5470d' : '#00cfff0d') : 'transparent', color: activeTab === tab ? (tab === 'pendientes' ? '#ffb547' : '#00cfff') : '#6b7280' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '160px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
            style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#161616', border: '1px solid #1f1f1f', color: '#f0f0f0', boxSizing: 'border-box' }} />
        </div>
        <select value={filterProduct} onChange={e => setFilterProduct(e.target.value as typeof filterProduct)}
          style={{ padding: '9px 12px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#161616', border: '1px solid #1f1f1f', color: '#f0f0f0' }}>
          <option value="todos">Todos</option>
          <option value="essential">Essential</option>
          <option value="custom">Custom</option>
        </select>
        <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#161616', border: '1px solid #1f1f1f', color: '#f0f0f0' }}>
          <option value="todos">Todos los métodos</option>
          {Object.entries(PAYMENT_METHOD_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
        </select>
        {(search || filterProduct !== 'todos' || filterPayment !== 'todos') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>{filteredSales.length} · {formatCOP(totalFilteredRevenue)} · G: {formatCOP(totalFilteredProfit)}</span>
            <button onClick={() => { setSearch(''); setFilterProduct('todos'); setFilterPayment('todos') }}
              style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #2a2a2a', color: '#6b7280' }}>
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Tabla con scroll horizontal */}
      <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #1f1f1f' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: isMobile ? '600px' : 'auto' }}>
            <thead>
              <tr style={{ backgroundColor: '#161616', borderBottom: '1px solid #1f1f1f' }}>
                {['Fecha', 'Producto', 'Cliente', 'Cant.', 'Ingreso', 'Ganancia', 'Pago', 'Estado', ''].map((h, i) => (
                  <th key={i} style={{ textAlign: 'left', padding: '12px 14px', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(3)].map((_, i) => <tr key={i}>{[...Array(9)].map((_, j) => <td key={j} style={{ padding: '12px 14px' }}><div style={{ height: '14px', borderRadius: '6px', backgroundColor: '#1f1f1f' }} /></td>)}</tr>)
                : filteredSales.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#4b5563' }}>
                    <ShoppingCart size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                    {activeTab === 'pendientes' ? '¡No hay cobros pendientes!' : 'Sin ventas registradas.'}
                  </td></tr>
                ) : filteredSales.map((sale, i) => {
                  const clientData = sale.client as unknown as ClientBasic | null
                  return (
                    <tr key={sale.id} style={{ backgroundColor: i % 2 === 0 ? '#0d0d0d' : '#111111', borderBottom: '1px solid #161616', opacity: sale.status === 'cancelada' ? 0.5 : 1 }}>
                      <td style={{ padding: '12px 14px', color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDateTime(sale.sale_date)}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#00cfff', whiteSpace: 'nowrap' }}>{PRODUCT_CONFIG[sale.product_type].label}</td>
                      <td style={{ padding: '12px 14px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{clientData?.full_name ?? '—'}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#f0f0f0' }}>{sale.quantity}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#00cfff', whiteSpace: 'nowrap' }}>{formatCOP(sale.total_revenue)}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#00ff94', whiteSpace: 'nowrap' }}>{formatCOP(sale.total_profit)}</td>
                      <td style={{ padding: '12px 14px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{PAYMENT_METHOD_LABELS[sale.payment_method]}</td>
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, backgroundColor: sale.status === 'completada' ? '#00ff940d' : sale.status === 'pendiente' ? '#ffb5470d' : '#ff4d4d0d', color: sale.status === 'completada' ? '#00ff94' : sale.status === 'pendiente' ? '#ffb547' : '#ff4d4d' }}>
                          {SALE_STATUS_LABELS[sale.status]}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                          {sale.status === 'pendiente' && (
                            <button onClick={() => handleMarkCompleted(sale.id)} title="Marcar cobrada"
                              style={{ padding: '5px 8px', borderRadius: '7px', cursor: 'pointer', backgroundColor: '#00ff940d', border: '1px solid #00ff9422', color: '#00ff94', fontSize: '12px', fontWeight: 700 }}>✓</button>
                          )}
                          {sale.status !== 'cancelada' && (
                            confirmCancel === sale.id ? (
                              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                <button onClick={() => handleCancel(sale.id)} disabled={cancellingId === sale.id}
                                  style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: '#ffb547', color: '#0d0d0d' }}>
                                  {cancellingId === sale.id ? '...' : 'Sí'}
                                </button>
                                <button onClick={() => setConfirmCancel(null)}
                                  style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>No</button>
                              </div>
                            ) : (
                              <button onClick={() => setConfirmCancel(sale.id)}
                                style={{ padding: '5px', borderRadius: '7px', cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #1f1f1f', color: '#374151', display: 'flex', alignItems: 'center' }}
                                onMouseEnter={e => { (e.currentTarget).style.color = '#ffb547' }}
                                onMouseLeave={e => { (e.currentTarget).style.color = '#374151' }}>
                                <Ban size={13} />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
