// src/app/api/wallet-info/route.ts
// GET /api/wallet-info?id=<slug>
export const runtime = 'nodejs'

import { NextResponse }  from 'next/server'
import { createClient }  from '@supabase/supabase-js'
import { normalizePem, buildSaveUrl, type WalletInfoResponse } from '@/lib/wallet'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Falta parámetro id' }, { status: 400 })
  }

  // ── 1. Obtener datos desde Supabase (columnas existentes en nfc_profiles) ───
  const { data, error } = await supabase
    .from('nfc_profiles')
    .select('slug, display_name, avatar_url, company, tagline')
    .eq('slug', id)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 })
  }

  // ── 2. Construir campos wallet a partir de los datos disponibles ─────────────
  const objectSuffix = (data.slug as string).replace(/[^a-zA-Z0-9_-]/g, '_')
  const displayName  = (data.display_name as string) ?? 'Cliente Taply'
  // card_number = slug en mayúsculas como identificador legible
  const cardNumber   = `TAPLY-${(data.slug as string).toUpperCase().replace(/-/g, '')}`
  const tier         = 'Estándar'
  const stamps       = 0
  const logoUrl      = (data.avatar_url as string)
                    ?? process.env.TAPLY_LOGO_URL
                    ?? ''

  // ── 3. Generar Google Wallet URL (JWT sin llamar REST API) ───────────────────
  const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey       = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  const issuerId     = process.env.GOOGLE_ISSUER_ID
  const pkpassBase   = process.env.PKPASS_SERVICE_URL ?? ''

  let googleWalletUrl: string | null = null

  if (serviceEmail && rawKey && issuerId) {
    try {
      const privateKey = normalizePem(rawKey)
      googleWalletUrl  = buildSaveUrl(serviceEmail, privateKey, issuerId, objectSuffix)
    } catch (e) {
      console.error('[wallet-info] buildSaveUrl error:', e)
    }
  }

  const pkpassUrl: string | null = pkpassBase
    ? `${pkpassBase}/pass/${encodeURIComponent(cardNumber)}`
    : null

  const response: WalletInfoResponse = {
    objectSuffix,
    displayName,
    cardNumber,
    tier,
    stamps,
    logoUrl,
    profileSlug     : data.slug as string,
    googleWalletUrl,
    pkpassUrl,
  }

  return NextResponse.json(response, { status: 200 })
}
