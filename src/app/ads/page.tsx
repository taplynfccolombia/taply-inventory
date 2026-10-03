'use client'

import { useState } from 'react'
import { Megaphone, Target, TrendingUp, DollarSign, Zap, Copy, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { formatCOP } from '@/lib/utils'

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
  const isEssential = form.product === 'essential' || form.product === 'ambos'
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
    mensajes: `Imagínate: llegas a un evento, alguien quiere tu contacto y en lugar de buscar una tarjeta arrugada... simplemente acercas tu ${productName} al celular de la otra persona.\n\nEn 1 segundo tiene tu WhatsApp, Instagram, web y todo tu perfil profesional.\n\n✅ Sin aplicaciones\n✅ Funciona en cualquier celular\n✅ Tu información siempre actualizada\n✅ Desde $${price} con soporte incluido\n\n📍 Entrega en ${form.location || 'toda Colombia'}`,
    trafico: `${productName} es la nueva forma de hacer networking en Colombia.\n\nUn tap y la otra persona tiene TODO tu perfil:\n→ WhatsApp directo\n→ Redes sociales\n→ Sitio web\n→ Lo que tú decidas mostrar\n\nNosotros actualizamos tu perfil cuando lo necesites. Tú solo tapeas.\n\n💡 Ideal para: emprendedores, profesionales, dueños de negocio\n📍 ${form.location || 'Colombia'}`,
    conversiones: `PARA: Emprendedores y profesionales de ${form.location || 'Colombia'} que quieren impresionar desde el primer contacto.\n\n${productName} — La tarjeta NFC que nunca se pierde, nunca se acaba y siempre está actualizada.\n\n🔥 Lo que incluye:\n• Tarjeta NFC personalizada\n• Perfil digital completo\n• Actualizaciones incluidas\n• Soporte directo\n\n⏰ Tiempo de entrega: 3-5 días hábiles\n💰 Inversión: $${price} COP (pago único)`,
    alcance: `¿Sabes cuántas oportunidades de negocio se pierden porque no tenías una tarjeta a mano?\n\nCon ${productName} eso no vuelve a pasar.\n\nUn solo tap. Tu perfil completo. Para siempre.\n\n🎯 Ya lo usan médicos, abogados, agentes inmobiliarios y emprendedores en ${form.location || 'Colombia'}.\n\n¿Cuándo vas a actualizarte tú?`,
    reconocimiento: `En 2026, los profesionales que marcan la diferencia no entregan papel.\n\nTaply NFC te da la presencia digital que mereces en cada apretón de manos, cada evento, cada oportunidad.\n\n${productName} — Diseñado para quienes toman en serio su imagen profesional.\n\n📍 Disponible en ${form.location || 'Colombia'}`,
  }

  const ctas: Record<AdObjective, string> = {
    mensajes: 'Enviar mensaje',
    trafico: 'Más información',
    conversiones: 'Comprar ahora',
    alcance: 'Más información',
    reconocimiento: 'Más información',
  }

  // Distribución de presupuesto
  const testBudget = Math.round(budget * 0.3)
  const scaleBudget = Math.round(budget * 0.5)
  const retargetBudget = Math.round(budget * 0.2)

  return {
    headline: `${productName} — Un tap. Todo tu perfil. 🚀`,
    primaryText: bodies[form.objective],
    description: `Tarjeta NFC para profesionales en ${form.location || 'Colombia'}. Desde $${price} COP.`,
    cta: ctas[form.objective],
    audience_rec: `Edad: ${form.ageMin || '22'}-${form.ageMax || '45'} años | ${form.location || 'Colombia'} | Intereses: Emprendimiento, Networking, Negocios, Marketing Digital, LinkedIn | Comportamientos: Dueños de negocios, Compradores online frecuentes`,
    budget_distribution: `📊 Distribución de $${formatCOP(budget)} en ${days} días:\n\n• Fase Test (30% · ${formatCOP(testBudget)}): 3-5 días · Prueba 3-4 creatividades distintas · Identifica cuál tiene mejor CTR\n\n• Fase Escala (50% · ${formatCOP(scaleBudget)}): ${Math.round(days * 0.5)} días · Duplica el presupuesto del anuncio ganador · Mantén frecuencia entre 2-4\n\n• Fase Retargeting (20% · ${formatCOP(retargetBudget)}): Últimos días · Impacta a quienes vieron el anuncio pero no compraron · Usa oferta o urgencia`,
    kpis: [
      `CPM objetivo: $8.000 - $15.000 COP (Colombia)`,
      `CTR mínimo aceptable: 1.5% · Óptimo: 3%+`,
      `CPC objetivo: $500 - $2.000 COP`,
      `Frecuencia ideal: 2-4 impactos por persona`,
      `ROAS mínimo para escalar: 3x (inviertes $1, ganas $3+)`,
      `Costo por mensaje/lead objetivo: $5.000 - $15.000 COP`,
    ],
    tips: [
      `🎯 Usa el objetivo "${OBJECTIVES[form.objective]}" — ideal para el producto ${productName}`,
      `📱 Prioriza placements: Instagram Feed, Instagram Stories, Facebook Feed`,
      `🎬 El creativo más efectivo para NFC: video de 15-30 seg mostrando el tap en vivo`,
      `⚡ Activa "Advantage+ audience" de Meta para que el algoritmo optimice el público`,
      `🔄 Rota creatividades cada 7 días para evitar fatiga del anuncio`,
      `💬 Responde mensajes en menos de 1 hora — Meta premia la velocidad de respuesta`,
      `📊 Con presupuesto de ${formatCOP(budget)}, espera resultados reales después de día 3`,
      `🚀 Si el CPA baja de $10.000, duplica el presupuesto inmediatamente`,
    ],
    analysis: [
      budget < 50000 ? `⚠️ Presupuesto bajo: Con $${formatCOP(budget)} tendrás alcance limitado. Recomendamos mínimo $50.000/día para resultados consistentes en Colombia.` : `✅ Presupuesto adecuado para ${form.location || 'Colombia'}. Suficiente para fase de aprendizaje del algoritmo.`,
      days < 7 ? `⚠️ Duración corta: Meta necesita 7 días para salir de la fase de aprendizaje. Extiende a mínimo 7-14 días para resultados óptimos.` : `✅ Duración correcta: ${days} días permite al algoritmo optimizar y salir de la fase de aprendizaje.`,
      form.objective === 'mensajes' ? `✅ Objetivo ideal para Taply: "Mensajes" genera conversaciones directas por WhatsApp. Alta intención de compra. Cierre de venta más rápido.` : form.objective === 'conversiones' ? `✅ Objetivo avanzado: Requiere píxel de Meta instalado. Si no lo tienes, usa "Mensajes" primero.` : `💡 Considera probar el objetivo "Mensajes" — suele generar mejor ROI para productos como Taply NFC en Colombia.`,
      `📍 Segmentación por ${form.location || 'Colombia'}: Ajusta a ciudades principales (Bogotá, Medellín, Cali, Barranquilla) para mayor concentración de profesionales.`,
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
    primaryText: `¿Todavía usas tarjetas de papel? Mira esto... 👀\n\n[MOSTRAR TAP EN CÁMARA]\n\nUn solo tap y la persona tiene TODO tu perfil en su celular.\n\n✅ Sin apps · Sin papel · Sin excusas\n✅ ${productName} desde $${price} COP\n✅ Envío a ${form.location || 'toda Colombia'}\n✅ Nosotros actualizamos tu info cuando la necesites\n\n🔗 Link en bio para el tuyo`,
    description: `${productName} — Networking del futuro en Colombia`,
    cta: 'Comprar ahora',
    audience_rec: `Edad: ${form.ageMin || '20'}-${form.ageMax || '40'} años | ${form.location || 'Colombia'} | Intereses: Emprendimiento, Negocios, Marketing, Tecnología | Custom Audience: Lookalike de tus seguidores de Instagram`,
    budget_distribution: `📊 Distribución de ${formatCOP(budget)} en ${days} días:\n\n• Fase Test (40% · ${formatCOP(testBudget)}): Primeros ${Math.round(days * 0.4)} días · Prueba 3 videos distintos (formatos: POV, Tutorial, Reacción) · Mínimo $20.000/día por Ad Group\n\n• Fase Escala (60% · ${formatCOP(scaleBudget)}): Últimos días · Escala el video con mejor VTR (View-Through Rate) · Aumenta presupuesto 20% cada 2 días si el CPA es favorable\n\n⚠️ TikTok Ads mínimo recomendado: $30.000 COP/día por campaña`,
    kpis: [
      `CPM objetivo: $5.000 - $12.000 COP (más barato que Meta)`,
      `VTR (View-Through Rate) mínimo: 25% · Óptimo: 40%+`,
      `CTR mínimo: 1% · Óptimo: 2.5%+`,
      `CPC objetivo: $300 - $1.500 COP`,
      `Frecuencia: Rota creatividades cada 5 días (TikTok se fatiga más rápido)`,
      `Costo por resultado objetivo: $8.000 - $20.000 COP`,
    ],
    tips: [
      `🎵 USA SIEMPRE audio trending — aumenta hasta 3x el alcance orgánico`,
      `⚡ Los primeros 2 segundos son CRÍTICOS — empieza con el resultado final (el tap funcionando)`,
      `📱 Formato Spark Ads: impulsa tus videos orgánicos que ya funcionan — más económico y creíble`,
      `🎯 TikTok Smart+ Campaign: deja que el algoritmo optimice público, placement y puja automáticamente`,
      `🔄 En TikTok la creatividad se fatiga en 5-7 días — ten mínimo 3 videos listos antes de lanzar`,
      `👥 Usa "Lookalike Audience" basada en tus seguidores de Instagram para mayor relevancia`,
      `📊 Con presupuesto diario de ${formatCOP(dailyBudget)}, espera 50-200 impresiones únicas/día`,
      `🚀 TikTok tiene CPM más bajo que Meta — ideal para awareness y alcance masivo inicial`,
    ],
    analysis: [
      dailyBudget < 30000 ? `⚠️ Presupuesto diario bajo: TikTok Ads recomienda mínimo $30.000 COP/día por Ad Group para que el algoritmo aprenda. Con $${formatCOP(dailyBudget)}/día los resultados serán muy limitados.` : `✅ Presupuesto diario de ${formatCOP(dailyBudget)} es suficiente para que TikTok optimice el Ad Group.`,
      days < 7 ? `⚠️ TikTok necesita al menos 7 días para salir de la fase de aprendizaje. Extiende la campaña.` : `✅ ${days} días es una duración adecuada para TikTok Ads.`,
      `🎬 Para Taply NFC en TikTok: el formato más efectivo es VIDEO FACELESS mostrando el tap. Sin cara, solo manos + celular + la magia del NFC.`,
      `📍 En Colombia, TikTok tiene mayor penetración en 18-35 años. Si tu target son profesionales mayores de 40, Meta puede ser más efectivo.`,
      budget < 150000 ? `💡 Con este presupuesto, recomendamos empezar por Meta Ads (más maduro en Colombia) y cuando tengas creatividades probadas, llevarlas a TikTok.` : `✅ Presupuesto suficiente para probar ambas plataformas simultáneamente.`,
    ],
  }
}

