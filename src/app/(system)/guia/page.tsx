'use client'

import { useState } from 'react'
import { Download, BookOpen, LayoutDashboard, ShoppingCart, Package, Users, Wallet, CheckSquare, Sparkles, Megaphone, FileText, Truck, Settings, MessageCircle, Shield, ChevronDown, ChevronUp } from 'lucide-react'
import { useIsMobile } from '@/lib/hooks'

const SECTIONS = [
  {
    id: 'inicio', icon: BookOpen, color: '#00cfff',
    title: '¿Qué es Taply Inventory?',
    content: `Taply Inventory es el sistema de gestión completo para el negocio Taply NFC. Diseñado específicamente para gestionar ventas, inventario, clientes, pedidos y finanzas desde cualquier dispositivo.

ACCESO AL SISTEMA:
- URL: https://taply-inventory.vercel.app
- Contraseña por defecto: taply2026
- Guárdala como favorito en tu navegador
- Funciona en Mac, iPhone, iPad y cualquier computador

SEGURIDAD:
- Al entrar verás la pantalla de login
- Ingresa tu contraseña para acceder
- Cambia tu contraseña en Configuración → Seguridad
- Cierra sesión desde Configuración cuando termines

NAVEGACIÓN EN DESKTOP:
- El menú principal está en el panel izquierdo
- Haz clic en cualquier sección para navegar
- Usa el botón ‹ para colapsar el menú
- Usa el botón ☰ para expandirlo de nuevo

NAVEGACIÓN EN MÓVIL (iPhone / Android):
- Aparece una barra superior con el logo y botón ☰
- Toca ☰ para abrir el menú lateral
- Toca cualquier módulo para navegar
- El menú se cierra automáticamente al navegar`,
  },
  {
    id: 'dashboard', icon: LayoutDashboard, color: '#00cfff',
    title: 'Dashboard — Resumen del negocio',
    content: `El Dashboard es la pantalla principal con un resumen en tiempo real.

SELECTOR DE PERÍODO:
- "Esta semana" — últimos 7 días
- "Este mes" — mes actual
- "Todo el tiempo" — histórico completo
En móvil aparece como: Sem. / Mes / Todo

ALERTAS AUTOMÁTICAS:
- 🚨 Sin stock — aparece en rojo cuando el stock llega a 0
- ⚠ Stock bajo — aparece en amarillo cuando quedan menos de 5 unidades
- ⚠ Cobros pendientes — muestra el total por cobrar con link directo a Ventas

KPI CARDS (5 tarjetas):
- Ingresos: total de dinero recibido
- Ganancia: ingresos menos costos
- Ventas: número de ventas completadas
- Stock: unidades disponibles (cambia de color según el nivel)
- Clientes: total registrados

COMPARATIVA % vs PERÍODO ANTERIOR:
- Cada KPI muestra el % de cambio vs el período anterior
- Verde con ↑ = creció / Rojo con ↓ = bajó
- Solo aparece en modo "Esta semana" y "Este mes"

META MENSUAL:
- Muestra progreso hacia meta de ingresos y ventas
- Click en "Editar" para cambiar la meta
- La barra cambia de color según el avance

GRÁFICAS:
- Área: ingresos y ganancias de los últimos 7 días
- Barras: ventas por día
- Pie chart: distribución Essential vs Custom`,
  },
  {
    id: 'ventas', icon: ShoppingCart, color: '#00cfff',
    title: 'Ventas — Registro y gestión',
    content: `Registra cada venta y gestiona cobros pendientes.

REGISTRAR UNA VENTA:
1. Click en "Nueva Venta"
2. Selecciona el producto: Essential ($100.000) o Custom ($130.000)
3. Ingresa la cantidad
4. Asigna un cliente (opcional)
5. Selecciona el método de pago
6. Define el estado: Completada, Pendiente o Cancelada
7. Click "Registrar Venta"

AUTOMÁTICO AL REGISTRAR:
- Se descuenta del stock automáticamente
- Se registra el ingreso en Flujo de Caja
- Se crea el pedido en el módulo Pedidos

ALERTAS DE STOCK:
- 🚨 Sin stock: no puedes registrar ventas completadas
- ⚠ Stock bajo: advertencia cuando quedan menos de 5 unidades

COBROS PENDIENTES:
- Tab "Pendientes" para ver ventas sin cobrar
- Botón ✓ verde para marcar como cobrada
- Al cobrar se registra el ingreso automáticamente

CANCELAR UNA VENTA:
- Botón ⊘ en la fila de la venta → confirmar
- El stock se restaura automáticamente

BÚSQUEDA Y FILTROS:
- Busca por cliente, producto o notas
- Filtra por producto (Essential / Custom)
- Filtra por método de pago
- El CSV exporta solo los resultados filtrados

EXPORTAR CSV:
- Botón "CSV" en la esquina superior derecha`,
  },
  {
    id: 'pedidos', icon: Truck, color: '#a78bfa',
    title: 'Pedidos — Seguimiento de producción',
    content: `Gestiona el estado de producción y entrega de cada tarjeta.

ESTADOS DEL PEDIDO:
📥 Recibido → ⚙️ En Producción → ✅ Listo → 🚚 Enviado → 🎉 Entregado

AVANZAR DE ESTADO:
- Click en el botón "→ [siguiente estado]"
- La barra de progreso se actualiza automáticamente

NOTIFICAR AL CLIENTE POR WHATSAPP:
- Botón "📱 WhatsApp" en cada pedido
- Abre WhatsApp con mensaje predefinido del estado actual
- Solo disponible si el cliente tiene número registrado

FILTROS:
- Botones superiores para filtrar por estado
- Ver solo "En Producción" o "Listos para entregar"

EXPORTAR CSV:
- Botón "CSV" descarga el estado actual de todos los pedidos

IMPORTANTE:
- Los pedidos se crean automáticamente al registrar ventas completadas
- En móvil el pipeline tiene scroll horizontal`,
  },
  {
    id: 'inventario', icon: Package, color: '#00ff94',
    title: 'Inventario — Control de stock',
    content: `Controla el stock de Tarjetas Negras Matte Base.

INDICADORES DE ESTADO:
- 🚨 Sin Stock (rojo): 0 unidades
- ⚠ Stock Bajo (amarillo): menos de 5 unidades
- ✅ Stock OK (verde): 5 o más unidades

AJUSTAR EL STOCK MANUALMENTE:
1. Selecciona "+ Agregar" (recibes tarjetas) o "− Restar" (corrección)
2. Ingresa la cantidad
3. Vista previa del resultado: 10 +5 = 15 uds
4. Agrega un motivo opcional
5. Click "Confirmar"

AUTOMÁTICO — EL STOCK SE DESCUENTA SOLO:
- Cada venta completada descuenta 1 unidad por tarjeta
- Al cancelar una venta, el stock se restaura
- No necesitas hacer ajustes manuales al vender

HISTORIAL DE MOVIMIENTOS:
- Tabla con todos los cambios de stock
- Tipos: Agregado, Restado, Venta (automático), Cancelación (automático)
- Muestra el stock resultante después de cada movimiento
- En móvil tiene scroll horizontal`,
  },
  {
    id: 'clientes', icon: Users, color: '#00cfff',
    title: 'Clientes — Base de datos',
    content: `Gestiona todos tus clientes y su historial de compras.

REGISTRAR UN CLIENTE:
1. Click en "Nuevo Cliente"
2. Completa: nombre (obligatorio), empresa, email, teléfono, ciudad, notas
3. Click "Guardar Cliente"

En móvil aparecen como cards deslizables en lugar de tabla.

BUSCAR UN CLIENTE:
- Barra de búsqueda por nombre, empresa o email

VER EL PERFIL DE UN CLIENTE:
- Click en cualquier fila o card del cliente
- Verás: información de contacto, KPIs individuales, historial

EDITAR UN CLIENTE:
- Botón "✏️ Editar" en el perfil del cliente
- Modifica cualquier campo y guarda
- Útil cuando el cliente cambia su teléfono o empresa

EN EL PERFIL DEL CLIENTE:
- Total comprado, ganancia generada, compras completadas
- Desglose Essential vs Custom
- Botón "Seguimiento" → WhatsApp con mensaje post-venta
- Historial de compras con opción de cancelar y notificar por WhatsApp

EXPORTAR CSV:
- Botón "CSV" descarga toda la base de clientes`,
  },
  {
    id: 'flujo', icon: Wallet, color: '#00ff94',
    title: 'Flujo de Caja — Finanzas',
    content: `Registra y visualiza todos los movimientos de dinero.

SELECTOR DE PERÍODO:
- Todo el tiempo / Este mes / Esta semana / Fechas personalizadas
- Los KPIs y el desglose por método de pago se filtran según el período

KPIs PRINCIPALES:
- Total Ingresos, Total Egresos, Balance Neto

INGRESOS POR MEDIO DE PAGO:
- 5 tarjetas: 💵 Efectivo, 🏦 Transferencia, 🟣 Nequi, 🔴 Daviplata, 💳 Otro
- Muestra el total, número de ventas y % del total
- Barra de progreso visual
- Se filtra según el período seleccionado

AUTOMÁTICO:
- Cada venta completada genera un ingreso automático
- Cada cancelación genera un egreso automático

REGISTRAR MANUALMENTE:
1. Click en "Nuevo Movimiento"
2. Tipo: Ingreso o Egreso
3. Categoría y descripción
4. Monto y confirmar

EXPORTAR CSV:
- Botón "CSV" con todos los movimientos del período`,
  },
  {
    id: 'tareas', icon: CheckSquare, color: '#ffb547',
    title: 'Tareas — Pendientes del negocio',
    content: `Gestiona las tareas y pendientes del negocio.

CREAR UNA TAREA:
1. Click en "Nueva Tarea"
2. Título (obligatorio), descripción opcional
3. Prioridad: Alta (rojo), Media (amarillo), Baja (verde)
4. Fecha límite opcional
5. Click "Crear Tarea"

GESTIONAR TAREAS:
- Click en el checkbox ☐ para completar / descompletar
- Botón de papelera para eliminar (con confirmación)

FILTROS:
- "Pendientes" — sin completar (vista por defecto)
- "Completadas" — ya terminadas
- "Todas" — ver todo

ALERTAS:
- Las tareas vencidas aparecen con badge rojo "⚠ Vencida"
- El header muestra el contador de urgentes y vencidas`,
  },
  {
    id: 'contenido', icon: Sparkles, color: '#00cfff',
    title: 'Contenido — Ideas para redes sociales',
    content: `Genera ideas semanales con guiones detallados para Instagram y TikTok.

GENERAR IDEAS:
- Click en "✨ Generar Ideas" para el plan de la semana
- 7 ideas (una por día): Reel, Story, Carrusel, TikTok
- Click en "🎲 Nuevas Ideas" para regenerar

NAVEGAR ENTRE SEMANAS:
- Botones "← Anterior" y "Siguiente →"
- Badge "Esta semana" marca la semana actual

VER EL GUIÓN:
- Click en "✨ Ver guión" en cualquier tarjeta
- Incluye: hook, desarrollo con planos, CTA, música, tips faceless
- Botón "📋 Copiar guión" para copiarlo

EN MÓVIL:
- Las tarjetas son deslizables horizontalmente
- Desliza con el dedo para ver los 7 días

MARCAR COMO PUBLICADO:
- Click en el checkbox de cada tarjeta
- La tarjeta se atenúa al publicarse
- Contador "X/7 publicados" en el header de semana`,
  },
  {
    id: 'ads', icon: Megaphone, color: '#ff4d4d',
    title: 'ADS — Pautas Meta y TikTok',
    content: `Generador de anuncios profesionales y guías de pauta.

SELECCIONAR PLATAFORMA:
- 📘 Meta Ads (Facebook + Instagram)
- 🎵 TikTok Ads

⚡ GENERADOR DE ANUNCIOS:
1. Selecciona producto, objetivo, presupuesto y duración
2. Define ubicación y rango de edad
3. Click "Generar Anuncio"

EL GENERADOR PRODUCE:
- Análisis de tu configuración con advertencias
- Copy completo: titular, texto principal, descripción, CTA
- Audiencia recomendada con intereses específicos
- Distribución del presupuesto en 3 fases
- KPIs a vigilar con valores objetivo para Colombia
- Tips de optimización
- Botones "Copiar" para cada sección

📚 GUÍA PROFESIONAL:
- 4 secciones expandibles por plataforma
- Estructura de campaña, públicos, presupuestos y creatividades
- Específica para Taply NFC en Colombia`,
  },
  {
    id: 'reportes', icon: FileText, color: '#00cfff',
    title: 'Reportes — PDF descargables',
    content: `Genera reportes PDF profesionales por período de fechas.

TIPOS DE REPORTE:
- Reporte de Ventas: detalle de todas las ventas
- Flujo de Caja: ingresos, egresos y balance
- Reporte Ejecutivo: resumen completo (ventas + flujo)

SELECCIONAR EL PERÍODO:
- Fechas manuales (Desde / Hasta)
- Atajos: Este mes, Mes anterior, Últimos 30 días, Este año

GENERAR:
1. Selecciona tipo y período
2. Click "Vista previa" para ver el resumen
3. Click "Descargar PDF" para generar y descargar

EL PDF INCLUYE:
- Header con logo Taply
- Resumen ejecutivo con KPIs
- Tabla detallada de ventas (si aplica)
- Tabla de flujo de caja (si aplica)
- Footer con número de página`,
  },
  {
    id: 'configuracion', icon: Settings, color: '#6b7280',
    title: 'Configuración — Ajustes del sistema',
    content: `Ajustes del sistema y seguridad.

INFORMACIÓN DEL SISTEMA:
- Versión, stack tecnológico, base de datos y región

SEGURIDAD:
- Cambiar contraseña: ingresa la actual y define la nueva (mín. 6 caracteres)
- Cerrar sesión: cierra el acceso al sistema (requiere contraseña para volver)
- La contraseña se guarda localmente — si borras los datos del navegador vuelve a "taply2026"

⚠️ RESETEAR EL SISTEMA (ZONA DE PELIGRO):
Esta función elimina TODOS los datos.

PROCESO DE RESET (3 confirmaciones):
1. Click en "Resetear Todo el Sistema"
2. Primera confirmación: "¿Estás seguro?"
3. Segunda confirmación: escribe la palabra RESETEAR
4. Click en "⚠ Resetear Permanentemente"

QUÉ SE ELIMINA:
- Todas las ventas, clientes, movimientos de caja
- Tareas, contenido semanal y metas
- El inventario queda en 0

⚠️ ESTA ACCIÓN NO SE PUEDE DESHACER`,
  },
  {
    id: 'whatsapp', icon: MessageCircle, color: '#00ff94',
    title: 'WhatsApp Business — Mensajes automáticos',
    content: `El sistema genera mensajes predefinidos para comunicarte con clientes.

DÓNDE ENCONTRAR LOS BOTONES:

EN PEDIDOS:
- Botón "📱 WhatsApp" en cada pedido
- Mensaje del estado actual del pedido
- Ej: "Tu tarjeta Taply Custom está siendo personalizada ⚙️"

EN EL PERFIL DEL CLIENTE:
- Botón "Seguimiento" en el header
- Mensaje de seguimiento post-venta preguntando por la experiencia
- Recuerda que las actualizaciones están incluidas en el servicio

- Ícono de WhatsApp en cada venta del historial
- Envía confirmación de esa venta específica

CÓMO FUNCIONA:
- Click → se abre WhatsApp con el mensaje ya escrito
- Puedes editarlo antes de enviar
- Requiere número de teléfono del cliente registrado

FORMATO DEL NÚMERO:
- Colombia: 3XXXXXXXXX (10 dígitos sin código de país)
- El sistema agrega +57 automáticamente`,
  },
  {
    id: 'seguridad', icon: Shield, color: '#00cfff',
    title: 'Seguridad y acceso',
    content: `El sistema tiene protección por contraseña para evitar accesos no autorizados.

CONTRASEÑA POR DEFECTO:
- taply2026 (cámbiala desde Configuración → Seguridad)

CÓMO CAMBIAR LA CONTRASEÑA:
1. Ve a Configuración en el menú lateral
2. Click en "Cambiar contraseña"
3. Ingresa la contraseña actual
4. Ingresa y confirma la nueva (mínimo 6 caracteres)
5. Click "Guardar contraseña"

CERRAR SESIÓN:
1. Ve a Configuración
2. Click en "Cerrar sesión"
3. Confirma con "Sí, cerrar sesión"
4. Para volver necesitarás tu contraseña

INSTALAR COMO APP (PWA):
- En iPhone/iPad: abre en Safari → Compartir → "Agregar a pantalla de inicio"
- En Android: abre en Chrome → Menú → "Agregar a pantalla de inicio"
- La app se instala sin necesidad de App Store
- Funciona igual que una app nativa

IMPORTANTE:
- La contraseña se guarda en el navegador/dispositivo
- Si borras los datos del navegador, vuelve a "taply2026"
- Cada dispositivo tiene su propia sesión`,
  },
]

