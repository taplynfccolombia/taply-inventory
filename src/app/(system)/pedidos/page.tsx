'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PRODUCT_CONFIG } from '@/lib/supabase'
import { formatCOP, formatDateTime, generateWhatsAppLink, whatsAppPedidoMessage, exportToCSV } from '@/lib/utils'
import { useIsMobile } from '@/lib/hooks'
import { Package, ChevronRight, MessageCircle, Download } from 'lucide-react'

interface Order {
  id: string
  sale_date: string
  product_type: 'essential' | 'custom'
  quantity: number
  total_revenue: number
  status: string
  order_status: 'recibido' | 'en_produccion' | 'listo' | 'enviado' | 'entregado'
  notes: string | null
  client: { full_name: string; phone: string | null } | null
}

const ORDER_STEPS = [
  { key: 'recibido',      label: 'Recibido',      emoji: '📥', color: '#6b7280', bg: '#6b72800d', border: '#6b728022' },
  { key: 'en_produccion', label: 'En Producción', emoji: '⚙️', color: '#ffb547', bg: '#ffb5470d', border: '#ffb54722' },
  { key: 'listo',         label: 'Listo',         emoji: '✅', color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22' },
  { key: 'enviado',       label: 'Enviado',       emoji: '🚚', color: '#a78bfa', bg: '#a78bfa0d', border: '#a78bfa22' },
  { key: 'entregado',     label: 'Entregado',     emoji: '🎉', color: '#00ff94', bg: '#00ff940d', border: '#00ff9422' },
]

function getStepIndex(status: string) { return ORDER_STEPS.findIndex(s => s.key === status) }

export default function PedidosPage() {
  const isMobile = useIsMobile()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function fetchOrders() {
    const { data } = await supabase.from('sales').select('id, sale_date, product_type, quantity, total_revenue, status, order_status, notes, client:clients(full_name, phone)').eq('status', 'completada').order('sale_date', { ascending: false })
    setOrders((data ?? []) as unknown as Order[]); setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdatingId(orderId)
    const { error } = await supabase.from('sales').update({ order_status: newStatus }).eq('id', orderId)
    if (error) { setMessage({ type: 'error', text: 'Error al actualizar.' }) }
    else { setMessage({ type: 'success', text: 'Estado actualizado.' }); fetchOrders() }
    setUpdatingId(null)
  }

  async function advanceStatus(order: Order) {
    const idx = getStepIndex(order.order_status)
    if (idx < ORDER_STEPS.length - 1) await updateOrderStatus(order.id, ORDER_STEPS[idx + 1].key)
  }

  function handleExportCSV() {
    exportToCSV(orders.map(o => ({
      Fecha: formatDateTime(o.sale_date),
      Producto: PRODUCT_CONFIG[o.product_type].label,
      Cliente: (o.client as unknown as { full_name: string } | null)?.full_name ?? '—',
      Cantidad: o.quantity,
      'Ingreso (COP)': o.total_revenue,
      Estado: ORDER_STEPS.find(s => s.key === o.order_status)?.label ?? o.order_status,
    })), 'Taply_Pedidos')
  }

  const filtered = filterStatus === 'todos' ? orders : orders.filter(o => o.order_status === filterStatus)
  const countByStatus = ORDER_STEPS.reduce((acc, step) => { acc[step.key] = orders.filter(o => o.order_status === step.key).length; return acc }, {} as Record<string, number>)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? '24px' : '32px', fontWeight: 900 }} className="taply-gradient-text">Pedidos</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>Seguimiento de producción y entrega</p>
        </div>
        <button onClick={handleExportCSV} disabled={orders.length === 0}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
          <Download size={14} /> CSV
        </button>
      </div>

      {/* Pipeline — scroll horizontal en móvil */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', minWidth: isMobile ? '480px' : 'auto' }}>
          {ORDER_STEPS.map((step, i) => (
            <div key={step.key} style={{ borderRadius: '12px', padding: '14px', backgroundColor: step.bg, border: `1px solid ${step.border}`, position: 'relative' }}>
              {i < ORDER_STEPS.length - 1 && !isMobile && (
                <ChevronRight size={14} style={{ position: 'absolute', right: '-9px', top: '50%', transform: 'translateY(-50%)', color: '#2a2a2a', zIndex: 1 }} />
              )}
              <div style={{ fontSize: '18px', marginBottom: '6px' }}>{step.emoji}</div>
              <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: step.color }}>{step.label}</p>
              <p style={{ margin: '3px 0 0', fontSize: '22px', fontWeight: 900, color: '#f0f0f0' }}>{countByStatus[step.key] ?? 0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mensaje */}
      {message && <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', backgroundColor: message.type === 'success' ? '#00ff940d' : '#ff4d4d0d', border: `1px solid ${message.type === 'success' ? '#00ff9422' : '#ff4d4d22'}`, color: message.type === 'success' ? '#00ff94' : '#ff4d4d' }}>{message.text}</div>}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <button onClick={() => setFilterStatus('todos')}
          style={{ padding: '7px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: filterStatus === 'todos' ? '#00cfff0d' : 'transparent', border: filterStatus === 'todos' ? '1px solid #00cfff33' : '1px solid #1f1f1f', color: filterStatus === 'todos' ? '#00cfff' : '#6b7280' }}>
          Todos ({orders.length})
        </button>
        {ORDER_STEPS.map(step => (
          <button key={step.key} onClick={() => setFilterStatus(step.key)}
            style={{ padding: '7px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: filterStatus === step.key ? step.bg : 'transparent', border: filterStatus === step.key ? `1px solid ${step.border}` : '1px solid #1f1f1f', color: filterStatus === step.key ? step.color : '#6b7280' }}>
            {step.emoji} {isMobile ? '' : step.label} ({countByStatus[step.key] ?? 0})
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[...Array(3)].map((_, i) => <div key={i} style={{ borderRadius: '12px', height: '90px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ borderRadius: '16px', padding: '40px', textAlign: 'center', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
          <Package size={28} style={{ margin: '0 auto 10px', display: 'block', color: '#374151' }} />
          <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>No hay pedidos en este estado.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(order => {
            const currentStep = ORDER_STEPS.find(s => s.key === order.order_status) ?? ORDER_STEPS[0]
            const currentIdx = getStepIndex(order.order_status)
            const nextStep = currentIdx < ORDER_STEPS.length - 1 ? ORDER_STEPS[currentIdx + 1] : null
            const isUpdating = updatingId === order.id
            const client = order.client as unknown as { full_name: string; phone: string | null } | null
            const productLabel = PRODUCT_CONFIG[order.product_type].label
            const whatsappLink = client?.phone ? generateWhatsAppLink(client.phone, whatsAppPedidoMessage(client.full_name, productLabel, order.order_status)) : null

            return (
              <div key={order.id} style={{ borderRadius: '14px', padding: '16px 18px', backgroundColor: '#161616', border: `1px solid ${currentStep.border}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#00cfff' }}>{productLabel}</span>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>× {order.quantity}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#00ff94' }}>{formatCOP(order.total_revenue)}</span>
                    </div>
                    {client && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', color: '#f0f0f0' }}>👤 {client.full_name}</span>
                        {whatsappLink && (
                          <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, textDecoration: 'none', backgroundColor: '#00ff940d', border: '1px solid #00ff9422', color: '#00ff94' }}>
                            <MessageCircle size={11} /> WhatsApp
                          </a>
                        )}
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{formatDateTime(order.sale_date)}{order.notes && ` · ${order.notes}`}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'flex-start' : 'flex-end', gap: '8px', flexShrink: 0 }}>
                    <span style={{ padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, backgroundColor: currentStep.bg, color: currentStep.color, border: `1px solid ${currentStep.border}` }}>
                      {currentStep.emoji} {currentStep.label}
                    </span>
                    {nextStep ? (
                      <button onClick={() => advanceStatus(order)} disabled={isUpdating}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: 700, cursor: isUpdating ? 'not-allowed' : 'pointer', border: 'none',
                          background: isUpdating ? '#2a2a2a' : `linear-gradient(90deg, ${nextStep.color}99, ${nextStep.color})`, color: '#0d0d0d' }}>
                        {isUpdating ? '...' : `→ ${nextStep.emoji} ${nextStep.label}`}
                      </button>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#00ff94', fontWeight: 600 }}>✅ Completo</span>
                    )}
                  </div>
                </div>

                {/* Barra de progreso */}
                <div style={{ marginTop: '12px', display: 'flex', gap: '3px' }}>
                  {ORDER_STEPS.map((step, i) => (
                    <div key={step.key} style={{ flex: 1, height: '3px', borderRadius: '2px', backgroundColor: i <= currentIdx ? currentStep.color : '#2a2a2a', transition: 'background-color 0.3s ease' }} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
