'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TaplyLogo } from './TaplyLogo'
import { LayoutDashboard, ShoppingCart, Package, Users, Wallet, CheckSquare, Settings } from 'lucide-react'

const navItems = [
  { href: '/',               label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/ventas',         label: 'Ventas',         icon: ShoppingCart },
  { href: '/inventario',     label: 'Inventario',     icon: Package },
  { href: '/clientes',       label: 'Clientes',       icon: Users },
  { href: '/flujo-caja',     label: 'Flujo de Caja',  icon: Wallet },
  { href: '/tareas',         label: 'Tareas',         icon: CheckSquare },
]

const bottomItems = [
  { href: '/configuracion',  label: 'Configuración',  icon: Settings },
]

export function Navbar() {
  const pathname = usePathname()

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
    const isActive = pathname === href
    return (
      <Link href={href} style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '14px 20px', borderRadius: '12px',
        fontSize: '14px', fontWeight: isActive ? 600 : 400,
        textDecoration: 'none', transition: 'all 0.15s ease',
        backgroundColor: isActive ? '#00cfff0d' : 'transparent',
        border: isActive ? '1px solid #00cfff22' : '1px solid transparent',
        color: isActive ? '#00cfff' : '#6b7280',
      }}>
        <Icon size={18} style={{ color: isActive ? '#00cfff' : '#4b5563', flexShrink: 0 }} />
        {label}
      </Link>
    )
  }

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0,
      height: '100vh', width: '300px',
      backgroundColor: '#111111',
      borderRight: '1px solid #1f1f1f',
      display: 'flex', flexDirection: 'column',
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: '36px 32px', borderBottom: '1px solid #1f1f1f' }}>
        <TaplyLogo size="md" showText={true} />
      </div>

      {/* Label */}
      <div style={{ padding: '32px 32px 12px' }}>
        <span style={{ color: '#374151', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Menú Principal
        </span>
      </div>

      {/* Nav principal */}
      <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(item => <NavLink key={item.href} {...item} />)}
      </nav>

      {/* Separador */}
      <div style={{ margin: '0 16px', borderTop: '1px solid #1f1f1f' }} />

      {/* Nav inferior */}
      <div style={{ padding: '12px 16px' }}>
        {bottomItems.map(item => <NavLink key={item.href} {...item} />)}
      </div>

      {/* Footer */}
      <div style={{ padding: '20px 32px', borderTop: '1px solid #1f1f1f' }}>
        <p style={{ color: '#374151', fontSize: '12px', fontWeight: 600, margin: 0 }}>Taply Inventory v1.0</p>
        <p style={{ color: '#1f2937', fontSize: '11px', marginTop: '4px', marginBottom: 0 }}>Sistema de Gestión NFC</p>
      </div>
    </aside>
  )
}
