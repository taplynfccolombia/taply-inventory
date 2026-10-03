'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Client } from '@/lib/supabase'
import { formatDate, exportToCSV } from '@/lib/utils'
import { useIsMobile } from '@/lib/hooks'
import { Users, Plus, X, Search, Trash2, ChevronRight, Download } from 'lucide-react'

export default function ClientesPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
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
    setClients(data ?? []); setLoading(false)
  }

  useEffect(() => { fetchClients() }, [])

  async function handleSubmit() {
    if (!form.full_name.trim()) { setMessage({ type: 'error', text: 'El nombre es obligatorio.' }); return }
    setSaving(true); setMessage(null)
    const { error } = await supabase.from('clients').insert([{ full_name: form.full_name.trim(), email: form.email.trim() || null, phone: form.phone.trim() || null, company: form.company.trim() || null, city: form.city.trim() || null, notes: form.notes.trim() || null }])
    if (error) { setMessage({ type: 'error', text: 'Error al guardar.' }) }
    else { setMessage({ type: 'success', text: 'Cliente registrado.' }); setForm({ full_name: '', email: '', phone: '', company: '', city: '', notes: '' }); setShowForm(false); fetchClients() }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) { setMessage({ type: 'error', text: 'Error al eliminar.' }) }
    else { setMessage({ type: 'success', text: 'Cliente eliminado.' }); fetchClients() }
    setDeletingId(null); setConfirmDelete(null)
  }

  function handleExportCSV() {
    exportToCSV(clients.map(c => ({ Nombre: c.full_name, Empresa: c.company ?? '', Email: c.email ?? '', Teléfono: c.phone ?? '', Ciudad: c.city ?? '', Notas: c.notes ?? '', 'Fecha Registro': formatDate(c.created_at) })), 'Taply_Clientes')
  }

  const filtered = clients.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? '24px' : '32px', fontWeight: 900 }} className="taply-gradient-text">Clientes</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>{clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleExportCSV} disabled={clients.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>
            <Download size={14} /> CSV
          </button>
          <button onClick={() => { setShowForm(!showForm); setMessage(null) }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: 'none',
              background: showForm ? '#1f1f1f' : 'linear-gradient(90deg, #00cfff, #00ff94)', color: showForm ? '#9ca3af' : '#0d0d0d' }}>
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Cancelar' : isMobile ? 'Nuevo' : 'Nuevo Cliente'}
          </button>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div style={{ borderRadius: '16px', padding: '20px', backgroundColor: '#161616', border: '1px solid #1f1f1f', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>Nuevo Cliente</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
            {[
              { key: 'full_name', label: 'Nombre *', placeholder: 'Juan García' },
              { key: 'company', label: 'Empresa', placeholder: 'Mi Empresa S.A.S' },
              { key: 'email', label: 'Email', placeholder: 'juan@email.com' },
              { key: 'phone', label: 'Teléfono / WhatsApp', placeholder: '3001234567' },
              { key: 'city', label: 'Ciudad', placeholder: 'Bogotá' },
              { key: 'notes', label: 'Notas', placeholder: 'Observaciones' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>{label}</label>
                <input type="text" value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          {message && showForm && <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', backgroundColor: message.type === 'success' ? '#00ff940d' : '#ff4d4d0d', border: `1px solid ${message.type === 'success' ? '#00ff9422' : '#ff4d4d22'}`, color: message.type === 'success' ? '#00ff94' : '#ff4d4d' }}>{message.text}</div>}
          <button onClick={handleSubmit} disabled={saving}
            style={{ padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', border: 'none', background: saving ? '#2a2a2a' : 'linear-gradient(90deg, #00cfff, #00ff94)', color: saving ? '#6b7280' : '#0d0d0d', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Guardando...' : 'Guardar Cliente'}
          </button>
        </div>
      )}

      {message && !showForm && <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', backgroundColor: message.type === 'success' ? '#00ff940d' : '#ff4d4d0d', border: `1px solid ${message.type === 'success' ? '#00ff9422' : '#ff4d4d22'}`, color: message.type === 'success' ? '#00ff94' : '#ff4d4d' }}>{message.text}</div>}

      {/* Buscador */}
      <div style={{ position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, empresa o email..."
          style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '12px', fontSize: '14px', outline: 'none', backgroundColor: '#161616', border: '1px solid #1f1f1f', color: '#f0f0f0', boxSizing: 'border-box' }} />
      </div>

      {/* Lista móvil o tabla desktop */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loading ? [...Array(3)].map((_, i) => <div key={i} style={{ height: '72px', borderRadius: '12px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }} />)
            : filtered.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#4b5563', borderRadius: '16px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
                <Users size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                {search ? 'No se encontraron clientes.' : 'Sin clientes registrados.'}
              </div>
            ) : filtered.map(client => (
              <div key={client.id} onClick={() => router.push(`/clientes/${client.id}`)}
                style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: '#161616', border: '1px solid #1f1f1f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#00cfff0d', border: '1px solid #00cfff22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#00cfff' }}>{client.full_name.charAt(0).toUpperCase()}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f0f0f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.full_name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>{client.company ?? client.phone ?? client.city ?? formatDate(client.created_at)}</p>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  {confirmDelete === client.id ? (
                    <>
                      <button onClick={() => handleDelete(client.id)} disabled={deletingId === client.id}
                        style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: '#ff4d4d', color: '#fff' }}>
                        {deletingId === client.id ? '...' : 'Sí'}
                      </button>
                      <button onClick={() => setConfirmDelete(null)}
                        style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>No</button>
                    </>
                  ) : (
                    <>
                      <ChevronRight size={16} style={{ color: '#4b5563' }} />
                      <button onClick={() => setConfirmDelete(client.id)}
                        style={{ padding: '6px', borderRadius: '7px', cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #1f1f1f', color: '#374151', display: 'flex', alignItems: 'center' }}>
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #1f1f1f' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#161616', borderBottom: '1px solid #1f1f1f' }}>
                {['Nombre', 'Empresa', 'Teléfono', 'Ciudad', 'Registrado', ''].map((h, i) => (
                  <th key={i} style={{ textAlign: 'left', padding: '14px 18px', fontWeight: 600, color: '#6b7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(3)].map((_, i) => <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} style={{ padding: '14px 18px' }}><div style={{ height: '14px', borderRadius: '6px', backgroundColor: '#1f1f1f' }} /></td>)}</tr>)
                : filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#4b5563' }}>
                    <Users size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                    {search ? 'No se encontraron clientes.' : 'Sin clientes registrados.'}
                  </td></tr>
                ) : filtered.map((client, i) => (
                  <tr key={client.id} style={{ backgroundColor: i % 2 === 0 ? '#0d0d0d' : '#111111', borderBottom: '1px solid #161616', cursor: 'pointer' }} onClick={() => router.push(`/clientes/${client.id}`)}>
                    <td style={{ padding: '14px 18px', fontWeight: 500, color: '#f0f0f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: '#00cfff0d', border: '1px solid #00cfff22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#00cfff' }}>{client.full_name.charAt(0).toUpperCase()}</span>
                        </div>
                        {client.full_name}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#9ca3af' }}>{client.company ?? '—'}</td>
                    <td style={{ padding: '14px 18px', color: '#9ca3af' }}>{client.phone ?? '—'}</td>
                    <td style={{ padding: '14px 18px', color: '#9ca3af' }}>{client.city ?? '—'}</td>
                    <td style={{ padding: '14px 18px', color: '#6b7280' }}>{formatDate(client.created_at)}</td>
                    <td style={{ padding: '14px 18px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button onClick={() => router.push(`/clientes/${client.id}`)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: '#00cfff0d', border: '1px solid #00cfff22', color: '#00cfff' }}>
                          Ver <ChevronRight size={12} />
                        </button>
                        {confirmDelete === client.id ? (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => handleDelete(client.id)} disabled={deletingId === client.id}
                              style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: '#ff4d4d', color: '#fff' }}>
                              {deletingId === client.id ? '...' : 'Sí'}
                            </button>
                            <button onClick={() => setConfirmDelete(null)}
                              style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#6b7280' }}>No</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(client.id)}
                            style={{ padding: '6px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #1f1f1f', color: '#374151', display: 'flex', alignItems: 'center' }}
                            onMouseEnter={e => { (e.currentTarget).style.color = '#ff4d4d' }}
                            onMouseLeave={e => { (e.currentTarget).style.color = '#374151' }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
