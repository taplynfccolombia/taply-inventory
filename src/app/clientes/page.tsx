'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Client } from '@/lib/supabase'
import { formatDate, exportToCSV } from '@/lib/utils'
import { Users, Plus, X, Search, Trash2, ChevronRight, Download } from 'lucide-react'

export default function ClientesPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', company: '', city: '', notes: '' })

  async function fetchClients() {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchClients() }, [])

  async function handleSubmit() {
    if (!form.full_name.trim()) { setMessage({ type: 'error', text: 'El nombre es obligatorio.' }); return }
    setSaving(true); setMessage(null)
    const { error } = await supabase.from('clients').insert([{
      full_name: form.full_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      city: form.city.trim() || null,
      notes: form.notes.trim() || null,
    }])
    if (error) { setMessage({ type: 'error', text: 'Error al guardar el cliente.' }) }
    else {
      setMessage({ type: 'success', text: 'Cliente registrado exitosamente.' })
      setForm({ full_name: '', email: '', phone: '', company: '', city: '', notes: '' })
      setShowForm(false); fetchClients()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) { setMessage({ type: 'error', text: 'Error al eliminar el cliente.' }) }
    else { setMessage({ type: 'success', text: 'Cliente eliminado correctamente.' }); fetchClients() }
    setDeletingId(null); setConfirmDelete(null)
  }

  function handleExportCSV() {
    const data = clients.map(c => ({
      Nombre: c.full_name,
      Empresa: c.company ?? '',
      Email: c.email ?? '',
      Teléfono: c.phone ?? '',
      Ciudad: c.city ?? '',
      Notas: c.notes ?? '',
      'Fecha Registro': formatDate(c.created_at),
    }))
    exportToCSV(data, 'Taply_Clientes')
  }

  const filtered = clients.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }} className="taply-gradient-text">Clientes</h1>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} disabled={clients.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', borderRadius: '12px', fontWeight: 600, fontSize: '13px', cursor: clients.length === 0 ? 'not-allowed' : 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
            <Download size={15} /> CSV
          </button>
          <button onClick={() => { setShowForm(!showForm); setMessage(null) }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none',
              background: showForm ? '#1f1f1f' : 'linear-gradient(90deg, #00cfff, #00ff94)',
              color: showForm ? '#9ca3af' : '#0d0d0d' }}>
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancelar' : 'Nuevo Cliente'}
          </button>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div style={{ borderRadius: '16px', padding: '32px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 700, color: '#f0f0f0' }}>Registrar Nuevo Cliente</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { key: 'full_name', label: 'Nombre completo *', placeholder: 'Ej: Juan García' },
              { key: 'company',   label: 'Empresa',           placeholder: 'Ej: Restaurante La Plaza' },
              { key: 'email',     label: 'Correo electrónico',placeholder: 'juan@email.com' },
              { key: 'phone',     label: 'Teléfono / WhatsApp',placeholder: '3001234567' },
              { key: 'city',      label: 'Ciudad',            placeholder: 'Ej: Bogotá' },
              { key: 'notes',     label: 'Notas',             placeholder: 'Observaciones adicionales' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#9ca3af', marginBottom: '8px' }}>{label}</label>
                <input type="text" value={form[key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
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
            {saving ? 'Guardando...' : 'Guardar Cliente'}
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

      {/* Buscador */}
      <div style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, empresa o email..."
          style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', fontSize: '14px', outline: 'none', backgroundColor: '#161616', border: '1px solid #1f1f1f', color: '#f0f0f0', boxSizing: 'border-box' }} />
      </div>

      {/* Tabla */}
      <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #1f1f1f' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#161616', borderBottom: '1px solid #1f1f1f' }}>
              {['Nombre', 'Empresa', 'Teléfono', 'Ciudad', 'Registrado', ''].map((h, i) => (
                <th key={i} style={{ textAlign: 'left', padding: '16px 20px', fontWeight: 600, color: '#6b7280' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #161616' }}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} style={{ padding: '16px 20px' }}>
                      <div style={{ height: '16px', borderRadius: '6px', backgroundColor: '#1f1f1f' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#4b5563' }}>
                  <Users size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                  {search ? 'No se encontraron clientes.' : 'Aún no hay clientes registrados.'}
                </td>
              </tr>
            ) : (
              filtered.map((client, i) => (
                <tr key={client.id}
                  style={{ backgroundColor: i % 2 === 0 ? '#0d0d0d' : '#111111', borderBottom: '1px solid #161616', cursor: 'pointer' }}
                  onClick={() => router.push(`/clientes/${client.id}`)}>
                  <td style={{ padding: '16px 20px', fontWeight: 500, color: '#f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#00cfff0d', border: '1px solid #00cfff22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#00cfff' }}>
                          {client.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {client.full_name}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#9ca3af' }}>{client.company ?? '—'}</td>
                  <td style={{ padding: '16px 20px', color: '#9ca3af' }}>{client.phone ?? '—'}</td>
                  <td style={{ padding: '16px 20px', color: '#9ca3af' }}>{client.city ?? '—'}</td>
                  <td style={{ padding: '16px 20px', color: '#6b7280' }}>{formatDate(client.created_at)}</td>
                  <td style={{ padding: '16px 20px' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button onClick={() => router.push(`/clientes/${client.id}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: '#00cfff0d', border: '1px solid #00cfff22', color: '#00cfff' }}>
                        Ver <ChevronRight size={12} />
                      </button>
                      {confirmDelete === client.id ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button onClick={() => handleDelete(client.id)} disabled={deletingId === client.id}
                            style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: '#ff4d4d', color: '#fff' }}>
                            {deletingId === client.id ? '...' : 'Sí'}
                          </button>
                          <button onClick={() => setConfirmDelete(null)}
                            style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
                            No
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(client.id)}
                          style={{ padding: '6px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #1f1f1f', color: '#374151', display: 'flex', alignItems: 'center' }}
                          onMouseEnter={e => { (e.currentTarget).style.backgroundColor = '#ff4d4d0d'; (e.currentTarget).style.color = '#ff4d4d' }}
                          onMouseLeave={e => { (e.currentTarget).style.backgroundColor = 'transparent'; (e.currentTarget).style.color = '#374151' }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
