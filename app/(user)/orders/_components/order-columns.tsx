'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Globe, MessageCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDate, formatIDRCurrency } from '@/lib/utils'
import type { Order } from '@/services/orders'

const STATUS_BADGE: Record<string, string> = {
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300',
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300',
  PAYMENT_PENDING: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300',
  PAYMENT_FAILED: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300',
  CONFIRMED: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300',
  PROCESSING: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300'
}

type OrderColumnsOptions = {
  onDetail: (order: Order) => void
}

export function getOrderColumns({ onDetail }: OrderColumnsOptions): ColumnDef<Order>[] {
  return [
    {
      accessorKey: 'orderId',
      header: 'Order ID',
      cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.orderId}</span>
    },
    {
      id: 'source',
      header: 'Sumber',
      cell: ({ row }) => {
        const isWebsite = row.original.source === 'WEBSITE'
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              isWebsite
                ? 'border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/40 dark:text-sky-300'
                : 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/40 dark:text-emerald-300'
            }`}>
            {isWebsite ? <Globe className="size-3.5" /> : <MessageCircle className="size-3.5" />}
            {isWebsite ? 'Website' : 'Telegram'}
          </span>
        )
      }
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
        <span className="font-mono font-semibold">{formatIDRCurrency(row.original.totalPrice)}</span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[row.original.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
          {row.original.status}
        </span>
      )
    },
    {
      accessorKey: 'paidAt',
      header: 'Waktu Bayar',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.original.paidAt)}</span>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Dibuat',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</span>
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
