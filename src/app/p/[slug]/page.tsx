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
  ocean: {
    bg: 'linear-gradient(160deg,#00091a 0%,#001a3a 45%,#000c20 100%)',
    heroBg: 'linear-gradient(180deg,#001a3a 0%,#00091a 100%)',
    accent: '#60efff', accent2: '#0096ff', cardBg: '#00112a', cardBorder: '#002040',
    nameCss: 'linear-gradient(90deg,#60efff,#0096ff)', radius: '14px', btnRadius: '14px',
    footerBg: '#60efff0d', vibe: '', avatarBorder: '#60efff44',
  },
  gold: {
    bg: 'linear-gradient(160deg,#0d0900 0%,#1a1200 50%,#0a0800 100%)',
    heroBg: 'linear-gradient(180deg,#1a1200 0%,#0d0900 100%)',
    accent: '#d4af37', accent2: '#ffd700', cardBg: '#110e00', cardBorder: '#2a2000',
    nameCss: 'linear-gradient(90deg,#d4af37,#ffd700)', radius: '14px', btnRadius: '14px',
    footerBg: '#d4af370d', vibe: '', avatarBorder: '#d4af3744',
  },
  aurora: {
    bg: 'linear-gradient(160deg,#030014 0%,#0a0020 30%,#001a10 70%,#050020 100%)',
    heroBg: 'linear-gradient(180deg,#0a0020 0%,#001a10 100%)',
    accent: '#00ff94', accent2: '#a855f7', cardBg: '#0a0018', cardBorder: '#1a0030',
    nameCss: 'linear-gradient(90deg,#00ff94,#a855f7)', radius: '14px', btnRadius: '14px',
    footerBg: '#00ff940d', vibe: '', avatarBorder: '#00ff9444',
  },
  sunset: {
    bg: 'linear-gradient(160deg,#180010 0%,#1f0a00 55%,#0f0000 100%)',
    heroBg: 'linear-gradient(180deg,#1f0a00 0%,#180010 100%)',
    accent: '#ff6b35', accent2: '#f7931a', cardBg: '#150800', cardBorder: '#2a1000',
    nameCss: 'linear-gradient(90deg,#ff6b35,#f7931a)', radius: '14px', btnRadius: '14px',
    footerBg: '#ff6b350d', vibe: '', avatarBorder: '#ff6b3544',
  },
  minimal: {
    bg: '#f2f2f2', heroBg: 'linear-gradient(180deg,#ffffff 0%,#f2f2f2 100%)',
    accent: '#0d0d0d', accent2: '#444444', cardBg: '#ffffff', cardBorder: '#e5e5e5',
    nameCss: '', radius: '14px', btnRadius: '14px',
    footerBg: '#0d0d0d08', vibe: '', avatarBorder: '#0d0d0d22',
  },
}

