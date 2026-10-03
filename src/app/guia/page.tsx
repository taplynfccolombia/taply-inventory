'use client'

import { useState } from 'react'
import { Download, BookOpen, LayoutDashboard, ShoppingCart, Package, Users, Wallet, CheckSquare, Sparkles, Megaphone, FileText, Truck, Settings, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'

const SECTIONS = [
  {
    id: 'inicio',
    icon: BookOpen,
    color: '#00cfff',
    title: '¿Qué es Taply Inventory?',
    content: `Taply Inventory es el sistema de gestión completo para el negocio Taply NFC. Fue diseñado específicamente para gestionar ventas, inventario, clientes, pedidos y finanzas de manera eficiente desde cualquier dispositivo con acceso a internet.

ACCESO AL SISTEMA:
- URL: https://taply-inventory.vercel.app
- Guárdala como favorito en tu navegador
- Funciona en Mac, iPhone, iPad y cualquier computador
- Se actualiza automáticamente — siempre tendrás la versión más reciente

NAVEGACIÓN:
- El menú principal está en el panel izquierdo
- Haz clic en cualquier sección para navegar
- Usa el botón ‹ para colapsar el menú y tener más espacio
- Usa el botón ☰ para expandirlo de nuevo`,
  },
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    color: '#00cfff',
    title: 'Dashboard — Resumen del negocio',
    content: `El Dashboard es la pantalla principal. Muestra un resumen en tiempo real de todo el negocio.

SELECTOR DE PERÍODO (esquina superior derecha):
- "Esta semana" — muestra datos de los últimos 7 días
- "Este mes" — muestra datos del mes actual
- "Todo el tiempo" — muestra el histórico completo

KPI CARDS (5 tarjetas de métricas):
- Ingresos: total de dinero recibido por ventas completadas
- Ganancia Neta: ingresos menos costos
- Ventas: número de ventas completadas en el período
- Stock Disponible: unidades de Tarjeta Negra Matte Base disponibles (se pone rojo si hay menos de 5)
- Clientes: total de clientes registrados

META MENSUAL:
- Muestra el progreso hacia la meta de ingresos y ventas del mes
- Click en "Editar" para cambiar la meta
- La barra de progreso cambia de color: azul (inicio), amarillo (cerca), verde (alcanzada)

GRÁFICAS:
- Área: ingresos y ganancias de los últimos 7 días
- Barras: unidades vendidas por día
- Pie chart: distribución Essential vs Custom`,
  },
  {
    id: 'ventas',
    icon: ShoppingCart,
    color: '#00cfff',
    title: 'Ventas — Registro y gestión',
    content: `Aquí registras cada venta y gestionas cobros pendientes.

REGISTRAR UNA VENTA:
1. Click en "Nueva Venta"
2. Selecciona el producto: Essential ($100.000) o Custom ($130.000)
3. Ingresa la cantidad
4. Asigna un cliente (opcional)
5. Selecciona el método de pago: Efectivo, Transferencia, Nequi, Daviplata u Otro
6. Define el estado: Completada (cobrada ya), Pendiente (por cobrar), Cancelada
7. Click "Registrar Venta"

⚡ AUTOMÁTICO AL REGISTRAR UNA VENTA COMPLETADA:
- Se descuenta del stock automáticamente
- Se registra el ingreso en Flujo de Caja
- Se crea el pedido en el módulo de Pedidos

COBROS PENDIENTES:
- Si hay ventas pendientes de cobro, aparece una alerta amarilla
- Tab "Cobros Pendientes" para ver solo esas ventas
- Botón ✓ verde para marcarla como cobrada
- Al cobrar, se registra el ingreso automáticamente

CANCELAR UNA VENTA:
- Click en el ícono de cancelar (⊘) en la fila de la venta
- Confirma con "Sí"
- El stock se restaura automáticamente
- Se registra el egreso en Flujo de Caja

EXPORTAR CSV:
- Botón "CSV" en la esquina superior derecha
- Descarga todas las ventas en formato Excel`,
  },
  {
    id: 'pedidos',
    icon: Truck,
    color: '#a78bfa',
    title: 'Pedidos — Seguimiento de producción',
    content: `Gestiona el estado de producción y entrega de cada tarjeta vendida.

ESTADOS DEL PEDIDO:
📥 Recibido → ⚙️ En Producción → ✅ Listo → 🚚 Enviado → 🎉 Entregado

AVANZAR DE ESTADO:
- Click en el botón "→ [siguiente estado]" en cada pedido
- La barra de progreso se actualiza automáticamente

NOTIFICAR AL CLIENTE POR WHATSAPP:
- Click en "Notificar por WhatsApp" (botón verde)
- Se abre WhatsApp con un mensaje predefinido del estado actual
- El mensaje incluye el nombre del cliente y el producto
- Solo disponible si el cliente tiene número registrado

FILTROS:
- Usa los botones superiores para filtrar por estado
- Ver solo los pedidos "En Producción" o "Listos para entregar"

IMPORTANTE:
- Los pedidos se crean automáticamente al registrar una venta completada
- Solo aparecen las ventas con status "Completada"`,
  },
  {
    id: 'inventario',
    icon: Package,
    color: '#00ff94',
    title: 'Inventario — Control de stock',
    content: `Controla el stock de Tarjetas Negras Matte Base (el producto físico único).

VER EL STOCK:
- Número grande en el centro = unidades disponibles
- Indicador de estado: Sin Stock (rojo), Stock Bajo (amarillo, menos de 5), Stock OK (verde)
- Valor total del stock = cantidad × $2.000 (costo por unidad)

AJUSTAR EL STOCK MANUALMENTE:
1. Selecciona "Agregar" (cuando recibes tarjetas del proveedor) o "Restar" (corrección manual)
2. Ingresa la cantidad de unidades
3. Agrega una nota opcional (ej: "Compra a proveedor - 20 unidades")
4. Click "Confirmar Ajuste"

IMPORTANTE — EL STOCK SE DESCUENTA AUTOMÁTICAMENTE:
- Cada venta completada (Essential o Custom) descuenta 1 unidad por tarjeta vendida
- No necesitas hacer el descuento manual al registrar ventas
- Si cancelas una venta, el stock se restaura automáticamente`,
  },
  {
    id: 'clientes',
    icon: Users,
    color: '#00cfff',
    title: 'Clientes — Base de datos',
    content: `Gestiona todos tus clientes y su historial de compras.

REGISTRAR UN CLIENTE:
1. Click en "Nuevo Cliente"
2. Completa: nombre (obligatorio), empresa, email, teléfono, ciudad, notas
3. Click "Guardar Cliente"

BUSCAR UN CLIENTE:
- Usa la barra de búsqueda para filtrar por nombre, empresa o email

VER EL PERFIL DE UN CLIENTE:
- Click en cualquier fila de la tabla o en el botón "Ver →"
- Verás: información de contacto, KPIs individuales, historial completo de compras

EN EL PERFIL DEL CLIENTE:
- Total comprado, ganancia generada, compras completadas, cobros pendientes
- Desglose Essential vs Custom
- Botón "Mensaje de seguimiento" → abre WhatsApp con mensaje personalizado
- Historial de todas sus compras con opción de cancelar cada una

EXPORTAR CSV:
- Botón "CSV" descarga toda la base de clientes en Excel`,
  },
  {
    id: 'flujo',
    icon: Wallet,
    color: '#00ff94',
    title: 'Flujo de Caja — Finanzas',
    content: `Registra y visualiza todos los movimientos de dinero del negocio.

KPIs PRINCIPALES:
- Total Ingresos: suma de todos los ingresos registrados
- Total Egresos: suma de todos los egresos registrados
- Balance Neto: ingresos menos egresos (se pone rojo si es negativo)

INGRESOS POR MEDIO DE PAGO:
- Panel con 5 tarjetas: Efectivo, Transferencia, Nequi, Daviplata, Otro
- Muestra cuánto dinero tienes en cada medio de pago
- Barra de progreso con el porcentaje del total

AUTOMÁTICO:
- Cada venta completada genera un ingreso automático
- Cada cancelación genera un egreso automático
- No necesitas registrarlos manualmente

REGISTRAR MANUALMENTE:
1. Click en "Nuevo Movimiento"
2. Tipo: Ingreso o Egreso
3. Categoría: Venta, Compra Inventario, Impresión/Logística, Imprevisto, Retiro, Otro
4. Descripción y monto
5. Click "Registrar Movimiento"

EXPORTAR CSV:
- Botón "CSV" descarga todo el flujo de caja en Excel`,
  },
  {
    id: 'tareas',
    icon: CheckSquare,
    color: '#ffb547',
    title: 'Tareas — Pendientes del negocio',
    content: `Gestiona tus tareas y pendientes del negocio.

CREAR UNA TAREA:
1. Click en "Nueva Tarea"
2. Título (obligatorio), descripción opcional
3. Prioridad: Alta (rojo), Media (amarillo), Baja (verde)
4. Fecha límite opcional
5. Click "Crear Tarea"

GESTIONAR TAREAS:
- Click en el checkbox ☐ para marcar como completada
- Click de nuevo para marcarla como pendiente
- Botón de papelera para eliminarla

FILTROS:
- "Pendientes" — solo las tareas sin completar
- "Completadas" — solo las terminadas
- "Todas" — ver todo

ALERTAS:
- Las tareas vencidas aparecen en rojo con ⚠
- El contador de urgentes (prioridad Alta) aparece en el header`,
  },
  {
    id: 'contenido',
    icon: Sparkles,
    color: '#00cfff',
    title: 'Contenido — Ideas para redes sociales',
    content: `Genera ideas de contenido semanales con guiones detallados para Instagram y TikTok.

GENERAR IDEAS:
- Click en "✨ Generar Ideas" para crear el plan de la semana
- Se generan 7 ideas (una por día) con formatos balanceados: Reel, Story, Carrusel, TikTok
- Click en "🎲 Nuevas Ideas" para regenerar con ideas diferentes

NAVEGAR ENTRE SEMANAS:
- Botones "← Anterior" y "Siguiente →" para ver otras semanas
- Badge "Esta semana" marca la semana actual
- Cada semana guarda sus ideas de forma independiente

VER EL GUIÓN:
- Click en "✨ Ver guión" en cualquier tarjeta
- La tarjeta se expande mostrando el guión completo
- Incluye: hook, desarrollo con planos, CTA, música recomendada, tips faceless
- Botón "📋 Copiar guión completo" para copiarlo al portapapeles

MARCAR COMO PUBLICADO:
- Click en el checkbox ☐ de la esquina superior derecha de cada tarjeta
- La tarjeta se atenúa al marcarse como publicada
- El contador "X/7 publicados" se actualiza`,
  },
  {
    id: 'ads',
    icon: Megaphone,
    color: '#ff4d4d',
    title: 'ADS — Pautas Meta y TikTok',
    content: `Genera anuncios profesionales y accede a guías de pauta para Meta y TikTok.

SELECCIONAR PLATAFORMA:
- Click en "📘 Meta Ads" (Facebook + Instagram) o "🎵 TikTok Ads"

⚡ GENERADOR DE ANUNCIOS:
1. Selecciona el producto a pautar
2. Elige el objetivo: Mensajes, Tráfico, Conversiones, Alcance o Reconocimiento
3. Ingresa el presupuesto total (COP) y duración (días)
4. Define la ubicación y rango de edad
5. Click "Generar Anuncio"

EL GENERADOR PRODUCE:
- Análisis de tu configuración con advertencias y recomendaciones
- Copy completo: titular, texto principal, descripción y CTA
- Audiencia recomendada con intereses específicos
- Distribución del presupuesto en 3 fases (Test, Escala, Retargeting)
- KPIs a vigilar con valores objetivo para Colombia
- Tips de optimización
- Botones "Copiar" para cada sección

📚 GUÍA PROFESIONAL:
- 4 secciones expandibles con información detallada
- Estructura de campaña, públicos, presupuestos y creatividades
- Específica para Taply NFC en Colombia`,
  },
  {
    id: 'reportes',
    icon: FileText,
    color: '#00cfff',
    title: 'Reportes — PDF descargables',
    content: `Genera reportes PDF profesionales del negocio por período de fechas.

TIPOS DE REPORTE:
- Reporte de Ventas: detalle de todas las ventas del período
- Flujo de Caja: ingresos, egresos y balance del período
- Reporte Ejecutivo: resumen completo (ventas + flujo de caja)

SELECCIONAR EL PERÍODO:
- Ingresa fechas manualmente (Desde / Hasta)
- O usa los atajos rápidos:
  → "Este mes": del 1 al día actual
  → "Mes anterior": el mes pasado completo
  → "Últimos 30 días": últimos 30 días
  → "Este año": desde el 1 de enero

GENERAR EL REPORTE:
1. Selecciona el tipo de reporte
2. Define el período
3. Click "👁️ Vista previa" para ver el resumen
4. Click "Descargar PDF" para generar y descargar

EL PDF INCLUYE:
- Header con logo y paleta de colores Taply
- Resumen ejecutivo con KPIs del período
- Tabla detallada de ventas (si aplica)
- Tabla de flujo de caja (si aplica)
- Footer con número de página`,
  },
  {
    id: 'configuracion',
    icon: Settings,
    color: '#6b7280',
    title: 'Configuración — Ajustes del sistema',
    content: `Accede a la información del sistema y herramientas de administración.

INFORMACIÓN DEL SISTEMA:
- Versión, stack tecnológico, base de datos y región

⚠️ RESETEAR EL SISTEMA (ZONA DE PELIGRO):
Esta función elimina TODOS los registros del sistema. Úsala solo para pruebas o reinicio total.

PROCESO DE RESET (3 confirmaciones de seguridad):
1. Click en "Resetear Todo el Sistema"
2. Primera confirmación: "¿Estás seguro?"
3. Segunda confirmación: escribe la palabra RESETEAR en el campo de texto
4. Click en "⚠ Resetear Permanentemente"

QUÉ SE ELIMINA:
- Todas las ventas
- Todos los clientes
- Todo el flujo de caja
- Todas las tareas
- El inventario queda en 0

⚠️ ESTA ACCIÓN NO SE PUEDE DESHACER`,
  },
  {
    id: 'whatsapp',
    icon: MessageCircle,
    color: '#00ff94',
    title: 'WhatsApp Business — Mensajes automáticos',
    content: `El sistema genera mensajes predefinidos para comunicarte con clientes por WhatsApp.

DÓNDE ENCONTRAR LOS BOTONES DE WHATSAPP:

EN PEDIDOS:
- Botón "Notificar por WhatsApp" en cada pedido
- El mensaje incluye el estado actual del pedido
- Ej: "Tu tarjeta Taply Custom está siendo personalizada en este momento ⚙️"

EN EL PERFIL DEL CLIENTE:
- Botón "Mensaje de seguimiento" en el header
- Abre WhatsApp con un mensaje de seguimiento post-venta
- Pregunta cómo va la experiencia y recuerda que las actualizaciones están incluidas

- Botón de WhatsApp (ícono verde) en cada venta del historial
- Envía la confirmación de esa venta específica con monto y producto

CÓMO FUNCIONA:
- Al hacer click, se abre WhatsApp (web o app instalada)
- El mensaje ya está escrito — solo debes enviarlo
- Personaliza el mensaje si lo necesitas antes de enviar
- Requiere que el cliente tenga número de teléfono registrado

IMPORTANTE:
- El número debe estar en formato colombiano: 3XXXXXXXXX (10 dígitos)
- El sistema agrega automáticamente el código de país +57`,
  },
]

