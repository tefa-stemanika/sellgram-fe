import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, Database, Megaphone, ShieldCheck, ShoppingCart, Sparkles, X, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Surface } from '@/components/shared/surface'
import { TelegramChatPreview } from '@/components/shared/telegram-chat-preview'
import { formatIDRCurrency } from '@/lib/utils'
import { getPlanLabel, PLAN_MATRIX, type Plan } from '@/schemas/subscription'

export const metadata: Metadata = {
  title: 'Buat Bot Order Telegram Bisnis Kamu',
  description:
    'Sellgram mengelola bot order Telegram dari satu dashboard: katalog produk, pembayaran Midtrans, broadcast, tiket pelanggan, dan kuota paket berlangganan.',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'Sellgram | Buat Bot Order Telegram Bisnis Kamu',
    description:
      'Satu dashboard untuk order otomatis, katalog produk, broadcast, dan fulfillment di bot Telegram bisnis Anda.',
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
      'Dashboard operasional untuk bot order Telegram: produk, order, broadcast, tiket, dan integrasi Midtrans.',
    images: ['/images/sellgram_seo.png']
  }
}

const BOT_PREVIEW_LINES = [
  'Order #INV-2517 masuk — Es Kopi Susu 1L ×3, total Rp54.000. Tautan pembayaran Midtrans terkirim otomatis ke pembeli.',
  '#INV-2517 dibayar. Status berubah ke Processing dan langsung masuk antrean fulfillment.',
  'Tiket baru dari Rina: "Paket saya belum sampai". Riwayat order #INV-2492 tersambung di dashboard.',
  'Broadcast "Promo Akhir Bulan" terkirim — kuota bulan ini terpakai 12 dari 50 pengiriman.'
]

const PIPELINE_STEPS = ['Template broadcast', 'Terkirim ke pelanggan', 'Balasan jadi order', 'Fulfillment selesai']

const REASONS = [
  {
    icon: Database,
    title: 'Semua data di satu tempat',
    body: 'Produk, order, credential, pelanggan, dan tiket hidup dalam satu dashboard — tidak ada lagi catatan spreadseller terpisah atau riwayat chat yang hilang saat ganti admin.'
  },
  {
    icon: Zap,
    title: 'Bot mengerjakan yang repetitif',
    body: 'Order masuk, tautan pembayaran terkirim, status berubah — semuanya otomatis. Tim Anda cukup menangani hal yang benar-benar butuh manusia.'
  },
  {
    icon: ShieldCheck,
    title: 'Kunci integrasi tersimpan rapi',
    body: 'Token Telegram, API Key Gemini, dan kredensial Midtrans dikelola di halaman credential khusus, bukan di catatan biasa.'
  }
]

