'use client'

import { useState } from 'react'
import { Bot, Grid3x3 } from 'lucide-react'

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

function ChatPreview({ messages }: { messages: Message[] }) {
  return (
    <div className="flex-1 space-y-3">
      {messages.map((msg, i) => (
        <div key={i}>
          {msg.role === 'bot' ? (
            <div className="flex justify-start">
              <div className="max-w-[85%] space-y-0.5 rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
                {msg.lines.map((line, j) =>
                  line === '' ? (
                    <div key={j} className="h-1" />
                  ) : (
                    <p key={j} className={cn('whitespace-pre-wrap text-sm', j > 0 && line.startsWith('   ') ? 'text-muted-foreground' : '')}>
                      {line}
                    </p>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-white shadow-sm">
                <p className="whitespace-pre-wrap text-sm">{msg.lines[0]}</p>
              </div>
            </div>
          )}

          {msg.role === 'bot' && msg.buttons && (
            <div className="ml-0.5 mt-1.5 space-y-1.5">
              {msg.buttons.map((group, gi) => (
                <div key={gi} className="flex flex-wrap gap-1.5">
                  {group.map((label) => (
                    <div
                      key={label}
                      className="cursor-default rounded-xl border border-primary/30 bg-white px-3 py-1.5 text-xs font-medium text-primary shadow-sm transition-colors dark:bg-slate-800 dark:text-primary/90">
                      {label}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
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

        <div className="flex gap-1 border-b border-white/10 bg-gradient-to-r from-primary/10 to-blue-600/10 p-2">
          <button
            type="button"
            onClick={() => setMode('AI')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all',
              mode === 'AI'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:bg-white/40 dark:hover:bg-white/10'
            )}>
            <Bot className="h-3.5 w-3.5" />
            AI
          </button>
          <button
            type="button"
            onClick={() => setMode('BUTTON')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all',
              mode === 'BUTTON'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:bg-white/40 dark:hover:bg-white/10'
            )}>
            <Grid3x3 className="h-3.5 w-3.5" />
            Button
          </button>
        </div>

        <div
          className="flex max-h-[440px] min-h-[360px] flex-col overflow-y-auto p-4"
          style={{
            backgroundImage: 'url(/images/telegram-chat-background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <ChatPreview messages={mode === 'AI' ? AI_MESSAGES : BUTTON_FLOW} />

          <div className="mt-4 flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 shadow-sm dark:bg-slate-800">
            <div className="flex-1 text-xs text-muted-foreground">Ketik pesan...</div>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-3.5 w-3.5 -rotate-45">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
