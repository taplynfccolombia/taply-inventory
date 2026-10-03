'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Client, Sale } from '@/lib/supabase'
import { PRODUCT_CONFIG } from '@/lib/supabase'
import { formatCOP, formatDate, formatDateTime, PAYMENT_METHOD_LABELS, SALE_STATUS_LABELS, generateWhatsAppLink, whatsAppSeguimientoMessage, whatsAppVentaMessage } from '@/lib/utils'
import { useIsMobile } from '@/lib/hooks'
import { ArrowLeft, User, ShoppingCart, TrendingUp, DollarSign, Ban, MessageCircle, Pencil, Check, X, Zap, Plus, Trash2, ExternalLink, Eye, Upload, Image } from 'lucide-react'

interface CustomLink { label: string; url: string; icon: string }

interface NFCProfile {
  id: string; slug: string; display_name: string; tagline: string | null
  company: string | null; avatar_url: string | null; whatsapp: string | null
  email: string | null; website: string | null; instagram: string | null
  tiktok: string | null; linkedin: string | null; facebook: string | null
  youtube: string | null; custom_links: CustomLink[]; is_active: boolean; views: number
}

export default function ClienteDetallePage() {
  const { id } = useParams()
  const router = useRouter()
  const isMobile = useIsMobile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: '', email: '', phone: '', company: '', city: '', notes: '' })

  const [nfcProfile, setNfcProfile] = useState<NFCProfile | null>(null)
  const [showNFCForm, setShowNFCForm] = useState(false)
  const [savingNFC, setSavingNFC] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [nfcMessage, setNfcMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [nfcForm, setNfcForm] = useState({
    slug: '', display_name: '', tagline: '', company: '', avatar_url: '',
    whatsapp: '', email: '', website: '', instagram: '', tiktok: '',
    linkedin: '', facebook: '', youtube: '', is_active: true,
  })
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([])
  const [newLink, setNewLink] = useState({ label: '', url: '', icon: '🔗' })
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)

  async function fetchData() {
    const [clientRes, salesRes, nfcRes] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('sales').select('*').eq('client_id', id).order('sale_date', { ascending: false }),
      supabase.from('nfc_profiles').select('*').eq('client_id', id).single(),
    ])
    setClient(clientRes.data)
    setSales(salesRes.data ?? [])
    if (nfcRes.data) {
      setNfcProfile(nfcRes.data)
      setNfcForm({
        slug: nfcRes.data.slug ?? '', display_name: nfcRes.data.display_name ?? '',
        tagline: nfcRes.data.tagline ?? '', company: nfcRes.data.company ?? '',
        avatar_url: nfcRes.data.avatar_url ?? '', whatsapp: nfcRes.data.whatsapp ?? '',
        email: nfcRes.data.email ?? '', website: nfcRes.data.website ?? '',
        instagram: nfcRes.data.instagram ?? '', tiktok: nfcRes.data.tiktok ?? '',
        linkedin: nfcRes.data.linkedin ?? '', facebook: nfcRes.data.facebook ?? '',
        youtube: nfcRes.data.youtube ?? '', is_active: nfcRes.data.is_active ?? true,
      })
      setCustomLinks(Array.isArray(nfcRes.data.custom_links) ? nfcRes.data.custom_links : [])
      setPreviewAvatar(nfcRes.data.avatar_url ?? null)
    }
    if (clientRes.data) {
      setEditForm({ full_name: clientRes.data.full_name ?? '', email: clientRes.data.email ?? '', phone: clientRes.data.phone ?? '', company: clientRes.data.company ?? '', city: clientRes.data.city ?? '', notes: clientRes.data.notes ?? '' })
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [id])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setNfcMessage({ type: 'error', text: 'La imagen debe ser menor a 2MB.' }); return }
    setUploadingImage(true); setNfcMessage(null)
    const ext = file.name.split('.').pop()
    const fileName = `${id}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('nfc-avatars').upload(fileName, file, { upsert: true })
    if (uploadError) { setNfcMessage({ type: 'error', text: `Error al subir: ${uploadError.message}` }); setUploadingImage(false); return }
    const { data: { publicUrl } } = supabase.storage.from('nfc-avatars').getPublicUrl(fileName)
    setNfcForm(p => ({ ...p, avatar_url: publicUrl }))
    setPreviewAvatar(publicUrl)
    setNfcMessage({ type: 'success', text: '✅ Imagen subida correctamente.' })
    setUploadingImage(false)
  }

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

  function generateSlug(name: string): string {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
  }

  async function handleSaveNFC() {
    if (!nfcForm.display_name.trim()) { setNfcMessage({ type: 'error', text: 'El nombre es obligatorio.' }); return }
    if (!nfcForm.slug.trim()) { setNfcMessage({ type: 'error', text: 'El slug (URL) es obligatorio.' }); return }
    const slugClean = generateSlug(nfcForm.slug)
    setSavingNFC(true); setNfcMessage(null)
    const payload = {
      client_id: id, slug: slugClean, display_name: nfcForm.display_name.trim(),
      tagline: nfcForm.tagline.trim() || null, company: nfcForm.company.trim() || null,
      avatar_url: nfcForm.avatar_url.trim() || null, whatsapp: nfcForm.whatsapp.trim() || null,
      email: nfcForm.email.trim() || null, website: nfcForm.website.trim() || null,
      instagram: nfcForm.instagram.trim() || null, tiktok: nfcForm.tiktok.trim() || null,
      linkedin: nfcForm.linkedin.trim() || null, facebook: nfcForm.facebook.trim() || null,
      youtube: nfcForm.youtube.trim() || null, custom_links: customLinks, is_active: nfcForm.is_active,
    }
    let error
    if (nfcProfile) {
      const res = await supabase.from('nfc_profiles').update(payload).eq('id', nfcProfile.id)
      error = res.error
    } else {
      const res = await supabase.from('nfc_profiles').insert([payload])
      error = res.error
    }
    if (error) { setNfcMessage({ type: 'error', text: `Error: ${error.message}` }) }
    else { setNfcMessage({ type: 'success', text: '✅ Perfil NFC guardado correctamente.' }); setShowNFCForm(false); fetchData() }
    setSavingNFC(false)
  }

  function addCustomLink() {
    if (!newLink.label.trim() || !newLink.url.trim()) return
    setCustomLinks(prev => [...prev, { ...newLink }])
    setNewLink({ label: '', url: '', icon: '🔗' })
  }

  function removeCustomLink(i: number) { setCustomLinks(prev => prev.filter((_, idx) => idx !== i)) }

  const completedSales = sales.filter(s => s.status === 'completada')
  const totalRevenue = completedSales.reduce((acc, s) => acc + Number(s.total_revenue), 0)
  const totalProfit = completedSales.reduce((acc, s) => acc + Number(s.total_profit), 0)
  const essentialCount = completedSales.filter(s => s.product_type === 'essential').length
  const customCount = completedSales.filter(s => s.product_type === 'custom').length
  const pendingCount = sales.filter(s => s.status === 'pendiente').length
  const pendingRevenue = sales.filter(s => s.status === 'pendiente').reduce((acc, s) => acc + Number(s.total_revenue), 0)
  const profileUrl = nfcProfile ? `https://taply-inventory.vercel.app/p/${nfcProfile.slug}` : null

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ height: '32px', borderRadius: '8px', backgroundColor: '#161616', width: '160px' }} />
      <div style={{ height: '160px', borderRadius: '16px', backgroundColor: '#161616' }} />
    </div>
  )

  if (!client) return (
    <div style={{ textAlign: 'center', padding: '48px' }}>
      <p style={{ color: '#ff4d4d', fontSize: '16px' }}>Cliente no encontrado.</p>
      <button onClick={() => router.push('/clientes')} style={{ marginTop: '16px', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', backgroundColor: '#161616', border: '1px solid #2a2a2a', color: '#f0f0f0', fontSize: '14px' }}>Volver</button>
    </div>
  )

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
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', backgroundColor: editing ? '#ff4d4d0d' : '#00cfff0d', border: editing ? '1px solid #ff4d4d22' : '1px solid #00cfff22', color: editing ? '#ff4d4d' : '#00cfff' }}>
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
            {[{ key: 'full_name', label: 'Nombre *', placeholder: 'Nombre completo' }, { key: 'company', label: 'Empresa', placeholder: 'Empresa' }, { key: 'email', label: 'Email', placeholder: 'correo@email.com' }, { key: 'phone', label: 'Teléfono', placeholder: '3001234567' }, { key: 'city', label: 'Ciudad', placeholder: 'Ciudad' }, { key: 'notes', label: 'Notas', placeholder: 'Observaciones' }].map(({ key, label, placeholder }) => (
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

      {/* KPIs */}
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
          {[{ label: 'Taply Essential', count: essentialCount, color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22' }, { label: 'Taply Custom', count: customCount, color: '#00ff94', bg: '#00ff940d', border: '#00ff9422' }].map(({ label, count, color, bg, border }) => (
            <div key={label} style={{ borderRadius: '12px', padding: '14px 16px', backgroundColor: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#f0f0f0' }}>{label}</span>
              <span style={{ fontSize: '24px', fontWeight: 900, color }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* ⚡ PERFIL NFC */}
      <div style={{ borderRadius: '16px', overflow: 'hidden', border: nfcProfile ? '1px solid #00cfff22' : '1px dashed #2a2a2a' }}>
        <div style={{ padding: '18px 20px', backgroundColor: nfcProfile ? '#00cfff0d' : '#161616', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {nfcProfile?.avatar_url ? (
              <img src={nfcProfile.avatar_url} alt={nfcProfile.display_name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00cfff33' }} />
            ) : (
              <Zap size={18} style={{ color: '#00cfff' }} />
            )}
            <div>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f0f0f0' }}>Perfil NFC</h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>
                {nfcProfile ? `taply-inventory.vercel.app/p/${nfcProfile.slug}` : 'Sin perfil configurado'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {nfcProfile && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, backgroundColor: '#6b72800d', border: '1px solid #6b728022', color: '#6b7280' }}>
                  <Eye size={11} /> {nfcProfile.views} vistas
                </div>
                <a href={profileUrl!} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', backgroundColor: '#00ff940d', border: '1px solid #00ff9422', color: '#00ff94' }}>
                  <ExternalLink size={12} /> Ver perfil
                </a>
              </>
            )}
            <button onClick={() => { setShowNFCForm(!showNFCForm); setNfcMessage(null) }}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none',
                background: showNFCForm ? '#1f1f1f' : 'linear-gradient(90deg, #00cfff, #00ff94)', color: showNFCForm ? '#9ca3af' : '#0d0d0d' }}>
              {showNFCForm ? <><X size={12} /> Cancelar</> : nfcProfile ? <><Pencil size={12} /> Editar</> : <><Plus size={12} /> Crear Perfil</>}
            </button>
          </div>
        </div>

        {showNFCForm && (
          <div style={{ padding: '20px', backgroundColor: '#0d0d0d', borderTop: '1px solid #1f1f1f', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Upload de imagen */}
            <div style={{ borderRadius: '12px', padding: '16px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
              <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#9ca3af' }}>📸 Logo o foto del perfil</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: '2px solid #00cfff33', backgroundColor: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {previewAvatar ? (
                    <img src={previewAvatar} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Image size={24} style={{ color: '#374151' }} />
                  )}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: uploadingImage ? 'not-allowed' : 'pointer', backgroundColor: '#00cfff0d', border: '1px solid #00cfff33', color: '#00cfff' }}>
                    <Upload size={14} />
                    {uploadingImage ? 'Subiendo...' : previewAvatar ? 'Cambiar imagen' : 'Subir imagen'}
                  </button>
                  <p style={{ margin: 0, fontSize: '11px', color: '#4b5563' }}>PNG, JPG o WebP · Máx. 2MB · Se recomienda cuadrada</p>
                  {previewAvatar && (
                    <button onClick={() => { setPreviewAvatar(null); setNfcForm(p => ({ ...p, avatar_url: '' })) }}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #ff4d4d22', color: '#ff4d4d', alignSelf: 'flex-start' }}>
                      <X size={11} /> Quitar imagen
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>Nombre que aparece en el perfil *</label>
                <input type="text" value={nfcForm.display_name} onChange={e => { setNfcForm(p => ({ ...p, display_name: e.target.value })); if (!nfcProfile) setNfcForm(p => ({ ...p, slug: generateSlug(e.target.value) })) }}
                  placeholder="Ej: Juan García"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#161616', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>Slug (URL única) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#4b5563' }}>/p/</span>
                  <input type="text" value={nfcForm.slug} onChange={e => setNfcForm(p => ({ ...p, slug: generateSlug(e.target.value) }))}
                    placeholder="juan-garcia"
                    style={{ width: '100%', padding: '10px 12px 10px 32px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#161616', border: '1px solid #00cfff33', color: '#00cfff', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>Tagline / Cargo</label>
                <input type="text" value={nfcForm.tagline} onChange={e => setNfcForm(p => ({ ...p, tagline: e.target.value }))} placeholder="Ej: Diseñador Gráfico · Bogotá"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#161616', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>Empresa</label>
                <input type="text" value={nfcForm.company} onChange={e => setNfcForm(p => ({ ...p, company: e.target.value }))} placeholder="Nombre de la empresa"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#161616', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ borderRadius: '12px', padding: '16px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
              <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#9ca3af' }}>📱 Links del perfil</p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                {[
                  { key: 'whatsapp', label: '💬 WhatsApp', placeholder: '3001234567' },
                  { key: 'instagram', label: '📸 Instagram', placeholder: '@usuario' },
                  { key: 'tiktok', label: '🎵 TikTok', placeholder: '@usuario' },
                  { key: 'linkedin', label: '💼 LinkedIn', placeholder: '@usuario o URL' },
                  { key: 'facebook', label: '👥 Facebook', placeholder: 'usuario o URL' },
                  { key: 'youtube', label: '▶️ YouTube', placeholder: '@canal' },
                  { key: 'email', label: '✉️ Email', placeholder: 'correo@email.com' },
                  { key: 'website', label: '🌐 Sitio Web', placeholder: 'www.miweb.com' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '5px' }}>{label}</label>
                    <input type="text" value={nfcForm[key as keyof typeof nfcForm] as string} onChange={e => setNfcForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                      style={{ width: '100%', padding: '9px 11px', borderRadius: '9px', fontSize: '12px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Links personalizados */}
            <div style={{ borderRadius: '12px', padding: '16px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
              <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#9ca3af' }}>🔗 Links personalizados</p>
              {customLinks.map((link, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', padding: '10px 12px', borderRadius: '9px', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a' }}>
                  <span style={{ fontSize: '16px' }}>{link.icon}</span>
                  <span style={{ flex: 1, fontSize: '12px', color: '#f0f0f0', fontWeight: 600 }}>{link.label}</span>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>{link.url.substring(0, 25)}{link.url.length > 25 ? '...' : ''}</span>
                  <button onClick={() => removeCustomLink(i)} style={{ padding: '4px', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', border: 'none', color: '#ff4d4d', display: 'flex', alignItems: 'center' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 60px auto', gap: '8px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Etiqueta</label>
                  <input type="text" value={newLink.label} onChange={e => setNewLink(p => ({ ...p, label: e.target.value }))} placeholder="Ej: Mi portafolio"
                    style={{ width: '100%', padding: '9px 11px', borderRadius: '9px', fontSize: '12px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>URL</label>
                  <input type="text" value={newLink.url} onChange={e => setNewLink(p => ({ ...p, url: e.target.value }))} placeholder="https://..."
                    style={{ width: '100%', padding: '9px 11px', borderRadius: '9px', fontSize: '12px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Emoji</label>
                  <input type="text" value={newLink.icon} onChange={e => setNewLink(p => ({ ...p, icon: e.target.value }))}
                    style={{ width: '100%', padding: '9px 11px', borderRadius: '9px', fontSize: '14px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box', textAlign: 'center' }} />
                </div>
                <button onClick={addCustomLink} disabled={!newLink.label.trim() || !newLink.url.trim()}
                  style={{ padding: '9px 14px', borderRadius: '9px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: 'none', background: 'linear-gradient(90deg, #00cfff, #00ff94)', color: '#0d0d0d' }}>
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Toggle activo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
              <button onClick={() => setNfcForm(p => ({ ...p, is_active: !p.is_active }))}
                style={{ width: '44px', height: '24px', borderRadius: '999px', cursor: 'pointer', border: 'none', position: 'relative', backgroundColor: nfcForm.is_active ? '#00ff94' : '#2a2a2a', transition: 'background-color 0.2s ease', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: '3px', left: nfcForm.is_active ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s ease' }} />
              </button>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: nfcForm.is_active ? '#00ff94' : '#6b7280' }}>{nfcForm.is_active ? 'Perfil activo' : 'Perfil inactivo'}</p>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#4b5563' }}>{nfcForm.is_active ? 'Visible públicamente' : 'No visible'}</p>
              </div>
            </div>

            {nfcMessage && <div style={{ padding: '10px 12px', borderRadius: '8px', fontSize: '13px', backgroundColor: nfcMessage.type === 'success' ? '#00ff940d' : '#ff4d4d0d', border: `1px solid ${nfcMessage.type === 'success' ? '#00ff9422' : '#ff4d4d22'}`, color: nfcMessage.type === 'success' ? '#00ff94' : '#ff4d4d' }}>{nfcMessage.text}</div>}

            <button onClick={handleSaveNFC} disabled={savingNFC}
              style={{ padding: '13px', borderRadius: '12px', fontWeight: 800, fontSize: '14px', border: 'none', background: savingNFC ? '#2a2a2a' : 'linear-gradient(90deg, #00cfff, #00ff94)', color: savingNFC ? '#6b7280' : '#0d0d0d', cursor: savingNFC ? 'not-allowed' : 'pointer' }}>
              {savingNFC ? 'Guardando...' : nfcProfile ? '⚡ Actualizar Perfil NFC' : '⚡ Crear Perfil NFC'}
            </button>
          </div>
        )}
      </div>

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
                          <span style={{ padding: '3px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 600, backgroundColor: sale.status === 'completada' ? '#00ff940d' : sale.status === 'pendiente' ? '#ffb5470d' : '#ff4d4d0d', color: sale.status === 'completada' ? '#00ff94' : sale.status === 'pendiente' ? '#ffb547' : '#ff4d4d' }}>
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
