import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'BioActiva CRM',
  description: 'Sistema de gestión comercial BioActiva',
}

// La CSP estricta usa un nonce por request (definido en src/proxy.ts). El nonce
// solo puede inyectarse en render dinamico; por eso se fuerza el render dinamico
// de todas las rutas para que los scripts/estilos de Next lleven el nonce y no
// sean bloqueados por la politica.
export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}