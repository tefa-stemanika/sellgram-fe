import { z } from 'zod'

export const BROADCAST_CHANNELS = ['TELEGRAM', 'WHATSAPP', 'EMAIL'] as const
export type BroadcastChannel = (typeof BROADCAST_CHANNELS)[number]

export const BROADCAST_STATUSES = ['DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'PAUSED', 'FAILED'] as const
export type BroadcastStatus = (typeof BROADCAST_STATUSES)[number]

export const RECIPIENT_STATUSES = ['PENDING', 'SENT', 'FAILED'] as const
export type RecipientStatus = (typeof RECIPIENT_STATUSES)[number]

export type BroadcastFilters = {
  search?: string
  hasTelegram?: string
  hasWhatsapp?: string
  hasEmail?: string
  source?: string
  totalSpentMin?: number
  totalSpentMax?: number
}

export type BroadcastCampaign = {
  id: string
  userId: string
  name: string
  channel: BroadcastChannel
  status: BroadcastStatus
  message: string
  filters: BroadcastFilters
  totalCustomers: number
  sentCount: number
  failedCount: number
  pendingCount?: number
  isPaused?: boolean
  scheduledAt: string | null
  sentAt: string | null
  createdAt: string
  updatedAt: string
}

export type BroadcastRecipient = {
  id: string
  broadcastId: string
  customerId: string
  status: RecipientStatus
  error: string | null
  sentAt: string | null
  createdAt: string
  customer: {
    id: string
    name: string | null
    username: string | null
    telegramId: string | null
    phone: string | null
    email: string | null
  }
}

export type PreviewCustomer = {
  id: string
  name: string | null
  telegramId: string | null
  hasTelegram: boolean
  phone: string | null
  email: string | null
}

export type PreviewResponse = {
  customers: PreviewCustomer[]
  total: number
}

export type ListBroadcastsParams = {
  page?: number
  limit?: number
  status?: BroadcastStatus
  sortBy?: string
  sortDir?: string
}

export const createBroadcastSchema = z.object({
  name: z.string().min(1, 'Nama campaign wajib diisi').max(200, 'Nama maksimal 200 karakter'),
  message: z.string().min(1, 'Pesan broadcast wajib diisi'),
  channel: z.enum(BROADCAST_CHANNELS).default('TELEGRAM'),
  scheduledAt: z.string().optional(),
})

export type CreateBroadcastFormValues = z.infer<typeof createBroadcastSchema>

export const updateBroadcastSchema = createBroadcastSchema.partial()
export type UpdateBroadcastFormValues = z.infer<typeof updateBroadcastSchema>

export const previewFilterSchema = z.object({
  search: z.string().optional(),
  hasTelegram: z.enum(['true', 'false']).optional(),
  hasWhatsapp: z.enum(['true', 'false']).optional(),
  hasEmail: z.enum(['true', 'false']).optional(),
  source: z.string().optional(),
  totalSpentMin: z.coerce.number().min(0).optional(),
  totalSpentMax: z.coerce.number().min(0).optional(),
})

export type PreviewFilterValues = z.infer<typeof previewFilterSchema>

export const BROADCAST_STATUS_LABELS: Record<BroadcastStatus, string> = {
  DRAFT: 'Konsep',
  SCHEDULED: 'Terjadwal',
  SENDING: 'Mengirim',
  SENT: 'Terkirim',
  PAUSED: 'Dihentikan',
  FAILED: 'Gagal',
}

export function getBroadcastStatusLabel(status: BroadcastStatus): string {
  return BROADCAST_STATUS_LABELS[status]
}

export const RECIPIENT_STATUS_LABELS: Record<RecipientStatus, string> = {
  PENDING: 'Menunggu',
  SENT: 'Terkirim',
  FAILED: 'Gagal',
}

export const SORT_BY_OPTIONS = [
  { label: 'Tanggal dibuat', value: 'createdAt' },
  { label: 'Nama', value: 'name' },
  { label: 'Status', value: 'status' },
  { label: 'Total Penerima', value: 'totalCustomers' },
  { label: 'Terkirim', value: 'sentCount' },
  { label: 'Diperbarui', value: 'updatedAt' },
]
