'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { CheckSquare, Plus, X, Check, Trash2, Calendar, Flag } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string | null
  priority: 'alta' | 'media' | 'baja'
  status: 'pendiente' | 'completada'
  due_date: string | null
  created_at: string
  updated_at: string
}

const PRIORITY_CONFIG = {
  alta:  { label: 'Alta',  color: '#ff4d4d', bg: '#ff4d4d0d', border: '#ff4d4d22' },
  media: { label: 'Media', color: '#ffb547', bg: '#ffb5470d', border: '#ffb54722' },
  baja:  { label: 'Baja',  color: '#00ff94', bg: '#00ff940d', border: '#00ff9422' },
}

export default function TareasPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'todas' | 'pendiente' | 'completada'>('pendiente')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'media' as 'alta' | 'media' | 'baja',
    due_date: '',
  })

  async function fetchTasks() {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false })
    setTasks(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchTasks() }, [])

  async function handleSubmit() {
    if (!form.title.trim()) { setMessage({ type: 'error', text: 'El título es obligatorio.' }); return }
    setSaving(true); setMessage(null)
    const { error } = await supabase.from('tasks').insert([{
      title: form.title.trim(),
      description: form.description.trim() || null,
      priority: form.priority,
      due_date: form.due_date || null,
      status: 'pendiente',
    }])
    if (error) { setMessage({ type: 'error', text: 'Error al guardar la tarea.' }) }
    else {
      setMessage({ type: 'success', text: 'Tarea creada exitosamente.' })
      setForm({ title: '', description: '', priority: 'media', due_date: '' })
      setShowForm(false); fetchTasks()
    }
    setSaving(false)
  }

  async function toggleStatus(task: Task) {
    const newStatus = task.status === 'pendiente' ? 'completada' : 'pendiente'
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
    fetchTasks()
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks()
  }

  const filtered = tasks.filter(t => filter === 'todas' ? true : t.status === filter)
  const pendingCount = tasks.filter(t => t.status === 'pendiente').length
  const urgentCount = tasks.filter(t => t.status === 'pendiente' && t.priority === 'alta').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }} className="taply-gradient-text">Tareas</h1>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>
            {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
            {urgentCount > 0 && (
              <span style={{ marginLeft: '8px', color: '#ff4d4d', fontWeight: 600 }}>
                · {urgentCount} urgente{urgentCount !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setMessage(null) }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none',
            background: showForm ? '#1f1f1f' : 'linear-gradient(90deg, #00cfff, #00ff94)',
            color: showForm ? '#9ca3af' : '#0d0d0d' }}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancelar' : 'Nueva Tarea'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div style={{ borderRadius: '16px', padding: '32px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 700, color: '#f0f0f0' }}>Crear Nueva Tarea</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Título */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px' }}>Título *</label>
              <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Ej: Llamar a Juan García para seguimiento"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }}
              />
            </div>

            {/* Descripción */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px' }}>Descripción (opcional)</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Detalles adicionales de la tarea..."
                rows={3}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Prioridad */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px' }}>Prioridad</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['alta', 'media', 'baja'] as const).map(p => (
                    <button key={p} onClick={() => setForm(prev => ({ ...prev, priority: p }))}
                      style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                        backgroundColor: form.priority === p ? PRIORITY_CONFIG[p].bg : '#0d0d0d',
                        border: form.priority === p ? `1px solid ${PRIORITY_CONFIG[p].border}` : '1px solid #2a2a2a',
                        color: form.priority === p ? PRIORITY_CONFIG[p].color : '#6b7280' }}>
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fecha límite */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px' }}>Fecha límite (opcional)</label>
                <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }}
                />
              </div>
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
            {saving ? 'Guardando...' : 'Crear Tarea'}
          </button>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {(['pendiente', 'completada', 'todas'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '8px 20px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              backgroundColor: filter === f ? '#00cfff0d' : 'transparent',
              border: filter === f ? '1px solid #00cfff33' : '1px solid #1f1f1f',
              color: filter === f ? '#00cfff' : '#6b7280',
              textTransform: 'capitalize' }}>
            {f === 'pendiente' ? `Pendientes (${pendingCount})` : f === 'completada' ? 'Completadas' : 'Todas'}
          </button>
        ))}
      </div>

      {/* Lista de tareas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} style={{ borderRadius: '14px', padding: '20px', backgroundColor: '#161616', border: '1px solid #1f1f1f', height: '80px' }} />
          ))
        ) : filtered.length === 0 ? (
          <div style={{ borderRadius: '16px', padding: '48px', textAlign: 'center', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
            <CheckSquare size={32} style={{ margin: '0 auto 12px', display: 'block', color: '#374151' }} />
            <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>
              {filter === 'pendiente' ? '¡No hay tareas pendientes!' : 'No hay tareas en esta categoría.'}
            </p>
          </div>
        ) : (
          filtered.map(task => {
            const pc = PRIORITY_CONFIG[task.priority]
            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status === 'pendiente'
            return (
              <div key={task.id}
                style={{ borderRadius: '14px', padding: '20px 24px', backgroundColor: '#161616', border: `1px solid ${task.status === 'completada' ? '#1f1f1f' : pc.border}`,
                  opacity: task.status === 'completada' ? 0.6 : 1, display: 'flex', alignItems: 'flex-start', gap: '16px' }}>

                {/* Checkbox */}
                <button onClick={() => toggleStatus(task)}
                  style={{ width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px',
                    backgroundColor: task.status === 'completada' ? '#00ff940d' : 'transparent',
                    border: task.status === 'completada' ? '1px solid #00ff9433' : '1px solid #2a2a2a' }}>
                  {task.status === 'completada' && <Check size={14} style={{ color: '#00ff94' }} />}
                </button>

                {/* Contenido */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: task.status === 'completada' ? '#6b7280' : '#f0f0f0',
                      textDecoration: task.status === 'completada' ? 'line-through' : 'none' }}>
                      {task.title}
                    </p>
                    <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                      backgroundColor: pc.bg, color: pc.color, border: `1px solid ${pc.border}`, flexShrink: 0 }}>
                      <Flag size={10} style={{ display: 'inline', marginRight: '4px' }} />
                      {pc.label}
                    </span>
                  </div>
                  {task.description && (
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>{task.description}</p>
                  )}
                  {task.due_date && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                      <Calendar size={12} style={{ color: isOverdue ? '#ff4d4d' : '#6b7280' }} />
                      <span style={{ fontSize: '12px', color: isOverdue ? '#ff4d4d' : '#6b7280', fontWeight: isOverdue ? 600 : 400 }}>
                        {isOverdue ? '⚠ Vencida · ' : ''}{formatDate(task.due_date)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Eliminar */}
                <button onClick={() => deleteTask(task.id)}
                  style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid transparent', color: '#374151', flexShrink: 0, display: 'flex', alignItems: 'center' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ff4d4d0d'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#ff4d4d22'; (e.currentTarget as HTMLButtonElement).style.color = '#ff4d4d' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#374151' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
