'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Package, Pencil, Trash2, Zap } from 'lucide-react'

import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { formatIDRCurrency } from '@/lib/utils'
import type { Product } from '@/services/products'

type ProductColumnsOptions = {
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onManageStock: (product: Product) => void
  onManageFulfillment: (product: Product) => void
}

const NEUTRAL_CHIP_CLASS =
  'inline-flex items-center rounded-full border border-border bg-muted/50 px-2 py-0.5 text-caption font-medium text-muted-foreground'

export function getProductColumns({
  onEdit,
  onDelete,
  onManageStock,
  onManageFulfillment
}: ProductColumnsOptions): ColumnDef<Product>[] {
  return [
    {
      accessorKey: 'emoji',
      header: '',
      cell: ({ row }) => <span className="text-subsection-header leading-none">{row.original.emoji}</span>
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
        <span className="max-w-[200px] truncate text-body-sm text-muted-foreground">{row.original.description || '-'}</span>
      )
    },
    {
      accessorKey: 'price',
      header: 'Harga',
      cell: ({ row }) => (
        <span className="text-mono-data font-mono font-semibold tabular">{formatIDRCurrency(row.original.price)}</span>
      )
    },
    {
      accessorKey: 'stock',
      header: 'Stok',
      cell: ({ row }) => {
        const { stock, stockEnabled, lowStockAlert } = row.original
        if (!stockEnabled) return <span className="text-body-sm text-muted-foreground">-</span>

        const stockKey = stock <= 0 ? 'OUT' : stock <= lowStockAlert ? 'LOW' : 'AVAILABLE'
        return (
          <div className="flex items-center gap-2">
            <span className="text-mono-data font-mono tabular">{stock}</span>
            <StatusBadge kind="stock" value={stockKey} />
          </div>
        )
      }
    },
    {
      accessorKey: 'isAvailable',
      header: 'Status',
      cell: ({ row }) =>
        row.original.isAvailable ? (
          <StatusBadge kind="stock" value="AVAILABLE" />
        ) : (
          <span className={NEUTRAL_CHIP_CLASS}>Tidak tersedia</span>
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
            }}
          >
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
            }}
          >
            <Package className="mr-1 h-3.5 w-3.5" />
            Stok
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={(event) => {
              event.stopPropagation()
              onManageFulfillment(row.original)
            }}
          >
            <Zap className="mr-1 h-3.5 w-3.5" />
            Fulfillment
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={(event) => {
              event.stopPropagation()
              onDelete(row.original)
            }}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Hapus
          </Button>
        </div>
      )
    }
  ]
}
