import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface LayoutProps {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params
    if (!slug) return { title: 'Perfil Taply NFC' }

    const { data: profile } = await supabase
      .from('nfc_profiles')
      .select('display_name, tagline, company, avatar_url')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (!profile) {
      return {
        title: 'Perfil Taply NFC',
        description: 'Tarjeta de presentación digital Taply NFC',
      }
    }

    const title = `${profile.display_name} — Taply NFC`
    const description = profile.tagline || profile.company || `Conecta con el perfil digital de ${profile.display_name}`
    const images = profile.avatar_url ? [{ url: profile.avatar_url, width: 400, height: 400, alt: profile.display_name }] : []

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images,
        type: 'profile',
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: profile.avatar_url ? [profile.avatar_url] : [],
      },
    }
  } catch {
    return {
      title: 'Perfil Taply NFC',
      description: 'Tarjeta de presentación digital Taply NFC',
    }
  }
}

export default function SlugLayout({ children }: LayoutProps) {
  return <>{children}</>
}
