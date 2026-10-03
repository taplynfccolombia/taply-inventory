import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Taply — Inventory & Sales',
  description: 'Sistema de gestión de inventario y ventas para Taply NFC',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0d0d0d' }}>
          <Navbar />
          <main style={{
            flex: 1,
            marginLeft: '280px',
            padding: '56px 72px',
            minHeight: '100vh',
            backgroundColor: '#0d0d0d',
            overflowY: 'auto',
          }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
