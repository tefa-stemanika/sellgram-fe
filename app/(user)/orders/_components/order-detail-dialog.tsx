'use client'

import { ExternalLink, Hash, PackageOpen, Phone, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Surface } from '@/components/shared/surface'
import { formatDate, formatIDRCurrency } from '@/lib/utils'
import type { Order } from '@/services/orders'

type OrderDetailDialogProps = {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailDialog({ order, open, onOpenChange }: OrderDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-subsection-header">Detail order</DialogTitle>
          <DialogDescription>Informasi lengkap order pelanggan.</DialogDescription>
        </DialogHeader>

        {!order ? null : (
          <div className="space-y-5 text-body-sm">
            <div className="grid gap-3 md:grid-cols-2">
              {order.source === 'WEBSITE' ? (
                <>
                  <InfoCard icon={User} label="Nama Customer" value={order.customerName ?? '-'} />
                  <InfoCard icon={Phone} label="No. WhatsApp" value={order.customerPhone ?? '-'} mono />
                </>
              ) : (
                <>
                  <InfoCard icon={User} label="Nama" value={order.firstName ?? '-'} />
                  <InfoCard icon={User} label="Username" value={order.username ?? '-'} />
                </>
              )}
              <InfoCard icon={Hash} label="Telegram ID" value={order.telegramId ?? '-'} mono />
              <InfoCard icon={PackageOpen} label="Total" value={formatIDRCurrency(order.totalPrice)} mono />
            </div>

            <Surface className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <p className="text-caption text-muted-foreground">Status</p>
                <StatusBadge kind="order" value={order.status} withDot />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-caption text-muted-foreground">Waktu Bayar</p>
                <p className="font-medium tabular">{formatDate(order.paidAt)}</p>
              </div>
            </Surface>

            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-card-title">
                <PackageOpen className="h-4 w-4" aria-hidden />
                Item Pesanan
              </h3>
              <Surface>
                {order.orderItems.length ? (
                  <div className="divide-y divide-border">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 transition-colors hover:bg-muted">
                        <p className="font-medium">
                          {item.product.emoji} {item.product.name}
                        </p>
                        <p className="font-mono text-mono-data tabular font-semibold">
                          {item.quantity} x {formatIDRCurrency(item.unitPrice)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="p-3 text-muted-foreground">Tidak ada item.</p>
                )}
              </Surface>
            </div>

            {order.paymentUrl ? (
              <Button type="button" asChild className="w-full">
                <a href={order.paymentUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Buka link pembayaran
                </a>
              </Button>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function InfoCard({
  icon: Icon,
  label,
  value,
  mono = false
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <Surface className="p-3">
      <div className="flex items-center gap-2 text-caption text-muted-foreground">
        <Icon className="h-3 w-3" aria-hidden />
        {label}
      </div>
      <p className={`mt-1 font-medium${mono ? ' font-mono text-mono-data tabular' : ''}`}>{value}</p>
    </Surface>
  )
}
