'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, ChevronRight, ExternalLink } from 'lucide-react'
import { getOrders, type PortalOrder } from '@/services/portal'
import { usePortalAuth } from '../../_components/portal-auth-provider'
import { formatDate, formatIDRCurrency } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/status-badge'
import { Surface } from '@/components/shared/surface'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

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
        <div className="text-section-header font-semibold text-foreground">Belum masuk</div>
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
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="animate-fade-in-up">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-section-header font-semibold text-foreground">Pesanan saya</h1>
            <p className="mt-0.5 text-body-sm text-muted-foreground">
              {total > 0 ? (
                <>
                  <span className="font-mono text-mono-data tabular text-foreground">{total}</span> pesanan
                </>
              ) : (
                'Belum ada pesanan'
              )}
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <Surface className="py-16 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
              <Package className="size-7 text-muted-foreground" />
            </div>
            <h2 className="text-card-title font-semibold text-foreground">Belum ada pesanan</h2>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Pesanan kamu akan muncul di sini setelah melakukan pembelian.
            </p>
            <Button className="mt-6" asChild variant="outline">
              <Link href={`/store/${params.userId}`}>Lihat Produk</Link>
            </Button>
          </Surface>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map(order => (
              <Link
                key={order.id}
                href={`/store/${params.userId}/profile/orders/${order.orderId}`}
                className="group block rounded-lg border border-border bg-card p-4 shadow-l1 transition-shadow duration-200 hover:shadow-l2"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-mono text-mono-data font-semibold tabular text-foreground">
                        #{order.orderId}
                      </span>
                      <StatusBadge kind="order" value={order.status} withDot />
                    </div>
                    <div className="flex items-center gap-3 text-caption text-muted-foreground">
                      <span>{formatDate(order.createdAt)}</span>
                      <span className="font-mono text-body-sm font-semibold tabular text-foreground">
                        {formatIDRCurrency(order.totalPrice)}
                      </span>
                      {order.source && <StatusBadge kind="source" value={order.source} />}
                    </div>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                </div>
                {order.status === 'PAYMENT_PENDING' && order.paymentUrl && (
                  <div className="mt-3 border-t border-border pt-3">
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
            ))}
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
            <span className="px-3 font-mono text-mono-data tabular text-body-sm text-muted-foreground">
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
    </div>
  )
}
