'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface CustomLink { label: string; url: string; icon?: string }

interface NFCProfile {
  id: string; slug: string; display_name: string; tagline: string | null
  company: string | null; avatar_url: string | null; whatsapp: string | null
  email: string | null; website: string | null; instagram: string | null
  tiktok: string | null; linkedin: string | null; facebook: string | null
  youtube: string | null; custom_links: CustomLink[]; is_active: boolean; views: number
}

export default function ProfilePage() {
  const params = useParams()
  const slug = params.slug as string
  const [profile, setProfile] = useState<NFCProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from('nfc_profiles').select('*').eq('slug', slug).eq('is_active', true).single()
      if (error || !data) { setNotFound(true) }
      else {
        setProfile(data as NFCProfile)
        // Incrementar vistas automáticamente
        await supabase.rpc('increment_profile_views', { profile_slug: slug })
      }
      setLoading(false)
    }
    if (slug) fetchProfile()
  }, [slug])

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #00cfff22', borderTopColor: '#00cfff', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; margin: 0; padding: 0; } body { background: #0a0a0a !important; }`}</style>
    </div>
  )

  if (notFound || !profile) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { background: #0a0a0a !important; }`}</style>
      <p style={{ fontSize: '48px' }}>⚡</p>
      <p style={{ color: '#6b7280', fontSize: '16px' }}>Perfil no encontrado</p>
      <p style={{ color: '#374151', fontSize: '13px' }}>Este enlace no existe o fue desactivado</p>
    </div>
  )

  const socialLinks = [
    { key: 'whatsapp', value: profile.whatsapp, label: 'WhatsApp', icon: '💬', color: '#25d366', href: (v: string) => `https://wa.me/57${v.replace(/\D/g, '')}` },
    { key: 'instagram', value: profile.instagram, label: 'Instagram', icon: '📸', color: '#e1306c', href: (v: string) => `https://instagram.com/${v.replace('@', '')}` },
    { key: 'tiktok', value: profile.tiktok, label: 'TikTok', icon: '🎵', color: '#ff0050', href: (v: string) => `https://tiktok.com/@${v.replace('@', '')}` },
    { key: 'linkedin', value: profile.linkedin, label: 'LinkedIn', icon: '💼', color: '#0077b5', href: (v: string) => v.startsWith('http') ? v : `https://linkedin.com/in/${v.replace('@', '')}` },
    { key: 'facebook', value: profile.facebook, label: 'Facebook', icon: '👥', color: '#1877f2', href: (v: string) => v.startsWith('http') ? v : `https://facebook.com/${v}` },
    { key: 'youtube', value: profile.youtube, label: 'YouTube', icon: '▶️', color: '#ff0000', href: (v: string) => v.startsWith('http') ? v : `https://youtube.com/@${v.replace('@', '')}` },
    { key: 'email', value: profile.email, label: 'Email', icon: '✉️', color: '#00cfff', href: (v: string) => `mailto:${v}` },
    { key: 'website', value: profile.website, label: 'Sitio Web', icon: '🌐', color: '#00ff94', href: (v: string) => v.startsWith('http') ? v : `https://${v}` },
  ].filter(l => l.value)

  const customLinks: CustomLink[] = Array.isArray(profile.custom_links) ? profile.custom_links : []

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a !important; color: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; padding: 0 0 40px 0; }
        .nfc-container { width: 100%; max-width: 480px; display: flex; flex-direction: column; align-items: center; }
        .nfc-hero { width: 100%; padding: 48px 24px 32px; display: flex; flex-direction: column; align-items: center; text-align: center; background: linear-gradient(180deg, #111111 0%, #0a0a0a 100%); }
        .nfc-avatar { width: 96px; height: 96px; border-radius: 50%; border: 3px solid #00cfff44; margin-bottom: 16px; background: #161616; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 900; color: #00cfff; overflow: hidden; }
        .nfc-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .nfc-name { font-size: 28px; font-weight: 900; background: linear-gradient(90deg, #00cfff, #00ff94); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 8px; line-height: 1.2; }
        .nfc-tagline { font-size: 15px; color: #9ca3af; margin-bottom: 6px; line-height: 1.5; }
        .nfc-company { font-size: 13px; color: #4b5563; font-weight: 500; }
        .nfc-links { width: 100%; padding: 8px 16px; display: flex; flex-direction: column; gap: 10px; }
        .nfc-link-btn { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-radius: 14px; background: #161616; border: 1px solid #1f1f1f; text-decoration: none; color: #f0f0f0; font-size: 15px; font-weight: 600; -webkit-tap-highlight-color: transparent; transition: all 0.15s ease; }
        .nfc-link-btn:active { transform: scale(0.97); background: #1f1f1f; }
        .nfc-link-icon { width: 42px; height: 42px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .nfc-arrow { margin-left: auto; font-size: 16px; color: #374151; }
        .nfc-divider { width: calc(100% - 32px); height: 1px; background: #1f1f1f; margin: 4px 0; }
        .nfc-footer { margin-top: 32px; display: flex; flex-direction: column; align-items: center; gap: 8px; padding-bottom: 16px; }
        .nfc-badge { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 999px; background: #00cfff0d; border: 1px solid #00cfff22; text-decoration: none; font-size: 12px; font-weight: 700; color: #00cfff; }
      `}</style>
      <div className="nfc-container">
        <div className="nfc-hero">
          <div className="nfc-avatar">
            {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.display_name} /> : profile.display_name.charAt(0).toUpperCase()}
          </div>
          <h1 className="nfc-name">{profile.display_name}</h1>
          {profile.tagline && <p className="nfc-tagline">{profile.tagline}</p>}
          {profile.company && <p className="nfc-company">🏢 {profile.company}</p>}
        </div>
        <div className="nfc-links">
          {socialLinks.map(link => (
            <a key={link.key} href={link.href(link.value!)} target="_blank" rel="noopener noreferrer" className="nfc-link-btn">
              <div className="nfc-link-icon" style={{ background: link.color + '18', border: `1px solid ${link.color}33` }}>{link.icon}</div>
              <span>{link.label}</span>
              <span className="nfc-arrow">→</span>
            </a>
          ))}
          {customLinks.length > 0 && socialLinks.length > 0 && <div className="nfc-divider" />}
          {customLinks.map((link, i) => (
            <a key={i} href={link.url.startsWith('http') ? link.url : `https://${link.url}`} target="_blank" rel="noopener noreferrer" className="nfc-link-btn">
              <div className="nfc-link-icon" style={{ background: '#00cfff18', border: '1px solid #00cfff33' }}>{link.icon ?? '🔗'}</div>
              <span>{link.label}</span>
              <span className="nfc-arrow">→</span>
            </a>
          ))}
        </div>
        <div className="nfc-footer">
          <a href="https://taply-inventory.vercel.app" className="nfc-badge" target="_blank" rel="noopener noreferrer">⚡ Creado con Taply NFC</a>
        </div>
      </div>
    </>
  )
}
