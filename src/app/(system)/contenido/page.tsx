'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useIsMobile } from '@/lib/hooks'
import { Sparkles, RefreshCw, Check, Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Copy, Megaphone, Target, DollarSign, Users, BarChart2 } from 'lucide-react'

interface ContentPost {
  id: string
  week_start: string
  day_index: number
  day_name: string
  platform: 'Instagram' | 'TikTok'
  format: 'Imagen Única' | 'Carrusel' | 'Historia'
  topic: string
  image_description: string
  prompt_chatgpt: string
  caption_idea: string
  hashtags: string
  status: 'pendiente' | 'publicado'
}

interface AdPost {
  id: string
  created_at: string
  objetivo: string
  publico_objetivo: string
  formato: string
  headline: string
  descripcion: string
  cta: string
  presupuesto_sugerido: string
  prompt_chatgpt: string
  metricas_esperadas: string
  image_description: string
  status: string
}

const PLATFORM_CONFIG = {
  Instagram: { color: '#e1306c', bg: '#e1306c0d', border: '#e1306c22', emoji: '📸' },
  TikTok:    { color: '#00f2ea', bg: '#00f2ea0d', border: '#00f2ea22', emoji: '🎵' },
}

const FORMAT_CONFIG = {
  'Imagen Única': { emoji: '🖼️', desc: '1080x1080px' },
  'Carrusel':     { emoji: '🎠', desc: '5-8 slides' },
  'Historia':     { emoji: '📱', desc: '1080x1920px' },
}

// Cadencia fija por día — 7 días por plataforma
const CADENCE_IG: ('Imagen Única' | 'Carrusel' | 'Historia')[] = [
  'Imagen Única', 'Carrusel', 'Historia', 'Imagen Única', 'Carrusel', 'Historia', 'Imagen Única'
]
const CADENCE_TK: ('Imagen Única' | 'Carrusel' | 'Historia')[] = [
  'Historia', 'Imagen Única', 'Carrusel', 'Historia', 'Imagen Única', 'Carrusel', 'Historia'
]

