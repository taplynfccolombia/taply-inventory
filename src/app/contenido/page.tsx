'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useIsMobile } from '@/lib/hooks'
import { Sparkles, RefreshCw, Check, Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

interface ContentPost {
  id: string
  week_start: string
  day_index: number
  day_name: string
  format: 'Reel' | 'Story' | 'Carrusel' | 'TikTok'
  topic: string
  caption_idea: string
  hashtags: string
  status: 'pendiente' | 'publicado'
  script: string | null
  script_generated: boolean
}

const FORMAT_CONFIG = {
  Reel:     { color: '#ff4d4d', bg: '#ff4d4d0d', border: '#ff4d4d22', emoji: '🎬', duration: '15-30 seg' },
  Story:    { color: '#ffb547', bg: '#ffb5470d', border: '#ffb54722', emoji: '📱', duration: '5-15 seg' },
  Carrusel: { color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22', emoji: '🎠', duration: '5-8 slides' },
  TikTok:   { color: '#00ff94', bg: '#00ff940d', border: '#00ff9422', emoji: '🎵', duration: '15-60 seg' },
}

const CONTENT_BANK = [
  { format: 'Reel', topic: 'Comparación tarjeta papel vs Taply NFC', caption_idea: 'Muestra cómo alguien busca su tarjeta arrugada vs un tap con Taply.', hashtags: '#TaplyNFC #TarjetasNFC #NetworkingColombia' },
  { format: 'Story', topic: 'Tutorial: cómo funciona el tap en 3 segundos', caption_idea: 'Acercar el teléfono → vibra → abre el perfil.', hashtags: '#NFC #TaplyNFC #TechColombia' },
  { format: 'Carrusel', topic: '5 razones para dejar las tarjetas de papel', caption_idea: 'No más tarjetas perdidas. Info siempre actualizada. Imagen profesional.', hashtags: '#TarjetasDePresentacion #NFC #Networking' },
  { format: 'TikTok', topic: 'Reacción de cliente al usar Taply por primera vez', caption_idea: 'Graba la cara de sorpresa. Sin guión, 100% real.', hashtags: '#TaplyNFC #ClientesFelices #Emprendimiento' },
  { format: 'Reel', topic: 'Taply Essential vs Taply Custom', caption_idea: 'Essential para emprendedores, Custom para marcas posicionadas.', hashtags: '#TaplyNFC #EssentialVsCustom #NFC' },
  { format: 'Carrusel', topic: '¿Qué negocios usan Taply NFC?', caption_idea: 'Restaurantes, salones, abogados, médicos, agentes inmobiliarios.', hashtags: '#NFC #TarjetasNFC #NegociosColombia' },
  { format: 'TikTok', topic: 'El momento viral: tap en evento de networking', caption_idea: 'Graba cuando alguien toca tu Taply y su reacción genuina.', hashtags: '#Networking #TaplyNFC #EventosColombia' },
  { format: 'Reel', topic: 'Testimonial de cliente: cómo Taply cambió su networking', caption_idea: 'Un cliente real en 30 segundos contando su experiencia.', hashtags: '#Testimonial #TaplyNFC #ClientesSatisfechos' },
  { format: 'Story', topic: 'Tu info siempre actualizada — sin cambiar la tarjeta', caption_idea: 'Tu número cambió. Nosotros actualizamos tu perfil Taply sin costo.', hashtags: '#Servicio #TaplyNFC #TechFacil' },
  { format: 'TikTok', topic: 'POV: eres el único en el evento con tarjeta NFC', caption_idea: 'Formato POV trending. Muestra el impacto frente a los demás.', hashtags: '#POV #TaplyNFC #Networking #Viral' },
  { format: 'Story', topic: 'Precio vs valor: ¿cuánto gastas al año en tarjetas de papel?', caption_idea: '200 tarjetas × 3 veces al año = mucho dinero. Una sola Taply dura para siempre.', hashtags: '#PrecioVsValor #NFC #TaplyNFC' },
  { format: 'Carrusel', topic: 'Taply para diferentes profesiones', caption_idea: 'Médico, abogado, diseñador, chef, agente finca raíz.', hashtags: '#Profesionales #NFC #TaplyNFC #Colombia' },
  { format: 'TikTok', topic: 'El antes y después de tu presentación profesional', caption_idea: 'Split screen: tarjeta arrugada vs tap elegante con Taply.', hashtags: '#AntesYDespues #TaplyNFC #Profesionalismo' },
  { format: 'Reel', topic: 'Taply en acción: resultados reales en eventos', caption_idea: 'Cuántos taps, contactos guardados, quiénes siguieron en redes.', hashtags: '#Resultados #NFC #Networking #TaplyNFC' },
  { format: 'Story', topic: 'Mini encuesta: ¿tarjeta física o digital?', caption_idea: 'Genera engagement real y datos sobre tu audiencia.', hashtags: '#Encuesta #NFC #Networking' },
  { format: 'Carrusel', topic: 'Top 5 errores al hacer networking', caption_idea: 'Olvidar tarjetas, info desactualizada, quedar sin tarjetas.', hashtags: '#Networking #Errores #TaplyNFC' },
  { format: 'TikTok', topic: 'Reto: consigue 5 contactos en un evento con Taply', caption_idea: 'Documenta el reto en tiempo real. Cada tap cuenta.', hashtags: '#Reto #Networking #TaplyNFC #Challenge' },
  { format: 'Reel', topic: 'Taply para agentes inmobiliarios en Colombia', caption_idea: 'Comparte portafolio de propiedades y WhatsApp con un tap.', hashtags: '#Inmobiliaria #NFC #TaplyNFC #BienesRaices' },
  { format: 'Story', topic: '¿Tu Taply funciona sin internet?', caption_idea: 'El NFC no necesita internet en la tarjeta. Solo el teléfono cliente.', hashtags: '#MitoVsRealidad #NFC #TaplyNFC' },
  { format: 'Carrusel', topic: 'Taply para el sector gastronómico', caption_idea: 'Restaurantes comparten menú digital, reservas e Instagram con un tap.', hashtags: '#Gastronomia #NFC #TaplyNFC #Restaurantes' },
  { format: 'TikTok', topic: 'Una semana de networking con Taply: así me fue', caption_idea: 'Documenta una semana real de eventos y muestra los contactos logrados.', hashtags: '#Networking #TaplyNFC #Contactos #Emprendimiento' },
  { format: 'Reel', topic: 'Taply para el sector salud', caption_idea: 'Un médico comparte WhatsApp, consultorio y horarios con un tap.', hashtags: '#SaludNFC #TaplyNFC #MedicosColombia' },
  { format: 'Story', topic: 'Cliente destacado del mes', caption_idea: 'Presenta a un cliente real, etiquétalo y comparte cómo usa Taply.', hashtags: '#ClienteDelMes #TaplyNFC #Comunidad' },
  { format: 'Carrusel', topic: '5 usos de Taply que probablemente no conocías', caption_idea: 'Menú digital, portafolio, reservas, contacto médico, perfil vendedores.', hashtags: '#Tips #TaplyNFC #NFC #Usos' },
  { format: 'TikTok', topic: 'Duelo en velocidad: tarjeta de papel vs Taply', caption_idea: 'Cronometra compartir contacto: papel vs tap. Resultado obvio.', hashtags: '#Duelo #TaplyNFC #Velocidad #Networking' },
  { format: 'Reel', topic: 'Networking inteligente en 2026: así se hace', caption_idea: 'NFC, digital, instantáneo. El networking del futuro.', hashtags: '#Networking2026 #TaplyNFC #Futuro #Negocios' },
  { format: 'Story', topic: '¿Cuántos contactos pierdes por no tener tus datos a mano?', caption_idea: 'Pregunta reflexiva. Taply como solución definitiva.', hashtags: '#Contactos #Networking #TaplyNFC' },
  { format: 'Carrusel', topic: 'Taply: la tarjeta que nunca se acaba ni se pierde', caption_idea: 'Tarjeta de papel (semanas) vs Taply con soporte incluido (años).', hashtags: '#Sostenibilidad #TaplyNFC #InversionInteligente' },
  { format: 'TikTok', topic: 'El tap más importante de tu carrera profesional', caption_idea: 'El momento en que alguien toca tu Taply y abre tu perfil completo.', hashtags: '#Oportunidades #TaplyNFC #Profesional #Colombia' },
  { format: 'Reel', topic: '¿Qué pasa cuando pierdes tus tarjetas de papel?', caption_idea: 'El pánico de quedarte sin tarjetas vs la tranquilidad de tener Taply.', hashtags: '#TaplyNFC #Networking #Profesional' },
]

function generateScript(topic: string, format: string, captionIdea: string): string {
  const scripts: Record<string, (t: string, c: string) => string> = {
    Reel: (t, c) => `🎬 GUIÓN REEL — ${t}\n━━━━━━━━━━━━━━━━━━━━━━━━\n📱 FACELESS · Sin mostrar cara\n⏱ 15-30 seg · 9:16 vertical\n🛎 SERVICIO: El cliente nos avisa, nosotros actualizamos su perfil\n\n🔥 HOOK (0-3 seg):\n▸ Texto: "¿Todavía regalas tarjetas de papel que nadie guarda?"\n▸ Mano lanzando tarjetas al aire\n\n🎬 DESARROLLO (3-22 seg):\n${c}\n▸ Plano 1: Billetera desordenada con tarjetas\n▸ Plano 2: "VS" animado en pantalla\n▸ Plano 3: Mano con Taply NFC — negro matte\n▸ Plano 4: Celular acercándose → perfil abriendo\n▸ Texto: "Un tap. Tu info completa. Para siempre."\n\n🎯 CIERRE (22-30 seg):\n▸ "¿Listo para impresionar desde el primer contacto?"\n▸ "Escríbenos · Link en bio 👆"\n\n💡 TIPS FACELESS:\n• Superficie negra o gris oscura\n• Ring light difusa o luz natural lateral\n• Graba 3x, edita en CapCut`,
    Story: (t, c) => `📱 GUIÓN STORY — ${t}\n━━━━━━━━━━━━━━━━━━━━━━━━\n📱 FACELESS · Texto y gráficos\n⏱ 5-15 seg · 9:16 vertical\n🛎 SERVICIO: Actualizamos el perfil cuando nos avisan\n\n🔥 HOOK VISUAL:\n▸ Fondo negro · Texto grande: máx 6 palabras\n▸ Emoji de impacto (⚡🔥💡)\n\n📊 DESARROLLO:\n${c}\n▸ Bloques cortos — máx 5 palabras/línea\n▸ Colores: negro + cian (#00CFFF)\n▸ Menciona: "Nosotros actualizamos tu perfil"\n\n🎯 CTA FINAL:\n▸ "Tu info siempre al día · Nosotros nos encargamos"\n▸ Encuesta: "¿Aún usas tarjetas de papel? Sí / No"\n\n💡 TIPS:\n• Diseña en Canva (1080x1920px)\n• Publica entre 6-9pm Colombia\n• Sube 3-5 Stories seguidas`,
    Carrusel: (t, c) => `🎠 GUIÓN CARRUSEL — ${t}\n━━━━━━━━━━━━━━━━━━━━━━━━\n📱 FACELESS · Diseño gráfico\n📐 1080x1080px · 5-8 slides\n🛎 SERVICIO: Cliente avisa, nosotros actualizamos\n\n🔥 SLIDE 1 — HOOK:\n▸ Fondo negro matte\n▸ Título provocador sobre: ${t}\n▸ Subtítulo: "Desliza → te va a sorprender"\n\n📄 SLIDES 2-6:\n${c}\n▸ UN punto clave por slide — máx 20 palabras\n▸ Icono simple que refuerce cada punto\n▸ En 1 slide: "Actualización de perfil incluida"\n\n🎯 SLIDE FINAL:\n▸ "¿Quieres una para tu negocio?"\n▸ "Escríbenos por DM · Link en bio"\n\n💡 TIPS:\n• Slide 1 lo es todo — invierte el 50% del tiempo\n• Carruseles tienen 3x más alcance`,
    TikTok: (t, c) => `🎵 GUIÓN TIKTOK — ${t}\n━━━━━━━━━━━━━━━━━━━━━━━━\n📱 FACELESS · Manos y pantallas\n⏱ 21-34 seg · 9:16 vertical\n🛎 SERVICIO: Cliente WhatsApp → actualizamos en minutos\n\n🔥 HOOK (0-3 seg) — CRÍTICO:\nEmpieza con la acción directa. SIN intro.\n▸ Texto inmediato: "${t.substring(0, 40)}..."\n▸ Audio trending desde el primer frame\n\n🎬 DESARROLLO (3-25 seg):\n${c}\n▸ Corte cada 2-3 segundos máximo\n▸ Texto superpuesto (máx 5 palabras)\n▸ Muestra el tap: celular → pantalla abriendo perfil\n▸ Incluye: "Actualización incluida — solo avísanos"\n\n🎯 CIERRE (25-34 seg):\n▸ "¿Lo quieres para tu negocio?"\n▸ "Comenta SÍ y te contactamos"\n\n💡 TIPS TIKTOK:\n• SIEMPRE audio trending (3x más alcance)\n• Edita en CapCut con auto-caption\n• Publica mar-jue 7-9pm Colombia`,
  }
  const gen = scripts[format]
  return gen ? gen(topic, captionIdea) : `Guión para: ${topic}\n\n${captionIdea}`
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]] }
  return arr
}

