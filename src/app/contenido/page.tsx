'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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
  Reel:     { color: '#ff4d4d', bg: '#ff4d4d0d', border: '#ff4d4d22', emoji: '🎬', duration: '15-30 segundos' },
  Story:    { color: '#ffb547', bg: '#ffb5470d', border: '#ffb54722', emoji: '📱', duration: '5-15 segundos' },
  Carrusel: { color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22', emoji: '🎠', duration: '5-8 slides' },
  TikTok:   { color: '#00ff94', bg: '#00ff940d', border: '#00ff9422', emoji: '🎵', duration: '15-60 segundos' },
}

const CONTENT_BANK = [
  { format: 'Reel', topic: 'Comparación tarjeta papel vs Taply NFC', caption_idea: 'Muestra cómo alguien busca su tarjeta de papel arrugada vs un simple tap con Taply. El contraste lo dice todo.', hashtags: '#TaplyNFC #TarjetasNFC #NetworkingColombia #EmprendedoresColombia' },
  { format: 'Story', topic: 'Tutorial: cómo funciona el tap en 3 segundos', caption_idea: 'Muestra el proceso desde el lado del cliente: acercar el teléfono → vibra → abre el perfil. Simple y poderoso.', hashtags: '#NFC #TaplyNFC #TechColombia' },
  { format: 'Carrusel', topic: '5 razones para dejar las tarjetas de papel', caption_idea: 'No más tarjetas perdidas. Info siempre actualizada. Imagen más profesional. Eco-friendly. Una sola inversión.', hashtags: '#TarjetasDePresentacion #NFC #Networking' },
  { format: 'TikTok', topic: 'Reacción de cliente al usar Taply por primera vez', caption_idea: 'Graba la cara de sorpresa de un cliente cuando descubre cómo funciona. Sin guión, 100% real y auténtico.', hashtags: '#TaplyNFC #ClientesFelices #Emprendimiento' },
  { format: 'Reel', topic: 'Taply Essential vs Taply Custom: ¿cuál es para ti?', caption_idea: 'Compara ambas opciones. Essential para emprendedores, Custom para marcas ya posicionadas.', hashtags: '#TaplyNFC #EssentialVsCustom #NFC' },
  { format: 'Carrusel', topic: '¿Qué negocios ya están usando Taply NFC?', caption_idea: 'Restaurantes, salones, abogados, médicos, agentes inmobiliarios. Casos de uso con resultados reales.', hashtags: '#NFC #TarjetasNFC #NegociosColombia' },
  { format: 'TikTok', topic: 'El momento viral: tap en evento de networking', caption_idea: 'Graba cuando alguien en un evento toca tu Taply y su reacción genuina.', hashtags: '#Networking #TaplyNFC #EventosColombia' },
  { format: 'Reel', topic: 'Testimonial de cliente: cómo Taply cambió su networking', caption_idea: 'Un cliente real en 30 segundos contando cómo Taply transformó su forma de conectar.', hashtags: '#Testimonial #TaplyNFC #ClientesSatisfechos' },
  { format: 'Story', topic: 'Dato: cuántas tarjetas de papel se botan al año', caption_idea: 'Dato impactante sobre desperdicio + solución inmediata. Crea conciencia y posiciona a Taply.', hashtags: '#MedioAmbiente #NFC #Sostenibilidad' },
  { format: 'Carrusel', topic: 'Tu info siempre actualizada — sin cambiar la tarjeta', caption_idea: 'Tu número cambió, abriste nueva sede. Nosotros actualizamos tu perfil Taply sin costo adicional.', hashtags: '#Servicio #TaplyNFC #TechFacil' },
  { format: 'TikTok', topic: 'POV: eres el único en el evento con tarjeta NFC', caption_idea: 'Formato POV trending. Muestra el impacto frente a los demás asistentes con tarjetas de papel.', hashtags: '#POV #TaplyNFC #Networking #Viral' },
  { format: 'Story', topic: 'Precio vs valor: ¿cuánto gastas al año en tarjetas de papel?', caption_idea: '200 tarjetas × 3 veces al año = mucho dinero. Una sola Taply con soporte incluido dura para siempre.', hashtags: '#PrecioVsValor #NFC #TaplyNFC' },
  { format: 'Carrusel', topic: 'Taply para diferentes profesiones', caption_idea: 'Médico, abogado, diseñador, chef, agente finca raíz. Cada profesión usa Taply diferente.', hashtags: '#Profesionales #NFC #TaplyNFC #Colombia' },
  { format: 'TikTok', topic: 'El antes y después de tu presentación profesional', caption_idea: 'Split screen: antes (buscando tarjeta arrugada) vs después (tap elegante con Taply).', hashtags: '#AntesYDespues #TaplyNFC #Profesionalismo' },
  { format: 'Story', topic: 'Mini encuesta: ¿tarjeta física o digital?', caption_idea: 'Encuesta en Instagram Stories. Genera engagement real y datos sobre tu audiencia.', hashtags: '#Encuesta #NFC #Networking' },
  { format: 'Carrusel', topic: 'Top 5 errores al hacer networking (y cómo evitarlos)', caption_idea: 'Olvidar tarjetas, info desactualizada, tarjetas dañadas, quedarse sin tarjetas, imagen poco profesional.', hashtags: '#Networking #Errores #TaplyNFC' },
  { format: 'TikTok', topic: 'Reto: consigue 5 contactos nuevos en un evento con Taply', caption_idea: 'Documenta el reto en tiempo real. Cada tap cuenta. Muestra el resultado final.', hashtags: '#Reto #Networking #TaplyNFC #Challenge' },
  { format: 'Story', topic: 'FAQ: ¿Taply funciona en todos los celulares?', caption_idea: 'iPhone desde el 7, Android con NFC activado. Elimina la principal objeción de compra.', hashtags: '#FAQ #NFC #TaplyNFC #Compatibilidad' },
  { format: 'Carrusel', topic: 'La historia detrás de Taply: por qué nació esta idea', caption_idea: 'El problema que Taply resuelve contado desde la perspectiva del cliente. Conecta emocionalmente.', hashtags: '#Historia #Emprendimiento #TaplyNFC #Colombia' },
  { format: 'TikTok', topic: 'Un día en la vida de alguien que usa Taply NFC', caption_idea: 'Muestra cómo un profesional usa Taply en su día a día: reuniones, eventos, cafés de trabajo.', hashtags: '#DayInMyLife #Profesional #TaplyNFC' },
  { format: 'Reel', topic: 'Taply en acción: resultados reales en eventos', caption_idea: 'Métricas reales de un evento: cuántos taps, contactos guardados, quiénes siguieron en redes.', hashtags: '#Resultados #NFC #Networking #TaplyNFC' },
  { format: 'Story', topic: 'Oferta especial esta semana', caption_idea: 'Crea urgencia con tiempo limitado. Los Stories con cuenta regresiva generan conversiones directas.', hashtags: '#Oferta #TaplyNFC #Descuento #Colombia' },
  { format: 'Carrusel', topic: 'Taply vs otras opciones: ¿cuál elegir?', caption_idea: 'Precio, personalización, soporte local, diseño colombiano. Los hechos hablan solos.', hashtags: '#Comparativa #NFC #TaplyNFC #MejorOpcion' },
  { format: 'TikTok', topic: 'Reacción de alguien que nunca había visto NFC', caption_idea: 'La sorpresa genuina de ver funcionar NFC por primera vez es el mejor argumento de venta.', hashtags: '#Reaccion #NFC #TaplyNFC #Viral' },
  { format: 'Reel', topic: '¿Qué pasa cuando pierdes tus tarjetas de papel?', caption_idea: 'Recrea el pánico de quedarte sin tarjetas en un evento vs la tranquilidad de tener Taply.', hashtags: '#TaplyNFC #Networking #Profesional' },
  { format: 'Story', topic: 'Cliente destacado del mes', caption_idea: 'Presenta a un cliente real, etiquétalo y cuéntale al mundo cómo usa Taply.', hashtags: '#ClienteDelMes #TaplyNFC #Comunidad' },
  { format: 'Carrusel', topic: '5 usos de Taply que probablemente no conocías', caption_idea: 'Menú digital, portafolio, reservas, contacto médico, perfil para vendedores.', hashtags: '#Tips #TaplyNFC #NFC #Usos' },
  { format: 'TikTok', topic: 'Duelo en velocidad: tarjeta de papel vs Taply', caption_idea: 'Cronometra compartir contacto con tarjeta de papel vs un tap con Taply. Resultado obvio.', hashtags: '#Duelo #TaplyNFC #Velocidad #Networking' },
  { format: 'Reel', topic: 'Taply en el sector salud', caption_idea: 'Un médico comparte su WhatsApp, consultorio y horarios con un solo tap.', hashtags: '#SaludNFC #TaplyNFC #MedicosColombia' },
  { format: 'Story', topic: '¿Tu Taply funciona sin internet?', caption_idea: 'Mito vs realidad: el NFC no necesita internet en la tarjeta.', hashtags: '#MitoVsRealidad #NFC #TaplyNFC' },
  { format: 'Carrusel', topic: 'Taply para el sector gastronómico colombiano', caption_idea: 'Restaurantes y chefs comparten menú digital, reservas e Instagram con un solo tap.', hashtags: '#Gastronomia #NFC #TaplyNFC #Restaurantes' },
  { format: 'TikTok', topic: 'Una semana de networking con Taply: así me fue', caption_idea: 'Documenta una semana real de eventos y muestra cuántos contactos nuevos lograste.', hashtags: '#Networking #TaplyNFC #Contactos #Emprendimiento' },
  { format: 'Reel', topic: 'Taply para agentes inmobiliarios en Colombia', caption_idea: 'Un agente comparte portafolio de propiedades y WhatsApp Business con un tap.', hashtags: '#Inmobiliaria #NFC #TaplyNFC #BienesRaices' },
  { format: 'Story', topic: 'La primera impresión lo es todo en los negocios', caption_idea: 'Reflexión sobre cómo una tarjeta NFC eleva tu imagen profesional desde el primer contacto.', hashtags: '#PrimeraImpresion #TaplyNFC #Profesionalismo' },
  { format: 'Carrusel', topic: 'Taply para emprendedores que están creciendo', caption_idea: 'Cuando tu negocio crece, tu presentación también debe crecer. Taply escala contigo.', hashtags: '#Emprendimiento #Crecimiento #TaplyNFC #Colombia' },
  { format: 'TikTok', topic: 'Lo que dicen los clientes cuando ven Taply por primera vez', caption_idea: 'Recopila reacciones reales. Cada sorpresa es una oportunidad de venta en cámara.', hashtags: '#Testimonios #TaplyNFC #Reacciones #Viral' },
  { format: 'Reel', topic: 'Networking inteligente en 2026: así se hace', caption_idea: 'Contrasta el networking anticuado con el moderno: NFC, digital, instantáneo.', hashtags: '#Networking2026 #TaplyNFC #Futuro #Negocios' },
  { format: 'Story', topic: '¿Cuántos contactos pierdes por no tener tus datos a mano?', caption_idea: 'Pregunta reflexiva. Luego presenta Taply como la solución definitiva.', hashtags: '#Contactos #Networking #TaplyNFC' },
  { format: 'Carrusel', topic: 'Taply: la tarjeta que nunca se acaba ni se pierde', caption_idea: 'Ciclo de vida: tarjeta de papel (semanas) vs Taply con soporte incluido (años).', hashtags: '#Sostenibilidad #TaplyNFC #InversionInteligente' },
  { format: 'TikTok', topic: 'El tap más importante de tu carrera profesional', caption_idea: 'El momento en que un cliente potencial toca tu Taply y abre tu perfil completo.', hashtags: '#Oportunidades #TaplyNFC #Profesional #Colombia' },
]

