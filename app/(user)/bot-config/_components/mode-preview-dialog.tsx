'use client'

import { useState } from 'react'
import { Bot, Grid3x3 } from 'lucide-react'

import { TelegramChatPreview } from '@/components/shared/telegram-chat-preview'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type ModePreviewDialogProps = {
  defaultMode?: 'AI' | 'BUTTON'
  children: React.ReactNode
}

type Message = {
  role: 'bot' | 'user'
  lines: string[]
  buttons?: string[][]
}

const AI_MESSAGES: Message[] = [
  { role: 'user', lines: ['Halo'] },
  {
    role: 'bot',
    lines: [
      'Halo! Selamat datang di toko online kami. Ada yang bisa saya bantu hari ini? \u{1F60A}'
    ]
  },
  { role: 'user', lines: ['ada produk apa saja? saya ingin pesan'] },
  {
    role: 'bot',
    lines: [
      '\u{1F37D}\uFE0F MENU KAMI',
      '',
      '\u{1F373} 1. Nasi Adalah 1',
      '    Nasi Adalah 1',
      '    \u{1F4B0} Rp 1',
      '',
      '\u{1F373} 2. Nasi Adalah 2',
      '    Nasi Adalah 2',
      '    \u{1F4B0} Rp 2',
      '',
      'Ketik /pesan untuk mulai memesan.'
    ]
  },
  { role: 'user', lines: ['saya mau pesan 1 nasi adalah 1'] },
  {
    role: 'bot',
    lines: [
      '\u{1F4DD} Ringkasan Order',
      '',
      '\u{1F373} Nasi Adalah 1',
      '   1 x Rp 1',
      '\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}',
      '\u{1F4B5} Total: Rp 1',
      '',
      'Ketik /konfirmasi untuk melanjutkan',
      'Ketik /batal untuk membatalkan'
    ]
  },
  { role: 'user', lines: ['/konfirmasi'] },
  {
    role: 'bot',
    lines: [
      '\u{23F3} Memproses order dan membuat link pembayaran...'
    ]
  },
  {
    role: 'bot',
    lines: [
      '\u{1F4B2} Link pembayaran telah dikirim.'
    ]
  }
]

const BUTTON_FLOW: Message[] = [
  { role: 'user', lines: ['Halo'] },
  {
    role: 'bot',
    lines: [
      'Halo! Selamat datang di toko kami.',
      'Ada yang bisa kami bantu?'
    ],
    buttons: [['\u{1F6CD}\uFE0F Lihat Menu', '\u{1F4AC} Hubungi Admin']]
  },
  { role: 'user', lines: ['\u{1F6CD}\uFE0F Lihat Menu'] },
  {
    role: 'bot',
    lines: [
      'Berikut menu yang tersedia:',
      '',
      '\u{1F373} 1. Nasi Adalah 1 \u2014 Rp 1',
      '\u{1F373} 2. Nasi Adalah 2 \u2014 Rp 2',
      '',
      'Silakan pilih menu untuk dipesan.'
    ],
    buttons: [['\u{1F373} Nasi Adalah 1', '\u{1F373} Nasi Adalah 2'], ['\u{1F519} Kembali']]
  },
  { role: 'user', lines: ['\u{1F373} Nasi Adalah 1'] },
  {
    role: 'bot',
    lines: [
      '\u{1F4DD} Ringkasan Order',
      '',
      '\u{1F373} Nasi Adalah 1',
      '   1 x Rp 1',
      '\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}\u{2501}',
      '\u{1F4B5} Total: Rp 1',
      '',
      'Konfirmasi pesanan Anda?'
    ],
    buttons: [['\u{2705} Konfirmasi', '\u{274C} Batalkan']]
  },
  { role: 'user', lines: ['\u{2705} Konfirmasi'] },
  {
    role: 'bot',
    lines: [
      '\u{2705} Pesanan dikonfirmasi!',
      '',
      '\u{23F3} Memproses pembayaran...',
      '',
      'Kami akan mengirimkan link pembayaran melalui chat ini.'
    ]
  }
]

function toPreviewLines(messages: Message[]): string[] {
  return messages.map((msg) =>
    [msg.lines.join('\n'), ...(msg.buttons?.map((group) => group.join('  ')) ?? [])].join('\n')
  )
}

export function ModePreviewDialog({ defaultMode = 'AI', children }: ModePreviewDialogProps) {
  const [mode, setMode] = useState<'AI' | 'BUTTON'>(defaultMode)

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Pratinjau Mode</DialogTitle>
          <DialogDescription>Pratinjau tampilan chat untuk mode yang dipilih</DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 border-b border-border bg-muted/50 p-2">
          <button
            type="button"
            onClick={() => setMode('AI')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-caption font-medium transition-colors',
              mode === 'AI'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}>
            <Bot className="h-3.5 w-3.5" />
            AI
          </button>
          <button
            type="button"
            onClick={() => setMode('BUTTON')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-caption font-medium transition-colors',
              mode === 'BUTTON'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}>
            <Grid3x3 className="h-3.5 w-3.5" />
            Button
          </button>
        </div>

        <div className="max-h-[440px] min-h-[360px] overflow-y-auto p-4">
          <TelegramChatPreview
            lines={toPreviewLines(mode === 'AI' ? AI_MESSAGES : BUTTON_FLOW)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
