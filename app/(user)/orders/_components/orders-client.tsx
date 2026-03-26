'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { DataTable } from '../../_components/data-table'
import { getOrderColumns } from './order-columns'
import { OrderDetailDialog } from './order-detail-dialog'
import { getOrders, type Order, type OrderStatus } from '@/services/orders'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type OrdersClientProps = {
  token: string
}

const ORDER_FILTERS: Array<{ label: string; value: OrderStatus | 'ALL' }> = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Payment Pending', value: 'PAYMENT_PENDING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Payment Failed', value: 'PAYMENT_FAILED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Processing', value: 'PROCESSING' }
]

export function OrdersClient({ token }: OrdersClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const statusParam = searchParams.get('status')
  const statusFilter: OrderStatus | 'ALL' =
    statusParam && ORDER_FILTERS.some((filter) => filter.value === statusParam)
      ? (statusParam as OrderStatus | 'ALL')
      : 'ALL'

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setOrders([])
        return
      }

      try {
        const latest = await getOrders(token, 50)
        setOrders(latest)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat orders')
      }
    }

    void fetchData()
  }, [token])

  const handleStatusChange = (value: OrderStatus | 'ALL') => {
    const nextParams = new URLSearchParams(searchParams.toString())
    if (value === 'ALL') {
      nextParams.delete('status')
    } else {
      nextParams.set('status', value)
    }

    const query = nextParams.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'ALL') return orders
    return orders.filter((order) => order.status === statusFilter)
  }, [orders, statusFilter])

  const columns = useMemo(
    () =>
      getOrderColumns({
        onDetail: (order) => setSelectedOrder(order)
      }),
    []
  )

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Orders</h1>
            <p className="text-sm text-muted-foreground">Daftar semua order dari pelanggan.</p>
          </div>

          <Select value={statusFilter} onValueChange={(value) => handleStatusChange(value as OrderStatus | 'ALL')}>
            <SelectTrigger className="w-full border-border/70 bg-background/80 sm:w-56">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_FILTERS.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
        <DataTable columns={columns} data={filteredOrders} onRowClick={(order) => setSelectedOrder(order)} />
      </div>

      <OrderDetailDialog
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />
    </div>
  )
}
