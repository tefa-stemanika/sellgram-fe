'use client'

import { CircleCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

function AnimatedGradientOrb({ className }: { className: string }) {
  return (
    <div
      className={`pointer-events-none absolute animate-pulse-soft rounded-full bg-gradient-to-br blur-3xl ${className}`}
      style={{ animationDelay: '0.5s' }}
    />
  )
}

export function PaymentSuccessClient() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 transition-colors duration-500 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/20 sm:p-6">
      <AnimatedGradientOrb className="-right-48 -top-48 h-[30rem] w-[30rem] from-emerald-300/30 to-teal-400/20 dark:from-emerald-500/15 dark:to-teal-500/10" />
      <AnimatedGradientOrb className="-bottom-40 -left-40 h-[26rem] w-[26rem] from-blue-200/30 to-emerald-300/20 dark:from-blue-500/10 dark:to-emerald-500/10" />

      <div
        className={`relative w-full max-w-sm text-center transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div
          className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25 transition-all duration-500 delay-200 dark:from-emerald-500 dark:to-emerald-700 ${mounted ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          <CircleCheck className="h-12 w-12 text-white" />
        </div>

        <h1
          className={`text-section-header font-bold tracking-tight text-emerald-700 transition-all duration-500 delay-300 dark:text-emerald-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          Pembayaran Berhasil!
        </h1>
        <p
          className={`mt-3 text-body leading-relaxed text-muted-foreground transition-all duration-500 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          Pesanan Anda telah diterima dan sedang diproses. Silakan tunggu konfirmasi dari admin melalui Telegram.
        </p>

        <p
          className={`mt-12 font-mono text-caption text-muted-foreground transition-all duration-500 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          &copy; {new Date().getFullYear()} Sellgram
        </p>
      </div>
    </div>
  )
}
