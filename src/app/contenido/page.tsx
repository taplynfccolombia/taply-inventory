'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Sparkles, RefreshCw, Check, Calendar } from 'lucide-react'

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

// Banco de ideas de contenido para Taply NFC
const CONTENT_BANK = [
  { format: 'Reel', topic: 'Comparación tarjeta papel vs Taply NFC', caption_idea: 'Muestra cómo un cliente saca su tarjeta de papel arrugada vs un simple tap con Taply. El contraste lo dice todo.', hashtags: '#TaplyNFC #TarjetasNFC #NetworkingColombia #EmprendedoresColombia' },
  { format: 'Story', topic: 'Tutorial: cómo funciona el tap en 3 segundos', caption_idea: 'Muestra el proceso: acercar el teléfono → vibra → abre el perfil. Simple, rápido, profesional.', hashtags: '#NFC #TaplyNFC #TechColombia' },
  { format: 'Carrusel', topic: '5 razones para dejar las tarjetas de papel', caption_idea: 'Slide 1: No más tarjetas que se pierden. Slide 2: Actualiza tu info sin reimprimir. Slide 3: Más profesional. Slide 4: Eco-friendly. Slide 5: Una sola inversión.', hashtags: '#TarjetasDePresentacion #NFC #Networking' },
  { format: 'TikTok', topic: 'Reacción de cliente al recibir su Taply Custom', caption_idea: 'Graba la cara de sorpresa de tu cliente cuando le muestras cómo funciona. Sin guión, 100% real.', hashtags: '#TaplyNFC #ClientesFelices #Emprendimiento' },
  { format: 'Reel', topic: 'Taply Essential vs Taply Custom: ¿cuál elegir?', caption_idea: 'Compara ambos productos en pantalla partida. Essential para emprendedores, Custom para marcas establecidas.', hashtags: '#TaplyNFC #EssentialVsCustom #NFC' },
  { format: 'Story', topic: 'Behind the scenes: cómo se hace una Taply Custom', caption_idea: 'Muestra el proceso de personalización, desde el diseño hasta la entrega. Humaniza tu marca.', hashtags: '#BehindTheScenes #TaplyNFC #HechoEnColombia' },
  { format: 'Carrusel', topic: '¿Qué negocios necesitan Taply NFC?', caption_idea: 'Restaurantes, salones, abogados, médicos, agentes inmobiliarios. Muestra casos de uso reales con fotos.', hashtags: '#NFC #TarjetasNFC #NegociosColombia' },
  { format: 'TikTok', topic: 'El momento viral: tap en evento de networking', caption_idea: 'Graba cuando alguien en un evento de negocios toca tu Taply y su reacción. Contenido auténtico y viral.', hashtags: '#Networking #TaplyNFC #EventosColombia' },
  { format: 'Reel', topic: 'Testimonial de cliente: su experiencia con Taply', caption_idea: 'Pide a un cliente satisfecho que grabe 30 segundos contando cómo Taply cambió su forma de hacer networking.', hashtags: '#Testimonial #TaplyNFC #ClientesSatisfechos' },
  { format: 'Story', topic: 'Dato curioso: cuántas tarjetas de papel se botan al año', caption_idea: 'Dato impactante sobre desperdicio de papel + solución: Taply NFC. Crea conciencia y posiciona tu marca.', hashtags: '#MedioAmbiente #NFC #Sostenibilidad' },
  { format: 'Carrusel', topic: 'Cómo actualizar tu info en Taply sin cambiar la tarjeta', caption_idea: 'Tutorial paso a paso de cómo editar el perfil. Muestra que es tan fácil como actualizar Instagram.', hashtags: '#Tutorial #TaplyNFC #TechFacil' },
  { format: 'TikTok', topic: 'POV: eres el único en el evento con tarjeta NFC', caption_idea: 'Formato POV trending. Muestra la diferencia de impacto frente a los demás asistentes con tarjetas de papel.', hashtags: '#POV #TaplyNFC #Networking #Viral' },
  { format: 'Reel', topic: 'Unboxing de Taply Custom recién terminada', caption_idea: 'Abre el empaque, muestra los detalles del diseño personalizado y haz el primer tap. ASMR + info del producto.', hashtags: '#Unboxing #TaplyNFC #Custom #Diseño' },
  { format: 'Story', topic: 'Precio vs valor: ¿cuánto cuesta UNA tarjeta de papel?', caption_idea: 'Calcula cuánto gasta un negocio al año en tarjetas de papel vs una sola inversión en Taply. Los números hablan.', hashtags: '#PrecioVsValor #NFC #TaplyNFC' },
  { format: 'Carrusel', topic: 'Taply para diferentes profesiones', caption_idea: 'Médico, abogado, diseñador, chef, agente de bienes raíces. Muestra cómo cada uno usa Taply diferente.', hashtags: '#Profesionales #NFC #TaplyNFC #Colombia' },
  { format: 'TikTok', topic: 'El antes y después de tu presentación profesional', caption_idea: 'Split screen: antes (buscando tarjeta arrugada) vs después (tap elegante con Taply). Música trending.', hashtags: '#AntesYDespues #TaplyNFC #Profesionalismo' },
  { format: 'Reel', topic: '¿Cuánto tiempo tarda en llegar tu Taply?', caption_idea: 'Muestra el proceso de pedido hasta entrega. Transparencia genera confianza. Incluye tiempos reales.', hashtags: '#Proceso #TaplyNFC #EnviosColombia' },
  { format: 'Story', topic: 'Mini encuesta: ¿tarjeta física o digital?', caption_idea: 'Usa la función de encuesta de Instagram. Genera engagement y datos sobre tu audiencia.', hashtags: '#Encuesta #NFC #Networking' },
  { format: 'Carrusel', topic: 'Top 5 errores al hacer networking (y cómo Taply los resuelve)', caption_idea: 'Olvidar tarjetas, info desactualizada, tarjetas dañadas, no tener más tarjetas, imagen no profesional.', hashtags: '#Networking #Errores #TaplyNFC' },
  { format: 'TikTok', topic: 'Reto: consigue 5 contactos en un evento con Taply', caption_idea: 'Documenta el reto en tiempo real. Muestra cada tap y el resultado. Contenido dinámico y motivador.', hashtags: '#Reto #Networking #TaplyNFC #Challenge' },
  { format: 'Reel', topic: 'Colores y diseños disponibles en Taply Custom', caption_idea: 'Muestra el catálogo de personalizaciones disponibles con música de fondo. Inspira a los clientes.', hashtags: '#Diseño #Custom #TaplyNFC #Personalizado' },
  { format: 'Story', topic: 'FAQ: ¿funciona en todos los celulares?', caption_idea: 'Responde la pregunta más frecuente. iPhone, Android, todos los modelos modernos. Elimina objeciones.', hashtags: '#FAQ #NFC #TaplyNFC #Compatibilidad' },
  { format: 'Carrusel', topic: 'Historia de Taply: por qué nació esta idea', caption_idea: 'Comparte el origen del negocio. La historia personal conecta emocionalmente con los clientes.', hashtags: '#Historia #Emprendimiento #TaplyNFC #Colombia' },
  { format: 'TikTok', topic: 'Un día en la vida vendiendo tarjetas NFC en Colombia', caption_idea: 'Vlog rápido de tu día: pedidos, entregas, clientes. Muestra el lado humano del negocio.', hashtags: '#DayInMyLife #Emprendedor #TaplyNFC' },
  { format: 'Reel', topic: 'Taply en eventos: resultados reales', caption_idea: 'Comparte métricas reales: cuántos taps en un evento, cuántos contactos, cuántos convertidos. Prueba social.', hashtags: '#Resultados #NFC #Networking #TaplyNFC' },
  { format: 'Story', topic: 'Oferta especial de la semana', caption_idea: 'Crea urgencia con una oferta limitada. Stories con cuenta regresiva generan conversiones directas.', hashtags: '#Oferta #TaplyNFC #Descuento #Colombia' },
  { format: 'Carrusel', topic: 'Comparativa: Taply vs otras tarjetas NFC del mercado', caption_idea: 'Precio, calidad, personalización, soporte. Muestra por qué Taply es la mejor opción en Colombia.', hashtags: '#Comparativa #NFC #TaplyNFC #MejorOpcion' },
  { format: 'TikTok', topic: 'Reacción honesta de alguien que nunca vio NFC', caption_idea: 'Busca a alguien que no conozca la tecnología y graba su reacción genuina. Contenido orgánico y viral.', hashtags: '#Reaccion #NFC #TaplyNFC #Viral' },
]

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
  const [weekStart, setWeekStart] = useState(() => {
    const ws = getWeekStart(new Date())
    return ws.toISOString().split('T')[0]
  })

  async function fetchPosts(week: string) {
    setLoading(true)
    const { data } = await supabase
      .from('content_board')
      .select('*')
      .eq('week_start', week)
      .order('day_index')
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchPosts(weekStart) }, [weekStart])

  async function generateWeek() {
    setGenerating(true)

    // Seleccionar 7 ideas únicas del banco según semana
    const weekNum = Math.floor(new Date(weekStart).getTime() / (7 * 24 * 60 * 60 * 1000))
    const shuffled = [...CONTENT_BANK].sort(() => {
      const seed = weekNum * 7
      return (seed % 3) - 1
    })
    const selected = shuffled.slice(0, 7)

    // Eliminar posts existentes de esta semana
    await supabase.from('content_board').delete().eq('week_start', weekStart)

    // Insertar nuevos posts
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
    fetchPosts(weekStart)
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }} className="taply-gradient-text">
            Contenido
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>
            Tablero de ideas para redes sociales de Taply NFC
          </p>
        </div>
        <button onClick={generateWeek} disabled={generating}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: generating ? 'not-allowed' : 'pointer', border: 'none',
            background: generating ? '#2a2a2a' : 'linear-gradient(90deg, #00cfff, #00ff94)',
            color: generating ? '#6b7280' : '#0d0d0d' }}>
          <RefreshCw size={16} style={{ animation: generating ? 'spin 1s linear infinite' : 'none' }} />
          {generating ? 'Generando...' : posts.length > 0 ? 'Nueva Semana' : 'Generar Semana'}
        </button>
      </div>

      {/* Navegación de semana */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderRadius: '14px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
        <button onClick={prevWeek}
          style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #2a2a2a', color: '#6b7280' }}>
          ← Anterior
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Calendar size={16} style={{ color: '#00cfff' }} />
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#f0f0f0' }}>
              {formatWeekDate(weekStart)}
            </span>
          </div>
          {posts.length > 0 && (
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
              {publishedCount}/7 publicados
            </p>
          )}
        </div>
        <button onClick={nextWeek}
          style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #2a2a2a', color: '#6b7280' }}>
          Siguiente →
        </button>
      </div>

      {/* Grid de contenido */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
          {[...Array(7)].map((_, i) => (
            <div key={i} style={{ borderRadius: '14px', height: '280px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div style={{ borderRadius: '16px', padding: '64px 32px', textAlign: 'center', backgroundColor: '#161616', border: '1px dashed #2a2a2a' }}>
          <Sparkles size={40} style={{ margin: '0 auto 16px', display: 'block', color: '#374151' }} />
          <p style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#f0f0f0' }}>
            No hay contenido para esta semana
          </p>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6b7280' }}>
            Genera ideas de contenido personalizadas para Taply NFC
          </p>
          <button onClick={generateWeek} disabled={generating}
            style={{ padding: '12px 32px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none',
              background: 'linear-gradient(90deg, #00cfff, #00ff94)', color: '#0d0d0d' }}>
            <Sparkles size={16} style={{ display: 'inline', marginRight: '8px' }} />
            Generar Ideas de Contenido
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
          {posts.map(post => {
            const fc = FORMAT_CONFIG[post.format]
            return (
              <div key={post.id}
                style={{ borderRadius: '14px', padding: '16px', backgroundColor: post.status === 'publicado' ? '#0d0d0d' : '#161616',
                  border: `1px solid ${post.status === 'publicado' ? '#1f1f1f' : fc.border}`,
                  opacity: post.status === 'publicado' ? 0.7 : 1,
                  display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Día */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af' }}>{post.day_name}</span>
                  <button onClick={() => toggleStatus(post)}
                    style={{ width: '22px', height: '22px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      backgroundColor: post.status === 'publicado' ? '#00ff940d' : 'transparent',
                      border: post.status === 'publicado' ? '1px solid #00ff9433' : '1px solid #2a2a2a' }}>
                    {post.status === 'publicado' && <Check size={12} style={{ color: '#00ff94' }} />}
                  </button>
                </div>

                {/* Formato */}
                <span style={{ alignSelf: 'flex-start', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                  backgroundColor: fc.bg, color: fc.color, border: `1px solid ${fc.border}` }}>
                  {fc.emoji} {post.format}
                </span>

                {/* Tema */}
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#f0f0f0', lineHeight: '1.4' }}>
                  {post.topic}
                </p>

                {/* Idea de caption */}
                <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', lineHeight: '1.5', flex: 1 }}>
                  {post.caption_idea}
                </p>

                {/* Hashtags */}
                <p style={{ margin: 0, fontSize: '10px', color: '#00cfff', lineHeight: '1.4', opacity: 0.7 }}>
                  {post.hashtags}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
