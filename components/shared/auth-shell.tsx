'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

import { Surface } from '@/components/shared/surface'
import { TelegramChatPreview } from '@/components/shared/telegram-chat-preview'

const PREVIEW_LINES = [
  'Order #INV-2481 masuk — Kopi Gayo 250g ×2, total Rp85.500. Tautan pembayaran terkirim ke pembeli.',
  'Pembayaran #INV-2481 terverifikasi. Pesanan diteruskan ke Fulfillment.',
  'Stok "Kopi Gayo 250g" tersisa 3. Sebaiknya re-stok sebelum broadcast berikutnya.',
  'Broadcast "Promo Gajian" terkirim ke 1.248 pelanggan. 37 balasan masuk, 9 berubah jadi order.'
]

type AuthShellProps = {
  headline: string
  description: string
  children: ReactNode
}

export function AuthShell({ headline, description, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-dvh w-full flex-col lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="signal-glow relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-12 xl:px-16">
        <div className="bg-grid-paper pointer-events-none absolute inset-0" aria-hidden />

        <Link href="/login" className="relative flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-[0.625rem] bg-sidebar-primary">
            <Sparkles className="size-4.5 text-sidebar-primary-foreground" aria-hidden />
          </span>
          <span className="grid text-sm leading-tight">
            <span className="truncate font-semibold">Sellgram</span>
            <span className="truncate text-caption text-sidebar-foreground/55">Control Center</span>
          </span>
        </Link>

        <div className="relative max-w-[38ch]">
          <p className="text-caption font-medium tracking-wide text-sidebar-foreground/60">Contoh notifikasi dari bot</p>
          <h2 className="text-page-title mt-3 text-balance">Pekerjaan harian yang tidak lagi Anda kerjakan manual.</h2>
          <p className="text-body-sm mt-3 text-sidebar-foreground/70">Pelanggan bertanya, bot membalas, order masuk, stok terpantau, broadcast jalan — tanpa Anda membuka Telegram.</p>
          <TelegramChatPreview className="mt-8 border-white/10" lines={PREVIEW_LINES} />
        </div>

        <p className="text-caption relative text-sidebar-foreground/50">Katalog produk &middot; order otomatis &middot; broadcast &middot; tiket pelanggan</p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <Link href="/login" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex size-7 items-center justify-center rounded-[0.5rem] bg-sidebar-primary">
              <Sparkles className="size-4 text-sidebar-primary-foreground" aria-hidden />
            </span>
            <span className="text-small-header">Sellgram</span>
          </Link>

          <header className="mb-6">
            <h1 className="text-subsection-header text-balance">{headline}</h1>
            <p className="text-body-sm mt-1.5 text-muted-foreground">{description}</p>
          </header>

          <Surface elevation={2} className="p-6 sm:p-8">
            {children}
          </Surface>
        </div>
      </main>
    </div>
  )
}
