'use client'

import { AlertCircle, CircleCheck, Clock, Eye, ListOrdered, Loader2, RefreshCw } from 'lucide-react'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { StatusBadge } from '@/components/shared/status-badge'
import { getOrderDetail, type PublicOrderDetail } from '@/services/public'
import { describeApiError, type ApiErrorInfo } from '@/lib/api-error'
import { cn, formatIDRCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const RETRY_DELAYS_MS = [2000, 5000, 10000]
const UNCONFIRMED_STATUSES = new Set(['PENDING', 'PAYMENT_PENDING'])

function isUnconfirmed(status: string | null | undefined) {
  return Boolean(status && UNCONFIRMED_STATUSES.has(status))
}

function LoadingState() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

function ErrorState({ error }: { error: ApiErrorInfo }) {
  const notFound = error.status === 404 || error.status === 400
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="animate-fade-in-up text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-error" />
        <h1 className="mt-4 text-section-header font-semibold text-foreground">
          {notFound ? 'Pesanan tidak ditemukan' : 'Pembayaran gagal'}
        </h1>
        <p className="mt-2 text-body text-muted-foreground">{error.message}</p>
      </div>
    </div>
  )
}

function WaitingState({ showRetry, onRetry }: { showRetry: boolean; onRetry: () => void }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="animate-fade-in-up text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-warning/25 bg-warning/12">
          <Clock className="h-12 w-12 text-warning" />
        </div>
        <h1 className="mt-6 text-section-header font-semibold text-foreground">Konfirmasi sedang diproses</h1>
        <p className="mx-auto mt-2 max-w-sm text-body leading-relaxed text-muted-foreground">
          Pembayaran kamu sudah kami terima, konfirmasi sedang diproses.
        </p>
        {showRetry && (
          <Button variant="outline" size="sm" className="mt-5 gap-2" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
            Coba lagi
          </Button>
        )}
      </div>
    </div>
  )
}

function PaymentSuccessContent() {
  const [data, setData] = useState<PublicOrderDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiErrorInfo | null>(null)
  const [storeUserId, setStoreUserId] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const attemptRef = useRef(0)

  useEffect(() => {
    const uid = localStorage.getItem('customer_userId') || sessionStorage.getItem('store_userId')
    setStoreUserId(uid)
    setIsLoggedIn(!!localStorage.getItem('customer_token'))
  }, [])

  const load = useCallback(async () => {
    if (!orderId) {
      setError({ message: 'ID pesanan tidak ditemukan', canRetry: false })
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const res = await getOrderDetail(orderId)
      setData(res)
      setError(null)
    } catch (err) {
      setError(describeApiError(err, 'Pesanan tidak ditemukan'))
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    void load()
  }, [load])

  // Webhook pembayaran bisa terlambat, jadi status dibaca ulang dengan backoff
  // sebelum halaman menyimpulkan apa pun.
  const needsFollowUp = !isLoading && ((!data && !!error?.canRetry) || (!!data && isUnconfirmed(data.status)))

  useEffect(() => {
    if (!needsFollowUp) return
    const delay = RETRY_DELAYS_MS[attemptRef.current]
    if (delay === undefined) return
    attemptRef.current += 1
    const timer = setTimeout(() => void load(), delay)
    return () => clearTimeout(timer)
  }, [needsFollowUp, load])

  const retriesExhausted = attemptRef.current >= RETRY_DELAYS_MS.length

  if (isLoading && !data) return <LoadingState />

  if (error && !data) {
    if (error.canRetry) {
      return (
        <WaitingState
          showRetry={retriesExhausted}
          onRetry={() => {
            attemptRef.current = 0
            void load()
          }}
        />
      )
    }
    return <ErrorState error={error} />
  }

  const pending = isUnconfirmed(data?.status)
  const failed = data?.status === 'PAYMENT_FAILED'

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-md animate-fade-in-up text-center">
        <div
          className={cn(
            'mx-auto mb-6 flex h-24 w-24 animate-fade-in-up items-center justify-center rounded-full border',
            failed
              ? 'border-error/25 bg-error/12'
              : pending
                ? 'border-warning/25 bg-warning/12'
                : 'border-success/25 bg-success/12'
          )}
          style={{ animationDelay: '0.2s' }}
        >
          {failed ? (
            <AlertCircle className="h-12 w-12 text-error" />
          ) : pending ? (
            <Clock className="h-12 w-12 text-warning" />
          ) : (
            <CircleCheck className="h-12 w-12 text-success" />
          )}
        </div>

        <h1
          className="animate-fade-in-up text-section-header font-semibold tracking-tight text-foreground"
          style={{ animationDelay: '0.3s' }}
        >
          {failed
            ? 'Pembayaran belum terverifikasi'
            : pending
              ? 'Menunggu konfirmasi pembayaran'
              : data?.status === 'COMPLETED'
                ? 'Pembayaran Berhasil!'
                : 'Pesanan kamu sudah kami terima'}
        </h1>
        <p
          className="mt-3 animate-fade-in-up text-body leading-relaxed text-muted-foreground"
          style={{ animationDelay: '0.4s' }}
        >
          {failed
            ? 'Pembayaran pesanan ini belum berhasil. Hubungi pemilik toko bila Anda sudah melakukan pembayaran.'
            : pending
              ? 'Pembayaran kamu sudah kami terima, konfirmasi sedang diproses. Silakan tunggu pembaruan status pesanan.'
              : 'Pesanan Anda telah diterima dan sedang diproses. Silakan tunggu konfirmasi dari admin.'}
        </p>
        {pending && (
          <p className="mt-2 flex items-center justify-center gap-1.5 text-caption text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Status diperbarui otomatis
          </p>
        )}

        {data && (
          <div
            className="mt-8 animate-fade-in-up space-y-3 text-left"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-mono-data tabular text-body-sm text-muted-foreground">
                Pesanan: <span className="font-semibold text-foreground">{data.orderId}</span>
              </p>
              <StatusBadge kind="order" value={data.status} withDot />
            </div>

            <div className="divide-y divide-border rounded-lg border border-border bg-card">
              {data.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="font-mono text-caption tabular text-muted-foreground">
                        {formatIDRCurrency(item.price)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-body-sm tabular font-semibold text-foreground">
                    {formatIDRCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 font-semibold">
              <span className="text-foreground">Total</span>
              <span className="font-mono text-mono-data tabular text-card-title text-primary">
                {formatIDRCurrency(data.totalPrice)}
              </span>
            </div>
          </div>
        )}

        {storeUserId && (
          <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            {isLoggedIn ? (
              <Button className="w-full" asChild>
                <Link href={`/store/${storeUserId}/profile/orders`}>
                  <ListOrdered className="h-5 w-5" />
                  Lihat pesanan saya
                </Link>
              </Button>
            ) : (
              <Button className="w-full" asChild>
                <Link href={`/store/${storeUserId}`}>
                  <Eye className="h-5 w-5" />
                  Kembali ke Toko
                </Link>
              </Button>
            )}
          </div>
        )}

        <p
          className="mt-8 animate-fade-in-up font-mono text-caption text-muted-foreground"
          style={{ animationDelay: '0.5s' }}
        >
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
