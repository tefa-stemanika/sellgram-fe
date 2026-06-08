'use client'

import { useState, useMemo, useCallback } from 'react'
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
import { Inbox } from 'lucide-react'

import { TicketCard, TicketCardSkeleton } from './ticket-card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Ticket, TicketStatus, Label } from '@/services/tickets'

type ColumnConfig = {
  status: TicketStatus
  title: string
  gradient: string
  iconBg: string
  iconColor: string
  borderColor: string
}

const COLUMNS: ColumnConfig[] = [
  {
    status: 'OPEN',
    title: 'Open',
    gradient: 'from-emerald-500 to-green-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-800'
  },
  {
    status: 'IN_PROGRESS',
    title: 'In Progress',
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  {
    status: 'WAITING_CUSTOMER',
    title: 'Menunggu',
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-800'
  },
  {
    status: 'RESOLVED',
    title: 'Resolved',
    gradient: 'from-indigo-500 to-purple-600',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    iconColor: 'text-indigo-600 dark:text-indigo-300',
    borderColor: 'border-indigo-200 dark:border-indigo-800'
  },
  {
    status: 'CLOSED',
    title: 'Closed',
    gradient: 'from-slate-500 to-slate-600',
    iconBg: 'bg-slate-100 dark:bg-slate-800/40',
    iconColor: 'text-slate-600 dark:text-slate-300',
    borderColor: 'border-slate-200 dark:border-slate-700'
  },
  {
    status: 'CANCELLED',
    title: 'Dibatalkan',
    gradient: 'from-red-500 to-rose-600',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    iconColor: 'text-red-600 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-800'
  }
]

type TicketsBoardProps = {
  tickets: Ticket[]
  labels: Label[]
  isLoading: boolean
  onStatusChange: (ticketId: string, newStatus: TicketStatus) => void
  onTicketClick: (ticketId: string) => void
}

function DroppableColumn({
  column,
  tickets,
  onTicketClick
}: {
  column: ColumnConfig
  tickets: Ticket[]
  onTicketClick: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.status })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex h-full max-h-full shrink-0 flex-col rounded-2xl border bg-white/20 backdrop-blur-xl shadow-sm',
        'transition-all duration-200 dark:bg-white/5',
        'w-[300px]',
        isOver && 'ring-2 ring-primary/30 shadow-lg'
      )}>
      <div className="flex items-center justify-between p-3 pb-0 shrink-0">
        <div className="flex items-center gap-2">
          <div className={cn('flex h-6 w-6 items-center justify-center rounded-md', column.iconBg)}>
            <span className={cn('text-[10px] font-bold', column.iconColor)}>{tickets.length}</span>
          </div>
          <span className="text-sm font-semibold">{column.title}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3 min-h-[120px] flex-1 overflow-y-auto">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
            <Inbox className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-xs">Kosong</p>
          </div>
        ) : (
          tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} onClick={onTicketClick} />)
        )}
      </div>
    </div>
  )
}

export function TicketsBoard({ tickets, labels, isLoading, onStatusChange, onTicketClick }: TicketsBoardProps) {
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
            className="flex shrink-0 flex-col gap-3 rounded-2xl border bg-white/20 backdrop-blur-xl dark:bg-white/5 w-[300px] p-3">
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
          />
        ))}
      </div>

      <DragOverlay>
        {activeTicket ? (
          <div className="w-[300px] rotate-3 opacity-90 shadow-2xl">
            <TicketCard ticket={activeTicket} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