function generateScript(topic: string, format: string, captionIdea: string): string {
  const scripts: Record<string, (t: string, c: string) => string> = {
    Reel: (t, c) => `🎬 GUIÓN REEL — ${t}
━━━━━━━━━━━━━━━━━━━━━━━━
📱 FACELESS · Sin mostrar cara · Usa manos, objetos y pantallas
⏱ Duración: 15-30 seg · Formato: 9:16 vertical
🛎 SERVICIO TAPLY: El cliente nos contacta, nosotros actualizamos su perfil

🔥 HOOK (0-3 seg) — DECISIVO:
▸ Texto en pantalla grande y llamativo:
  "¿Todavía regalas tarjetas de papel que nadie guarda?"
▸ Acción: Mano lanzando tarjetas de papel al aire (caótico)
▸ Audio: Sonido de papel + música trending instrumental (volumen bajo)

🎬 DESARROLLO (3-22 seg):
${c}
▸ Plano 1: Billetera desordenada llena de tarjetas (caos)
▸ Plano 2: Texto animado "VS" en pantalla
▸ Plano 3: Mano sosteniendo Taply NFC — negro matte, elegante, limpio
▸ Plano 4: Celular acercándose a la tarjeta → pantalla del celular abriendo el perfil completo
▸ Texto superpuesto: "Un tap. Tu info completa. Para siempre."
▸ Plano 5: Pantalla del celular con el perfil abierto — mostrar nombre, WhatsApp, redes

🎯 CIERRE Y CTA (22-30 seg):
▸ Texto: "¿Listo para impresionar desde el primer contacto?"
▸ Subtexto: "Escríbenos · Link en bio 👆"
▸ Mantén la tarjeta Taply en primer plano hasta el último frame

🎵 MÚSICA:
Busca en TikTok/Reels audios trending con beats tech-minimal o lo-fi.
Sin letra que distraiga. Volumen al 15-20%.

💡 TIPS FACELESS:
- Superficie negra o gris oscura (combina con la tarjeta)
- Iluminación: ring light difusa o luz natural lateral
- Usa soporte para celular — cero movimiento no intencional
- Graba 3x material, edita en CapCut
- Alterna velocidad normal con 1.5x para dinamismo`,

    Story: (t, c) => `📱 GUIÓN STORY — ${t}
━━━━━━━━━━━━━━━━━━━━━━━━
📱 FACELESS · Texto, gráficos y pantalla · Sin mostrar cara
⏱ Duración: 5-15 seg · Formato: 9:16 vertical
🛎 SERVICIO TAPLY: Actualizamos el perfil del cliente cuando nos avisa

🔥 HOOK VISUAL (Frame 1 — primero que ven):
▸ Fondo negro sólido o degradado oscuro
▸ Texto grande centrado, máximo 6 palabras:
  Ejemplo: "Tu tarjeta de papel ya venció 💀"
▸ Emoji grande de impacto (⚡🔥💡)

📊 DESARROLLO (Frames 2-4):
${c}
▸ Texto en bloques cortos — máximo 5 palabras por línea
▸ Colores: negro + cian (#00CFFF) · Paleta Taply
▸ Stickers animados de Instagram: flechas, estrellas, fuego
▸ Menciona el diferencial: "Nosotros actualizamos tu perfil cuando lo necesitas"
▸ Agrega música trending desde la librería de Instagram

🎯 CTA FINAL:
▸ Sticker de enlace o "Escríbenos"
▸ Texto: "Tu info siempre al día · Nosotros nos encargamos"
▸ Agrega encuesta para interacción: "¿Aún usas tarjetas de papel? Sí / No"

💡 TIPS STORY FACELESS:
- Diseña en Canva (1080x1920px) con paleta Taply
- Publica entre 6-9pm (hora Colombia — mayor actividad)
- Sube 3-5 Stories seguidas para mayor visibilidad del algoritmo
- El primer frame es todo — hazlo impactante o lo saltarán`,

    Carrusel: (t, c) => `🎠 GUIÓN CARRUSEL — ${t}
━━━━━━━━━━━━━━━━━━━━━━━━
📱 FACELESS · Diseño gráfico y texto · Sin mostrar cara
📐 Formato: 1080x1080px cuadrado · 5-8 slides
🛎 SERVICIO TAPLY: El cliente nos avisa los cambios, nosotros actualizamos

🔥 SLIDE 1 — HOOK (El más importante — define si hacen swipe):
▸ Fondo negro matte
▸ Título provocador sobre: ${t}
▸ Fuente grande, bold, color cian o blanco
▸ Subtítulo: "Desliza → te va a sorprender"
▸ Pequeño logo Taply en esquina inferior

📄 SLIDES 2-6 — DESARROLLO:
${c}
▸ UN punto clave por slide — máximo 20 palabras de texto principal
▸ Icono o ilustración simple que refuerce cada punto
▸ En al menos 1 slide menciona: "Actualización de perfil incluida en el servicio"
▸ Misma fuente y paleta en todos los slides (consistencia visual)
▸ Incluye la tarjeta Taply como elemento visual en mínimo 2 slides

🎯 SLIDE FINAL — CTA:
▸ "¿Quieres una para tu negocio?"
▸ "Escríbenos por DM o al WhatsApp · Link en bio"
▸ Handle de Instagram de Taply

💡 TIPS CARRUSEL FACELESS:
- El slide 1 define todo — invierte el 50% del tiempo en él
- Los carruseles tienen 3x más alcance que fotos simples en Instagram
- Guarda como PNG de alta calidad desde Canva
- Agregar música de fondo en la publicación aumenta el alcance`,

    TikTok: (t, c) => `🎵 GUIÓN TIKTOK — ${t}
━━━━━━━━━━━━━━━━━━━━━━━━
📱 FACELESS · Manos, objetos, pantallas y texto
⏱ Duración ideal: 21-34 seg · Formato: 9:16 vertical
🛎 SERVICIO TAPLY: El cliente nos contacta por WhatsApp, actualizamos su perfil en minutos

🔥 HOOK (0-3 seg) — CRÍTICO EN TIKTOK:
Los primeros 2 segundos definen si siguen viendo. SIN intro, SIN logo.
▸ Empieza con la acción directa — muestra el resultado PRIMERO
▸ Texto en pantalla inmediato: "${t.substring(0, 40)}..."
▸ Audio: trending sound — entra fuerte desde el primer frame

🎬 DESARROLLO (3-25 seg):
${c}
▸ Corte cada 2-3 segundos máximo — ritmo alto, sin pausas muertas
▸ Texto superpuesto en cada escena (máximo 5 palabras por texto)
▸ Plano detalle del tap: celular acercándose → pantalla abriendo el perfil
▸ Zoom in/out para dinamismo
▸ Incluye momento "wow": pantalla del celular mostrando toda la info del cliente
▸ En algún momento menciona o muestra: "Actualización incluida — solo avísanos"

🎯 CIERRE (25-34 seg):
▸ Pausa de 1 segundo con la tarjeta Taply en cámara
▸ Texto: "¿Lo quieres para tu negocio?"
▸ Subtexto: "Comenta SÍ y te contactamos"
▸ Handle: "@taply.nfc" o el tuyo

🎵 AUDIO STRATEGY:
▸ SIEMPRE usa audio trending de TikTok (revisa tu For You Page)
▸ Trending audio = hasta 3x más alcance orgánico
▸ Baja el original al 15% si grabas voz en off
▸ Sincroniza los cortes con el ritmo de la música

💡 TIPS TIKTOK FACELESS:
- Graba en 4K si tu celular lo permite
- Manos limpias — son el "actor" de tus videos
- Fondo limpio y ordenado, preferiblemente oscuro
- Edita en CapCut: usa auto-caption para los textos
- Publica martes-jueves 7-9pm hora Colombia`,
  }

  const gen = scripts[format]
  return gen ? gen(topic, captionIdea) : `Guión para: ${topic}\n\n${captionIdea}`
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
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
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff); d.setHours(0, 0, 0, 0)
  return d
}

function formatWeekDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const end = new Date(d); end.setDate(end.getDate() + 6)
  return `${d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function ContenidoPage() {
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [generatingScript, setGeneratingScript] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()).toISOString().split('T')[0])

  async function fetchPosts(week: string) {
    setLoading(true)
    const { data } = await supabase.from('content_board').select('*').eq('week_start', week).order('day_index')
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchPosts(weekStart) }, [weekStart])

  async function generateWeek() {
    setGenerating(true); setExpandedId(null)
    const selected = selectBalancedWeek(CONTENT_BANK)
    await supabase.from('content_board').delete().eq('week_start', weekStart)
    const newPosts = DAYS.map((day, i) => ({
      week_start: weekStart, day_index: i, day_name: day,
      format: selected[i].format, topic: selected[i].topic,
      caption_idea: selected[i].caption_idea, hashtags: selected[i].hashtags,
      status: 'pendiente', script: null, script_generated: false,
    }))
    await supabase.from('content_board').insert(newPosts)
    await fetchPosts(weekStart)
    setGenerating(false)
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

  function prevWeek() {
    const d = new Date(weekStart + 'T00:00:00'); d.setDate(d.getDate() - 7)
    setWeekStart(d.toISOString().split('T')[0]); setExpandedId(null)
  }

  function nextWeek() {
    const d = new Date(weekStart + 'T00:00:00'); d.setDate(d.getDate() + 7)
    setWeekStart(d.toISOString().split('T')[0]); setExpandedId(null)
  }

  const publishedCount = posts.filter(p => p.status === 'publicado').length
  const isCurrentWeek = weekStart === getWeekStart(new Date()).toISOString().split('T')[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }} className="taply-gradient-text">Contenido</h1>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>
            Tablero de ideas + guiones faceless para redes sociales de Taply NFC
          </p>
        </div>
        <button onClick={generateWeek} disabled={generating}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: generating ? 'not-allowed' : 'pointer', border: 'none',
            background: generating ? '#2a2a2a' : 'linear-gradient(90deg, #00cfff, #00ff94)', color: generating ? '#6b7280' : '#0d0d0d' }}>
          <RefreshCw size={16} />
          {generating ? 'Generando...' : posts.length > 0 ? '🎲 Nuevas Ideas' : '✨ Generar Ideas'}
        </button>
      </div>

      {/* Navegación semana */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderRadius: '14px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
        <button onClick={prevWeek}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #2a2a2a', color: '#6b7280' }}>
          <ChevronLeft size={16} /> Anterior
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Calendar size={16} style={{ color: '#00cfff' }} />
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#f0f0f0' }}>{formatWeekDate(weekStart)}</span>
            {isCurrentWeek && (
              <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, backgroundColor: '#00cfff0d', color: '#00cfff', border: '1px solid #00cfff22' }}>
                Esta semana
              </span>
            )}
          </div>
          {posts.length > 0 && (
            <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#6b7280' }}>
              {publishedCount}/{posts.length} publicados {publishedCount === posts.length && posts.length > 0 ? '🎉' : ''}
            </p>
          )}
        </div>
        <button onClick={nextWeek}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #2a2a2a', color: '#6b7280' }}>
          Siguiente <ChevronRight size={16} />
        </button>
      </div>

      {/* Estado vacío */}
      {!loading && posts.length === 0 && (
        <div style={{ borderRadius: '16px', padding: '64px 32px', textAlign: 'center', backgroundColor: '#161616', border: '1px dashed #2a2a2a' }}>
          <Sparkles size={40} style={{ margin: '0 auto 16px', display: 'block', color: '#374151' }} />
          <p style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#f0f0f0' }}>No hay contenido para esta semana</p>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6b7280' }}>Genera ideas frescas con un solo click</p>
          <button onClick={generateWeek} disabled={generating}
            style={{ padding: '12px 32px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none', background: 'linear-gradient(90deg, #00cfff, #00ff94)', color: '#0d0d0d' }}>
            ✨ Generar Ideas para esta Semana
          </button>
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
          {[...Array(7)].map((_, i) => (
            <div key={i} style={{ borderRadius: '14px', height: '300px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }} />
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && posts.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
          {posts.map(post => {
            const fc = FORMAT_CONFIG[post.format]
            const isExpanded = expandedId === post.id
            const isGenerating = generatingScript === post.id

            return (
              <div key={post.id}
                style={{ borderRadius: '14px', backgroundColor: post.status === 'publicado' ? '#0d0d0d' : '#161616',
                  border: `1px solid ${isExpanded ? fc.color + '55' : post.status === 'publicado' ? '#1f1f1f' : fc.border}`,
                  opacity: post.status === 'publicado' && !isExpanded ? 0.65 : 1,
                  display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease',
                  gridColumn: isExpanded ? 'span 2' : 'span 1' }}>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af' }}>{post.day_name}</span>
                    <button onClick={() => toggleStatus(post)}
                      style={{ width: '22px', height: '22px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        backgroundColor: post.status === 'publicado' ? '#00ff940d' : 'transparent',
                        border: post.status === 'publicado' ? '1px solid #00ff9433' : '1px solid #2a2a2a' }}>
                      {post.status === 'publicado' && <Check size={12} style={{ color: '#00ff94' }} />}
                    </button>
                  </div>
                  <span style={{ alignSelf: 'flex-start', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, backgroundColor: fc.bg, color: fc.color, border: `1px solid ${fc.border}` }}>
                    {fc.emoji} {post.format} · {fc.duration}
                  </span>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#f0f0f0', lineHeight: '1.4' }}>{post.topic}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', lineHeight: '1.5' }}>{post.caption_idea}</p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#00cfff', lineHeight: '1.4', opacity: 0.7 }}>{post.hashtags}</p>

                  <button onClick={() => handleExpand(post)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', marginTop: '4px',
                      backgroundColor: isExpanded ? fc.bg : '#0d0d0d',
                      border: `1px solid ${isExpanded ? fc.border : '#2a2a2a'}`,
                      color: isExpanded ? fc.color : '#6b7280' }}>
                    {isGenerating
                      ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Generando...</>
                      : isExpanded
                        ? <><ChevronUp size={12} /> Cerrar guión</>
                        : <><ChevronDown size={12} /> {post.script_generated ? 'Ver guión' : '✨ Ver guión'}</>
                    }
                  </button>
                </div>

                {isExpanded && !isGenerating && post.script && (
                  <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${fc.border}` }}>
                    <div style={{ marginTop: '16px', padding: '16px', borderRadius: '10px', backgroundColor: '#0a0a0a', border: `1px solid ${fc.border}` }}>
                      <pre style={{ margin: 0, fontSize: '11px', color: '#d1d5db', lineHeight: '1.9', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                        {post.script}
                      </pre>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(post.script ?? '')}
                      style={{ marginTop: '10px', width: '100%', padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', backgroundColor: fc.bg, border: `1px solid ${fc.border}`, color: fc.color }}>
                      📋 Copiar guión completo
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
