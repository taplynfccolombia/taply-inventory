'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCOP, formatDate } from '@/lib/utils'
import { FileText, Download, Calendar, TrendingUp, ShoppingCart, DollarSign, Package } from 'lucide-react'

interface ReportData {
  sales: {
    id: string
    sale_date: string
    product_type: string
    quantity: number
    total_revenue: number
    total_cost: number
    total_profit: number
    payment_method: string
    status: string
    client_name: string | null
  }[]
  cashFlow: {
    flow_date: string
    type: string
    category: string
    description: string
    amount: number
  }[]
  summary: {
    totalRevenue: number
    totalCost: number
    totalProfit: number
    totalSales: number
    essentialSales: number
    customSales: number
    totalIngresos: number
    totalEgresos: number
    balance: number
  }
}

type ReportType = 'ventas' | 'flujo' | 'completo'

const REPORT_TYPES: Record<ReportType, { label: string; icon: React.ElementType; desc: string }> = {
  ventas:   { label: 'Reporte de Ventas',      icon: ShoppingCart, desc: 'Detalle de todas las ventas del período' },
  flujo:    { label: 'Flujo de Caja',           icon: DollarSign,   desc: 'Ingresos, egresos y balance del período' },
  completo: { label: 'Reporte Ejecutivo',       icon: TrendingUp,   desc: 'Resumen completo del negocio' },
}

