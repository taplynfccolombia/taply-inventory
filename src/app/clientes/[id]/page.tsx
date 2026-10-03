'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Client, Sale } from '@/lib/supabase'
import { PRODUCT_CONFIG } from '@/lib/supabase'
import { formatCOP, formatDate, formatDateTime, PAYMENT_METHOD_LABELS, SALE_STATUS_LABELS, generateWhatsAppLink, whatsAppSeguimientoMessage, whatsAppVentaMessage } from '@/lib/utils'
import { ArrowLeft, User, ShoppingCart, TrendingUp, DollarSign, Ban, MessageCircle } from 'lucide-react'

export default function ClienteDetallePage() {
  const { id } = useParams()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function fetchData() {
    const [clientRes, salesRes] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('sales').select('*').eq('client_id', id).order('sale_date', { ascending: false }),
    ])
    setClient(clientRes.data)
    setSales(salesRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [id])

  async function handleCancel(saleId: string) {
    setCancellingId(saleId)
    const { error } = await supabase.from('sales').update({ status: 'cancelada' }).eq('id', saleId)
    if (error) { setMessage({ type: 'error', text: 'Error al cancelar la venta.' }) }
    else { setMessage({ type: 'success', text: 'Venta cancelada y stock restaurado.' }); fetchData() }
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ height: '40px', borderRadius: '10px', backgroundColor: '#161616', width: '200px' }} />
        <div style={{ height: '200px', borderRadius: '16px', backgroundColor: '#161616' }} />
      </div>
    )
  }

  if (!client) {
    return (
      <div style={{ textAlign: 'center', padding: '64px' }}>
        <p style={{ color: '#ff4d4d', fontSize: '16px' }}>Cliente no encontrado.</p>
        <button onClick={() => router.push('/clientes')}
          style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', backgroundColor: '#161616', border: '1px solid #2a2a2a', color: '#f0f0f0', fontSize: '14px' }}>
          Volver a Clientes
        </button>
      </div>
    )
  }

  const seguimientoLink = client.phone
    ? generateWhatsAppLink(client.phone, whatsAppSeguimientoMessage(client.full_name))
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div>
        <button onClick={() => router.push('/clientes')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Volver a Clientes
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#00cfff0d', border: '1px solid #00cfff22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={24} style={{ color: '#00cfff' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#f0f0f0' }}>{client.full_name}</h1>
              <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6b7280' }}>
                {client.company ?? 'Sin empresa'} · Cliente desde {formatDate(client.created_at)}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {seguimientoLink && (
              <a href={seguimientoLink} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', backgroundColor: '#00ff940d', border: '1px solid #00ff9422', color: '#00ff94' }}>
                <MessageCircle size={16} /> Mensaje de seguimiento
              </a>
            )}
            {completedSales.length > 0 && (
              <span style={{ padding: '6px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, backgroundColor: '#00ff940d', border: '1px solid #00ff9422', color: '#00ff94' }}>
                ⭐ Cliente activo
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info del cliente */}
      <div style={{ borderRadius: '16px', padding: '24px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>Información de contacto</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { label: 'Email', value: client.email ?? '—' },
            { label: 'Teléfono', value: client.phone ?? '—' },
            { label: 'Ciudad', value: client.city ?? '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#f0f0f0' }}>{value}</p>
            </div>
          ))}
          {client.notes && (
            <div style={{ gridColumn: 'span 3' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notas</p>
              <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#9ca3af' }}>{client.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Total Comprado',       value: formatCOP(totalRevenue),                                           color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22', icon: DollarSign },
          { label: 'Ganancia Generada',    value: formatCOP(totalProfit),                                            color: '#00ff94', bg: '#00ff940d', border: '#00ff9422', icon: TrendingUp },
          { label: 'Compras Completadas',  value: String(completedSales.length),                                     color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22', icon: ShoppingCart },
          { label: 'Cobros Pendientes',    value: pendingCount > 0 ? formatCOP(pendingRevenue) : '$0',
            color: pendingCount > 0 ? '#ffb547' : '#4b5563',
            bg:    pendingCount > 0 ? '#ffb5470d' : '#161616',
            border:pendingCount > 0 ? '#ffb54722' : '#1f1f1f', icon: ShoppingCart },
        ].map(({ label, value, color, bg, border, icon: Icon }) => (
          <div key={label} style={{ borderRadius: '14px', padding: '20px', backgroundColor: bg, border: `1px solid ${border}` }}>
            <Icon size={18} style={{ color, marginBottom: '12px' }} />
            <p style={{ margin: 0, fontSize: '22px', fontWeight: 900, color }}>{value}</p>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#6b7280' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Desglose por producto */}
      {completedSales.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'Taply Essential', count: essentialCount, color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22' },
            { label: 'Taply Custom',    count: customCount,    color: '#00ff94', bg: '#00ff940d', border: '#00ff9422' },
          ].map(({ label, count, color, bg, border }) => (
            <div key={label} style={{ borderRadius: '14px', padding: '20px', backgroundColor: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#f0f0f0' }}>{label}</span>
              <span style={{ fontSize: '28px', fontWeight: 900, color }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Mensaje */}
      {message && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '14px',
          backgroundColor: message.type === 'success' ? '#00ff940d' : '#ff4d4d0d',
          border: `1px solid ${message.type === 'success' ? '#00ff9422' : '#ff4d4d22'}`,
          color: message.type === 'success' ? '#00ff94' : '#ff4d4d' }}>
          {message.text}
        </div>
      )}

      {/* Historial de compras */}
      <div>
        <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 700, color: '#f0f0f0' }}>
          Historial de compras ({sales.length})
        </h2>

        {sales.length === 0 ? (
          <div style={{ borderRadius: '16px', padding: '48px', textAlign: 'center', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
            <ShoppingCart size={32} style={{ margin: '0 auto 12px', display: 'block', color: '#374151' }} />
            <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>Este cliente aún no tiene compras registradas.</p>
          </div>
        ) : (
          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #1f1f1f' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#161616', borderBottom: '1px solid #1f1f1f' }}>
                  {['Fecha', 'Producto', 'Cant.', 'Ingreso', 'Ganancia', 'Pago', 'Estado', ''].map((h, i) => (
                    <th key={i} style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, color: '#6b7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, i) => {
                  const waLink = client.phone
                    ? generateWhatsAppLink(
                        client.phone,
                        whatsAppVentaMessage(
                          client.full_name,
                          PRODUCT_CONFIG[sale.product_type].label,
                          sale.quantity,
                          Number(sale.total_revenue)
                        )
                      )
                    : null

                  return (
                    <tr key={sale.id} style={{ backgroundColor: i % 2 === 0 ? '#0d0d0d' : '#111111', borderBottom: '1px solid #161616', opacity: sale.status === 'cancelada' ? 0.5 : 1 }}>
                      <td style={{ padding: '14px 20px', color: '#6b7280' }}>{formatDateTime(sale.sale_date)}</td>
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: '#00cfff' }}>{PRODUCT_CONFIG[sale.product_type].label}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'center', color: '#f0f0f0' }}>{sale.quantity}</td>
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: '#00cfff' }}>{formatCOP(sale.total_revenue)}</td>
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: '#00ff94' }}>{formatCOP(sale.total_profit)}</td>
                      <td style={{ padding: '14px 20px', color: '#9ca3af' }}>{PAYMENT_METHOD_LABELS[sale.payment_method]}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                          backgroundColor: sale.status === 'completada' ? '#00ff940d' : sale.status === 'pendiente' ? '#ffb5470d' : '#ff4d4d0d',
                          color: sale.status === 'completada' ? '#00ff94' : sale.status === 'pendiente' ? '#ffb547' : '#ff4d4d' }}>
                          {SALE_STATUS_LABELS[sale.status]}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {waLink && sale.status !== 'cancelada' && (
                            <a href={waLink} target="_blank" rel="noopener noreferrer"
                              title="Enviar confirmación por WhatsApp"
                              style={{ display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '8px', textDecoration: 'none', backgroundColor: '#00ff940d', border: '1px solid #00ff9422', color: '#00ff94' }}>
                              <MessageCircle size={14} />
                            </a>
                          )}
                          {sale.status !== 'cancelada' && (
                            confirmCancel === sale.id ? (
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
                                <Ban size={14} />
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
        )}
      </div>
    </div>
  )
}