const CONTENT_BANK_IG = [
  { format: 'Imagen Única', topic: 'El tap que lo cambia todo', image_description: 'Fondo negro matte. Mano sosteniendo tarjeta Taply negra. Onda cyan emanando del centro. Texto: "Un tap. Tu mundo completo."', prompt_chatgpt: 'Flat lay product photo on matte black surface. Sleek black NFC business card centered, cyan neon glow radiating outward in concentric circles. Dramatic studio lighting from above, ultra sharp, 4K, commercial product photography. Color palette: black, cyan #00CFFF, white. 1080x1080px.', caption_idea: '¿Todavía regalas tarjetas que nadie guarda? Un solo tap y tu contacto queda guardado para siempre. 🖤', hashtags: '#TaplyNFC #TarjetasNFC #NetworkingColombia #TechColombia' },
  { format: 'Imagen Única', topic: 'Info siempre actualizada', image_description: 'Dos tarjetas en comparación. Izquierda: papel arrugado con número tachado. Derecha: Taply negra con ícono de edición cyan. Texto: "Tu info cambia. Tu Taply también."', prompt_chatgpt: 'Split composition product photo, matte black surface. Left: crumpled white paper business card crossed out number, dim warm light. Right: sleek black NFC card with cyan glow and edit icon, bright clean light. Dramatic contrast, commercial photography style, 4K, 1080x1080px.', caption_idea: '¿Cambiaste de número, empresa o redes? Avísanos y actualizamos tu Taply sin costo. ✅', hashtags: '#TaplyNFC #Servicio #NFC #TechFacil #Colombia' },
  { format: 'Imagen Única', topic: 'Taply para agentes inmobiliarios', image_description: 'Profesional en traje sosteniendo Taply negra frente a propiedad difuminada. Texto: "Comparte tu portafolio con un tap." Efecto cyan en la tarjeta.', prompt_chatgpt: 'Professional real estate agent holding black NFC card, luxury property blurred background, dramatic lighting, matte black card with cyan tap glow effect. Bold white text overlay space at bottom. Commercial photography style, 4K, 1080x1080px.', caption_idea: 'Portafolio, WhatsApp y redes sociales en un solo tap. Así trabajan los agentes del futuro. 🏠', hashtags: '#TaplyNFC #Inmobiliaria #NFC #BienesRaices #Colombia' },
  { format: 'Imagen Única', topic: 'Networking en eventos', image_description: 'Mano extendiendo Taply negra en evento oscuro con luces de fondo. Onda cyan. Texto: "El primer paso de cada gran conexión."', prompt_chatgpt: 'Close up hand presenting sleek black NFC card at networking event, bokeh background warm event lights, dramatic foreground lighting, cyan ripple effect on card. White text overlay space. Ultra sharp focus on card, 4K, 1080x1080px.', caption_idea: 'En cada evento hay una oportunidad esperando un tap. ¿Tienes la tuya? 🤝', hashtags: '#TaplyNFC #Networking #Eventos #Colombia #Emprendimiento' },
  { format: 'Imagen Única', topic: 'Taply para médicos', image_description: 'Médico en bata blanca sosteniendo Taply negra. Fondo clínico difuminado. Texto: "Consulta, WhatsApp y agenda con un tap."', prompt_chatgpt: 'Doctor in white coat holding sleek black NFC card, clinic background blurred, dramatic lighting, matte black card subtle cyan glow. Professional medical aesthetic, high contrast. Bold text space at bottom. Commercial photography, 4K, 1080x1080px.', caption_idea: 'Tus pacientes siempre tendrán tu contacto actualizado. Sin buscar papeles. 🩺', hashtags: '#TaplyNFC #Salud #Medicos #NFC #Colombia' },
  { format: 'Imagen Única', topic: 'La tarjeta que nunca se acaba', image_description: 'Pila de tarjetas papel desgastadas vs una sola Taply brillante. Texto: "Infinita vs temporal."', prompt_chatgpt: 'Product comparison shot on matte black surface. Left: tall stack of worn paper business cards, slightly yellowed, chaotic. Right: single pristine black NFC card with elegant cyan glow. Dramatic side lighting, deep shadows. Minimalist composition, 4K, 1080x1080px.', caption_idea: 'Cuántas veces has tenido que reimprimirlas. Con Taply, una sola y para siempre. ♾️', hashtags: '#TaplyNFC #Sostenibilidad #NFC #InversionInteligente #Colombia' },
  { format: 'Imagen Única', topic: 'Taply para restaurantes', image_description: 'Mesa de restaurante elegante. Taply negra sobre mantel oscuro. Ícono de menú digital en cyan. Texto: "Menú digital con un tap."', prompt_chatgpt: 'Elegant restaurant table setting, matte black NFC card on dark linen tablecloth, floating digital menu icon in cyan above card. Warm moody restaurant lighting, dramatic shadows. Product photography style, 4K, 1080x1080px.', caption_idea: 'Menú, reservas e Instagram de tu restaurante en un solo tap. 🍽️', hashtags: '#TaplyNFC #Restaurantes #Gastronomia #NFC #Colombia' },
  { format: 'Imagen Única', topic: 'Precio vs valor', image_description: 'Calculadora con billetes (tarjetas papel x años) vs una Taply sola. Texto: "La inversión inteligente."', prompt_chatgpt: 'Minimalist concept image on matte black surface. Left side: scattered Colombian peso bills and stack of paper cards, calculator large number, warm dim light. Right side: single sleek black NFC card with cyan glow, clean bright light. Bold text space center. 4K, 1080x1080px.', caption_idea: '200 tarjetas x 3 veces al año = mucho dinero. Una Taply = inversión única para siempre. 💡', hashtags: '#TaplyNFC #InversionInteligente #Emprendimiento #Colombia #NFC' },
  { format: 'Imagen Única', topic: 'Taply para abogados', image_description: 'Escritorio de abogado con togas al fondo. Taply negra sobre documentos. Texto: "Tu firma legal en un tap."', prompt_chatgpt: 'Lawyer desk setting, sleek black NFC card on legal documents, law books blurred background, dramatic moody lighting, cyan glow on card. Professional legal aesthetic, dark wood tones. Commercial photography, 4K, 1080x1080px.', caption_idea: 'Tus datos, tu firma y tu consulta disponibles en un tap. Profesionalismo del siglo XXI. ⚖️', hashtags: '#TaplyNFC #Abogados #Legal #NFC #Colombia' },
  { format: 'Imagen Única', topic: 'El momento del tap', image_description: 'Macro shot de iPhone acercándose a Taply. Chispa cyan en el punto de contacto. Texto: "El momento que lo cambia todo."', prompt_chatgpt: 'Extreme close up macro shot of iPhone approaching matte black NFC card, exact moment of tap, electric cyan spark at contact point, completely dark background, dramatic single light source. Ultra sharp on contact point, motion blur on phone, 4K, 1080x1080px.', caption_idea: 'En 0.3 segundos tu contacto completo guardado para siempre. ⚡', hashtags: '#TaplyNFC #NFC #Tech #Colombia #Networking' },
  { format: 'Carrusel', topic: '5 razones para dejar las tarjetas de papel', image_description: 'Slide 1: Hook negro "¿Aún usas tarjetas de papel?" cyan. Slides 2-6: cada razón con ícono cyan. Slide final: CTA con logo.', prompt_chatgpt: 'Series of 6 minimalist carousel slides, 1080x1080px. Consistent matte black background, white bold typography, cyan #00CFFF accents. Slide 1: large provocative headline. Slides 2-6: single centered icon with one line of text. Final slide: centered logo and CTA. Clean modern tech aesthetic.', caption_idea: 'La tarjeta de papel tiene fecha de vencimiento. La Taply no. Desliza y te cuento por qué. 👉', hashtags: '#TaplyNFC #Networking #TarjetasInteligentes #Colombia #Emprendedor' },
  { format: 'Carrusel', topic: 'Taply para diferentes profesiones', image_description: 'Slide 1: "¿Cuál es tu profesión?" Slides: médico, abogado, chef, agente, diseñador con ícono cyan. Slide final: "Un solo tap."', prompt_chatgpt: 'Professional carousel series, 1080x1080px per slide. Matte black background. Each slide: one large minimalist profession icon in cyan, profession name bold white, one sentence use case. Geometric sans-serif typography. Final slide: Taply logo centered. Commercial tech brand.', caption_idea: 'No importa a qué te dediques — Taply se adapta a tu mundo. ¿Cuál eres tú? 👇', hashtags: '#TaplyNFC #Profesionales #NFC #Networking #Colombia' },
  { format: 'Carrusel', topic: 'Top 5 errores al hacer networking', image_description: 'Slide 1: "Los errores que te cuestan clientes". Slides: error X rojo + solución cyan. Slide final: Taply como solución.', prompt_chatgpt: 'Educational carousel, 1080x1080px per slide. Matte black background. Slide 1: bold red/white hook text. Error slides: red X icon, mistake white, cyan checkmark with Taply solution. Final: all checkmarks cyan, Taply logo. High contrast, impactful typography.', caption_idea: 'Si has cometido alguno de estos errores, Taply es tu solución. ¿Cuántos reconoces? 🤔', hashtags: '#TaplyNFC #Networking #Errores #Emprendimiento #Colombia' },
  { format: 'Carrusel', topic: '¿Qué información comparte tu Taply?', image_description: 'Slide 1: "Todo tu mundo en un tap". Slides: WhatsApp, Instagram, web, portafolio, ubicación con ícono. Slide final: "Y lo que quieras."', prompt_chatgpt: 'Information showcase carousel, 1080x1080px per slide. Matte black background. Each slide: one large social/contact icon in cyan, service name white, brief description gray. Consistent grid layout, modern tech aesthetic. Final slide: constellation of all icons.', caption_idea: 'Un tap y comparten todo lo que necesitan saber de ti. Sin teclear nada. 🔗', hashtags: '#TaplyNFC #PerfilDigital #NFC #Colombia #Tech' },
  { format: 'Carrusel', topic: 'Antes y después de tener Taply', image_description: 'Slides alternando ANTES (gris/rojo) vs DESPUÉS (cyan/blanco). Slide final: estadística de impacto.', prompt_chatgpt: 'Before/after narrative carousel, 1080x1080px. Alternating slides: BEFORE desaturated dim light. AFTER clean cyan accents bright. Split screens same scenario transformed. Final stats slide: bold numbers cyan on black. Storytelling progression, high impact.', caption_idea: 'El antes y después que nadie te cuenta sobre el networking profesional. 📊', hashtags: '#TaplyNFC #AntesYDespues #Networking #Colombia #Emprendimiento' },
  { format: 'Carrusel', topic: 'Cómo funciona Taply en 4 pasos', image_description: 'Slide 1: "Así de fácil es Taply" con número 4. Slides 2-5: paso numerado con ícono. Slide final: resultado con CTA.', prompt_chatgpt: 'Step-by-step tutorial carousel, 1080x1080px. Matte black. Each step: large step number in cyan circle, simple icon, bold white action text, gray description. Progressive arrow between slides. Clean instructional design. Final result slide with CTA.', caption_idea: 'En menos de 5 minutos tienes tu Taply lista para usar. Así de simple. ⚡', hashtags: '#TaplyNFC #Tutorial #NFC #Colombia #TechFacil' },
  { format: 'Carrusel', topic: 'Taply para el sector salud', image_description: 'Slide 1: "¿Eres del sector salud?" Slides: médico, dentista, psicólogo, nutricionista con caso de uso. Slide final: CTA.', prompt_chatgpt: 'Healthcare professional carousel, 1080x1080px. Matte black background. Each slide: large medical profession icon in cyan, profession bold white, specific Taply use case gray text. Clinical clean aesthetic, professional tone. Final CTA slide with Taply logo.', caption_idea: 'El sector salud que comparte su info con un tap. Tus pacientes te lo agradecerán. 🏥', hashtags: '#TaplyNFC #Salud #NFC #Colombia #Profesionales' },
  { format: 'Historia', topic: 'Encuesta: ¿tarjeta física o digital?', image_description: 'Fondo negro. Ícono papel tachado rojo vs NFC cyan. Texto: "¿Cuál usas tú?" Espacio para encuesta Instagram.', prompt_chatgpt: 'Minimalist Instagram Story, 1080x1920px. Matte black background. Top third: two icons side by side — paper card red X, NFC card cyan glow. Center: bold white question text. Bottom third: two rounded poll option buttons dark gray white text. Space for Instagram poll sticker.', caption_idea: 'Vota y cuéntanos 👇 Los que respondieron NFC ya tienen su Taply.', hashtags: '#TaplyNFC #Encuesta #NFC #Colombia' },
  { format: 'Historia', topic: 'Precio vs valor de Taply', image_description: 'Fondo negro. Arriba: costo anual papel en rojo. Línea cyan centro. Abajo: Taply "una sola vez" cyan. Texto: "¿Cuál es la inversión inteligente?"', prompt_chatgpt: 'Minimalist infographic Story, 1080x1920px. Matte black. Top half: red toned section, stack paper cards, money symbols, yearly cost white text. Cyan horizontal divider. Bottom half: single NFC card cyan glow, one-time investment white text. Bold typography, high contrast.', caption_idea: 'Haz las matemáticas. La Taply se paga sola en el primer mes. 💡', hashtags: '#TaplyNFC #InversionInteligente #Emprendimiento #Colombia' },
  { format: 'Historia', topic: 'Mito: necesitas internet para el NFC', image_description: 'Fondo negro. "❌ MITO" rojo grande. "Tu Taply NO necesita internet" blanco. Sub-texto cyan. Ícono NFC abajo.', prompt_chatgpt: 'Myth-busting Story, 1080x1920px. Matte black. Top: large red MITO text with X. Center: bold white clarification two lines. Below: cyan NFC wave icon. Bottom: supporting detail light gray. Clean typographic hierarchy, cyan glow elements.', caption_idea: 'La pregunta que todos hacen 👆 Comparte para que lo sepa tu red.', hashtags: '#TaplyNFC #MitoVsRealidad #NFC #TechTips #Colombia' },
  { format: 'Historia', topic: 'CTA urgente — pide la tuya hoy', image_description: 'Fondo negro. Logo pequeño arriba. Centro: "¿Sigues perdiendo contactos valiosos?" 3 beneficios cyan. Fondo cyan abajo: "Pide la tuya hoy →" negro.', prompt_chatgpt: 'Conversion Story, 1080x1920px. Three zones: top 20% black small logo. Middle 50%: large bold white question, three benefit lines cyan checkmarks. Bottom 30%: solid cyan rectangle, bold black CTA text arrow. Sharp edge black/cyan. Direct conversion-focused design.', caption_idea: 'Cada evento es una oportunidad. No la dejes pasar sin tu Taply.', hashtags: '#TaplyNFC #NFC #Colombia' },
  { format: 'Historia', topic: 'Cliente feliz del mes', image_description: 'Fondo negro degradado cyan suave. Marco elegante para foto cliente. Texto: "Así usa Taply [nombre]" con testimonio. Logo pequeño abajo.', prompt_chatgpt: 'Customer testimonial Story template, 1080x1920px. Matte black background very subtle cyan gradient edges. Elegant rounded frame for customer photo center large. Below: customer name in cyan, profession white, short quote light gray italic. Bottom: small Taply logo. Clean premium aesthetic.', caption_idea: '¿Quieres ser el próximo cliente destacado? Etiquétanos con tu Taply. 🌟', hashtags: '#TaplyNFC #ClienteDelMes #Testimonial #Colombia' },
  { format: 'Historia', topic: 'Tip: cómo sacar el máximo a tu Taply', image_description: 'Fondo negro. Número "3" grande en cyan. Tres tips en bloques blancos cortos. CTA final: "¿Dudas? Escríbenos." Logo abajo.', prompt_chatgpt: 'Tips Story design, 1080x1920px. Matte black background. Top: large bold number 3 in cyan circle. Three tip blocks below: cyan number badge, white tip title, gray brief explanation. Bottom: CTA text white, small logo. Clean educational aesthetic, high readability.', caption_idea: '3 tips para sacarle el máximo provecho a tu Taply desde el día uno. 💡', hashtags: '#TaplyNFC #Tips #NFC #Colombia #TechTips' },
]

