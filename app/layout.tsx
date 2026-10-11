import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from './_components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const metadataBase = new URL(siteUrl)

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
})

export const metadata: Metadata = {
  metadataBase,
  applicationName: 'Sellgram',
  title: {
    default: 'Sellgram | Dashboard Bot Order Telegram Bisnis',
    template: '%s | Sellgram'
  },
  description:
    'Sellgram adalah platform dashboard untuk mengelola bot order Telegram bisnis: produk, order, credential, dan integrasi Midtrans dalam satu tempat.',
  keywords: [
    'Sellgram',
    'Telegram bot order',
    'dashboard order Telegram',
    'SaaS bot bisnis',
    'Midtrans integration',
    'manajemen order'
  ],
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: 'Sellgram',
    title: 'Sellgram | Buat Bot Order Telegram Bisnis Kamu',
    description:
      'Kelola produk, konfigurasi bot, dan transaksi pembayaran dalam dashboard operasional yang cepat dan elegan.',
    images: [
      {
        url: '/images/sellgram_seo.png',
        width: 1200,
        height: 630,
        alt: 'Sellgram - Dashboard Bot Order Telegram'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sellgram | Buat Bot Order Telegram Bisnis Kamu',
    description: 'Dashboard SaaS untuk operasional bot order Telegram: produk, order, credential, dan pembayaran Midtrans.',
    images: ['/images/sellgram_seo.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico'
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F7F5' },
    { media: '(prefers-color-scheme: dark)', color: '#0D0E0C' }
  ],
  colorScheme: 'light dark'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} font-sans antialiased relative`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
