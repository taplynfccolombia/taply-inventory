'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCOP } from '@/lib/utils'
import { Target, Edit2, Check, X } from 'lucide-react'

interface Goal {
  id: string
  month: number
  year: number
  target_revenue: number
  target_sales: number
}

interface MonthlyGoalProps {
  currentRevenue: number
  currentSales: number
}

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export function MonthlyGoal({ currentRevenue, currentSales }: MonthlyGoalProps) {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [goal, setGoal] = useState<Goal | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ target_revenue: '', target_sales: '' })

  async function fetchGoal() {
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('month', month)
      .eq('year', year)
      .single()
    setGoal(data)
    if (data) {
      setForm({
        target_revenue: String(data.target_revenue),
        target_sales: String(data.target_sales),
      })
    }
  }

  useEffect(() => { fetchGoal() }, [])

  async function handleSave() {
    setSaving(true)
    const payload = {
      month, year,
      target_revenue: Number(form.target_revenue) || 0,
      target_sales: Number(form.target_sales) || 0,
    }
    const { error } = goal
      ? await supabase.from('goals').update(payload).eq('id', goal.id)
      : await supabase.from('goals').insert([payload])

    if (!error) { fetchGoal(); setEditing(false) }
    setSaving(false)
  }

  const revenueProgress = goal && goal.target_revenue > 0
    ? Math.min((currentRevenue / goal.target_revenue) * 100, 100)
    : 0

  const salesProgress = goal && goal.target_sales > 0
    ? Math.min((currentSales / goal.target_sales) * 100, 100)
    : 0

  const revenueColor = revenueProgress >= 100 ? '#00ff94' : revenueProgress >= 60 ? '#ffb547' : '#00cfff'
  const salesColor = salesProgress >= 100 ? '#00ff94' : salesProgress >= 60 ? '#ffb547' : '#00cfff'

  return (
    <div style={{ borderRadius: '16px', padding: '28px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Target size={20} style={{ color: '#00cfff' }} />
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>
            Meta de {MONTHS[month - 1]} {year}
          </h2>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: '#00cfff0d', border: '1px solid #00cfff22', color: '#00cfff' }}>
            <Edit2 size={12} />
            {goal ? 'Editar' : 'Definir meta'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSave} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: '#00ff940d', border: '1px solid #00ff9422', color: '#00ff94' }}>
              <Check size={12} />
              {saving ? '...' : 'Guardar'}
            </button>
            <button onClick={() => setEditing(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #2a2a2a', color: '#6b7280' }}>
              <X size={12} />
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Formulario de edición */}
      {editing && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', padding: '20px', borderRadius: '12px', backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px' }}>
              Meta de Ingresos (COP)
            </label>
            <input type="number" value={form.target_revenue}
              onChange={e => setForm(p => ({ ...p, target_revenue: e.target.value }))}
              placeholder="Ej: 2000000"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#161616', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px' }}>
              Meta de Ventas (unidades)
            </label>
            <input type="number" value={form.target_sales}
              onChange={e => setForm(p => ({ ...p, target_sales: e.target.value }))}
              placeholder="Ej: 20"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#161616', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      )}

      {/* Sin meta definida */}
      {!goal && !editing && (
        <div style={{ textAlign: 'center', padding: '24px', borderRadius: '12px', backgroundColor: '#0d0d0d', border: '1px dashed #2a2a2a' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>
            No hay meta definida para este mes. Click en "Definir meta" para comenzar.
          </p>
        </div>
      )}

      {/* Progreso */}
      {goal && !editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Ingresos */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>Ingresos</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: revenueColor }}>
                  {formatCOP(currentRevenue)}
                </span>
                <span style={{ fontSize: '12px', color: '#4b5563' }}>/ {formatCOP(goal.target_revenue)}</span>
              </div>
            </div>
            <div style={{ height: '8px', borderRadius: '999px', backgroundColor: '#0d0d0d', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '999px', width: `${revenueProgress}%`,
                background: `linear-gradient(90deg, #00cfff, ${revenueColor})`,
                transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: '#4b5563' }}>
                {revenueProgress >= 100 ? '🎉 ¡Meta alcanzada!' :
                  `Faltan ${formatCOP(goal.target_revenue - currentRevenue)}`}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: revenueColor }}>
                {revenueProgress.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Ventas */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>Ventas</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: salesColor }}>
                  {currentSales} uds
                </span>
                <span style={{ fontSize: '12px', color: '#4b5563' }}>/ {goal.target_sales} uds</span>
              </div>
            </div>
            <div style={{ height: '8px', borderRadius: '999px', backgroundColor: '#0d0d0d', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '999px', width: `${salesProgress}%`,
                background: `linear-gradient(90deg, #00cfff, ${salesColor})`,
                transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: '#4b5563' }}>
                {salesProgress >= 100 ? '🎉 ¡Meta alcanzada!' :
                  `Faltan ${goal.target_sales - currentSales} ventas`}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: salesColor }}>
                {salesProgress.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
