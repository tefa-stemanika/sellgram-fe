'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatIDRCurrency } from '@/lib/utils'
import type { Product } from '@/services/products'

type ProductColumnsOptions = {
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function getProductColumns({ onEdit, onDelete }: ProductColumnsOptions): ColumnDef<Product>[] {
  return [
    {
      accessorKey: 'emoji',
      header: '',
      cell: ({ row }) => <span className="text-lg">{row.original.emoji}</span>
    },
    {
      accessorKey: 'name',
      header: 'Nama',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi'
    },
    {
      accessorKey: 'price',
      header: 'Harga',
      cell: ({ row }) => formatIDRCurrency(row.original.price)
    },
    {
      accessorKey: 'isAvailable',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isAvailable ? 'default' : 'secondary'}>
          {row.original.isAvailable ? 'Tersedia' : 'Tidak tersedia'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={(event) => {
              event.stopPropagation()
              onEdit(row.original)
            }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="destructive"
            onClick={(event) => {
              event.stopPropagation()
              onDelete(row.original)
            }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]
}