function selectBalancedWeek(bank: typeof CONTENT_BANK) {
  const formats = ['Reel', 'Story', 'Carrusel', 'TikTok'] as const
  const result: typeof CONTENT_BANK = []
  const used = new Set<number>()
  for (const format of formats) {
    const options = bank.map((item, idx) => ({ item, idx })).filter(({ item, idx }) => item.format === format && !used.has(idx))
    const shuffled = shuffleArray(options)
    if (shuffled.length > 0) { result.push(shuffled[0].item); used.add(shuffled[0].idx) }
  }
  const remaining = shuffleArray(bank.map((item, idx) => ({ item, idx })).filter(({ idx }) => !used.has(idx)))
  for (let i = 0; i < 3 && i < remaining.length; i++) { result.push(remaining[i].item); used.add(remaining[i].idx) }
  return shuffleArray(result)
}

function getWeekStart(date: Date): Date {
  const d = new Date(date); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff); d.setHours(0, 0, 0, 0); return d
}

function formatWeekDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00'); const end = new Date(d); end.setDate(end.getDate() + 6)
  return `${d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function ContenidoPage() {
  const isMobile = useIsMobile()
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [generatingScript, setGeneratingScript] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()).toISOString().split('T')[0])

  async function fetchPosts(week: string) {
    setLoading(true)
    const { data } = await supabase.from('content_board').select('*').eq('week_start', week).order('day_index')
    setPosts(data ?? []); setLoading(false)
  }

  useEffect(() => { fetchPosts(weekStart) }, [weekStart])

  async function generateWeek() {
    setGenerating(true); setExpandedId(null)
    const selected = selectBalancedWeek(CONTENT_BANK)
    await supabase.from('content_board').delete().eq('week_start', weekStart)
    await supabase.from('content_board').insert(DAYS.map((day, i) => ({
      week_start: weekStart, day_index: i, day_name: day,
      format: selected[i].format, topic: selected[i].topic,
      caption_idea: selected[i].caption_idea, hashtags: selected[i].hashtags,
      status: 'pendiente', script: null, script_generated: false,
    })))
    await fetchPosts(weekStart); setGenerating(false)
  }

  async function handleExpand(post: ContentPost) {
    if (expandedId === post.id) { setExpandedId(null); return }
    setExpandedId(post.id)
    if (post.script_generated && post.script) return
    setGeneratingScript(post.id)
    await new Promise(r => setTimeout(r, 600))
    const script = generateScript(post.topic, post.format, post.caption_idea)
    await supabase.from('content_board').update({ script, script_generated: true }).eq('id', post.id)
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, script, script_generated: true } : p))
    setGeneratingScript(null)
  }

  async function toggleStatus(post: ContentPost) {
    const newStatus = post.status === 'pendiente' ? 'publicado' : 'pendiente'
    await supabase.from('content_board').update({ status: newStatus }).eq('id', post.id)
    fetchPosts(weekStart)
  }

  function prevWeek() { const d = new Date(weekStart + 'T00:00:00'); d.setDate(d.getDate() - 7); setWeekStart(d.toISOString().split('T')[0]); setExpandedId(null) }
  function nextWeek() { const d = new Date(weekStart + 'T00:00:00'); d.setDate(d.getDate() + 7); setWeekStart(d.toISOString().split('T')[0]); setExpandedId(null) }

  const publishedCount = posts.filter(p => p.status === 'publicado').length
  const isCurrentWeek = weekStart === getWeekStart(new Date()).toISOString().split('T')[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? '24px' : '32px', fontWeight: 900 }} className="taply-gradient-text">Contenido</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>Tablero de ideas + guiones faceless</p>
        </div>
        <button onClick={generateWeek} disabled={generating}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: generating ? 'not-allowed' : 'pointer', border: 'none',
            background: generating ? '#2a2a2a' : 'linear-gradient(90deg, #00cfff, #00ff94)', color: generating ? '#6b7280' : '#0d0d0d' }}>
          <RefreshCw size={15} />
          {generating ? 'Generando...' : posts.length > 0 ? '🎲 Nuevas Ideas' : '✨ Generar Ideas'}
        </button>
      </div>

      {/* Navegación semana */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px', borderRadius: '14px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
        <button onClick={prevWeek}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #2a2a2a', color: '#6b7280' }}>
          <ChevronLeft size={14} /> {isMobile ? '' : 'Anterior'}
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <Calendar size={14} style={{ color: '#00cfff' }} />
            <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 700, color: '#f0f0f0' }}>{formatWeekDate(weekStart)}</span>
            {isCurrentWeek && <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, backgroundColor: '#00cfff0d', color: '#00cfff', border: '1px solid #00cfff22' }}>Esta semana</span>}
          </div>
          {posts.length > 0 && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#6b7280' }}>{publishedCount}/{posts.length} publicados</p>}
        </div>
        <button onClick={nextWeek}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #2a2a2a', color: '#6b7280' }}>
          {isMobile ? '' : 'Siguiente'} <ChevronRight size={14} />
        </button>
      </div>

      {/* Estado vacío */}
      {!loading && posts.length === 0 && (
        <div style={{ borderRadius: '16px', padding: '48px 24px', textAlign: 'center', backgroundColor: '#161616', border: '1px dashed #2a2a2a' }}>
          <Sparkles size={36} style={{ margin: '0 auto 16px', display: 'block', color: '#374151' }} />
          <p style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>No hay contenido para esta semana</p>
          <button onClick={generateWeek} disabled={generating}
            style={{ padding: '12px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none', background: 'linear-gradient(90deg, #00cfff, #00ff94)', color: '#0d0d0d' }}>
            ✨ Generar Ideas
          </button>
        </div>
      )}

      {/* Tablero — scroll horizontal en móvil, grid en desktop */}
      {!loading && posts.length > 0 && (
        isMobile ? (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginLeft: '-16px', marginRight: '-16px', paddingLeft: '16px', paddingRight: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', paddingBottom: '8px', width: 'max-content' }}>
              {posts.map(post => {
                const fc = FORMAT_CONFIG[post.format]
                const isExpanded = expandedId === post.id
                const isGenerating = generatingScript === post.id
                return (
                  <div key={post.id} style={{ width: '260px', flexShrink: 0, borderRadius: '14px', backgroundColor: post.status === 'publicado' && !isExpanded ? '#0d0d0d' : '#161616', border: `1px solid ${isExpanded ? fc.color + '55' : fc.border}`, opacity: post.status === 'publicado' && !isExpanded ? 0.65 : 1 }}>
                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af' }}>{post.day_name}</span>
                        <button onClick={() => toggleStatus(post)}
                          style={{ width: '20px', height: '20px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: post.status === 'publicado' ? '#00ff940d' : 'transparent', border: post.status === 'publicado' ? '1px solid #00ff9433' : '1px solid #2a2a2a' }}>
                          {post.status === 'publicado' && <Check size={11} style={{ color: '#00ff94' }} />}
                        </button>
                      </div>
                      <span style={{ alignSelf: 'flex-start', padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, backgroundColor: fc.bg, color: fc.color, border: `1px solid ${fc.border}` }}>
                        {fc.emoji} {post.format}
                      </span>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#f0f0f0', lineHeight: '1.4' }}>{post.topic}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', lineHeight: '1.5' }}>{post.caption_idea}</p>
                      <button onClick={() => handleExpand(post)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '7px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', backgroundColor: isExpanded ? fc.bg : '#0d0d0d', border: `1px solid ${isExpanded ? fc.border : '#2a2a2a'}`, color: isExpanded ? fc.color : '#6b7280' }}>
                        {isGenerating ? <><Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> Generando...</> : isExpanded ? <><ChevronUp size={11} /> Cerrar</> : <><ChevronDown size={11} /> Ver guión</>}
                      </button>
                      {isExpanded && !isGenerating && post.script && (
                        <div style={{ borderTop: `1px solid ${fc.border}`, paddingTop: '10px' }}>
                          <pre style={{ margin: 0, fontSize: '10px', color: '#d1d5db', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{post.script}</pre>
                          <button onClick={() => navigator.clipboard.writeText(post.script ?? '')}
                            style={{ marginTop: '8px', width: '100%', padding: '7px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', backgroundColor: fc.bg, border: `1px solid ${fc.border}`, color: fc.color }}>
                            📋 Copiar guión
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <p style={{ fontSize: '11px', color: '#374151', textAlign: 'center', marginTop: '4px' }}>← Desliza para ver todos los días →</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
            {posts.map(post => {
              const fc = FORMAT_CONFIG[post.format]
              const isExpanded = expandedId === post.id
              const isGenerating = generatingScript === post.id
              return (
                <div key={post.id} style={{ borderRadius: '14px', backgroundColor: post.status === 'publicado' && !isExpanded ? '#0d0d0d' : '#161616', border: `1px solid ${isExpanded ? fc.color + '55' : fc.border}`, opacity: post.status === 'publicado' && !isExpanded ? 0.65 : 1, display: 'flex', flexDirection: 'column', gridColumn: isExpanded ? 'span 2' : 'span 1' }}>
                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af' }}>{post.day_name}</span>
                      <button onClick={() => toggleStatus(post)}
                        style={{ width: '20px', height: '20px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: post.status === 'publicado' ? '#00ff940d' : 'transparent', border: post.status === 'publicado' ? '1px solid #00ff9433' : '1px solid #2a2a2a' }}>
                        {post.status === 'publicado' && <Check size={11} style={{ color: '#00ff94' }} />}
                      </button>
                    </div>
                    <span style={{ alignSelf: 'flex-start', padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, backgroundColor: fc.bg, color: fc.color, border: `1px solid ${fc.border}` }}>
                      {fc.emoji} {post.format} · {fc.duration}
                    </span>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#f0f0f0', lineHeight: '1.4' }}>{post.topic}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', lineHeight: '1.5' }}>{post.caption_idea}</p>
                    <p style={{ margin: 0, fontSize: '10px', color: '#00cfff', lineHeight: '1.4', opacity: 0.7 }}>{post.hashtags}</p>
                    <button onClick={() => handleExpand(post)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '7px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', backgroundColor: isExpanded ? fc.bg : '#0d0d0d', border: `1px solid ${isExpanded ? fc.border : '#2a2a2a'}`, color: isExpanded ? fc.color : '#6b7280' }}>
                      {isGenerating ? <><Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> Generando...</> : isExpanded ? <><ChevronUp size={11} /> Cerrar guión</> : <><ChevronDown size={11} /> {post.script_generated ? 'Ver guión' : '✨ Ver guión'}</>}
                    </button>
                  </div>
                  {isExpanded && !isGenerating && post.script && (
                    <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${fc.border}` }}>
                      <pre style={{ margin: '12px 0 0', fontSize: '11px', color: '#d1d5db', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{post.script}</pre>
                      <button onClick={() => navigator.clipboard.writeText(post.script ?? '')}
                        style={{ marginTop: '8px', width: '100%', padding: '7px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', backgroundColor: fc.bg, border: `1px solid ${fc.border}`, color: fc.color }}>
                        📋 Copiar guión
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
