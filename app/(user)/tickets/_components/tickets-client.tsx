'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { TicketsBoard } from './tickets-board'
import { TicketDetailDialog } from './ticket-detail-dialog'
import {
  getTickets,
  getLabels,
  updateTicketStatus,
  type Ticket,
  type TicketDetail,
  type TicketStatus,
  type Label
} from '@/services/tickets'

type TicketsClientProps = {
  token: string
}

export function TicketsClient({ token }: TicketsClientProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setTickets([])
      setLabels([])
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [ticketData, labelData] = await Promise.all([getTickets(token), getLabels(token)])
        setTickets(ticketData)
        setLabels(labelData)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat tiket')
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
  }, [token])

  const handleStatusChange = useCallback(
    async (ticketId: string, newStatus: TicketStatus) => {
      const previous = tickets
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)))

      try {
        await updateTicketStatus(token, ticketId, newStatus)
      } catch (error) {
        setTickets(previous)
        toast.error(error instanceof Error ? error.message : 'Gagal mengubah status')
      }
    },
    [token, tickets]
  )

  const handleTicketUpdated = useCallback((updated: TicketDetail) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === updated.id
          ? {
              ...t,
              status: updated.status,
              priority: updated.priority,
              labels: updated.labels,
              _count: { comments: updated.comments.length }
            }
          : t
      )
    )
  }, [])

  const handleLabelCreated = useCallback((label: Label) => {
    setLabels((prev) => [...prev, label])
  }, [])

  return (
    <div className="flex flex-col min-w-0 h-[calc(100vh-7rem)] lg:h-[calc(100vh-6rem)]">
      <header className="shrink-0 animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tiket</span>
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight">
          Papan <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Tiket</span>
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Kelola tiket dukungan pelanggan dengan sistem Kanban.
        </p>
      </header>

      <div className="mt-6 flex-1 min-h-0 min-w-0">
        <TicketsBoard
          tickets={tickets}
          labels={labels}
          isLoading={isLoading}
          onStatusChange={handleStatusChange}
          onTicketClick={(id) => setSelectedTicketId(id)}
        />
      </div>

      <TicketDetailDialog
        token={token}
        ticketId={selectedTicketId}
        open={Boolean(selectedTicketId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTicketId(null)
          }
        }}
        onTicketUpdated={handleTicketUpdated}
        allLabels={labels}
        onLabelCreated={handleLabelCreated}
      />
    </div>
  )
}
