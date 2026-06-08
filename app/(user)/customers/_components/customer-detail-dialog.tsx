'use client'

import { useEffect, useState } from 'react'
import { Globe, Mail, MessageCircle, PackageOpen, PenTool, Phone, ShoppingCart, User } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatIDRCurrency } from '@/lib/utils'
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

const STATUS_BADGE: Record<string, string> = {
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300',
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300',
  PAYMENT_PENDING: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300',
  PAYMENT_FAILED: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300',
  CONFIRMED: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300',
  PROCESSING: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300'
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
      <DialogContent className="max-w-2xl overflow-hidden border-0 p-0 shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 to-pink-600" />
        <div className="max-h-[75vh] overflow-y-auto bg-white/30 p-6 backdrop-blur-xl dark:bg-white/5">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">Detail Pelanggan</DialogTitle>
            <DialogDescription>Informasi lengkap pelanggan.</DialogDescription>
          </DialogHeader>

          {!customer ? null : (
            <div className="mt-5 space-y-5 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 text-lg font-bold text-primary">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base font-bold">{displayName}</p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                        customer.source === 'WEBSITE'
                          ? 'border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/40 dark:text-sky-300'
                          : customer.source === 'ORDER'
                            ? 'border-violet-200 bg-violet-100 text-violet-700 dark:border-violet-900/40 dark:bg-violet-900/40 dark:text-violet-300'
                            : customer.source === 'MANUAL'
                              ? 'border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-900/40 dark:bg-orange-900/40 dark:text-orange-300'
                              : 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}>
                      {customer.source === 'WEBSITE' ? (
                        <><Globe className="size-3" /> Website</>
                      ) : customer.source === 'ORDER' ? (
                        <><ShoppingCart className="size-3" /> Order</>
                      ) : customer.source === 'MANUAL' ? (
                        <><PenTool className="size-3" /> Manual</>
                      ) : (
                        <><MessageCircle className="size-3" /> Telegram</>
                      )}
                    </span>
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
                    onClick={() => void handleDelete()}
                    className="text-white">
                    {isDeleting ? 'Menghapus...' : 'Hapus'}
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {customer.email && (
                  <InfoCard icon={Mail} label="Email" value={customer.email} gradient="from-blue-500 to-cyan-600" />
                )}
                {customer.phone && (
                  <InfoCard icon={Phone} label="No. Telepon" value={customer.phone} gradient="from-cyan-500 to-teal-600" />
                )}
                {customer.telegramId && (
                  <InfoCard
                    icon={MessageCircle}
                    label="Telegram ID"
                    value={`@${customer.username ?? customer.telegramId}`}
                    gradient="from-teal-500 to-emerald-600"
                  />
                )}
                <InfoCard
                  icon={ShoppingCart}
                  label="Total Order"
                  value={`${customer.totalOrders}x`}
                  gradient="from-primary to-purple-600"
                />
                <InfoCard
                  icon={User}
                  label="Total Belanja"
                  value={formatIDRCurrency(customer.totalSpent)}
                  gradient="from-purple-500 to-pink-600"
                />
                <InfoCard
                  icon={PackageOpen}
                  label="Bergabung"
                  value={formatDate(customer.createdAt)}
                  gradient="from-amber-500 to-orange-600"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-bold">
                  <PackageOpen className="h-4 w-4" />
                  Riwayat Order
                </h3>
                {isLoadingDetail ? (
                  <p className="text-sm text-muted-foreground">Memuat riwayat order...</p>
                ) : detail?.orders?.length ? (
                  <div className="space-y-3">
                    {detail.orders.map((order) => (
                      <div
                        key={order.id}
                        className="overflow-hidden rounded-xl border bg-white/20 backdrop-blur-xl dark:bg-white/5">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-white/10 px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold">{order.orderId}</span>
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                                STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'
                              }`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{order.source}</span>
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                        <div className="divide-y">
                          {order.orderItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between px-4 py-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span>{item.product.emoji}</span>
                                <span className="font-medium">{item.product.name}</span>
                                <span className="text-muted-foreground">
                                  {item.quantity}x @ {formatIDRCurrency(item.unitPrice)}
                                </span>
                              </div>
                              <span className="font-mono text-xs font-semibold">
                                {formatIDRCurrency(item.quantity * item.unitPrice)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between border-t bg-white/10 px-4 py-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {order.paidAt && (
                              <>
                                <span>Dibayar</span>
                                <span>{formatDate(order.paidAt)}</span>
                              </>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-muted-foreground">Total</span>
                            <p className="font-mono text-sm font-bold">{formatIDRCurrency(order.totalPrice)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Belum ada order.</p>
                )}
              </div>
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
