import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

interface CustomLink {
  label: string
  url: string
  icon?: string
}

interface NFCProfile {
  id: string
  slug: string
  display_name: string
  tagline: string | null
  company: string | null
  avatar_url: string | null
  whatsapp: string | null
  email: string | null
  website: string | null
  instagram: string | null
  tiktok: string | null
  linkedin: string | null
  facebook: string | null
  youtube: string | null
  custom_links: CustomLink[]
  is_active: boolean
  views: number
}

async function getProfile(slug: string): Promise<NFCProfile | null> {
  const { data } = await supabase
    .from('nfc_profiles')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data
}

async function incrementViews(id: string) {
  await supabase.from('nfc_profiles').update({ views: supabase.rpc('increment', { x: 1 }) }).eq('id', id)
}

export default async function ProfilePage({ params }: { params: { slug: string } }) {
  const profile = await getProfile(params.slug)
  if (!profile) notFound()

  const socialLinks = [
    { key: 'whatsapp', value: profile.whatsapp, label: 'WhatsApp', icon: '📱', color: '#25d366', href: (v: string) => `https://wa.me/57${v.replace(/\D/g, '')}` },
    { key: 'instagram', value: profile.instagram, label: 'Instagram', icon: '📸', color: '#e1306c', href: (v: string) => `https://instagram.com/${v.replace('@', '')}` },
    { key: 'tiktok', value: profile.tiktok, label: 'TikTok', icon: '🎵', color: '#ff0050', href: (v: string) => `https://tiktok.com/@${v.replace('@', '')}` },
    { key: 'linkedin', value: profile.linkedin, label: 'LinkedIn', icon: '💼', color: '#0077b5', href: (v: string) => `https://linkedin.com/in/${v.replace('@', '')}` },
    { key: 'facebook', value: profile.facebook, label: 'Facebook', icon: '👥', color: '#1877f2', href: (v: string) => `https://facebook.com/${v}` },
    { key: 'youtube', value: profile.youtube, label: 'YouTube', icon: '▶️', color: '#ff0000', href: (v: string) => `https://youtube.com/@${v.replace('@', '')}` },
    { key: 'email', value: profile.email, label: 'Email', icon: '✉️', color: '#00cfff', href: (v: string) => `mailto:${v}` },
    { key: 'website', value: profile.website, label: 'Sitio Web', icon: '🌐', color: '#00ff94', href: (v: string) => v.startsWith('http') ? v : `https://${v}` },
  ].filter(l => l.value)

  const customLinks: CustomLink[] = Array.isArray(profile.custom_links) ? profile.custom_links : []

  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{profile.display_name} — Taply NFC</title>
        <meta name="description" content={profile.tagline ?? `Perfil digital de ${profile.display_name}`} />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background: #0a0a0a;
            color: #f0f0f0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding: 0 0 40px 0;
          }
          .container {
            width: 100%;
            max-width: 480px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero {
            width: 100%;
            padding: 48px 24px 32px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            background: linear-gradient(180deg, #111111 0%, #0a0a0a 100%);
          }
          .avatar {
            width: 96px;
            height: 96px;
            border-radius: 50%;
            border: 3px solid #00cfff44;
            object-fit: cover;
            margin-bottom: 16px;
            background: #161616;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            font-weight: 900;
            color: #00cfff;
            overflow: hidden;
          }
          .avatar img { width: 100%; height: 100%; object-fit: cover; }
          .name {
            font-size: 26px;
            font-weight: 900;
            background: linear-gradient(90deg, #00cfff, #00ff94);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 6px;
          }
          .tagline {
            font-size: 15px;
            color: #9ca3af;
            margin-bottom: 6px;
            line-height: 1.5;
          }
          .company {
            font-size: 13px;
            color: #4b5563;
            font-weight: 500;
          }
          .links {
            width: 100%;
            padding: 8px 16px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .link-btn {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 16px 20px;
            border-radius: 14px;
            background: #161616;
            border: 1px solid #1f1f1f;
            text-decoration: none;
            color: #f0f0f0;
            font-size: 15px;
            font-weight: 600;
            transition: all 0.2s ease;
            cursor: pointer;
          }
          .link-btn:active {
            transform: scale(0.98);
            background: #1f1f1f;
          }
          .link-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            flex-shrink: 0;
          }
          .divider {
            width: calc(100% - 32px);
            height: 1px;
            background: #1f1f1f;
            margin: 8px 0;
          }
          .footer {
            margin-top: 32px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
          }
          .footer-logo {
            font-size: 13px;
            color: #374151;
            font-weight: 600;
          }
          .footer-cta {
            font-size: 12px;
            color: #00cfff;
            text-decoration: none;
            opacity: 0.7;
          }
          .taply-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: 999px;
            background: #00cfff0d;
            border: 1px solid #00cfff22;
            text-decoration: none;
          }
          .taply-badge span {
            font-size: 11px;
            font-weight: 700;
            color: #00cfff;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="hero">
            <div className="avatar">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} />
              ) : (
                profile.display_name.charAt(0).toUpperCase()
              )}
            </div>
            <h1 className="name">{profile.display_name}</h1>
            {profile.tagline && <p className="tagline">{profile.tagline}</p>}
            {profile.company && <p className="company">🏢 {profile.company}</p>}
          </div>

          <div className="links">
            {socialLinks.map(link => (
              <a key={link.key} href={link.href(link.value!)} target="_blank" rel="noopener noreferrer" className="link-btn">
                <div className="link-icon" style={{ background: link.color + '15', border: `1px solid ${link.color}33` }}>
                  {link.icon}
                </div>
                <span>{link.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#4b5563' }}>→</span>
              </a>
            ))}

            {customLinks.length > 0 && socialLinks.length > 0 && <div className="divider" />}

            {customLinks.map((link, i) => (
              <a key={i} href={link.url.startsWith('http') ? link.url : `https://${link.url}`} target="_blank" rel="noopener noreferrer" className="link-btn">
                <div className="link-icon" style={{ background: '#00cfff15', border: '1px solid #00cfff33' }}>
                  {link.icon ?? '🔗'}
                </div>
                <span>{link.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#4b5563' }}>→</span>
              </a>
            ))}
          </div>

          <div className="footer">
            <a href="https://taply-inventory.vercel.app" className="taply-badge" target="_blank" rel="noopener noreferrer">
              <span>⚡ Creado con Taply NFC</span>
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