export default function GuiaPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('inicio')
  const [downloading, setDownloading] = useState(false)

  async function handleDownloadPDF() {
    setDownloading(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = doc.internal.pageSize.getWidth()
      const pageH = doc.internal.pageSize.getHeight()
      const margin = 20
      const contentW = pageW - margin * 2

      const dark: [number, number, number] = [13, 13, 13]
      const cyan: [number, number, number] = [0, 207, 255]
      const white: [number, number, number] = [255, 255, 255]
      const gray: [number, number, number] = [107, 114, 128]
      const lightGray: [number, number, number] = [240, 240, 240]
      const darkGray: [number, number, number] = [30, 30, 30]

      // ── Portada
      doc.setFillColor(...dark)
      doc.rect(0, 0, pageW, pageH, 'F')
      doc.setTextColor(...cyan)
      doc.setFontSize(36)
      doc.setFont('helvetica', 'bold')
      doc.text('TAPLY', margin, 60)
      doc.setFontSize(14)
      doc.setTextColor(...white)
      doc.setFont('helvetica', 'normal')
      doc.text('Sistema de Gestión NFC', margin, 72)
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...white)
      doc.text('Guía de Usuario', margin, 100)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...gray)
      doc.text('Manual completo de uso del sistema', margin, 112)
      doc.setFontSize(10)
      doc.text(`Versión 1.0 · ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })}`, margin, 270)
      doc.text('https://taply-inventory.vercel.app', margin, 278)

      // ── Tabla de contenido
      doc.addPage()
      doc.setFillColor(...dark)
      doc.rect(0, 0, pageW, 30, 'F')
      doc.setTextColor(...cyan)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Tabla de Contenido', margin, 20)

      let y = 45
      SECTIONS.forEach((section, i) => {
        doc.setTextColor(...white)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        doc.text(`${i + 1}. ${section.title}`, margin, y)
        doc.setTextColor(...gray)
        doc.setFontSize(9)
        y += 8
      })

      // ── Contenido por sección
      SECTIONS.forEach((section, idx) => {
        doc.addPage()

        // Header de sección
        doc.setFillColor(...dark)
        doc.rect(0, 0, pageW, 35, 'F')
        doc.setFillColor(...cyan)
        doc.rect(0, 0, 4, 35, 'F')
        doc.setTextColor(...cyan)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(`${idx + 1} / ${SECTIONS.length}`, margin, 12)
        doc.setTextColor(...white)
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text(section.title, margin, 24)

        y = 50
        const lines = section.content.split('\n')

        lines.forEach(line => {
          if (y > pageH - 25) {
            doc.addPage()
            doc.setFillColor(...darkGray)
            doc.rect(0, 0, pageW, 12, 'F')
            doc.setTextColor(...gray)
            doc.setFontSize(8)
            doc.text(section.title, margin, 8)
            y = 22
          }

          const trimmed = line.trim()

          if (trimmed === '') {
            y += 4
          } else if (trimmed.match(/^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s\-\/]+:$/)) {
            // Título de subsección
            if (y > 50) y += 4
            doc.setFillColor(...darkGray)
            doc.rect(margin - 2, y - 5, contentW + 4, 9, 'F')
            doc.setTextColor(...cyan)
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text(trimmed, margin, y)
            y += 8
          } else if (trimmed.startsWith('•') || trimmed.startsWith('→') || trimmed.match(/^\d+\./)) {
            // Lista
            doc.setTextColor(...lightGray)
            doc.setFontSize(9)
            doc.setFont('helvetica', 'normal')
            const wrappedLines = doc.splitTextToSize(trimmed, contentW - 4)
            wrappedLines.forEach((wl: string) => {
              if (y > pageH - 25) {
                doc.addPage()
                y = 22
              }
              doc.text(wl, margin + 3, y)
              y += 5.5
            })
          } else if (trimmed.startsWith('⚡') || trimmed.startsWith('⚠️') || trimmed.startsWith('💡') || trimmed.startsWith('📥') || trimmed.startsWith('📘') || trimmed.startsWith('📚')) {
            // Highlight
            doc.setTextColor(...cyan)
            doc.setFontSize(9)
            doc.setFont('helvetica', 'bold')
            const wrappedLines = doc.splitTextToSize(trimmed, contentW)
            wrappedLines.forEach((wl: string) => {
              doc.text(wl, margin, y)
              y += 5.5
            })
          } else {
            // Texto normal
            doc.setTextColor(...lightGray)
            doc.setFontSize(9)
            doc.setFont('helvetica', 'normal')
            const wrappedLines = doc.splitTextToSize(trimmed, contentW)
            wrappedLines.forEach((wl: string) => {
              if (y > pageH - 25) {
                doc.addPage()
                y = 22
              }
              doc.text(wl, margin, y)
              y += 5.5
            })
          }
        })
      })

      // ── Footer en todas las páginas
      const totalPages = doc.getNumberOfPages()
      for (let i = 2; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFillColor(...dark)
        doc.rect(0, 287, pageW, 10, 'F')
        doc.setTextColor(...gray)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text('Taply NFC — Guía de Usuario v1.0', margin, 293)
        doc.text(`Página ${i - 1} de ${totalPages - 1}`, pageW - margin, 293, { align: 'right' })
      }

      doc.save('Taply_Guia_de_Usuario.pdf')
    } catch (err) {
      console.error('Error generando PDF:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }} className="taply-gradient-text">Guía de Usuario</h1>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>
            Manual completo de uso del sistema Taply Inventory
          </p>
        </div>
        <button onClick={handleDownloadPDF} disabled={downloading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: downloading ? 'not-allowed' : 'pointer', border: 'none',
            background: downloading ? '#2a2a2a' : 'linear-gradient(90deg, #00cfff, #00ff94)',
            color: downloading ? '#6b7280' : '#0d0d0d' }}>
          <Download size={16} />
          {downloading ? 'Generando PDF...' : 'Descargar Guía PDF'}
        </button>
      </div>

      {/* Intro card */}
      <div style={{ borderRadius: '16px', padding: '24px', backgroundColor: '#00cfff0d', border: '1px solid #00cfff22', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <BookOpen size={32} style={{ color: '#00cfff', flexShrink: 0 }} />
        <div>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f0f0f0' }}>
            Este manual cubre todos los módulos del sistema
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
            Haz click en cada sección para expandirla · Descarga el PDF completo para tenerlo siempre a mano
          </p>
        </div>
      </div>

      {/* Secciones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {SECTIONS.map((section, idx) => {
          const isExpanded = expandedSection === section.id
          const Icon = section.icon
          return (
            <div key={section.id} style={{ borderRadius: '14px', overflow: 'hidden', border: `1px solid ${isExpanded ? section.color + '33' : '#1f1f1f'}`, transition: 'border-color 0.2s ease' }}>
              <button
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                style={{ width: '100%', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: isExpanded ? section.color + '0d' : '#161616', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background-color 0.2s ease' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: section.color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} style={{ color: section.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '11px', color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: 700, color: isExpanded ? section.color : '#f0f0f0' }}>
                    {section.title}
                  </p>
                </div>
                {isExpanded
                  ? <ChevronUp size={18} style={{ color: '#6b7280', flexShrink: 0 }} />
                  : <ChevronDown size={18} style={{ color: '#6b7280', flexShrink: 0 }} />
                }
              </button>

              {isExpanded && (
                <div style={{ padding: '0 24px 24px', backgroundColor: section.color + '0d', borderTop: `1px solid ${section.color}22` }}>
                  <pre style={{ margin: '20px 0 0', fontSize: '13px', color: '#d1d5db', lineHeight: '1.9', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {section.content}
                  </pre>
                </div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}
