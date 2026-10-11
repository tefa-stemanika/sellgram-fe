'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatDate, formatIDRCurrency } from '@/lib/utils'
import type { Order } from '@/services/orders'

type OrderColumnsOptions = {
  onDetail: (order: Order) => void
}

export function getOrderColumns({ onDetail }: OrderColumnsOptions): ColumnDef<Order>[] {
  return [
    {
      accessorKey: 'orderId',
      header: 'Order ID',
      cell: ({ row }) => (
        <span className="font-mono text-mono-data tabular font-medium">{row.original.orderId}</span>
      )
    },
    {
      id: 'source',
      header: 'Sumber',
      cell: ({ row }) => <StatusBadge kind="source" value={row.original.source} />
    },
    {
      id: 'customer',
      header: 'Pelanggan',
      cell: ({ row }) => {
        const o = row.original
        const name = o.source === 'WEBSITE' ? o.customerName : (o.firstName ?? o.username)
        return <span className="font-medium">{name ?? '-'}</span>
      }
    },
    {
      accessorKey: 'totalPrice',
      header: 'Total',
      cell: ({ row }) => (
        <span className="font-mono text-mono-data tabular font-semibold">{formatIDRCurrency(row.original.totalPrice)}</span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge kind="order" value={row.original.status} withDot />
    },
    {
      accessorKey: 'paidAt',
      header: 'Waktu Bayar',
      cell: ({ row }) => (
        <span className="text-caption tabular text-muted-foreground">{formatDate(row.original.paidAt)}</span>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Dibuat',
      cell: ({ row }) => (
        <span className="text-caption tabular text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      )
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
          <Eye className="mr-1 h-3.5 w-3.5" />
          Detail
        </Button>
      )
    }
  ]
}
