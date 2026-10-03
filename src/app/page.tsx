'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCOP } from '@/lib/utils'
import { TrendingUp, ShoppingCart, Package, Users, DollarSign, AlertTriangle, TrendingDown } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { MonthlyGoal } from '@/components/MonthlyGoal'

type Period = 'week' | 'month' | 'all'

interface DailyData {
  date: string
  ingresos: number
  ganancias: number
  ventas: number
}

interface PeriodStats {
  revenue: number
  profit: number
  sales: number
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [loading, setLoading] = useState(true)
  const [stockQty, setStockQty] = useState(0)
  const [totalClients, setTotalClients] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)
  const [totalSales, setTotalSales] = useState(0)
  const [essentialCount, setEssentialCount] = useState(0)
  const [customCount, setCustomCount] = useState(0)
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [pendingRevenue, setPendingRevenue] = useState(0)
  const [prevStats, setPrevStats] = useState<PeriodStats | null>(null)

  function getDateRange(p: Period): { from: string; to: string } {
    const now = new Date()
    const to = now.toISOString()
    if (p === 'week') {
      const from = new Date(now); from.setDate(from.getDate() - 7)
      return { from: from.toISOString(), to }
    }
    if (p === 'month') {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: from.toISOString(), to }
    }
    return { from: '2020-01-01T00:00:00Z', to }
  }

  function getPrevDateRange(p: Period): { from: string; to: string } | null {
    const now = new Date()
    if (p === 'week') {
      const to = new Date(now); to.setDate(to.getDate() - 7)
      const from = new Date(to); from.setDate(from.getDate() - 7)
      return { from: from.toISOString(), to: to.toISOString() }
    }
    if (p === 'month') {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      return { from: from.toISOString(), to: to.toISOString() }
    }
    return null
  }

  function getPctChange(current: number, prev: number): number | null {
    if (prev === 0) return current > 0 ? 100 : null
    return Math.round(((current - prev) / prev) * 100)
  }

  async function fetchData(p: Period) {
    setLoading(true)
    const { from, to } = getDateRange(p)
    const prevRange = getPrevDateRange(p)

    const [salesRes, inventoryRes, clientsRes, pendingRes] = await Promise.all([
      supabase.from('sales').select('*').eq('status', 'completada').gte('sale_date', from).lte('sale_date', to),
      supabase.from('inventory').select('quantity').eq('item_name', 'Tarjeta Negra Matte Base').single(),
      supabase.from('clients').select('id', { count: 'exact' }),
      supabase.from('sales').select('total_revenue').eq('status', 'pendiente'),
    ])

    const sales = salesRes.data ?? []
    const rev = sales.reduce((acc, s) => acc + Number(s.total_revenue), 0)
    const prof = sales.reduce((acc, s) => acc + Number(s.total_profit), 0)
    setTotalRevenue(rev)
    setTotalProfit(prof)
    setTotalSales(sales.length)
    setEssentialCount(sales.filter(s => s.product_type === 'essential').length)
    setCustomCount(sales.filter(s => s.product_type === 'custom').length)
    setStockQty(inventoryRes.data?.quantity ?? 0)
    setTotalClients(clientsRes.count ?? 0)
    const pending = pendingRes.data ?? []
    setPendingCount(pending.length)
    setPendingRevenue(pending.reduce((acc, s) => acc + Number(s.total_revenue), 0))

    // Período anterior
    if (prevRange) {
      const prevRes = await supabase
        .from('sales')
        .select('total_revenue, total_profit')
        .eq('status', 'completada')
        .gte('sale_date', prevRange.from)
        .lte('sale_date', prevRange.to)
      const prevData = prevRes.data ?? []
      setPrevStats({
        revenue: prevData.reduce((acc, s) => acc + Number(s.total_revenue), 0),
        profit: prevData.reduce((acc, s) => acc + Number(s.total_profit), 0),
        sales: prevData.length,
      })
    } else {
      setPrevStats(null)
    }

    // Datos diarios últimos 7 días
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split('T')[0]
    })
    const daily: DailyData[] = last7.map(date => {
      const daySales = sales.filter(s => s.sale_date?.startsWith(date))
      return {
        date: new Date(date + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' }),
        ingresos: daySales.reduce((acc, s) => acc + Number(s.total_revenue), 0),
        ganancias: daySales.reduce((acc, s) => acc + Number(s.total_profit), 0),
        ventas: daySales.length,
      }
    })
    setDailyData(daily)
    setLoading(false)
  }

  useEffect(() => { fetchData(period) }, [period])

  const PERIOD_LABELS: Record<Period, string> = { week: 'Esta semana', month: 'Este mes', all: 'Todo el tiempo' }
  const PREV_LABELS: Record<Period, string> = { week: 'semana pasada', month: 'mes pasado', all: '' }

  const pieData = [
    { name: 'Essential', value: essentialCount, color: '#00cfff' },
    { name: 'Custom', value: customCount, color: '#00ff94' },
  ].filter(d => d.value > 0)

  const stockStatus = stockQty === 0 ? 'sin_stock' : stockQty < 5 ? 'bajo' : 'ok'
  const stockColor = stockStatus === 'sin_stock' ? '#ff4d4d' : stockStatus === 'bajo' ? '#ffb547' : '#00ff94'

  function PctBadge({ current, prev }: { current: number; prev: number }) {
    const pct = getPctChange(current, prev)
    if (pct === null) return null
    const up = pct >= 0
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
        backgroundColor: up ? '#00ff940d' : '#ff4d4d0d',
        color: up ? '#00ff94' : '#ff4d4d',
        border: `1px solid ${up ? '#00ff9422' : '#ff4d4d22'}` }}>
        {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {up ? '+' : ''}{pct}%
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }} className="taply-gradient-text">Dashboard</h1>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#6b7280' }}>Resumen del negocio Taply NFC</p>
        </div>
        <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
          {(['week', 'month', 'all'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: '8px 16px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none',
                backgroundColor: period === p ? '#00cfff0d' : 'transparent',
                color: period === p ? '#00cfff' : '#6b7280' }}>
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Alertas */}
      {stockStatus !== 'ok' && (
        <div style={{ padding: '14px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px',
          backgroundColor: stockStatus === 'sin_stock' ? '#ff4d4d0d' : '#ffb5470d',
          border: `1px solid ${stockStatus === 'sin_stock' ? '#ff4d4d22' : '#ffb54722'}` }}>
          <AlertTriangle size={18} style={{ color: stockColor, flexShrink: 0 }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: stockColor }}>
            {stockStatus === 'sin_stock'
              ? '🚨 Sin stock disponible — Ve a Inventario para reabastecer antes de registrar nuevas ventas.'
              : `⚠ Stock bajo: solo quedan ${stockQty} unidad${stockQty !== 1 ? 'es' : ''} — Considera reabastecer pronto.`}
          </span>
        </div>
      )}

      {pendingCount > 0 && (
        <div style={{ padding: '14px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffb5470d', border: '1px solid #ffb54722' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={18} style={{ color: '#ffb547', flexShrink: 0 }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffb547' }}>
              ⚠ {pendingCount} cobro{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''} por {formatCOP(pendingRevenue)}
            </span>
          </div>
          <a href="/ventas" style={{ fontSize: '12px', fontWeight: 700, color: '#ffb547', textDecoration: 'none', padding: '6px 14px', borderRadius: '8px', border: '1px solid #ffb54733', backgroundColor: '#ffb5470d' }}>
            Ver ventas →
          </a>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        {[
          { label: 'Ingresos', value: formatCOP(totalRevenue), color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22', icon: DollarSign, prev: prevStats?.revenue ?? null, current: totalRevenue },
          { label: 'Ganancia', value: formatCOP(totalProfit),  color: '#00ff94', bg: '#00ff940d', border: '#00ff9422', icon: TrendingUp, prev: prevStats?.profit ?? null, current: totalProfit },
          { label: 'Ventas',   value: String(totalSales),      color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22', icon: ShoppingCart, prev: prevStats?.sales ?? null, current: totalSales },
          { label: 'Stock',    value: String(stockQty),        color: stockColor, bg: stockColor + '0d', border: stockColor + '22', icon: Package, prev: null, current: stockQty },
          { label: 'Clientes', value: String(totalClients),    color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22', icon: Users, prev: null, current: totalClients },
        ].map(({ label, value, color, bg, border, icon: Icon, prev, current }) => (
          <div key={label} style={{ borderRadius: '16px', padding: '24px', backgroundColor: bg, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>{label}</span>
              <Icon size={18} style={{ color }} />
            </div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 900, color }}>{value}</p>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', minHeight: '20px' }}>
              {prev !== null && period !== 'all' ? (
                <><PctBadge current={current} prev={prev} /><span style={{ fontSize: '11px', color: '#374151' }}>vs {PREV_LABELS[period]}</span></>
              ) : (
                <span style={{ fontSize: '11px', color: '#374151' }}>{PERIOD_LABELS[period]}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Meta mensual */}
      <MonthlyGoal currentRevenue={totalRevenue} currentSales={totalSales} />

      {/* Gráficas */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ borderRadius: '16px', padding: '24px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 700, color: '#f0f0f0' }}>Ingresos y Ganancias — Últimos 7 días</h3>
          {loading ? <div style={{ height: '200px', backgroundColor: '#0d0d0d', borderRadius: '8px' }} /> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="gIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00cfff" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#00cfff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gGanancias" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff94" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#00ff94" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#f0f0f0' }}
                  formatter={(value) => [formatCOP(Number(value))]} />
                <Area type="monotone" dataKey="ingresos" stroke="#00cfff" strokeWidth={2} fill="url(#gIngresos)" name="Ingresos" />
                <Area type="monotone" dataKey="ganancias" stroke="#00ff94" strokeWidth={2} fill="url(#gGanancias)" name="Ganancias" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ borderRadius: '16px', padding: '24px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 700, color: '#f0f0f0' }}>Essential vs Custom</h3>
          {loading || pieData.length === 0 ? (
            <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#374151', fontSize: '13px' }}>Sin datos en el período</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#f0f0f0' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '8px' }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: d.color }} />
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{d.name}</span>
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 900, color: d.color }}>{d.value}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Barras */}
      <div style={{ borderRadius: '16px', padding: '24px', backgroundColor: '#161616', border: '1px solid #1f1f1f' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 700, color: '#f0f0f0' }}>Ventas por día — Últimos 7 días</h3>
        {loading ? <div style={{ height: '160px', backgroundColor: '#0d0d0d', borderRadius: '8px' }} /> : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dailyData}>
              <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#f0f0f0' }} />
              <Bar dataKey="ventas" fill="#00cfff" radius={[4, 4, 0, 0]} name="Ventas" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Desglose por producto */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {[
          { label: 'Taply Essential', count: essentialCount, revenue: essentialCount * 100000, profit: essentialCount * 98000,  color: '#00cfff', bg: '#00cfff0d', border: '#00cfff22' },
          { label: 'Taply Custom',    count: customCount,    revenue: customCount * 130000,    profit: customCount * 108800,    color: '#00ff94', bg: '#00ff940d', border: '#00ff9422' },
        ].map(({ label, count, revenue, profit, color, bg, border }) => (
          <div key={label} style={{ borderRadius: '14px', padding: '20px 24px', backgroundColor: bg, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color }}>{label}</span>
              <span style={{ fontSize: '28px', fontWeight: 900, color }}>{count}</span>
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>Ingresos</p>
                <p style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: 700, color }}>{formatCOP(revenue)}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>Ganancia</p>
                <p style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: 700, color: '#00ff94' }}>{formatCOP(profit)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
