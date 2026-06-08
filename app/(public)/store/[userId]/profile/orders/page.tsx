'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, ChevronRight, Clock, CheckCircle2, XCircle, CreditCard, ExternalLink } from 'lucide-react'
import { getOrders, type PortalOrder } from '@/services/portal'
import { usePortalAuth } from '../../_components/portal-auth-provider'
import { formatDate, formatIDRCurrency, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const statusBadge: Record<string, { label: string; classes: string }> = {
  COMPLETED: { label: 'Lunas', classes: 'bg-success/10 text-success' },
  PENDING: { label: 'Menunggu Konfirmasi', classes: 'bg-warning/10 text-warning' },
  PAYMENT_PENDING: { label: 'Menunggu Pembayaran', classes: 'bg-info/10 text-info' },
  CANCELLED: { label: 'Dibatalkan', classes: 'bg-error/10 text-error' },
  PAYMENT_FAILED: { label: 'Pembayaran Gagal', classes: 'bg-error/10 text-error' },
  CONFIRMED: { label: 'Dikonfirmasi', classes: 'bg-success/10 text-success' },
  PROCESSING: { label: 'Diproses', classes: 'bg-info/10 text-info' }
}

export default function OrdersPage() {
  const params = useParams<{ userId: string }>()
  const router = useRouter()
  const { customer, token } = usePortalAuth()

  const [orders, setOrders] = useState<PortalOrder[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!customer || !token) return
    setLoading(true)
    getOrders(params.userId, token, page)
      .then(data => {
        setOrders(data.orders)
        setTotalPages(data.totalPages)
        setTotal(data.total)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params.userId, token, customer, page])

  if (!customer || !token) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="text-section-header font-black text-foreground">Belum Masuk</div>
        <p className="mt-2 text-body-sm text-muted-foreground">
          Silakan masuk untuk melihat riwayat pesanan.
        </p>
        <Button className="mt-6" onClick={() => router.push(`/store/${params.userId}/login`)}>
          Masuk
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="mb-6 h-8 w-48 rounded-lg" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div style={{ animation: 'slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-section-header font-black text-foreground">Pesanan Saya</h1>
            <p className="mt-0.5 text-body-sm text-muted-foreground">
              {total > 0 ? `${total} pesanan` : 'Belum ada pesanan'}
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card py-16 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
              <Package className="size-7 text-muted-foreground" />
            </div>
            <h2 className="text-card-title font-bold text-foreground">Belum Ada Pesanan</h2>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Pesanan kamu akan muncul di sini setelah melakukan pembelian.
            </p>
            <Button className="mt-6" asChild variant="outline">
              <Link href={`/store/${params.userId}`}>Lihat Produk</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map(order => {
              const badge = statusBadge[order.status] ?? { label: order.status, classes: 'bg-muted text-muted-foreground' }
              return (
                <Link
                  key={order.id}
                  href={`/store/${params.userId}/profile/orders/${order.orderId}`}
                  className="group rounded-xl border border-border/50 bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="font-mono text-body-sm font-semibold text-foreground">
                          #{order.orderId}
                        </span>
                        <span className={cn('rounded-full px-2.5 py-0.5 text-caption font-medium', badge.classes)}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-caption text-muted-foreground">
                        <span>{formatDate(order.createdAt)}</span>
                        <span className="text-body-sm font-bold text-foreground">
                          {formatIDRCurrency(order.totalPrice)}
                        </span>
                        {order.source && (
                          <span className="rounded bg-muted px-1.5 py-0.5 uppercase">
                            {order.source}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </div>
                  {order.status === 'PAYMENT_PENDING' && order.paymentUrl && (
                    <div className="mt-3 border-t border-border/50 pt-3">
                      <a
                        href={order.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-caption font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        <ExternalLink className="size-3.5" />
                        Bayar Sekarang
                      </a>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              Sebelumnya
            </Button>
            <span className="px-3 text-body-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Selanjutnya
            </Button>
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
