'use client'

import { useDraggable } from '@dnd-kit/core'
import { MessageSquare } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatDate } from '@/lib/utils'
import { statusBadge, type Tone } from '@/lib/status-tokens'
import type { Ticket } from '@/services/tickets'

const PRIORITY_BORDER: Record<Tone, string> = {
  error: 'border-l-error',
  warning: 'border-l-warning',
  info: 'border-l-info',
  success: 'border-l-success',
  processing: 'border-l-status-processing',
  confirmed: 'border-l-status-confirmed',
  neutral: 'border-l-status-neutral'
}

type TicketCardProps = {
  ticket: Ticket
  onClick: (id: string) => void
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ticket.id,
    data: { ticket }
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50
      }
    : undefined

  const priority = statusBadge('ticket-priority', ticket.priority)

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      role="button"
      tabIndex={0}
      onClick={() => onClick(ticket.id)}
      className={cn(
        'cursor-grab rounded-lg border border-border bg-card text-card-foreground shadow-l1',
        'transition-all duration-200 hover:shadow-l2 active:cursor-grabbing',
        PRIORITY_BORDER[priority.tone],
        'border-l-2',
        isDragging && 'opacity-50 shadow-l3 ring-2 ring-primary/30',
        !isDragging && 'hover:-translate-y-0.5'
      )}>
      <div className="p-3 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-body-sm font-semibold leading-snug line-clamp-2">{ticket.title}</p>
          <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', priority.dotClassName)} />
        </div>

        {ticket.customerName && (
          <p className="text-caption text-muted-foreground">
            {ticket.customerName}
            {ticket.customerContact && ` \u2022 ${ticket.customerContact}`}
          </p>
        )}

        {ticket.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ticket.labels.map((tl) => (
              <span
                key={tl.labelId}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-caption font-medium leading-none"
                style={{
                  backgroundColor: `${tl.label.color}20`,
                  color: tl.label.color
                }}>
                {tl.label.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-caption text-muted-foreground">
          <span>{formatDate(ticket.createdAt)}</span>
          {ticket._count.comments > 0 && (
            <span className="flex items-center gap-1 font-mono text-mono-data tabular">
              <MessageSquare className="h-3 w-3" />
              {ticket._count.comments}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function TicketCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-1">
        <Skeleton className="h-4 w-12 rounded-full" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-1/3" />
    </div>
  )
}
