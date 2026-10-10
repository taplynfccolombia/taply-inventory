// src/app/wallet/[id]/page.tsx
// Página pública de Taply Wallet — detecta SO y redirige/descarga el pase correcto
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

// ── Tipos ────────────────────────────────────────────────────────────────────

interface WalletData {
  displayName     : string
  cardNumber      : string
  tier            : string
  stamps          : number
  logoUrl         : string | null
  googleWalletUrl : string | null
  pkpassUrl       : string | null
}

// ── Paleta Taply ─────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  root: {
    background   : '#0F172A',
    color        : '#F8FAFC',
    fontFamily   : '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    minHeight    : '100dvh',
    display      : 'flex',
    flexDirection: 'column',
    alignItems   : 'center',
    justifyContent: 'center',
    padding      : '24px 16px',
  },
  logoWrap: {
    width        : 72,
    height       : 72,
    borderRadius : 18,
    background   : 'linear-gradient(135deg,#06b6d4,#10b981)',
    display      : 'flex',
    alignItems   : 'center',
    justifyContent: 'center',
    fontSize     : '2rem',
    fontWeight   : 800,
    color        : '#0F172A',
    marginBottom : 24,
    letterSpacing: '-1px',
    flexShrink   : 0,
  },
  logoImg: {
    width        : 72,
    height       : 72,
    borderRadius : 18,
    objectFit    : 'contain',
    background   : '#fff',
    padding      : 6,
    marginBottom : 24,
  },
  card: {
    background   : '#1E293B',
    border       : '1px solid rgba(255,255,255,0.08)',
    borderRadius : 16,
    padding      : '32px 28px',
    maxWidth     : 380,
    width        : '100%',
    textAlign    : 'center',
  },
  nfcCard: {
    background   : 'linear-gradient(135deg,#1E293B 0%,#0F172A 100%)',
    border       : '1px solid rgba(255,255,255,0.08)',
    borderRadius : 12,
    padding      : 20,
    marginBottom : 28,
    textAlign    : 'left',
    position     : 'relative',
    overflow     : 'hidden',
  },
  nfcBadge: {
    position     : 'absolute',
    top          : 16,
    right        : 16,
    background   : '#2563EB',
    color        : '#fff',
    fontSize     : '0.65rem',
    fontWeight   : 700,
    padding      : '3px 8px',
    borderRadius : 999,
    letterSpacing: '0.5px',
  },
  nfcName  : { fontSize: '1.1rem', fontWeight: 600, marginBottom: 4 },
  nfcNumber: { fontSize: '0.8rem', color: '#94A3B8', fontFamily: 'monospace' },
  nfcTier  : { fontSize: '0.75rem', color: '#64748B', marginTop: 8 },
  title    : { fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 },
  subtitle : { fontSize: '0.95rem', color: '#94A3B8', marginBottom: 28, lineHeight: 1.5 },
  btnApple : {
    display        : 'flex',
    alignItems     : 'center',
    justifyContent : 'center',
    gap            : 10,
    width          : '100%',
    padding        : '15px 20px',
    border         : 'none',
    borderRadius   : 12,
    fontSize       : '1rem',
    fontWeight     : 600,
    cursor         : 'pointer',
    textDecoration : 'none',
    background     : '#000',
    color          : '#fff',
    marginBottom   : 12,
    boxSizing      : 'border-box' as const,
  },
  btnGoogle: {
    display        : 'flex',
    alignItems     : 'center',
    justifyContent : 'center',
    gap            : 10,
    width          : '100%',
    padding        : '15px 20px',
    border         : '1px solid rgba(255,255,255,0.12)',
    borderRadius   : 12,
    fontSize       : '1rem',
    fontWeight     : 600,
    cursor         : 'pointer',
    textDecoration : 'none',
    background     : '#fff',
    color          : '#3c4043',
    boxSizing      : 'border-box' as const,
  },
  divider: {
    display        : 'flex',
    alignItems     : 'center',
    gap            : 12,
    margin         : '16px 0',
    color          : '#94A3B8',
    fontSize       : '0.8rem',
  },
  spinner: {
    width          : 36,
    height         : 36,
    border         : '3px solid rgba(255,255,255,0.1)',
    borderTopColor : '#2563EB',
    borderRadius   : '50%',
    margin         : '0 auto 16px',
  },
  footer: {
    marginTop      : 24,
    fontSize       : '0.75rem',
    color          : '#94A3B8',
  },
  errorIcon: { fontSize: '3rem', marginBottom: 12 },
}

// ── Icono Apple ───────────────────────────────────────────────────────────────

function AppleIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="white">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function WalletPage() {
  const params  = useParams()
  const id      = Array.isArray(params.id) ? params.id[0] : (params.id ?? '')

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [data,   setData  ] = useState<WalletData | null>(null)
  const [errMsg, setErrMsg] = useState('')

  // Detección de OS (sólo en cliente)
  const [os, setOs] = useState<'ios' | 'android' | 'desktop'>('desktop')

  useEffect(() => {
    const ua = navigator.userAgent ?? ''
    if (/iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)) setOs('ios')
    else if (/Android/.test(ua))                                  setOs('android')
    else                                                          setOs('desktop')
  }, [])

  // Fetch de datos
  useEffect(() => {
    if (!id) { setErrMsg('ID de tarjeta no especificado.'); setStatus('error'); return }

    fetch(`/api/wallet-info?id=${encodeURIComponent(id)}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then((d: WalletData) => { setData(d); setStatus('ready') })
      .catch(e => { setErrMsg(e.message); setStatus('error') })
  }, [id])

  // Android: redirección automática tras 800 ms
  useEffect(() => {
    if (status === 'ready' && os === 'android' && data?.googleWalletUrl) {
      const t = setTimeout(() => { window.location.href = data.googleWalletUrl! }, 800)
      return () => clearTimeout(t)
    }
  }, [status, os, data])

  // ── Renderizado ────────────────────────────────────────────────────────────

  return (
    <div style={S.root}>
      {/* Logo */}
      {data?.logoUrl
        ? <img src={data.logoUrl} alt="Logo" style={S.logoImg} />
        : <div style={S.logoWrap}>T</div>
      }

      <div style={S.card}>
        {/* Loading */}
        {status === 'loading' && (
          <>
            <SpinnerEl />
            <div style={S.title}>Cargando tu tarjeta…</div>
            <div style={S.subtitle}>Un momento, por favor.</div>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div style={S.errorIcon}>⚠️</div>
            <div style={S.title}>No encontrado</div>
            <div style={S.subtitle}>{errMsg}</div>
          </>
        )}

        {/* Ready */}
        {status === 'ready' && data && (
          <>
            {/* Preview NFC card */}
            <div style={S.nfcCard}>
              <span style={S.nfcBadge}>NFC</span>
              <div style={S.nfcName}>{data.displayName}</div>
              <div style={S.nfcNumber}>{data.cardNumber}</div>
              <div style={S.nfcTier}>{data.tier} · {data.stamps} sellos</div>
            </div>

            {/* iOS */}
            {os === 'ios' && data.pkpassUrl && (
              <>
                <div style={S.title}>Agrega tu tarjeta</div>
                <div style={S.subtitle}>Toca el botón para añadir tu tarjeta Taply a Apple Wallet.</div>
                <a href={data.pkpassUrl} download style={S.btnApple}>
                  <AppleIcon /> Add to Apple Wallet
                </a>
              </>
            )}

            {/* Android */}
            {os === 'android' && data.googleWalletUrl && (
              <>
                <div style={S.title}>Agrega tu tarjeta</div>
                <div style={S.subtitle}>Serás redirigido a Google Wallet en un momento…</div>
                <a href={data.googleWalletUrl} style={S.btnGoogle}>
                  <img
                    src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_48dp.png"
                    alt="Google" width={20} height={20}
                  />
                  Save to Google Wallet
                </a>
              </>
            )}

            {/* Desktop / ambas opciones */}
            {(os === 'desktop' || (!data.pkpassUrl && !data.googleWalletUrl)) && (
              <>
                <div style={S.title}>¡Hola, {data.displayName.split(' ')[0]}!</div>
                <div style={S.subtitle}>Elige dónde guardar tu tarjeta Taply NFC.</div>

                {data.pkpassUrl && (
                  <a href={data.pkpassUrl} download style={S.btnApple}>
                    <AppleIcon /> Apple Wallet
                  </a>
                )}

                {data.pkpassUrl && data.googleWalletUrl && (
                  <div style={S.divider}>
                    <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                    <span>o</span>
                    <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                  </div>
                )}

                {data.googleWalletUrl && (
                  <a href={data.googleWalletUrl} style={S.btnGoogle}>
                    <img
                      src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_48dp.png"
                      alt="Google" width={20} height={20}
                    />
                    Google Wallet
                  </a>
                )}

                {!data.pkpassUrl && !data.googleWalletUrl && (
                  <div style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
                    Wallet no disponible en este momento.
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <p style={S.footer}>
        Powered by <a href="https://taply.co" style={{ color: '#2563EB', textDecoration: 'none' }}>Taply</a>
      </p>

      {/* Spinner CSS animation */}
      <style>{`
        @keyframes _spin { to { transform: rotate(360deg); } }
        ._spin { animation: _spin 0.8s linear infinite; }
      `}</style>
    </div>
  )
}

function SpinnerEl() {
  return <div style={S.spinner} className="_spin" />
}
