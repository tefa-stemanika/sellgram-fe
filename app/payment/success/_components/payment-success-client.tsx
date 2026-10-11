'use client'

import { CircleCheck, Loader2, AlertCircle, Eye, ListOrdered } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getOrderDetail, type PublicOrderDetail } from '@/services/public'
import { formatIDRCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'

function LoadingState() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="animate-fade-in-up text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-error" />
        <h1 className="mt-4 text-section-header font-semibold text-error">Pembayaran gagal</h1>
        <p className="mt-2 text-body text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

function PaymentSuccessContent() {
  const [data, setData] = useState<PublicOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storeUserId, setStoreUserId] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  useEffect(() => {
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
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-md animate-fade-in-up text-center">
        <div
          className="mx-auto mb-6 flex h-24 w-24 animate-fade-in-up items-center justify-center rounded-full border border-success/25 bg-success/12"
          style={{ animationDelay: '0.2s' }}
        >
          <CircleCheck className="h-12 w-12 text-success" />
        </div>

        <h1
          className="animate-fade-in-up text-section-header font-semibold tracking-tight text-foreground"
          style={{ animationDelay: '0.3s' }}
        >
          Pembayaran Berhasil!
        </h1>
        <p
          className="mt-3 animate-fade-in-up text-body leading-relaxed text-muted-foreground"
          style={{ animationDelay: '0.4s' }}
        >
          Pesanan Anda telah diterima dan sedang diproses. Silakan tunggu konfirmasi dari admin melalui Telegram.
        </p>

        {data && (
          <div
            className="mt-8 animate-fade-in-up space-y-3 text-left"
            style={{ animationDelay: '0.5s' }}
          >
            <p className="font-mono text-mono-data tabular text-body-sm text-muted-foreground">
              Pesanan: <span className="font-semibold text-foreground">{data.orderId}</span>
            </p>

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
                  Lihat Pesanan Saya
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
