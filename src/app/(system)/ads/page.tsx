'use client'

import { useState } from 'react'
import { Megaphone, Target, TrendingUp, DollarSign, Zap, Copy, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { formatCOP } from '@/lib/utils'
import { useIsMobile } from '@/lib/hooks'

type AdPlatform = 'meta' | 'tiktok'
type AdObjective = 'mensajes' | 'trafico' | 'conversiones' | 'alcance' | 'reconocimiento'
type AdProduct = 'essential' | 'custom' | 'ambos'

interface AdForm {
  product: AdProduct
  objective: AdObjective
  budget: string
  duration: string
  audience: string
  location: string
  ageMin: string
  ageMax: string
  hook: string
  benefit: string
}

interface GeneratedAd {
  headline: string
  primaryText: string
  description: string
  cta: string
  audience_rec: string
  budget_distribution: string
  kpis: string[]
  tips: string[]
  analysis: string[]
}

const OBJECTIVES: Record<AdObjective, string> = {
  mensajes: '💬 Mensajes (WhatsApp/DM)',
  trafico: '🌐 Tráfico al perfil',
  conversiones: '🛒 Conversiones',
  alcance: '👥 Alcance masivo',
  reconocimiento: '🏷️ Reconocimiento de marca',
}

const PRODUCTS: Record<AdProduct, string> = {
  essential: 'Taply Essential ($100.000)',
  custom: 'Taply Custom ($130.000)',
  ambos: 'Ambos productos',
}

function generateMetaAd(form: AdForm): GeneratedAd {
  const budget = Number(form.budget)
  const days = Number(form.duration)
  const dailyBudget = budget / days
  const productName = form.product === 'ambos' ? 'Taply NFC' : form.product === 'essential' ? 'Taply Essential' : 'Taply Custom'
  const price = form.product === 'custom' ? '130.000' : '100.000'

  const hooks: Record<AdObjective, string> = {
    mensajes: `¿Sigues regalando tarjetas de papel que nadie guarda? 😅`,
    trafico: `La tarjeta de presentación del futuro ya llegó a Colombia 🇨🇴`,
    conversiones: `Haz que tu primer contacto sea INOLVIDABLE con un solo tap ⚡`,
    alcance: `El negocio que conoce ${form.location || 'tu ciudad'} ya usa NFC. ¿Y el tuyo?`,
    reconocimiento: `Taply NFC — Porque los profesionales no cargan tarjetas de papel 💼`,
  }

  const bodies: Record<AdObjective, string> = {
    mensajes: `Imagínate: llegas a un evento, alguien quiere tu contacto y en lugar de buscar una tarjeta arrugada... simplemente acercas tu ${productName} al celular.\n\nEn 1 segundo tiene tu WhatsApp, Instagram, web y todo tu perfil.\n\n✅ Sin aplicaciones\n✅ Funciona en cualquier celular\n✅ Tu información siempre actualizada\n✅ Desde $${price} con soporte incluido\n\n📍 Entrega en ${form.location || 'toda Colombia'}`,
    trafico: `${productName} es la nueva forma de hacer networking en Colombia.\n\nUn tap y la otra persona tiene TODO tu perfil.\n\nNosotros actualizamos tu perfil cuando lo necesites.\n\n💡 Ideal para: emprendedores, profesionales, dueños de negocio\n📍 ${form.location || 'Colombia'}`,
    conversiones: `PARA: Emprendedores y profesionales de ${form.location || 'Colombia'}.\n\n${productName} — La tarjeta NFC que nunca se pierde y siempre está actualizada.\n\n🔥 Lo que incluye:\n• Tarjeta NFC personalizada\n• Perfil digital completo\n• Actualizaciones incluidas\n\n💰 Inversión: $${price} COP (pago único)`,
    alcance: `¿Sabes cuántas oportunidades de negocio se pierden porque no tenías una tarjeta?\n\nCon ${productName} eso no vuelve a pasar.\n\nUn solo tap. Tu perfil completo. Para siempre.\n\n📍 Ya lo usan profesionales en ${form.location || 'Colombia'}.`,
    reconocimiento: `En 2026, los profesionales que marcan la diferencia no entregan papel.\n\nTaply NFC te da la presencia digital que mereces.\n\n${productName} — Para quienes toman en serio su imagen profesional.\n\n📍 Disponible en ${form.location || 'Colombia'}`,
  }

  const testBudget = Math.round(budget * 0.3)
  const scaleBudget = Math.round(budget * 0.5)
  const retargetBudget = Math.round(budget * 0.2)

  return {
    headline: `${productName} — Un tap. Todo tu perfil. 🚀`,
    primaryText: bodies[form.objective],
    description: `Tarjeta NFC para profesionales en ${form.location || 'Colombia'}. Desde $${price} COP.`,
    cta: form.objective === 'mensajes' ? 'Enviar mensaje' : form.objective === 'conversiones' ? 'Comprar ahora' : 'Más información',
    audience_rec: `Edad: ${form.ageMin || '22'}-${form.ageMax || '45'} años | ${form.location || 'Colombia'} | Intereses: Emprendimiento, Networking, Negocios, Marketing Digital`,
    budget_distribution: `📊 Distribución de $${formatCOP(budget)} en ${days} días:\n\n• Fase Test (30% · ${formatCOP(testBudget)}): 3-5 días · Prueba 3-4 creatividades\n\n• Fase Escala (50% · ${formatCOP(scaleBudget)}): ${Math.round(days * 0.5)} días · Duplica el anuncio ganador\n\n• Fase Retargeting (20% · ${formatCOP(retargetBudget)}): Últimos días · Impacta a quienes vieron pero no compraron`,
    kpis: [
      `CPM objetivo: $8.000 - $15.000 COP`,
      `CTR mínimo: 1.5% · Óptimo: 3%+`,
      `CPC objetivo: $500 - $2.000 COP`,
      `Frecuencia ideal: 2-4 impactos por persona`,
      `ROAS mínimo para escalar: 3x`,
      `Costo por mensaje/lead: $5.000 - $15.000 COP`,
    ],
    tips: [
      `🎯 Usa el objetivo "${OBJECTIVES[form.objective]}"`,
      `📱 Prioriza: Instagram Feed, Instagram Stories, Facebook Feed`,
      `🎬 El creativo más efectivo: video 15-30 seg mostrando el tap`,
      `⚡ Activa "Advantage+ audience" para que Meta optimice`,
      `🔄 Rota creatividades cada 7 días`,
      `💬 Responde mensajes en menos de 1 hora`,
      `📊 Con ${formatCOP(budget)}, espera resultados después del día 3`,
      `🚀 Si el CPA baja de $10.000, duplica el presupuesto`,
    ],
    analysis: [
      budget < 50000 ? `⚠️ Presupuesto bajo: Con ${formatCOP(budget)}/día tendrás alcance limitado. Recomendamos mínimo $50.000/día.` : `✅ Presupuesto adecuado para ${form.location || 'Colombia'}.`,
      days < 7 ? `⚠️ Duración corta: Meta necesita 7 días para salir de la fase de aprendizaje.` : `✅ Duración correcta: ${days} días permite al algoritmo optimizar.`,
      form.objective === 'mensajes' ? `✅ Objetivo ideal: genera conversaciones directas por WhatsApp.` : `💡 Considera probar "Mensajes" — mejor ROI para Taply en Colombia.`,
      `📍 Ajusta a ciudades principales para mayor concentración de profesionales.`,
    ],
  }
}

function generateTikTokAd(form: AdForm): GeneratedAd {
  const budget = Number(form.budget)
  const days = Number(form.duration)
  const dailyBudget = budget / days
  const productName = form.product === 'ambos' ? 'Taply NFC' : form.product === 'essential' ? 'Taply Essential' : 'Taply Custom'
  const price = form.product === 'custom' ? '130.000' : '100.000'

  const testBudget = Math.round(budget * 0.4)
  const scaleBudget = Math.round(budget * 0.6)

  return {
    headline: `POV: Nunca más te quedas sin tarjetas de presentación 🤯`,
    primaryText: `¿Todavía usas tarjetas de papel? Mira esto... 👀\n\nUn solo tap y la persona tiene TODO tu perfil en su celular.\n\n✅ Sin apps · Sin papel · Sin excusas\n✅ ${productName} desde $${price} COP\n✅ Envío a ${form.location || 'toda Colombia'}\n✅ Nosotros actualizamos tu info cuando la necesites\n\n🔗 Link en bio para el tuyo`,
    description: `${productName} — Networking del futuro en Colombia`,
    cta: 'Comprar ahora',
    audience_rec: `Edad: ${form.ageMin || '20'}-${form.ageMax || '40'} años | ${form.location || 'Colombia'} | Intereses: Emprendimiento, Negocios, Marketing, Tecnología`,
    budget_distribution: `📊 Distribución de ${formatCOP(budget)} en ${days} días:\n\n• Fase Test (40% · ${formatCOP(testBudget)}): Primeros ${Math.round(days * 0.4)} días · Prueba 3 videos distintos\n\n• Fase Escala (60% · ${formatCOP(scaleBudget)}): Escala el video con mejor VTR\n\n⚠️ TikTok Ads mínimo recomendado: $30.000 COP/día`,
    kpis: [
      `CPM objetivo: $5.000 - $12.000 COP`,
      `VTR mínimo: 25% · Óptimo: 40%+`,
      `CTR mínimo: 1% · Óptimo: 2.5%+`,
      `CPC objetivo: $300 - $1.500 COP`,
      `Rota creatividades cada 5 días`,
      `Costo por resultado: $8.000 - $20.000 COP`,
    ],
    tips: [
      `🎵 USA SIEMPRE audio trending — aumenta 3x el alcance`,
      `⚡ Los primeros 2 segundos son CRÍTICOS`,
      `📱 Spark Ads: impulsa tus videos orgánicos que ya funcionan`,
      `🎯 TikTok Smart+ Campaign: deja que el algoritmo optimice`,
      `🔄 En TikTok la creatividad se fatiga en 5-7 días`,
      `📊 Con ${formatCOP(dailyBudget)}/día espera 50-200 impresiones únicas/día`,
    ],
    analysis: [
      dailyBudget < 30000 ? `⚠️ Presupuesto diario bajo: TikTok recomienda mínimo $30.000 COP/día.` : `✅ Presupuesto diario de ${formatCOP(dailyBudget)} es suficiente.`,
      days < 7 ? `⚠️ TikTok necesita al menos 7 días para aprender.` : `✅ ${days} días es adecuado para TikTok Ads.`,
      `🎬 Para Taply: VIDEO FACELESS mostrando el tap es el formato más efectivo.`,
      `📍 En Colombia, TikTok tiene mayor penetración en 18-35 años.`,
      budget < 150000 ? `💡 Con este presupuesto, empieza por Meta Ads y luego lleva las creatividades a TikTok.` : `✅ Presupuesto suficiente para probar ambas plataformas.`,
    ],
  }
}

export default function AdsPage() {
  const isMobile = useIsMobile()
  const [platform, setPlatform] = useState<AdPlatform>('meta')
  const [activeSection, setActiveSection] = useState<'generator' | 'guide'>('generator')
  const [generatedAd, setGeneratedAd] = useState<GeneratedAd | null>(null)
  const [generating, setGenerating] = useState(false)
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [expandedTip, setExpandedTip] = useState<string | null>(null)

  const [form, setForm] = useState<AdForm>({
    product: 'essential', objective: 'mensajes', budget: '100000', duration: '14',
    audience: '', location: 'Bogotá, Colombia', ageMin: '22', ageMax: '45', hook: '', benefit: '',
  })

  async function handleGenerate() {
    setGenerating(true); setGeneratedAd(null)
    await new Promise(r => setTimeout(r, 1200))
    const ad = platform === 'meta' ? generateMetaAd(form) : generateTikTokAd(form)
    setGeneratedAd(ad); setGenerating(false)
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopiedSection(key)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const platformColor = platform === 'meta' ? '#1877f2' : '#ff0050'
  const platformBg = platform === 'meta' ? '#1877f20d' : '#ff00500d'
  const platformBorder = platform === 'meta' ? '#1877f222' : '#ff005022'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <div>
        <h1 style={{ margin: 0, fontSize: isMobile ? '24px' : '32px', fontWeight: 900 }} className="taply-gradient-text">ADS</h1>
        <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>Generador y guía profesional de pautas para Taply NFC</p>
      </div>

      {/* Selector plataforma */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {([
          { id: 'meta', label: 'Meta Ads', sub: 'Facebook + Instagram', color: '#1877f2', bg: '#1877f20d', border: '#1877f222', emoji: '📘' },
          { id: 'tiktok', label: 'TikTok Ads', sub: 'TikTok For Business', color: '#ff0050', bg: '#ff00500d', border: '#ff005022', emoji: '🎵' },
        ] as const).map(p => (
          <button key={p.id} onClick={() => { setPlatform(p.id); setGeneratedAd(null) }}
            style={{ padding: '16px', borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
              backgroundColor: platform === p.id ? p.bg : '#161616',
              border: `2px solid ${platform === p.id ? p.color : '#1f1f1f'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px' }}>{p.emoji}</span>
              <span style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 800, color: platform === p.id ? p.color : '#f0f0f0' }}>{p.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>{p.sub}</p>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
        {([['generator', '⚡ Generador'], ['guide', '📚 Guía']] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveSection(tab)}
            style={{ flex: 1, padding: '10px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none',
              backgroundColor: activeSection === tab ? platformBg : 'transparent',
              color: activeSection === tab ? platformColor : '#6b7280' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Generador */}
      {activeSection === 'generator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Formulario */}
          <div style={{ borderRadius: '16px', padding: '24px', backgroundColor: '#161616', border: '1px solid #1f1f1f', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>
              Configura tu anuncio · {platform === 'meta' ? '📘 Meta' : '🎵 TikTok'}
            </h2>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Producto a pautar</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(Object.entries(PRODUCTS) as [AdProduct, string][]).map(([val, label]) => (
                  <button key={val} onClick={() => setForm(p => ({ ...p, product: val }))}
                    style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                      backgroundColor: form.product === val ? platformBg : '#0d0d0d',
                      border: `1px solid ${form.product === val ? platformColor + '44' : '#2a2a2a'}`,
                      color: form.product === val ? platformColor : '#6b7280' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Objetivo de campaña</label>
              <select value={form.objective} onChange={e => setForm(p => ({ ...p, objective: e.target.value as AdObjective }))}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }}>
                {(Object.entries(OBJECTIVES) as [AdObjective, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Presupuesto (COP)</label>
                <input type="number" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                  placeholder="100000"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
                {Number(form.budget) > 0 && (
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#6b7280' }}>
                    {formatCOP(Number(form.budget) / Number(form.duration))}/día
                  </p>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Duración (días)</label>
                <input type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                  placeholder="14"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Ubicación objetivo</label>
              <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                placeholder="Ej: Bogotá, Medellín, Colombia"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Edad mínima</label>
                <input type="number" value={form.ageMin} onChange={e => setForm(p => ({ ...p, ageMin: e.target.value }))}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Edad máxima</label>
                <input type="number" value={form.ageMax} onChange={e => setForm(p => ({ ...p, ageMax: e.target.value }))}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating || !form.budget || !form.duration}
              style={{ padding: '14px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: generating ? 'not-allowed' : 'pointer', border: 'none',
                background: generating ? '#2a2a2a' : `linear-gradient(90deg, ${platformColor}, ${platform === 'meta' ? '#00cfff' : '#00ff94'})`,
                color: generating ? '#6b7280' : '#fff' }}>
              {generating ? '⚙️ Generando...' : `⚡ Generar Anuncio ${platform === 'meta' ? 'Meta' : 'TikTok'}`}
            </button>
          </div>

          {/* Resultado */}
          {!generatedAd && !generating && (
            <div style={{ borderRadius: '16px', padding: '48px 24px', textAlign: 'center', backgroundColor: '#161616', border: '1px dashed #2a2a2a' }}>
              <Megaphone size={36} style={{ color: '#374151', margin: '0 auto 16px', display: 'block' }} />
              <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>Configura y genera tu anuncio arriba</p>
            </div>
          )}

          {generating && (
            <div style={{ borderRadius: '16px', padding: '48px 24px', textAlign: 'center', backgroundColor: '#161616', border: `1px solid ${platformBorder}` }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>⚡</div>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: platformColor }}>Generando anuncio...</p>
            </div>
          )}

          {generatedAd && !generating && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ borderRadius: '14px', padding: '16px', backgroundColor: '#161616', border: `1px solid ${platformBorder}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <AlertCircle size={16} style={{ color: platformColor }} />
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f0f0f0' }}>Análisis de tu configuración</h3>
                </div>
                {generatedAd.analysis.map((item, i) => (
                  <p key={i} style={{ margin: i === 0 ? 0 : '8px 0 0', fontSize: '12px', color: '#9ca3af', lineHeight: '1.6' }}>{item}</p>
                ))}
              </div>

              {[
                { key: 'headline', label: '📌 Titular', content: generatedAd.headline },
                { key: 'primary', label: '📝 Texto principal', content: generatedAd.primaryText },
                { key: 'description', label: '🏷️ Descripción', content: generatedAd.description },
                { key: 'cta', label: '🎯 CTA', content: generatedAd.cta },
              ].map(({ key, label, content }) => (
                <div key={key} style={{ borderRadius: '14px', padding: '14px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af' }}>{label}</span>
                    <button onClick={() => copyText(content, key)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                        backgroundColor: copiedSection === key ? '#00ff940d' : platformBg,
                        border: `1px solid ${copiedSection === key ? '#00ff9433' : platformBorder}`,
                        color: copiedSection === key ? '#00ff94' : platformColor }}>
                      <Copy size={11} />
                      {copiedSection === key ? '✓' : 'Copiar'}
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#f0f0f0', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{content}</p>
                </div>
              ))}

              <div style={{ borderRadius: '14px', padding: '14px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af' }}>🎯 Audiencia recomendada</span>
                  <button onClick={() => copyText(generatedAd.audience_rec, 'audience')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', backgroundColor: copiedSection === 'audience' ? '#00ff940d' : platformBg, border: `1px solid ${copiedSection === 'audience' ? '#00ff9433' : platformBorder}`, color: copiedSection === 'audience' ? '#00ff94' : platformColor }}>
                    <Copy size={11} />
                    {copiedSection === 'audience' ? '✓' : 'Copiar'}
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#f0f0f0', lineHeight: '1.7' }}>{generatedAd.audience_rec}</p>
              </div>

              <div style={{ borderRadius: '14px', padding: '14px', backgroundColor: platformBg, border: `1px solid ${platformBorder}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: platformColor }}>💰 Distribución del presupuesto</span>
                  <button onClick={() => copyText(generatedAd.budget_distribution, 'budget')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', border: `1px solid ${platformBorder}`, color: platformColor }}>
                    <Copy size={11} /> Copiar
                  </button>
                </div>
                <pre style={{ margin: 0, fontSize: '12px', color: '#f0f0f0', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{generatedAd.budget_distribution}</pre>
              </div>

              <div style={{ borderRadius: '14px', padding: '14px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', display: 'block', marginBottom: '10px' }}>📊 KPIs a vigilar</span>
                {generatedAd.kpis.map((kpi, i) => (
                  <p key={i} style={{ margin: i === 0 ? 0 : '6px 0 0', fontSize: '12px', color: '#f0f0f0', lineHeight: '1.6' }}>• {kpi}</p>
                ))}
              </div>

              <div style={{ borderRadius: '14px', padding: '14px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
                <button onClick={() => setExpandedTip(expandedTip === 'tips' ? null : 'tips')}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af' }}>💡 Tips ({generatedAd.tips.length})</span>
                  {expandedTip === 'tips' ? <ChevronUp size={14} style={{ color: '#6b7280' }} /> : <ChevronDown size={14} style={{ color: '#6b7280' }} />}
                </button>
                {expandedTip === 'tips' && generatedAd.tips.map((tip, i) => (
                  <p key={i} style={{ margin: '8px 0 0', fontSize: '12px', color: '#9ca3af', lineHeight: '1.6' }}>{tip}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guía */}
      {activeSection === 'guide' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(platform === 'meta' ? [
            { title: '🏗️ Estructura de campaña para Taply NFC', content: `NIVEL 1 — CAMPAÑA\n• Objetivo: Mensajes o Tráfico\n• Presupuesto: A nivel de campaña (Advantage Campaign Budget)\n\nNIVEL 2 — AD SET\n• Ad Set 1: Intereses (emprendimiento, networking)\n• Ad Set 2: Lookalike 1% de tus clientes\n• Ad Set 3: Broad (sin intereses)\n• Placements: Instagram Feed + Stories + Facebook Feed\n\nNIVEL 3 — ANUNCIO\n• Mínimo 3 creatividades por Ad Set\n• Formatos: Video 9:16 + Imagen cuadrada` },
            { title: '🎯 Públicos que funcionan en Colombia', content: `INTERESES:\n• Emprendimiento + Pequeñas empresas\n• LinkedIn + Networking profesional\n• Marketing digital + Redes sociales\n\nCOMPORTAMIENTOS:\n• Compradores online frecuentes\n• Dueños de pequeñas empresas\n\nPÚBLICOS PERSONALIZADOS:\n• Lookalike 1% de tu lista de clientes\n• Lookalike 1% de seguidores de Instagram\n• Retargeting: vieron tu perfil últimos 30 días` },
            { title: '💰 Guía de presupuestos para Colombia', content: `MÍNIMO VIABLE:\n• Por Ad Set: $20.000 - $30.000 COP/día\n• Por Campaña: $60.000 - $100.000 COP/día\n• Para empezar: $50.000/día × 7 días = $350.000\n\nESCALA PROGRESIVA:\n• Semana 1: $30.000/día — Prueba y aprende\n• Semana 2: $50.000/día — Identifica ganadores\n• Semana 3: $80.000/día — Escala lo que funciona\n\nREGLA DE ORO:\n• Nunca aumentes más del 20% cada 3 días\n• ROAS mínimo para escalar: 3x` },
            { title: '📱 Formatos más efectivos', content: `#1 VIDEO VERTICAL 9:16 (el más efectivo)\n• 15-30 segundos mostrando el tap\n• Instagram Stories + Reels\n\n#2 VIDEO CUADRADO 1:1\n• Instagram Feed + Facebook Feed\n\n#3 IMAGEN ESTÁTICA\n• Texto mínimo (Meta penaliza +20% texto)\n• Útil para retargeting\n\nORDEN: Video 9:16 > Video 1:1 > Imagen` },
          ] : [
            { title: '🏗️ Estructura de campaña TikTok para Taply', content: `NIVEL 1 — CAMPAÑA\n• Objetivo: Conversiones o Alcance\n• Smart+ Campaign (TikTok optimiza todo)\n• Mínimo: $50.000 COP/campaña\n\nNIVEL 2 — AD GROUP\n• Colombia (ciudades principales)\n• Mínimo por Ad Group: $30.000 COP/día\n\nNIVEL 3 — ANUNCIO\n• Mínimo 3 videos por Ad Group\n• Duración ideal: 21-34 segundos\n• Usa Spark Ads para tus videos orgánicos` },
            { title: '🎯 Audiencias en TikTok Colombia', content: `INTERESES:\n• Negocios y emprendimiento\n• Tecnología y gadgets\n• Marketing y publicidad digital\n\nAUDIENCIAS PERSONALIZADAS:\n• Custom Audience de emails de clientes\n• Lookalike de tus seguidores\n• Retargeting: usuarios que vieron al 75%+\n\nRECOMENDACIÓN:\n→ Empieza con Smart+ Campaign\n→ Más efectivo que intereses manuales` },
            { title: '💰 Presupuestos TikTok Ads', content: `MÍNIMOS:\n• Por Ad Group: $30.000 COP/día\n• Por Campaña: $50.000 COP/día\n• Para resultados reales: $100.000+/día\n\nVENTAJA VS META:\n• CPM más barato: $5.000 - $12.000 COP\n• Mayor alcance orgánico\n\nESTRATEGIA:\n• Semana 1: $50.000/día — Prueba 3 videos\n• Semana 2: Identifica el de mejor VTR\n• Semana 3+: Duplica presupuesto del ganador` },
            { title: '🎬 Creatividades que convierten', content: `FORMATO #1 — POV (el más viral)\n"POV: Llegas a un evento y alguien quiere tu contacto"\n\nFORMATO #2 — Antes/Después\nTarjeta de papel vs tap elegante\n\nFORMATO #3 — Tutorial\n"Cómo funciona Taply en 10 segundos"\n\nELEMENTOS OBLIGATORIOS:\n✅ Hook en los primeros 2 segundos\n✅ Audio trending de TikTok\n✅ Subtítulos automáticos\n✅ CTA en los últimos 3 segundos\n\nSPARK ADS: Impulsa tus videos orgánicos` },
          ]).map(({ title, content }) => (
            <div key={title} style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #1f1f1f' }}>
              <button onClick={() => setExpandedTip(expandedTip === title ? null : title)}
                style={{ width: '100%', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#161616', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#f0f0f0' }}>{title}</span>
                {expandedTip === title ? <ChevronUp size={16} style={{ color: '#6b7280', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: '#6b7280', flexShrink: 0 }} />}
              </button>
              {expandedTip === title && (
                <div style={{ padding: '0 16px 16px', backgroundColor: '#161616', borderTop: '1px solid #1f1f1f' }}>
                  <pre style={{ margin: '14px 0 0', fontSize: '12px', color: '#9ca3af', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{content}</pre>
                  <button onClick={() => copyText(content, title)}
                    style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: platformBg, border: `1px solid ${platformBorder}`, color: platformColor }}>
                    <Copy size={12} />
                    {copiedSection === title ? 'Copiado ✓' : 'Copiar sección'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
