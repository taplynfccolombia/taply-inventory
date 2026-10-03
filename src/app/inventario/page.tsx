'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Inventory } from '@/lib/supabase'
import { formatCOP, formatDateTime } from '@/lib/utils'
import { Package, Plus, Minus, AlertTriangle } from 'lucide-react'

export default function InventarioPage() {
  const [inventory, setInventory] = useState<Inventory | null>(null)
  const [loading, setLoading] = useState(true)
  const [adjustQty, setAdjustQty] = useState('')
  const [adjustNote, setAdjustNote] = useState('')
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function fetchInventory() {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('item_name', 'Tarjeta Negra Matte Base')
      .single()
    if (!error && data) setInventory(data)
    setLoading(false)
  }

  useEffect(() => { fetchInventory() }, [])

  async function handleAdjust() {
    if (!inventory || !adjustQty || Number(adjustQty) <= 0) return
    setSaving(true)
    setMessage(null)

    const qty = Number(adjustQty)
    const newQty = adjustType === 'add'
      ? inventory.quantity + qty
      : inventory.quantity - qty

    if (newQty < 0) {
      setMessage({ type: 'error', text: 'No puedes tener stock negativo.' })
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from('inventory')
      .update({ quantity: newQty, notes: adjustNote || inventory.notes })
      .eq('id', inventory.id)

    if (error) {
      setMessage({ type: 'error', text: 'Error al actualizar el stock.' })
    } else {
      setMessage({ type: 'success', text: `Stock actualizado a ${newQty} unidades.` })
      setAdjustQty('')
      setAdjustNote('')
      fetchInventory()
    }
    setSaving(false)
  }

  const stockStatus = !inventory
    ? null
    : inventory.quantity === 0
    ? { label: 'Sin Stock', color: '#ff4d4d', bg: '#ff4d4d11', border: '#ff4d4d33' }
    : inventory.quantity < 5
    ? { label: 'Stock Bajo', color: '#ffb547', bg: '#ffb54711', border: '#ffb54733' }
    : { label: 'Stock OK', color: '#00ff94', bg: '#00ff9411', border: '#00ff9433' }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black taply-gradient-text">Inventario</h1>
        <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
          Control del stock físico de tarjetas NFC
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl p-8 animate-pulse" style={{ backgroundColor: '#161616', border: '1px solid #2a2a2a' }} />
      ) : inventory ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Card de stock actual */}
          <div className="rounded-2xl p-8" style={{ backgroundColor: '#161616', border: '1px solid #2a2a2a' }}>
            <div className="flex items-center gap-3 mb-6">
              <Package size={24} style={{ color: '#00cfff' }} />
              <h2 className="text-xl font-bold" style={{ color: '#f0f0f0' }}>
                {inventory.item_name}
              </h2>
            </div>

            <div className="text-center py-6">
              <p className="text-8xl font-black taply-gradient-text">
                {inventory.quantity}
              </p>
              <p className="text-lg mt-2" style={{ color: '#6b7280' }}>unidades disponibles</p>
            </div>

            {stockStatus && (
              <div className="flex justify-center mt-4">
                <span
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: stockStatus.bg, color: stockStatus.color, border: `1px solid ${stockStatus.border}` }}
                >
                  {inventory.quantity < 5 && <AlertTriangle size={14} />}
                  {stockStatus.label}
                </span>
              </div>
            )}

            <div className="mt-6 pt-6 space-y-2" style={{ borderTop: '1px solid #2a2a2a' }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#6b7280' }}>Costo por unidad</span>
                <span style={{ color: '#f0f0f0' }} className="font-semibold">
                  {formatCOP(inventory.cost_per_unit)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#6b7280' }}>Valor total del stock</span>
                <span style={{ color: '#00ff94' }} className="font-semibold">
                  {formatCOP(inventory.quantity * inventory.cost_per_unit)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#6b7280' }}>Última actualización</span>
                <span style={{ color: '#9ca3af' }}>{formatDateTime(inventory.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Card de ajuste de stock */}
          <div className="rounded-2xl p-8" style={{ backgroundColor: '#161616', border: '1px solid #2a2a2a' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: '#f0f0f0' }}>
              Ajustar Stock
            </h2>

            {/* Tipo de ajuste */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setAdjustType('add')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  backgroundColor: adjustType === 'add' ? '#00ff9411' : '#0d0d0d',
                  border: adjustType === 'add' ? '1px solid #00ff9433' : '1px solid #2a2a2a',
                  color: adjustType === 'add' ? '#00ff94' : '#6b7280',
                }}
              >
                <Plus size={16} /> Agregar
              </button>
              <button
                onClick={() => setAdjustType('subtract')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  backgroundColor: adjustType === 'subtract' ? '#ff4d4d11' : '#0d0d0d',
                  border: adjustType === 'subtract' ? '1px solid #ff4d4d33' : '1px solid #2a2a2a',
                  color: adjustType === 'subtract' ? '#ff4d4d' : '#6b7280',
                }}
              >
                <Minus size={16} /> Restar
              </button>
            </div>

            {/* Cantidad */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>
                Cantidad de unidades
              </label>
              <input
                type="number"
                min="1"
                value={adjustQty}
                onChange={e => setAdjustQty(e.target.value)}
                placeholder="Ej: 10"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  backgroundColor: '#0d0d0d',
                  border: '1px solid #2a2a2a',
                  color: '#f0f0f0',
                }}
                onFocus={e => e.target.style.borderColor = '#00cfff55'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
              />
            </div>

            {/* Nota */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>
                Nota (opcional)
              </label>
              <input
                type="text"
                value={adjustNote}
                onChange={e => setAdjustNote(e.target.value)}
                placeholder="Ej: Compra a proveedor"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  backgroundColor: '#0d0d0d',
                  border: '1px solid #2a2a2a',
                  color: '#f0f0f0',
                }}
                onFocus={e => e.target.style.borderColor = '#00cfff55'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
              />
            </div>

            {/* Mensaje */}
            {message && (
              <div
                className="mb-4 px-4 py-3 rounded-xl text-sm"
                style={{
                  backgroundColor: message.type === 'success' ? '#00ff9411' : '#ff4d4d11',
                  border: `1px solid ${message.type === 'success' ? '#00ff9433' : '#ff4d4d33'}`,
                  color: message.type === 'success' ? '#00ff94' : '#ff4d4d',
                }}
              >
                {message.text}
              </div>
            )}

            {/* Botón */}
            <button
              onClick={handleAdjust}
              disabled={saving || !adjustQty}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all"
              style={{
                background: saving || !adjustQty ? '#2a2a2a' : 'linear-gradient(90deg, #00cfff, #00ff94)',
                color: saving || !adjustQty ? '#6b7280' : '#0d0d0d',
                cursor: saving || !adjustQty ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Guardando...' : 'Confirmar Ajuste'}
            </button>
          </div>
        </div>
      ) : (
        <p style={{ color: '#ff4d4d' }}>No se encontró el inventario base.</p>
      )}
    </div>
  )
}
