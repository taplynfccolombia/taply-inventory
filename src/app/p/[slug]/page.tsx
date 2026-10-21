'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface CustomLink { type?: string; label: string; url: string; icon?: string }

interface NFCProfile {
  id: string; slug: string; display_name: string; tagline: string | null
  company: string | null; avatar_url: string | null; whatsapp: string | null
  email: string | null; website: string | null; instagram: string | null
  tiktok: string | null; linkedin: string | null; facebook: string | null
  youtube: string | null; location: string | null; google_reviews_url: string | null
  custom_links: CustomLink[]; is_active: boolean; views: number; template: string | null
}

interface TemplateConfig {
  pageBg: string; heroBg: string; nameGrad: string | null; nameSolid: string | null
  taglineColor: string; companyColor: string; avatarBorder: string; avatarGlow: string
  avatarTextColor: string; linkBg: string; linkBorder: string; linkColor: string
  arrowColor: string; badgeBg: string; badgeBorder: string; badgeColor: string
  dividerColor: string; glow: string; bodyColor: string; iconAlpha: string; iconBorderAlpha: string
}

const TEMPLATES: Record<string, TemplateConfig> = {
  default: {
    pageBg: '#0a0a0a', heroBg: 'linear-gradient(180deg, #111111 0%, #0a0a0a 100%)',
    nameGrad: 'linear-gradient(90deg, #00cfff, #00ff94)', nameSolid: null,
    taglineColor: '#9ca3af', companyColor: '#4b5563', avatarBorder: '#00cfff55',
    avatarGlow: '0 0 24px #00cfff22', avatarTextColor: '#00cfff', linkBg: '#161616',
    linkBorder: '#1f1f1f', linkColor: '#f0f0f0', arrowColor: '#374151',
    badgeBg: '#00cfff0d', badgeBorder: '#00cfff22', badgeColor: '#00cfff',
    dividerColor: '#1f1f1f', glow: 'none', bodyColor: '#f0f0f0', iconAlpha: '18', iconBorderAlpha: '33',
  },
  ocean: {
    pageBg: 'linear-gradient(160deg, #00091a 0%, #001a3a 45%, #000c20 100%)', heroBg: 'transparent',
    nameGrad: 'linear-gradient(90deg, #60efff, #0096ff)', nameSolid: null,
    taglineColor: '#93c5fd', companyColor: '#3b82f6', avatarBorder: '#0096ff66',
    avatarGlow: '0 0 32px #0096ff33', avatarTextColor: '#60efff',
    linkBg: 'rgba(0, 40, 100, 0.45)', linkBorder: 'rgba(0, 150, 255, 0.22)', linkColor: '#e0f4ff',
    arrowColor: '#1d4ed8', badgeBg: 'rgba(0, 150, 255, 0.08)', badgeBorder: 'rgba(0, 150, 255, 0.22)',
    badgeColor: '#60efff', dividerColor: 'rgba(0, 150, 255, 0.15)',
    glow: 'radial-gradient(ellipse 80% 45% at 50% 0%, rgba(0, 100, 255, 0.2) 0%, transparent 100%)',
    bodyColor: '#e0f4ff', iconAlpha: '20', iconBorderAlpha: '40',
  },
  gold: {
    pageBg: 'linear-gradient(160deg, #0d0900 0%, #1a1200 50%, #0a0800 100%)', heroBg: 'transparent',
    nameGrad: 'linear-gradient(90deg, #d4af37, #ffd700)', nameSolid: null,
    taglineColor: '#b8970a', companyColor: '#78600a', avatarBorder: '#d4af3777',
    avatarGlow: '0 0 32px #d4af3733', avatarTextColor: '#d4af37',
    linkBg: 'rgba(212, 175, 55, 0.07)', linkBorder: 'rgba(212, 175, 55, 0.18)', linkColor: '#f5e6c8',
    arrowColor: '#78600a', badgeBg: 'rgba(212, 175, 55, 0.08)', badgeBorder: 'rgba(212, 175, 55, 0.22)',
    badgeColor: '#d4af37', dividerColor: 'rgba(212, 175, 55, 0.12)',
    glow: 'radial-gradient(ellipse 60% 35% at 50% 0%, rgba(212, 175, 55, 0.15) 0%, transparent 100%)',
    bodyColor: '#f5e6c8', iconAlpha: '18', iconBorderAlpha: '35',
  },
  aurora: {
    pageBg: 'linear-gradient(160deg, #030014 0%, #0a0020 30%, #001a10 70%, #050020 100%)', heroBg: 'transparent',
    nameGrad: 'linear-gradient(90deg, #00ff94, #a855f7)', nameSolid: null,
    taglineColor: '#c4b5fd', companyColor: '#7c3aed', avatarBorder: '#a855f777',
    avatarGlow: '0 0 32px #a855f733', avatarTextColor: '#a855f7',
    linkBg: 'rgba(88, 28, 135, 0.22)', linkBorder: 'rgba(168, 85, 247, 0.2)', linkColor: '#f0e8ff',
    arrowColor: '#6b21a8', badgeBg: 'rgba(168, 85, 247, 0.08)', badgeBorder: 'rgba(168, 85, 247, 0.22)',
    badgeColor: '#a855f7', dividerColor: 'rgba(168, 85, 247, 0.12)',
    glow: 'radial-gradient(ellipse 60% 30% at 70% 5%, rgba(168, 85, 247, 0.18) 0%, transparent 60%), radial-gradient(ellipse 50% 25% at 15% 65%, rgba(0, 255, 148, 0.1) 0%, transparent 60%)',
    bodyColor: '#f0e8ff', iconAlpha: '22', iconBorderAlpha: '40',
  },
  sunset: {
    pageBg: 'linear-gradient(160deg, #180010 0%, #1f0a00 55%, #0f0000 100%)', heroBg: 'transparent',
    nameGrad: 'linear-gradient(90deg, #ff6b35, #f7931a)', nameSolid: null,
    taglineColor: '#fdba74', companyColor: '#92400e', avatarBorder: '#ff6b3577',
    avatarGlow: '0 0 32px #ff6b3533', avatarTextColor: '#ff6b35',
    linkBg: 'rgba(180, 60, 20, 0.18)', linkBorder: 'rgba(255, 107, 53, 0.2)', linkColor: '#fff1ec',
    arrowColor: '#92400e', badgeBg: 'rgba(255, 107, 53, 0.08)', badgeBorder: 'rgba(255, 107, 53, 0.22)',
    badgeColor: '#ff6b35', dividerColor: 'rgba(255, 107, 53, 0.12)',
    glow: 'radial-gradient(ellipse 70% 35% at 50% 0%, rgba(255, 100, 50, 0.18) 0%, transparent 100%)',
    bodyColor: '#fff1ec', iconAlpha: '18', iconBorderAlpha: '35',
  },
  minimal: {
    pageBg: '#f2f2f2', heroBg: 'linear-gradient(180deg, #ffffff 0%, #f2f2f2 100%)',
    nameGrad: null, nameSolid: '#0d0d0d',
    taglineColor: '#6b7280', companyColor: '#9ca3af', avatarBorder: '#0d0d0d22',
    avatarGlow: '0 2px 16px rgba(0,0,0,0.08)', avatarTextColor: '#0d0d0d',
    linkBg: '#ffffff', linkBorder: '#e5e7eb', linkColor: '#111827', arrowColor: '#d1d5db',
    badgeBg: 'rgba(0,0,0,0.04)', badgeBorder: 'rgba(0,0,0,0.1)', badgeColor: '#6b7280',
    dividerColor: '#e5e7eb', glow: 'none', bodyColor: '#111827', iconAlpha: '14', iconBorderAlpha: '28',
  },
}

