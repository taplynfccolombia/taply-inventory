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
  views: number; template: string | null
}

interface TemplateConfig {
  pageBg: string
  heroBg: string
  nameGrad: string | null
  nameSolid: string | null
  taglineColor: string
  companyColor: string
  avatarBorder: string
  avatarGlow: string
  avatarTextColor: string
  linkBg: string
  linkBorder: string
  linkColor: string
  arrowColor: string
  badgeBg: string
  badgeBorder: string
  badgeColor: string
  dividerColor: string
  glow: string
  bodyColor: string
  iconAlpha: string
  iconBorderAlpha: string
}

const TEMPLATES: Record<string, TemplateConfig> = {
  default: {
    pageBg: '#0a0a0a',
    heroBg: 'linear-gradient(180deg, #111111 0%, #0a0a0a 100%)',
    nameGrad: 'linear-gradient(90deg, #00cfff, #00ff94)',
    nameSolid: null,
    taglineColor: '#9ca3af',
    companyColor: '#4b5563',
    avatarBorder: '#00cfff55',
    avatarGlow: '0 0 24px #00cfff22',
    avatarTextColor: '#00cfff',
    linkBg: '#161616',
    linkBorder: '#1f1f1f',
    linkColor: '#f0f0f0',
    arrowColor: '#374151',
    badgeBg: '#00cfff0d',
    badgeBorder: '#00cfff22',
    badgeColor: '#00cfff',
    dividerColor: '#1f1f1f',
    glow: 'none',
    bodyColor: '#f0f0f0',
    iconAlpha: '18',
    iconBorderAlpha: '33',
  },
  ocean: {
    pageBg: 'linear-gradient(160deg, #00091a 0%, #001a3a 45%, #000c20 100%)',
    heroBg: 'transparent',
    nameGrad: 'linear-gradient(90deg, #60efff, #0096ff)',
    nameSolid: null,
    taglineColor: '#93c5fd',
    companyColor: '#3b82f6',
    avatarBorder: '#0096ff66',
    avatarGlow: '0 0 32px #0096ff33',
    avatarTextColor: '#60efff',
    linkBg: 'rgba(0, 40, 100, 0.45)',
    linkBorder: 'rgba(0, 150, 255, 0.22)',
    linkColor: '#e0f4ff',
    arrowColor: '#1d4ed8',
    badgeBg: 'rgba(0, 150, 255, 0.08)',
    badgeBorder: 'rgba(0, 150, 255, 0.22)',
    badgeColor: '#60efff',
    dividerColor: 'rgba(0, 150, 255, 0.15)',
    glow: 'radial-gradient(ellipse 80% 45% at 50% 0%, rgba(0, 100, 255, 0.2) 0%, transparent 100%)',
    bodyColor: '#e0f4ff',
    iconAlpha: '20',
    iconBorderAlpha: '40',
  },
  gold: {
    pageBg: 'linear-gradient(160deg, #0d0900 0%, #1a1200 50%, #0a0800 100%)',
    heroBg: 'transparent',
    nameGrad: 'linear-gradient(90deg, #d4af37, #ffd700)',
    nameSolid: null,
    taglineColor: '#b8970a',
    companyColor: '#78600a',
    avatarBorder: '#d4af3777',
    avatarGlow: '0 0 32px #d4af3733',
    avatarTextColor: '#d4af37',
    linkBg: 'rgba(212, 175, 55, 0.07)',
    linkBorder: 'rgba(212, 175, 55, 0.18)',
    linkColor: '#f5e6c8',
    arrowColor: '#78600a',
    badgeBg: 'rgba(212, 175, 55, 0.08)',
    badgeBorder: 'rgba(212, 175, 55, 0.22)',
    badgeColor: '#d4af37',
    dividerColor: 'rgba(212, 175, 55, 0.12)',
    glow: 'radial-gradient(ellipse 60% 35% at 50% 0%, rgba(212, 175, 55, 0.15) 0%, transparent 100%)',
    bodyColor: '#f5e6c8',
    iconAlpha: '18',
    iconBorderAlpha: '35',
  },
  aurora: {
    pageBg: 'linear-gradient(160deg, #030014 0%, #0a0020 30%, #001a10 70%, #050020 100%)',
    heroBg: 'transparent',
    nameGrad: 'linear-gradient(90deg, #00ff94, #a855f7)',
    nameSolid: null,
    taglineColor: '#c4b5fd',
    companyColor: '#7c3aed',
    avatarBorder: '#a855f777',
    avatarGlow: '0 0 32px #a855f733',
    avatarTextColor: '#a855f7',
    linkBg: 'rgba(88, 28, 135, 0.22)',
    linkBorder: 'rgba(168, 85, 247, 0.2)',
    linkColor: '#f0e8ff',
    arrowColor: '#6b21a8',
    badgeBg: 'rgba(168, 85, 247, 0.08)',
    badgeBorder: 'rgba(168, 85, 247, 0.22)',
    badgeColor: '#a855f7',
    dividerColor: 'rgba(168, 85, 247, 0.12)',
    glow: 'radial-gradient(ellipse 60% 30% at 70% 5%, rgba(168, 85, 247, 0.18) 0%, transparent 60%), radial-gradient(ellipse 50% 25% at 15% 65%, rgba(0, 255, 148, 0.1) 0%, transparent 60%)',
    bodyColor: '#f0e8ff',
    iconAlpha: '22',
    iconBorderAlpha: '40',
  },
  sunset: {
    pageBg: 'linear-gradient(160deg, #180010 0%, #1f0a00 55%, #0f0000 100%)',
    heroBg: 'transparent',
    nameGrad: 'linear-gradient(90deg, #ff6b35, #f7931a)',
    nameSolid: null,
    taglineColor: '#fdba74',
    companyColor: '#92400e',
    avatarBorder: '#ff6b3577',
    avatarGlow: '0 0 32px #ff6b3533',
    avatarTextColor: '#ff6b35',
    linkBg: 'rgba(180, 60, 20, 0.18)',
    linkBorder: 'rgba(255, 107, 53, 0.2)',
    linkColor: '#fff1ec',
    arrowColor: '#92400e',
    badgeBg: 'rgba(255, 107, 53, 0.08)',
    badgeBorder: 'rgba(255, 107, 53, 0.22)',
    badgeColor: '#ff6b35',
    dividerColor: 'rgba(255, 107, 53, 0.12)',
    glow: 'radial-gradient(ellipse 70% 35% at 50% 0%, rgba(255, 100, 50, 0.18) 0%, transparent 100%)',
    bodyColor: '#fff1ec',
    iconAlpha: '18',
    iconBorderAlpha: '35',
  },
  minimal: {
    pageBg: '#f2f2f2',
    heroBg: 'linear-gradient(180deg, #ffffff 0%, #f2f2f2 100%)',
    nameGrad: null,
    nameSolid: '#0d0d0d',
    taglineColor: '#6b7280',
    companyColor: '#9ca3af',
    avatarBorder: '#0d0d0d22',
    avatarGlow: '0 2px 16px rgba(0,0,0,0.08)',
    avatarTextColor: '#0d0d0d',
    linkBg: '#ffffff',
    linkBorder: '#e5e7eb',
    linkColor: '#111827',
    arrowColor: '#d1d5db',
    badgeBg: 'rgba(0,0,0,0.04)',
    badgeBorder: 'rgba(0,0,0,0.1)',
    badgeColor: '#6b7280',
    dividerColor: '#e5e7eb',
    glow: 'none',
    bodyColor: '#111827',
    iconAlpha: '14',
    iconBorderAlpha: '28',
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
        .nfc-container {
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .nfc-hero {
          width: 100%;
          padding: 56px 24px 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background: ${t.heroBg};
        }
        .nfc-avatar {
          width: 104px;
          height: 104px;
          border-radius: 50%;
          border: 3px solid ${t.avatarBorder};
          margin-bottom: 18px;
          background: rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          font-weight: 900;
          color: ${t.avatarTextColor};
          overflow: hidden;
          box-shadow: ${t.avatarGlow};
        }
        .nfc-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .nfc-name {
          font-size: 30px;
          font-weight: 900;
          ${t.nameGrad
            ? `background: ${t.nameGrad}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`
            : `color: ${t.nameSolid};`
          }
          margin-bottom: 10px;
          line-height: 1.2;
          letter-spacing: -0.5px;
        }
        .nfc-tagline { font-size: 15px; color: ${t.taglineColor}; margin-bottom: 6px; line-height: 1.5; }
        .nfc-company { font-size: 13px; color: ${t.companyColor}; font-weight: 600; }
        .nfc-links { width: 100%; padding: 8px 16px; display: flex; flex-direction: column; gap: 10px; }
        .nfc-link-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          border-radius: 14px;
          background: ${t.linkBg};
          border: 1px solid ${t.linkBorder};
          text-decoration: none;
          color: ${t.linkColor};
          font-size: 15px;
          font-weight: 600;
          -webkit-tap-highlight-color: transparent;
          transition: all 0.15s ease;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }
        .nfc-link-btn:active { transform: scale(0.97); filter: brightness(1.12); }
        .nfc-link-icon {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .nfc-arrow { margin-left: auto; font-size: 16px; color: ${t.arrowColor}; }
        .nfc-divider { width: calc(100% - 32px); height: 1px; background: ${t.dividerColor}; margin: 4px 0; }
        .nfc-footer { margin-top: 36px; display: flex; flex-direction: column; align-items: center; gap: 8px; padding-bottom: 16px; }
        .nfc-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          border-radius: 999px;
          background: ${t.badgeBg};
          border: 1px solid ${t.badgeBorder};
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
          color: ${t.badgeColor};
          backdrop-filter: blur(4px);
        }
      `}</style>
      <div className="nfc-container">
        <div className="nfc-hero">
          <div className="nfc-avatar">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.display_name} />
              : profile.display_name.charAt(0).toUpperCase()}
          </div>
          <h1 className="nfc-name">{profile.display_name}</h1>
          {profile.tagline && <p className="nfc-tagline">{profile.tagline}</p>}
          {profile.company && <p className="nfc-company">🏢 {profile.company}</p>}
        </div>

        <div className="nfc-links">
          {socialLinks.map(link => (
            <a
              key={link.key}
              href={link.href(link.value!)}
              target="_blank"
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
                {link.icon}
              </div>
              <span>{link.label}</span>
              <span className="nfc-arrow">→</span>
            </a>
          ))}

          {customLinks.length > 0 && socialLinks.length > 0 && (
            <div className="nfc-divider" />
          )}

          {customLinks.map((link, i) => (
            <a
              key={i}
              href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="nfc-link-btn"
            >
              <div
                className="nfc-link-icon"
                style={{ background: t.badgeBg, border: `1px solid ${t.badgeBorder}` }}
              >
                {link.icon ?? '🔗'}
              </div>
              <span>{link.label}</span>
              <span className="nfc-arrow">→</span>
            </a>
          ))}
        </div>

        <div className="nfc-footer">
          <a
            href="https://taply-inventory.vercel.app"
            className="nfc-badge"
            target="_blank"
            rel="noopener noreferrer"
          >
            ⚡ Creado con Taply NFC
          </a>
        </div>
      </div>
    </>
  )
}
