// ─────────────────────────────────────────────────────────────────────────────
// src/lib/wallet.ts
// Helpers y tipos para Taply Wallet (Google Wallet + Apple Wallet)
// ─────────────────────────────────────────────────────────────────────────────

import jwt from 'jsonwebtoken'

// ── Constantes ────────────────────────────────────────────────────────────────

export const GW_API_BASE  = 'https://walletobjects.googleapis.com/walletobjects/v1'
export const GW_SAVE_BASE = 'https://pay.google.com/gp/v/save'
export const GW_SCOPE     = 'https://www.googleapis.com/auth/wallet_object.issuer'

// ── Tipos públicos ────────────────────────────────────────────────────────────

export interface WalletClientData {
  /** ID único del registro en tu sistema (ej: slug del perfil NFC) */
  objectSuffix : string
  displayName  : string
  cardNumber   : string
  tier         : string
  stamps       : number   // sellos / puntos acumulados
  logoUrl      : string
  profileSlug  : string
}

export interface WalletIssueResponse {
  googleWalletUrl : string | null
  pkpassUrl       : string | null
}

export interface WalletInfoResponse extends WalletClientData {
  googleWalletUrl : string | null
  pkpassUrl       : string | null
}

// ── Helper: normalizar clave PEM almacenada con \n literales en env vars ──────

export function normalizePem(raw: string): string {
  return raw.replace(/\\n/g, '\n')
}

// ── Helper: obtener access_token OAuth2 con JWT de Service Account ────────────

export async function getGoogleAccessToken(
  serviceEmail: string,
  privateKey   : string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)

  const assertion = jwt.sign(
    {
      iss   : serviceEmail,
      sub   : serviceEmail,
      aud   : 'https://oauth2.googleapis.com/token',
      iat   : now,
      exp   : now + 3600,
      scope : GW_SCOPE,
    },
    privateKey,
    { algorithm: 'RS256' },
  )

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method  : 'POST',
    headers : { 'Content-Type': 'application/x-www-form-urlencoded' },
    body    : new URLSearchParams({
      grant_type : 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`[wallet] OAuth2 token error ${res.status}: ${body}`)
  }

  const { access_token } = (await res.json()) as { access_token: string }
  return access_token
}

// ── Helper: crear o verificar la LoyaltyClass (idempotente) ──────────────────

export async function upsertLoyaltyClass(
  accessToken : string,
  issuerId    : string,
  classSuffix : string,
  logoUrl     : string,
): Promise<string> {
  const classId = `${issuerId}.${classSuffix}`
  const url     = `${GW_API_BASE}/loyaltyClass/${classId}`

  const getRes = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (getRes.ok) return classId   // ya existe

  if (getRes.status !== 404) {
    throw new Error(`[wallet] LoyaltyClass GET error ${getRes.status}: ${await getRes.text()}`)
  }

  // Crear clase
  const body = {
    id                : classId,
    issuerName        : 'Taply',
    programName       : 'Taply NFC Card',
    programLogo       : {
      sourceUri           : { uri: logoUrl || 'https://taply.co/logo.png' },
      contentDescription  : { defaultValue: { language: 'es-419', value: 'Taply Logo' } },
    },
    reviewStatus        : 'UNDER_REVIEW',
    hexBackgroundColor  : '#0F172A',
    rewardsTier         : 'Estándar',
    rewardsTierLabel    : 'Nivel',
    loyaltyPoints       : { label: 'Sellos', balance: { int: 0 } },
    textModulesData     : [
      { id: 'info', header: 'Taply NFC', body: 'Conecta con un solo toque' },
    ],
    linksModuleData : {
      uris: [{ uri: 'https://taply.co', description: 'Visitar Taply', id: 'web' }],
    },
  }

  const postRes = await fetch(`${GW_API_BASE}/loyaltyClass`, {
    method  : 'POST',
    headers : {
      Authorization  : `Bearer ${accessToken}`,
      'Content-Type' : 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!postRes.ok) {
    throw new Error(`[wallet] LoyaltyClass POST error ${postRes.status}: ${await postRes.text()}`)
  }

  return classId
}

// ── Helper: crear o actualizar el LoyaltyObject del cliente ──────────────────

export async function upsertLoyaltyObject(
  accessToken  : string,
  issuerId     : string,
  classId      : string,
  client       : WalletClientData,
): Promise<string> {
  const fullId = `${issuerId}.${client.objectSuffix}`
  const objUrl = `${GW_API_BASE}/loyaltyObject/${fullId}`

  const objectBody = {
    id            : fullId,
    classId,
    state         : 'ACTIVE',
    accountId     : client.cardNumber,
    accountName   : client.displayName,
    loyaltyPoints : { label: 'Sellos', balance: { int: client.stamps } },
    textModulesData: [
      { id: 'tier',   header: 'Nivel',       body: client.tier        },
      { id: 'card',   header: 'Tarjeta NFC', body: client.cardNumber  },
    ],
    barcode: {
      type         : 'QR_CODE',
      value        : client.cardNumber,
      alternateText: client.cardNumber,
    },
    ...(client.logoUrl && {
      heroImage: {
        sourceUri          : { uri: client.logoUrl },
        contentDescription : { defaultValue: { language: 'es-419', value: 'Taply' } },
      },
    }),
  }

  const getRes = await fetch(objUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (getRes.ok) {
    // Actualizar con PATCH parcial
    const patchRes = await fetch(objUrl, {
      method  : 'PATCH',
      headers : { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body    : JSON.stringify({
        accountName   : client.displayName,
        loyaltyPoints : objectBody.loyaltyPoints,
        textModulesData: objectBody.textModulesData,
        state         : 'ACTIVE',
      }),
    })
    if (!patchRes.ok) {
      throw new Error(`[wallet] LoyaltyObject PATCH error ${patchRes.status}: ${await patchRes.text()}`)
    }
  } else if (getRes.status === 404) {
    const postRes = await fetch(`${GW_API_BASE}/loyaltyObject`, {
      method  : 'POST',
      headers : { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body    : JSON.stringify(objectBody),
    })
    if (!postRes.ok) {
      throw new Error(`[wallet] LoyaltyObject POST error ${postRes.status}: ${await postRes.text()}`)
    }
  } else {
    throw new Error(`[wallet] LoyaltyObject GET error ${getRes.status}: ${await getRes.text()}`)
  }

  return fullId
}

// ── Helper: construir el JWT "Save to Wallet" firmado ────────────────────────

export function buildSaveJwt(
  serviceEmail : string,
  privateKey   : string,
  fullObjectId : string,
): string {
  return jwt.sign(
    {
      iss     : serviceEmail,
      aud     : 'google',
      origins : [] as string[],
      typ     : 'savetowallet',
      iat     : Math.floor(Date.now() / 1000),
      payload : { loyaltyObjects: [{ id: fullObjectId }] },
    },
    privateKey,
    { algorithm: 'RS256' },
  )
}

// ── Helper: construir URL de Google Wallet sin llamar a la REST API ───────────
// (para /api/wallet-info donde sólo necesitamos el link, no upsert)

export function buildSaveUrl(
  serviceEmail : string,
  privateKey   : string,
  issuerId     : string,
  objectSuffix : string,
): string {
  const fullId = `${issuerId}.${objectSuffix}`
  const token  = buildSaveJwt(serviceEmail, privateKey, fullId)
  return `${GW_SAVE_BASE}/${token}`
}
