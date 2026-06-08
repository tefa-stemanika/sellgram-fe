'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Package, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatIDRCurrency } from '@/lib/utils'
import type { Product } from '@/services/products'

type ProductColumnsOptions = {
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onManageStock: (product: Product) => void
}

export function getProductColumns({ onEdit, onDelete, onManageStock }: ProductColumnsOptions): ColumnDef<Product>[] {
  return [
    {
      accessorKey: 'emoji',
      header: '',
      cell: ({ row }) => <span className="text-xl">{row.original.emoji}</span>
    },
    {
      accessorKey: 'name',
      header: 'Nama',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi',
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate text-sm text-muted-foreground">
          {row.original.description || '-'}
        </span>
      )
    },
    {
      accessorKey: 'price',
      header: 'Harga',
      cell: ({ row }) => (
        <span className="font-mono font-semibold">{formatIDRCurrency(row.original.price)}</span>
      )
    },
    {
      accessorKey: 'stock',
      header: 'Stok',
      cell: ({ row }) => {
        const { stock, stockEnabled, lowStockAlert } = row.original
        if (!stockEnabled) return <span className="text-sm text-muted-foreground">-</span>

        const isLow = stock <= lowStockAlert
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold ${
              stock <= 0
                ? 'border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-300'
                : isLow
                  ? 'border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                  : 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
            }`}>
            {stock}
          </span>
        )
      }
    },
    {
      accessorKey: 'isAvailable',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            row.original.isAvailable
              ? 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
              : 'border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-300'
          }`}>
          {row.original.isAvailable ? 'Tersedia' : 'Tidak tersedia'}
        </span>
      )
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={(event) => {
              event.stopPropagation()
              onEdit(row.original)
            }}>
            <Pencil className="mr-1 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={(event) => {
              event.stopPropagation()
              onManageStock(row.original)
            }}>
            <Package className="mr-1 h-3.5 w-3.5" />
            Stok
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="text-white"
            onClick={(event) => {
              event.stopPropagation()
              onDelete(row.original)
            }}>
            <Trash2 className="mr-1 h-3.5 w-3.5 text-white" />
            Hapus
          </Button>
        </div>
      )
    }
  ]
}
