'use client'

import { useMemo, useState } from 'react'

import { DataTable } from '../../_components/data-table'
import { getOrderColumns } from './order-columns'
import { OrderDetailDialog } from './order-detail-dialog'
import type { Order, OrderStatus } from '@/services/orders'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type OrdersClientProps = {
  initialData: Order[]
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

export function OrdersClient({ initialData }: OrdersClientProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL')

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'ALL') return initialData
    return initialData.filter((order) => order.status === statusFilter)
  }, [initialData, statusFilter])

  const columns = useMemo(
    () =>
      getOrderColumns({
        onDetail: (order) => setSelectedOrder(order)
      }),
    []
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-muted-foreground">Daftar semua order dari pelanggan.</p>
        </div>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'ALL')}>
          <SelectTrigger className="w-full sm:w-56">
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

      <DataTable columns={columns} data={filteredOrders} onRowClick={(order) => setSelectedOrder(order)} />

      <OrderDetailDialog
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />
    </div>
  )
}
