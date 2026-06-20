'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { CalendarClock, Eye, Play, SendHorizonal, SquarePen, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import type { BroadcastCampaign, BroadcastStatus } from '@/schemas/broadcast'
import { getBroadcastStatusLabel } from '@/schemas/broadcast'

const STATUS_BADGE: Record<BroadcastStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/40 dark:text-gray-300',
  SCHEDULED: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300',
  SENDING: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300',
  SENT: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300',
  PAUSED: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300',
  FAILED: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300',
}

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
      header: 'Nama Campaign',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-blue-600/20 text-sm">
            {row.original.channel === 'TELEGRAM' ? '📨' : '📧'}
          </div>
          <div>
            <p className="max-w-[200px] truncate font-medium">{row.original.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(row.original.createdAt)}
                    </p>
          </div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={`${STATUS_BADGE[row.original.status] || ''}`}
        >
          {getBroadcastStatusLabel(row.original.status)}
        </Badge>
      ),
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
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{sent}/{total}</span>
              {failed > 0 && (
                <span className="text-red-500">{failed} gagal</span>
              )}
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-blue-600 transition-all"
                style={{ width: `${pct}%` }}
              />
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
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            {formatDateTime(row.original.scheduledAt)}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
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
                className="h-8 w-8 text-emerald-600"
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
                className="h-8 w-8 text-amber-600"
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
                className="h-8 w-8 text-emerald-600"
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
                className="h-8 w-8 text-red-600"
                onClick={(e) => {
                  e.stopPropagation()
                  onAction(b, 'cancel')
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
