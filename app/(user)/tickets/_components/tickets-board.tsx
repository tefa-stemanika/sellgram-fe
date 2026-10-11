'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core'
import { Inbox, Loader2 } from 'lucide-react'

import { TicketCard, TicketCardSkeleton } from './ticket-card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { statusBadge } from '@/lib/status-tokens'
import type { Ticket, TicketStatus, Label } from '@/services/tickets'

type ColumnConfig = {
  status: TicketStatus
  title: string
}

const COLUMNS: ColumnConfig[] = [
  { status: 'OPEN', title: 'Open' },
  { status: 'IN_PROGRESS', title: 'In Progress' },
  { status: 'WAITING_CUSTOMER', title: 'Menunggu' },
  { status: 'RESOLVED', title: 'Resolved' },
  { status: 'CLOSED', title: 'Closed' },
  { status: 'CANCELLED', title: 'Dibatalkan' }
]

type TicketsBoardProps = {
  tickets: Ticket[]
  labels: Label[]
  isLoading: boolean
  onStatusChange: (ticketId: string, newStatus: TicketStatus) => void
  onTicketClick: (ticketId: string) => void
  onLoadMore: (status: TicketStatus) => void
  isLoadingMore: Record<string, boolean>
}

function ColumnLoadMore({
  status,
  onLoadMore,
  isLoading
}: {
  status: TicketStatus
  onLoadMore: (status: TicketStatus) => void
  isLoading: boolean
}) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore(status)
        }
      },
      { rootMargin: '100px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [status, onLoadMore])

  return (
    <div ref={sentinelRef} className="flex justify-center py-2">
      {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  )
}

function DroppableColumn({
  column,
  tickets,
  onTicketClick,
  onLoadMore,
  isLoadingMore
}: {
  column: ColumnConfig
  tickets: Ticket[]
  onTicketClick: (id: string) => void
  onLoadMore: (status: TicketStatus) => void
  isLoadingMore: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.status })
  const tone = statusBadge('ticket-status', column.status)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex h-full max-h-full w-72 shrink-0 flex-col rounded-lg border border-border bg-muted/40 shadow-l1',
        'transition-all duration-200',
        isOver && 'ring-2 ring-primary/30 shadow-l3'
      )}>
      <div className="flex items-center justify-between p-3 pb-0 shrink-0">
        <div className="flex items-center gap-2">
          <span className={cn('inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 font-mono text-mono-data tabular', tone.className)}>
            {tickets.length}
          </span>
          <span className="text-body font-semibold">{column.title}</span>
          <span className={cn('size-2 shrink-0 rounded-full', tone.dotClassName)} aria-hidden />
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3 min-h-[120px] flex-1 overflow-y-auto">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
            <Inbox className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-caption">Kosong</p>
          </div>
        ) : (
          tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} onClick={onTicketClick} />)
        )}

        <ColumnLoadMore status={column.status} onLoadMore={onLoadMore} isLoading={isLoadingMore} />
      </div>
    </div>
  )
}

export function TicketsBoard({
  tickets,
  labels,
  isLoading,
  onStatusChange,
  onTicketClick,
  onLoadMore,
  isLoadingMore
}: TicketsBoardProps) {
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  )

  const grouped = useMemo(() => {
    const map: Record<TicketStatus, Ticket[]> = {
      OPEN: [],
      IN_PROGRESS: [],
      WAITING_CUSTOMER: [],
      RESOLVED: [],
      CLOSED: [],
      CANCELLED: []
    }
    for (const t of tickets) {
      if (map[t.status]) {
        map[t.status].push(t)
      }
    }
    return map
  }, [tickets])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const ticket = event.active.data.current?.ticket as Ticket | undefined
    if (ticket) setActiveTicket(ticket)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTicket(null)
      const { active, over } = event
      if (!over) return

      const ticketId = active.id as string
      const newStatus = over.id as TicketStatus

      const ticket = tickets.find((t) => t.id === ticketId)
      if (!ticket || ticket.status === newStatus) return

      onStatusChange(ticketId, newStatus)
    },
    [tickets, onStatusChange]
  )

  if (isLoading) {
    return (
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div
            key={col.status}
            className="flex shrink-0 flex-col gap-3 rounded-lg border border-border bg-muted/40 w-72 p-3">
            <Skeleton className="h-5 w-20" />
            {Array.from({ length: 3 }).map((_, i) => (
              <TicketCardSkeleton key={i} />
            ))}
          </div>
        ))}
        <div className="w-1 shrink-0" />
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-4 overflow-x-auto pb-4 px-1">
        {COLUMNS.map((column) => (
          <DroppableColumn
            key={column.status}
            column={column}
            tickets={grouped[column.status]}
            onTicketClick={onTicketClick}
            onLoadMore={onLoadMore}
            isLoadingMore={Boolean(isLoadingMore[column.status])}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTicket ? (
          <div className="w-72 rotate-3 opacity-90 shadow-2xl">
            <TicketCard ticket={activeTicket} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
