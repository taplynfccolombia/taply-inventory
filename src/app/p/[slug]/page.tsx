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
  youtube: string | null; custom_links: CustomLink[]; is_active: boolean
  views: number; template: string
}

const T: Record<string, {
  bg: string; heroBg: string; accent: string; accent2: string
  cardBg: string; cardBorder: string; nameCss: string
  radius: string; btnRadius: string; footerBg: string
  vibe: string; avatarBorder: string
}> = {
  default: {
    bg: '#0a0a0a', heroBg: 'linear-gradient(180deg,#111 0%,#0a0a0a 100%)',
    accent: '#00cfff', accent2: '#00ff94', cardBg: '#161616', cardBorder: '#1f1f1f',
    nameCss: 'linear-gradient(90deg,#00cfff,#00ff94)', radius: '14px', btnRadius: '14px',
    footerBg: '#00cfff0d', vibe: '', avatarBorder: '#00cfff44',
  },
  restaurante: {
    bg: '#120800', heroBg: 'linear-gradient(180deg,#1f0c00 0%,#120800 100%)',
    accent: '#ff6b35', accent2: '#ffb347', cardBg: '#1a0e00', cardBorder: '#2d1800',
    nameCss: 'linear-gradient(90deg,#ff6b35,#ffb347)', radius: '8px', btnRadius: '8px',
    footerBg: '#ff6b350d', vibe: '🍽️', avatarBorder: '#ff6b3544',
  },
  barberia: {
    bg: '#080800', heroBg: 'linear-gradient(180deg,#111100 0%,#080800 100%)',
    accent: '#ffd700', accent2: '#ff8c00', cardBg: '#111100', cardBorder: '#2a2400',
    nameCss: 'linear-gradient(90deg,#ffd700,#ff8c00)', radius: '4px', btnRadius: '4px',
    footerBg: '#ffd7000d', vibe: '✂️', avatarBorder: '#ffd70044',
  },
  tienda: {
    bg: '#0a0814', heroBg: 'linear-gradient(180deg,#12091e 0%,#0a0814 100%)',
    accent: '#a855f7', accent2: '#ec4899', cardBg: '#14091e', cardBorder: '#2a1040',
    nameCss: 'linear-gradient(90deg,#a855f7,#ec4899)', radius: '20px', btnRadius: '20px',
    footerBg: '#a855f70d', vibe: '🛍️', avatarBorder: '#a855f744',
  },
  creativo: {
    bg: '#080010', heroBg: 'linear-gradient(180deg,#10001a 0%,#080010 100%)',
    accent: '#ff6ec7', accent2: '#ff9a3c', cardBg: '#120018', cardBorder: '#2d0030',
    nameCss: 'linear-gradient(90deg,#ff6ec7,#ff9a3c)', radius: '16px', btnRadius: '999px',
    footerBg: '#ff6ec70d', vibe: '🎨', avatarBorder: '#ff6ec744',
  },
  profesional: {
    bg: '#00040f', heroBg: 'linear-gradient(180deg,#000d24 0%,#00040f 100%)',
    accent: '#3b82f6', accent2: '#06b6d4', cardBg: '#000d20', cardBorder: '#0d2040',
    nameCss: 'linear-gradient(90deg,#3b82f6,#06b6d4)', radius: '6px', btnRadius: '6px',
    footerBg: '#3b82f60d', vibe: '💼', avatarBorder: '#3b82f644',
  },
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
        await supabase.rpc('increment_profile_views', { profile_slug: slug })
      }
      setLoading(false)
    }
    if (slug) fetchProfile()
  }, [slug])

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #00cfff22', borderTopColor: '#00cfff', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box;margin:0;padding:0}body{background:#0a0a0a!important}`}</style>
    </div>
  )

  if (notFound || !profile) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}body{background:#0a0a0a!important}`}</style>
      <p style={{ fontSize: '48px' }}>⚡</p>
      <p style={{ color: '#6b7280', fontSize: '16px' }}>Perfil no encontrado</p>
      <p style={{ color: '#374151', fontSize: '13px' }}>Este enlace no existe o fue desactivado</p>
    </div>
  )

  const theme = T[profile.template ?? 'default'] ?? T['default']

  const socialLinks = [
    { key: 'whatsapp', value: profile.whatsapp, label: 'WhatsApp', icon: '💬', href: (v: string) => `https://wa.me/57${v.replace(/\D/g, '')}` },
    { key: 'instagram', value: profile.instagram, label: 'Instagram', icon: '📸', href: (v: string) => `https://instagram.com/${v.replace('@', '')}` },
    { key: 'tiktok', value: profile.tiktok, label: 'TikTok', icon: '🎵', href: (v: string) => `https://tiktok.com/@${v.replace('@', '')}` },
    { key: 'linkedin', value: profile.linkedin, label: 'LinkedIn', icon: '💼', href: (v: string) => v.startsWith('http') ? v : `https://linkedin.com/in/${v.replace('@', '')}` },
    { key: 'facebook', value: profile.facebook, label: 'Facebook', icon: '👥', href: (v: string) => v.startsWith('http') ? v : `https://facebook.com/${v}` },
    { key: 'youtube', value: profile.youtube, label: 'YouTube', icon: '▶️', href: (v: string) => v.startsWith('http') ? v : `https://youtube.com/@${v.replace('@', '')}` },
    { key: 'email', value: profile.email, label: 'Email', icon: '✉️', href: (v: string) => `mailto:${v}` },
    { key: 'website', value: profile.website, label: 'Sitio Web', icon: '🌐', href: (v: string) => v.startsWith('http') ? v : `https://${v}` },
  ].filter(l => l.value)

  const customLinks: CustomLink[] = Array.isArray(profile.custom_links) ? profile.custom_links : []

  // Template-specific decorative element in the hero
  const HeroAccent = () => {
    const t = profile.template ?? 'default'
    if (t === 'restaurante') return (
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg,${theme.accent},${theme.accent2},${theme.accent})` }} />
    )
    if (t === 'barberia') return (
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: theme.accent }} />
    )
    if (t === 'tienda') return (
      <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '200px', borderRadius: '50%', background: `radial-gradient(circle,${theme.accent}22 0%,transparent 70%)`, pointerEvents: 'none' }} />
    )
    if (t === 'creativo') return (
      <>
        <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: `radial-gradient(circle,${theme.accent}30 0%,transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `radial-gradient(circle,${theme.accent2}25 0%,transparent 70%)`, pointerEvents: 'none' }} />
      </>
    )
    if (t === 'profesional') return (
      <div style={{ position: 'absolute', bottom: 0, left: '24px', right: '24px', height: '1px', background: `linear-gradient(90deg,transparent,${theme.accent}44,transparent)` }} />
    )
    return null
  }

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${theme.bg}!important;color:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:0 0 48px 0}
        .np-wrap{width:100%;max-width:480px;display:flex;flex-direction:column;align-items:center}
        .np-hero{width:100%;padding:52px 24px 36px;display:flex;flex-direction:column;align-items:center;text-align:center;background:${theme.heroBg};position:relative;overflow:hidden}
        .np-avatar{width:100px;height:100px;border-radius:50%;border:3px solid ${theme.avatarBorder};margin-bottom:18px;background:${theme.cardBg};display:flex;align-items:center;justify-content:center;font-size:38px;font-weight:900;color:${theme.accent};overflow:hidden;flex-shrink:0}
        .np-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%}
        .np-name{font-size:28px;font-weight:900;background:${theme.nameCss};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:8px;line-height:1.2}
        .np-tagline{font-size:15px;color:#9ca3af;margin-bottom:6px;line-height:1.5}
        .np-company{font-size:13px;color:#6b7280;font-weight:500;padding:4px 12px;border-radius:999px;background:${theme.accent}11;border:1px solid ${theme.accent}22;display:inline-flex;align-items:center;gap:6px;margin-top:4px}
        .np-links{width:100%;padding:12px 16px;display:flex;flex-direction:column;gap:10px}
        .np-btn{display:flex;align-items:center;gap:14px;padding:15px 18px;border-radius:${theme.btnRadius};background:${theme.cardBg};border:1px solid ${theme.cardBorder};text-decoration:none;color:#f0f0f0;font-size:15px;font-weight:600;-webkit-tap-highlight-color:transparent;transition:all 0.15s ease}
        .np-btn:active{transform:scale(0.97);border-color:${theme.accent}66}
        .np-icon{width:42px;height:42px;border-radius:${theme.radius};display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;background:${theme.accent}15;border:1px solid ${theme.accent}30}
        .np-arrow{margin-left:auto;font-size:16px;color:${theme.accent}88}
        .np-divider{width:calc(100% - 32px);height:1px;background:${theme.cardBorder};margin:4px 0}
        .np-footer{margin-top:28px;display:flex;flex-direction:column;align-items:center;gap:8px;padding-bottom:16px}
        .np-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:999px;background:${theme.footerBg};border:1px solid ${theme.accent}22;text-decoration:none;font-size:12px;font-weight:700;color:${theme.accent}}
      `}</style>
      <div className="np-wrap">
        <div className="np-hero">
          <HeroAccent />
          <div className="np-avatar">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.display_name} />
              : profile.display_name.charAt(0).toUpperCase()}
          </div>
          <h1 className="np-name">{profile.display_name}</h1>
          {profile.tagline && <p className="np-tagline">{profile.tagline}</p>}
          {profile.company && (
            <p className="np-company">
              {theme.vibe || '🏢'} {profile.company}
            </p>
          )}
        </div>

        <div className="np-links">
          {socialLinks.map(link => (
            <a key={link.key} href={link.href(link.value!)} target="_blank" rel="noopener noreferrer" className="np-btn">
              <div className="np-icon">{link.icon}</div>
              <span>{link.label}</span>
              <span className="np-arrow">→</span>
            </a>
          ))}
          {customLinks.length > 0 && socialLinks.length > 0 && <div className="np-divider" />}
          {customLinks.map((link, i) => (
            <a key={i} href={link.url.startsWith('http') ? link.url : `https://${link.url}`} target="_blank" rel="noopener noreferrer" className="np-btn">
              <div className="np-icon">{link.icon ?? '🔗'}</div>
              <span>{link.label}</span>
              <span className="np-arrow">→</span>
            </a>
          ))}
        </div>

        <div className="np-footer">
          <a href="https://taply-inventory.vercel.app" className="np-badge" target="_blank" rel="noopener noreferrer">
            ⚡ Creado con Taply NFC
          </a>
        </div>
      </div>
    </>
  )
}
