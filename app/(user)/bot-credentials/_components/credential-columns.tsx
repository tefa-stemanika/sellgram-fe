'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { BotCredential } from '@/services/bot-credentials'

type CredentialColumnsOptions = {
  onEdit: (credential: BotCredential) => void
  onDelete: (credential: BotCredential) => void
}

export function getCredentialColumns({ onEdit, onDelete }: CredentialColumnsOptions): ColumnDef<BotCredential>[] {
  return [
    {
      accessorKey: 'key',
      header: 'Key',
      cell: ({ row }) => <span className="font-mono text-mono-data">{row.original.key}</span>
    },
    {
      id: 'value',
      header: 'Value',
      cell: () => <span className="font-mono text-mono-data tabular">&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</span>
    },
    {
      accessorKey: 'updatedAt',
      header: 'Diupdate',
      cell: ({ row }) =>
        row.original.updatedAt ? (
          <span className="text-caption tabular text-muted-foreground">{formatDate(new Date(row.original.updatedAt))}</span>
        ) : (
          '-'
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
