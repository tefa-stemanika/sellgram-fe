'use client'

import { useEffect, useState } from 'react'
import { Mail, MessageCircle, PackageOpen, Phone, ShoppingCart, User } from 'lucide-react'
import { toast } from 'sonner'

import { StatusBadge } from '@/components/shared/status-badge'
import { Surface } from '@/components/shared/surface'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { cn, formatDate, formatIDRCurrency } from '@/lib/utils'
import {
  deleteCustomer,
  getCustomer,
  type Customer,
  type CustomerDetail
} from '@/services/customers'

type CustomerDetailDialogProps = {
  customer: Customer | null
  token: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: (id: string) => void
  onEdit?: (customer: Customer) => void
}

export function CustomerDetailDialog({
  customer,
  token,
  open,
  onOpenChange,
  onDeleted,
  onEdit
}: CustomerDetailDialogProps) {
  const [detail, setDetail] = useState<CustomerDetail | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!open || !customer || !token) {
      setDetail(null)
      return
    }

    const fetchDetail = async () => {
      setIsLoadingDetail(true)
      try {
        const data = await getCustomer(token, customer.id)
        setDetail(data)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat detail pelanggan')
      } finally {
        setIsLoadingDetail(false)
      }
    }

    void fetchDetail()
  }, [open, customer, token])

  const handleDelete = async () => {
    if (!customer || !token) return
    setIsDeleting(true)
    try {
      await deleteCustomer(token, customer.id)
      toast.success('Pelanggan berhasil dihapus')
      onDeleted?.(customer.id)
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus pelanggan')
    } finally {
      setIsDeleting(false)
    }
  }

  const displayName = customer ? customer.name || customer.username || '-' : '-'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail Pelanggan</DialogTitle>
          <DialogDescription>Informasi lengkap pelanggan.</DialogDescription>
        </DialogHeader>

        {!customer ? null : (
          <div className="max-h-[65vh] space-y-5 overflow-y-auto pr-1 text-body-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-subsection-header text-foreground">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">{displayName}</p>
                  <StatusBadge kind="source" value={customer.source} />
                </div>
              </div>

              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onEdit(customer)
                      onOpenChange(false)
                    }}>
                    Edit
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting}
                  onClick={() => void handleDelete()}>
                  {isDeleting ? 'Menghapus...' : 'Hapus'}
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {customer.email && <InfoCard icon={Mail} label="Email" value={customer.email} />}
              {customer.phone && (
                <InfoCard icon={Phone} label="No. Telepon" value={customer.phone} mono />
              )}
              {customer.telegramId && (
                <InfoCard
                  icon={MessageCircle}
                  label="Telegram ID"
                  value={`@${customer.username ?? customer.telegramId}`}
                  mono
                />
              )}
              <InfoCard
                icon={ShoppingCart}
                label="Total Order"
                value={`${customer.totalOrders}x`}
                mono
              />
              <InfoCard
                icon={User}
                label="Total Belanja"
                value={formatIDRCurrency(customer.totalSpent)}
                mono
              />
              <InfoCard
                icon={PackageOpen}
                label="Bergabung"
                value={formatDate(customer.createdAt)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-small-header flex items-center gap-2">
                <PackageOpen className="h-4 w-4" />
                Riwayat Order
              </h3>
              {isLoadingDetail ? (
                <p className="text-body-sm text-muted-foreground">Memuat riwayat order...</p>
              ) : detail?.orders?.length ? (
                <div className="space-y-3">
                  {detail.orders.map((order) => (
                    <Surface key={order.id} className="overflow-hidden">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-mono-data font-mono tabular">{order.orderId}</span>
                          <StatusBadge kind="order" value={order.status} withDot />
                        </div>
                        <div className="flex items-center gap-3 text-caption text-muted-foreground">
                          <StatusBadge kind="source" value={order.source} />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                      <Table>
                        <TableBody>
                          {order.orderItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span aria-hidden>{item.product.emoji}</span>
                                  <span className="font-medium">{item.product.name}</span>
                                  <span className="text-caption text-muted-foreground">
                                    {item.quantity}x @ {formatIDRCurrency(item.unitPrice)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="text-mono-data font-mono tabular">
                                  {formatIDRCurrency(item.quantity * item.unitPrice)}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="flex items-center justify-between border-t border-border px-4 py-2">
                        <div className="flex items-center gap-2 text-caption text-muted-foreground">
                          {order.paidAt && (
                            <>
                              <span>Dibayar</span>
                              <span>{formatDate(order.paidAt)}</span>
                            </>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-caption text-muted-foreground">Total</span>
                          <p className="text-mono-data font-mono tabular">
                            {formatIDRCurrency(order.totalPrice)}
                          </p>
                        </div>
                      </div>
                    </Surface>
                  ))}
                </div>
              ) : (
                <p className="text-body-sm text-muted-foreground">Belum ada order.</p>
              )}
            </div>
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
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-2 text-caption text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className={cn('mt-1 font-medium', mono && 'text-mono-data font-mono tabular')}>{value}</p>
    </div>
  )
}
