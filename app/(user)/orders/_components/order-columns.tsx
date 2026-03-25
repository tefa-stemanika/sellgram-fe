'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatIDRCurrency } from '@/lib/utils'
import type { Order, OrderStatus } from '@/services/orders'

const STATUS_BADGE_VARIANT: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PAYMENT_PENDING: 'outline',
  COMPLETED: 'default',
  PAYMENT_FAILED: 'destructive',
  CANCELLED: 'destructive',
  CONFIRMED: 'secondary',
  PROCESSING: 'secondary',
  PENDING: 'secondary'
}

type OrderColumnsOptions = {
  onDetail: (order: Order) => void
}

export function getOrderColumns({ onDetail }: OrderColumnsOptions): ColumnDef<Order>[] {
  return [
    {
      accessorKey: 'orderId',
      header: 'Order ID',
      cell: ({ row }) => <span className="font-medium">{row.original.orderId}</span>
    },
    {
      id: 'customer',
      header: 'Pelanggan',
      cell: ({ row }) => row.original.firstName ?? row.original.username ?? '-'
    },
    {
      accessorKey: 'totalPrice',
      header: 'Total',
      cell: ({ row }) => formatIDRCurrency(row.original.totalPrice)
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant={STATUS_BADGE_VARIANT[row.original.status]}>{row.original.status}</Badge>
    },
    {
      accessorKey: 'paidAt',
      header: 'Paid At',
      cell: ({ row }) => formatDate(row.original.paidAt)
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => formatDate(row.original.createdAt)
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(event) => {
            event.stopPropagation()
            onDetail(row.original)
          }}>
          <Eye className="h-4 w-4" />
          Detail
        </Button>
      )
    }
  ]
}
