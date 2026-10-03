'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Client, Sale } from '@/lib/supabase'
import { PRODUCT_CONFIG } from '@/lib/supabase'
import { formatCOP, formatDate, formatDateTime, PAYMENT_METHOD_LABELS, SALE_STATUS_LABELS, generateWhatsAppLink, whatsAppSeguimientoMessage, whatsAppVentaMessage } from '@/lib/utils'
import { useIsMobile } from '@/lib/hooks'
import { ArrowLeft, User, ShoppingCart, TrendingUp, DollarSign, Ban, MessageCircle, Pencil, Check, X } from 'lucide-react'

export default function ClienteDetallePage() {
  const { id } = useParams()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [client, setClient] = useState<Client | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: '', email: '', phone: '', company: '', city: '', notes: '' })

  async function fetchData() {
    const [clientRes, salesRes] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('sales').select('*').eq('client_id', id).order('sale_date', { ascending: false }),
    ])
    setClient(clientRes.data); setSales(salesRes.data ?? [])
    if (clientRes.data) {
      setEditForm({ full_name: clientRes.data.full_name ?? '', email: clientRes.data.email ?? '', phone: clientRes.data.phone ?? '', company: clientRes.data.company ?? '', city: clientRes.data.city ?? '', notes: clientRes.data.notes ?? '' })
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [id])

  async function handleSaveEdit() {
    if (!editForm.full_name.trim()) { setMessage({ type: 'error', text: 'El nombre es obligatorio.' }); return }
    setSaving(true); setMessage(null)
    const { error } = await supabase.from('clients').update({ full_name: editForm.full_name.trim(), email: editForm.email.trim() || null, phone: editForm.phone.trim() || null, company: editForm.company.trim() || null, city: editForm.city.trim() || null, notes: editForm.notes.trim() || null }).eq('id', id)
    if (error) { setMessage({ type: 'error', text: 'Error al guardar.' }) }
    else { setMessage({ type: 'success', text: 'Cliente actualizado.' }); setEditing(false); fetchData() }
    setSaving(false)
  }

  async function handleCancel(saleId: string) {
    setCancellingId(saleId)
    const { error } = await supabase.from('sales').update({ status: 'cancelada' }).eq('id', saleId)
    if (error) { setMessage({ type: 'error', text: 'Error al cancelar.' }) }
    else { setMessage({ type: 'success', text: 'Venta cancelada.' }); fetchData() }
    setCancellingId(null); setConfirmCancel(null)
  }

  const completedSales = sales.filter(s => s.status === 'completada')
  const totalRevenue = completedSales.reduce((acc, s) => acc + Number(s.total_revenue), 0)
  const totalProfit = completedSales.reduce((acc, s) => acc + Number(s.total_profit), 0)
  const essentialCount = completedSales.filter(s => s.product_type === 'essential').length
  const customCount = completedSales.filter(s => s.product_type === 'custom').length
  const pendingCount = sales.filter(s => s.status === 'pendiente').length
  const pendingRevenue = sales.filter(s => s.status === 'pendiente').reduce((acc, s) => acc + Number(s.total_revenue), 0)

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ height: '32px', borderRadius: '8px', backgroundColor: '#161616', width: '160px' }} />
        <div style={{ height: '160px', borderRadius: '16px', backgroundColor: '#161616' }} />
      </div>
    )
  }

  if (!client) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ color: '#ff4d4d', fontSize: '16px' }}>Cliente no encontrado.</p>
        <button onClick={() => router.push('/clientes')}
          style={{ marginTop: '16px', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', backgroundColor: '#161616', border: '1px solid #2a2a2a', color: '#f0f0f0', fontSize: '14px' }}>
          Volver
        </button>
      </div>
    )
  }

  const seguimientoLink = client.phone ? generateWhatsAppLink(client.phone, whatsAppSeguimientoMessage(client.full_name)) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div>
        <button onClick={() => router.push('/clientes')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 0', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '13px', marginBottom: '14px' }}>
          <ArrowLeft size={14} /> Clientes
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#00cfff0d', border: '1px solid #00cfff22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={20} style={{ color: '#00cfff' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '26px', fontWeight: 900, color: '#f0f0f0' }}>{client.full_name}</h1>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#6b7280' }}>{client.company ?? 'Sin empresa'} · Desde {formatDate(client.created_at)}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {seguimientoLink && (
              <a href={seguimientoLink} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', backgroundColor: '#00ff940d', border: '1px solid #00ff9422', color: '#00ff94' }}>
                <MessageCircle size={14} /> {isMobile ? 'WA' : 'Seguimiento'}
              </a>
            )}
            <button onClick={() => { setEditing(!editing); setMessage(null) }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                backgroundColor: editing ? '#ff4d4d0d' : '#00cfff0d',
                border: editing ? '1px solid #ff4d4d22' : '1px solid #00cfff22',
                color: editing ? '#ff4d4d' : '#00cfff' }}>
              {editing ? <><X size={13} /> Cancelar</> : <><Pencil size={13} /> Editar</>}
            </button>
          </div>
        </div>
      </div>

      {/* Formulario edición */}
      {editing && (
        <div style={{ borderRadius: '14px', padding: '20px', backgroundColor: '#161616', border: '1px solid #00cfff22', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#00cfff' }}>✏️ Editar cliente</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
            {[
              { key: 'full_name', label: 'Nombre *', placeholder: 'Nombre completo' },
              { key: 'company', label: 'Empresa', placeholder: 'Empresa' },
              { key: 'email', label: 'Email', placeholder: 'correo@email.com' },
              { key: 'phone', label: 'Teléfono', placeholder: '3001234567' },
              { key: 'city', label: 'Ciudad', placeholder: 'Ciudad' },
              { key: 'notes', label: 'Notas', placeholder: 'Observaciones' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9ca3af', marginBottom: '5px' }}>{label}</label>
                <input type="text" value={editForm[key as keyof typeof editForm]} onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          {message && <div style={{ padding: '10px 12px', borderRadius: '8px', fontSize: '13px', backgroundColor: message.type === 'success' ? '#00ff940d' : '#ff4d4d0d', border: `1px solid ${message.type === 'success' ? '#00ff9422' : '#ff4d4d22'}`, color: message.type === 'success' ? '#00ff94' : '#ff4d4d' }}>{message.text}</div>}
          <button onClick={handleSaveEdit} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', background: saving ? '#2a2a2a' : 'linear-gradient(90deg, #00cfff, #00ff94)', color: saving ? '#6b7280' : '#0d0d0d', alignSelf: 'flex-start' }}>
            <Check size={14} /> {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      )}

      {/* Info contacto */}
      {!editing && (
        <div style={{ borderRadius: '14px', padding: '18px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#f0f0f0' }}>Información de contacto</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
            {[{ label: 'Email', value: client.email ?? '—' }, { label: 'Teléfono', value: client.phone ?? '—' }, { label: 'Ciudad', value: client.city ?? '—' }].map(({ label, value }) => (
              <div key={label}>
                <p style={{ margin: 0, fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#f0f0f0' }}>{value}</p>
              </div>
            ))}
            {client.notes && <div style={{ gridColumn: isMobile ? 'span 2' : 'span 3' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Notas</p>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#9ca3af' }}>{client.notes}</p>
            </div>}
          </div>
        </div>
      )}

      {/* KPIs — 2 columnas en móvil */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Total Comprado', value: formatCOP(totalRevenue), color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22', icon: DollarSign },
          { label: 'Ganancia', value: formatCOP(totalProfit), color: '#00ff94', bg: '#00ff940d', border: '#00ff9422', icon: TrendingUp },
          { label: 'Compras', value: String(completedSales.length), color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22', icon: ShoppingCart },
          { label: pendingCount > 0 ? 'Pendiente' : 'Sin pendientes', value: pendingCount > 0 ? formatCOP(pendingRevenue) : '$0', color: pendingCount > 0 ? '#ffb547' : '#4b5563', bg: pendingCount > 0 ? '#ffb5470d' : '#161616', border: pendingCount > 0 ? '#ffb54722' : '#1f1f1f', icon: ShoppingCart },
        ].map(({ label, value, color, bg, border, icon: Icon }) => (
          <div key={label} style={{ borderRadius: '12px', padding: '16px', backgroundColor: bg, border: `1px solid ${border}` }}>
            <Icon size={16} style={{ color, marginBottom: '8px' }} />
            <p style={{ margin: 0, fontSize: isMobile ? '16px' : '20px', fontWeight: 900, color }}>{value}</p>
            <p style={{ margin: '3px 0 0', fontSize: '10px', color: '#6b7280' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Desglose */}
      {completedSales.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { label: 'Taply Essential', count: essentialCount, color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22' },
            { label: 'Taply Custom', count: customCount, color: '#00ff94', bg: '#00ff940d', border: '#00ff9422' },
          ].map(({ label, count, color, bg, border }) => (
            <div key={label} style={{ borderRadius: '12px', padding: '14px 16px', backgroundColor: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#f0f0f0' }}>{label}</span>
              <span style={{ fontSize: '24px', fontWeight: 900, color }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Mensaje global */}
      {message && !editing && <div style={{ padding: '10px 12px', borderRadius: '8px', fontSize: '13px', backgroundColor: message.type === 'success' ? '#00ff940d' : '#ff4d4d0d', border: `1px solid ${message.type === 'success' ? '#00ff9422' : '#ff4d4d22'}`, color: message.type === 'success' ? '#00ff94' : '#ff4d4d' }}>{message.text}</div>}

      {/* Historial */}
      <div>
        <h2 style={{ margin: '0 0 14px', fontSize: '18px', fontWeight: 700, color: '#f0f0f0' }}>Historial ({sales.length})</h2>
        {sales.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', borderRadius: '14px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
            <ShoppingCart size={28} style={{ margin: '0 auto 10px', display: 'block', color: '#374151' }} />
            <p style={{ margin: 0, color: '#4b5563', fontSize: '13px' }}>Sin compras registradas.</p>
          </div>
        ) : (
          <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #1f1f1f' }}>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: isMobile ? '560px' : 'auto' }}>
                <thead>
                  <tr style={{ backgroundColor: '#161616', borderBottom: '1px solid #1f1f1f' }}>
                    {['Fecha', 'Producto', 'Cant.', 'Ingreso', 'Ganancia', 'Pago', 'Estado', ''].map((h, i) => (
                      <th key={i} style={{ textAlign: 'left', padding: '11px 14px', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale, i) => {
                    const waLink = client.phone ? generateWhatsAppLink(client.phone, whatsAppVentaMessage(client.full_name, PRODUCT_CONFIG[sale.product_type].label, sale.quantity, Number(sale.total_revenue))) : null
                    return (
                      <tr key={sale.id} style={{ backgroundColor: i % 2 === 0 ? '#0d0d0d' : '#111111', borderBottom: '1px solid #161616', opacity: sale.status === 'cancelada' ? 0.5 : 1 }}>
                        <td style={{ padding: '11px 14px', color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDateTime(sale.sale_date)}</td>
                        <td style={{ padding: '11px 14px', fontWeight: 600, color: '#00cfff', whiteSpace: 'nowrap' }}>{PRODUCT_CONFIG[sale.product_type].label}</td>
                        <td style={{ padding: '11px 14px', textAlign: 'center', color: '#f0f0f0' }}>{sale.quantity}</td>
                        <td style={{ padding: '11px 14px', fontWeight: 600, color: '#00cfff', whiteSpace: 'nowrap' }}>{formatCOP(sale.total_revenue)}</td>
                        <td style={{ padding: '11px 14px', fontWeight: 600, color: '#00ff94', whiteSpace: 'nowrap' }}>{formatCOP(sale.total_profit)}</td>
                        <td style={{ padding: '11px 14px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{PAYMENT_METHOD_LABELS[sale.payment_method]}</td>
                        <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{ padding: '3px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 600,
                            backgroundColor: sale.status === 'completada' ? '#00ff940d' : sale.status === 'pendiente' ? '#ffb5470d' : '#ff4d4d0d',
                            color: sale.status === 'completada' ? '#00ff94' : sale.status === 'pendiente' ? '#ffb547' : '#ff4d4d' }}>
                            {SALE_STATUS_LABELS[sale.status]}
                          </span>
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            {waLink && sale.status !== 'cancelada' && (
                              <a href={waLink} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', padding: '5px', borderRadius: '7px', textDecoration: 'none', backgroundColor: '#00ff940d', border: '1px solid #00ff9422', color: '#00ff94' }}>
                                <MessageCircle size={13} />
                              </a>
                            )}
                            {sale.status !== 'cancelada' && (
                              confirmCancel === sale.id ? (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button onClick={() => handleCancel(sale.id)} disabled={cancellingId === sale.id}
                                    style={{ padding: '4px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: '#ffb547', color: '#0d0d0d' }}>
                                    {cancellingId === sale.id ? '...' : 'Sí'}
                                  </button>
                                  <button onClick={() => setConfirmCancel(null)}
                                    style={{ padding: '4px 6px', borderRadius: '5px', fontSize: '11px', cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>No</button>
                                </div>
                              ) : (
                                <button onClick={() => setConfirmCancel(sale.id)}
                                  style={{ padding: '5px', borderRadius: '7px', cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #1f1f1f', color: '#374151', display: 'flex', alignItems: 'center' }}>
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
        )}
      </div>
    </div>
  )
}
