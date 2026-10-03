'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PRODUCT_CONFIG } from '@/lib/supabase'
import { formatCOP, formatDateTime } from '@/lib/utils'
import { Package, ChevronRight } from 'lucide-react'

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
  { key: 'recibido',      label: 'Recibido',       emoji: '📥', color: '#6b7280',  bg: '#6b72800d', border: '#6b728022' },
  { key: 'en_produccion', label: 'En Producción',  emoji: '⚙️', color: '#ffb547',  bg: '#ffb5470d', border: '#ffb54722' },
  { key: 'listo',         label: 'Listo',          emoji: '✅', color: '#00cfff',  bg: '#00cfff0d', border: '#00cfff22' },
  { key: 'enviado',       label: 'Enviado',        emoji: '🚚', color: '#a78bfa',  bg: '#a78bfa0d', border: '#a78bfa22' },
  { key: 'entregado',     label: 'Entregado',      emoji: '🎉', color: '#00ff94',  bg: '#00ff940d', border: '#00ff9422' },
]

function getStepIndex(status: string) {
  return ORDER_STEPS.findIndex(s => s.key === status)
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function fetchOrders() {
    const { data } = await supabase
      .from('sales')
      .select('id, sale_date, product_type, quantity, total_revenue, status, order_status, notes, client:clients(full_name, phone)')
      .eq('status', 'completada')
      .order('sale_date', { ascending: false })
    setOrders((data ?? []) as unknown as Order[])
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdatingId(orderId)
    const { error } = await supabase
      .from('sales')
      .update({ order_status: newStatus })
      .eq('id', orderId)
    if (error) { setMessage({ type: 'error', text: 'Error al actualizar el estado.' }) }
    else { setMessage({ type: 'success', text: 'Estado actualizado correctamente.' }); fetchOrders() }
    setUpdatingId(null)
  }

  async function advanceStatus(order: Order) {
    const currentIdx = getStepIndex(order.order_status)
    if (currentIdx < ORDER_STEPS.length - 1) {
      await updateOrderStatus(order.id, ORDER_STEPS[currentIdx + 1].key)
    }
  }

  const filtered = filterStatus === 'todos'
    ? orders
    : orders.filter(o => o.order_status === filterStatus)

  const countByStatus = ORDER_STEPS.reduce((acc, step) => {
    acc[step.key] = orders.filter(o => o.order_status === step.key).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }} className="taply-gradient-text">Pedidos</h1>
        <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>
          Seguimiento del estado de producción y entrega
        </p>
      </div>

      {/* Pipeline de estados */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        {ORDER_STEPS.map((step, i) => (
          <div key={step.key}
            style={{ borderRadius: '14px', padding: '16px', backgroundColor: step.bg, border: `1px solid ${step.border}`, position: 'relative' }}>
            {i < ORDER_STEPS.length - 1 && (
              <ChevronRight size={16} style={{ position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%)', color: '#2a2a2a', zIndex: 1 }} />
            )}
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>{step.emoji}</div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: step.color }}>{step.label}</p>
            <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 900, color: '#f0f0f0' }}>
              {countByStatus[step.key] ?? 0}
            </p>
          </div>
        ))}
      </div>

      {/* Mensaje */}
      {message && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '14px',
          backgroundColor: message.type === 'success' ? '#00ff940d' : '#ff4d4d0d',
          border: `1px solid ${message.type === 'success' ? '#00ff9422' : '#ff4d4d22'}`,
          color: message.type === 'success' ? '#00ff94' : '#ff4d4d' }}>
          {message.text}
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => setFilterStatus('todos')}
          style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            backgroundColor: filterStatus === 'todos' ? '#00cfff0d' : 'transparent',
            border: filterStatus === 'todos' ? '1px solid #00cfff33' : '1px solid #1f1f1f',
            color: filterStatus === 'todos' ? '#00cfff' : '#6b7280' }}>
          Todos ({orders.length})
        </button>
        {ORDER_STEPS.map(step => (
          <button key={step.key} onClick={() => setFilterStatus(step.key)}
            style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              backgroundColor: filterStatus === step.key ? step.bg : 'transparent',
              border: filterStatus === step.key ? `1px solid ${step.border}` : '1px solid #1f1f1f',
              color: filterStatus === step.key ? step.color : '#6b7280' }}>
            {step.emoji} {step.label} ({countByStatus[step.key] ?? 0})
          </button>
        ))}
      </div>

      {/* Lista de pedidos */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ borderRadius: '14px', height: '100px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ borderRadius: '16px', padding: '48px', textAlign: 'center', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
          <Package size={32} style={{ margin: '0 auto 12px', display: 'block', color: '#374151' }} />
          <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>
            {filterStatus === 'todos' ? 'No hay pedidos registrados.' : `No hay pedidos en estado "${ORDER_STEPS.find(s => s.key === filterStatus)?.label}".`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(order => {
            const currentStep = ORDER_STEPS.find(s => s.key === order.order_status) ?? ORDER_STEPS[0]
            const currentIdx = getStepIndex(order.order_status)
            const nextStep = currentIdx < ORDER_STEPS.length - 1 ? ORDER_STEPS[currentIdx + 1] : null
            const isUpdating = updatingId === order.id
            const client = order.client as unknown as { full_name: string; phone: string | null } | null

            return (
              <div key={order.id}
                style={{ borderRadius: '14px', padding: '20px 24px', backgroundColor: '#161616', border: `1px solid ${currentStep.border}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>

                  {/* Info del pedido */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#00cfff' }}>
                        {PRODUCT_CONFIG[order.product_type].label}
                      </span>
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>× {order.quantity}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#00ff94' }}>
                        {formatCOP(order.total_revenue)}
                      </span>
                    </div>

                    {client && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: '#f0f0f0' }}>👤 {client.full_name}</span>
                        {client.phone && (
                          <a href={`https://wa.me/57${client.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: '12px', color: '#00cfff', textDecoration: 'none' }}>
                            📱 WhatsApp
                          </a>
                        )}
                      </div>
                    )}

                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {formatDateTime(order.sale_date)}
                      {order.notes && <span> · {order.notes}</span>}
                    </div>
                  </div>

                  {/* Estado actual + botón avanzar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', flexShrink: 0 }}>
                    <span style={{ padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 700,
                      backgroundColor: currentStep.bg, color: currentStep.color, border: `1px solid ${currentStep.border}` }}>
                      {currentStep.emoji} {currentStep.label}
                    </span>

                    {nextStep && (
                      <button onClick={() => advanceStatus(order)} disabled={isUpdating}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: isUpdating ? 'not-allowed' : 'pointer', border: 'none',
                          background: isUpdating ? '#2a2a2a' : `linear-gradient(90deg, ${nextStep.color}99, ${nextStep.color})`,
                          color: '#0d0d0d' }}>
                        {isUpdating ? '...' : `→ ${nextStep.emoji} ${nextStep.label}`}
                      </button>
                    )}

                    {!nextStep && (
                      <span style={{ fontSize: '12px', color: '#00ff94', fontWeight: 600 }}>
                        ✅ Proceso completo
                      </span>
                    )}
                  </div>
                </div>

                {/* Barra de progreso */}
                <div style={{ marginTop: '16px', display: 'flex', gap: '4px' }}>
                  {ORDER_STEPS.map((step, i) => (
                    <div key={step.key} style={{ flex: 1, height: '4px', borderRadius: '2px',
                      backgroundColor: i <= currentIdx ? currentStep.color : '#2a2a2a',
                      transition: 'background-color 0.3s ease' }} />
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
