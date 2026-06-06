'use client'

import { ExternalLink, Hash, PackageOpen, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatDate, formatIDRCurrency } from '@/lib/utils'
import type { Order } from '@/services/orders'

type OrderDetailDialogProps = {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_BADGE: Record<string, string> = {
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300',
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300',
  PAYMENT_PENDING: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300',
  PAYMENT_FAILED: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300',
  CONFIRMED: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300',
  PROCESSING: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300'
}

export function OrderDetailDialog({ order, open, onOpenChange }: OrderDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden border-0 p-0 shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-violet-600" />
        <div className="bg-white/30 p-6 backdrop-blur-xl dark:bg-white/5">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">Detail Order</DialogTitle>
            <DialogDescription>Informasi lengkap order pelanggan.</DialogDescription>
          </DialogHeader>

          {!order ? null : (
            <div className="mt-5 space-y-5 text-sm">
              <div className="grid gap-3 md:grid-cols-2">
                <InfoCard
                  icon={User}
                  label="Nama"
                  value={order.firstName ?? '-'}
                  gradient="from-blue-500 to-cyan-600"
                />
                <InfoCard
                  icon={User}
                  label="Username"
                  value={order.username ?? '-'}
                  gradient="from-cyan-500 to-teal-600"
                />
                <InfoCard
                  icon={Hash}
                  label="Telegram ID"
                  value={order.telegramId}
                  gradient="from-teal-500 to-emerald-600"
                />
                <InfoCard
                  icon={PackageOpen}
                  label="Total"
                  value={formatIDRCurrency(order.totalPrice)}
                  gradient="from-primary to-purple-600"
                />
              </div>

              <div className="rounded-xl border bg-white/20 p-4 backdrop-blur-xl dark:bg-white/5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Waktu Bayar</p>
                  <p className="font-medium">{formatDate(order.paidAt)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-bold">
                  <PackageOpen className="h-4 w-4" />
                  Item Pesanan
                </h3>
                <div className="divide-y rounded-xl border bg-white/20 backdrop-blur-xl dark:bg-white/5">
                  {order.orderItems.length ? (
                    order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 transition-colors hover:bg-white/10">
                        <p className="font-medium">
                          {item.product.emoji} {item.product.name}
                        </p>
                        <p className="font-mono text-xs font-semibold">
                          {item.quantity} x {formatIDRCurrency(item.unitPrice)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="p-3 text-muted-foreground">Tidak ada item.</p>
                  )}
                </div>
              </div>

              {order.paymentUrl ? (
                <Button type="button" asChild className="w-full">
                  <a href={order.paymentUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Buka Link Pembayaran
                  </a>
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoCard({
  icon: Icon,
  label,
  value,
  gradient
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  gradient: string
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white/20 backdrop-blur-xl dark:bg-white/5">
      <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />
      <div className="p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="h-3 w-3" />
          {label}
        </div>
        <p className="mt-1 font-medium">{value}</p>
      </div>
    </div>
  )
}
