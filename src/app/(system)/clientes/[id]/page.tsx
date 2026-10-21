'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Client, Sale } from '@/lib/supabase'
import { PRODUCT_CONFIG } from '@/lib/supabase'
import { formatCOP, formatDate, formatDateTime, PAYMENT_METHOD_LABELS, SALE_STATUS_LABELS, generateWhatsAppLink, whatsAppSeguimientoMessage, whatsAppVentaMessage } from '@/lib/utils'
import { useIsMobile } from '@/lib/hooks'
import { ArrowLeft, User, ShoppingCart, TrendingUp, DollarSign, Ban, MessageCircle, Pencil, Check, X, Zap, Plus, Trash2, ExternalLink, Eye, Upload, Image } from 'lucide-react'

interface CustomLink { type: string; label: string; url: string }

interface NFCProfile {
  id: string; slug: string; display_name: string; tagline: string | null
  company: string | null; avatar_url: string | null; whatsapp: string | null
  email: string | null; website: string | null; instagram: string | null
  tiktok: string | null; linkedin: string | null; facebook: string | null
  youtube: string | null; location: string | null; google_reviews_url: string | null
  custom_links: CustomLink[]; is_active: boolean; views: number; template: string | null
}

const PLATFORM_OPTIONS = [
  { type: 'whatsapp',  label: 'WhatsApp',       icon: '💬', placeholder: '3001234567',             defaultLabel: 'WhatsApp' },
  { type: 'phone',     label: 'Llamada',         icon: '📞', placeholder: '3001234567',             defaultLabel: 'Llamar' },
  { type: 'instagram', label: 'Instagram',       icon: '📸', placeholder: '@usuario',               defaultLabel: 'Instagram' },
  { type: 'tiktok',    label: 'TikTok',          icon: '🎵', placeholder: '@usuario',               defaultLabel: 'TikTok' },
  { type: 'facebook',  label: 'Facebook',        icon: '👥', placeholder: 'usuario o URL completa', defaultLabel: 'Facebook' },
  { type: 'youtube',   label: 'YouTube',         icon: '▶️', placeholder: '@canal o URL',           defaultLabel: 'YouTube' },
  { type: 'linkedin',  label: 'LinkedIn',        icon: '💼', placeholder: '@usuario o URL',         defaultLabel: 'LinkedIn' },
  { type: 'email',     label: 'Email',           icon: '✉️', placeholder: 'correo@email.com',       defaultLabel: 'Email' },
  { type: 'website',   label: 'Sitio Web',       icon: '🌐', placeholder: 'www.miweb.com',          defaultLabel: 'Sitio Web' },
  { type: 'location',  label: 'Ubicación',       icon: '📍', placeholder: 'URL de Google Maps',     defaultLabel: 'Ubicación' },
  { type: 'reviews',   label: 'Reseñas Google',  icon: '⭐', placeholder: 'URL de Google Reviews',  defaultLabel: 'Reseñas Google' },
]