// SVG paths para logos de plataformas
const PLATFORM_SVG: Record<string, { path: string; color: string; viewBox?: string }> = {
  whatsapp: {
    color: '#25d366',
    path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
  },
  phone: {
    color: '#34a853',
    path: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
  },
  instagram: {
    color: '#e1306c',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  },
  tiktok: {
    color: '#ffffff',
    path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  },
  facebook: {
    color: '#1877f2',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  youtube: {
    color: '#ff0000',
    path: 'M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z',
  },
  linkedin: {
    color: '#0077b5',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  email: {
    color: '#00cfff',
    path: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
  },
  website: {
    color: '#00ff94',
    path: 'M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm7.931 9h-2.764a14.67 14.67 0 00-1.792-6.243A8.013 8.013 0 0119.931 11zM12.53 4.027c1.035 1.364 2.427 3.78 2.627 6.973H9.03c.139-2.596.994-5.028 2.451-6.974.172-.01.34-.026.519-.026.179 0 .347.016.53.027zm-3.842.2A14.67 14.67 0 006.69 11H3.926a8.013 8.013 0 014.762-6.773zM3.926 13h2.764a14.67 14.67 0 001.792 6.243A8.013 8.013 0 013.926 13zm8.604 6.973C11.495 18.609 10.103 16.193 9.903 13h5.127c-.139 2.596-.994 5.028-2.451 6.974a9.05 9.05 0 01-1.049.001zm2.451-.199A14.67 14.67 0 0017.31 13h2.764a8.013 8.013 0 01-4.762 6.774z',
  },
  location: {
    color: '#ea4335',
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  },
  reviews: {
    color: '#fbbc05',
    path: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  },
}

function PlatformIcon({ type, color }: { type: string; color: string }) {
  const meta = PLATFORM_SVG[type]
  if (!meta) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d={meta.path} />
    </svg>
  )
}

function getLinkHref(type: string | undefined, url: string): string {
  const v = url.trim()
  switch (type) {
    case 'whatsapp':  return `https://wa.me/57${v.replace(/\D/g, '')}`
    case 'phone':     return `tel:${v.replace(/\D/g, '')}`
    case 'instagram': return `https://instagram.com/${v.replace('@', '')}`
    case 'tiktok':    return `https://tiktok.com/@${v.replace('@', '')}`
    case 'facebook':  return v.startsWith('http') ? v : `https://facebook.com/${v}`
    case 'youtube':   return v.startsWith('http') ? v : `https://youtube.com/@${v.replace('@', '')}`
    case 'linkedin':  return v.startsWith('http') ? v : `https://linkedin.com/in/${v.replace('@', '')}`
    case 'email':     return `mailto:${v}`
    case 'location':  return v
    case 'reviews':   return v
    default:          return v.startsWith('http') ? v : `https://${v}`
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

  const t = TEMPLATES[profile.template ?? 'default'] ?? TEMPLATES.default

  const rawLinks: CustomLink[] = Array.isArray(profile.custom_links) ? profile.custom_links : []
  const isNewFormat = rawLinks.length > 0 && typeof (rawLinks[0] as any).type === 'string'

  let linksToRender: Array<{ type: string; color: string; label: string; href: string }> = []

  if (isNewFormat) {
    linksToRender = rawLinks.map(link => {
      const meta = PLATFORM_SVG[link.type ?? ''] ?? { color: '#888888' }
      return {
        type: link.type ?? 'website',
        color: meta.color,
        label: link.label || link.type || 'Link',
        href: getLinkHref(link.type, link.url),
      }
    })
  } else {
    const legacySocial = [
      { type: 'whatsapp',  value: profile.whatsapp,  label: 'WhatsApp',  href: (v: string) => `https://wa.me/57${v.replace(/\D/g, '')}` },
      { type: 'instagram', value: profile.instagram, label: 'Instagram', href: (v: string) => `https://instagram.com/${v.replace('@', '')}` },
      { type: 'tiktok',    value: profile.tiktok,    label: 'TikTok',    href: (v: string) => `https://tiktok.com/@${v.replace('@', '')}` },
      { type: 'linkedin',  value: profile.linkedin,  label: 'LinkedIn',  href: (v: string) => v.startsWith('http') ? v : `https://linkedin.com/in/${v.replace('@', '')}` },
      { type: 'facebook',  value: profile.facebook,  label: 'Facebook',  href: (v: string) => v.startsWith('http') ? v : `https://facebook.com/${v}` },
      { type: 'youtube',   value: profile.youtube,   label: 'YouTube',   href: (v: string) => v.startsWith('http') ? v : `https://youtube.com/@${v.replace('@', '')}` },
      { type: 'email',     value: profile.email,     label: 'Email',     href: (v: string) => `mailto:${v}` },
      { type: 'website',   value: profile.website,   label: 'Sitio Web', href: (v: string) => v.startsWith('http') ? v : `https://${v}` },
    ].filter(l => l.value)

    linksToRender = [
      ...legacySocial.map(l => ({
        type: l.type,
        color: PLATFORM_SVG[l.type]?.color ?? '#888888',
        label: l.label,
        href: l.href(l.value!),
      })),
      ...rawLinks.filter(l => !l.type && l.url).map(l => ({
        type: 'website',
        color: '#888888',
        label: l.label || 'Link',
        href: l.url.startsWith('http') ? l.url : `https://${l.url}`,
      })),
    ]
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: ${t.pageBg} !important;
          color: ${t.bodyColor};
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 0 0 40px 0;
          position: relative;
        }
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background: ${t.glow};
          pointer-events: none;
          z-index: 0;
        }
        .nfc-container { width: 100%; max-width: 480px; display: flex; flex-direction: column; align-items: center; position: relative; z-index: 1; }
        .nfc-hero { width: 100%; padding: 56px 24px 36px; display: flex; flex-direction: column; align-items: center; text-align: center; background: ${t.heroBg}; }
        .nfc-avatar { width: 104px; height: 104px; border-radius: 50%; border: 3px solid ${t.avatarBorder}; margin-bottom: 18px; background: rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 900; color: ${t.avatarTextColor}; overflow: hidden; box-shadow: ${t.avatarGlow}; }
        .nfc-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .nfc-name { font-size: 30px; font-weight: 900; ${t.nameGrad ? `background: ${t.nameGrad}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;` : `color: ${t.nameSolid};`} margin-bottom: 10px; line-height: 1.2; letter-spacing: -0.5px; }
        .nfc-tagline { font-size: 15px; color: ${t.taglineColor}; margin-bottom: 6px; line-height: 1.5; }
        .nfc-company { font-size: 13px; color: ${t.companyColor}; font-weight: 600; }
        .nfc-links { width: 100%; padding: 8px 16px; display: flex; flex-direction: column; gap: 10px; }
        .nfc-link-btn { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-radius: 14px; background: ${t.linkBg}; border: 1px solid ${t.linkBorder}; text-decoration: none; color: ${t.linkColor}; font-size: 15px; font-weight: 600; -webkit-tap-highlight-color: transparent; transition: all 0.15s ease; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
        .nfc-link-btn:active { transform: scale(0.97); filter: brightness(1.12); }
        .nfc-link-icon { width: 42px; height: 42px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .nfc-arrow { margin-left: auto; font-size: 16px; color: ${t.arrowColor}; flex-shrink: 0; }
        .nfc-footer { margin-top: 36px; display: flex; flex-direction: column; align-items: center; gap: 8px; padding-bottom: 16px; }
        .nfc-badge { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 999px; background: ${t.badgeBg}; border: 1px solid ${t.badgeBorder}; text-decoration: none; font-size: 12px; font-weight: 700; color: ${t.badgeColor}; backdrop-filter: blur(4px); }
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
          {linksToRender.map((link, i) => (
            <a
              key={i}
              href={link.href}
              target={link.href.startsWith('tel:') || link.href.startsWith('mailto:') ? '_self' : '_blank'}
              rel="noopener noreferrer"
              className="nfc-link-btn"
            >
              <div
                className="nfc-link-icon"
                style={{
                  background: link.color + t.iconAlpha,
                  border: `1px solid ${link.color}${t.iconBorderAlpha}`,
                }}
              >
                <PlatformIcon type={link.type} color={link.color} />
              </div>
              <span>{link.label}</span>
              <span className="nfc-arrow">→</span>
            </a>
          ))}
        </div>

        <div className="nfc-footer">
          <a href="https://taply-inventory.vercel.app" className="nfc-badge" target="_blank" rel="noopener noreferrer">
            ⚡ Creado con Taply NFC
          </a>
        </div>
      </div>
    </>
  )
}
