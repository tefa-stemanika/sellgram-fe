'use client'

import { ExternalLink } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
          <DialogTitle>Detail Order</DialogTitle>
          <DialogDescription>Informasi lengkap order pelanggan.</DialogDescription>
        </DialogHeader>

        {!order ? null : (
          <div className="space-y-5 text-sm">
            <div className="grid gap-3 rounded-md border p-4 md:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Nama</p>
                <p className="font-medium">{order.firstName ?? '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Username</p>
                <p className="font-medium">{order.username ?? '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Telegram ID</p>
                <p className="font-medium">{order.telegramId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant="secondary">{order.status}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Waktu bayar</p>
                <p className="font-medium">{formatDate(order.paidAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold">{formatIDRCurrency(order.totalPrice)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Item Pesanan</h3>
              <div className="rounded-md border">
                {order.orderItems.length ? (
                  order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b p-3 last:border-b-0">
                      <p>
                        {item.product.emoji} {item.product.name}
                      </p>
                      <p>
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
              <Button type="button" asChild>
                <a href={order.paymentUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Buka Link Pembayaran
                </a>
              </Button>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