export default function AdsPage() {
  const [platform, setPlatform] = useState<AdPlatform>('meta')
  const [activeSection, setActiveSection] = useState<'generator' | 'guide'>('generator')
  const [generatedAd, setGeneratedAd] = useState<GeneratedAd | null>(null)
  const [generating, setGenerating] = useState(false)
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [expandedTip, setExpandedTip] = useState<string | null>(null)

  const [form, setForm] = useState<AdForm>({
    product: 'essential',
    objective: 'mensajes',
    budget: '100000',
    duration: '14',
    audience: '',
    location: 'Bogotá, Colombia',
    ageMin: '22',
    ageMax: '45',
    hook: '',
    benefit: '',
  })

  async function handleGenerate() {
    setGenerating(true)
    setGeneratedAd(null)
    await new Promise(r => setTimeout(r, 1200))
    const ad = platform === 'meta' ? generateMetaAd(form) : generateTikTokAd(form)
    setGeneratedAd(ad)
    setGenerating(false)
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }} className="taply-gradient-text">ADS</h1>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>
            Generador y guía profesional de pautas para Taply NFC
          </p>
        </div>
      </div>

      {/* Selector de plataforma */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {([
          { id: 'meta', label: 'Meta Ads', sub: 'Facebook + Instagram', color: '#1877f2', bg: '#1877f20d', border: '#1877f222', emoji: '📘' },
          { id: 'tiktok', label: 'TikTok Ads', sub: 'TikTok For Business', color: '#ff0050', bg: '#ff00500d', border: '#ff005022', emoji: '🎵' },
        ] as const).map(p => (
          <button key={p.id} onClick={() => { setPlatform(p.id); setGeneratedAd(null) }}
            style={{ padding: '20px 24px', borderRadius: '16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
              backgroundColor: platform === p.id ? p.bg : '#161616',
              border: `2px solid ${platform === p.id ? p.color : '#1f1f1f'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <span style={{ fontSize: '24px' }}>{p.emoji}</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: platform === p.id ? p.color : '#f0f0f0' }}>{p.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{p.sub}</p>
          </button>
        ))}
      </div>

      {/* Tabs: Generador / Guía */}
      <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px', backgroundColor: '#161616', border: '1px solid #1f1f1f', alignSelf: 'flex-start' }}>
        {([['generator', '⚡ Generador de Anuncios'], ['guide', '📚 Guía Profesional']] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveSection(tab)}
            style={{ padding: '10px 20px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none',
              backgroundColor: activeSection === tab ? platformBg : 'transparent',
              color: activeSection === tab ? platformColor : '#6b7280' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ═══ GENERADOR ═══ */}
      {activeSection === 'generator' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* Formulario */}
          <div style={{ borderRadius: '16px', padding: '28px', backgroundColor: '#161616', border: '1px solid #1f1f1f', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#f0f0f0' }}>
              Configura tu anuncio · {platform === 'meta' ? '📘 Meta' : '🎵 TikTok'}
            </h2>

            {/* Producto */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Producto a pautar</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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

            {/* Objetivo */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Objetivo de campaña</label>
              <select value={form.objective} onChange={e => setForm(p => ({ ...p, objective: e.target.value as AdObjective }))}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }}>
                {(Object.entries(OBJECTIVES) as [AdObjective, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            {/* Presupuesto y duración */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>
                  Presupuesto total (COP)
                </label>
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>
                  Duración (días)
                </label>
                <input type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                  placeholder="14"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Ubicación y edad */}
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
                  placeholder="22"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Edad máxima</label>
                <input type="number" value={form.ageMax} onChange={e => setForm(p => ({ ...p, ageMax: e.target.value }))}
                  placeholder="45"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Botón generar */}
            <button onClick={handleGenerate} disabled={generating || !form.budget || !form.duration}
              style={{ padding: '14px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: generating ? 'not-allowed' : 'pointer', border: 'none', marginTop: '8px',
                background: generating ? '#2a2a2a' : `linear-gradient(90deg, ${platformColor}, ${platform === 'meta' ? '#00cfff' : '#00ff94'})`,
                color: generating ? '#6b7280' : '#fff' }}>
              {generating ? '⚙️ Generando anuncio...' : `⚡ Generar Anuncio ${platform === 'meta' ? 'Meta' : 'TikTok'}`}
            </button>
          </div>

          {/* Resultado */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!generatedAd && !generating && (
              <div style={{ borderRadius: '16px', padding: '48px', textAlign: 'center', backgroundColor: '#161616', border: '1px dashed #2a2a2a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <Megaphone size={40} style={{ color: '#374151', marginBottom: '16px' }} />
                <p style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#4b5563' }}>
                  Configura tu anuncio
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>
                  Completa el formulario y genera tu copy profesional
                </p>
              </div>
            )}

            {generating && (
              <div style={{ borderRadius: '16px', padding: '48px', textAlign: 'center', backgroundColor: '#161616', border: `1px solid ${platformBorder}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px', animation: 'pulse 1s infinite' }}>⚡</div>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: platformColor }}>
                  Analizando y generando...
                </p>
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6b7280' }}>
                  Optimizando para {platform === 'meta' ? 'Meta Ads' : 'TikTok Ads'}
                </p>
              </div>
            )}

            {generatedAd && !generating && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Análisis */}
                <div style={{ borderRadius: '14px', padding: '20px', backgroundColor: '#161616', border: `1px solid ${platformBorder}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <AlertCircle size={16} style={{ color: platformColor }} />
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f0f0f0' }}>Análisis de tu configuración</h3>
                  </div>
                  {generatedAd.analysis.map((item, i) => (
                    <p key={i} style={{ margin: i === 0 ? 0 : '8px 0 0', fontSize: '12px', color: '#9ca3af', lineHeight: '1.6' }}>{item}</p>
                  ))}
                </div>

                {/* Copy del anuncio */}
                {[
                  { key: 'headline', label: '📌 Titular', content: generatedAd.headline },
                  { key: 'primary', label: '📝 Texto principal', content: generatedAd.primaryText },
                  { key: 'description', label: '🏷️ Descripción', content: generatedAd.description },
                  { key: 'cta', label: '🎯 CTA', content: generatedAd.cta },
                ].map(({ key, label, content }) => (
                  <div key={key} style={{ borderRadius: '14px', padding: '16px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#9ca3af' }}>{label}</span>
                      <button onClick={() => copyText(content, key)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', backgroundColor: copiedSection === key ? '#00ff940d' : platformBg, border: `1px solid ${copiedSection === key ? '#00ff9433' : platformBorder}`, color: copiedSection === key ? '#00ff94' : platformColor }}>
                        <Copy size={11} />
                        {copiedSection === key ? 'Copiado ✓' : 'Copiar'}
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#f0f0f0', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{content}</p>
                  </div>
                ))}

                {/* Audiencia */}
                <div style={{ borderRadius: '14px', padding: '16px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#9ca3af' }}>🎯 Audiencia recomendada</span>
                    <button onClick={() => copyText(generatedAd.audience_rec, 'audience')}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', backgroundColor: copiedSection === 'audience' ? '#00ff940d' : platformBg, border: `1px solid ${copiedSection === 'audience' ? '#00ff9433' : platformBorder}`, color: copiedSection === 'audience' ? '#00ff94' : platformColor }}>
                      <Copy size={11} />
                      {copiedSection === 'audience' ? 'Copiado ✓' : 'Copiar'}
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#f0f0f0', lineHeight: '1.7' }}>{generatedAd.audience_rec}</p>
                </div>

                {/* Distribución de presupuesto */}
                <div style={{ borderRadius: '14px', padding: '16px', backgroundColor: platformBg, border: `1px solid ${platformBorder}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: platformColor }}>💰 Distribución del presupuesto</span>
                    <button onClick={() => copyText(generatedAd.budget_distribution, 'budget')}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', backgroundColor: copiedSection === 'budget' ? '#00ff940d' : 'transparent', border: `1px solid ${copiedSection === 'budget' ? '#00ff9433' : platformBorder}`, color: copiedSection === 'budget' ? '#00ff94' : platformColor }}>
                      <Copy size={11} />
                      {copiedSection === 'budget' ? 'Copiado ✓' : 'Copiar'}
                    </button>
                  </div>
                  <pre style={{ margin: 0, fontSize: '12px', color: '#f0f0f0', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{generatedAd.budget_distribution}</pre>
                </div>

                {/* KPIs */}
                <div style={{ borderRadius: '14px', padding: '16px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#9ca3af', display: 'block', marginBottom: '12px' }}>📊 KPIs a vigilar</span>
                  {generatedAd.kpis.map((kpi, i) => (
                    <p key={i} style={{ margin: i === 0 ? 0 : '6px 0 0', fontSize: '12px', color: '#f0f0f0', lineHeight: '1.6' }}>• {kpi}</p>
                  ))}
                </div>

                {/* Tips */}
                <div style={{ borderRadius: '14px', padding: '16px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
                  <button onClick={() => setExpandedTip(expandedTip === 'tips' ? null : 'tips')}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: expandedTip === 'tips' ? '12px' : 0 }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#9ca3af' }}>💡 Tips de optimización ({generatedAd.tips.length})</span>
                    {expandedTip === 'tips' ? <ChevronUp size={16} style={{ color: '#6b7280' }} /> : <ChevronDown size={16} style={{ color: '#6b7280' }} />}
                  </button>
                  {expandedTip === 'tips' && generatedAd.tips.map((tip, i) => (
                    <p key={i} style={{ margin: i === 0 ? 0 : '8px 0 0', fontSize: '12px', color: '#9ca3af', lineHeight: '1.6' }}>{tip}</p>
                  ))}
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ GUÍA PROFESIONAL ═══ */}
      {activeSection === 'guide' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {platform === 'meta' ? (
            <>
              {[
                {
                  title: '🏗️ Estructura de campaña recomendada para Taply NFC',
                  content: `NIVEL 1 — CAMPAÑA\n• Objetivo: Mensajes (para cerrar ventas por WhatsApp) o Tráfico (para awareness)\n• Presupuesto: A nivel de campaña (Advantage Campaign Budget)\n• Tipo: Subasta\n\nNIVEL 2 — AD SET (grupo de anuncios)\n• Públicos: Crea 3 Ad Sets diferentes para probar\n  → Ad Set 1: Intereses (emprendimiento, networking, negocios)\n  → Ad Set 2: Lookalike 1% basado en tus clientes actuales\n  → Ad Set 3: Broad (sin intereses — deja que Meta optimice)\n• Placements: Manual — Instagram Feed + Instagram Stories + Facebook Feed\n• Optimización: Conversaciones iniciadas (mensajes)\n\nNIVEL 3 — ANUNCIO\n• Mínimo 3 creatividades por Ad Set\n• Formatos: Video 9:16 (Stories/Reels) + Imagen cuadrada (Feed)\n• Identifica el ganador en 3-5 días y pausa los demás`,
                },
                {
                  title: '🎯 Públicos que funcionan para Taply en Colombia',
                  content: `PÚBLICOS DE INTERÉS (para empezar):\n• Emprendimiento + Pequeñas empresas + Startup\n• LinkedIn + Networking profesional\n• Marketing digital + Redes sociales para negocios\n• Tecnología NFC + Tarjetas de presentación digitales\n• Médicos / Abogados / Agentes inmobiliarios (según tu cliente ideal)\n\nCOMPORTAMIENTOS:\n• Compradores online frecuentes (últimos 30 días)\n• Dueños de pequeñas empresas\n• Viajeros frecuentes de negocios\n\nPÚBLICOS PERSONALIZADOS (más avanzados):\n• Lookalike 1% de tu lista de clientes (sube los emails a Meta)\n• Lookalike 1% de tus seguidores de Instagram\n• Retargeting: personas que vieron tu perfil de Instagram en los últimos 30 días\n• Retargeting: personas que enviaron mensaje pero no compraron`,
                },
                {
                  title: '💰 Guía de presupuestos para Colombia',
                  content: `PRESUPUESTO MÍNIMO VIABLE:\n• Por Ad Set: $20.000 - $30.000 COP/día\n• Por Campaña: $60.000 - $100.000 COP/día (si tienes 3 Ad Sets)\n• Recomendado para empezar: $50.000 COP/día durante 7 días = $350.000 COP total\n\nESCALA PROGRESIVA:\n• Semana 1: $30.000/día — Fase de aprendizaje y prueba\n• Semana 2: $50.000/día — Identificar creatividades ganadoras\n• Semana 3: $80.000/día — Escalar lo que funciona\n• Semana 4+: $100.000+/día — Solo si el ROAS es 3x o más\n\nREGLA DE ORO:\n• Nunca aumentes el presupuesto más del 20% cada 3 días\n• Si el CPA sube más del 30%, reduce el presupuesto antes de pausar\n• El algoritmo necesita al menos 50 conversiones/semana para optimizar bien\n\nROAS OBJETIVO PARA TAPLY:\n• Taply Essential ($100.000): ROAS mínimo 3x (inviertes $33.000, vendes $100.000)\n• Taply Custom ($130.000): ROAS mínimo 2.5x (inviertes $52.000, vendes $130.000)`,
                },
                {
                  title: '📱 Formatos de anuncio más efectivos',
                  content: `#1 VIDEO VERTICAL 9:16 (el más efectivo para Taply)\n• Duración: 15-30 segundos\n• Contenido: Muestra el tap funcionando en los primeros 3 segundos\n• Placement: Instagram Stories + Reels + Facebook Stories\n\n#2 VIDEO CUADRADO 1:1\n• Duración: 15-30 segundos\n• Placement: Instagram Feed + Facebook Feed\n\n#3 IMAGEN ESTÁTICA 1:1\n• Diseño limpio con la tarjeta Taply en primer plano\n• Texto mínimo en la imagen (Meta penaliza +20% texto)\n• Útil para retargeting\n\n#4 CARRUSEL\n• 3-5 slides mostrando diferentes usos de Taply\n• Buen CTR para audiencias frías en Colombia\n\nORDEN DE PRIORIDAD:\nVideo 9:16 > Video 1:1 > Imagen 1:1 > Carrusel`,
                },
              ].map(({ title, content }) => (
                <div key={title} style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #1f1f1f' }}>
                  <button onClick={() => setExpandedTip(expandedTip === title ? null : title)}
                    style={{ width: '100%', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#161616', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#f0f0f0' }}>{title}</span>
                    {expandedTip === title ? <ChevronUp size={18} style={{ color: '#6b7280', flexShrink: 0 }} /> : <ChevronDown size={18} style={{ color: '#6b7280', flexShrink: 0 }} />}
                  </button>
                  {expandedTip === title && (
                    <div style={{ padding: '0 20px 20px', backgroundColor: '#161616', borderTop: '1px solid #1f1f1f' }}>
                      <pre style={{ margin: '16px 0 0', fontSize: '13px', color: '#9ca3af', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{content}</pre>
                      <button onClick={() => copyText(content, title)}
                        style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: platformBg, border: `1px solid ${platformBorder}`, color: platformColor }}>
                        <Copy size={12} />
                        {copiedSection === title ? 'Copiado ✓' : 'Copiar sección'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <>
              {[
                {
                  title: '🏗️ Estructura de campaña TikTok Ads para Taply NFC',
                  content: `NIVEL 1 — CAMPAÑA\n• Objetivo recomendado: Conversiones o Alcance\n• Tipo: Smart+ Campaign (TikTok optimiza todo automáticamente)\n• Presupuesto diario mínimo: $50.000 COP/campaña\n\nNIVEL 2 — AD GROUP\n• Ubicación: Colombia (ciudades principales)\n• Placement: TikTok + Pangle (red de apps)\n• Optimización: Clics o Conversiones\n• Presupuesto mínimo por Ad Group: $30.000 COP/día\n\nNIVEL 3 — ANUNCIO\n• Mínimo 3 videos por Ad Group\n• Duración ideal: 21-34 segundos\n• Usa Spark Ads para impulsar tus videos orgánicos\n\nTIPO DE CAMPAÑA RECOMENDADA:\n→ Spark Ads: Impulsa tus mejores videos orgánicos (más económico y creíble)\n→ In-Feed Ads: Videos nuevos creados solo para pauta\n→ TopView: Para lanzamientos (muy costoso — no recomendado al inicio)`,
                },
                {
                  title: '🎯 Audiencias en TikTok para Taply en Colombia',
                  content: `AUDIENCIAS DE INTERÉS (disponibles en TikTok):\n• Negocios y emprendimiento\n• Tecnología y gadgets\n• Marketing y publicidad digital\n• Moda y lifestyle profesional\n• Pequeñas empresas\n\nAUDIENCIAS PERSONALIZADAS:\n• Custom Audience: Sube tu lista de emails de clientes\n• Lookalike basado en tus seguidores de TikTok/Instagram\n• Retargeting: Usuarios que vieron tus videos al 75%+\n\nRECOMENDACIÓN PARA EMPEZAR:\n→ Empieza con Smart+ Campaign (TikTok define el público automáticamente)\n→ Es más efectivo que los intereses manuales en TikTok\n→ Después de 7 días, analiza el perfil demográfico y ajusta\n\nEDAD ÓPTIMA PARA TAPLY EN TIKTOK:\n18-35 años — Mayor penetración de TikTok en Colombia\nEmprendedores jóvenes, freelancers, profesionales emergentes`,
                },
                {
                  title: '💰 Presupuestos y escala en TikTok Ads',
                  content: `MÍNIMOS RECOMENDADOS:\n• Por Ad Group: $30.000 COP/día (mínimo absoluto)\n• Por Campaña: $50.000 COP/día\n• Para resultados reales: $100.000+ COP/día\n\nVENTAJA VS META:\n• CPM en TikTok Colombia: $5.000 - $12.000 COP (más barato que Meta)\n• Mayor alcance orgánico del contenido pautado\n• Algoritmo más agresivo — escala más rápido\n\nESTRATEGIA DE PRESUPUESTO:\n• Semana 1: $50.000/día — Prueba 3 videos distintos\n• Semana 2: Identifica el video con mejor VTR (View Through Rate)\n• Semana 3: Duplica presupuesto solo del video ganador\n• Semana 4+: Crea videos similares al ganador + escala\n\nREGLA TikTok:\n• Nunca pausar y reactivar — reinicia el aprendizaje\n• Aumenta máximo 50% el presupuesto cada 3 días\n• Si el CTR cae, el video se fatiagó — crea nuevo contenido\n\nCOMPARACIÓN:\nMeta → Mejor para retargeting y audiencias cálidas\nTikTok → Mejor para discovery y audiencias frías`,
                },
                {
                  title: '🎬 Creatividades que convierten en TikTok para Taply',
                  content: `FORMATO #1 — POV (el más viral)\n"POV: Llegas a un evento y alguien quiere tu contacto..."\nMuestra el tap en tiempo real. Sin edición excesiva.\n\nFORMATO #2 — Antes/Después\nSplit screen: tarjeta de papel vieja vs tap elegante con Taply\n\nFORMATO #3 — Tutorial rápido\n"Cómo funciona Taply en 10 segundos" — simple y directo\n\nFORMATO #4 — Reacción\nGraba la reacción genuina de alguien viendo NFC por primera vez\n\nFORMATO #5 — Trend Hijacking\nAdapta un trend viral de TikTok al mensaje de Taply\n\nELEMENTOS OBLIGATORIOS EN CADA VIDEO:\n✅ Hook en los primeros 2 segundos (texto en pantalla)\n✅ Audio trending de TikTok\n✅ Subtítulos automáticos (CapCut auto-caption)\n✅ CTA en los últimos 3 segundos\n✅ Sin introducción — empieza con la acción\n\nSPARK ADS — USA ESTO:\n→ Toma tu video orgánico con más likes y ponle pauta\n→ Mantiene los comentarios, likes y shares reales\n→ Se ve como contenido orgánico — mayor confianza\n→ Hasta 30% más económico que In-Feed Ads`,
                },
              ].map(({ title, content }) => (
                <div key={title} style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #1f1f1f' }}>
                  <button onClick={() => setExpandedTip(expandedTip === title ? null : title)}
                    style={{ width: '100%', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#161616', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#f0f0f0' }}>{title}</span>
                    {expandedTip === title ? <ChevronUp size={18} style={{ color: '#6b7280', flexShrink: 0 }} /> : <ChevronDown size={18} style={{ color: '#6b7280', flexShrink: 0 }} />}
                  </button>
                  {expandedTip === title && (
                    <div style={{ padding: '0 20px 20px', backgroundColor: '#161616', borderTop: '1px solid #1f1f1f' }}>
                      <pre style={{ margin: '16px 0 0', fontSize: '13px', color: '#9ca3af', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{content}</pre>
                      <button onClick={() => copyText(content, title)}
                        style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: platformBg, border: `1px solid ${platformBorder}`, color: platformColor }}>
                        <Copy size={12} />
                        {copiedSection === title ? 'Copiado ✓' : 'Copiar sección'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  )
}
