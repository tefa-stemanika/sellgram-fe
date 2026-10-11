'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  ExternalLink,
  Package
} from 'lucide-react'
import { getOrderStatus, type OrderStatus } from '@/services/public'
import { formatDate, formatIDRCurrency, cn } from '@/lib/utils'
import { resolveStatus } from '@/lib/status-tokens'
import { StatusBadge } from '@/components/shared/status-badge'
import { Surface } from '@/components/shared/surface'
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

export default function OrderStatusPage() {
  const params = useParams<{ orderId: string }>()
  const orderId = params.orderId

  const [order, setOrder] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getOrderStatus(orderId)
      .then(setOrder)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <Skeleton className="mb-6 h-48 w-full rounded-lg" />
        <Skeleton className="h-56 w-full rounded-lg" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-6 font-mono text-7xl font-semibold text-muted-foreground">404</div>
          <h1 className="mb-3 text-section-header font-semibold text-foreground">
            Pesanan tidak ditemukan
          </h1>
          <p className="text-body text-muted-foreground">
            Pesanan dengan kode tersebut tidak ditemukan.
          </p>
        </div>
      </div>
    )
  }

  const st = resolveStatus('order', order.status)
  const StatusIcon = statusIcon[order.status] ?? Clock

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Surface elevation={1} className="animate-fade-in-up p-8 text-center">
        <div className={cn('mx-auto mb-4 flex size-16 items-center justify-center rounded-full border', st.className)}>
          <StatusIcon className="size-8" />
        </div>
        <h1 className="text-page-title font-semibold text-foreground">
          Status pesanan
        </h1>
        <p className="mt-1 font-mono text-mono-data tabular text-body-sm text-muted-foreground">
          #{order.orderId}
        </p>
      </Surface>

      <Surface elevation={1} className="mt-6 animate-fade-in-up overflow-hidden" style={{ animationDelay: '0.08s' }}>
        <div className="border-b border-border px-6 py-4 text-center">
          <StatusBadge kind="order" value={order.status} withDot className="px-4 py-1.5" />
        </div>

        <div className="space-y-0 p-6">
          <DetailRow
            label="Total Pembayaran"
            value={formatIDRCurrency(order.totalPrice)}
            highlight
          />
          <DetailRow
            label="Nama Customer"
            value={order.customerName ?? '-'}
          />
          <DetailRow
            label="No. WhatsApp"
            value={order.customerPhone ?? '-'}
          />
          <DetailRow
            label="Tanggal Pesan"
            value={formatDate(order.createdAt)}
          />
          {order.paidAt && (
            <DetailRow
              label="Waktu Bayar"
              value={formatDate(order.paidAt)}
            />
          )}
        </div>
      </Surface>

      {order.status === 'PAYMENT_PENDING' && order.paymentUrl && (
        <div
          className="mt-6 animate-fade-in-up"
          style={{ animationDelay: '0.15s' }}
        >
          <a
            href={order.paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-body font-semibold text-primary-foreground shadow-l1 transition-colors hover:bg-primary-hover"
          >
            <ExternalLink className="size-5" />
            Bayar Sekarang
          </a>
          <p className="mt-3 text-center text-caption text-muted-foreground">
            Klik tombol di atas untuk menyelesaikan pembayaran via Midtrans
          </p>
        </div>
      )}

      <div className="mt-10 animate-fade-in-up text-center" style={{ animationDelay: '0.25s' }}>
        <div className="mx-auto h-px w-32 bg-border" />
        <p className="mt-4 text-caption text-muted-foreground">
          Powered by{' '}
          <span className="font-semibold text-foreground">Sellgram</span>
        </p>
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
  highlight
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-2 py-3.5 last:border-0">
      <span className="text-body-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          'text-body-sm text-right font-semibold text-foreground',
          highlight && 'font-mono tabular text-primary'
        )}
      >
        {value}
      </span>
    </div>
  )
}