const TEMPLATE_PREVIEWS = [
  { id:'oscuro',    name:'Oscuro',       bg:'#0f0f14', r1:'#00d4ff', r2:'#7c3aed', acc:'#00d4ff', label:'A',  orig:true },
  { id:'fusion',    name:'Fusión ✦',     bg:'#0c0c12', r1:'#c8a84b', r2:'#7c3aed', acc:'#c8a84b', label:'★',  orig:true, badge:true },
  { id:'claro',     name:'Claro',        bg:'#f5f0ea', r1:'#c8b89a', r2:'#a08060', acc:'#8a6d4b', label:'B',  orig:true, light:true },
  { id:'dorado',    name:'Dorado',       bg:'#0b0a06', r1:'#d4a843', r2:'#b8860b', acc:'#d4a843' },
  { id:'esmeralda', name:'Esmeralda',    bg:'#070f0a', r1:'#2ecc71', r2:'#1abc9c', acc:'#2ecc71' },
  { id:'oceano',    name:'Océano',       bg:'#060c14', r1:'#3498db', r2:'#2980b9', acc:'#3498db' },
  { id:'rubi',      name:'Rubí',         bg:'#0f0609', r1:'#e74c3c', r2:'#c0392b', acc:'#e74c3c' },
  { id:'plata',     name:'Plata',        bg:'#0c0c0e', r1:'#bdc3c7', r2:'#95a5a6', acc:'#bdc3c7' },
  { id:'violeta',   name:'Violeta',      bg:'#0a0714', r1:'#9b59b6', r2:'#8e44ad', acc:'#9b59b6' },
  { id:'cobre',     name:'Cobre',        bg:'#0d0906', r1:'#e67e22', r2:'#d35400', acc:'#e67e22' },
  { id:'aurora',    name:'Aurora',       bg:'#080d12', r1:'#00d4aa', r2:'#7c3aed', acc:'#00d4aa' },
  { id:'jade',      name:'Jade',         bg:'#06100c', r1:'#1abc9c', r2:'#16a085', acc:'#1abc9c' },
  { id:'titanio',   name:'Titanio',      bg:'#0a0b0d', r1:'#7f8c8d', r2:'#95a5a6', acc:'#7f8c8d' },
  { id:'ambar',     name:'Ámbar',        bg:'#0e0b06', r1:'#f39c12', r2:'#e67e22', acc:'#f39c12' },
  { id:'zafiro',    name:'Zafiro',       bg:'#060a14', r1:'#2980b9', r2:'#1a5276', acc:'#2980b9' },
  { id:'carmesi',   name:'Carmesí',      bg:'#100608', r1:'#c0392b', r2:'#922b21', acc:'#c0392b' },
  { id:'neon',      name:'Neón',         bg:'#050512', r1:'#ff00ff', r2:'#00ffff', acc:'#ff00ff' },
  { id:'cielo',     name:'Cielo',        bg:'#060c14', r1:'#74b9ff', r2:'#0984e3', acc:'#74b9ff' },
  { id:'coral',     name:'Coral',        bg:'#110808', r1:'#fd79a8', r2:'#e84393', acc:'#fd79a8' },
  { id:'menta',     name:'Menta',        bg:'#f8fffc', r1:'#00b894', r2:'#00cec9', acc:'#00b894', light:true },
  { id:'indigo',    name:'Índigo',       bg:'#070514', r1:'#6c5ce7', r2:'#a29bfe', acc:'#6c5ce7' },
  { id:'arena',     name:'Arena',        bg:'#faf7f0', r1:'#b8860b', r2:'#a0784a', acc:'#8b6914', light:true },
  { id:'cromo',     name:'Cromo',        bg:'#0d0d0d', r1:'#dfe6e9', r2:'#b2bec3', acc:'#dfe6e9' },
]

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
    is_active: true, template: 'oscuro',
  })
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([])
  const [newLink, setNewLink] = useState({ type: '', label: '', url: '' })
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
        avatar_url: nfcRes.data.avatar_url ?? '', is_active: nfcRes.data.is_active ?? true,
        template: nfcRes.data.template ?? 'oscuro',
      })
      const existingLinks = Array.isArray(nfcRes.data.custom_links) ? nfcRes.data.custom_links : []
      const isNewFormat = existingLinks.length > 0 && typeof (existingLinks[0] as any).type === 'string'
      if (isNewFormat) {
        setCustomLinks(existingLinks)
      } else {
        const d = nfcRes.data
        const migrated: CustomLink[] = []
        if (d.whatsapp)           migrated.push({ type: 'whatsapp',  label: 'WhatsApp',          url: d.whatsapp })
        if (d.instagram)          migrated.push({ type: 'instagram', label: 'Instagram',          url: d.instagram })
        if (d.tiktok)             migrated.push({ type: 'tiktok',    label: 'TikTok',             url: d.tiktok })
        if (d.linkedin)           migrated.push({ type: 'linkedin',  label: 'LinkedIn',           url: d.linkedin })
        if (d.facebook)           migrated.push({ type: 'facebook',  label: 'Facebook',           url: d.facebook })
        if (d.youtube)            migrated.push({ type: 'youtube',   label: 'YouTube',            url: d.youtube })
        if (d.email)              migrated.push({ type: 'email',     label: 'Email',              url: d.email })
        if (d.website)            migrated.push({ type: 'website',   label: 'Sitio Web',          url: d.website })
        if (d.location)           migrated.push({ type: 'location',  label: 'Ubicación',          url: d.location })
        if (d.google_reviews_url) migrated.push({ type: 'reviews',   label: 'Reseñas Google',     url: d.google_reviews_url })
        existingLinks.forEach((l: any) => {
          if (!l.type && l.url) migrated.push({ type: 'website', label: l.label || 'Link', url: l.url })
        })
        setCustomLinks(migrated)
      }
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
    return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
  }

  function firstOfType(t: string): string | null {
    return customLinks.find(l => l.type === t)?.url?.trim() || null
  }

  async function handleSaveNFC() {
    if (!nfcForm.display_name.trim()) { setNfcMessage({ type: 'error', text: 'El nombre es obligatorio.' }); return }
    if (!nfcForm.slug.trim()) { setNfcMessage({ type: 'error', text: 'El slug (URL) es obligatorio.' }); return }
    const slugClean = generateSlug(nfcForm.slug)
    setSavingNFC(true); setNfcMessage(null)
    const payload = {
      client_id: id, slug: slugClean, display_name: nfcForm.display_name.trim(),
      tagline: nfcForm.tagline.trim() || null, company: nfcForm.company.trim() || null,
      avatar_url: nfcForm.avatar_url.trim() || null,
      whatsapp:           firstOfType('whatsapp'),
      email:              firstOfType('email'),
      website:            firstOfType('website'),
      instagram:          firstOfType('instagram'),
      tiktok:             firstOfType('tiktok'),
      linkedin:           firstOfType('linkedin'),
      facebook:           firstOfType('facebook'),
      youtube:            firstOfType('youtube'),
      location:           firstOfType('location'),
      google_reviews_url: firstOfType('reviews'),
      custom_links: customLinks,
      is_active: nfcForm.is_active, template: nfcForm.template,
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

  function selectPlatform(pOpt: typeof PLATFORM_OPTIONS[0]) {
    setNewLink({ type: pOpt.type, label: pOpt.defaultLabel, url: '' })
  }

  function addLink() {
    if (!newLink.type || !newLink.url.trim()) return
    setCustomLinks(prev => [...prev, { type: newLink.type, label: newLink.label || newLink.type, url: newLink.url.trim() }])
    setNewLink({ type: '', label: '', url: '' })
  }

  function removeLink(i: number) { setCustomLinks(prev => prev.filter((_, idx) => idx !== i)) }
  function moveLink(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= customLinks.length) return
    const arr = [...customLinks];
    [arr[i], arr[j]] = [arr[j], arr[i]]
    setCustomLinks(arr)
  }

  const completedSales = sales.filter(s => s.status === 'completada')
  const totalRevenue = completedSales.reduce((acc, s) => acc + Number(s.total_revenue), 0)
  const totalProfit = completedSales.reduce((acc, s) => acc + Number(s.total_profit), 0)
  const essentialCount = completedSales.filter(s => s.product_type === 'essential').length
  const customCount = completedSales.filter(s => s.product_type === 'custom').length
  const pendingCount = sales.filter(s => s.status === 'pendiente').length
  const pendingRevenue = sales.filter(s => s.status === 'pendiente').reduce((acc, s) => acc + Number(s.total_revenue), 0)
  const profileUrl = nfcProfile ? `https://taply-inventory.vercel.app/p/${nfcProfile.slug}` : null
  const selectedPlatformOpt = PLATFORM_OPTIONS.find(p => p.type === newLink.type)

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

      {/* Editar cliente */}
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

      {/* PERFIL NFC */}
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

            {/* Imagen */}
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

            {/* Datos básicos */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>Nombre que aparece en el perfil *</label>
                <input type="text" value={nfcForm.display_name}
                  onChange={e => { const v = e.target.value; setNfcForm(p => ({ ...p, display_name: v, ...(!nfcProfile && { slug: generateSlug(v) }) })) }}
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

            {/* GESTOR DE LINKS */}
            <div style={{ borderRadius: '12px', padding: '16px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
              <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, color: '#9ca3af' }}>🔗 Links del perfil</p>
              <p style={{ margin: '0 0 14px', fontSize: '11px', color: '#4b5563' }}>Agrega varios del mismo tipo. Toca ↑↓ para reordenar.</p>

              {customLinks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                  {customLinks.map((link, i) => {
                    const pOpt = PLATFORM_OPTIONS.find(p => p.type === link.type)
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '9px', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a' }}>
                        <span style={{ fontSize: '16px', flexShrink: 0 }}>{pOpt?.icon ?? '🔗'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '12px', color: '#f0f0f0', fontWeight: 600 }}>{link.label}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                          <button onClick={() => moveLink(i, -1)} disabled={i === 0}
                            style={{ padding: '4px 6px', borderRadius: '6px', cursor: i === 0 ? 'not-allowed' : 'pointer', backgroundColor: 'transparent', border: '1px solid #2a2a2a', color: i === 0 ? '#2a2a2a' : '#9ca3af', fontSize: '10px' }}>↑</button>
                          <button onClick={() => moveLink(i, 1)} disabled={i === customLinks.length - 1}
                            style={{ padding: '4px 6px', borderRadius: '6px', cursor: i === customLinks.length - 1 ? 'not-allowed' : 'pointer', backgroundColor: 'transparent', border: '1px solid #2a2a2a', color: i === customLinks.length - 1 ? '#2a2a2a' : '#9ca3af', fontSize: '10px' }}>↓</button>
                          <button onClick={() => removeLink(i)}
                            style={{ padding: '4px 6px', borderRadius: '6px', cursor: 'pointer', backgroundColor: '#ff4d4d0d', border: '1px solid #ff4d4d22', color: '#ff4d4d', display: 'flex', alignItems: 'center' }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, color: '#6b7280' }}>Elegir plataforma:</p>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', WebkitOverflowScrolling: 'touch' }}>
                {PLATFORM_OPTIONS.map(pOpt => {
                  const isSelected = newLink.type === pOpt.type
                  return (
                    <button key={pOpt.type} onClick={() => selectPlatform(pOpt)}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', flexShrink: 0, whiteSpace: 'nowrap',
                        backgroundColor: isSelected ? '#00cfff' : '#0d0d0d', color: isSelected ? '#0d0d0d' : '#9ca3af',
                        outline: isSelected ? 'none' : '1px solid #2a2a2a' }}>
                      <span>{pOpt.icon}</span> {pOpt.label}
                    </button>
                  )
                })}
              </div>

              {selectedPlatformOpt && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                        {selectedPlatformOpt.icon} {selectedPlatformOpt.label} — valor
                      </label>
                      <input type="text" value={newLink.url}
                        onChange={e => setNewLink(p => ({ ...p, url: e.target.value }))}
                        placeholder={selectedPlatformOpt.placeholder}
                        onKeyDown={e => e.key === 'Enter' && addLink()}
                        style={{ width: '100%', padding: '9px 11px', borderRadius: '9px', fontSize: '12px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #00cfff44', color: '#f0f0f0', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Etiqueta visible</label>
                      <input type="text" value={newLink.label}
                        onChange={e => setNewLink(p => ({ ...p, label: e.target.value }))}
                        placeholder={selectedPlatformOpt.defaultLabel}
                        onKeyDown={e => e.key === 'Enter' && addLink()}
                        style={{ width: '100%', padding: '9px 11px', borderRadius: '9px', fontSize: '12px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <button onClick={addLink} disabled={!newLink.url.trim()}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '9px', fontWeight: 700, fontSize: '13px', cursor: newLink.url.trim() ? 'pointer' : 'not-allowed', border: 'none',
                      background: newLink.url.trim() ? 'linear-gradient(90deg, #00cfff, #00ff94)' : '#2a2a2a', color: newLink.url.trim() ? '#0d0d0d' : '#6b7280' }}>
                    <Plus size={14} /> Agregar {selectedPlatformOpt.label}
                  </button>
                </div>
              )}
            </div>

            {/* Selector de plantilla */}
            <div style={{ borderRadius: '12px', padding: '16px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#9ca3af' }}>🎨 Plantilla visual del perfil</p>
              <p style={{ margin: '0 0 14px', fontSize: '11px', color: '#4b5563' }}>Diseño con ring giratorio, tipografía serif y tarjetas de vidrio</p>
              <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>✦ Propuestas Originales</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                {TEMPLATE_PREVIEWS.filter(tp => tp.orig).map(tp => {
                  const isSelected = nfcForm.template === tp.id
                  const isLight = tp.light
                  return (
                    <button key={tp.id} onClick={() => setNfcForm(p => ({ ...p, template: tp.id }))}
                      style={{ padding: 0, borderRadius: '12px', cursor: 'pointer', border: isSelected ? `2.5px solid ${tp.acc}` : '2.5px solid #2a2a2a', overflow: 'hidden', backgroundColor: 'transparent', transform: isSelected ? 'scale(1.04)' : 'scale(1)', transition: 'all 0.18s ease', outline: 'none', boxShadow: isSelected ? `0 0 18px ${tp.acc}44` : 'none' }}>
                      <div style={{ height: '76px', background: tp.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', position: 'relative' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `conic-gradient(${tp.r1}, ${tp.r2}, ${tp.r1})`, padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: tp.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '9px', fontWeight: 900, color: tp.acc, fontFamily: 'Georgia, serif' }}>{tp.label || tp.name[0]}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: tp.acc, letterSpacing: '0.03em' }}>{tp.name}</span>
                        {tp.badge && <div style={{ position: 'absolute', top: '4px', right: '4px', fontSize: '7px', fontWeight: 800, color: tp.acc, border: `1px solid ${tp.acc}44`, borderRadius: '4px', padding: '1px 4px', background: `${tp.acc}11` }}>★</div>}
                        {isSelected && <div style={{ position: 'absolute', top: '5px', left: '5px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: tp.acc, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={9} color={isLight ? '#f5f0ea' : '#0d0d0d'} strokeWidth={3} /></div>}
                      </div>
                      <div style={{ padding: '5px 6px', backgroundColor: isSelected ? `${tp.acc}14` : '#0d0d0d', textAlign: 'center', borderTop: `1px solid ${isSelected ? tp.acc + '44' : '#1f1f1f'}` }}>
                        <p style={{ margin: 0, fontSize: '9px', fontWeight: 700, color: isSelected ? tp.acc : '#6b7280' }}>ORIGINAL</p>
                      </div>
                    </button>
                  )
                })}
              </div>
              <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Colección · 20 paletas</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(82px, 1fr))', gap: '8px', maxHeight: '380px', overflowY: 'auto', paddingRight: '2px' }}>
                {TEMPLATE_PREVIEWS.filter(tp => !tp.orig).map(tp => {
                  const isSelected = nfcForm.template === tp.id
                  const isLight = tp.light
                  return (
                    <button key={tp.id} onClick={() => setNfcForm(p => ({ ...p, template: tp.id }))}
                      style={{ padding: 0, borderRadius: '10px', cursor: 'pointer', border: isSelected ? `2px solid ${tp.acc}` : '2px solid transparent', overflow: 'hidden', backgroundColor: 'transparent', transform: isSelected ? 'scale(1.04)' : 'scale(1)', transition: 'all 0.18s ease', outline: 'none', boxShadow: isSelected ? `0 0 14px ${tp.acc}44` : 'none' }}>
                      <div style={{ height: '60px', background: tp.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', position: 'relative' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: `conic-gradient(${tp.r1}, ${tp.r2}, ${tp.r1})`, padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: tp.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '7px', fontWeight: 900, color: tp.acc }}>T</span>
                          </div>
                        </div>
                        <div style={{ width: '28px', height: '2px', borderRadius: '2px', background: `linear-gradient(90deg, ${tp.r1}, ${tp.r2})` }} />
                        {isSelected && <div style={{ position: 'absolute', top: '4px', right: '4px', width: '13px', height: '13px', borderRadius: '50%', backgroundColor: tp.acc, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={8} color={isLight ? '#f5f0ea' : '#0d0d0d'} strokeWidth={3.5} /></div>}
                      </div>
                      <div style={{ padding: '5px 4px', backgroundColor: isSelected ? `${tp.acc}12` : '#0d0d0d', textAlign: 'center', borderTop: `1px solid ${isSelected ? tp.acc + '33' : '#1f1f1f'}` }}>
                        <p style={{ margin: 0, fontSize: '9px', fontWeight: 700, color: isSelected ? tp.acc : '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tp.name}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
              <p style={{ margin: '10px 0 0', fontSize: '11px', color: '#4b5563', textAlign: 'center' }}>Mismo diseño elegante · Ring giratorio · Tipografía Playfair</p>
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