const CONTENT_BANK_TK = [
  { format: 'Imagen Única', topic: 'El tap más rápido del oeste', image_description: 'Fondo negro. Mano con iPhone acercándose a Taply. Motion blur. Chispa cyan. Texto: "0.3 segundos. Tu contacto guardado."', prompt_chatgpt: 'Dynamic action shot, 1080x1080px, TikTok aesthetic. Matte black background. Close up hand holding iPhone approaching black NFC card. Motion blur on hand, cyan electric spark at contact point. Bold oversized white text at top. High energy raw feel, slight film grain. High contrast, 4K.', caption_idea: 'Más rápido que buscar tu tarjeta en la billetera. ⚡ #TaplyNFC', hashtags: '#TaplyNFC #NFC #Tech #Networking #Colombia #Viral' },
  { format: 'Imagen Única', topic: 'Duelo: papel vs NFC', image_description: 'Split screen. Izquierda: cronómetro 45seg caótico. Derecha: cronómetro 0.3seg con tap cyan. "VS" grande al centro.', prompt_chatgpt: 'Split screen comparison, 1080x1080px TikTok style. Matte black. Left warm dim: stopwatch 45 seconds, person frantically searching wallet. Right cool cyan: stopwatch 0.3 seconds, NFC card electric tap. Bold VS text centered white. Dramatic lighting contrast, 4K.', caption_idea: 'Comenta "papel" vs "NFC" 👇 Veamos quién gana.', hashtags: '#TaplyNFC #Duelo #NFC #Colombia #Networking #TikTok' },
  { format: 'Imagen Única', topic: 'POV: único con NFC en el evento', image_description: 'Fondo negro. Texto TikTok: "POV: Sacas tu Taply en el evento". Tarjeta flotante con íconos de interrogación en cyan.', prompt_chatgpt: 'TikTok native text-style image, 1080x1080px. Matte black. Large white POV: text top. Scenario text smaller white. Center: sleek black NFC card floating cyan glow, small white question mark icons floating around. Bottom: reaction emoji. Authentic TikTok aesthetic, bold typography.', caption_idea: 'Y ahí empieza la conversación 😏 ¿Ya tienes la tuya? #TaplyNFC', hashtags: '#POV #TaplyNFC #NFC #Networking #TikTokColombia #Viral' },
  { format: 'Imagen Única', topic: 'Reacción al ver Taply por primera vez', image_description: 'Emojis de sorpresa alrededor de Taply con glow cyan. Texto: "La cara de todos cuando ven tu Taply 😱"', prompt_chatgpt: 'Reaction meme style image, 1080x1080px TikTok aesthetic. Matte black background. Center: sleek black NFC card dramatic cyan glow halo. Surrounding: large surprise emojis in circle. Bold white text top and bottom. Fun energetic composition, TikTok viral style.', caption_idea: 'Sin excepción. Todos reaccionan igual 😂 #TaplyNFC', hashtags: '#TaplyNFC #Reaccion #NFC #TikTokColombia #Viral #Colombia' },
  { format: 'Imagen Única', topic: 'El networking del futuro ya llegó', image_description: 'Fondo negro con grid cyan sutil. Mano con Taply emanando conexiones digitales. Texto: "2026. Así se hace networking."', prompt_chatgpt: 'Futuristic tech aesthetic, 1080x1080px TikTok style. Deep black background subtle cyan grid lines. Center: hand holding black NFC card with glowing cyan digital connection lines radiating outward like network map. Bold white text overlay. Sci-fi inspired, clean, 4K.', caption_idea: 'El futuro del networking ya está aquí. ¿Te estás quedando atrás? 🚀', hashtags: '#TaplyNFC #Futuro #Networking #NFC #TikTok #Colombia' },
  { format: 'Imagen Única', topic: 'Cuando no tienes tarjetas en el evento', image_description: 'Meme de pánico/estrés a la izquierda vs cara tranquila con Taply a la derecha. Texto: "Tener Taply vs no tenerla."', prompt_chatgpt: 'Meme comparison image, 1080x1080px TikTok style. Matte black background. Left half: stressed person icon/emoji, chaotic red energy, no card. Right half: calm person icon, cyan glow, holding NFC card elegantly. Bold white labels top each side. Center thin cyan divider. Relatable humor aesthetic.', caption_idea: 'La diferencia es enorme. ¿De cuál lado estás tú? 😅 #TaplyNFC', hashtags: '#TaplyNFC #Meme #NFC #TikTok #Colombia #Networking' },
  { format: 'Imagen Única', topic: 'Taply en 3 palabras', image_description: 'Fondo negro. Tres palabras grandes en tipografía bold: "TOCA." "COMPARTE." "IMPRESIONA." Cada palabra con acento cyan diferente. Taply logo abajo.', prompt_chatgpt: 'Typographic brand image, 1080x1080px TikTok aesthetic. Pure matte black background. Three words stacked vertically, massive bold white sans-serif: TOCA - COMPARTE - IMPRESIONA. Each word has subtle cyan underline or accent. Bottom: small Taply logo in cyan gradient. Minimal, powerful, brand statement. High contrast.', caption_idea: 'Tres palabras que definen todo. ¿Cuál es la tuya favorita? 👇', hashtags: '#TaplyNFC #NFC #Branding #TikTok #Colombia' },
  { format: 'Imagen Única', topic: 'El tap más elegante de Colombia', image_description: 'Plano cenital de mano con reloj elegante sosteniendo Taply negra sobre superficie de mármol oscuro. Efecto de luz cyan puntual. Ultra premium.', prompt_chatgpt: 'Top-down luxury product shot, 1080x1080px TikTok premium aesthetic. Dark marble surface, elegant hand with luxury watch holding matte black NFC card. Single precise cyan light beam hitting card center. Deep shadows, ultra sharp, commercial luxury photography. No text, pure visual impact. 4K.', caption_idea: 'Algunos detalles dicen todo sin decir nada. 🖤 #TaplyNFC', hashtags: '#TaplyNFC #Lujo #NFC #Premium #Colombia #TikTok' },
  { format: 'Imagen Única', topic: 'Por qué el NFC no es magia', image_description: 'Fondo negro. Diagrama simple: teléfono → onda NFC → tarjeta. Flechas cyan. Texto: "No es magia. Es tecnología." Estética educativa TikTok.', prompt_chatgpt: 'Educational explainer image, 1080x1080px TikTok style. Matte black background. Simple diagram: smartphone icon, cyan wave arrows, NFC card icon in sequence. Bold white title top. Brief gray explanation text below diagram. Clean educational design, minimal icons, high readability. Tech infographic aesthetic.', caption_idea: 'No es magia — es NFC. Y ahora lo tienes en una tarjeta hecha a mano. 🔬', hashtags: '#TaplyNFC #NFC #TechExplained #TikTok #Colombia' },
  { format: 'Imagen Única', topic: 'Taply para freelancers', image_description: 'Espacio de trabajo creativo con laptop y café. Taply negra al lado. Texto: "Tu portafolio completo en un tap." Efecto cyan en la tarjeta.', prompt_chatgpt: 'Creative freelancer workspace flat lay, 1080x1080px TikTok aesthetic. Dark wood desk surface, laptop, coffee cup, notebook, and sleek black NFC card with cyan glow as hero element. Overhead shot, moody creative lighting. Bold white text overlay. Authentic creative professional feel, 4K.', caption_idea: 'Tu portafolio, redes y contacto en un tap. Para los creativos que no paran. 🎨', hashtags: '#TaplyNFC #Freelancer #Creativos #NFC #Colombia #TikTok' },
  { format: 'Carrusel', topic: '5 personas que NECESITAN Taply', image_description: 'Slide 1: "Si haces esto, necesitas Taply 🧵". Slides 2-6: profesión con ícono cyan directo. Slide final: "¿Eres tú? 👇"', prompt_chatgpt: 'TikTok carousel series, 1080x1080px. Consistent matte black. Slide 1: large hook text bold white. Each slide: oversized cyan emoji/icon centered, bold white profession, one-line gray description. Raw TikTok energy, bold sans-serif. Final slide: white CTA text arrow down.', caption_idea: '¿Cuál eres tú? 1, 2, 3, 4 o 5 en comentarios 👇', hashtags: '#TaplyNFC #NFC #Profesionales #TikTokColombia' },
  { format: 'Carrusel', topic: 'Antes y después del networking', image_description: 'Slide 1: "ANTES de Taply" billetera caótica. Slide 2: "DESPUÉS" mano limpia Taply cyan. Slide 3: estadísticas. Slide 4: CTA.', prompt_chatgpt: 'Before/after TikTok carousel, 1080x1080px. Slide 1: desaturated cluttered wallet overflowing cards, dim chaotic. Slide 2: clean black surface, single NFC card cyan glow, dramatic spotlight. Slide 3: minimalist stats black and cyan. Slide 4: bold CTA black. Consistent frame border.', caption_idea: 'El networking en 2026 ya no se hace con papeles. Te lo demuestro 👇', hashtags: '#TaplyNFC #AntesYDespues #Networking #TikTokColombia #Tech' },
  { format: 'Carrusel', topic: 'Mini guía: cómo usar tu Taply', image_description: 'Slide 1: "Guía rápida Taply ⚡". Slides 2-5: paso a paso con íconos. Slide final: "¿Dudas? DM."', prompt_chatgpt: 'Quick guide TikTok carousel, 1080x1080px. Matte black. Slide 1: bold hook text cyan accent. Each step: large cyan circle number, action icon, bold instruction white, brief gray explanation. Arrow right each slide. Final: DM invitation with handle. TikTok educational style.', caption_idea: 'Guárdalo para cuando llegue tu Taply 📌 #TaplyNFC', hashtags: '#TaplyNFC #Tutorial #NFC #TikTokColombia #GuiaRapida' },
  { format: 'Carrusel', topic: '3 razones por las que tu competencia ya usa NFC', image_description: 'Slide 1: "Tu competencia ya lo sabe 👀". Slides 2-4: razón con ícono impacto. Slide 5: "¿Y tú?" con CTA.', prompt_chatgpt: 'Competitive awareness TikTok carousel, 1080x1080px. Matte black. Slide 1: provocative hook bold white, eye emoji cyan. Each reason slide: large impact icon cyan, bold white reason title, gray supporting text. Final: question mark icon large, CTA text white. Urgency-focused design, TikTok native feel.', caption_idea: 'No dejes que tu competencia llegue primero. ⚡ #TaplyNFC', hashtags: '#TaplyNFC #Competencia #NFC #TikTok #Colombia #Negocios' },
  { format: 'Carrusel', topic: 'Lo que pasa después de un tap', image_description: 'Slide 1: "¿Qué pasa después del tap? 🤔". Slides: perfil abre → info guardada → conexión establecida → seguimiento. Slide final: resultado.', prompt_chatgpt: 'Process visualization TikTok carousel, 1080x1080px. Matte black. Slide 1: curiosity hook white text. Each step slide: phone screen mockup showing progression, step number cyan circle, brief white description. Sequence arrows in cyan between slides. Final: success state with stats. Clean tech aesthetic.', caption_idea: 'El tap es solo el comienzo. Lo que viene después es lo importante. 🔗', hashtags: '#TaplyNFC #Proceso #NFC #TikTokColombia #Tech' },
  { format: 'Historia', topic: '¿Tu Taply funciona sin internet?', image_description: 'Fondo negro. "❌ MITO" rojo. "Tu Taply NO necesita internet" blanco. Cyan: "Solo el teléfono de quien recibe." Ícono NFC onda.', prompt_chatgpt: 'Educational myth-busting TikTok Story, 1080x1920px. Matte black. Top: large red MITO X symbol. Center: bold white explanatory text two lines. Below: cyan NFC wave icon. Bottom: supporting gray detail. Clean typographic hierarchy, TikTok educational style, slight cyan glow.', caption_idea: 'La pregunta que todos hacen 👆 Comparte para que lo sepa tu red.', hashtags: '#TaplyNFC #MitoVsRealidad #NFC #TechTips #Colombia' },
  { format: 'Historia', topic: 'POV: networking profesional en 2026', image_description: 'Fondo negro. Texto TikTok: "POV: Vas a un evento en 2026." 3 momentos: Sacas Taply → Tap → Contacto guardado. Estética cruda.', prompt_chatgpt: 'TikTok POV narrative Story, 1080x1920px. Matte black. Top: large POV: white TikTok style. Three scenario panels: simple icon + short text each: Sacas tu Taply, Tap en el iPhone, Contacto guardado. Bottom: result emoji and CTA. Raw TikTok aesthetic, bold sans-serif.', caption_idea: 'Así se hace en 2026. ¿Ya eres del futuro? 😏 #TaplyNFC', hashtags: '#POV #TaplyNFC #Networking #TikTokColombia #NFC' },
  { format: 'Historia', topic: '3 segundos que cambian tu networking', image_description: 'Fondo negro. Cronómetro cyan 3-2-1. Cada segundo: acción. Texto final: "3 segundos. Para siempre."', prompt_chatgpt: 'Countdown Story TikTok style, 1080x1920px. Matte black. Three vertical panels cyan lines: Panel 1 large 3 cyan, hand approaching. Panel 2 large 2 cyan, tap spark. Panel 3 large 1 cyan, contact saved. Bottom: bold white result text. Dynamic energetic clear progression.', caption_idea: '3 segundos que valen más que 200 tarjetas de papel. ⏱️', hashtags: '#TaplyNFC #NFC #Tech #TikTok #Colombia #Networking' },
  { format: 'Historia', topic: 'Comparación: evento con y sin Taply', image_description: 'Split vertical. Izquierda: caos gris sin tarjetas. Derecha: elegante tap cyan. Etiquetas "SIN TAPLY" vs "CON TAPLY".', prompt_chatgpt: 'Vertical split TikTok Story, 1080x1920px. Left half desaturated gray: stressed person searching pockets at event. Right half cyan accented: clean hand NFC card elegant tap. Bold labels top each side. Center vertical cyan dividing line. TikTok native aesthetic.', caption_idea: '¿De cuál lado quieres estar? 👀 #TaplyNFC', hashtags: '#TaplyNFC #SinVsCon #NFC #TikTokColombia #Networking' },
  { format: 'Historia', topic: 'Tip viral: el truco del primer tap', image_description: 'Fondo negro. "TRUCO 🔥" en cyan grande. Tip en 3 pasos cortos blancos. CTA: "Pruébalo y cuéntanos." Logo abajo.', prompt_chatgpt: 'Viral tip TikTok Story, 1080x1920px. Matte black. Top: large TRUCO text with fire emoji in cyan. Three numbered tip steps: bold white action, brief gray detail. Bottom: CTA white text, small logo. High energy, curiosity-driving design, TikTok viral aesthetic.', caption_idea: 'El truco que nadie te dice sobre las tarjetas NFC. Guárdalo 👆', hashtags: '#TaplyNFC #Truco #NFC #TikTok #Colombia #Viral' },
  { format: 'Historia', topic: 'Respuesta a pregunta frecuente', image_description: 'Fondo negro. "PREGUNTA 🤔" cyan arriba. Pregunta en blanco grande. Respuesta en bloques cortos con íconos. "¿Más dudas? DM" abajo.', prompt_chatgpt: 'FAQ answer TikTok Story, 1080x1920px. Matte black. Top: PREGUNTA label cyan. Large bold white question text. Answer section: two-three bullet points with cyan icons, white concise answers. Bottom: DM CTA white text. Clean Q&A design, educational TikTok style, high readability.', caption_idea: 'La pregunta que más nos hacen. Guarda para cuando te la hagan a ti. 📌', hashtags: '#TaplyNFC #FAQ #NFC #TikTok #Colombia #TechTips' },
]