function formatQuota(value: number | string, unit: string): string {
  if (value === 'Tak terbatas') return 'Tak terbatas'
  if (value === 0 && unit === 'pengiriman') return 'Tidak ada'
  if (typeof value === 'number') return `${value.toLocaleString('id-ID')}${unit ? ` ${unit}` : ''}`
  return value
}

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-clip">
      {/* Top bar */}
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-[0.5rem] bg-sidebar-primary">
              <Sparkles className="size-4 text-sidebar-primary-foreground" aria-hidden />
            </span>
            <span className="text-small-header">Sellgram</span>
          </Link>
          <nav className="hidden items-center gap-6 text-body-sm text-muted-foreground sm:flex" aria-label="Navigasi halaman">
            <Link href="#fitur" className="hover:text-foreground">Fitur</Link>
            <Link href="#harga" className="hover:text-foreground">Harga</Link>
            <Link href="#kenapa" className="hover:text-foreground">Kenapa Sellgram</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-body-sm font-semibold hover:underline">Masuk</Link>
            <Button asChild size="sm">
              <Link href="/register">Daftar gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="signal-glow">
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="kicker animate-fade-in-up">Dashboard untuk bot order Telegram</p>
            <h1 className="text-display-hero mt-4 text-balance animate-fade-in-up" style={{ animationDelay: '80ms' }}>
              Bot Anda menjual,{' '}
              <span className="underline decoration-primary decoration-2 underline-offset-4">dashboard Anda bekerja</span>{' '}
              — order, stok, dan broadcast tertangani.
            </h1>
            <p className="text-body-sm mx-auto mt-5 max-w-[60ch] text-muted-foreground animate-fade-in-up" style={{ animationDelay: '160ms' }}>
              Sellgram menghubungkan bot Telegram bisnis Anda dengan satu dashboard terstruktur: kelola katalog produk,
              pantau order dari pembayaran Midtrans, kirim broadcast, dan jawab tiket pelanggan tanpa membuka chat manual.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
              <Button asChild size="lg">
                <Link href="/register">
                  Mulai gratis
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Masuk dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature bento */}
      <section id="fitur" className="mx-auto max-w-6xl scroll-mt-20 px-6 pb-20 md:px-8 md:pb-28">
        <p className="kicker">Yang bisa Anda kerjakan di Sellgram</p>
        <h2 className="text-section-header mt-3 max-w-[30ch] text-balance">Satu alur kerja untuk operasional bot Anda</h2>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Surface as="article" elevation={2} className="flex flex-col gap-5 p-6 sm:p-8 lg:col-span-7 lg:row-span-2">
            <div>
              <h3 className="text-card-title">Order masuk, bot yang merespons</h3>
              <p className="text-body-sm mt-2 max-w-[52ch] text-muted-foreground">
                Pelanggan bertanya dan membeli lewat bot; setiap peristiwa — order masuk, pembayaran terverifikasi, tiket
                baru, kuota broadcast — muncul sebagai notifikasi yang bisa langsung Anda tindak lanjuti.
              </p>
            </div>
            <TelegramChatPreview className="mt-auto" title="Pratinjau bot Sellgram" lines={BOT_PREVIEW_LINES} />
          </Surface>

          <Surface as="article" elevation={1} className="flex flex-col justify-center gap-2 p-6 sm:p-7 lg:col-span-5">
            <ShoppingCart className="size-5 text-muted-foreground" aria-hidden />
            <h3 className="text-card-title">Katalog dan order terlacak</h3>
            <p className="text-body-sm text-muted-foreground">
              Tambah, ubah, dan nonaktifkan produk dengan mudah; pantau status order dari pending sampai completed lengkap
              dengan detail item dan tautan pembayaran.
            </p>
          </Surface>

          <Surface as="article" elevation={1} className="flex flex-col justify-center gap-2 p-6 sm:p-7 lg:col-span-5">
            <Megaphone className="size-5 text-muted-foreground" aria-hidden />
            <h3 className="text-card-title">Broadcast dengan kuota terpantau</h3>
            <p className="text-body-sm text-muted-foreground">
              Siapkan template broadcast, kirim ke pelanggan sesuai kuota paket Anda, dan lihat penggunaannya langsung di
              dashboard — tidak ada pengiriman diam-diam yang habis di tengah bulan.
            </p>
          </Surface>

          <Surface as="article" elevation={1} className="p-6 sm:p-8 lg:col-span-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-card-title flex items-center gap-2.5">
                <Zap className="size-5 text-muted-foreground" aria-hidden />
                Dari promosi sampai pesanan selesai
              </h3>
              <p className="text-body-sm max-w-[46ch] text-muted-foreground">
                Rantai yang sama menghubungkan broadcast, order, dan fulfillment — tiap tahap punya statusnya sendiri.
              </p>
            </div>
            <ol className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2" aria-label="Alur fulfillment dan broadcast">
              {PIPELINE_STEPS.map((step, index) => (
                <li key={step} className="flex flex-1 items-center gap-2">
                  <span className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-center text-body-sm">
                    <span className="font-mono text-mono-data tabular text-muted-foreground mr-2">{String(index + 1).padStart(2, '0')}</span>
                    {step}
                  </span>
                  {index < PIPELINE_STEPS.length - 1 && <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground sm:block" aria-hidden />}
                </li>
              ))}
            </ol>
          </Surface>
        </div>
      </section>

      {/* Pricing */}
      <section id="harga" className="mx-auto max-w-6xl scroll-mt-20 px-6 pb-20 md:px-8 md:pb-28">
        <p className="kicker">Harga</p>
        <h2 className="text-section-header mt-3">Pilih paket yang sesuai</h2>
        <p className="text-body-sm mt-2 max-w-[60ch] text-muted-foreground">
          Semua paket mencakup dashboard, manajemen produk, dan pelacakan order. Upgrade dan pembaruan pembayaran dilakukan
          lewat Midtrans setelah Anda punya akun.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PLAN_MATRIX.map((plan) => {
            const planLabel = getPlanLabel(plan.name as Plan)
            const isFree = plan.name === 'FREE'
            const lines = [
              { label: 'Produk', value: formatQuota(plan.products, 'produk') },
              { label: 'Template broadcast', value: formatQuota(plan.templates, 'template') },
              { label: 'Broadcast per bulan', value: formatQuota(plan.maxBroadcasts, 'pengiriman') },
              { label: 'Maks. order per bulan', value: formatQuota(plan.maxOrders, 'order') },
              { label: 'Fulfillment', value: plan.canUseFulfillment ? 'Termasuk' : 'Tidak termasuk' }
            ]
            return (
              <Surface
                key={plan.name}
                as="article"
                elevation={2}
                className={`relative flex flex-col p-6 sm:p-7 ${plan.popular ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-caption text-primary-foreground">
                    Terpopuler
                  </span>
                )}
                <h3 className="text-card-title">{planLabel}</h3>
                <p className="mt-2">
                  {isFree ? (
                    <span className="text-2xl font-semibold">Gratis</span>
                  ) : (
                    <>
                      <span className="font-mono tabular text-2xl font-semibold">{formatIDRCurrency(plan.monthlyPrice)}</span>
                      <span className="text-body-sm text-muted-foreground">/bln</span>
                    </>
                  )}
                </p>
                {!isFree && (
                  <p className="text-caption mt-1 text-muted-foreground">
                    atau <span className="font-mono text-mono-data tabular">{formatIDRCurrency(plan.yearlyPrice)}</span>/thn
                    &middot; hemat 2 bulan
                  </p>
                )}

                <ul className="mt-6 flex-1 space-y-2.5">
                  {lines.map((line) => {
                    const unavailable = line.value === 'Tidak ada' || line.value === 'Tidak termasuk'
                    return (
                      <li key={line.label} className="text-body-sm flex items-start gap-2.5">
                        {unavailable ? (
                          <X className="mt-0.5 size-4 shrink-0 text-error" aria-label={`${line.label} tidak tersedia`} />
                        ) : (
                          <Check className="mt-0.5 size-4 shrink-0 text-success" aria-label={`${line.label} termasuk`} />
                        )}
                        <span className="text-muted-foreground">
                          {line.label}:{' '}
                          <span className="font-mono text-mono-data tabular text-card-foreground">{line.value}</span>
                        </span>
                      </li>
                    )
                  })}
                </ul>

                <Button asChild className="mt-6 w-full" variant={isFree ? 'default' : 'outline'}>
                  <Link href="/register">
                    {isFree ? 'Mulai gratis' : `Pilih ${planLabel}`}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </Surface>
            )
          })}
        </div>
      </section>

      {/* Kenapa Sellgram */}
      <section id="kenapa" className="mx-auto max-w-6xl scroll-mt-20 px-6 pb-20 md:px-8 md:pb-28">
        <p className="kicker">Kenapa Sellgram</p>
        <h2 className="text-section-header mt-3 mb-8">Dibangun untuk operasional yang jujur dan terpantau</h2>
        <ul className="divide-y divide-border border-y border-border">
          {REASONS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex flex-col gap-3 py-7 sm:flex-row sm:items-start sm:gap-8">
              <div className="flex items-center gap-4 sm:w-72 sm:shrink-0">
                <Icon className="size-5 shrink-0 text-primary" aria-hidden />
                <h3 className="text-card-title">{title}</h3>
              </div>
              <p className="text-body-sm max-w-[60ch] text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24 md:px-8 md:pb-28">
        <Surface elevation={2} className="flex flex-col items-start justify-between gap-5 p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-subsection-header">Mulai dari paket gratis, upgrade saat siap</h2>
            <p className="text-body-sm mt-1.5 max-w-[52ch] text-muted-foreground">
              Daftar, sambungkan credential bot Telegram Anda, dan kelola order dari satu dashboard hari ini juga.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/register">
              Buat akun Sellgram
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </Surface>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-6 items-center justify-center rounded-[0.4rem] bg-sidebar-primary">
              <Sparkles className="size-3.5 text-sidebar-primary-foreground" aria-hidden />
            </span>
            <span className="text-caption">Sellgram</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-5 text-body-sm text-muted-foreground" aria-label="Navigasi footer">
            <Link href="#fitur" className="hover:text-foreground">Fitur</Link>
            <Link href="#harga" className="hover:text-foreground">Harga</Link>
            <Link href="#kenapa" className="hover:text-foreground">Kenapa Sellgram</Link>
            <Link href="/login" className="hover:text-foreground">Masuk</Link>
            <Link href="/register" className="hover:text-foreground">Daftar</Link>
          </nav>
          <p className="text-caption text-muted-foreground">&copy; {new Date().getFullYear()} Sellgram</p>
        </div>
      </footer>
    </main>
  )
}
