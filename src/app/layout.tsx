import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { AuthGuard } from '@/components/AuthGuard'

export const metadata: Metadata = {
  title: 'Taply Inventory',
  description: 'Sistema de Gestión NFC — Taply',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Taply',
  },
  icons: {
    apple: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#00cfff',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthGuard>
          <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0d0d0d' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '40px', overflowX: 'hidden' }}>
              {children}
            </main>
          </div>
        </AuthGuard>
      </body>
    </html>
  )
}