// ── SVG brand icons ─────────────────────────────────────────────────────────
function IconWhatsApp({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function IconInstagram({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  )
}

function IconTikTok({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  )
}

function IconLinkedIn({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

function IconFacebook({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function IconYouTube({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

function IconEmail({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/>
    </svg>
  )
}

function IconGlobe({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  )
}

function IconLink({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
  )
}

// Detecta el ícono correcto según la URL del link personalizado
function getCustomIcon(url: string, fallbackEmoji?: string): 'whatsapp' | 'instagram' | 'tiktok' | 'linkedin' | 'facebook' | 'youtube' | 'email' | 'globe' | 'link' {
  const u = url.toLowerCase()
  if (u.includes('wa.me') || u.includes('whatsapp')) return 'whatsapp'
  if (u.includes('instagram.com') || u.includes('instagr.am')) return 'instagram'
  if (u.includes('tiktok.com')) return 'tiktok'
  if (u.includes('linkedin.com')) return 'linkedin'
  if (u.includes('facebook.com') || u.includes('fb.com') || u.includes('fb.me')) return 'facebook'
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube'
  if (u.startsWith('mailto:') || u.includes('@') && !u.startsWith('http')) return 'email'
  if (u.startsWith('http')) return 'globe'
  return 'link'
}

function BrandIcon({ type, color }: { type: string; color: string }) {
  switch (type) {
    case 'whatsapp':  return <IconWhatsApp color={color} />
    case 'instagram': return <IconInstagram color={color} />
    case 'tiktok':    return <IconTikTok color={color} />
    case 'linkedin':  return <IconLinkedIn color={color} />
    case 'facebook':  return <IconFacebook color={color} />
    case 'youtube':   return <IconYouTube color={color} />
    case 'email':     return <IconEmail color={color} />
    case 'globe':     return <IconGlobe color={color} />
    default:          return <IconLink color={color} />
  }
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
  const isMinimal = profile.template === 'minimal'
  const textColor = isMinimal ? '#0d0d0d' : '#f0f0f0'
  const subColor = isMinimal ? '#555555' : '#9ca3af'
  const mutedColor = isMinimal ? '#888888' : '#6b7280'

  const socialLinks = [
    { key: 'whatsapp',  value: profile.whatsapp,  label: 'WhatsApp', iconType: 'whatsapp',  href: (v: string) => `https://wa.me/57${v.replace(/\D/g, '')}` },
    { key: 'instagram', value: profile.instagram, label: 'Instagram', iconType: 'instagram', href: (v: string) => `https://instagram.com/${v.replace('@', '')}` },
    { key: 'tiktok',    value: profile.tiktok,    label: 'TikTok',    iconType: 'tiktok',    href: (v: string) => `https://tiktok.com/@${v.replace('@', '')}` },
    { key: 'linkedin',  value: profile.linkedin,  label: 'LinkedIn',  iconType: 'linkedin',  href: (v: string) => v.startsWith('http') ? v : `https://linkedin.com/in/${v.replace('@', '')}` },
    { key: 'facebook',  value: profile.facebook,  label: 'Facebook',  iconType: 'facebook',  href: (v: string) => v.startsWith('http') ? v : `https://facebook.com/${v}` },
    { key: 'youtube',   value: profile.youtube,   label: 'YouTube',   iconType: 'youtube',   href: (v: string) => v.startsWith('http') ? v : `https://youtube.com/@${v.replace('@', '')}` },
    { key: 'email',     value: profile.email,     label: 'Email',     iconType: 'email',     href: (v: string) => `mailto:${v}` },
    { key: 'website',   value: profile.website,   label: 'Sitio Web', iconType: 'globe',     href: (v: string) => v.startsWith('http') ? v : `https://${v}` },
  ].filter(l => l.value)

  const customLinks: CustomLink[] = Array.isArray(profile.custom_links) ? profile.custom_links : []

  const nameStyle = profile.template === 'minimal'
    ? { color: '#0d0d0d' }
    : { background: theme.nameCss, WebkitBackgroundClip: 'text' as const, WebkitTextFillColor: 'transparent' as const, backgroundClip: 'text' as const }

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${theme.bg}!important;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:0 0 48px 0}
        .np-wrap{width:100%;max-width:480px;display:flex;flex-direction:column;align-items:center}
        .np-hero{width:100%;padding:52px 24px 36px;display:flex;flex-direction:column;align-items:center;text-align:center;background:${theme.heroBg};position:relative;overflow:hidden}
        .np-avatar{width:100px;height:100px;border-radius:50%;border:3px solid ${theme.avatarBorder};margin-bottom:18px;background:${theme.cardBg};display:flex;align-items:center;justify-content:center;font-size:38px;font-weight:900;color:${theme.accent};overflow:hidden;flex-shrink:0}
        .np-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%}
        .np-links{width:100%;padding:12px 16px;display:flex;flex-direction:column;gap:10px}
        .np-btn{display:flex;align-items:center;gap:14px;padding:15px 18px;border-radius:${theme.btnRadius};background:${theme.cardBg};border:1px solid ${theme.cardBorder};text-decoration:none;color:${textColor};font-size:15px;font-weight:600;-webkit-tap-highlight-color:transparent;transition:all 0.15s ease}
        .np-btn:active{transform:scale(0.97);border-color:${theme.accent}66}
        .np-icon{width:42px;height:42px;border-radius:${theme.radius};display:flex;align-items:center;justify-content:center;flex-shrink:0;background:${theme.accent}15;border:1px solid ${theme.accent}25}
        .np-arrow{margin-left:auto;color:${theme.accent}88;font-size:18px;font-weight:300;line-height:1}
        .np-divider{width:calc(100% - 32px);height:1px;background:${theme.cardBorder};margin:4px 0}
        .np-footer{margin-top:28px;display:flex;flex-direction:column;align-items:center;gap:8px;padding-bottom:16px}
        .np-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:999px;background:${theme.footerBg};border:1px solid ${theme.accent}22;text-decoration:none;font-size:12px;font-weight:700;color:${theme.accent}}
      `}</style>
      <div className="np-wrap">
        <div className="np-hero">
          <div className="np-avatar">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.display_name} />
              : profile.display_name.charAt(0).toUpperCase()}
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', lineHeight: 1.2, ...nameStyle }}>
            {profile.display_name}
          </h1>
          {profile.tagline && <p style={{ fontSize: '15px', color: subColor, marginBottom: '6px', lineHeight: 1.5 }}>{profile.tagline}</p>}
          {profile.company && (
            <p style={{ fontSize: '13px', color: mutedColor, fontWeight: 500, padding: '4px 12px', borderRadius: '999px', background: `${theme.accent}11`, border: `1px solid ${theme.accent}22`, display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              🏢 {profile.company}
            </p>
          )}
        </div>

        <div className="np-links">
          {socialLinks.map(link => (
            <a key={link.key} href={link.href(link.value!)} target="_blank" rel="noopener noreferrer" className="np-btn">
              <div className="np-icon">
                <BrandIcon type={link.iconType} color={theme.accent} />
              </div>
              <span>{link.label}</span>
              <span className="np-arrow">›</span>
            </a>
          ))}

          {customLinks.length > 0 && socialLinks.length > 0 && <div className="np-divider" />}

          {customLinks.map((link, i) => {
            const detectedType = getCustomIcon(link.url, link.icon)
            return (
              <a key={i} href={link.url.startsWith('http') ? link.url : `https://${link.url}`} target="_blank" rel="noopener noreferrer" className="np-btn">
                <div className="np-icon">
                  {link.icon && !link.url ? (
                    <span style={{ fontSize: '20px' }}>{link.icon}</span>
                  ) : (
                    <BrandIcon type={detectedType} color={theme.accent} />
                  )}
                </div>
                <span>{link.label}</span>
                <span className="np-arrow">›</span>
              </a>
            )
          })}
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