export default function ReportesPage() {
  const [reportType, setReportType] = useState<ReportType>('completo')
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().split('T')[0]
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<ReportData | null>(null)

  async function fetchReportData(): Promise<ReportData> {
    const fromDate = `${dateFrom}T00:00:00`
    const toDate = `${dateTo}T23:59:59`

    const [salesRes, cashRes] = await Promise.all([
      supabase
        .from('sales')
        .select('*, client:clients(full_name)')
        .gte('sale_date', fromDate)
        .lte('sale_date', toDate)
        .order('sale_date', { ascending: true }),
      supabase
        .from('cash_flow')
        .select('*')
        .gte('flow_date', fromDate)
        .lte('flow_date', toDate)
        .order('flow_date', { ascending: true }),
    ])

    const sales = (salesRes.data ?? []).map(s => ({
      id: s.id,
      sale_date: s.sale_date,
      product_type: s.product_type,
      quantity: s.quantity,
      total_revenue: Number(s.total_revenue),
      total_cost: Number(s.total_cost),
      total_profit: Number(s.total_profit),
      payment_method: s.payment_method,
      status: s.status,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client_name: (s.client as any)?.full_name ?? null,
    }))

    const cashFlow = (cashRes.data ?? []).map(c => ({
      flow_date: c.flow_date,
      type: c.type,
      category: c.category,
      description: c.description,
      amount: Number(c.amount),
    }))

    const completedSales = sales.filter(s => s.status === 'completada')
    const totalRevenue = completedSales.reduce((acc, s) => acc + s.total_revenue, 0)
    const totalCost = completedSales.reduce((acc, s) => acc + s.total_cost, 0)
    const totalProfit = completedSales.reduce((acc, s) => acc + s.total_profit, 0)
    const totalIngresos = cashFlow.filter(c => c.type === 'ingreso').reduce((acc, c) => acc + c.amount, 0)
    const totalEgresos = cashFlow.filter(c => c.type === 'egreso').reduce((acc, c) => acc + c.amount, 0)

    return {
      sales,
      cashFlow,
      summary: {
        totalRevenue,
        totalCost,
        totalProfit,
        totalSales: completedSales.length,
        essentialSales: completedSales.filter(s => s.product_type === 'essential').length,
        customSales: completedSales.filter(s => s.product_type === 'custom').length,
        totalIngresos,
        totalEgresos,
        balance: totalIngresos - totalEgresos,
      },
    }
  }

  async function handlePreview() {
    setLoading(true)
    const data = await fetchReportData()
    setPreview(data)
    setLoading(false)
  }

  async function handleDownloadPDF() {
    setLoading(true)
    try {
      const data = preview ?? await fetchReportData()

      // Importar jsPDF dinámicamente
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = doc.internal.pageSize.getWidth()
      const margin = 20

      // ── Colores Taply
      const cyan: [number, number, number] = [0, 207, 255]
      const dark: [number, number, number] = [13, 13, 13]
      const gray: [number, number, number] = [107, 114, 128]
      const white: [number, number, number] = [255, 255, 255]
      const lightGray: [number, number, number] = [240, 240, 240]

      // ── Header
      doc.setFillColor(...dark)
      doc.rect(0, 0, pageW, 40, 'F')
      doc.setTextColor(...cyan)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('TAPLY', margin, 18)
      doc.setFontSize(10)
      doc.setTextColor(...white)
      doc.setFont('helvetica', 'normal')
      doc.text('Sistema de Gestión NFC', margin, 25)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(REPORT_TYPES[reportType].label, margin, 34)

      // ── Período
      doc.setFillColor(...lightGray)
      doc.rect(0, 40, pageW, 12, 'F')
      doc.setTextColor(...dark)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`Período: ${formatDate(dateFrom)} — ${formatDate(dateTo)}`, margin, 48)
      doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, pageW - margin, 48, { align: 'right' })

      let y = 60

      // ── Resumen ejecutivo
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...dark)
      doc.text('Resumen del Período', margin, y)
      y += 8

      const summaryData = [
        ['Ingresos Totales', formatCOP(data.summary.totalRevenue)],
        ['Costo Total', formatCOP(data.summary.totalCost)],
        ['Ganancia Neta', formatCOP(data.summary.totalProfit)],
        ['Ventas Completadas', String(data.summary.totalSales)],
        ['Taply Essential', String(data.summary.essentialSales) + ' uds'],
        ['Taply Custom', String(data.summary.customSales) + ' uds'],
        ['Balance de Caja', formatCOP(data.summary.balance)],
      ]

      autoTable(doc, {
        startY: y,
        head: [['Indicador', 'Valor']],
        body: summaryData,
        margin: { left: margin, right: margin },
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: dark, textColor: white, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        columnStyles: { 1: { fontStyle: 'bold', halign: 'right' } },
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 12

      // ── Ventas (si aplica)
      if ((reportType === 'ventas' || reportType === 'completo') && data.sales.length > 0) {
        if (y > 220) { doc.addPage(); y = 20 }

        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...dark)
        doc.text('Detalle de Ventas', margin, y)
        y += 6

        autoTable(doc, {
          startY: y,
          head: [['Fecha', 'Producto', 'Cliente', 'Cant.', 'Ingreso', 'Ganancia', 'Estado']],
          body: data.sales.map(s => [
            formatDate(s.sale_date),
            s.product_type === 'essential' ? 'Essential' : 'Custom',
            s.client_name ?? '—',
            String(s.quantity),
            formatCOP(s.total_revenue),
            formatCOP(s.total_profit),
            s.status,
          ]),
          margin: { left: margin, right: margin },
          styles: { fontSize: 8.5, cellPadding: 3 },
          headStyles: { fillColor: dark, textColor: white, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 248, 248] },
          columnStyles: {
            4: { halign: 'right' },
            5: { halign: 'right', textColor: [0, 150, 80] },
          },
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 12
      }

      // ── Flujo de Caja (si aplica)
      if ((reportType === 'flujo' || reportType === 'completo') && data.cashFlow.length > 0) {
        if (y > 220) { doc.addPage(); y = 20 }

        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...dark)
        doc.text('Flujo de Caja', margin, y)
        y += 6

        autoTable(doc, {
          startY: y,
          head: [['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto']],
          body: data.cashFlow.map(c => [
            formatDate(c.flow_date),
            c.type === 'ingreso' ? '↑ Ingreso' : '↓ Egreso',
            c.category,
            c.description,
            (c.type === 'ingreso' ? '+' : '-') + formatCOP(c.amount),
          ]),
          margin: { left: margin, right: margin },
          styles: { fontSize: 8.5, cellPadding: 3 },
          headStyles: { fillColor: dark, textColor: white, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 248, 248] },
          columnStyles: {
            4: {
              halign: 'right',
            },
          },
          didParseCell: (hookData) => {
            if (hookData.column.index === 4 && hookData.section === 'body') {
              const text = String(hookData.cell.text)
              hookData.cell.styles.textColor = text.startsWith('+')
                ? [0, 150, 80]
                : [200, 50, 50]
            }
          },
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 12
      }

      // ── Footer en todas las páginas
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFillColor(...dark)
        doc.rect(0, 287, pageW, 10, 'F')
        doc.setTextColor(...gray)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text('Taply NFC — Sistema de Gestión', margin, 293)
        doc.text(`Página ${i} de ${totalPages}`, pageW - margin, 293, { align: 'right' })
      }

      // ── Descargar
      const filename = `Taply_${REPORT_TYPES[reportType].label.replace(/ /g, '_')}_${dateFrom}_${dateTo}.pdf`
      doc.save(filename)

    } catch (err) {
      console.error('Error generando PDF:', err)
    } finally {
      setLoading(false)
    }
  }

  const margin = preview?.summary

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }} className="taply-gradient-text">Reportes</h1>
        <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>
          Genera y descarga reportes PDF del negocio por fechas
        </p>
      </div>

      {/* Configuración del reporte */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Panel izquierdo — config */}
        <div style={{ borderRadius: '16px', padding: '28px', backgroundColor: '#161616', border: '1px solid #1f1f1f', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#f0f0f0' }}>Configurar Reporte</h2>

          {/* Tipo de reporte */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '10px' }}>Tipo de reporte</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(Object.entries(REPORT_TYPES) as [ReportType, typeof REPORT_TYPES[ReportType]][]).map(([key, { label, icon: Icon, desc }]) => (
                <button key={key} onClick={() => setReportType(key)}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                    backgroundColor: reportType === key ? '#00cfff0d' : '#0d0d0d',
                    border: `1px solid ${reportType === key ? '#00cfff33' : '#2a2a2a'}` }}>
                  <Icon size={20} style={{ color: reportType === key ? '#00cfff' : '#4b5563', flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: reportType === key ? '#00cfff' : '#f0f0f0' }}>{label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Fechas */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '10px' }}>
              <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Período
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Desde</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Hasta</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a', color: '#f0f0f0', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Atajos de período */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              {[
                { label: 'Este mes', fn: () => { const d = new Date(); d.setDate(1); setDateFrom(d.toISOString().split('T')[0]); setDateTo(new Date().toISOString().split('T')[0]) } },
                { label: 'Mes anterior', fn: () => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); const from = d.toISOString().split('T')[0]; d.setMonth(d.getMonth() + 1); d.setDate(0); setDateFrom(from); setDateTo(d.toISOString().split('T')[0]) } },
                { label: 'Últimos 30 días', fn: () => { const d = new Date(); d.setDate(d.getDate() - 30); setDateFrom(d.toISOString().split('T')[0]); setDateTo(new Date().toISOString().split('T')[0]) } },
                { label: 'Este año', fn: () => { const d = new Date(); setDateFrom(`${d.getFullYear()}-01-01`); setDateTo(new Date().toISOString().split('T')[0]) } },
              ].map(({ label, fn }) => (
                <button key={label} onClick={fn}
                  style={{ padding: '5px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #2a2a2a', color: '#6b7280' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handlePreview} disabled={loading}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', border: '1px solid #00cfff33', backgroundColor: '#00cfff0d', color: '#00cfff' }}>
              {loading ? 'Cargando...' : '👁️ Vista previa'}
            </button>
            <button onClick={handleDownloadPDF} disabled={loading}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', border: 'none',
                background: loading ? '#2a2a2a' : 'linear-gradient(90deg, #00cfff, #00ff94)',
                color: loading ? '#6b7280' : '#0d0d0d' }}>
              <Download size={16} />
              {loading ? 'Generando...' : 'Descargar PDF'}
            </button>
          </div>
        </div>

        {/* Panel derecho — preview */}
        <div style={{ borderRadius: '16px', padding: '28px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: '#f0f0f0' }}>Vista Previa</h2>

          {!preview && !loading && (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <FileText size={40} style={{ margin: '0 auto 16px', display: 'block', color: '#374151' }} />
              <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>
                Haz click en "Vista previa" para ver el resumen antes de descargar
              </p>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Cargando datos...</p>
            </div>
          )}

          {preview && !loading && margin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* KPIs del reporte */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Ingresos', value: formatCOP(margin.totalRevenue), color: '#00cfff', icon: DollarSign },
                  { label: 'Ganancia', value: formatCOP(margin.totalProfit), color: '#00ff94', icon: TrendingUp },
                  { label: 'Ventas', value: `${margin.totalSales} completadas`, color: '#00cfff', icon: ShoppingCart },
                  { label: 'Balance', value: formatCOP(margin.balance), color: margin.balance >= 0 ? '#00ff94' : '#ff4d4d', icon: Package },
                ].map(({ label, value, color, icon: Icon }) => (
                  <div key={label} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Icon size={14} style={{ color }} />
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>{label}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 900, color }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Desglose productos */}
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f' }}>
                <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#9ca3af' }}>Desglose por producto</p>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#00cfff' }}>{margin.essentialSales}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#6b7280' }}>Essential</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#00ff94' }}>{margin.customSales}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#6b7280' }}>Custom</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#f0f0f0' }}>{preview.sales.length}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#6b7280' }}>Total registros</p>
                  </div>
                </div>
              </div>

              {/* Info del PDF */}
              <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: '#00cfff0d', border: '1px solid #00cfff22' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#00cfff', fontWeight: 600 }}>
                  📄 {REPORT_TYPES[reportType].label}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
                  {formatDate(dateFrom)} — {formatDate(dateTo)}
                  {' · '}{preview.sales.length} ventas · {preview.cashFlow.length} movimientos de caja
                </p>
              </div>

              <button onClick={handleDownloadPDF} disabled={loading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', border: 'none',
                  background: 'linear-gradient(90deg, #00cfff, #00ff94)', color: '#0d0d0d' }}>
                <Download size={18} />
                Descargar PDF Ahora
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