const AD_BANK = [
  { objetivo: 'Conversión — Generar mensajes por WhatsApp', publico_objetivo: 'Hombres y mujeres 25-45 años · Colombia (Bogotá, Medellín, Cali, Barranquilla, Bucaramanga) · Intereses: networking, emprendimiento, negocios, tecnología, ventas · Comportamiento: dueños de negocio, profesionales independientes, uso activo de WhatsApp Business', formato: 'Imagen Única 1080x1080px — Feed Instagram y Facebook', headline: '¿Tu tarjeta de presentación sigue siendo de papel?', descripcion: 'Taply es la tarjeta NFC hecha a mano que comparte TODO tu mundo profesional con un solo tap. Sin apps. Sin fricción. Tu información siempre actualizada.', cta: 'Enviar mensaje → WhatsApp directo', presupuesto_sugerido: 'COP $15.000-$30.000/día · Duración mínima 7 días · Presupuesto total: COP $105.000-$210.000 · CPM estimado Colombia: COP $3.000-$8.000 · Alcance estimado: 5.000-15.000 personas/día', metricas_esperadas: 'CTR esperado: 1.5%-3% · Costo por mensaje: COP $800-$2.500 · Mensajes esperados 7 días: 15-40 contactos · ROAS objetivo: 3x mínimo', image_description: 'Fondo negro matte. Centro: tarjeta Taply con onda cyan. Izquierda: texto "Un tap." blanco grande. Lista íconos cyan (WhatsApp, IG, Web). Abajo: botón cyan "Escríbenos por WhatsApp". Logo esquina superior derecha.', prompt_chatgpt: 'Professional paid social media ad, 1080x1080px. Matte black background subtle texture. Center: sleek black NFC card dramatic product lighting, single spotlight sharp shadow. Left aligned: clean white bold headline, gray supporting text, cyan bullet list social media icons. Bottom right: rounded cyan CTA button white text. Top right: small logo space. Ultra clean conversion-optimized layout, luxury tech feel. 4K commercial photography composite.' },
  { objetivo: 'Reconocimiento de marca — Alcance masivo en Colombia', publico_objetivo: 'Hombres y mujeres 22-50 años · Colombia nacional · Intereses: emprendimiento, tecnología, networking, marketing digital · Lookalike audience de seguidores actuales · Excluir: quienes interactuaron en 30 días', formato: 'Historia vertical 1080x1920px — Instagram Stories y Facebook Stories', headline: 'La tarjeta que nunca se acaba', descripcion: 'Taply NFC — Hecha a mano en Colombia. Un tap y compartes todo: WhatsApp, redes, portafolio y más. Para profesionales que quieren impresionar desde el primer contacto.', cta: 'Desliza hacia arriba → Ver más', presupuesto_sugerido: 'COP $10.000-$20.000/día · Duración: 14 días · Presupuesto total: COP $140.000-$280.000 · CPM Stories Colombia: COP $2.000-$5.000 · Alcance estimado: 10.000-25.000 personas/día', metricas_esperadas: 'Alcance total: 70.000-175.000 personas · Frecuencia objetivo: 2-3 veces · Swipe up rate: 1%-2.5% · Nuevos seguidores: 50-150 · Costo por seguidor: COP $1.000-$3.500', image_description: 'Historia vertical. Superior: logo Taply centrado pequeño negro. Centro: tarjeta Taply flotante glow cyan dramático, tagline "La tarjeta que nunca se acaba" blanco. Inferior: fondo sólido cyan con texto negro "Conócela →".', prompt_chatgpt: 'Vertical brand awareness Story ad, 1080x1920px. Three zones: Top 20%: small centered white logo pure black. Middle 55%: black background, large NFC card floating dramatic cyan halo glow, elegant white tagline below. Bottom 25%: solid cyan #00CFFF rectangle, bold black CTA text centered right arrow. Clean sharp edge black/cyan. Luxury minimalist brand, Apple-inspired aesthetic.' },
  { objetivo: 'Tráfico — Visitas al perfil de Instagram de Taply', publico_objetivo: 'Mujeres y hombres 20-35 años · Bogotá, Medellín, Cali · Intereses: diseño, emprendimiento joven, redes sociales, lifestyle · Comportamiento: compradores online frecuentes, early adopters · Solo móvil iOS y Android', formato: 'Carrusel 1080x1080px — Feed Instagram (5 slides)', headline: '¿Qué puede hacer una tarjeta negra por tu carrera?', descripcion: 'Todo. Desliza y descubre cómo Taply está cambiando el networking profesional en Colombia. Hecha a mano, programada para ti.', cta: 'Ver perfil → Instagram Taply', presupuesto_sugerido: 'COP $12.000-$25.000/día · Duración: 10 días · Presupuesto total: COP $120.000-$250.000 · CPC estimado: COP $500-$1.500 · Clics estimados: 80-250/día', metricas_esperadas: 'CTR carrusel: 2%-4% · Costo por clic: COP $500-$1.500 · Visitas al perfil: 500-1.500 total · Nuevos seguidores: 25-150 · Alcance total: 30.000-80.000', image_description: 'Carrusel 5 slides. Slide 1: pregunta provocadora blanca, flecha cyan. Slide 2: tarjetas papel arrugadas desaturadas. Slide 3: Taply con glow cyan dramático. Slide 4: 4 íconos beneficios cyan. Slide 5: "@taplynfccolombia" cyan grande, "Síguenos →" blanco.', prompt_chatgpt: 'Traffic carousel ad series, 1080x1080px per slide. Slide 1: dramatic black, large white question, cyan swipe arrow. Slide 2: desaturated chaos crumpled cards warm dim light. Slide 3: hero product shot black NFC card explosive cyan glow spotlight. Slide 4: clean 2x2 grid four cyan icons white benefit text. Slide 5: pure black large cyan Instagram handle, white follow CTA, subtle logo. Luxury tech brand aesthetic, commercial photography.' },
  { objetivo: 'Generación de leads — Capturar datos de clientes potenciales', publico_objetivo: 'Dueños de negocio 28-50 años · Colombia nacional · Intereses: ventas B2B, networking empresarial, tecnología empresarial · Cargo: gerentes, directores, representantes de ventas · Ingresos medios-altos', formato: 'Imagen Única 1080x1080px — Feed Facebook (mayor audience B2B)', headline: 'Más de 100 profesionales en Colombia ya usan Taply', descripcion: '¿Cuántos contactos valiosos perdiste este mes? Taply NFC te da presencia profesional instantánea. Un tap y tu información completa.', cta: 'Solicitar información → Formulario Lead', presupuesto_sugerido: 'COP $20.000-$40.000/día · Duración: 14 días · Presupuesto total: COP $280.000-$560.000 · CPL estimado B2B: COP $3.000-$8.000 · Leads esperados: 35-90 en campaña', metricas_esperadas: 'Tasa conversión a lead: 2%-5% · Costo por lead: COP $3.000-$8.000 · Leads totales: 35-90 · Tasa de cierre: 15%-25% · Ventas proyectadas: 5-22 unidades · ROI estimado: 2x-5x', image_description: 'Fondo negro. Arriba: "más de 100 profesionales confían en Taply" blanco con verificación cyan. Centro: 6 íconos profesiones en círculos cyan. Abajo: tarjeta Taply con estadística. CTA: botón "Quiero saber más" cyan.', prompt_chatgpt: 'Lead generation Facebook ad, 1080x1080px. Matte black background. Top: social proof text white with cyan verified checkmark icon. Center: 2x3 grid professional silhouette icons in cyan circles (doctor, lawyer, realtor, chef, designer, entrepreneur). Below: product shot black NFC card white stat text. Bottom: prominent rounded cyan button dark CTA text. Trust-building layout, professional B2B aesthetic, high credibility visual hierarchy.' },
]

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff); d.setHours(0, 0, 0, 0); return d
}

function formatWeekDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const end = new Date(d); end.setDate(end.getDate() + 6)
  return `${d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function ContenidoPage() {
  const isMobile = useIsMobile()
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [ads, setAds] = useState<AdPost[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatingAd, setGeneratingAd] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedAdId, setExpandedAdId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()).toISOString().split('T')[0])
  const [activeTab, setActiveTab] = useState<'calendario' | 'pauta'>('calendario')
  const [platformFilter, setPlatformFilter] = useState<'Instagram' | 'TikTok'>('Instagram')

  async function fetchPosts(week: string) {
    setLoading(true)
    const { data } = await supabase.from('content_board').select('*').eq('week_start', week).order('day_index')
    setPosts(data ?? []); setLoading(false)
  }

  async function fetchAds() {
    const { data } = await supabase.from('ad_board').select('*').order('created_at', { ascending: false })
    setAds(data ?? [])
  }

  useEffect(() => { fetchPosts(weekStart); fetchAds() }, [weekStart])

  async function generateWeek() {
    setGenerating(true); setExpandedId(null)

    const { data: usedData } = await supabase.from('content_board').select('topic')
    const usedTopics = new Set((usedData ?? []).map((d: { topic: string }) => d.topic))

    // Generar 7 para Instagram
    const igAvailable = CONTENT_BANK_IG.filter(i => !usedTopics.has(i.topic))
    const igBank = igAvailable.length >= 7 ? igAvailable : CONTENT_BANK_IG
    const igSelected: typeof CONTENT_BANK_IG = []
    for (let d = 0; d < 7; d++) {
      const format = CADENCE_IG[d]
      const options = shuffleArray(igBank.filter(i => i.format === format && !igSelected.find(s => s.topic === i.topic)))
      if (options.length > 0) igSelected.push(options[0])
      else {
        const fallback = shuffleArray(igBank.filter(i => !igSelected.find(s => s.topic === i.topic)))
        if (fallback.length > 0) igSelected.push(fallback[0])
      }
    }

    // Generar 7 para TikTok
    const tkAvailable = CONTENT_BANK_TK.filter(i => !usedTopics.has(i.topic))
    const tkBank = tkAvailable.length >= 7 ? tkAvailable : CONTENT_BANK_TK
    const tkSelected: typeof CONTENT_BANK_TK = []
    for (let d = 0; d < 7; d++) {
      const format = CADENCE_TK[d]
      const options = shuffleArray(tkBank.filter(i => i.format === format && !tkSelected.find(s => s.topic === i.topic)))
      if (options.length > 0) tkSelected.push(options[0])
      else {
        const fallback = shuffleArray(tkBank.filter(i => !tkSelected.find(s => s.topic === i.topic)))
        if (fallback.length > 0) tkSelected.push(fallback[0])
      }
    }

    await supabase.from('content_board').delete().eq('week_start', weekStart)

    const igRows = igSelected.map((item, i) => ({ week_start: weekStart, day_index: i, day_name: DAYS[i], platform: 'Instagram', format: item.format, topic: item.topic, image_description: item.image_description, prompt_chatgpt: item.prompt_chatgpt, caption_idea: item.caption_idea, hashtags: item.hashtags, status: 'pendiente', script: '', script_generated: false }))
    const tkRows = tkSelected.map((item, i) => ({ week_start: weekStart, day_index: i, day_name: DAYS[i], platform: 'TikTok', format: item.format, topic: item.topic, image_description: item.image_description, prompt_chatgpt: item.prompt_chatgpt, caption_idea: item.caption_idea, hashtags: item.hashtags, status: 'pendiente', script: '', script_generated: false }))

    await supabase.from('content_board').insert([...igRows, ...tkRows])
    await fetchPosts(weekStart); setGenerating(false)
  }

  async function generateAd() {
    setGeneratingAd(true)
    const usedObjetivos = new Set(ads.map(a => a.objetivo))
    const available = AD_BANK.filter(a => !usedObjetivos.has(a.objetivo))
    const bank = available.length > 0 ? available : AD_BANK
    const selected = shuffleArray(bank)[0]
    await supabase.from('ad_board').insert([selected])
    await fetchAds(); setGeneratingAd(false); setActiveTab('pauta')
  }

  async function toggleStatus(post: ContentPost) {
    const newStatus = post.status === 'pendiente' ? 'publicado' : 'pendiente'
    await supabase.from('content_board').update({ status: newStatus }).eq('id', post.id)
    fetchPosts(weekStart)
  }

  async function deleteAd(id: string) {
    await supabase.from('ad_board').delete().eq('id', id); fetchAds()
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text); setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function prevWeek() { const d = new Date(weekStart + 'T00:00:00'); d.setDate(d.getDate() - 7); setWeekStart(d.toISOString().split('T')[0]); setExpandedId(null) }
  function nextWeek() { const d = new Date(weekStart + 'T00:00:00'); d.setDate(d.getDate() + 7); setWeekStart(d.toISOString().split('T')[0]); setExpandedId(null) }

  const isCurrentWeek = weekStart === getWeekStart(new Date()).toISOString().split('T')[0]
  const filteredPosts = posts.filter(p => p.platform === platformFilter)
  const igPublished = posts.filter(p => p.platform === 'Instagram' && p.status === 'publicado').length
  const tkPublished = posts.filter(p => p.platform === 'TikTok' && p.status === 'publicado').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? '24px' : '32px', fontWeight: 900 }} className="taply-gradient-text">Contenido</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>7 posts diarios por plataforma + Pautas publicitarias</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={generateAd} disabled={generatingAd}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: generatingAd ? 'not-allowed' : 'pointer', border: '1px solid #fbbf2444', background: generatingAd ? '#2a2a2a' : '#fbbf240d', color: generatingAd ? '#6b7280' : '#fbbf24' }}>
            <Megaphone size={15} />{generatingAd ? 'Generando...' : '📢 Nueva Pauta'}
          </button>
          {activeTab === 'calendario' && (
            <button onClick={generateWeek} disabled={generating}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: generating ? 'not-allowed' : 'pointer', border: 'none', background: generating ? '#2a2a2a' : 'linear-gradient(90deg, #00cfff, #00ff94)', color: generating ? '#6b7280' : '#0d0d0d' }}>
              <RefreshCw size={15} />{generating ? 'Generando...' : posts.length > 0 ? '🎲 Nueva Semana' : '✨ Generar Semana'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs principales */}
      <div style={{ display: 'flex', gap: '8px', padding: '4px', borderRadius: '12px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
        <button onClick={() => setActiveTab('calendario')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 8px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none', backgroundColor: activeTab === 'calendario' ? '#00cfff0d' : 'transparent', color: activeTab === 'calendario' ? '#00cfff' : '#6b7280', outline: activeTab === 'calendario' ? '1px solid #00cfff22' : 'none' }}>
          <Calendar size={14} /> Calendario Semanal
        </button>
        <button onClick={() => setActiveTab('pauta')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 8px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none', backgroundColor: activeTab === 'pauta' ? '#fbbf240d' : 'transparent', color: activeTab === 'pauta' ? '#fbbf24' : '#6b7280', outline: activeTab === 'pauta' ? '1px solid #fbbf2422' : 'none' }}>
          <Megaphone size={14} /> Pautas Publicitarias {ads.length > 0 && <span style={{ padding: '1px 6px', borderRadius: '999px', fontSize: '10px', backgroundColor: '#fbbf2422', color: '#fbbf24' }}>{ads.length}</span>}
        </button>
      </div>

      {/* ── CALENDARIO ── */}
      {activeTab === 'calendario' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px', borderRadius: '14px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
            <button onClick={prevWeek} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #2a2a2a', color: '#6b7280' }}>
              <ChevronLeft size={14} />{isMobile ? '' : ' Anterior'}
            </button>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <Calendar size={14} style={{ color: '#00cfff' }} />
                <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 700, color: '#f0f0f0' }}>{formatWeekDate(weekStart)}</span>
                {isCurrentWeek && <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, backgroundColor: '#00cfff0d', color: '#00cfff', border: '1px solid #00cfff22' }}>Esta semana</span>}
              </div>
              {posts.length > 0 && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#6b7280' }}>📸 {igPublished}/7 · 🎵 {tkPublished}/7 publicados</p>}
            </div>
            <button onClick={nextWeek} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #2a2a2a', color: '#6b7280' }}>
              {isMobile ? '' : 'Siguiente '}<ChevronRight size={14} />
            </button>
          </div>

          {/* Tabs plataforma */}
          {posts.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', padding: '4px', borderRadius: '12px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
              {(['Instagram', 'TikTok'] as const).map(p => {
                const pc = PLATFORM_CONFIG[p]
                const count = posts.filter(x => x.platform === p).length
                const published = posts.filter(x => x.platform === p && x.status === 'publicado').length
                return (
                  <button key={p} onClick={() => setPlatformFilter(p)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 8px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none', backgroundColor: platformFilter === p ? pc.bg : 'transparent', color: platformFilter === p ? pc.color : '#6b7280', outline: platformFilter === p ? `1px solid ${pc.border}` : 'none' }}>
                    {pc.emoji} {p} <span style={{ fontSize: '11px', color: platformFilter === p ? pc.color : '#4b5563' }}>{published}/{count}</span>
                  </button>
                )
              })}
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div style={{ borderRadius: '16px', padding: '48px 24px', textAlign: 'center', backgroundColor: '#161616', border: '1px dashed #2a2a2a' }}>
              <Sparkles size={36} style={{ margin: '0 auto 16px', display: 'block', color: '#374151' }} />
              <p style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>No hay contenido para esta semana</p>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b7280' }}>Genera 7 posts para Instagram + 7 posts para TikTok</p>
              <button onClick={generateWeek} disabled={generating}
                style={{ padding: '12px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none', background: 'linear-gradient(90deg, #00cfff, #00ff94)', color: '#0d0d0d' }}>
                ✨ Generar Semana
              </button>
            </div>
          )}

          {!loading && filteredPosts.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredPosts.map(post => {
                const pc = PLATFORM_CONFIG[post.platform as keyof typeof PLATFORM_CONFIG] ?? PLATFORM_CONFIG['Instagram']
                const fc = FORMAT_CONFIG[post.format as keyof typeof FORMAT_CONFIG]
                const isExpanded = expandedId === post.id
                const isCopied = copiedId === post.id
                return (
                  <div key={post.id} style={{ borderRadius: '16px', backgroundColor: '#161616', border: `1px solid ${isExpanded ? pc.color + '44' : '#1f1f1f'}`, overflow: 'hidden', opacity: post.status === 'publicado' && !isExpanded ? 0.55 : 1 }}>
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280' }}>{post.day_name}</span>
                          <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, backgroundColor: pc.bg, color: pc.color, border: `1px solid ${pc.border}` }}>{pc.emoji} {post.platform}</span>
                          <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, backgroundColor: '#0d0d0d', color: '#9ca3af', border: '1px solid #2a2a2a' }}>{fc?.emoji} {post.format} · {fc?.desc}</span>
                        </div>
                        <button onClick={() => toggleStatus(post)} style={{ width: '24px', height: '24px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: post.status === 'publicado' ? '#00ff940d' : 'transparent', border: post.status === 'publicado' ? '1px solid #00ff9433' : '1px solid #2a2a2a' }}>
                          {post.status === 'publicado' && <Check size={13} style={{ color: '#00ff94' }} />}
                        </button>
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#f0f0f0', lineHeight: '1.3' }}>{post.topic}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', lineHeight: '1.5' }}>{post.caption_idea}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: pc.color, opacity: 0.7 }}>{post.hashtags}</p>
                      <button onClick={() => setExpandedId(isExpanded ? null : post.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '9px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', backgroundColor: isExpanded ? pc.bg : '#0d0d0d', border: `1px solid ${isExpanded ? pc.border : '#2a2a2a'}`, color: isExpanded ? pc.color : '#6b7280' }}>
                        {isExpanded ? <><ChevronUp size={13} /> Cerrar</> : <><ChevronDown size={13} /> Ver imagen + Prompt ChatGPT</>}
                      </button>
                    </div>
                    {isExpanded && (
                      <div style={{ borderTop: `1px solid ${pc.border}`, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ borderRadius: '12px', backgroundColor: '#0d0d0d', padding: '14px', border: '1px solid #2a2a2a' }}>
                          <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🖼️ Qué plasmar en la imagen</p>
                          <p style={{ margin: 0, fontSize: '13px', color: '#e5e7eb', lineHeight: '1.7' }}>{post.image_description}</p>
                        </div>
                        <div style={{ borderRadius: '12px', backgroundColor: '#0d0d0d', padding: '14px', border: `1px solid ${pc.border}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: pc.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>✨ Prompt para ChatGPT</p>
                            <button onClick={() => copyText(post.prompt_chatgpt, post.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', backgroundColor: isCopied ? '#00ff940d' : pc.bg, border: `1px solid ${isCopied ? '#00ff9433' : pc.border}`, color: isCopied ? '#00ff94' : pc.color }}>
                              {isCopied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
                            </button>
                          </div>
                          <p style={{ margin: 0, fontSize: '12px', color: '#d1d5db', lineHeight: '1.8', fontFamily: 'monospace' }}>{post.prompt_chatgpt}</p>
                        </div>
                        <div style={{ borderRadius: '12px', backgroundColor: '#0d0d0d', padding: '14px', border: '1px solid #2a2a2a' }}>
                          <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>💬 Caption + Hashtags</p>
                          <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#e5e7eb', lineHeight: '1.6' }}>{post.caption_idea}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: pc.color, opacity: 0.8 }}>{post.hashtags}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── PAUTAS ── */}
      {activeTab === 'pauta' && (
        <>
          {ads.length === 0 && (
            <div style={{ borderRadius: '16px', padding: '48px 24px', textAlign: 'center', backgroundColor: '#161616', border: '1px dashed #fbbf2422' }}>
              <Megaphone size={36} style={{ margin: '0 auto 16px', display: 'block', color: '#fbbf2433' }} />
              <p style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>No hay pautas generadas aún</p>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b7280' }}>Genera una pauta ultra-detallada lista para Meta Ads</p>
              <button onClick={generateAd} disabled={generatingAd}
                style={{ padding: '12px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none', background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', color: '#0d0d0d' }}>
                📢 Generar Primera Pauta
              </button>
            </div>
          )}
          {ads.map(ad => {
            const isExpanded = expandedAdId === ad.id
            const isCopied = copiedId === ad.id + '_prompt'
            return (
              <div key={ad.id} style={{ borderRadius: '16px', backgroundColor: '#161616', border: `1px solid ${isExpanded ? '#fbbf2444' : '#1f1f1f'}`, overflow: 'hidden' }}>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, backgroundColor: '#fbbf240d', color: '#fbbf24', border: '1px solid #fbbf2422' }}>📢 Pauta Meta Ads</span>
                      <p style={{ margin: '8px 0 4px', fontSize: '15px', fontWeight: 800, color: '#f0f0f0' }}>{ad.headline}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{ad.objetivo.split('—')[0].trim()}</p>
                    </div>
                    <button onClick={() => deleteAd(ad.id)} style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #2a2a2a', color: '#4b5563' }}>✕</button>
                  </div>
                  <button onClick={() => setExpandedAdId(isExpanded ? null : ad.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '9px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', backgroundColor: isExpanded ? '#fbbf240d' : '#0d0d0d', border: `1px solid ${isExpanded ? '#fbbf2422' : '#2a2a2a'}`, color: isExpanded ? '#fbbf24' : '#6b7280' }}>
                    {isExpanded ? <><ChevronUp size={13} /> Cerrar pauta</> : <><ChevronDown size={13} /> Ver pauta completa</>}
                  </button>
                </div>
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #fbbf2422', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ borderRadius: '12px', backgroundColor: '#0d0d0d', padding: '14px', border: '1px solid #2a2a2a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}><Target size={13} style={{ color: '#fbbf24' }} /><p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>Objetivo</p></div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#e5e7eb', lineHeight: '1.6' }}>{ad.objetivo}</p>
                    </div>
                    <div style={{ borderRadius: '12px', backgroundColor: '#0d0d0d', padding: '14px', border: '1px solid #2a2a2a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}><Users size={13} style={{ color: '#00cfff' }} /><p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#00cfff', textTransform: 'uppercase' }}>Público objetivo</p></div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#e5e7eb', lineHeight: '1.6' }}>{ad.publico_objetivo}</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                      <div style={{ borderRadius: '12px', backgroundColor: '#0d0d0d', padding: '14px', border: '1px solid #2a2a2a' }}>
                        <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase' }}>🖼️ Formato</p>
                        <p style={{ margin: 0, fontSize: '13px', color: '#e5e7eb' }}>{ad.formato}</p>
                      </div>
                      <div style={{ borderRadius: '12px', backgroundColor: '#0d0d0d', padding: '14px', border: '1px solid #2a2a2a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}><DollarSign size={13} style={{ color: '#00ff94' }} /><p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#00ff94', textTransform: 'uppercase' }}>Presupuesto</p></div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#e5e7eb', lineHeight: '1.6' }}>{ad.presupuesto_sugerido}</p>
                      </div>
                    </div>
                    <div style={{ borderRadius: '12px', backgroundColor: '#0d0d0d', padding: '14px', border: '1px solid #fbbf2422' }}>
                      <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>📝 Copy del anuncio</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div><span style={{ fontSize: '11px', color: '#6b7280' }}>HEADLINE: </span><span style={{ fontSize: '13px', fontWeight: 700, color: '#f0f0f0' }}>{ad.headline}</span></div>
                        <div><span style={{ fontSize: '11px', color: '#6b7280' }}>TEXTO: </span><span style={{ fontSize: '13px', color: '#e5e7eb' }}>{ad.descripcion}</span></div>
                        <div><span style={{ fontSize: '11px', color: '#6b7280' }}>CTA: </span><span style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24' }}>{ad.cta}</span></div>
                      </div>
                    </div>
                    <div style={{ borderRadius: '12px', backgroundColor: '#0d0d0d', padding: '14px', border: '1px solid #2a2a2a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}><BarChart2 size={13} style={{ color: '#f472b6' }} /><p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#f472b6', textTransform: 'uppercase' }}>Métricas esperadas</p></div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#e5e7eb', lineHeight: '1.7' }}>{ad.metricas_esperadas}</p>
                    </div>
                    <div style={{ borderRadius: '12px', backgroundColor: '#0d0d0d', padding: '14px', border: '1px solid #2a2a2a' }}>
                      <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>🖼️ Qué plasmar en la imagen</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#e5e7eb', lineHeight: '1.7' }}>{ad.image_description}</p>
                    </div>
                    <div style={{ borderRadius: '12px', backgroundColor: '#0d0d0d', padding: '14px', border: '1px solid #fbbf2422' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>✨ Prompt para ChatGPT</p>
                        <button onClick={() => copyText(ad.prompt_chatgpt, ad.id + '_prompt')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', backgroundColor: isCopied ? '#00ff940d' : '#fbbf240d', border: `1px solid ${isCopied ? '#00ff9433' : '#fbbf2422'}`, color: isCopied ? '#00ff94' : '#fbbf24' }}>
                          {isCopied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
                        </button>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#d1d5db', lineHeight: '1.8', fontFamily: 'monospace' }}>{ad.prompt_chatgpt}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
