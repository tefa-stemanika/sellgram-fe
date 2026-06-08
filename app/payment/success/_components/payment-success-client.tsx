'use client'

import { CircleCheck, Loader2, AlertCircle, Eye, ListOrdered } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getOrderDetail, type PublicOrderDetail } from '@/services/public'
import { formatIDRCurrency } from '@/lib/utils'

function AnimatedGradientOrb({ className }: { className: string }) {
  return (
    <div
      className={`pointer-events-none absolute animate-pulse-soft rounded-full bg-gradient-to-br blur-3xl ${className}`}
      style={{ animationDelay: '0.5s' }}
    />
  )
}

function LoadingState() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-red-400" />
        <h1 className="mt-4 text-section-header font-bold text-red-500">Pembayaran Gagal</h1>
        <p className="mt-2 text-body text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

function PaymentSuccessContent() {
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<PublicOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storeUserId, setStoreUserId] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  useEffect(() => {
    setMounted(true)
    const uid = localStorage.getItem('customer_userId') || sessionStorage.getItem('store_userId')
    setStoreUserId(uid)
    setIsLoggedIn(!!localStorage.getItem('customer_token'))
  }, [])

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      setError('ID pesanan tidak ditemukan')
      return
    }

    setLoading(true)
    getOrderDetail(orderId)
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch((err) => {
        setError(err?.message || 'Pesanan tidak ditemukan')
      })
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 transition-colors duration-500 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/20 sm:p-6">
      <AnimatedGradientOrb className="-right-48 -top-48 h-[30rem] w-[30rem] from-emerald-300/30 to-teal-400/20 dark:from-emerald-500/15 dark:to-teal-500/10" />
      <AnimatedGradientOrb className="-bottom-40 -left-40 h-[26rem] w-[26rem] from-blue-200/30 to-emerald-300/20 dark:from-blue-500/10 dark:to-emerald-500/10" />

      <div
        className={`relative w-full max-w-md text-center transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
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

        {data && (
          <div
            className={`mt-8 space-y-3 text-left transition-all duration-500 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <p className="font-mono text-body-sm text-muted-foreground">
              Pesanan: <span className="font-semibold text-foreground">{data.orderId}</span>
            </p>

            <div className="divide-y divide-border rounded-xl border border-border bg-white/60 backdrop-blur-sm dark:bg-card/60">
              {data.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-caption text-muted-foreground">
                        {formatIDRCurrency(item.price)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground">
                    {formatIDRCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-white/80 px-4 py-3 font-semibold dark:bg-card/80">
              <span className="text-foreground">Total</span>
              <span className="text-card-title text-primary">
                {formatIDRCurrency(data.totalPrice)}
              </span>
            </div>
          </div>
        )}

        {storeUserId && (
          <div
            className={`mt-8 transition-all duration-500 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {isLoggedIn ? (
              <Link
                href={`/store/${storeUserId}/profile/orders`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90">
                <ListOrdered className="h-5 w-5" />
                Lihat Pesanan Saya
              </Link>
            ) : (
              <Link
                href={`/store/${storeUserId}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90">
                <Eye className="h-5 w-5" />
                Kembali ke Toko
              </Link>
            )}
          </div>
        )}

        <p
          className={`mt-8 font-mono text-caption text-muted-foreground transition-all duration-500 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          &copy; {new Date().getFullYear()} Sellgram
        </p>
      </div>
    </div>
  )
}

export function PaymentSuccessClient() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
