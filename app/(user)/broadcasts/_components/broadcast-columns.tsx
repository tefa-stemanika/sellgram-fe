'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { CalendarClock, Eye, Mail, Play, Send, SendHorizonal, SquarePen, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatDateTime } from '@/lib/utils'
import type { BroadcastCampaign } from '@/schemas/broadcast'

type BroadcastColumnsOptions = {
  onAction: (broadcast: BroadcastCampaign, action: string) => void
  onDetail: (broadcast: BroadcastCampaign) => void
}

export function getBroadcastColumns({
  onAction,
  onDetail,
}: BroadcastColumnsOptions): ColumnDef<BroadcastCampaign>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Nama campaign',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {row.original.channel === 'TELEGRAM' ? <Send className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <p className="max-w-[200px] truncate font-medium">{row.original.name}</p>
            <p className="text-caption tabular text-muted-foreground">{formatDateTime(row.original.createdAt)}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge kind="broadcast" value={row.original.status} withDot />,
    },
    {
      id: 'progress',
      header: 'Progress',
      cell: ({ row }) => {
        const b = row.original
        const total = b.totalCustomers || 1
        const sent = b.sentCount || 0
        const failed = b.failedCount || 0
        const pct = Math.round((sent / total) * 100)
        return (
          <div className="min-w-[140px]">
            <div className="flex items-center justify-between text-caption">
              <span className="font-mono tabular text-mono-data text-muted-foreground">
                {sent}/{total}
              </span>
              {failed > 0 && <span className="font-mono tabular text-mono-data text-error">{failed} gagal</span>}
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      },
    },
    {
      id: 'schedule',
      header: 'Jadwal',
      cell: ({ row }) =>
        row.original.scheduledAt ? (
          <div className="flex items-center gap-1.5 text-caption tabular text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            {formatDateTime(row.original.scheduledAt)}
          </div>
        ) : (
          <span className="text-caption text-muted-foreground">-</span>
        ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const b = row.original
        const canEdit = b.status === 'DRAFT' || b.status === 'SCHEDULED'
        const canSend = b.status === 'DRAFT' || b.status === 'SCHEDULED'
        const canPause = b.status === 'SENDING'
        const canResume = b.status === 'PAUSED'
        const canCancel = b.status === 'SENDING' || b.status === 'SCHEDULED'

        return (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onDetail(b)
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {canSend && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  onAction(b, 'send')
                }}
              >
                <SendHorizonal className="h-4 w-4" />
              </Button>
            )}
            {canPause && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  onAction(b, 'pause')
                }}
              >
                <SquarePen className="h-4 w-4" />
              </Button>
            )}
            {canResume && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  onAction(b, 'resume')
                }}
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            {canCancel && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  onAction(b, 'cancel')
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {canEdit && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  onAction(b, 'delete')
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )
      },
    },
  ]
}
