'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Eye, FileText, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'
import type { CampaignTemplate } from '@/schemas/broadcast'

type TemplateColumnsOptions = {
  onDetail: (template: CampaignTemplate) => void
  onDelete: (template: CampaignTemplate) => void
}

export function getTemplateColumns({ onDetail, onDelete }: TemplateColumnsOptions): ColumnDef<CampaignTemplate>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Nama Template',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-blue-600/20 text-sm">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="max-w-[240px] truncate font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(row.original.createdAt)}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'content',
      header: 'Konten',
      cell: ({ row }) => (
        <p className="max-w-[300px] truncate text-sm text-muted-foreground">{row.original.content}</p>
      ),
    },
    {
      accessorKey: 'variableCount',
      header: 'Variabel',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.variableCount} variabel</span>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDetail(row.original)
            }}
          >
            <Eye className="mr-1 h-3.5 w-3.5" />
            Detail
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="text-white"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(row.original)
            }}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5 text-white" />
            Hapus
          </Button>
        </div>
      ),
    },
  ]
}
