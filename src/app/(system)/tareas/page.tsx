'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { useIsMobile } from '@/lib/hooks'
import { CheckSquare, Plus, X, Trash2, AlertTriangle } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string | null
  priority: 'alta' | 'media' | 'baja'
  due_date: string | null
  completed: boolean
  created_at: string
}

type FilterType = 'todas' | 'pendientes' | 'completadas'

const PRIORITY_CONFIG = {
  alta:  { label: 'Alta',  color: '#ff4d4d', bg: '#ff4d4d0d', border: '#ff4d4d22' },
  media: { label: 'Media', color: '#ffb547', bg: '#ffb5470d', border: '#ffb54722' },
  baja:  { label: 'Baja',  color: '#00ff94', bg: '#00ff940d', border: '#00ff9422' },
}

export default function TareasPage() {
  const isMobile = useIsMobile()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<FilterType>('pendientes')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [form, setForm] = useState({ title: '', description: '', priority: 'media' as 'alta' | 'media' | 'baja', due_date: '' })

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
    setTasks((data ?? []) as Task[]); setLoading(false)
  }

  useEffect(() => { fetchTasks() }, [])

  async function handleSubmit() {
    if (!form.title.trim()) { setMessage({ type: 'error', text: 'El título es obligatorio.' }); return }
    setSaving(true); setMessage(null)
    const { error } = await supabase.from('tasks').insert([{ title: form.title.trim(), description: form.description.trim() || null, priority: form.priority, due_date: form.due_date || null, completed: false }])
    if (error) { setMessage({ type: 'error', text: 'Error al guardar la tarea.' }) }
    else { setMessage({ type: 'success', text: 'Tarea creada.' }); setForm({ title: '', description: '', priority: 'media', due_date: '' }); setShowForm(false); fetchTasks() }
    setSaving(false)
  }

  async function toggleComplete(task: Task) {
    await supabase.from('tasks').update({ completed: !task.completed }).eq('id', task.id)
    fetchTasks()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await supabase.from('tasks').delete().eq('id', id)
    setDeletingId(null); setConfirmDelete(null); fetchTasks()
  }

  const today = new Date().toISOString().split('T')[0]
  const filtered = tasks.filter(t => filter === 'todas' ? true : filter === 'pendientes' ? !t.completed : t.completed)
  const urgentCount = tasks.filter(t => !t.completed && t.priority === 'alta').length
  const overdueCount = tasks.filter(t => !t.completed && t.due_date && t.due_date < today).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? '24px' : '32px', fontWeight: 900 }} className="taply-gradient-text">Tareas</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
            {tasks.filter(t => !t.completed).length} pendiente{tasks.filter(t => !t.completed).length !== 1 ? 's' : ''}
            {urgentCount > 0 && <span style={{ color: '#ff4d4d' }}> · ⚠ {urgentCount} urgente{urgentCount !== 1 ? 's' : ''}</span>}
            {overdueCount > 0 && <span style={{ color: '#ff4d4d' }}> · {overdueCount} vencida{overdueCount !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setMessage(null) }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: 'none',
            background: showForm ? '#1f1f1f' : 'linear-gradient(90deg, #00cfff, #00ff94)', color: showForm ? '#9ca3af' : '#0d0d0d' }}>
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'Cancelar' : isMobile ? 'Nueva' : 'Nueva Tarea'}
        </button>
      </div>

      {/* Alertas */}
      {overdueCount > 0 && (
        <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#ff4d4d0d', border: '1px solid #ff4d4d22', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={15} style={{ color: '#ff4d4d', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: '#ff4d4d', fontWeight: 600 }}>
            {overdueCount} tarea{overdueCount !== 1 ? 's' : ''} vencida{overdueCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div style={{ borderRadius: '16px', padding: '20px', backgroundColor: '#161616', border: '1px solid #1f1f1f', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>Nueva Tarea</h2>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>Título *</label>
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Ej: Contactar al proveedor"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>Descripción (opcional)</label>
            <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Detalles adicionales..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>Prioridad</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['alta', 'media', 'baja'] as const).map(p => {
                  const pc = PRIORITY_CONFIG[p]
                  return (
                    <button key={p} onClick={() => setForm(prev => ({ ...prev, priority: p }))}
                      style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                        backgroundColor: form.priority === p ? pc.bg : '#0d0d0d',
                        border: `1px solid ${form.priority === p ? pc.border : '#2a2a2a'}`,
                        color: form.priority === p ? pc.color : '#6b7280' }}>
                      {pc.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>Fecha límite</label>
              <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                style={{ width: '100%', padding: '9px 10px', borderRadius: '10px', fontSize: '12px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
            </div>
          </div>
          {message && showForm && <div style={{ padding: '10px 12px', borderRadius: '8px', fontSize: '13px', backgroundColor: message.type === 'success' ? '#00ff940d' : '#ff4d4d0d', border: `1px solid ${message.type === 'success' ? '#00ff9422' : '#ff4d4d22'}`, color: message.type === 'success' ? '#00ff94' : '#ff4d4d' }}>{message.text}</div>}
          <button onClick={handleSubmit} disabled={saving}
            style={{ padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', border: 'none', background: saving ? '#2a2a2a' : 'linear-gradient(90deg, #00cfff, #00ff94)', color: saving ? '#6b7280' : '#0d0d0d', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Guardando...' : 'Crear Tarea'}
          </button>
        </div>
      )}

      {message && !showForm && <div style={{ padding: '10px 12px', borderRadius: '8px', fontSize: '13px', backgroundColor: message.type === 'success' ? '#00ff940d' : '#ff4d4d0d', border: `1px solid ${message.type === 'success' ? '#00ff9422' : '#ff4d4d22'}`, color: message.type === 'success' ? '#00ff94' : '#ff4d4d' }}>{message.text}</div>}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '10px', backgroundColor: '#161616', border: '1px solid #1f1f1f', alignSelf: 'flex-start' }}>
        {([['pendientes', 'Pendientes'], ['completadas', 'Completadas'], ['todas', 'Todas']] as const).map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '7px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none',
              backgroundColor: filter === f ? '#00cfff0d' : 'transparent', color: filter === f ? '#00cfff' : '#6b7280' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Lista de tareas */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[...Array(3)].map((_, i) => <div key={i} style={{ height: '70px', borderRadius: '12px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', borderRadius: '16px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
          <CheckSquare size={28} style={{ margin: '0 auto 10px', display: 'block', color: '#374151' }} />
          <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>
            {filter === 'pendientes' ? '¡No hay tareas pendientes! 🎉' : filter === 'completadas' ? 'No hay tareas completadas.' : 'No hay tareas.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(task => {
            const pc = PRIORITY_CONFIG[task.priority]
            const isOverdue = !task.completed && task.due_date && task.due_date < today
            return (
              <div key={task.id} style={{ borderRadius: '12px', padding: '14px 16px', backgroundColor: '#161616', border: `1px solid ${task.completed ? '#1f1f1f' : isOverdue ? '#ff4d4d22' : pc.border}`, opacity: task.completed ? 0.6 : 1, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                {/* Checkbox */}
                <button onClick={() => toggleComplete(task)}
                  style={{ width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px',
                    backgroundColor: task.completed ? '#00ff940d' : 'transparent',
                    border: task.completed ? '1px solid #00ff9433' : `1px solid ${pc.border}` }}>
                  {task.completed && <span style={{ fontSize: '12px', color: '#00ff94' }}>✓</span>}
                </button>

                {/* Contenido */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: task.completed ? '#6b7280' : '#f0f0f0', textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</p>
                    <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, backgroundColor: pc.bg, color: pc.color, border: `1px solid ${pc.border}`, flexShrink: 0 }}>{pc.label}</span>
                    {isOverdue && <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, backgroundColor: '#ff4d4d0d', color: '#ff4d4d', border: '1px solid #ff4d4d22' }}>⚠ Vencida</span>}
                  </div>
                  {task.description && <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6b7280' }}>{task.description}</p>}
                  {task.due_date && <p style={{ margin: 0, fontSize: '11px', color: isOverdue ? '#ff4d4d' : '#374151' }}>📅 {formatDate(task.due_date)}</p>}
                </div>

                {/* Eliminar */}
                <div style={{ flexShrink: 0 }}>
                  {confirmDelete === task.id ? (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleDelete(task.id)} disabled={deletingId === task.id}
                        style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: '#ff4d4d', color: '#fff' }}>
                        {deletingId === task.id ? '...' : 'Sí'}
                      </button>
                      <button onClick={() => setConfirmDelete(null)}
                        style={{ padding: '5px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(task.id)}
                      style={{ padding: '6px', borderRadius: '7px', cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #1f1f1f', color: '#374151', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={e => { (e.currentTarget).style.color = '#ff4d4d' }}
                      onMouseLeave={e => { (e.currentTarget).style.color = '#374151' }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
