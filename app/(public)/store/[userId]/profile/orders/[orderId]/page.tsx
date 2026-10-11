'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2, Clock, XCircle, CreditCard, Package, ShoppingBag, ExternalLink } from 'lucide-react'
import { getOrderDetail, type PortalOrder } from '@/services/portal'
import { usePortalAuth } from '../../../_components/portal-auth-provider'
import { formatDate, formatIDRCurrency, cn } from '@/lib/utils'
import { resolveStatus } from '@/lib/status-tokens'
import { StatusBadge } from '@/components/shared/status-badge'
import { Surface } from '@/components/shared/surface'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const statusIcon: Record<string, typeof CheckCircle2> = {
  COMPLETED: CheckCircle2,
  PENDING: Clock,
  PAYMENT_PENDING: CreditCard,
  CANCELLED: XCircle,
  PAYMENT_FAILED: XCircle,
  CONFIRMED: CheckCircle2,
  PROCESSING: Package
}

const statusTimeline = [
  'PENDING',
  'PAYMENT_PENDING',
  'CONFIRMED',
  'PROCESSING',
  'COMPLETED'
]

const statusLabel: Record<string, string> = {
  PENDING: 'Pesanan dibuat',
  PAYMENT_PENDING: 'Menunggu pembayaran',
  CONFIRMED: 'Dikonfirmasi penjual',
  PROCESSING: 'Sedang diproses',
  COMPLETED: 'Selesai'
}

export default function OrderDetailPage() {
  const params = useParams<{ userId: string; orderId: string }>()
  const router = useRouter()
  const { customer, token } = usePortalAuth()

  const [order, setOrder] = useState<PortalOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!customer || !token) return
    setLoading(true)
    getOrderDetail(params.userId, token, params.orderId)
      .then(setOrder)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [params.userId, params.orderId, token, customer])

  if (!customer || !token) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="text-section-header font-semibold text-foreground">Belum masuk</div>
        <p className="mt-2 text-body-sm text-muted-foreground">
          Silakan masuk untuk melihat detail pesanan.
        </p>
        <Button className="mt-6" onClick={() => router.push(`/store/${params.userId}/login`)}>
          Masuk
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="mb-6 h-6 w-32 rounded-lg" />
        <Skeleton className="mb-4 h-40 w-full rounded-lg" />
        <Skeleton className="h-60 w-full rounded-lg" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="text-section-header font-semibold text-foreground">Pesanan tidak ditemukan</div>
        <p className="mt-2 text-body-sm text-muted-foreground">
          Pesanan dengan kode tersebut tidak ditemukan.
        </p>
        <Button className="mt-6" variant="outline" asChild>
          <Link href={`/store/${params.userId}/profile/orders`}>Kembali</Link>
        </Button>
      </div>
    )
  }

  const st = resolveStatus('order', order.status)
  const StatusIcon = statusIcon[order.status] ?? Clock

  const currentStatusIndex = statusTimeline.indexOf(order.status)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="animate-fade-in-up">
        <Link
          href={`/store/${params.userId}/profile/orders`}
          className="mb-4 inline-flex items-center gap-1.5 text-body-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Kembali
        </Link>

        <Surface elevation={1} className="overflow-hidden">
          <div className="p-6 text-center">
            <div className={cn('mx-auto mb-3 flex size-14 items-center justify-center rounded-full border', st.className)}>
              <StatusIcon className="size-7" />
            </div>
            <StatusBadge kind="order" value={order.status} withDot className="px-4 py-1.5" />
            <p className="mt-2 font-mono text-mono-data tabular text-body-sm text-muted-foreground">#{order.orderId}</p>
          </div>

          {order.status === 'PAYMENT_PENDING' && order.paymentUrl && (
            <div className="border-t border-border px-6 py-4">
              <a
                href={order.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-body-sm font-semibold text-primary-foreground shadow-l1 transition-colors hover:bg-primary-hover"
              >
                <ExternalLink className="size-4" />
                Bayar Sekarang
              </a>
            </div>
          )}

          <div className="border-t border-border px-6 py-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-body-sm text-muted-foreground">Total Pembayaran</span>
                <span className="font-mono text-mono-data font-semibold tabular text-primary">
                  {formatIDRCurrency(order.totalPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-body-sm text-muted-foreground">Sumber</span>
                <StatusBadge kind="source" value={order.source} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-body-sm text-muted-foreground">Tanggal Pesan</span>
                <span className="text-body-sm font-medium text-foreground">
                  {formatDate(order.createdAt)}
                </span>
              </div>
              {order.paidAt && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-body-sm text-muted-foreground">Waktu Bayar</span>
                  <span className="text-body-sm font-medium text-foreground">
                    {formatDate(order.paidAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Surface>

        {currentStatusIndex >= 0 && (
          <Surface className="mt-4 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-small-header font-semibold text-foreground">
              <Clock className="size-4 text-primary" />
              Status pesanan
            </h3>
            <div className="flex flex-col gap-0">
              {statusTimeline.map((s, i) => {
                const done = i <= currentStatusIndex
                const step = resolveStatus('order', s)
                const Icon = statusIcon[s] ?? Clock
                return (
                  <div key={s} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-full border',
                        done ? step.className : 'border-border bg-muted text-muted-foreground'
                      )}>
                        <Icon className="size-3" />
                      </div>
                      {i < statusTimeline.length - 1 && (
                        <div className={cn(
                          'mt-1 h-6 w-0.5',
                          done && i < currentStatusIndex ? 'bg-success' : 'bg-border'
                        )} />
                      )}
                    </div>
                    <div className={cn(
                      'pb-6 text-body-sm',
                      done ? 'font-medium text-foreground' : 'text-muted-foreground'
                    )}>
                      {statusLabel[s] ?? s}
                    </div>
                  </div>
                )
              })}
            </div>
          </Surface>
        )}

        <Surface className="mt-4 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-small-header font-semibold text-foreground">
            <ShoppingBag className="size-4 text-primary" />
            Item pesanan
          </h3>
          <div className="flex flex-col gap-3">
            {order.orderItems.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-lg bg-muted px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.product.emoji}</span>
                  <div>
                    <p className="text-body-sm font-medium text-foreground">{item.product.name}</p>
                    <p className="font-mono text-caption tabular text-muted-foreground">
                      {item.quantity} x {formatIDRCurrency(item.price ?? item.product.price)}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-body-sm font-semibold tabular text-foreground">
                  {formatIDRCurrency((item.price ?? item.product.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
            <span className="text-small-header font-semibold text-foreground">Total</span>
            <span className="font-mono text-mono-data font-semibold tabular text-primary">
              {formatIDRCurrency(order.totalPrice)}
            </span>
          </div>
        </Surface>

        {order.note && (
          <Surface className="mt-4 p-6">
            <p className="text-body-sm text-muted-foreground">
              <span className="font-medium text-foreground">Catatan: </span>
              {order.note}
            </p>
          </Surface>
        )}
      </div>
    </div>
  )
}
