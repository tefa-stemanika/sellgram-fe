import { z } from 'zod'

export const ticketStatuses = ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED', 'CANCELLED'] as const
export type TicketStatus = (typeof ticketStatuses)[number]

export const ticketPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const
export type TicketPriority = (typeof ticketPriorities)[number]

export const ticketSources = ['ORDER', 'MANUAL'] as const
export type TicketSource = (typeof ticketSources)[number]

export const updateTicketStatusSchema = z.object({
  status: z.enum(ticketStatuses)
})

export const updateTicketPrioritySchema = z.object({
  priority: z.enum(ticketPriorities)
})

export const createCommentSchema = z.object({
  body: z.string().min(1, 'Komentar tidak boleh kosong'),
  isInternal: z.boolean().optional().default(false)
})

export const updateCommentSchema = z.object({
  body: z.string().min(1, 'Komentar tidak boleh kosong')
})

export const createLabelSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default('#3B82F6')
})

export const updateLabelSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
})
