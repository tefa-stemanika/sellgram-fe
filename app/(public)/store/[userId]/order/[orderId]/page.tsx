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
        <Skeleton className="mb-6 h-48 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-6 text-7xl">404</div>
          <h1 className="mb-3 text-section-header font-black text-foreground">
            Pesanan Tidak Ditemukan
          </h1>
          <p className="text-body text-muted-foreground">
            Pesanan dengan kode tersebut tidak ditemukan.
          </p>
          <div className="mx-auto mt-8 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-secondary" />
        </div>
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

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div
        className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-secondary/5"
        style={{ animation: 'slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' }}
      >
        <div className="bg-white/80 backdrop-blur-sm dark:bg-card/80 p-8 text-center">
          <div className={cn('mx-auto mb-4 flex size-16 items-center justify-center rounded-full', cfg.iconBg)}>
            <StatusIcon className="size-8" />
          </div>
          <h1 className="text-page-title font-black text-foreground">
            Status Pesanan
          </h1>
          <p className="mt-1 font-mono text-body-sm text-muted-foreground">
            #{order.orderId}
          </p>
        </div>
      </div>

      <div
        className="mt-6 rounded-2xl bg-card"
        style={{ animation: 'slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both', animationDelay: '0.08s' }}
      >
        <div className={cn('rounded-t-2xl bg-gradient-to-br p-8 text-center', cfg.gradient)}>
          <div className={cn('mx-auto inline-flex items-center gap-2 rounded-full px-5 py-2 text-label font-bold', cfg.iconBg)}>
            <StatusIcon className="size-4" />
            {cfg.label}
          </div>
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
      </div>

      {order.status === 'PAYMENT_PENDING' && order.paymentUrl && (
        <div
          className="mt-6"
          style={{ animation: 'slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both', animationDelay: '0.15s' }}
        >
          <a
            href={order.paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-primary/90 text-body font-bold text-primary-foreground shadow-md transition-all hover:from-primary/90 hover:to-primary/70 active:scale-[0.98]"
          >
            <ExternalLink className="size-5" />
            Bayar Sekarang
          </a>
          <p className="mt-3 text-center text-caption text-muted-foreground">
            Klik tombol di atas untuk menyelesaikan pembayaran via Midtrans
          </p>
        </div>
      )}

      <div
        className="mt-10 text-center"
        style={{ animation: 'fadeIn 0.5s ease both', animationDelay: '0.25s' }}
      >
        <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-border to-transparent" />
        <p className="mt-4 text-caption text-muted-foreground">
          Powered by{' '}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text font-semibold text-transparent">
            Sellgram
          </span>
        </p>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
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
    <div className="flex items-center justify-between gap-4 border-b border-border/50 px-2 py-3.5 last:border-0">
      <span className="text-body-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          'text-body-sm text-right font-semibold text-foreground',
          highlight && 'font-bold text-primary'
        )}
      >
        {value}
      </span>
    </div>
  )
}
