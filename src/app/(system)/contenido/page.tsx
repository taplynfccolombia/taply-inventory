'use client'

import { useState, useMemo } from 'react'
import { useIsMobile } from '@/lib/hooks'
import { Copy, Check, ChevronDown, ChevronUp, Calendar, Layers, Image as ImageIcon, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'

interface Slide {
  numero: number
  rol: string
  imagenPrompt: string
  textoPrompt: string
}

interface Carousel {
  id: string
  codigo: string
  titulo: string
  subtitulo: string
  objetivo: string
  diaSemana: string[]
  slides: Slide[]
  caption: string
  hashtags: string
}

// ─── GUÍA DE MARCA TAPLY ───────────────────────────────────────────────────
// Fondo: #000000 o #0d0d0d (negro puro)
// Cian principal: #00C2FF
// Verde menta: #00FFAA
// Degradado: linear-gradient(90deg, #00C2FF, #00FFAA)
// Texto principal: #FFFFFF bold
// Texto secundario: #9CA3AF
// Logo Taply: esquina superior izquierda en todas las imágenes
// Tipografía: Montserrat ExtraBold para títulos, Regular para subtextos
// Formato imagen: 1080×1080px (cuadrado Instagram)
// ──────────────────────────────────────────────────────────────────────────

const BRAND = `
REGLAS DE MARCA TAPLY (aplicar en TODAS las imágenes):
- Formato: 1080×1080 píxeles, proporción 1:1
- Fondo: negro puro #000000
- Color primario: cian eléctrico #00C2FF
- Color secundario: verde menta #00FFAA
- Degradado de marca: de #00C2FF a #00FFAA (izquierda a derecha)
- Tipografía títulos: Montserrat ExtraBold, blanco #FFFFFF
- Tipografía cuerpo: Montserrat Regular, gris claro #E5E7EB
- Logo "Taply" en esquina superior izquierda, color blanco o degradado cian-verde
- Línea decorativa inferior: degradado #00C2FF → #00FFAA, 4px de grosor, ancho completo
- Estética: minimalista, dark, tech, moderno, premium
`.trim()

const CARRUSELES: Carousel[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // C1 · HOOK DE PROBLEMA — tarjetas de papel
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'c1',
    codigo: 'C1',
    titulo: '¿Sigues repartiendo tarjetas de papel en 2026?',
    subtitulo: 'Hook de problema · Venta directa',
    objetivo: 'Crear conciencia del dolor del papel y posicionar Taply como la solución obvia',
    diaSemana: ['Lunes 12PM', 'Jueves 7PM'],
    slides: [
      {
        numero: 1,
        rol: 'PORTADA — Hook',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Texto centrado en la imagen, tipografía Montserrat ExtraBold blanca:
LÍNEA 1 (grande, 80% del ancho): "¿Sigues repartiendo tarjetas de papel en 2026?"
LÍNEA 2 (más pequeña, color #9CA3AF): "Hay una forma más inteligente de presentarte."
Ícono sutil de tarjeta de papel tachada con X roja #F87171 en el centro superior.
Logo "Taply" en esquina superior izquierda, blanco.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Eres el equipo de contenido de Taply NFC Colombia — vendemos tarjetas de presentación digitales NFC hechas a mano, desde $100.000 COP, pago único, sin mensualidades.

Escribe el texto para la PORTADA (slide 1 de 5) de un carrusel de Instagram.
Objetivo: hook que golpea el dolor del emprendedor colombiano que todavía usa tarjetas de papel.
Formato: Título (máx 12 palabras) + Subtítulo (1 frase, máx 10 palabras).
Tono: directo, moderno, un poco provocador. En español colombiano.
Solo devuelve el Título y el Subtítulo. Sin explicaciones.`
      },
      {
        numero: 2,
        rol: 'EL PROBLEMA — El dolor real',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Composición: ícono grande de papelera o tarjeta arrugada en rojo suave #F87171, centrado.
Texto bold blanco abajo: "Las tarjetas de papel se pierden, se dañan y quedan desactualizadas."
Subtexto gris #9CA3AF: "Cada vez que cambias número o redes: dinero botado."
Logo "Taply" esquina superior izquierda, blanco.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP, pago único.

Escribe el texto para la slide 2 de 5 de un carrusel Instagram.
Tema: EL PROBLEMA — las tarjetas de papel se pierden, quedan desactualizadas, son dinero botado.
Público: emprendedor colombiano, dueño de negocio.
Formato: 2 frases cortas, contundentes. Coloquial colombiano.
Solo el texto. Sin explicaciones.`
      },
      {
        numero: 3,
        rol: 'LA SOLUCIÓN — Taply NFC',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Centro: representación visual de una tarjeta NFC negra y elegante con efecto de glow cian #00C2FF radiante alrededor.
Texto bold blanco arriba: "Taply NFC — tu tarjeta digital hecha a mano."
Subtexto con palabras clave en degradado #00C2FF→#00FFAA: "Un toque. Tu perfil completo. Siempre actualizado."
Logo "Taply" esquina superior izquierda, degradado cian-verde.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP, pago único.

Escribe el texto para la slide 3 de 5 de un carrusel Instagram.
Tema: LA SOLUCIÓN — presentar la tarjeta Taply NFC como el reemplazo inteligente.
Destacar: un toque basta, funciona con cualquier celular sin apps, siempre actualizada.
Formato: 2 frases. Primera frase nombra Taply. Segunda describe el beneficio principal.
Solo el texto. Sin explicaciones.`
      },
      {
        numero: 4,
        rol: 'BENEFICIOS — Qué comparte con Taply',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Título bold blanco en la parte superior: "Con Taply compartes todo:"
Lista vertical centrada con iconos en cian #00C2FF:
📞 Teléfono y WhatsApp
🌐 Web y redes sociales
📍 Ubicación en Maps
🎥 Videos y portafolio
⭐ Reseñas de Google
Cada ítem en blanco, tipografía clara. Iconos en cian eléctrico.
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP, pago único.

Escribe el texto para la slide 4 de 5 de un carrusel Instagram.
Tema: BENEFICIOS — lista de lo que el cliente puede compartir con su tarjeta Taply.
Formato: Título corto (máx 5 palabras) + lista de 5 ítems, cada uno con emoji relevante y máx 4 palabras.
Ejemplo de ítem: "📞 WhatsApp directo"
Solo el título y la lista. Sin explicaciones.`
      },
      {
        numero: 5,
        rol: 'PRECIO + CTA — Cierre de venta',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Texto centrado bold blanco muy grande: "Desde $100.000 COP"
Subtexto blanco: "Pago único. Sin mensualidades. Para siempre."
Texto en degradado #00C2FF→#00FFAA bold grande: "Escríbenos hoy 👇"
Efecto de brillo/glow verde-cian sutil de fondo.
Logo "Taply" esquina superior izquierda, degradado cian-verde.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior, más brillante aquí.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP, pago único, sin mensualidades.

Escribe el texto de CIERRE Y VENTA para la slide 5 de 5 de un carrusel Instagram.
Debe incluir: precio exacto ($100.000 COP pago único), propuesta de valor irresistible, CTA urgente para escribir por DM o WhatsApp.
Tono: confiado, directo, sin rodeos. Genera sensación de que no hacerlo es perder.
Formato: máx 3 líneas + CTA. Solo el texto. Sin explicaciones.`
      }
    ],
    caption: `¿Cuánto llevas gastando en tarjetas de papel que nadie guarda? 😅

Con Taply NFC, un solo toque comparte todo tu perfil profesional — redes, WhatsApp, ubicación, portafolio y más. Sin que la otra persona instale nada.

✅ Siempre actualizado
✅ Funciona con iPhone y Android
✅ Pago único desde $100.000 COP — sin mensualidades jamás

👇 Escríbenos por DM o al link de bio y te cotizamos hoy mismo.`,
    hashtags: '#TarjetaNFC #NFC #TarjetaDigital #EmprendedoresColombia #NetworkingDigital #Taply #TaplyNFC #MarketingDigital #Colombia #Bogotá #EmprendimientoCO'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // C2 · NEGOCIO FÍSICO — primera impresión
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'c2',
    codigo: 'C2',
    titulo: 'Tu negocio merece una primera impresión que no se borre',
    subtitulo: 'Identidad de negocio · Profesionalismo',
    objetivo: 'Conectar con dueños de negocio físico que quieren proyectar imagen profesional',
    diaSemana: ['Lunes 7PM', 'Viernes 12PM'],
    slides: [
      {
        numero: 1,
        rol: 'PORTADA — Hook negocio',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Texto principal bold blanco centrado (grande): "Tu negocio merece una primera impresión que no se borre."
Subtexto gris #9CA3AF: "La tarjeta de presentación del futuro ya existe."
Ícono sutil de edificio o tienda en cian #00C2FF.
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP, pago único.

Escribe la PORTADA para un carrusel Instagram dirigido a dueños de negocio físico en Colombia (tiendas, salones, restaurantes, consultorios).
Mensaje central: con Taply tu primera impresión es digital, profesional e imborrable.
Formato: Título (máx 10 palabras, aspiracional) + Subtítulo (1 frase).
Solo el texto. Sin explicaciones.`
      },
      {
        numero: 2,
        rol: 'ESCENARIO — El cliente que se va sin tus datos',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Escena minimalista: ícono de persona saliendo por una puerta, dejando caer una tarjeta de papel al suelo (color apagado, gris).
Texto bold blanco: "Imagina esto:"
Texto regular blanco: "Alguien entra. Le das tu tarjeta. Llega a casa y la tira a la basura."
Texto en rojo suave #F87171 abajo: "Eso no pasa con Taply."
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP.

Escribe el texto para slide 2 de 5 de un carrusel Instagram para dueños de negocio.
Tema: ESCENARIO COTIDIANO — alguien entra al negocio, le dan tarjeta de papel, la pierde. Dolor real.
Termina con "Eso no pasa con Taply."
Formato: 3 frases cortas, estilo cinematográfico. Solo el texto.`
      },
      {
        numero: 3,
        rol: 'CÓMO FUNCIONA — 3 pasos',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Tres pasos en columna vertical, cada número en cian bold #00C2FF:
1️⃣ "Acercás tu Taply al celular del cliente"
2️⃣ "Abre automáticamente tu perfil digital"
3️⃣ "Guarda tus datos con un toque"
Texto blanco, iconos en cian.
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP.

Escribe los 3 pasos de cómo funciona Taply NFC para slide 3 de un carrusel Instagram.
Público: dueño de negocio, no técnico. Sin tecnicismos.
Formato: 3 pasos numerados con emojis (1️⃣2️⃣3️⃣), máx 8 palabras cada uno.
Solo los 3 pasos. Sin título ni explicaciones.`
      },
      {
        numero: 4,
        rol: 'CASOS DE USO — Para qué negocio',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Título bold blanco arriba: "Perfecta para cualquier negocio:"
Grid 2×3 con iconos en cian #00C2FF y texto blanco:
🍽️ Restaurantes  |  💇 Salones de belleza
🏋️ Gimnasios     |  🏠 Inmobiliarias
📸 Fotógrafos    |  💼 Consultores
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP.

Escribe la slide 4 de 5 de un carrusel Instagram.
Tema: tipos de negocio colombiano que más necesitan Taply NFC.
Formato: Título corto + lista de 6 negocios, cada uno con emoji, máx 3 palabras.
Solo el título y la lista. Sin explicaciones.`
      },
      {
        numero: 5,
        rol: 'CTA — Invitación directa',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Texto bold blanco grande centrado: "Dale a tu negocio la imagen que merece."
Subtexto blanco: "Taply NFC — Desde $100.000 COP · Pago único"
Texto en degradado #00C2FF→#00FFAA bold: "¿Tu negocio ya tiene Taply? 👇"
Efecto glow cian-verde sutil de fondo.
Logo "Taply" esquina superior izquierda, degradado.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior, más brillante.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP, pago único.

Escribe el CIERRE CON CTA para slide 5 de 5, dirigido a dueños de negocio físico.
Incluir: propuesta de valor, precio ($100.000 COP pago único), llamado a escribir por DM.
Tono: directo y aspiracional. Que sienta que su competencia ya lo tiene.
Formato: máx 3 líneas + CTA. Solo el texto. Sin explicaciones.`
      }
    ],
    caption: `Tu negocio tiene 3 segundos para causar la primera impresión. ⚡

Con Taply NFC, cada vez que alguien acerca su celular recibe toda tu información al instante: redes, WhatsApp, web, portafolio, ubicación y más.

💡 Sin apps. Sin QR. Sin complicaciones.
💳 Funciona con iPhone y Android
📍 Entregas en Cajicá, Chía, Zipaquirá y toda la Sabana Norte

👇 Pide tu Taply hoy — link en bio.`,
    hashtags: '#NegocioDigital #TarjetaNFC #Taply #TaplyNFC #MarketingLocal #EmprendimientoColombia #SabanaNorte #Cajicá #Chía #NFC #TarjetaDeVisita'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // C3 · TESTIMONIO — Bella Pieza Cajicá
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'c3',
    codigo: 'C3',
    titulo: 'Así fue como Bella Pieza pasó del papel a lo digital con Taply',
    subtitulo: 'Testimonio real · Cajicá · Prueba social',
    objetivo: 'Generar confianza y deseo con historia de cliente real de la Sabana Norte',
    diaSemana: ['Martes 12PM', 'Sábado 12PM'],
    slides: [
      {
        numero: 1,
        rol: 'PORTADA — Testimonio',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Comillas tipográficas grandes en cian #00C2FF semitransparente de fondo decorativo.
Texto centrado bold blanco: "Así fue como Bella Pieza, Cajicá pasó del papel a lo digital."
Badge pequeño en esquina inferior derecha: "Historia real · Cliente Taply"
Logo "Taply" esquina superior izquierda, degradado cian-verde.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP.

Escribe la PORTADA de un carrusel testimonio Instagram. Cliente: Bella Pieza, salón de belleza en Cajicá.
Objetivo: generar intriga y confianza. Que el lector quiera ver la historia completa.
Formato: Título (máx 12 palabras) + badge de "Historia real". Solo el texto.`
      },
      {
        numero: 2,
        rol: 'ANTES — El problema del cliente',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Badge rojo suave #F87171 en esquina superior derecha: "ANTES"
Borde izquierdo vertical de 3px en rojo #F87171.
Texto italic blanco con comillas grandes: "Teníamos tarjetas impresas, pero los clientes las perdían o quedaban desactualizadas cada vez que cambiábamos algo."
Autor pequeño abajo en gris: "— Bella Pieza, Cajicá"
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP.

Escribe una cita en primera persona estilo testimonio para el "ANTES" de Bella Pieza (salón de belleza, Cajicá).
Problema: tarjetas de papel se perdían, quedaban desactualizadas, costaban cada vez.
Voz: dueña del salón, colombiana, natural, emocionalmente real.
Formato: 2 frases en primera persona entre comillas. Firma al final: "— Bella Pieza, Cajicá". Solo la cita.`
      },
      {
        numero: 3,
        rol: 'EL CAMBIO — Llegó Taply',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Flecha de transformación grande horizontal de izquierda a derecha, en degradado #00C2FF→#00FFAA.
Izquierda (oscuro, apagado): ícono tarjeta de papel gris.
Derecha (brillante): ícono tarjeta NFC con glow cian.
Texto bold blanco centrado arriba: "Luego llegó Taply."
Subtexto blanco: "Perfil digital listo en menos de 24 horas."
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP.

Escribe el texto "El cambio" para slide 3 del testimonio de Bella Pieza, Cajicá.
Taply creó el perfil digital del salón en menos de 24 horas: fotos, servicios, WhatsApp, Instagram, Maps.
Tono: narrativo, emocionante, como un before/after. 3 frases máx. Solo el texto.`
      },
      {
        numero: 4,
        rol: 'DESPUÉS — El resultado real',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Badge verde menta #00FFAA en esquina superior derecha: "DESPUÉS"
Borde izquierdo vertical de 3px en verde #00FFAA.
Texto italic blanco con comillas: "Ahora los clientes se van con todos nuestros datos en el celular. Nos han llegado citas de gente que la clienta anterior les pasó el perfil."
Autor en gris abajo: "— Bella Pieza, Cajicá"
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP.

Escribe la cita del "DESPUÉS" en primera persona para el testimonio de Bella Pieza, Cajicá.
Resultado real: clientes se van con info en el celular, el perfil se comparte entre clientas, llegaron nuevas citas.
Voz: dueña del salón, colombiana, emocionada, natural. 3 frases máx.
Formato: comillas + firma "— Bella Pieza, Cajicá". Solo la cita.`
      },
      {
        numero: 5,
        rol: 'CTA — ¿Será el próximo?',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Texto bold blanco grande centrado: "¿Tu negocio podría ser la próxima historia de éxito?"
Subtexto blanco: "Tarjeta Taply NFC desde $100.000 COP · Pago único"
Texto en degradado #00C2FF→#00FFAA bold: "Escríbenos 👇"
Glow verde-cian de fondo sutil, como aura de éxito.
Logo "Taply" esquina superior izquierda, degradado.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior, brillante.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP, pago único.

Escribe el CIERRE CTA de un carrusel testimonio. El lector ya vio la historia de Bella Pieza.
Invitarlo a ser el próximo caso de éxito. Precio ($100.000 COP pago único). CTA por DM.
Tono: inspirador y urgente. Que sienta que puede ser él/ella el próximo.
Formato: máx 3 líneas + CTA. Solo el texto. Sin explicaciones.`
      }
    ],
    caption: `📖 Historia real — Bella Pieza, Cajicá

Antes: tarjetas de papel que se perdían, quedaban desactualizadas y terminaban en la basura.

Hoy: cada cliente se va con el perfil completo en su celular. Y ese perfil se sigue compartiendo solo entre clientas. 🔄

💳 Un toque. Todo tu negocio.
💰 Desde $100.000 COP — pago único, sin mensualidades

¿Tu negocio podría ser la próxima historia? DM o link en bio 👇`,
    hashtags: '#Testimonio #TarjetaNFC #Taply #TaplyNFC #Cajicá #SabanaNorte #NegocioDigital #EmprendimientoColombia #ClientesFelices #NFC'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // C4 · MATEMÁTICA DE PRECIO — Taply vs papel
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'c4',
    codigo: 'C4',
    titulo: 'La matemática habla sola: Taply vs tarjetas de papel',
    subtitulo: 'Comparativa de costos · Objeción de precio',
    objetivo: 'Destruir la objeción de precio demostrando que Taply es más barata a largo plazo',
    diaSemana: ['Martes 7PM', 'Viernes 7PM'],
    slides: [
      {
        numero: 1,
        rol: 'PORTADA — Provocación de precio',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Texto bold blanco centrado grande: "¿Cuánto llevas gastando en tarjetas que nadie guarda?"
Subtexto gris #9CA3AF: "Hicimos las cuentas. El resultado te va a sorprender."
Ícono de calculadora o billetera en cian #00C2FF.
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP, pago único.

Escribe la PORTADA de un carrusel que demuestra que las tarjetas de papel cuestan más que Taply a largo plazo.
Hook que haga sentir curiosidad y un poco de culpa por seguir gastando en papel.
Formato: Título (máx 10 palabras) + Subtítulo (1 frase). Solo el texto.`
      },
      {
        numero: 2,
        rol: 'COSTO DEL PAPEL — La pérdida acumulada',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Título en rojo suave #F87171 bold arriba: "Tarjeta de papel:"
Cálculo visual en blanco:
"$50.000 × 100 tarjetas = $500.000"
"× 3 reimp. al año = $150.000–$300.000/año"
Texto en rojo #F87171 abajo: "Y cuando cambias datos, vuelta a empezar."
Ícono de billetes quemándose o disminuyendo en rojo.
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP, pago único.

Escribe el texto de la slide 2 de 5 mostrando el costo real anual de tarjetas de papel para un negocio colombiano.
Datos: ~$50.000 por 100 tarjetas, se reimprimen 3-4 veces al año = $150.000-$300.000/año.
Que suene a dinero desperdiciado. Emocional y numérico a la vez.
Formato: máx 4 líneas con los números. Solo el texto.`
      },
      {
        numero: 3,
        rol: 'COSTO TAPLY — La decisión inteligente',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Título en verde menta #00FFAA bold arriba: "Taply NFC:"
Texto blanco bold grande: "$100.000 — una sola vez."
Lista en verde #00FFAA con checks:
✅ Sin reimpresiones
✅ Sin papel
✅ Actualizable siempre gratis
✅ Para siempre
Texto final en verde bold grande: "Costo adicional: $0"
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP, pago único.

Escribe la slide 3 de 5 mostrando que Taply cuesta $100.000 una sola vez y nunca más.
Que suene como la decisión obvia e irrefutable. Lista de ventajas máx 4 ítems.
Termina con "Costo adicional: $0". Solo el texto.`
      },
      {
        numero: 4,
        rol: 'TABLA COMPARATIVA',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Tabla comparativa de 2 columnas:
Columna izquierda "PAPEL" con borde rojo #F87171:
❌ Se pierde
❌ Se desactualiza
❌ Costo cada vez
❌ Sin links ni redes
Columna derecha "TAPLY" con borde cian #00C2FF:
✅ Siempre en el celular
✅ Editable en tiempo real
✅ Pago único para siempre
✅ WhatsApp, Maps, redes
Título arriba en blanco: "La comparación es clara:"
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP, pago único.

Escribe la tabla comparativa para slide 4 de 5.
Columna izquierda: "Tarjeta de papel" con 4 desventajas (❌), máx 4 palabras cada una.
Columna derecha: "Taply NFC" con 4 ventajas (✅), máx 4 palabras cada una.
Formato limpio, para que sea fácil de visualizar. Solo la tabla con título corto.`
      },
      {
        numero: 5,
        rol: 'EL VEREDICTO — CTA',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Texto bold blanco grande centrado: "La matemática es clara."
Subtexto blanco: "Taply NFC es más barata, más útil y más profesional que cualquier tarjeta de papel."
Texto en cian #00C2FF bold: "Hacé el cambio hoy 👇"
Precio en verde #00FFAA bold: "Desde $100.000 COP · Pago único"
Glow cian-verde de fondo sutil.
Logo "Taply" esquina superior izquierda, degradado.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior, brillante.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP, pago único.

Escribe el VEREDICTO Y CTA para la slide 5 de 5 después de haber demostrado que el papel es más caro.
Mensaje: la decisión racional es Taply. Precio. CTA urgente.
Tono: contundente, como quien cierra un argumento ganado.
Formato: máx 4 líneas. Solo el texto. Sin explicaciones.`
      }
    ],
    caption: `⚔️ Taply NFC vs. Tarjeta de papel — los números no mienten:

📄 Papel: ❌ Se pierde · ❌ Se desactualiza · ❌ Costo recurrente
💳 Taply: ✅ En el celular siempre · ✅ Editable · ✅ Pago único para siempre

La matemática: 100 tarjetas × 3 veces al año = hasta $300.000+
Taply: $100.000 UNA sola vez. Para siempre.

¿Seguís eligiendo papel? 🤔 DM o link en bio 👇`,
    hashtags: '#TarjetaNFC #Taply #TaplyNFC #VsPapel #MarketingDigital #EmprendimientoColombia #NFC #InversionInteligente #TarjetaDigital'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // C5 · PROCESO DE COMPRA — 4 pasos
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'c5',
    codigo: 'C5',
    titulo: 'Conseguí tu Taply en 4 pasos simples',
    subtitulo: 'Tutorial de compra · Reducción de fricción',
    objetivo: 'Eliminar el miedo a comprar explicando el proceso completo de forma simple y rápida',
    diaSemana: ['Miércoles 12PM', 'Sábado 7PM'],
    slides: [
      {
        numero: 1,
        rol: 'PORTADA — Proceso simple',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Número "4" en cian #00C2FF muy grande, semitransparente, de fondo decorativo.
Encima: texto bold blanco: "¿Cómo conseguís tu Taply?"
Subtexto gris: "Más fácil de lo que imaginás."
Logo "Taply" esquina superior izquierda, degradado cian-verde.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP, pago único.

Escribe la PORTADA de un carrusel que explica el proceso de compra en 4 pasos.
Objetivo: reducir el miedo a comprar, que parezca fácil y rápido.
Formato: Título (máx 8 palabras) + Subtítulo (1 frase tranquilizadora). Solo el texto.`
      },
      {
        numero: 2,
        rol: 'PASO 1 — Escribir y elegir plan',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Número "1" en cian #00C2FF grande, semitransparente de fondo.
Título bold blanco: "Nos escribís y elegís tu plan."
Subtexto blanco: "Por DM en Instagram o WhatsApp."
Dos opciones en cajas:
📦 Essential: $100.000 COP
✨ Custom: $130.000 COP
Indicador de progreso: ●○○○ en cian.
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — planes: Essential $100.000 COP / Custom $130.000 COP. Pago único.

Escribe el Paso 1 del proceso de compra de Taply para un carrusel Instagram.
Paso: el cliente escribe por Instagram DM o WhatsApp, elige su plan y paga.
Simple, sin fricción, confiable. Máx 3 frases. Solo el texto.`
      },
      {
        numero: 3,
        rol: 'PASO 2 — Creamos su perfil',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Número "2" en cian #00C2FF grande, semitransparente de fondo.
Título bold blanco: "Creamos tu perfil digital."
Subtexto blanco: "En menos de 24 horas. Con fotos, servicios, redes y contacto. Vos aprobás antes."
Indicador ●●○○ en cian.
Ícono de pantalla/celular con glow cian.
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP.

Escribe el Paso 2 del proceso de compra para un carrusel Instagram.
Paso: el equipo de Taply crea el perfil digital personalizado en menos de 24 horas. El cliente lo revisa y aprueba.
Rápido, personalizado, el cliente tiene control. Máx 3 frases. Solo el texto.`
      },
      {
        numero: 4,
        rol: 'PASO 3 — Entregamos la tarjeta',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Número "3" en cian #00C2FF grande, semitransparente de fondo.
Título bold blanco: "Imprimimos y te entregamos tu tarjeta."
Subtexto blanco: "Tarjeta NFC física con tu diseño personalizado. Lista para usar desde el primer día."
Indicador ●●●○ en cian.
Ícono de caja de envío o tarjeta con brillo.
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP.

Escribe el Paso 3 del proceso de compra para un carrusel Instagram.
Paso: la tarjeta NFC física se imprime con diseño aprobado y se entrega.
Calidad, personalización, entrega rápida. Máx 2 frases. Solo el texto.`
      },
      {
        numero: 5,
        rol: 'PASO 4 + CTA — ¡Listo, a usar!',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Número "4" en cian #00C2FF grande, semitransparente de fondo.
Título bold blanco: "¡Listo! Empezás a compartir."
Subtexto en verde menta #00FFAA: "Acercás la tarjeta → El celular detecta → Tu perfil abre al instante."
Indicador ●●●● completo en degradado #00C2FF→#00FFAA.
CTA en cian bold: "El paso 4 dura 1 segundo. ¿Empezamos? 👇"
Logo "Taply" esquina superior izquierda, degradado.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior, brillante.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP, pago único.

Escribe el Paso 4 (último) del proceso de compra para un carrusel Instagram.
Paso: el cliente ya tiene su tarjeta, hace el primer tap y todo funciona al instante.
Captura la emoción del primer uso. CTA para empezar hoy.
Formato: máx 3 líneas + CTA. Solo el texto.`
      }
    ],
    caption: `⚡ Conseguí tu Taply en 4 pasos simples:

1️⃣ Nos escribís → elegís tu plan → pagás
2️⃣ En menos de 24h creamos tu perfil digital completo
3️⃣ Imprimimos tu tarjeta NFC personalizada
4️⃣ La recibís → la usás → los clientes te guardan al instante

El paso 4 dura literalmente 1 segundo. Sin fricción. Sin apps.

🔵 Essential: $100.000 COP
🟢 Custom: $130.000 COP

¿Cuándo empezamos? 👇 DM o link en bio.`,
    hashtags: '#TarjetaNFC #Taply #TaplyNFC #ComoFunciona #NFC #EmprendimientoColombia #MarketingDigital #NetworkingDigital #TarjetaDigital'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // C6 · NICHOS — 5 negocios que necesitan Taply
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'c6',
    codigo: 'C6',
    titulo: '5 negocios que NECESITAN una Taply (¿es el tuyo?)',
    subtitulo: 'Segmentación por nicho · Identificación directa',
    objetivo: 'Hacer que cada tipo de negocio se identifique y quiera su Taply',
    diaSemana: ['Jueves 12PM', 'Domingo 12PM'],
    slides: [
      {
        numero: 1,
        rol: 'PORTADA — Identificación',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Texto bold blanco grande: "5 negocios que"
Texto en degradado #00C2FF→#00FFAA bold enorme: "NECESITAN"
Texto bold blanco grande: "una Taply"
Subtexto gris: "¿Es el tuyo? Deslizá para descubrirlo 👉"
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP, pago único.

Escribe la PORTADA de un carrusel Instagram que lista 5 tipos de negocio que más necesitan Taply.
Hook: generar identificación inmediata. Curiosidad de "¿soy yo?"
Formato: Título con énfasis en "necesitan" + Subtítulo invitando a deslizar. Solo el texto.`
      },
      {
        numero: 2,
        rol: 'NICHO 1 — Salones de belleza y spas',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Número "1" en cian #00C2FF grande de fondo.
Ícono 💇 grande en cian centrado.
Título bold blanco: "Salones de belleza y spas"
Subtexto blanco: "Tus clientas salen felices — y con tu WhatsApp, Instagram y agenda de citas guardados en el celular."
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP.

Escribe la slide sobre por qué los salones de belleza y spas colombianos necesitan Taply NFC.
Dolor específico: clientas que no vuelven porque perdieron el contacto.
Con Taply: se van con todo guardado en el celular.
Máx 3 frases. Solo el texto.`
      },
      {
        numero: 3,
        rol: 'NICHO 2 — Restaurantes y cafés',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Número "2" en cian #00C2FF grande de fondo.
Ícono 🍽️ en cian centrado.
Título bold blanco: "Restaurantes, cafés y bares"
Subtexto blanco: "Menú digital, ubicación en Maps, WhatsApp para reservas e Instagram — en un solo toque."
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP.

Escribe la slide sobre por qué restaurantes, cafés y bares colombianos necesitan Taply NFC.
Beneficios: menú digital, Maps, WhatsApp para reservas. En un toque.
Máx 3 frases. Solo el texto.`
      },
      {
        numero: 4,
        rol: 'NICHO 3 — Agentes independientes',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Número "3" en cian #00C2FF grande de fondo.
Ícono 💼 en cian centrado.
Título bold blanco: "Agentes inmobiliarios, de seguros y freelancers"
Subtexto blanco: "Portafolio, LinkedIn, WhatsApp y certificaciones con un tap. La primera impresión que cierra negocios."
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP.

Escribe la slide sobre por qué agentes independientes colombianos (inmobiliarios, seguros, fotógrafos, freelancers) necesitan Taply NFC.
Argumento central: viven de la primera impresión y del contacto. Taply lo hace perfecto.
Máx 3 frases. Solo el texto.`
      },
      {
        numero: 5,
        rol: 'NICHO 4 — Profesionales de salud',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Número "4" en cian #00C2FF grande de fondo.
Ícono 🩺 en cian centrado.
Título bold blanco: "Médicos, psicólogos y nutricionistas"
Subtexto blanco: "Consulta, agenda, WhatsApp y Maps accesibles en un toque. Tus pacientes siempre te van a tener."
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP.

Escribe la slide sobre por qué profesionales de la salud colombianos (médicos, psicólogos, nutricionistas) necesitan Taply NFC.
Argumento: sus pacientes necesitan contactarlos fácilmente para citas, urgencias, seguimiento.
Máx 3 frases. Solo el texto.`
      },
      {
        numero: 6,
        rol: 'CTA — ¿Es tu negocio?',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Texto bold blanco grande centrado: "¿Tu negocio está en esta lista?"
Subtexto blanco: "Entonces ya sabés lo que necesitás."
Texto en degradado #00C2FF→#00FFAA bold grande: "Pedí tu Taply hoy 👇"
Precio blanco: "Desde $100.000 COP · Pago único"
Glow cian-verde de fondo sutil.
Logo "Taply" esquina superior izquierda, degradado.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior, brillante.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC desde $100.000 COP, pago único.

Escribe el CIERRE CTA del carrusel de 5 nichos. El lector ya se identificó con uno.
Invitación directa a escribir. Precio. Urgencia. Que sienta que ya no hay excusa.
Formato: máx 4 líneas + CTA. Solo el texto. Sin explicaciones.`
      }
    ],
    caption: `¿Tu negocio vive del contacto con clientes? Entonces esto es para vos. 👇

Con Taply NFC, tus clientes se van de tu negocio con todos tus datos guardados en el celular. Sin apps, sin QR, sin complicaciones.

🔵 Salones y spas · Restaurantes y cafés
🔵 Agentes inmobiliarios y freelancers
🔵 Médicos, psicólogos y profesionales independientes

💳 Desde $100.000 COP — pago único, sin mensualidades
💬 Cotizamos hoy — DM o link en bio 👇`,
    hashtags: '#TarjetaNFC #Taply #TaplyNFC #NegocioDigital #NFC #Colombia #EmprendimientoCO #MarketingDigital #SabanaNorte'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // C7 · B2B — Paquetes empresariales
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'c7',
    codigo: 'C7',
    titulo: 'Taply para tu equipo — Paquetes empresariales',
    subtitulo: 'B2B · Equipos · Descuentos por volumen',
    objetivo: 'Captar clientes empresariales que necesitan múltiples tarjetas para su equipo',
    diaSemana: ['Jueves 7PM', 'Domingo 7PM'],
    slides: [
      {
        numero: 1,
        rol: 'PORTADA — Escala empresarial',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Texto bold blanco centrado grande: "Taply para tu equipo."
Subtexto gris: "Digitaliza la imagen de toda tu empresa con un tap."
Grid sutil de íconos de tarjetas NFC en cian muy tenue de fondo (patrón decorativo).
Logo "Taply" esquina superior izquierda, degradado cian-verde.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas digitales NFC para equipos y empresas (B2B).

Escribe la PORTADA de un carrusel Instagram dirigido a empresas, gerentes y dueños de equipos de ventas.
Mensaje: Taply no es solo para individuos, es para equipos enteros.
Formato: Título (máx 8 palabras, profesional y aspiracional) + Subtítulo (1 frase). Solo el texto.`
      },
      {
        numero: 2,
        rol: 'PROBLEMA EMPRESA — El costo en volumen',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Texto bold blanco: "Tu equipo de ventas tiene 10 personas."
Cálculo visual en rojo suave #F87171:
"10 personas × $50.000 = $500.000"
"Solo en una reimpresión."
Texto en cian bold: "Hay una forma más inteligente."
Ícono de equipo o personas en cian.
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — tarjetas empresariales B2B.

Escribe la slide 2 mostrando el problema de costo de tarjetas de papel para un equipo colombiano.
Cálculo: 10 personas × $50.000 = $500.000 por reimpresión. Varias veces al año.
Que suene a dinero malgastado para la empresa. Máx 4 líneas. Solo el texto.`
      },
      {
        numero: 3,
        rol: 'SOLUCIÓN — Paquetes Taply para equipos',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Título bold blanco: "Paquetes Taply para equipos:"
Tres bloques con borde cian sutil:
🏢 PYME · 5-9 tarjetas → $115.000/u
🏬 CORPORATIVO · 10-24 → $100.000/u
🏭 ENTERPRISE · 25+ → $85.000/u
Precio más bajo destacado en verde #00FFAA: "$85.000/u"
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — paquetes empresariales:
PYME: 5-9 tarjetas a $115.000/u | CORPORATIVO: 10-24 a $100.000/u | ENTERPRISE: 25+ a $85.000/u

Escribe la slide 3 que presenta los paquetes empresariales de Taply.
Claro, directo, con los precios. Que quien tenga equipo vea el ahorro.
Máx 5 líneas. Solo el texto con los paquetes y precios.`
      },
      {
        numero: 4,
        rol: 'QUÉ INCLUYE cada tarjeta',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Título bold blanco: "Cada tarjeta del paquete incluye:"
Lista con checks en verde #00FFAA:
✓ Perfil digital individual
✓ Diseño con identidad de la empresa
✓ Foto y cargo de cada miembro
✓ Links: WhatsApp, email, LinkedIn
✓ 6 meses de soporte incluido
Logo "Taply" esquina superior izquierda.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior.`,
        textoPrompt: `Taply NFC Colombia — paquetes empresariales, pago único.

Escribe la lista de lo que incluye cada tarjeta Taply en un paquete empresarial.
Énfasis en: personalización individual, identidad de la empresa, links clave, soporte.
Formato: Título corto + 5 ítems con ✓. Cada ítem máx 5 palabras. Solo la lista.`
      },
      {
        numero: 5,
        rol: 'CTA — Cotización empresarial',
        imagenPrompt: `${BRAND}

Genera una imagen 1080×1080px con fondo negro #000000.
Texto bold blanco grande centrado: "¿Tu empresa lista para el siguiente nivel?"
Subtexto blanco: "Cotización personalizada en menos de 24h."
Texto en cian #00C2FF bold: "📩 Escríbenos al DM"
Precio verde #00FFAA bold: "Desde $85.000/u para equipos de 25+"
Glow cian-verde de fondo sutil, elegante.
Logo "Taply" esquina superior izquierda, degradado.
Línea degradada #00C2FF→#00FFAA de 4px al fondo inferior, brillante.`,
        textoPrompt: `Taply NFC Colombia — paquetes empresariales desde $85.000/u para 25+ tarjetas.

Escribe el CIERRE CTA empresarial para la slide 5 de 5.
Dirigido a gerentes o responsables de equipos. Cotización en menos de 24h. Precio por volumen.
Tono profesional, aspiracional, que sienta que es una inversión inteligente para la empresa.
Formato: máx 4 líneas. Solo el texto.`
      }
    ],
    caption: `🏢 ¿Tenés un equipo de ventas, inmobiliaria o consultora?

Con Taply para Equipos, cada miembro tiene su propia tarjeta NFC con su perfil, foto, cargo y contacto — con la identidad visual de tu empresa.

📦 Paquetes empresariales:
• 5-9 tarjetas → $115.000/u
• 10-24 tarjetas → $100.000/u
• 25+ tarjetas → $85.000/u

✅ Imagen profesional unificada
✅ Cotización en menos de 24h
✅ Pago único por tarjeta — sin costos recurrentes

Un equipo con Taply no reparte papeles — deja huella digital. 🤝
¿Cuántas tarjetas necesitás? DM o link en bio 👇`,
    hashtags: '#EmpresaDigital #TarjetaNFC #Taply #TaplyNFC #B2B #EquipoVentas #NFC #Colombia #Pyme #CorporativoDigital'
  }
]

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

// 7 patrones semanales — rotan infinitamente por número de semana ISO
const PATRONES_SEMANALES: Array<[number, number][]> = [
  [[0,1],[2,3],[4,4],[5,6],[1,3],[2,4],[5,6]],  // Patrón A
  [[1,0],[3,2],[4,4],[6,5],[3,1],[4,2],[6,5]],  // Patrón B
  [[3,0],[1,2],[5,4],[0,6],[4,3],[2,5],[6,1]],  // Patrón C
  [[2,0],[4,1],[3,5],[6,0],[2,4],[1,3],[5,6]],  // Patrón D
  [[6,0],[5,2],[1,3],[4,2],[0,6],[3,5],[2,4]],  // Patrón E
  [[5,1],[0,4],[2,6],[3,1],[5,0],[4,2],[6,3]],  // Patrón F
  [[4,2],[6,0],[1,5],[2,4],[3,6],[0,1],[5,3]],  // Patrón G
]

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function getWeekStart(weekOffset: number): Date {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = (day === 0 ? -6 : 1 - day)
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday + weekOffset * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
}

export default function ContenidoPage() {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<'calendario' | 'carruseles'>('carruseles')
  const [activeCarrusel, setActiveCarrusel] = useState(0)
  const [expandedSlide, setExpandedSlide] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)

  const semanaActual = useMemo(() => {
    const weekStart = getWeekStart(weekOffset)
    const weekNum = getWeekNumber(weekStart)
    const patronIdx = (weekNum - 1) % PATRONES_SEMANALES.length
    const patron = PATRONES_SEMANALES[patronIdx]
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return DIAS.map((dia, i) => {
      const fecha = new Date(weekStart)
      fecha.setDate(weekStart.getDate() + i)
      const [amIdx, pmIdx] = patron[i]
      const esHoy = weekOffset === 0 && fecha.getTime() === today.getTime()
      return { dia, fecha, amIdx, pmIdx, am: CARRUSELES[amIdx], pm: CARRUSELES[pmIdx], esHoy }
    })
  }, [weekOffset])

  const weekStart = getWeekStart(weekOffset)
  const weekNum = getWeekNumber(weekStart)
  const patronLetra = String.fromCharCode(65 + ((weekNum - 1) % PATRONES_SEMANALES.length))

  function copiar(texto: string, id: string) {
    navigator.clipboard.writeText(texto)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const carrusel = CARRUSELES[activeCarrusel]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ENCABEZADO */}
      <div>
        <h1 style={{ margin: 0, fontSize: isMobile ? '24px' : '32px', fontWeight: 900 }} className="taply-gradient-text">
          Contenido Instagram
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
          7 carruseles · 2 publicaciones diarias · Prompts para Gemini · Imágenes 1:1 · Venta orgánica Taply
        </p>
      </div>

      {/* GUÍA DE MARCA */}
      <div style={{ borderRadius: '14px', background: 'linear-gradient(135deg, #00C2FF08, #00FFAA08)', border: '1px solid #00C2FF22', padding: '14px 16px' }}>
        <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 800, color: '#00C2FF', textTransform: 'uppercase', letterSpacing: '0.07em' }}>🎨 Identidad de marca Taply</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: 'Fondo', color: '#000000', bg: '#000000', border: '#333' },
            { label: 'Cian', color: '#00C2FF', bg: '#00C2FF20', border: '#00C2FF44' },
            { label: 'Verde Menta', color: '#00FFAA', bg: '#00FFAA20', border: '#00FFAA44' },
          ].map(c => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', backgroundColor: c.bg, border: `1px solid ${c.border}` }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: c.color, border: '1px solid #ffffff22' }} />
              <span style={{ fontSize: '11px', color: c.color, fontWeight: 700 }}>{c.label}</span>
              <span style={{ fontSize: '10px', color: '#6b7280' }}>{c.color}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: 'linear-gradient(90deg,#00C2FF22,#00FFAA22)', border: '1px solid #00C2FF22' }}>
            <div style={{ width: '36px', height: '10px', borderRadius: '5px', background: 'linear-gradient(90deg,#00C2FF,#00FFAA)' }} />
            <span style={{ fontSize: '11px', color: '#f0f0f0', fontWeight: 700 }}>Degradado</span>
          </div>
        </div>
        <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#6b7280', lineHeight: '1.6' }}>
          Todas las imágenes: <strong style={{ color: '#9ca3af' }}>1080×1080px</strong> · Fondo negro · Logo Taply esquina sup. izq. · Tipografía Montserrat ExtraBold
        </p>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '8px', padding: '4px', borderRadius: '12px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
        <button onClick={() => setActiveTab('carruseles')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 8px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none', backgroundColor: activeTab === 'carruseles' ? '#00cfff0d' : 'transparent', color: activeTab === 'carruseles' ? '#00cfff' : '#6b7280', outline: activeTab === 'carruseles' ? '1px solid #00cfff22' : 'none' }}>
          <Layers size={14} /> Carruseles
        </button>
        <button onClick={() => setActiveTab('calendario')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 8px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none', backgroundColor: activeTab === 'calendario' ? '#00cfff0d' : 'transparent', color: activeTab === 'calendario' ? '#00cfff' : '#6b7280', outline: activeTab === 'calendario' ? '1px solid #00cfff22' : 'none' }}>
          <Calendar size={14} /> Calendario Semanal
        </button>
      </div>

      {/* ── TAB CARRUSELES ── */}
      {activeTab === 'carruseles' && (
        <>
          {/* Selector de carrusel */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {CARRUSELES.map((c, i) => (
              <button key={c.id} onClick={() => { setActiveCarrusel(i); setExpandedSlide(null) }} style={{ padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: '1px solid', transition: 'all .15s', borderColor: activeCarrusel === i ? '#00cfff' : '#1f1f1f', backgroundColor: activeCarrusel === i ? '#00cfff14' : '#161616', color: activeCarrusel === i ? '#00cfff' : '#6b7280' }}>
                {c.codigo}
              </button>
            ))}
          </div>

          {/* Card del carrusel activo */}
          <div style={{ borderRadius: '16px', backgroundColor: '#161616', border: '1px solid #00cfff22', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <span style={{ padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, background: 'linear-gradient(90deg,#00cfff,#00ff94)', color: '#0d0d0d' }}>{carrusel.codigo}</span>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>{carrusel.slides.length} slides · imágenes 1080×1080px</span>
                </div>
                <h2 style={{ margin: 0, fontSize: isMobile ? '16px' : '18px', fontWeight: 800, color: '#f0f0f0', lineHeight: '1.3' }}>{carrusel.titulo}</h2>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>{carrusel.subtitulo}</p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {carrusel.diaSemana.map((d, i) => (
                  <span key={i} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, backgroundColor: i === 0 ? '#00cfff0d' : '#00ff940d', border: `1px solid ${i === 0 ? '#00cfff22' : '#00ff9422'}`, color: i === 0 ? '#00cfff' : '#00ff94' }}>
                    {i === 0 ? '🌅' : '🌙'} {d}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎯 Objetivo · </span>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>{carrusel.objetivo}</span>
            </div>
          </div>

          {/* Slides acordeón */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {carrusel.slides.map((slide) => {
              const slideId = `${carrusel.id}-${slide.numero}`
              const isOpen = expandedSlide === slideId
              const imagenCopied = copiedId === `${slideId}-imagen`
              const textoCopied = copiedId === `${slideId}-texto`
              return (
                <div key={slideId} style={{ borderRadius: '14px', backgroundColor: '#161616', border: `1px solid ${isOpen ? '#00cfff33' : '#1f1f1f'}`, overflow: 'hidden' }}>
                  <button onClick={() => setExpandedSlide(isOpen ? null : slideId)} style={{ width: '100%', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'transparent', border: 'none', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ minWidth: '28px', height: '28px', borderRadius: '8px', background: isOpen ? 'linear-gradient(135deg,#00cfff,#00ff94)' : '#0d0d0d', border: `1px solid ${isOpen ? 'transparent' : '#2a2a2a'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: isOpen ? '#0d0d0d' : '#6b7280' }}>{slide.numero}</span>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: isOpen ? '#00cfff' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{slide.rol}</p>
                    </div>
                    {isOpen ? <ChevronUp size={15} style={{ color: '#00cfff' }} /> : <ChevronDown size={15} style={{ color: '#4b5563' }} />}
                  </button>

                  {isOpen && (
                    <div style={{ borderTop: '1px solid #00cfff22', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                      {/* Prompt Imagen Gemini */}
                      <div style={{ borderRadius: '12px', backgroundColor: '#0d0d0d', border: '1px solid #a78bfa33', padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ImageIcon size={13} style={{ color: '#a78bfa' }} />
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gemini · Prompt Imagen (1080×1080px)</span>
                          </div>
                          <button onClick={() => copiar(slide.imagenPrompt, `${slideId}-imagen`)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', backgroundColor: imagenCopied ? '#00ff940d' : '#a78bfa12', border: `1px solid ${imagenCopied ? '#00ff9433' : '#a78bfa33'}`, color: imagenCopied ? '#00ff94' : '#a78bfa' }}>
                            {imagenCopied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
                          </button>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#d1d5db', lineHeight: '1.75', whiteSpace: 'pre-wrap' }}>{slide.imagenPrompt}</p>
                      </div>

                      {/* Prompt Texto Gemini */}
                      <div style={{ borderRadius: '12px', backgroundColor: '#0d0d0d', border: '1px solid #00cfff22', padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <BookOpen size={13} style={{ color: '#00cfff' }} />
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#00cfff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gemini · Prompt Texto / Copy</span>
                          </div>
                          <button onClick={() => copiar(slide.textoPrompt, `${slideId}-texto`)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', backgroundColor: textoCopied ? '#00ff940d' : '#00cfff0d', border: `1px solid ${textoCopied ? '#00ff9433' : '#00cfff22'}`, color: textoCopied ? '#00ff94' : '#00cfff' }}>
                            {textoCopied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
                          </button>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#d1d5db', lineHeight: '1.75', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{slide.textoPrompt}</p>
                      </div>

                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Caption */}
          <div style={{ borderRadius: '16px', backgroundColor: '#161616', border: '1px solid #1f1f1f', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#f0f0f0' }}>✍️ Caption para Instagram</span>
              <button onClick={() => copiar(`${carrusel.caption}\n\n${carrusel.hashtags}`, `${carrusel.id}-caption`)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', backgroundColor: copiedId === `${carrusel.id}-caption` ? '#00ff940d' : '#00cfff0d', border: `1px solid ${copiedId === `${carrusel.id}-caption` ? '#00ff9433' : '#00cfff22'}`, color: copiedId === `${carrusel.id}-caption` ? '#00ff94' : '#00cfff' }}>
                {copiedId === `${carrusel.id}-caption` ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar todo</>}
              </button>
            </div>
            <pre style={{ margin: 0, fontSize: '12.5px', color: '#e5e7eb', lineHeight: '1.75', whiteSpace: 'pre-wrap', fontFamily: 'inherit', backgroundColor: '#0d0d0d', borderRadius: '10px', padding: '14px', border: '1px solid #1f1f1f' }}>{carrusel.caption}</pre>
            <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#00cfff', opacity: 0.8, lineHeight: '1.6' }}>{carrusel.hashtags}</p>
          </div>
        </>
      )}

      {/* ── TAB CALENDARIO ── */}
      {activeTab === 'calendario' && (
        <>
          {/* Navegador de semana */}
          <div style={{ borderRadius: '16px', backgroundColor: '#161616', border: '1px solid #00cfff22', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <button onClick={() => setWeekOffset(w => w - 1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '10px', border: '1px solid #2a2a2a', backgroundColor: '#0d0d0d', cursor: 'pointer', color: '#9ca3af' }}>
              <ChevronLeft size={16} />
            </button>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#f0f0f0' }}>
                {weekOffset === 0 ? '📅 Esta semana' : weekOffset === 1 ? '📅 Próxima semana' : weekOffset === -1 ? '📅 Semana pasada' : `📅 Semana ${weekOffset > 0 ? `+${weekOffset}` : weekOffset}`}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                Semana {weekNum} · Patrón {patronLetra} · {weekStart.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} – {new Date(weekStart.getTime() + 6 * 86400000).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <button onClick={() => setWeekOffset(w => w + 1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '10px', border: '1px solid #2a2a2a', backgroundColor: '#0d0d0d', cursor: 'pointer', color: '#9ca3af' }}>
              <ChevronRight size={16} />
            </button>
          </div>

          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} style={{ alignSelf: 'center', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid #00cfff33', backgroundColor: '#00cfff0d', color: '#00cfff' }}>
              Volver a esta semana
            </button>
          )}

          {/* Días */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {semanaActual.map((fila, i) => (
              <div key={i} style={{ borderRadius: '14px', backgroundColor: '#161616', border: `1px solid ${fila.esHoy ? '#00cfff44' : '#1f1f1f'}`, padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: isMobile ? 'wrap' : 'nowrap', position: 'relative', overflow: 'hidden' }}>
                {fila.esHoy && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#00C2FF,#00FFAA)' }} />}
                <div style={{ minWidth: '80px', paddingTop: '2px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: fila.esHoy ? '#00C2FF' : '#e5e7eb' }}>{fila.dia}</div>
                  <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '1px' }}>
                    {fila.fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                  </div>
                  {fila.esHoy && <div style={{ fontSize: '9px', fontWeight: 700, color: '#00C2FF', marginTop: '3px', letterSpacing: '0.05em' }}>HOY</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <button
                    onClick={() => { setActiveCarrusel(fila.amIdx); setActiveTab('carruseles'); setExpandedSlide(null) }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '10px', backgroundColor: '#00C2FF08', border: '1px solid #00C2FF1a', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                  >
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', minWidth: '52px', flexShrink: 0 }}>🌅 12 PM</span>
                    <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800, background: 'linear-gradient(90deg,#00C2FF,#00FFAA)', color: '#0d0d0d', flexShrink: 0 }}>{fila.am.codigo}</span>
                    <span style={{ fontSize: '11px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fila.am.titulo}</span>
                  </button>
                  <button
                    onClick={() => { setActiveCarrusel(fila.pmIdx); setActiveTab('carruseles'); setExpandedSlide(null) }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '10px', backgroundColor: '#00FFAA08', border: '1px solid #00FFAA1a', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                  >
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', minWidth: '52px', flexShrink: 0 }}>🌙 7 PM</span>
                    <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800, background: 'linear-gradient(90deg,#00FFAA,#00C2FF)', color: '#0d0d0d', flexShrink: 0 }}>{fila.pm.codigo}</span>
                    <span style={{ fontSize: '11px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fila.pm.titulo}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderRadius: '14px', backgroundColor: '#161616', border: '1px solid #fbbf2422', padding: '14px 16px' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#fbbf24', marginBottom: '6px' }}>♾️ Rotación automática infinita</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', lineHeight: '1.7' }}>
              7 patrones distintos (A–G) rotan cada semana según el número de semana del año. Nunca se repite el mismo orden. Tocá cualquier carrusel del calendario para ver sus prompts de Gemini al instante.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
