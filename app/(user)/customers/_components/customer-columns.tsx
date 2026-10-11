'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'

import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatIDRCurrency } from '@/lib/utils'
import type { Customer } from '@/services/customers'

type CustomerColumnsOptions = {
  onDetail: (customer: Customer) => void
}

export function getCustomerColumns({ onDetail }: CustomerColumnsOptions): ColumnDef<Customer>[] {
  return [
    {
      id: 'name',
      header: 'Pelanggan',
      cell: ({ row }) => {
        const c = row.original
        const displayName = c.name || c.username || '-'
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-caption text-foreground">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{displayName}</p>
              {c.email && <p className="text-caption text-muted-foreground">{c.email}</p>}
            </div>
          </div>
        )
      }
    },
    {
      id: 'contact',
      header: 'Kontak',
      cell: ({ row }) => {
        const c = row.original
        return (
          <div className="space-y-0.5 text-caption text-muted-foreground">
            {c.phone && <p className="font-mono tabular">{c.phone}</p>}
            {c.telegramId && <p className="font-mono">@{c.username ?? c.telegramId}</p>}
            {!c.phone && !c.telegramId && <p>-</p>}
          </div>
        )
      }
    },
    {
      id: 'source',
      header: 'Sumber',
      cell: ({ row }) => <StatusBadge kind="source" value={row.original.source} />
    },
    {
      accessorKey: 'totalOrders',
      header: 'Total Order',
      cell: ({ row }) => (
        <span className="text-mono-data font-mono tabular">
          {row.original.totalOrders}x
        </span>
      )
    },
    {
      accessorKey: 'totalSpent',
      header: 'Total Belanja',
      cell: ({ row }) => (
        <span className="text-mono-data font-mono tabular">
          {formatIDRCurrency(row.original.totalSpent)}
        </span>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Bergabung',
      cell: ({ row }) => (
        <span className="text-caption text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
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
