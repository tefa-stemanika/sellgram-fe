import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Bot, CreditCard, KeyRound, LayoutDashboard, Package, ShieldCheck, ShoppingCart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Buat Bot Order Telegram Bisnis Kamu',
  description:
    'Sellgram membantu bisnis mengelola order Telegram dengan dashboard modern untuk produk, pembayaran Midtrans, dan monitoring operasional.',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'Sellgram | Buat Bot Order Telegram Bisnis Kamu',
    description: 'Platform all-in-one untuk manajemen produk, order, credential, dan integrasi pembayaran di bot Telegram.',
    url: '/',
    images: [
      {
        url: '/images/sellgram_seo.png',
        width: 1200,
        height: 630,
        alt: 'Sellgram - Buat Bot Order Telegram Bisnis Kamu'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sellgram | Buat Bot Order Telegram Bisnis Kamu',
    description:
      'Dashboard modern untuk mengelola bot order Telegram bisnis dengan integrasi Midtrans dan workflow operasional.',
    images: ['/images/sellgram_seo.png']
  }
}

const features = [
  {
    title: 'Dashboard Operasional Real-time',
    description: 'Pantau performa bisnis dari satu layar: produk aktif, volume order, dan pendapatan terbaru secara cepat.',
    icon: LayoutDashboard
  },
  {
    title: 'Manajemen Produk Fleksibel',
    description: 'Tambah, ubah, dan nonaktifkan produk kapan saja dengan alur CRUD yang sederhana untuk tim operasional.',
    icon: Package
  },
  {
    title: 'Konfigurasi Bot Pintar',
    description:
      'Atur mode bot (polling/webhook), aktifkan AI Gemini, dan sesuaikan environment pembayaran sesuai kebutuhan.',
    icon: Bot
  },
  {
    title: 'Credential Aman',
    description: 'Simpan kunci integrasi Telegram, Gemini, dan Midtrans secara terkelola dengan tampilan yang aman.',
    icon: KeyRound
  },
  {
    title: 'Order Tracking End-to-End',
    description:
      'Lihat status order dari pending sampai completed, termasuk detail item dan akses cepat ke link pembayaran.',
    icon: ShoppingCart
  },
  {
    title: 'Siap Monetisasi',
    description: 'Integrasi Midtrans Sandbox/Production memudahkan bisnis Anda menerima pembayaran lebih cepat.',
    icon: CreditCard
  }
]

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-10 md:px-8 md:pb-24 md:pt-14">
        <header className="rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 shadow-2xl p-8 md:p-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl px-4 py-2 text-xs font-semibold tracking-wide text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            SAAS Dashboard for Telegram Order Bot
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Kelola order bot bisnis Anda dari satu dashboard yang cepat dan intuitif.
          </h1>

          <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            Platform ini membantu Anda mengatur katalog produk, konfigurasi bot, credential integrasi, dan pelacakan order
            dalam satu alur kerja terstruktur untuk operasional harian.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href="/register">
                Mulai Gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Masuk Dashboard</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/dashboard">Lihat App</Link>
            </Button>
          </div>
        </header>

        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="bg-white/20 backdrop-blur-xl border border-white/20 shadow-2xl">
                <CardHeader>
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl border border-white/20 shadow-2xl">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <section className="mt-12 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/20 shadow-2xl p-8 md:mt-16 md:p-10">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Kenapa cocok untuk bisnis Anda?</h2>
          <div className="mt-5 grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
            <p>Operasional lebih rapi karena data produk, order, dan konfigurasi bot terpusat dalam satu platform.</p>
            <p>Tim bisa bergerak lebih cepat dengan UI yang konsisten dan aksi penting yang langsung bisa dieksekusi.</p>
            <p>Integrasi kunci bisnis Anda tetap aman, sambil tetap fleksibel untuk pertumbuhan layanan ke depan.</p>
          </div>
        </section>
      </section>
    </main>
  )
}
