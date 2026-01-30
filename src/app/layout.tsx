import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Prode Digital',
    default: 'Prode Digital - Tu Plataforma de Pronósticos Deportivos',
  },
  description: "Participa en torneos de predicciones deportivas con amigos. Juega, acierta y gana en Prode Digital.",
  keywords: ["prode", "pronosticos", "futbol", "amigos", "torneos"],
  authors: [{ name: "Prode Digital Team" }],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://prode.digital',
    title: 'Prode Digital',
    description: 'La mejor forma de jugar al prode con amigos.',
    siteName: 'Prode Digital',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Prode Digital Preview'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prode Digital',
    description: 'Juega al prode con amigos y gana.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <main className="min-h-screen flex flex-col">
          <AuthProvider>
            <Navbar />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </AuthProvider>
        </main>
      </body>
    </html>
  )
}
