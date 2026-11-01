'use client'

import { ExternalLink, MessageCircle, PackageOpen } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { InfoCard } from '@/components/shared/info-card'
import { OrderBuyerInfo, buyerJid } from '@/components/shared/order-buyer-info'
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
              <OrderBuyerInfo order={order} variant="cards" />
              <BuyerJidCard order={order} />
              <InfoCard icon={PackageOpen} label="Total" value={formatIDRCurrency(order.totalPrice)} mono />
            </div>

            <Surface className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <p className="text-caption text-muted-foreground">Sumber</p>
                <StatusBadge kind="source" value={order.source} />
              </div>
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

function BuyerJidCard({ order }: { order: Order }) {
  const jid = buyerJid(order)
  if (!jid) return null
  return <InfoCard icon={MessageCircle} label="WhatsApp JID" value={jid} mono />
}
