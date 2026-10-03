'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Sparkles, RefreshCw, Check, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

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
}

const FORMAT_CONFIG = {
  Reel:     { color: '#ff4d4d', bg: '#ff4d4d0d', border: '#ff4d4d22', emoji: '🎬' },
  Story:    { color: '#ffb547', bg: '#ffb5470d', border: '#ffb54722', emoji: '📱' },
  Carrusel: { color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22', emoji: '🎠' },
  TikTok:   { color: '#00ff94', bg: '#00ff940d', border: '#00ff9422', emoji: '🎵' },
}

// Banco de contenido — enfocado 100% en cliente y beneficios, sin revelar procesos internos
const CONTENT_BANK = [
  { format: 'Reel', topic: 'Comparación tarjeta papel vs Taply NFC', caption_idea: 'Muestra cómo alguien busca su tarjeta de papel arrugada vs un simple tap con Taply. El contraste lo dice todo.', hashtags: '#TaplyNFC #TarjetasNFC #NetworkingColombia #EmprendedoresColombia' },
  { format: 'Story', topic: 'Tutorial: cómo funciona el tap en 3 segundos', caption_idea: 'Muestra el proceso desde el lado del cliente: acercar el teléfono → vibra → abre el perfil. Simple y poderoso.', hashtags: '#NFC #TaplyNFC #TechColombia' },
  { format: 'Carrusel', topic: '5 razones para dejar las tarjetas de papel', caption_idea: 'No más tarjetas perdidas. Info siempre actualizada. Imagen más profesional. Eco-friendly. Una sola inversión.', hashtags: '#TarjetasDePresentacion #NFC #Networking' },
  { format: 'TikTok', topic: 'Reacción de cliente al usar Taply por primera vez', caption_idea: 'Graba la cara de sorpresa de un cliente cuando descubre cómo funciona. Sin guión, 100% real y auténtico.', hashtags: '#TaplyNFC #ClientesFelices #Emprendimiento' },
  { format: 'Reel', topic: 'Taply Essential vs Taply Custom: ¿cuál es para ti?', caption_idea: 'Compara ambas opciones en pantalla partida. Essential para emprendedores, Custom para marcas ya posicionadas.', hashtags: '#TaplyNFC #EssentialVsCustom #NFC' },
  { format: 'Carrusel', topic: '¿Qué negocios ya están usando Taply NFC?', caption_idea: 'Restaurantes, salones de belleza, abogados, médicos, agentes inmobiliarios. Muestra casos de uso con resultados reales.', hashtags: '#NFC #TarjetasNFC #NegociosColombia' },
  { format: 'TikTok', topic: 'El momento viral: tap en evento de networking', caption_idea: 'Graba cuando alguien en un evento toca tu Taply y su reacción genuina. Contenido auténtico que genera alcance orgánico.', hashtags: '#Networking #TaplyNFC #EventosColombia' },
  { format: 'Reel', topic: 'Testimonial de cliente: cómo Taply cambió su networking', caption_idea: 'Un cliente real en 30 segundos contando cómo Taply transformó la forma en que conecta con prospectos.', hashtags: '#Testimonial #TaplyNFC #ClientesSatisfechos' },
  { format: 'Story', topic: 'Dato: cuántas tarjetas de papel se botan al año en Colombia', caption_idea: 'Dato impactante sobre desperdicio + solución inmediata. Crea conciencia y posiciona a Taply como alternativa inteligente.', hashtags: '#MedioAmbiente #NFC #Sostenibilidad' },
  { format: 'Carrusel', topic: 'Cómo actualizar tu info sin cambiar la tarjeta', caption_idea: 'Tu número cambió, abriste una nueva sede, actualizaste tu web. Con Taply lo cambias en segundos desde tu celular.', hashtags: '#Tutorial #TaplyNFC #TechFacil' },
  { format: 'TikTok', topic: 'POV: eres el único en el evento con tarjeta NFC', caption_idea: 'Formato POV trending. Muestra el impacto visual y profesional frente a los demás asistentes con tarjetas de papel.', hashtags: '#POV #TaplyNFC #Networking #Viral' },
  { format: 'Story', topic: 'Precio vs valor: ¿cuánto gastas al año en tarjetas de papel?', caption_idea: 'Haz las cuentas: 200 tarjetas × 3 veces al año = mucho dinero. Una sola Taply dura para siempre.', hashtags: '#PrecioVsValor #NFC #TaplyNFC' },
  { format: 'Carrusel', topic: 'Taply para diferentes profesiones', caption_idea: 'Médico, abogado, diseñador, chef, agente de finca raíz. Cada profesión tiene su forma de aprovechar Taply al máximo.', hashtags: '#Profesionales #NFC #TaplyNFC #Colombia' },
  { format: 'TikTok', topic: 'El antes y después de tu presentación profesional', caption_idea: 'Split screen: antes (buscando tarjeta arrugada en la billetera) vs después (tap elegante con Taply). Música trending.', hashtags: '#AntesYDespues #TaplyNFC #Profesionalismo' },
  { format: 'Story', topic: 'Mini encuesta: ¿tarjeta física o digital?', caption_idea: 'Usa la función de encuesta de Instagram Stories. Genera engagement real y datos valiosos sobre tu audiencia.', hashtags: '#Encuesta #NFC #Networking' },
  { format: 'Carrusel', topic: 'Top 5 errores al hacer networking (y cómo evitarlos)', caption_idea: 'Olvidar tarjetas, info desactualizada, tarjetas dañadas, quedarse sin tarjetas, imagen poco profesional.', hashtags: '#Networking #Errores #TaplyNFC' },
  { format: 'TikTok', topic: 'Reto: consigue 5 contactos nuevos en un evento con Taply', caption_idea: 'Documenta el reto en tiempo real en un evento. Cada tap cuenta. Muestra el resultado final.', hashtags: '#Reto #Networking #TaplyNFC #Challenge' },
  { format: 'Story', topic: 'FAQ: ¿Taply funciona en todos los celulares?', caption_idea: 'Responde la duda más frecuente. iPhone desde el 7, Android con NFC activado. Elimina la principal objeción de compra.', hashtags: '#FAQ #NFC #TaplyNFC #Compatibilidad' },
  { format: 'Carrusel', topic: 'La historia detrás de Taply: por qué nació esta idea', caption_idea: 'El problema que Taply resuelve contado desde la perspectiva del cliente que lo vivió. Conecta emocionalmente.', hashtags: '#Historia #Emprendimiento #TaplyNFC #Colombia' },
  { format: 'TikTok', topic: 'Un día en la vida de alguien que usa Taply NFC', caption_idea: 'Muestra cómo un profesional usa Taply en su día a día: reuniones, eventos, cafés de trabajo. Aspiracional y real.', hashtags: '#DayInMyLife #Profesional #TaplyNFC' },
  { format: 'Reel', topic: 'Taply en acción: resultados reales en eventos', caption_idea: 'Métricas reales de un evento: cuántos taps, cuántos contactos guardados, cuántos siguieron en redes. Prueba social poderosa.', hashtags: '#Resultados #NFC #Networking #TaplyNFC' },
  { format: 'Story', topic: 'Oferta especial esta semana', caption_idea: 'Crea urgencia con tiempo limitado. Los Stories con cuenta regresiva generan conversiones directas y medibles.', hashtags: '#Oferta #TaplyNFC #Descuento #Colombia' },
  { format: 'Carrusel', topic: 'Taply vs otras opciones del mercado: ¿cuál elegir?', caption_idea: 'Compara sin nombrar competidores. Precio, personalización, soporte local, diseño colombiano. Los hechos hablan.', hashtags: '#Comparativa #NFC #TaplyNFC #MejorOpcion' },
  { format: 'TikTok', topic: 'Reacción de alguien que nunca había visto NFC', caption_idea: 'La sorpresa genuina de ver funcionar NFC por primera vez es el mejor argumento de venta. Sin edición, sin guión.', hashtags: '#Reaccion #NFC #TaplyNFC #Viral' },
  { format: 'Reel', topic: '¿Qué pasa cuando pierdes tus tarjetas de papel?', caption_idea: 'Recrea el pánico de quedarte sin tarjetas en un evento importante vs la tranquilidad de tener Taply siempre contigo.', hashtags: '#TaplyNFC #Networking #Profesional' },
  { format: 'Story', topic: 'Cliente destacado del mes', caption_idea: 'Presenta a un cliente real (con su permiso), etiquétalo y cuéntale al mundo cómo usa Taply. Comunidad + prueba social.', hashtags: '#ClienteDelMes #TaplyNFC #Comunidad' },
  { format: 'Carrusel', topic: '5 usos de Taply que probablemente no conocías', caption_idea: 'Menú digital para restaurantes, portafolio para diseñadores, reservas para spas, contacto para médicos, perfil para vendedores.', hashtags: '#Tips #TaplyNFC #NFC #Usos' },
  { format: 'TikTok', topic: 'Duelo en velocidad: tarjeta de papel vs Taply', caption_idea: 'Cronometra en tiempo real cuánto tarda compartir contacto con tarjeta de papel vs un tap con Taply. Resultado obvio, impacto enorme.', hashtags: '#Duelo #TaplyNFC #Velocidad #Networking' },
  { format: 'Reel', topic: 'Taply en el sector salud: médicos y psicólogos', caption_idea: 'Un médico comparte su número de WhatsApp, consultorio, horarios y especialidades con un solo tap. Profesional y seguro.', hashtags: '#SaludNFC #TaplyNFC #MedicosColombia' },
  { format: 'Story', topic: '¿Tu Taply funciona sin internet?', caption_idea: 'Mito vs realidad: el NFC no necesita internet en la tarjeta. Solo el teléfono del cliente lo necesita para abrir tu perfil.', hashtags: '#MitoVsRealidad #NFC #TaplyNFC' },
  { format: 'Carrusel', topic: 'Taply para el sector gastronómico colombiano', caption_idea: 'Restaurantes, chefs y servicios de catering comparten menú digital, reservas e Instagram con un solo tap. Sin papel, sin confusión.', hashtags: '#Gastronomia #NFC #TaplyNFC #Restaurantes' },
  { format: 'TikTok', topic: 'Una semana de networking con Taply: así me fue', caption_idea: 'Documenta una semana real de eventos y muestra cuántos contactos nuevos lograste. Motivador y creíble.', hashtags: '#Networking #TaplyNFC #Contactos #Emprendimiento' },
  { format: 'Reel', topic: 'Taply para agentes inmobiliarios en Colombia', caption_idea: 'Un agente comparte su portafolio de propiedades, fotos y WhatsApp Business con un tap. Cierra conversaciones más rápido.', hashtags: '#Inmobiliaria #NFC #TaplyNFC #BienesRaices' },
  { format: 'Story', topic: 'La primera impresión lo es todo en los negocios', caption_idea: 'Reflexión breve sobre cómo una tarjeta NFC eleva tu imagen profesional desde el primer contacto. Texto + imagen de impacto.', hashtags: '#PrimeraImpresion #TaplyNFC #Profesionalismo' },
  { format: 'Carrusel', topic: 'Taply para emprendedores que están creciendo', caption_idea: 'Cuando tu negocio crece, tu presentación también debe crecer. Muestra cómo Taply escala contigo sin costos adicionales.', hashtags: '#Emprendimiento #Crecimiento #TaplyNFC #Colombia' },
  { format: 'TikTok', topic: 'Lo que dicen tus clientes cuando ven Taply por primera vez', caption_idea: 'Recopila reacciones reales de clientes. Cada "¿cómo funciona eso?" es una oportunidad de venta en cámara.', hashtags: '#Testimonios #TaplyNFC #Reacciones #Viral' },
  { format: 'Reel', topic: 'Networking inteligente en 2026: así se hace', caption_idea: 'Contrasta el networking anticuado (tarjetas, papeles) con el moderno (NFC, digital, instantáneo). Taply es el puente.', hashtags: '#Networking2026 #TaplyNFC #Futuro #Negocios' },
  { format: 'Story', topic: '¿Cuántos contactos pierdes por no tener tus datos a mano?', caption_idea: 'Pregunta reflexiva que hace pensar al espectador. Luego presenta Taply como la solución definitiva.', hashtags: '#Contactos #Networking #TaplyNFC' },
  { format: 'Carrusel', topic: 'Taply: la tarjeta que nunca se acaba ni se pierde', caption_idea: 'Compara el ciclo de vida de una tarjeta de papel (semanas) vs una Taply (años). Sostenible, inteligente y profesional.', hashtags: '#Sostenibilidad #TaplyNFC #InversionInteligente' },
  { format: 'TikTok', topic: 'El tap más importante de tu carrera profesional', caption_idea: 'Historia dramatizada: el momento en que un cliente potencial toca tu Taply y abre tu perfil completo. Así se generan oportunidades.', hashtags: '#Oportunidades #TaplyNFC #Profesional #Colombia' },
]

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
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatWeekDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const end = new Date(d)
  end.setDate(end.getDate() + 6)
  return `${d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function ContenidoPage() {
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()).toISOString().split('T')[0])

  async function fetchPosts(week: string) {
    setLoading(true)
    const { data } = await supabase.from('content_board').select('*').eq('week_start', week).order('day_index')
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchPosts(weekStart) }, [weekStart])

  async function generateWeek() {
    setGenerating(true)
    const selected = selectBalancedWeek(CONTENT_BANK)
    await supabase.from('content_board').delete().eq('week_start', weekStart)
    const newPosts = DAYS.map((day, i) => ({
      week_start: weekStart,
      day_index: i,
      day_name: day,
      format: selected[i].format,
      topic: selected[i].topic,
      caption_idea: selected[i].caption_idea,
      hashtags: selected[i].hashtags,
      status: 'pendiente',
    }))
    await supabase.from('content_board').insert(newPosts)
    await fetchPosts(weekStart)
    setGenerating(false)
  }

  async function toggleStatus(post: ContentPost) {
    const newStatus = post.status === 'pendiente' ? 'publicado' : 'pendiente'
    await supabase.from('content_board').update({ status: newStatus }).eq('id', post.id)
    fetchPosts(weekStart)
  }

  function prevWeek() {
    const d = new Date(weekStart + 'T00:00:00')
    d.setDate(d.getDate() - 7)
    setWeekStart(d.toISOString().split('T')[0])
  }

  function nextWeek() {
    const d = new Date(weekStart + 'T00:00:00')
    d.setDate(d.getDate() + 7)
    setWeekStart(d.toISOString().split('T')[0])
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
            Tablero de ideas para redes sociales de Taply NFC
          </p>
        </div>
        <button onClick={generateWeek} disabled={generating}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: generating ? 'not-allowed' : 'pointer', border: 'none',
            background: generating ? '#2a2a2a' : 'linear-gradient(90deg, #00cfff, #00ff94)',
            color: generating ? '#6b7280' : '#0d0d0d' }}>
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
          <p style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#f0f0f0' }}>
            No hay contenido para esta semana
          </p>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6b7280' }}>
            Genera ideas frescas con un solo click
          </p>
          <button onClick={generateWeek} disabled={generating}
            style={{ padding: '12px 32px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none',
              background: 'linear-gradient(90deg, #00cfff, #00ff94)', color: '#0d0d0d' }}>
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
            return (
              <div key={post.id}
                style={{ borderRadius: '14px', padding: '16px', backgroundColor: post.status === 'publicado' ? '#0d0d0d' : '#161616',
                  border: `1px solid ${post.status === 'publicado' ? '#1f1f1f' : fc.border}`,
                  opacity: post.status === 'publicado' ? 0.65 : 1,
                  display: 'flex', flexDirection: 'column', gap: '12px', transition: 'opacity 0.2s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af' }}>{post.day_name}</span>
                  <button onClick={() => toggleStatus(post)} title={post.status === 'publicado' ? 'Marcar pendiente' : 'Marcar publicado'}
                    style={{ width: '22px', height: '22px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      backgroundColor: post.status === 'publicado' ? '#00ff940d' : 'transparent',
                      border: post.status === 'publicado' ? '1px solid #00ff9433' : '1px solid #2a2a2a' }}>
                    {post.status === 'publicado' && <Check size={12} style={{ color: '#00ff94' }} />}
                  </button>
                </div>
                <span style={{ alignSelf: 'flex-start', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, backgroundColor: fc.bg, color: fc.color, border: `1px solid ${fc.border}` }}>
                  {fc.emoji} {post.format}
                </span>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#f0f0f0', lineHeight: '1.4' }}>{post.topic}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', lineHeight: '1.5', flex: 1 }}>{post.caption_idea}</p>
                <p style={{ margin: 0, fontSize: '10px', color: '#00cfff', lineHeight: '1.4', opacity: 0.7 }}>{post.hashtags}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
