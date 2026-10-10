// src/app/api/wallet/route.ts
// POST /api/wallet  →  genera URL "Save to Google Wallet" + URL pkpass
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import {
  normalizePem,
  getGoogleAccessToken,
  upsertLoyaltyClass,
  upsertLoyaltyObject,
  buildSaveJwt,
  GW_SAVE_BASE,
  type WalletClientData,
} from '@/lib/wallet'

export async function POST(request: Request) {
  // ── Variables de entorno ────────────────────────────────────────────────────
  const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey       = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  const issuerId     = process.env.GOOGLE_ISSUER_ID
  const classSuffix  = process.env.GOOGLE_CLASS_SUFFIX ?? 'taply_loyalty_v1'
  const logoUrl      = process.env.TAPLY_LOGO_URL      ?? ''
  const pkpassBase   = process.env.PKPASS_SERVICE_URL  ?? ''

  if (!serviceEmail || !rawKey || !issuerId) {
    return NextResponse.json(
      { error: 'Faltan variables de entorno: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_KEY, GOOGLE_ISSUER_ID' },
      { status: 500 },
    )
  }

  const privateKey = normalizePem(rawKey)

  // ── Leer body ───────────────────────────────────────────────────────────────
  let body: Partial<WalletClientData> & { objectSuffix?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const { objectSuffix, displayName, cardNumber, tier, stamps, profileSlug } = body

  if (!objectSuffix || !displayName || !cardNumber) {
    return NextResponse.json(
      { error: 'Campos requeridos: objectSuffix, displayName, cardNumber' },
      { status: 400 },
    )
  }

  const clientData: WalletClientData = {
    objectSuffix,
    displayName,
    cardNumber,
    tier         : tier      ?? 'Estándar',
    stamps       : stamps    ?? 0,
    logoUrl      : body.logoUrl ?? logoUrl,
    profileSlug  : profileSlug ?? objectSuffix,
  }

  try {
    // 1. OAuth2 token
    const accessToken = await getGoogleAccessToken(serviceEmail, privateKey)

    // 2. Clase idempotente
    const classId = await upsertLoyaltyClass(accessToken, issuerId, classSuffix, clientData.logoUrl)

    // 3. Objeto del cliente (create o patch)
    const fullObjectId = await upsertLoyaltyObject(accessToken, issuerId, classId, clientData)

    // 4. JWT "Save to Wallet"
    const walletJwt     = buildSaveJwt(serviceEmail, privateKey, fullObjectId)
    const googleWalletUrl = `${GW_SAVE_BASE}/${walletJwt}`

    // 5. URL pkpass (delega a microservicio si está configurado)
    const pkpassUrl = pkpassBase
      ? `${pkpassBase}/pass/${encodeURIComponent(cardNumber)}`
      : null

    return NextResponse.json({ googleWalletUrl, pkpassUrl }, { status: 200 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/wallet]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
