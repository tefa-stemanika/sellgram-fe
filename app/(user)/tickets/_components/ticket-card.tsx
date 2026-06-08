'use client'

import { useDraggable } from '@dnd-kit/core'
import { MessageSquare } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatDate } from '@/lib/utils'
import type { Ticket } from '@/services/tickets'

const PRIORITY_CONFIG: Record<string, { label: string; border: string; dot: string }> = {
  URGENT: { label: 'Urgent', border: 'border-l-red-500', dot: 'bg-red-500' },
  HIGH: { label: 'High', border: 'border-l-orange-500', dot: 'bg-orange-500' },
  MEDIUM: {
    label: 'Medium',
    border: 'border-l-blue-500',
    dot: 'bg-blue-500'
  },
  LOW: { label: 'Low', border: 'border-l-slate-400', dot: 'bg-slate-400' }
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

  const priority = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.LOW

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
        'cursor-grab rounded-xl border bg-white/20 backdrop-blur-xl shadow-sm',
        'transition-all duration-200 hover:shadow-md active:cursor-grabbing',
        'dark:bg-white/5',
        priority.border,
        'border-l-4',
        isDragging && 'opacity-50 shadow-xl ring-2 ring-primary/30',
        !isDragging && 'hover:-translate-y-0.5'
      )}>
      <div className="p-3 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-snug line-clamp-2">{ticket.title}</p>
          <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', priority.dot)} />
        </div>

        {ticket.customerName && (
          <p className="text-xs text-muted-foreground">
            {ticket.customerName}
            {ticket.customerContact && ` \u2022 ${ticket.customerContact}`}
          </p>
        )}

        {ticket.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ticket.labels.map((tl) => (
              <span
                key={tl.labelId}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium leading-none"
                style={{
                  backgroundColor: `${tl.label.color}20`,
                  color: tl.label.color
                }}>
                {tl.label.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{formatDate(ticket.createdAt)}</span>
          {ticket._count.comments > 0 && (
            <span className="flex items-center gap-1">
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
    <div className="rounded-xl border bg-white/20 backdrop-blur-xl dark:bg-white/5 p-3 space-y-3">
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
