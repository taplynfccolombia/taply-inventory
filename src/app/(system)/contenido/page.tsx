'use client'

import { useState } from 'react'
import { useIsMobile } from '@/lib/hooks'
import { Copy, Check, ChevronDown, ChevronUp, Calendar, Layers, Image as ImageIcon, BookOpen } from 'lucide-react'

interface Slide {
  numero: number
  rol: string
  canvaPrompt: string
  geminiPrompt: string
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

const CARRUSELES: Carousel[] = [
  {
    id: 'c1',
    codigo: 'C1',
    titulo: '¿Sigues repartiendo tarjetas de papel?',
    subtitulo: 'Hook de problema · Venta directa',
    objetivo: 'Crear conciencia del problema y posicionar Taply como solución inmediata',
    diaSemana: ['Lunes (12PM)', 'Jueves (7PM)'],
    slides: [
      {
        numero: 1,
        rol: 'PORTADA — Hook',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro puro (#000000). Texto principal centrado en blanco bold (Montserrat ExtraBold): "¿Sigues repartiendo tarjetas de papel en 2026?" — letra grande, ocupa 70% del ancho. Debajo en gris claro (#9CA3AF): "Hay una forma más inteligente de presentarte." Línea degradada horizontal al fondo inferior: de cian (#00C2FF) a verde menta (#00FFAA), 4px de grosor. Esquina superior izquierda: logo Taply (adjunto), tamaño aprox 80px de ancho.',
        geminiPrompt: 'Crea el texto para la portada de un carrusel de Instagram. El negocio es Taply NFC Colombia — vendemos tarjetas de presentación digitales NFC hechas a mano, desde $100.000 COP, pago único. El hook debe generar curiosidad e identificar el dolor del emprendedor colombiano que todavía usa tarjetas de papel. Máximo 12 palabras para el título. Tono directo, moderno, sin clichés. Solo devuelve el título y el subtítulo, sin explicaciones.'
      },
      {
        numero: 2,
        rol: 'PROBLEMA — El dolor real',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Ícono de papelera o tarjeta rota en rojo suave (#F87171). Texto bold blanco: "Las tarjetas de papel se pierden, se dañan y quedan desactualizadas." Subtexto en gris: "Cada vez que cambias tu número o redes, son dinero botado." Franja degradada cian-verde al pie (#00C2FF → #00FFAA, 4px). Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe el texto para la diapositiva 2 de un carrusel de Instagram de Taply NFC Colombia. Esta slide muestra el PROBLEMA: las tarjetas de papel físicas son ineficientes, se pierden, se desactualizan y cuestan dinero recurrente. El público es emprendedor colombiano. Usa lenguaje coloquial colombiano. Máximo 2 frases cortas. Solo el texto, sin explicaciones.'
      },
      {
        numero: 3,
        rol: 'SOLUCIÓN — Presentar Taply',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Centro: imagen o ícono de tarjeta NFC negra con efecto de brillo/glow cian radiante. Texto bold blanco: "Taply NFC — tu tarjeta digital hecha a mano." Subtexto: "Un toque. Tu perfil completo. Siempre actualizado." Palabras "Un toque" en degradado cian-verde (#00C2FF → #00FFAA). Franja degradada al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe el texto para la slide 3 de un carrusel de Taply NFC Colombia. Esta slide presenta LA SOLUCIÓN: la tarjeta NFC digital hecha a mano. Debe hacer sentir al lector que descubrió algo que no sabía que necesitaba. Destacar: un toque basta, funciona con cualquier celular, sin apps. Máximo 2 frases. Solo el texto, sin explicaciones.'
      },
      {
        numero: 4,
        rol: 'BENEFICIOS — Qué comparte',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Título bold blanco: "Con Taply compartes todo:" Lista vertical con iconos en cian: 📞 Teléfono y WhatsApp / 🌐 Web y redes sociales / 📍 Ubicación / 🎥 Videos y portafolio / ⭐ Reseñas de Google. Franja degradada al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe el texto para la slide 4 de un carrusel de Taply NFC Colombia. Lista breve y poderosa de 5 ítems de lo que puede compartir el usuario. Cada ítem máximo 4 palabras. Empieza cada línea con un emoji relevante. Solo la lista, sin título ni explicaciones.'
      },
      {
        numero: 5,
        rol: 'PRECIO + CTA — Cierre de venta',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Texto centrado bold blanco muy grande: "Desde $100.000 COP — Pago único." Subtexto: "Sin mensualidades. Sin papel. Para siempre actualizado." Texto accent en degradado cian-verde bold: "Escríbenos hoy 👇" Franja degradada al pie muy vibrante. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe el texto de cierre para la última slide de un carrusel de ventas de Taply NFC Colombia. Debe incluir el precio ($100.000 COP pago único), una propuesta de valor irresistible y un llamado a la acción claro para que el cliente escriba por DM o WhatsApp. Tono urgente pero no agresivo. Máximo 3 líneas. Solo el texto, sin explicaciones.'
      }
    ],
    caption: `¿Cuánto llevas gastando en tarjetas de papel que nadie guarda? 😅

Con Taply NFC, un solo toque comparte todo tu perfil profesional — redes, WhatsApp, ubicación, portafolio y más. Sin que la otra persona instale nada.

✅ Siempre actualizado
✅ Funciona con iPhone y Android
✅ Pago único desde $100.000 COP

👇 Escríbenos por DM o al link de bio y te cotizamos hoy mismo.`,
    hashtags: '#TarjetaNFC #NFC #TarjetaDigital #EmprendedoresColombia #NetworkingDigital #Taply #MarketingDigital #Colombia #Bogotá #EmprendimientoCO #TaplyNFC'
  },
  {
    id: 'c2',
    codigo: 'C2',
    titulo: 'Tu negocio merece una primera impresión que no se borre',
    subtitulo: 'Identidad de negocio · Profesionalismo',
    objetivo: 'Conectar con dueños de negocio físico que quieren proyectar imagen profesional',
    diaSemana: ['Lunes (7PM)', 'Viernes (12PM)'],
    slides: [
      {
        numero: 1,
        rol: 'PORTADA — Hook negocio',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Texto principal bold blanco centrado: "Tu negocio merece una primera impresión que no se borre." Subtexto gris: "La tarjeta de presentación del futuro ya existe." Franja degradada cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Crea el texto de portada para un carrusel Instagram de Taply NFC Colombia dirigido a dueños de negocio físico (tiendas, salones, restaurantes, consultorios) en Colombia. Máximo 10 palabras para el título. Subtítulo de 1 frase. Tono aspiracional y directo. Solo texto, sin explicaciones.'
      },
      {
        numero: 2,
        rol: 'ESCENARIO — El cliente que se va',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Texto bold blanco: "Imagina esto:" seguido en blanco regular: "Alguien entra a tu negocio. Le das tu tarjeta. Llega a casa y la tira a la basura." Debajo en rojo suave (#F87171): "Eso no pasa con Taply." Franja cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe el texto para la slide 2 de un carrusel de Taply NFC Colombia. Cuenta un micro-escenario cotidiano: alguien entra al negocio, intercambian tarjeta, y esa tarjeta termina perdida. 3 frases cortas estilo guión. Termina con "Eso no pasa con Taply." Solo el texto.'
      },
      {
        numero: 3,
        rol: 'PROCESO — Cómo funciona',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Tres pasos en columna: 1️⃣ "Acercas tu Taply al celular del cliente" | 2️⃣ "Abre automáticamente tu perfil digital" | 3️⃣ "Guarda tus datos con un toque" — número en cian bold, texto en blanco. Franja cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe los 3 pasos de cómo funciona Taply NFC para la slide 3. Cada paso máximo 7 palabras. Sin tecnicismos. Usa emojis de números (1️⃣2️⃣3️⃣). Solo los 3 pasos, sin título ni explicaciones.'
      },
      {
        numero: 4,
        rol: 'CASOS DE USO — Para qué negocio',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Título blanco bold: "Perfecta para cualquier negocio:" Grid 2x3: 🍽️ Restaurantes · 💇 Salones de belleza · 🏋️ Gimnasios · 🏠 Inmobiliarias · 📸 Fotógrafos · 💼 Consultores. Iconos en cian, texto blanco. Franja cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Lista 6 tipos de negocio colombiano que más se benefician de una tarjeta NFC. Cada uno con emoji relevante y máximo 2 palabras. Formato de lista simple. Solo el título corto y la lista.'
      },
      {
        numero: 5,
        rol: 'CTA — Invitación directa',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Texto bold blanco grande: "Dale a tu negocio la imagen que merece." Subtexto: "Tarjeta Taply NFC — Desde $100.000 COP · Pago único" Texto accent en degradado cian-verde bold: "¿Tu negocio ya tiene Taply? 👇" Franja degradada al pie vibrante. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe el cierre con llamado a la acción para la última slide, dirigido a dueños de negocio. Menciona el precio ($100.000 COP pago único), invita al DM. Máximo 3 líneas. Solo el texto.'
      }
    ],
    caption: `Tu negocio tiene 3 segundos para causar la primera impresión. ⚡

Con Taply NFC, cada vez que alguien acerca su celular recibe toda tu información al instante: redes, WhatsApp, web, portafolio, ubicación y más.

💡 Sin apps. Sin QR. Sin complicaciones.
💳 Funciona con iPhone y Android
📍 Entregas en Cajicá, Chía, Zipaquirá y toda la Sabana Norte

👇 Pide tu Taply hoy — link en bio.`,
    hashtags: '#NegocioDigital #TarjetaNFC #Taply #MarketingLocal #EmprendimientoColombia #SabanaNorte #Cajicá #Chía #NFC #TarjetaDeVisita'
  },
  {
    id: 'c3',
    codigo: 'C3',
    titulo: 'Así fue como Bella Pieza pasó del papel a lo digital',
    subtitulo: 'Testimonio real · Cajicá · Prueba social',
    objetivo: 'Generar confianza con historia de cliente real',
    diaSemana: ['Martes (12PM)', 'Sábado (12PM)'],
    slides: [
      {
        numero: 1,
        rol: 'PORTADA — Testimonio',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Texto centrado grande bold blanco: "Así fue como Bella Pieza, Cajicá pasó del papel a lo digital." Comillas tipográficas grandes en cian (#00C2FF) semitransparente de fondo. Franja degradada cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe la portada de un carrusel testimonio para Instagram de Taply NFC Colombia. El cliente es "Bella Pieza", salón de belleza en Cajicá. El título debe intrigar. Máximo 12 palabras. Solo el título, sin explicaciones.'
      },
      {
        numero: 2,
        rol: 'ANTES — El problema del cliente',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Etiqueta "ANTES" en rojo suave (#F87171) esquina superior derecha. Texto italic blanco con comillas: "Teníamos tarjetas impresas, pero los clientes las perdían o quedaban desactualizadas cada vez que cambiábamos algo." — Bella Pieza, Cajicá. Borde izquierdo de 3px en cian. Franja cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe una cita testimonio real en primera persona del "ANTES" para Taply NFC Colombia. Cliente: Bella Pieza, salón en Cajicá. El problema: tarjetas de papel se perdían y quedaban desactualizadas. Voz del dueño del negocio, colombiano, natural. Máximo 2 frases. Solo la cita.'
      },
      {
        numero: 3,
        rol: 'EL CAMBIO — Llegó Taply',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Flecha de transformación en cian. Texto bold blanco: "Luego llegó Taply." Subtexto: "Creamos el perfil digital de Bella Pieza en menos de 24 horas. Con fotos, servicios, WhatsApp, Instagram y ubicación en Google Maps." Franja cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe el texto "El cambio" de un carrusel testimonio de Taply NFC Colombia. Bella Pieza (salón en Cajicá) empezó a usar Taply: proceso simple, rápido (menos de 24h). Máximo 3 frases. Solo el texto.'
      },
      {
        numero: 4,
        rol: 'DESPUÉS — El resultado',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Etiqueta "DESPUÉS" en verde menta (#00FFAA) esquina superior derecha. Texto italic blanco con comillas: "Ahora los clientes se van con todos nuestros datos en el celular. Nos han llegado citas de gente que la clienta anterior les pasó el perfil." — Bella Pieza. Borde izquierdo 3px en verde. Franja cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe la cita del "después" en primera persona para carrusel testimonio de Taply NFC Colombia. Cliente: Bella Pieza, Cajicá. Resultado: clientes se van con info guardada, perfil se comparte entre clientes, llegaron nuevas citas. Natural, colombiano, emocional. Máximo 3 frases. Solo la cita.'
      },
      {
        numero: 5,
        rol: 'CTA — ¿Será el próximo?',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Texto bold blanco grande: "¿Tu negocio podría ser la próxima historia de éxito?" Subtexto: "Tarjeta Taply NFC desde $100.000 COP · Pago único" Texto accent en degradado cian-verde bold: "Escríbenos 👇" Franja degradada al pie muy vibrante. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe el cierre CTA para la última slide de un carrusel testimonio de Taply NFC Colombia. Invitar al lector a ser el próximo cliente. Precio ($100.000 COP pago único). CTA para escribir por DM. Máximo 3 líneas. Solo el texto.'
      }
    ],
    caption: `📖 Historia real — Bella Pieza, Cajicá

Antes: tarjetas de papel que se perdían, quedaban desactualizadas y terminaban en la basura.

Hoy: cada cliente se va con el perfil completo en su celular. Y ese perfil se sigue compartiendo solo entre clientes. 🔄

💳 Un toque. Todo tu negocio.
💰 Desde $100.000 COP — sin mensualidades

¿Tu negocio podría ser la próxima historia? DM o link en bio 👇`,
    hashtags: '#Testimonio #TarjetaNFC #Taply #Cajicá #SabanaNorte #NegocioDigital #EmprendimientoColombia #ClientesFelices #NFC'
  },
  {
    id: 'c4',
    codigo: 'C4',
    titulo: 'La matemática habla sola: Taply vs tarjetas de papel',
    subtitulo: 'Comparativa de costos · Objeción de precio',
    objetivo: 'Destruir la objeción de precio mostrando que Taply es más barata a largo plazo',
    diaSemana: ['Martes (7PM)', 'Viernes (7PM)'],
    slides: [
      {
        numero: 1,
        rol: 'PORTADA — Provocación de precio',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Texto bold blanco centrado grande: "¿Cuánto llevas gastando en tarjetas que nadie guarda?" Subtexto gris: "Hicimos las cuentas. El resultado te va a sorprender." Franja degradada cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe la portada para un carrusel Instagram que demuestra que las tarjetas de papel son más caras que una Taply NFC. El hook debe hacer que el dueño de negocio sienta curiosidad sobre cuánto ha "desperdiciado". Máximo 10 palabras título + 1 frase subtítulo. Solo el texto.'
      },
      {
        numero: 2,
        rol: 'COSTO PAPEL — El problema acumulado',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Título "Tarjeta de papel:" en rojo (#F87171) bold. Cálculo visual: "$50.000 × 100 tarjetas" → "3 veces al año" → "$150.000 – $300.000/año" en blanco bold. Texto final en rojo suave: "Y cuando cambias datos, vuelta a empezar." Franja cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe el texto que muestra el costo real anual de las tarjetas de papel para un negocio colombiano. Usa números: $50.000 por 100 tarjetas, se reimprimen 3-4 veces al año. Hazlo sentir como "dinero botado". Máximo 4 líneas con el cálculo. Solo el texto con los números.'
      },
      {
        numero: 3,
        rol: 'COSTO TAPLY — La solución inteligente',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Título "Taply NFC:" en verde menta (#00FFAA) bold. Texto blanco bold: "$100.000 — una sola vez." Lista verde: ✅ Sin reimpresiones / ✅ Sin papel / ✅ Actualizable siempre / ✅ Para siempre. Texto final verde bold: "Costo adicional: $0" Franja cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe el texto que muestra que Taply NFC cuesta $100.000 una sola vez. Hazlo sentir como la decisión obvia. Lista de 4 ventajas máximo 3 palabras cada una. Termina con "Costo adicional: $0". Solo el texto.'
      },
      {
        numero: 4,
        rol: 'COMPARATIVA VISUAL',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Tabla 2 columnas: "Papel" (borde rojo) | "Taply" (borde cian). Filas: Se pierde ❌ / Siempre en el celular ✅ | Se desactualiza ❌ / Editable en tiempo real ✅ | Costo recurrente ❌ / Pago único ✅ | No tiene links ❌ / WhatsApp, Maps, web ✅. Franja cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe una tabla comparativa de 4 filas para carrusel Instagram de Taply NFC Colombia. Columna izquierda: tarjeta de papel (desventajas con ❌). Columna derecha: Taply NFC (ventajas con ✅). Cada punto máximo 4 palabras. Solo la tabla en formato simple.'
      },
      {
        numero: 5,
        rol: 'CTA — El veredicto',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Texto bold blanco grande: "La matemática es clara." Subtexto: "Taply NFC es más barata, más útil y más profesional que cualquier tarjeta de papel." Texto cian bold: "Hacé el cambio hoy 👇" Precio verde bold: "Desde $100.000 COP · Pago único" Franja degradada al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe el cierre de ventas de un carrusel comparativo donde se demostró que las tarjetas de papel son más costosas. El veredicto debe ser contundente. Precio: $100.000 COP pago único. Máximo 4 líneas. Solo el texto.'
      }
    ],
    caption: `⚔️ Taply NFC vs. Tarjeta de papel:

📄 Papel: ❌ Se pierde · ❌ Se desactualiza · ❌ Costo cada vez
💳 Taply: ✅ En el celular siempre · ✅ Editable · ✅ Pago único

La matemática: 100 tarjetas × 3 veces al año = $300.000+
Taply: $100.000 UNA sola vez.

¿Seguís eligiendo papel? 🤔 DM o link en bio 👇`,
    hashtags: '#TarjetaNFC #Taply #VsPapel #MarketingDigital #EmprendimientoColombia #NFC #InversionInteligente #TarjetaDigital'
  },
  {
    id: 'c5',
    codigo: 'C5',
    titulo: 'Conseguí tu Taply en 4 pasos simples',
    subtitulo: 'Tutorial de compra · Reducción de fricción',
    objetivo: 'Eliminar el miedo a comprar explicando el proceso completo de forma simple',
    diaSemana: ['Miércoles (12PM)', 'Sábado (7PM)'],
    slides: [
      {
        numero: 1,
        rol: 'PORTADA — Proceso simple',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Número "4" en cian muy grande semitransparente de fondo. Encima: texto bold blanco: "¿Cómo conseguís tu Taply?" Subtexto gris: "Más fácil de lo que imaginás." Franja degradada cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Crea la portada para un carrusel de Instagram de Taply NFC Colombia que explica el proceso de compra en 4 pasos. Objetivo: reducir el miedo a comprar. Título máximo 8 palabras, subtítulo 1 frase. Solo el texto.'
      },
      {
        numero: 2,
        rol: 'PASO 1 — Escribir y pedir',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Número "1" en cian grande semitransparente fondo. Título bold blanco: "Nos escribís y elegís tu plan." Subtexto: "Por DM en Instagram o WhatsApp. Essential ($100.000) o Custom ($130.000)." Indicador ●○○○ en cian. Franja cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe el texto para el Paso 1 del proceso de compra de Taply NFC Colombia: el cliente escribe por Instagram DM o WhatsApp, elige su plan (Essential $100.000 o Custom $130.000) y paga. Simple y sin complicaciones. Máximo 2-3 frases. Solo el texto.'
      },
      {
        numero: 3,
        rol: 'PASO 2 — Creamos su perfil',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Número "2" cian fondo. Título bold blanco: "Creamos tu perfil digital." Subtexto: "En menos de 24 horas armamos tu página con fotos, servicios, redes y contacto. Vos aprobás antes de imprimir." Indicador ●●○○ en cian. Franja cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe el Paso 2 del proceso de Taply NFC Colombia: el equipo crea el perfil digital personalizado en menos de 24 horas, el cliente lo revisa y aprueba. Rápido, personalizado, cliente tiene control. Máximo 2-3 frases. Solo el texto.'
      },
      {
        numero: 4,
        rol: 'PASO 3 — Entregamos la tarjeta',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Número "3" cian fondo. Título bold blanco: "Imprimimos y te entregamos tu tarjeta." Subtexto: "Tarjeta NFC con tu diseño personalizado. Lista para usar desde el primer día." Indicador ●●●○ en cian. Franja cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe el Paso 3 del proceso de Taply NFC Colombia: la tarjeta NFC física se imprime con el diseño aprobado y se entrega. Calidad, personalización, entrega rápida. Máximo 2 frases. Solo el texto.'
      },
      {
        numero: 5,
        rol: 'PASO 4 + CTA — Empezar a usar',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Número "4" cian grande fondo. Título bold blanco: "¡Listo! Empezás a compartir." Subtexto verde (#00FFAA): "Acercás la tarjeta → El celular lee el NFC → Tu perfil abre al instante." Indicador ●●●● cian completo. CTA cian bold: "El paso 4 dura 1 segundo. ¿Empezamos? 👇" Franja degradada vibrante al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe el texto final del proceso de compra de Taply NFC Colombia (Paso 4): el cliente ya tiene su tarjeta y la usa por primera vez. Capturar la emoción del primer "tap". CTA para que el lector empiece hoy. Máximo 3 líneas más CTA. Solo el texto.'
      }
    ],
    caption: `⚡ Conseguí tu Taply en 4 pasos simples:

1️⃣ Nos escribís → elegís tu plan → pagás
2️⃣ En menos de 24h creamos tu perfil digital
3️⃣ Imprimimos tu tarjeta NFC personalizada
4️⃣ La recibís → la usás → los clientes te guardan al instante

El paso 4 dura literalmente 1 segundo. Sin fricción. Sin apps.

🔵 Essential: $100.000 COP
🟢 Custom: $130.000 COP

¿Cuándo empezamos? 👇 DM o link en bio.`,
    hashtags: '#TarjetaNFC #Taply #ComoFunciona #NFC #EmprendimientoColombia #MarketingDigital #NetworkingDigital #TarjetaDigital'
  },
  {
    id: 'c6',
    codigo: 'C6',
    titulo: '5 negocios que NECESITAN una Taply (¿es el tuyo?)',
    subtitulo: 'Segmentación por nicho · Identificación',
    objetivo: 'Hacer que cada tipo de negocio se identifique con Taply',
    diaSemana: ['Jueves (12PM)', 'Domingo (12PM)'],
    slides: [
      {
        numero: 1,
        rol: 'PORTADA — Identificación',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Texto bold blanco grande: "5 negocios que NECESITAN una Taply" — "NECESITAN" en degradado cian-verde. Subtexto gris: "¿Es el tuyo? Deslizá para descubrirlo 👉" Franja degradada cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe la portada de un carrusel Instagram de Taply NFC Colombia que lista 5 tipos de negocio que más se benefician. El hook debe generar identificación. Título máximo 10 palabras con énfasis en "necesitan". Subtítulo invitando a deslizar. Solo el texto.'
      },
      {
        numero: 2,
        rol: 'NICHO 1 — Salones de belleza',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Número "1" cian grande fondo. Ícono 💇 grande centrado en cian. Título bold blanco: "Salones de belleza y spas." Subtexto: "Tus clientes salen felices y con tu WhatsApp, Instagram y agenda de citas guardados en el celular." Franja cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe la slide sobre por qué los salones de belleza y spas colombianos necesitan Taply NFC. Específico al dolor del dueño: clientes que no vuelven porque perdieron el contacto. Máximo 2-3 frases. Solo el texto.'
      },
      {
        numero: 3,
        rol: 'NICHO 2 — Restaurantes',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Número "2" cian fondo. Ícono 🍽️ cian. Título bold blanco: "Restaurantes, cafés y bares." Subtexto: "Menú digital, ubicación en Maps, WhatsApp para reservas y tu Instagram en un solo toque." Franja cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe la slide sobre por qué restaurantes, cafés y bares colombianos necesitan Taply NFC. Incluir: menú digital, ubicación, reservas por WhatsApp. Máximo 2-3 frases. Solo el texto.'
      },
      {
        numero: 4,
        rol: 'NICHO 3 — Agentes independientes',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Número "3" cian fondo. Ícono 💼 cian. Título bold blanco: "Agentes: inmobiliarios, seguros, freelancers." Subtexto: "Portafolio, certificaciones, WhatsApp y LinkedIn con un tap. La primera impresión que cierra negocios." Franja cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe la slide sobre por qué agentes independientes colombianos (inmobiliarios, de seguros, fotógrafos, consultores) necesitan Taply NFC. Argumento: viven de la primera impresión. Máximo 2-3 frases. Solo el texto.'
      },
      {
        numero: 5,
        rol: 'NICHO 4 — Profesionales de salud',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Número "4" cian fondo. Ícono 🩺 cian. Título bold blanco: "Médicos, psicólogos y nutricionistas." Subtexto: "Consulta, agenda, WhatsApp y ubicación accesibles en un toque. Tus pacientes siempre tendrán tu contacto." Franja cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe la slide sobre por qué los profesionales de la salud colombianos necesitan Taply NFC. Argumento: sus pacientes necesitan contactarlos fácilmente para citas y emergencias. Máximo 2-3 frases. Solo el texto.'
      },
      {
        numero: 6,
        rol: 'CTA — ¿Es tu negocio?',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Texto bold blanco grande: "¿Tu negocio está en esta lista?" Subtexto: "Entonces ya sabés lo que necesitás." Texto degradado cian-verde bold: "Pedí tu Taply hoy 👇" Precio blanco: "Desde $100.000 COP · Pago único" Franja degradada al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe el cierre CTA de un carrusel donde se mostraron 5 tipos de negocio. La invitación debe hacer que quien se identificó quiera escribir de inmediato. Precio $100.000 COP pago único. CTA para DM. Máximo 4 líneas. Solo el texto.'
      }
    ],
    caption: `¿Tu negocio vive del contacto con clientes? Entonces esto es para vos. 👇

Con Taply NFC, tus clientes se van de tu negocio con todos tus datos guardados en el celular.

🔵 Salones y spas · Restaurantes y cafés
🔵 Agentes inmobiliarios y freelancers
🔵 Médicos, psicólogos y profesionales de salud

💳 Desde $100.000 COP — pago único, sin mensualidades

¿Tu negocio ya tiene Taply? DM o link en bio 👇`,
    hashtags: '#TarjetaNFC #Taply #NegocioDigital #NFC #Colombia #EmprendimientoCO #MarketingDigital'
  },
  {
    id: 'c7',
    codigo: 'C7',
    titulo: 'Taply para tu equipo — Paquetes empresariales',
    subtitulo: 'B2B · Equipos · Descuentos por volumen',
    objetivo: 'Captar clientes empresariales que necesitan múltiples tarjetas',
    diaSemana: ['Jueves (7PM)', 'Domingo (7PM)'],
    slides: [
      {
        numero: 1,
        rol: 'PORTADA — Escala empresarial',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Texto bold blanco centrado grande: "Taply para tu equipo." Subtexto gris: "Digitaliza la imagen de toda tu empresa con un tap." Grid sutil de íconos de tarjetas NFC en cian muy tenue de fondo. Franja degradada cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Crea la portada para un carrusel Instagram de Taply NFC Colombia dirigido a empresas y equipos (B2B). Mensaje: Taply no es solo para individuos, también para empresas. Título máximo 8 palabras, subtítulo 1 frase. Tono profesional y aspiracional. Solo el texto.'
      },
      {
        numero: 2,
        rol: 'PROBLEMA EMPRESA — Costo en volumen',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Texto bold blanco: "Tu equipo de ventas tiene 10 personas." Cálculo en rojo suave: "10 personas × $50.000 = $500.000 cada vez que actualizan datos." Debajo en cian: "Hay una forma más inteligente." Franja cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe el texto que muestra el problema de costo para una empresa colombiana con tarjetas de papel para su equipo. Cálculo: 10 personas × $50.000 = $500.000 cada reimpresión. Hazlo sentir como dinero malgastado. Máximo 3-4 líneas. Solo el texto.'
      },
      {
        numero: 3,
        rol: 'SOLUCIÓN — Paquetes Taply',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Título bold blanco: "Paquetes Taply para equipos:" Tres bloques: 🏢 PYME (5-9 tarjetas) $115.000/u | 🏬 CORPORATIVO (10-24) $100.000/u | 🏭 ENTERPRISE (25+) $85.000/u. Cada bloque con borde cian sutil. Franja cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe el texto para la slide que presenta los paquetes empresariales de Taply NFC Colombia. PYME 5-9 tarjetas $115.000/u | CORPORATIVO 10-24 tarjetas $100.000/u | ENTERPRISE 25+ tarjetas $85.000/u. Claro y directo. Máximo 5 líneas. Solo el texto.'
      },
      {
        numero: 4,
        rol: 'QUÉ INCLUYE',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Título blanco bold: "Cada tarjeta del paquete incluye:" Lista con checks verdes: ✓ Perfil digital individual / ✓ Diseño con identidad de la empresa / ✓ Foto y cargo de cada miembro / ✓ Links: WhatsApp, email, LinkedIn / ✓ 6 meses de soporte incluido. Franja cian-verde al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe la lista de lo que incluye cada tarjeta Taply en un paquete empresarial. Énfasis en personalización individual, identidad visual, links directos, soporte. Máximo 5 ítems con ✓. Solo la lista con título corto.'
      },
      {
        numero: 5,
        rol: 'CTA — Cotización empresarial',
        canvaPrompt: 'Diseño 1080×1080px. Fondo negro (#000000). Texto bold blanco grande: "¿Tu empresa lista para el siguiente nivel?" Subtexto: "Cotización personalizada en menos de 24h." Líneas en cian: "📩 Escríbenos al DM" Precio verde bold: "Desde $85.000 COP por tarjeta para 25+ unidades." Franja degradada vibrante al pie. Logo Taply esquina superior izquierda.',
        geminiPrompt: 'Escribe el cierre CTA para carrusel empresarial de Taply NFC Colombia. Dirigido a gerentes o encargados de equipos. Cotización en menos de 24 horas. Precio desde $85.000 COP (25+ unidades). Invitación al DM profesional. Máximo 4 líneas. Solo el texto.'
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

Un equipo con Taply no reparte papeles — deja huella digital. 🤝
¿Cuántas tarjetas necesitás? DM o link en bio 👇`,
    hashtags: '#EmpresaDigital #TarjetaNFC #Taply #B2B #EquipoVentas #NFC #Colombia #Pyme #CorporativoDigital'
  }
]

const HORARIO = [
  { dia: 'Lunes',     am: 'C1 — Hook Papel', pm: 'C2 — Negocio Físico' },
  { dia: 'Martes',    am: 'C3 — Testimonio Bella Pieza', pm: 'C4 — Matemática del precio' },
  { dia: 'Miércoles', am: 'C5 — Cómo conseguir tu Taply', pm: 'C5 — Cómo conseguir tu Taply' },
  { dia: 'Jueves',    am: 'C6 — 5 negocios que lo necesitan', pm: 'C7 — Paquetes empresariales' },
  { dia: 'Viernes',   am: 'C2 — Negocio Físico', pm: 'C4 — Matemática del precio' },
  { dia: 'Sábado',    am: 'C3 — Testimonio Bella Pieza', pm: 'C5 — Cómo conseguir tu Taply' },
  { dia: 'Domingo',   am: 'C6 — 5 negocios que lo necesitan', pm: 'C7 — Paquetes empresariales' },
]

export default function ContenidoPage() {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<'calendario' | 'carruseles'>('carruseles')
  const [activeCarrusel, setActiveCarrusel] = useState(0)
  const [expandedSlide, setExpandedSlide] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function copiar(texto: string, id: string) {
    navigator.clipboard.writeText(texto)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const carrusel = CARRUSELES[activeCarrusel]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <div>
        <h1 style={{ margin: 0, fontSize: isMobile ? '24px' : '32px', fontWeight: 900 }} className="taply-gradient-text">
          Contenido Instagram
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
          7 carruseles · 2 publicaciones diarias · Prompts para Canva + Gemini · Venta orgánica
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', padding: '4px', borderRadius: '12px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
        <button onClick={() => setActiveTab('carruseles')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 8px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none', backgroundColor: activeTab === 'carruseles' ? '#00cfff0d' : 'transparent', color: activeTab === 'carruseles' ? '#00cfff' : '#6b7280', outline: activeTab === 'carruseles' ? '1px solid #00cfff22' : 'none' }}>
          <Layers size={14} /> Carruseles
        </button>
        <button onClick={() => setActiveTab('calendario')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 8px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none', backgroundColor: activeTab === 'calendario' ? '#00cfff0d' : 'transparent', color: activeTab === 'calendario' ? '#00cfff' : '#6b7280', outline: activeTab === 'calendario' ? '1px solid #00cfff22' : 'none' }}>
          <Calendar size={14} /> Calendario Semanal
        </button>
      </div>

      {activeTab === 'carruseles' && (
        <>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {CARRUSELES.map((c, i) => (
              <button key={c.id} onClick={() => { setActiveCarrusel(i); setExpandedSlide(null) }} style={{ padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: '1px solid', transition: 'all .15s', borderColor: activeCarrusel === i ? '#00cfff' : '#1f1f1f', backgroundColor: activeCarrusel === i ? '#00cfff14' : '#161616', color: activeCarrusel === i ? '#00cfff' : '#6b7280' }}>
                {c.codigo}
              </button>
            ))}
          </div>

          <div style={{ borderRadius: '16px', backgroundColor: '#161616', border: '1px solid #00cfff22', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <span style={{ padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, background: 'linear-gradient(90deg,#00cfff,#00ff94)', color: '#0d0d0d' }}>{carrusel.codigo}</span>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>{carrusel.slides.length} diapositivas</span>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {carrusel.slides.map((slide) => {
              const slideId = `${carrusel.id}-${slide.numero}`
              const isOpen = expandedSlide === slideId
              const canvaCopied = copiedId === `${slideId}-canva`
              const geminiCopied = copiedId === `${slideId}-gemini`
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
                      <div style={{ borderRadius: '12px', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ImageIcon size={13} style={{ color: '#a78bfa' }} />
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prompt Canva</span>
                          </div>
                          <button onClick={() => copiar(slide.canvaPrompt, `${slideId}-canva`)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', backgroundColor: canvaCopied ? '#00ff940d' : '#a78bfa12', border: `1px solid ${canvaCopied ? '#00ff9433' : '#a78bfa33'}`, color: canvaCopied ? '#00ff94' : '#a78bfa' }}>
                            {canvaCopied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
                          </button>
                        </div>
                        <p style={{ margin: 0, fontSize: '12.5px', color: '#d1d5db', lineHeight: '1.75' }}>{slide.canvaPrompt}</p>
                      </div>

                      <div style={{ borderRadius: '12px', backgroundColor: '#0d0d0d', border: '1px solid #00cfff22', padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <BookOpen size={13} style={{ color: '#00cfff' }} />
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#00cfff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prompt Gemini</span>
                          </div>
                          <button onClick={() => copiar(slide.geminiPrompt, `${slideId}-gemini`)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', backgroundColor: geminiCopied ? '#00ff940d' : '#00cfff0d', border: `1px solid ${geminiCopied ? '#00ff9433' : '#00cfff22'}`, color: geminiCopied ? '#00ff94' : '#00cfff' }}>
                            {geminiCopied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
                          </button>
                        </div>
                        <p style={{ margin: 0, fontSize: '12.5px', color: '#d1d5db', lineHeight: '1.75', fontFamily: 'monospace' }}>{slide.geminiPrompt}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

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

      {activeTab === 'calendario' && (
        <>
          <div style={{ borderRadius: '16px', backgroundColor: '#161616', border: '1px solid #1f1f1f', padding: '16px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
              📅 <strong style={{ color: '#f0f0f0' }}>2 publicaciones diarias</strong> — 🌅 12:00 PM y 🌙 7:00 PM — máximo engagement en Colombia.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {HORARIO.map((fila, i) => (
              <div key={i} style={{ borderRadius: '14px', backgroundColor: '#161616', border: '1px solid #1f1f1f', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                <div style={{ minWidth: '90px', fontWeight: 700, fontSize: '13px', color: '#00cfff', paddingTop: '2px' }}>{fila.dia}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', minWidth: '58px' }}>🌅 12:00 PM</span>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: '#00cfff0d', border: '1px solid #00cfff22', color: '#00cfff' }}>{fila.am}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', minWidth: '58px' }}>🌙 7:00 PM</span>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: '#00ff940d', border: '1px solid #00ff9422', color: '#00ff94' }}>{fila.pm}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderRadius: '14px', backgroundColor: '#161616', border: '1px solid #fbbf2422', padding: '14px 16px' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#fbbf24', marginBottom: '8px' }}>💡 Estrategia de rotación</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', lineHeight: '1.7' }}>
              Semana 1: publica con el horario de arriba.<br />
              Semana 2: intercambia los horarios (12PM ↔ 7PM) para alcanzar audiencias distintas.<br />
              Semana 3+: varía el caption y rota el orden de los carruseles.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
