'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { Clipboard, Download, ExternalLink, Printer, QrCode, RotateCw, Search, UserRound } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useIsMobile } from '@/lib/hooks'

const PUBLIC_PROFILE_BASE_URL = 'https://taply-inventory.vercel.app'

interface ClientWithProfile {
  id: string
  full_name: string
  company: string | null
  profile: { slug: string; display_name: string; is_active: boolean } | null
}

export default function CodigosQRPage() {
  const isMobile = useIsMobile()
  const [clients, setClients] = useState<ClientWithProfile[]>([])
  const [qrImages, setQrImages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [clientsRes, profilesRes] = await Promise.all([
        supabase.from('clients').select('id, full_name, company').order('full_name'),
        supabase.from('nfc_profiles').select('client_id, slug, display_name, is_active'),
      ])
      if (clientsRes.error || profilesRes.error) {
        if (!cancelled) {
          setError('No se pudieron cargar los clientes y sus perfiles QR.')
          setLoading(false)
        }
        return
      }

      const profileByClient = new Map((profilesRes.data ?? []).map(profile => [profile.client_id, profile]))
      const rows: ClientWithProfile[] = (clientsRes.data ?? []).map(client => {
        const profile = profileByClient.get(client.id)
        return {
          ...client,
          profile: profile ? { slug: profile.slug, display_name: profile.display_name, is_active: profile.is_active } : null,
        }
      })

      const generated = await Promise.all(rows.map(async client => {
        if (!client.profile) return [client.id, ''] as const
        const url = `${PUBLIC_PROFILE_BASE_URL}/p/${client.profile.slug}`
        try {
          return [client.id, await QRCode.toDataURL(url, { width: 320, margin: 2, errorCorrectionLevel: 'H' })] as const
        } catch {
          return [client.id, ''] as const
        }
      }))

      if (!cancelled) {
        setClients(rows)
        setQrImages(Object.fromEntries(generated))
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const filteredClients = useMemo(() => clients.filter(client =>
    client.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (client.company ?? '').toLowerCase().includes(search.toLowerCase()),
  ), [clients, search])

  const printableClients = filteredClients.filter(client => client.profile?.is_active && qrImages[client.id])
  const selectedVisibleCount = printableClients.filter(client => selectedIds.includes(client.id)).length

  async function copyProfileLink(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setFeedback('Enlace copiado.')
    } catch {
      setFeedback('No se pudo copiar el enlace. Puedes abrir el perfil y copiarlo desde el navegador.')
    }
  }

  async function regenerateQR(client: ClientWithProfile) {
    if (!client.profile) return
    try {
      const url = `${PUBLIC_PROFILE_BASE_URL}/p/${client.profile.slug}`
      const qr = await QRCode.toDataURL(url, { width: 320, margin: 2, errorCorrectionLevel: 'H' })
      setQrImages(current => ({ ...current, [client.id]: qr }))
      setFeedback(`QR de ${client.full_name} regenerado.`)
    } catch {
      setFeedback('No se pudo generar el código QR.')
    }
  }

  function printSelected() {
    const selected = printableClients.filter(client => selectedIds.includes(client.id))
    if (selected.length === 0) {
      setFeedback('Selecciona al menos un perfil activo para imprimir.')
      return
    }
    const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) {
      setFeedback('Permite las ventanas emergentes para abrir la hoja de impresión.')
      return
    }
    const cards = selected.map(client => `
      <article><img src="${qrImages[client.id]}" alt="QR ${escapeHtml(client.full_name)}" />
      <h2>${escapeHtml(client.profile!.display_name)}</h2><p>${escapeHtml(client.company ?? '')}</p>
      <small>${escapeHtml(`${PUBLIC_PROFILE_BASE_URL}/p/${client.profile!.slug}`)}</small></article>
    `).join('')
    printWindow.document.open()
    printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Códigos QR Taply</title>
      <style>body{font-family:Arial,sans-serif;margin:20px;color:#111}.sheet{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}article{border:1px solid #ccc;border-radius:10px;padding:14px;text-align:center;break-inside:avoid}img{width:170px;height:170px}h2{font-size:16px;margin:8px 0 4px}p{font-size:12px;margin:0 0 6px}small{font-size:9px;word-break:break-all}@media print{body{margin:8mm}.sheet{gap:8mm}}</style>
      </head><body><main class="sheet">${cards}</main></body></html>`)
    printWindow.document.close()
    window.setTimeout(() => printWindow.print(), 500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 className="taply-gradient-text" style={{ margin: 0, fontSize: isMobile ? '24px' : '32px', fontWeight: 900 }}>Códigos QR</h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
          Cada código abre el perfil público del cliente. Los clientes nuevos reciben su QR automáticamente.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setSelectedIds(selectedVisibleCount === printableClients.length
          ? selectedIds.filter(id => !printableClients.some(client => client.id === id))
          : [...new Set([...selectedIds, ...printableClients.map(client => client.id)])])} disabled={printableClients.length === 0}
          style={{ padding: '9px 12px', borderRadius: '9px', border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#9ca3af', cursor: printableClients.length ? 'pointer' : 'not-allowed', fontSize: '12px', fontWeight: 600 }}>
          {selectedVisibleCount === printableClients.length && printableClients.length ? 'Quitar selección' : 'Seleccionar todos'}
        </button>
        <button onClick={printSelected} disabled={selectedIds.filter(id => printableClients.some(client => client.id === id)).length === 0}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 12px', borderRadius: '9px', border: 'none', backgroundColor: '#00cfff', color: '#0d0d0d', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
          <Printer size={14} /> Imprimir seleccionados
        </button>
        {feedback && <span role="status" style={{ fontSize: '12px', color: '#00ff94' }}>{feedback}</span>}
      </div>

      <div style={{ position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por nombre o empresa..."
          style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '12px', fontSize: '14px', outline: 'none', backgroundColor: '#161616', border: '1px solid #1f1f1f', color: '#f0f0f0', boxSizing: 'border-box' }} />
      </div>

      {error && <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#ff4d4d0d', border: '1px solid #ff4d4d22', color: '#ff4d4d', fontSize: '13px' }}>{error}</div>}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(270px, 1fr))', gap: '12px' }}>
          {[1, 2, 3].map(item => <div key={item} style={{ height: '280px', borderRadius: '16px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }} />)}
        </div>
      ) : filteredClients.length === 0 ? (
        <div style={{ padding: '44px 24px', borderRadius: '16px', textAlign: 'center', backgroundColor: '#161616', border: '1px solid #1f1f1f', color: '#6b7280' }}>
          <QrCode size={30} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
          <p style={{ margin: 0 }}>{search ? 'No hay clientes que coincidan con la búsqueda.' : 'Aún no hay clientes registrados.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(270px, 1fr))', gap: '12px' }}>
          {filteredClients.map(client => {
            const profile = client.profile
            const profileUrl = profile ? `${PUBLIC_PROFILE_BASE_URL}/p/${profile.slug}` : null
            const qrImage = qrImages[client.id]
            return (
              <article key={client.id} style={{ padding: '18px', borderRadius: '16px', backgroundColor: '#161616', border: '1px solid #1f1f1f', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#00cfff0d', border: '1px solid #00cfff22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00cfff', flexShrink: 0 }}><UserRound size={17} /></div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: 0, color: '#f0f0f0', fontWeight: 700, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.full_name}</p>
                    <p style={{ margin: '3px 0 0', color: '#6b7280', fontSize: '12px' }}>{client.company ?? 'Perfil Taply'}</p>
                  </div>
                </div>

                {profile && qrImage ? (
                  <>
                    {profile.is_active && (
                      <label style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '7px', color: '#9ca3af', fontSize: '12px' }}>
                        <input type="checkbox" checked={selectedIds.includes(client.id)} onChange={event => setSelectedIds(current => event.target.checked ? [...new Set([...current, client.id])] : current.filter(id => id !== client.id))} />
                        Incluir en impresión
                      </label>
                    )}
                    <div style={{ width: '190px', height: '190px', padding: '10px', borderRadius: '12px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={qrImage} alt={`Código QR del perfil de ${client.full_name}`} width="170" height="170" style={{ display: 'block', width: '100%', height: '100%' }} />
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, color: profile.is_active ? '#00ff94' : '#ffb547', backgroundColor: profile.is_active ? '#00ff940d' : '#ffb5470d' }}>
                      {profile.is_active ? 'Perfil activo' : 'Perfil inactivo'}
                    </span>
                    {!profile.is_active && <p style={{ margin: 0, color: '#ffb547', fontSize: '12px', textAlign: 'center' }}>QR en borrador. Activa el perfil al terminar de configurarlo.</p>}
                    <div style={{ width: '100%', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => regenerateQR(client)} style={{ flex: '1 1 40%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', padding: '9px 10px', borderRadius: '9px', textDecoration: 'none', fontSize: '12px', fontWeight: 700, backgroundColor: '#0d0d0d', color: '#00cfff', border: '1px solid #00cfff33', cursor: 'pointer' }}>
                        <RotateCw size={14} /> Regenerar
                      </button>
                      {profile.is_active && <a href={qrImage} download={`taply-${profile.slug}-qr.png`} style={{ flex: '1 1 45%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', padding: '9px 10px', borderRadius: '9px', textDecoration: 'none', fontSize: '12px', fontWeight: 700, background: 'linear-gradient(90deg, #00cfff, #00ff94)', color: '#0d0d0d' }}><Download size={14} /> Descargar PNG</a>}
                      {profile.is_active && <button onClick={() => copyProfileLink(profileUrl!)} title="Copiar enlace del perfil" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 11px', borderRadius: '9px', color: '#00cfff', border: '1px solid #00cfff33', background: 'transparent', cursor: 'pointer' }}><Clipboard size={15} /></button>}
                      {profile.is_active && <a href={profileUrl!} target="_blank" rel="noreferrer" title="Vista previa del perfil" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 11px', borderRadius: '9px', color: '#00cfff', border: '1px solid #00cfff33', textDecoration: 'none' }}><ExternalLink size={15} /></a>}
                    </div>
                    <Link href={`/clientes/${client.id}`} style={{ color: '#6b7280', fontSize: '12px', textDecoration: 'none' }}>Administrar perfil</Link>
                  </>
                ) : (
                  <div style={{ width: '100%', minHeight: '190px', padding: '20px', borderRadius: '12px', border: '1px dashed #2a2a2a', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '10px', textAlign: 'center' }}>
                    <QrCode size={30} style={{ color: '#4b5563' }} />
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Este cliente aún no tiene perfil QR.</p>
                    <Link href={`/clientes/${client.id}`} style={{ color: '#00cfff', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>Configurar perfil</Link>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
