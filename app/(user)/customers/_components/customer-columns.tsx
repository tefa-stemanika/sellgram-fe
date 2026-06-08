'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Globe, MessageCircle, PenTool, ShoppingCart, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDate, formatIDRCurrency } from '@/lib/utils'
import type { Customer } from '@/services/customers'

const SOURCE_BADGE: Record<string, string> = {
  WEBSITE: 'border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/40 dark:text-sky-300',
  TELEGRAM: 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/40 dark:text-emerald-300',
  ORDER: 'border-violet-200 bg-violet-100 text-violet-700 dark:border-violet-900/40 dark:bg-violet-900/40 dark:text-violet-300',
  MANUAL: 'border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-900/40 dark:bg-orange-900/40 dark:text-orange-300'
}

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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 text-xs font-bold text-primary">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{displayName}</p>
              {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
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
          <div className="space-y-0.5 text-xs text-muted-foreground">
            {c.phone && <p>{c.phone}</p>}
            {c.telegramId && <p className="font-mono">@{c.username ?? c.telegramId}</p>}
            {!c.phone && !c.telegramId && <p>-</p>}
          </div>
        )
      }
    },
    {
      id: 'source',
      header: 'Sumber',
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            SOURCE_BADGE[row.original.source] || 'bg-gray-100 text-gray-700 border-gray-200'
          }`}>
          {row.original.source === 'WEBSITE' ? (
            <>
              <Globe className="size-3.5" />
              Website
            </>
          ) : row.original.source === 'ORDER' ? (
            <>
              <ShoppingCart className="size-3.5" />
              Order
            </>
          ) : row.original.source === 'MANUAL' ? (
            <>
              <PenTool className="size-3.5" />
              Manual
            </>
          ) : (
            <>
              <MessageCircle className="size-3.5" />
              Telegram
            </>
          )}
        </span>
      )
    },
    {
      accessorKey: 'totalOrders',
      header: 'Total Order',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.totalOrders}x</span>
    },
    {
      accessorKey: 'totalSpent',
      header: 'Total Belanja',
      cell: ({ row }) => (
        <span className="font-mono font-semibold">{formatIDRCurrency(row.original.totalSpent)}</span>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Bergabung',
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