export default function GuiaPage() {
  const isMobile = useIsMobile()
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

      // Portada
      doc.setFillColor(...dark); doc.rect(0, 0, pageW, pageH, 'F')
      doc.setTextColor(...cyan); doc.setFontSize(36); doc.setFont('helvetica', 'bold'); doc.text('TAPLY', margin, 60)
      doc.setFontSize(14); doc.setTextColor(...white); doc.setFont('helvetica', 'normal'); doc.text('Sistema de Gestión NFC', margin, 72)
      doc.setFontSize(24); doc.setFont('helvetica', 'bold'); doc.setTextColor(...white); doc.text('Guía de Usuario', margin, 100)
      doc.setFontSize(12); doc.setFont('helvetica', 'normal'); doc.setTextColor(...gray); doc.text('Manual completo · v1.0', margin, 112)
      doc.text(`Actualizado: ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })}`, margin, 120)
      doc.text('https://taply-inventory.vercel.app', margin, 270)
      doc.text('Contraseña por defecto: taply2026', margin, 278)

      // Tabla de contenido
      doc.addPage()
      doc.setFillColor(...dark); doc.rect(0, 0, pageW, 30, 'F')
      doc.setTextColor(...cyan); doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.text('Tabla de Contenido', margin, 20)
      let y = 45
      SECTIONS.forEach((section, i) => {
        doc.setTextColor(...white); doc.setFontSize(11); doc.setFont('helvetica', 'normal')
        doc.text(`${i + 1}. ${section.title}`, margin, y); y += 8
      })

      // Contenido
      SECTIONS.forEach((section, idx) => {
        doc.addPage()
        doc.setFillColor(...dark); doc.rect(0, 0, pageW, 35, 'F')
        doc.setFillColor(...cyan); doc.rect(0, 0, 4, 35, 'F')
        doc.setTextColor(...cyan); doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.text(`${idx + 1} / ${SECTIONS.length}`, margin, 12)
        doc.setTextColor(...white); doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.text(section.title, margin, 24)
        y = 50
        const lines = section.content.split('\n')
        lines.forEach(line => {
          if (y > pageH - 25) { doc.addPage(); doc.setFillColor(...darkGray); doc.rect(0, 0, pageW, 12, 'F'); doc.setTextColor(...gray); doc.setFontSize(8); doc.text(section.title, margin, 8); y = 22 }
          const trimmed = line.trim()
          if (trimmed === '') { y += 3 }
          else if (trimmed.match(/^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s\-\/]+:$/)) {
            if (y > 50) y += 3
            doc.setFillColor(...darkGray); doc.rect(margin - 2, y - 5, contentW + 4, 8, 'F')
            doc.setTextColor(...cyan); doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.text(trimmed, margin, y); y += 7
          } else if (trimmed.startsWith('•') || trimmed.startsWith('→') || trimmed.match(/^\d+\./)) {
            doc.setTextColor(...lightGray); doc.setFontSize(8.5); doc.setFont('helvetica', 'normal')
            const wrappedLines = doc.splitTextToSize(trimmed, contentW - 4)
            wrappedLines.forEach((wl: string) => { if (y > pageH - 25) { doc.addPage(); y = 22 }; doc.text(wl, margin + 3, y); y += 5 })
          } else if (trimmed.startsWith('⚡') || trimmed.startsWith('⚠️') || trimmed.startsWith('📥') || trimmed.startsWith('📘') || trimmed.startsWith('📚') || trimmed.startsWith('🚨')) {
            doc.setTextColor(...cyan); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold')
            const wrappedLines = doc.splitTextToSize(trimmed, contentW)
            wrappedLines.forEach((wl: string) => { doc.text(wl, margin, y); y += 5 })
          } else {
            doc.setTextColor(...lightGray); doc.setFontSize(8.5); doc.setFont('helvetica', 'normal')
            const wrappedLines = doc.splitTextToSize(trimmed, contentW)
            wrappedLines.forEach((wl: string) => { if (y > pageH - 25) { doc.addPage(); y = 22 }; doc.text(wl, margin, y); y += 5 })
          }
        })
      })

      // Footers
      const totalPages = doc.getNumberOfPages()
      for (let i = 2; i <= totalPages; i++) {
        doc.setPage(i); doc.setFillColor(...dark); doc.rect(0, 287, pageW, 10, 'F')
        doc.setTextColor(...gray); doc.setFontSize(8); doc.setFont('helvetica', 'normal')
        doc.text('Taply NFC — Guía de Usuario v1.0', margin, 293)
        doc.text(`Página ${i - 1} de ${totalPages - 1}`, pageW - margin, 293, { align: 'right' })
      }
      doc.save('Taply_Guia_de_Usuario.pdf')
    } catch (err) { console.error('Error:', err) }
    finally { setDownloading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? '24px' : '32px', fontWeight: 900 }} className="taply-gradient-text">Guía de Usuario</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>Manual completo del sistema Taply Inventory</p>
        </div>
        <button onClick={handleDownloadPDF} disabled={downloading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: downloading ? 'not-allowed' : 'pointer', border: 'none',
            background: downloading ? '#2a2a2a' : 'linear-gradient(90deg, #00cfff, #00ff94)', color: downloading ? '#6b7280' : '#0d0d0d' }}>
          <Download size={15} />
          {downloading ? 'Generando...' : 'Descargar PDF'}
        </button>
      </div>

      <div style={{ padding: '16px 20px', borderRadius: '14px', backgroundColor: '#00cfff0d', border: '1px solid #00cfff22', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <BookOpen size={24} style={{ color: '#00cfff', flexShrink: 0 }} />
        <div>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f0f0f0' }}>{SECTIONS.length} secciones · Actualizado con todas las funciones</p>
          <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#6b7280' }}>Haz click en cada sección para expandirla · Descarga el PDF para tenerlo offline</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {SECTIONS.map((section, idx) => {
          const isExpanded = expandedSection === section.id
          const Icon = section.icon
          return (
            <div key={section.id} style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${isExpanded ? section.color + '33' : '#1f1f1f'}`, transition: 'border-color 0.2s ease' }}>
              <button onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                style={{ width: '100%', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: isExpanded ? section.color + '0d' : '#161616', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', backgroundColor: section.color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color: section.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '10px', color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{String(idx + 1).padStart(2, '0')}</span>
                  <p style={{ margin: '1px 0 0', fontSize: isMobile ? '13px' : '14px', fontWeight: 700, color: isExpanded ? section.color : '#f0f0f0' }}>{section.title}</p>
                </div>
                {isExpanded ? <ChevronUp size={16} style={{ color: '#6b7280', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: '#6b7280', flexShrink: 0 }} />}
              </button>
              {isExpanded && (
                <div style={{ padding: '0 18px 18px', backgroundColor: section.color + '0d', borderTop: `1px solid ${section.color}22` }}>
                  <pre style={{ margin: '16px 0 0', fontSize: isMobile ? '12px' : '13px', color: '#d1d5db', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
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
