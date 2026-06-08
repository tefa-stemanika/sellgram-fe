'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2, Clock, XCircle, CreditCard, Package, ShoppingBag, ExternalLink } from 'lucide-react'
import { getOrderDetail, type PortalOrder } from '@/services/portal'
import { usePortalAuth } from '../../../_components/portal-auth-provider'
import { formatDate, formatIDRCurrency, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const statusConfig: Record<
  string,
  { label: string; icon: typeof CheckCircle2; gradient: string; iconBg: string }
> = {
  COMPLETED: {
    label: 'Lunas',
    icon: CheckCircle2,
    gradient: 'from-success/20 to-success/5',
    iconBg: 'bg-success/15 text-success'
  },
  PENDING: {
    label: 'Menunggu Konfirmasi',
    icon: Clock,
    gradient: 'from-warning/20 to-warning/5',
    iconBg: 'bg-warning/15 text-warning'
  },
  PAYMENT_PENDING: {
    label: 'Menunggu Pembayaran',
    icon: CreditCard,
    gradient: 'from-info/20 to-info/5',
    iconBg: 'bg-info/15 text-info'
  },
  CANCELLED: {
    label: 'Dibatalkan',
    icon: XCircle,
    gradient: 'from-error/20 to-error/5',
    iconBg: 'bg-error/15 text-error'
  },
  PAYMENT_FAILED: {
    label: 'Pembayaran Gagal',
    icon: XCircle,
    gradient: 'from-error/20 to-error/5',
    iconBg: 'bg-error/15 text-error'
  },
  CONFIRMED: {
    label: 'Dikonfirmasi',
    icon: CheckCircle2,
    gradient: 'from-success/20 to-success/5',
    iconBg: 'bg-success/15 text-success'
  },
  PROCESSING: {
    label: 'Diproses',
    icon: Package,
    gradient: 'from-info/20 to-info/5',
    iconBg: 'bg-info/15 text-info'
  }
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
        <div className="text-section-header font-black text-foreground">Belum Masuk</div>
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
        <Skeleton className="mb-4 h-40 w-full rounded-2xl" />
        <Skeleton className="h-60 w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="text-section-header font-black text-foreground">Pesanan Tidak Ditemukan</div>
        <p className="mt-2 text-body-sm text-muted-foreground">
          Pesanan dengan kode tersebut tidak ditemukan.
        </p>
        <Button className="mt-6" variant="outline" asChild>
          <Link href={`/store/${params.userId}/profile/orders`}>Kembali</Link>
        </Button>
      </div>
    )
  }

  const cfg = statusConfig[order.status] ?? {
    label: order.status,
    icon: Clock,
    gradient: 'from-warning/20 to-warning/5',
    iconBg: 'bg-warning/15 text-warning'
  }
  const StatusIcon = cfg.icon

  const currentStatusIndex = statusTimeline.indexOf(order.status)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div style={{ animation: 'slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
        <Link
          href={`/store/${params.userId}/profile/orders`}
          className="mb-4 inline-flex items-center gap-1.5 text-body-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Kembali
        </Link>

        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
          <div className={cn('bg-gradient-to-br p-6 text-center', cfg.gradient)}>
            <div className={cn('mx-auto mb-3 flex size-14 items-center justify-center rounded-full', cfg.iconBg)}>
              <StatusIcon className="size-7" />
            </div>
            <div className={cn('mx-auto inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-label font-bold', cfg.iconBg)}>
              <StatusIcon className="size-4" />
              {cfg.label}
            </div>
            <p className="mt-2 font-mono text-body-sm text-muted-foreground">#{order.orderId}</p>
          </div>

          {order.status === 'PAYMENT_PENDING' && order.paymentUrl && (
            <div className="border-t border-border/50 px-6 py-4">
              <a
                href={order.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/90 text-body-sm font-semibold text-primary-foreground shadow-sm transition-all hover:from-primary/90 hover:to-primary/70 active:scale-[0.98]"
              >
                <ExternalLink className="size-4" />
                Bayar Sekarang
              </a>
            </div>
          )}

          <div className="border-t border-border/50 px-6 py-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-body-sm text-muted-foreground">Total Pembayaran</span>
                <span className="font-mono text-card-title font-bold text-primary">
                  {formatIDRCurrency(order.totalPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-body-sm text-muted-foreground">Sumber</span>
                <span className="rounded bg-muted px-2 py-0.5 text-caption font-medium uppercase text-muted-foreground">
                  {order.source}
                </span>
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
        </div>

        {currentStatusIndex >= 0 && (
          <div className="mt-4 rounded-2xl border border-border/50 bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-small-header font-bold text-foreground">
              <Clock className="size-4 text-primary" />
              Status Pesanan
            </h3>
            <div className="flex flex-col gap-0">
              {statusTimeline.map((s, i) => {
                const done = i <= currentStatusIndex
                const Icon = statusConfig[s]?.icon ?? Clock
                return (
                  <div key={s} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-full',
                        done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}>
                        <Icon className="size-3" />
                      </div>
                      {i < statusTimeline.length - 1 && (
                        <div className={cn(
                          'mt-1 h-6 w-0.5',
                          done && i < currentStatusIndex ? 'bg-primary' : 'bg-border'
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
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-border/50 bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-small-header font-bold text-foreground">
            <ShoppingBag className="size-4 text-primary" />
            Item Pesanan
          </h3>
          <div className="flex flex-col gap-3">
            {order.orderItems.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.product.emoji}</span>
                  <div>
                    <p className="text-body-sm font-medium text-foreground">{item.product.name}</p>
                    <p className="text-caption text-muted-foreground">
                      {item.quantity} x {formatIDRCurrency(item.price ?? item.product.price)}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-body-sm font-semibold text-foreground">
                  {formatIDRCurrency((item.price ?? item.product.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-border/50 pt-4">
            <span className="text-small-header font-bold text-foreground">Total</span>
            <span className="font-mono text-card-title font-bold text-primary">
              {formatIDRCurrency(order.totalPrice)}
            </span>
          </div>
        </div>

        {order.note && (
          <div className="mt-4 rounded-2xl border border-border/50 bg-card p-6">
            <p className="text-body-sm text-muted-foreground">
              <span className="font-medium text-foreground">Catatan: </span>
              {order.note}
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
