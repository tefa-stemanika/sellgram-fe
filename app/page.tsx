import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Bot, Check, CreditCard, KeyRound, LayoutDashboard, Package, ShieldCheck, ShoppingCart, Sparkles, X, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatIDRCurrency } from '@/lib/utils'
import { getPlanLabel, PLAN_MATRIX } from '@/schemas/subscription'

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
    icon: LayoutDashboard,
    gradient: 'from-primary/10 to-blue-100/50'
  },
  {
    title: 'Manajemen Produk Fleksibel',
    description: 'Tambah, ubah, dan nonaktifkan produk kapan saja dengan alur CRUD yang sederhana untuk tim operasional.',
    icon: Package,
    gradient: 'from-emerald-50 to-emerald-100/50'
  },
  {
    title: 'Konfigurasi Bot Pintar',
    description:
      'Atur mode bot (polling/webhook), aktifkan AI Gemini, dan sesuaikan environment pembayaran sesuai kebutuhan.',
    icon: Bot,
    gradient: 'from-violet-50 to-violet-100/50'
  },
  {
    title: 'Credential Aman',
    description: 'Simpan kunci integrasi Telegram, Gemini, dan Midtrans secara terkelola dengan tampilan yang aman.',
    icon: KeyRound,
    gradient: 'from-amber-50 to-amber-100/50'
  },
  {
    title: 'Order Tracking End-to-End',
    description:
      'Lihat status order dari pending sampai completed, termasuk detail item dan akses cepat ke link pembayaran.',
    icon: ShoppingCart,
    gradient: 'from-orange-50 to-orange-100/50'
  },
  {
    title: 'Siap Monetisasi',
    description: 'Integrasi Midtrans Sandbox/Production memudahkan bisnis Anda menerima pembayaran lebih cepat.',
    icon: CreditCard,
    gradient: 'from-cyan-50 to-cyan-100/50'
  }
]

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative mx-auto container md:max-w-6xl px-6 pb-24 pt-16 md:px-8 md:pb-32 md:pt-20">
        <div className="pointer-events-none absolute -right-60 -top-60 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="pointer-events-none absolute -left-40 top-40 h-[400px] w-[400px] rounded-full bg-blue-200/20 blur-[100px]" />

        <div className="relative">
          <div className="mx-auto mt-8 max-w-6xl text-center">
            <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Kelola order bot bisnis Anda dari{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                satu dashboard
              </span>{' '}
              yang cepat dan intuitif.
            </h1>

            <p className="mx-auto mt-5 max-w-4xl text-base text-muted-foreground md:text-lg">
              Platform ini membantu Anda mengatur katalog produk, konfigurasi bot, credential integrasi, dan pelacakan
              order dalam satu alur kerja terstruktur untuk operasional harian.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20">
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
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="group border-0 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <CardHeader>
                  <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}>
                    <Icon className="h-5 w-5 text-foreground" />
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

        <div className="mt-16">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Harga
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
            Pilih paket yang sesuai
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Semua paket sudah termasuk akses penuh ke dashboard, manajemen produk, dan pelacakan
            order. Upgrade kapan saja sesuai kebutuhan.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {PLAN_MATRIX.map((plan) => {
              const planLabel = getPlanLabel(plan.name as any)
              const isFree = plan.name === 'FREE'
              const features = [
                `Produk: ${plan.products === 'Tak terbatas' ? 'Tak terbatas' : `${plan.products} produk`}`,
                `Broadcast Template: ${plan.templates === 'Tak terbatas' ? 'Tak terbatas' : `${plan.templates} template`}`,
                `Broadcast/bln: ${plan.maxBroadcasts === 'Tak terbatas' ? 'Tak terbatas' : plan.maxBroadcasts === 0 ? 'Tidak ada' : `${plan.maxBroadcasts}x`}`,
                `Max Order/bln: ${plan.maxOrders === 'Tak terbatas' ? 'Tak terbatas' : `${plan.maxOrders} order`}`,
                'Fulfillment',
              ]
              return (
              <Card
                key={plan.name}
                className={`group relative border-0 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${plan.popular ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white shadow-lg">
                      Terpopuler
                    </span>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-lg">{planLabel}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">
                      {isFree ? 'Gratis' : formatIDRCurrency(plan.monthlyPrice)}
                    </span>
                    {!isFree && <span className="text-sm text-muted-foreground">/bln</span>}
                  </div>
                  {!isFree && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      atau {formatIDRCurrency(plan.yearlyPrice)}/thn (hemat 2 bln)
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  {features.map((feature) => {
                    const isUnavailable = feature.includes('Tidak ada')
                    return (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      {isUnavailable ? (
                        <X className="h-4 w-4 text-red-400" />
                      ) : (
                        <Check className="h-4 w-4 text-emerald-500" />
                      )}
                      <span>{feature}</span>
                    </div>
                  )})}

                  <Button asChild className="mt-4 w-full" variant={isFree ? 'default' : 'outline'}>
                    <Link href={isFree ? '/register' : '/plan'}>
                      {isFree ? 'Mulai Gratis' : `Pilih ${planLabel}`}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )})}
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Kenapa Sellgram</span>
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">Cocok untuk bisnis Anda</h2>
          <div className="mt-6 grid gap-5 text-sm text-muted-foreground md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-5">
              <div className="mb-2 text-lg">📦</div>
              <p className="font-medium text-foreground">Data Terpusat</p>
              <p className="mt-1">Operasional lebih rapi karena data produk, order, dan konfigurasi bot terpusat dalam satu platform.</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-5">
              <div className="mb-2 text-lg">⚡</div>
              <p className="font-medium text-foreground">Efisiensi Tim</p>
              <p className="mt-1">Tim bisa bergerak lebih cepat dengan UI yang konsisten dan aksi penting yang langsung bisa dieksekusi.</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-5">
              <div className="mb-2 text-lg">🔒</div>
              <p className="font-medium text-foreground">Keamanan Terjaga</p>
              <p className="mt-1">Integrasi kunci bisnis Anda tetap aman, sambil tetap fleksibel untuk pertumbuhan layanan ke depan.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
