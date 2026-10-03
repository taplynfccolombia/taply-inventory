'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TaplyLogo } from './TaplyLogo'
import { LayoutDashboard, ShoppingCart, Package, Users, Wallet, CheckSquare, Sparkles, Settings, ChevronLeft, ChevronRight, Menu, Megaphone, FileText } from 'lucide-react'

const navItems = [
  { href: '/',               label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/ventas',         label: 'Ventas',         icon: ShoppingCart },
  { href: '/inventario',     label: 'Inventario',     icon: Package },
  { href: '/clientes',       label: 'Clientes',       icon: Users },
  { href: '/flujo-caja',     label: 'Flujo de Caja',  icon: Wallet },
  { href: '/tareas',         label: 'Tareas',         icon: CheckSquare },
  { href: '/contenido',      label: 'Contenido',      icon: Sparkles },
  { href: '/ads',            label: 'ADS',            icon: Megaphone },
  { href: '/reportes',       label: 'Reportes',       icon: FileText },
]

const bottomItems = [
  { href: '/configuracion',  label: 'Configuración',  icon: Settings },
]

const SIDEBAR_COLLAPSED = 72

export function Navbar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const width = collapsed ? SIDEBAR_COLLAPSED : 300

  return (
    <>
      <aside style={{
        position: 'fixed', left: 0, top: 0,
        height: '100vh', width: `${width}px`,
        backgroundColor: '#111111',
        borderRight: '1px solid #1f1f1f',
        display: 'flex', flexDirection: 'column',
        zIndex: 50, transition: 'width 0.25s ease',
        overflow: 'hidden',
      }}>
        {/* Logo + toggle */}
        <div style={{ padding: collapsed ? '28px 0' : '32px 28px', borderBottom: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', transition: 'padding 0.25s ease' }}>
          {!collapsed && <TaplyLogo size="sm" showText={true} />}
          {collapsed ? (
            <button onClick={() => setCollapsed(false)}
              style={{ padding: '8px', borderRadius: '10px', cursor: 'pointer', backgroundColor: '#00cfff0d', border: '1px solid #00cfff22', color: '#00cfff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Menu size={18} />
            </button>
          ) : (
            <button onClick={() => setCollapsed(true)}
              style={{ padding: '6px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #2a2a2a', color: '#4b5563', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {!collapsed && (
          <div style={{ padding: '24px 28px 10px' }}>
            <span style={{ color: '#374151', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Menú Principal
            </span>
          </div>
        )}

        <nav style={{ flex: 1, padding: collapsed ? '16px 12px' : '8px 16px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link key={href} href={href} title={collapsed ? label : undefined}
                style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : '14px', padding: collapsed ? '12px' : '12px 18px', borderRadius: '12px', fontSize: '14px', fontWeight: isActive ? 600 : 400, textDecoration: 'none', transition: 'all 0.15s ease', justifyContent: collapsed ? 'center' : 'flex-start',
                  backgroundColor: isActive ? '#00cfff0d' : 'transparent',
                  border: isActive ? '1px solid #00cfff22' : '1px solid transparent',
                  color: isActive ? '#00cfff' : '#6b7280' }}>
                <Icon size={18} style={{ color: isActive ? '#00cfff' : '#4b5563', flexShrink: 0 }} />
                {!collapsed && label}
              </Link>
            )
          })}
        </nav>

        <div style={{ margin: collapsed ? '0 12px' : '0 16px', borderTop: '1px solid #1f1f1f' }} />

        <div style={{ padding: collapsed ? '12px' : '12px 16px' }}>
          {bottomItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link key={href} href={href} title={collapsed ? label : undefined}
                style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : '14px', padding: collapsed ? '12px' : '12px 18px', borderRadius: '12px', fontSize: '14px', fontWeight: isActive ? 600 : 400, textDecoration: 'none', transition: 'all 0.15s ease', justifyContent: collapsed ? 'center' : 'flex-start',
                  backgroundColor: isActive ? '#00cfff0d' : 'transparent',
                  border: isActive ? '1px solid #00cfff22' : '1px solid transparent',
                  color: isActive ? '#00cfff' : '#6b7280' }}>
                <Icon size={18} style={{ color: isActive ? '#00cfff' : '#4b5563', flexShrink: 0 }} />
                {!collapsed && label}
              </Link>
            )
          })}
        </div>

        {!collapsed && (
          <div style={{ padding: '20px 28px', borderTop: '1px solid #1f1f1f' }}>
            <p style={{ color: '#374151', fontSize: '12px', fontWeight: 600, margin: 0 }}>Taply Inventory v1.0</p>
            <p style={{ color: '#1f2937', fontSize: '11px', marginTop: '4px', marginBottom: 0 }}>Sistema de Gestión NFC</p>
          </div>
        )}

        {collapsed && (
          <div style={{ padding: '16px 12px', borderTop: '1px solid #1f1f1f' }}>
            <button onClick={() => setCollapsed(false)}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid #2a2a2a', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </aside>

      <style>{`
        main { margin-left: ${width}px !important; transition: margin-left 0.25s ease; }
      `}</style>
    </>
  )
}
