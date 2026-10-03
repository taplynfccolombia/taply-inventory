import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// ── Formateo de moneda colombiana ────────────────────────────────

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ── Formateo de fechas ───────────────────────────────────────────

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString))
}

export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

// ── Etiquetas legibles ───────────────────────────────────────────

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  otro: 'Otro',
}

export const SALE_STATUS_LABELS: Record<string, string> = {
  completada: 'Completada',
  pendiente: 'Pendiente',
  cancelada: 'Cancelada',
}

export const CASH_FLOW_CATEGORY_LABELS: Record<string, string> = {
  venta: 'Venta',
  compra_inventario: 'Compra de Inventario',
  impresion: 'Impresión / Logística',
  imprevisto: 'Imprevisto',
  retiro: 'Retiro',
  otro: 'Otro',
}

// ── WhatsApp Business ────────────────────────────────────────────

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  const phoneWithCode = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${phoneWithCode}?text=${encodedMessage}`
}

export function whatsAppVentaMessage(
  clientName: string,
  product: string,
  quantity: number,
  total: number
): string {
  return `Hola ${clientName} 👋

Te confirmamos tu pedido de *Taply NFC*:

📦 Producto: *${product}*
🔢 Cantidad: ${quantity} unidad${quantity !== 1 ? 'es' : ''}
💰 Total: *${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(total)}*

En breve nos ponemos en contacto contigo para coordinar la entrega. ¡Gracias por tu compra! 🚀

— Equipo Taply NFC`
}

export function whatsAppPedidoMessage(
  clientName: string,
  product: string,
  orderStatus: string
): string {
  const statusMessages: Record<string, string> = {
    recibido:      `Hemos recibido tu pedido y está en cola de producción. ⏳`,
    en_produccion: `Tu tarjeta *${product}* está siendo personalizada en este momento. ⚙️`,
    listo:         `¡Tu tarjeta *${product}* está lista! Coordinaremos la entrega pronto. ✅`,
    enviado:       `Tu pedido ya fue enviado y está en camino. 🚚`,
    entregado:     `¡Tu *${product}* fue entregada con éxito! Esperamos que la disfrutes. 🎉`,
  }

  return `Hola ${clientName} 👋

*Actualización de tu pedido Taply NFC:*

${statusMessages[orderStatus] ?? 'Tu pedido ha sido actualizado.'}

¿Tienes alguna pregunta? Estamos aquí para ayudarte. 💬

— Equipo Taply NFC`
}

export function whatsAppSeguimientoMessage(clientName: string): string {
  return `Hola ${clientName} 👋

Te escribimos desde *Taply NFC* para hacer un seguimiento.

¿Cómo ha sido tu experiencia con tu tarjeta? Nos encantaría saber si la estás usando y si tienes alguna duda o necesitas actualizar tu información.

Recuerda que las actualizaciones de tu perfil están incluidas en el servicio. ✨

— Equipo Taply NFC`
}

// ── Exportar CSV ─────────────────────────────────────────────────

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        const str = value === null || value === undefined ? '' : String(value)
        // Escapar comillas y envolver en comillas si contiene coma o salto de línea
        return str.includes(',') || str.includes('\n') || str.includes('"')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ── Días transcurridos ───────────────────────────────────────────

export function daysSince(dateString: string): number {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}
