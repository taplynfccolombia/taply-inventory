'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TaplyLogo } from '@/components/TaplyLogo'
import { MonthlyGoal } from '@/components/MonthlyGoal'
import { formatCOP } from '@/lib/utils'
import { TrendingUp, ShoppingCart, Package, DollarSign, Users, ArrowUpRight } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

interface DashboardStats {
  totalRevenue: number
  totalProfit: number
  totalSales: number
  stockQuantity: number
  totalClients: number
  essentialSales: number
  customSales: number
}

interface SaleData {
  total_revenue: number
  total_profit: number
  product_type: string
  sale_date: string
  status: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatTooltipArea = (value: any, name: any) => {
  return [formatCOP(Number(value)), name === 'ingresos' ? 'Ingresos' : 'Ganancia']
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatTooltipBar = (value: any) => [Number(value), 'Ventas']
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatTooltipPie = (value: any, name: any) => [String(value) + ' uds', String(name)]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0, totalProfit: 0, totalSales: 0,
    stockQuantity: 0, totalClients: 0, essentialSales: 0, customSales: 0,
  })
  const [salesData, setSalesData] = useState<SaleData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [salesRes, inventoryRes, clientsRes] = await Promise.all([
          supabase.from('sales').select('total_revenue, total_profit, product_type, sale_date, status'),
          supabase.from('inventory').select('quantity').eq('item_name', 'Tarjeta Negra Matte Base').single(),
          supabase.from('clients').select('id', { count: 'exact', head: true }),
        ])
        const sales = salesRes.data ?? []
        const completed = sales.filter(s => s.status === 'completada')
        setSalesData(sales)
        setStats({
          totalRevenue: completed.reduce((acc, s) => acc + Number(s.total_revenue), 0),
          totalProfit: completed.reduce((acc, s) => acc + Number(s.total_profit), 0),
          totalSales: completed.length,
          stockQuantity: inventoryRes.data?.quantity ?? 0,
          totalClients: clientsRes.count ?? 0,
          essentialSales: completed.filter(s => s.product_type === 'essential').length,
          customSales: completed.filter(s => s.product_type === 'custom').length,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  // Ventas del mes actual
  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthSales = salesData.filter(s =>
    s.sale_date.startsWith(currentMonthKey) && s.status === 'completada'
  )
  const monthRevenue = monthSales.reduce((acc, s) => acc + Number(s.total_revenue), 0)
  const monthSalesCount = monthSales.length

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().split('T')[0]
    const label = d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })
    const daySales = salesData.filter(s => s.sale_date.startsWith(key) && s.status === 'completada')
    return {
      dia: label,
      ingresos: daySales.reduce((acc, s) => acc + Number(s.total_revenue), 0),
      ganancia: daySales.reduce((acc, s) => acc + Number(s.total_profit), 0),
      ventas: daySales.length,
    }
  })

  const pieData = [
    { name: 'Essential', value: stats.essentialSales, color: '#00cfff' },
    { name: 'Custom',    value: stats.customSales,    color: '#00ff94' },
  ].filter(d => d.value > 0)

  const kpis = [
    { label: 'Ingresos Totales',     value: formatCOP(stats.totalRevenue),  icon: DollarSign,   color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22' },
    { label: 'Ganancia Neta',        value: formatCOP(stats.totalProfit),   icon: TrendingUp,   color: '#00ff94', bg: '#00ff940d', border: '#00ff9422' },
    { label: 'Ventas Completadas',   value: String(stats.totalSales),       icon: ShoppingCart, color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22' },
    { label: 'Stock Disponible',     value: String(stats.stockQuantity),    icon: Package,
      color:  stats.stockQuantity < 5 ? '#ff4d4d' : '#00ff94',
      bg:     stats.stockQuantity < 5 ? '#ff4d4d0d' : '#00ff940d',
      border: stats.stockQuantity < 5 ? '#ff4d4d22' : '#00ff9422' },
    { label: 'Clientes Registrados', value: String(stats.totalClients),     icon: Users,        color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22' },
  ]

  const tooltipStyle = {
    backgroundColor: '#161616',
    border: '1px solid #2a2a2a',
    borderRadius: '10px',
    color: '#f0f0f0',
    fontSize: '13px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <TaplyLogo size="md" showText={false} />
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }} className="taply-gradient-text">Dashboard</h1>
          </div>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Resumen general del negocio Taply NFC</p>
        </div>
        <div style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: '#00ff940d', border: '1px solid #00ff9422', color: '#00ff94', fontSize: '12px', fontWeight: 600 }}>
          ● Sistema Activo
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        {loading
          ? [...Array(5)].map((_, i) => (
              <div key={i} style={{ borderRadius: '16px', padding: '24px', backgroundColor: '#161616', border: '1px solid #1f1f1f', height: '120px' }} />
            ))
          : kpis.map(({ label, value, icon: Icon, color, bg, border }) => (
              <div key={label} style={{ borderRadius: '16px', padding: '24px', backgroundColor: bg, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Icon size={20} style={{ color }} />
                  <ArrowUpRight size={14} style={{ color: '#374151' }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, color }}>{value}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>{label}</p>
                </div>
              </div>
            ))
        }
      </div>

      {/* Meta mensual */}
      <MonthlyGoal
        currentRevenue={monthRevenue}
        currentSales={monthSalesCount}
      />

      {/* Gráfica de área */}
      <div style={{ borderRadius: '16px', padding: '28px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
        <h2 style={{ margin: '0 0 24px', fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>
          Ingresos y Ganancias — Últimos 7 días
        </h2>
        {loading ? (
          <div style={{ height: '240px', borderRadius: '10px', backgroundColor: '#0d0d0d' }} />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={last7Days} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="gradIngreso" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00cfff" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00cfff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradGanancia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff94" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00ff94" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
              <XAxis dataKey="dia" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => v === 0 ? '0' : `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={formatTooltipArea} />
              <Area type="monotone" dataKey="ingresos" stroke="#00cfff" strokeWidth={2} fill="url(#gradIngreso)" />
              <Area type="monotone" dataKey="ganancia" stroke="#00ff94" strokeWidth={2} fill="url(#gradGanancia)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Fila: Barras + Pie */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ borderRadius: '16px', padding: '28px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>
            Unidades Vendidas — Últimos 7 días
          </h2>
          {loading ? (
            <div style={{ height: '200px', borderRadius: '10px', backgroundColor: '#0d0d0d' }} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={last7Days} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="dia" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={formatTooltipBar} />
                <Bar dataKey="ventas" radius={[6, 6, 0, 0]}>
                  {last7Days.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? '#00cfff' : '#00ff94'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ borderRadius: '16px', padding: '28px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>
            Distribución por Producto
          </h2>
          {loading ? (
            <div style={{ height: '200px', borderRadius: '10px', backgroundColor: '#0d0d0d' }} />
          ) : pieData.length === 0 ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#4b5563', fontSize: '14px' }}>Sin ventas aún</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={4} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={formatTooltipPie} />
                <Legend formatter={value => <span style={{ color: '#9ca3af', fontSize: '13px' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #1f1f1f' }}>
              {[
                { label: 'Essential', value: stats.essentialSales, color: '#00cfff' },
                { label: 'Custom',    value: stats.customSales,    color: '#00ff94' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'center', padding: '12px', borderRadius: '10px', backgroundColor: '#0d0d0d' }}>
                  <p style={{ margin: 0, fontSize: '22px', fontWeight: 900, color }}>{value}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
