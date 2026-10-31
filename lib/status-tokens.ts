import type { BroadcastStatus } from '@/schemas/broadcast'
import type { FulfillmentStatus } from '@/schemas/fulfillment'
import type { OrderStatus } from '@/services/orders'
import type { TicketPriority, TicketStatus } from '@/services/tickets'

export type StatusKind =
  | 'order'
  | 'ticket-status'
  | 'ticket-priority'
  | 'broadcast'
  | 'fulfillment'
  | 'invoice'
  | 'stock'
  | 'source'
  | 'bot-health'
  | 'whatsapp-state'

export type Tone = 'success' | 'warning' | 'error' | 'info' | 'processing' | 'confirmed' | 'neutral'

export type StatusToken = { label: string; labelId: string; tone: Tone }

const MAPS: Record<StatusKind, Record<string, StatusToken>> = {
  order: {
    COMPLETED: { label: 'Completed', labelId: 'Selesai', tone: 'success' },
    PENDING: { label: 'Pending', labelId: 'Menunggu', tone: 'warning' },
    PAYMENT_PENDING: { label: 'Payment pending', labelId: 'Menunggu pembayaran', tone: 'info' },
    CONFIRMED: { label: 'Confirmed', labelId: 'Terkonfirmasi', tone: 'confirmed' },
    PROCESSING: { label: 'Processing', labelId: 'Diproses', tone: 'processing' },
    CANCELLED: { label: 'Cancelled', labelId: 'Dibatalkan', tone: 'error' },
    PAYMENT_FAILED: { label: 'Payment failed', labelId: 'Pembayaran gagal', tone: 'error' }
  },
  'ticket-status': {
    OPEN: { label: 'Open', labelId: 'Terbuka', tone: 'success' },
    IN_PROGRESS: { label: 'In progress', labelId: 'Dikerjakan', tone: 'info' },
    WAITING_CUSTOMER: { label: 'Waiting customer', labelId: 'Menunggu pelanggan', tone: 'warning' },
    RESOLVED: { label: 'Resolved', labelId: 'Selesai', tone: 'processing' },
    CLOSED: { label: 'Closed', labelId: 'Ditutup', tone: 'neutral' },
    CANCELLED: { label: 'Cancelled', labelId: 'Dibatalkan', tone: 'error' }
  },
  'ticket-priority': {
    URGENT: { label: 'Urgent', labelId: 'Segera', tone: 'error' },
    HIGH: { label: 'High', labelId: 'Tinggi', tone: 'warning' },
    MEDIUM: { label: 'Medium', labelId: 'Sedang', tone: 'info' },
    LOW: { label: 'Low', labelId: 'Rendah', tone: 'neutral' }
  },
  broadcast: {
    DRAFT: { label: 'Draft', labelId: 'Draf', tone: 'neutral' },
    SCHEDULED: { label: 'Scheduled', labelId: 'Terjadwal', tone: 'info' },
    SENDING: { label: 'Sending', labelId: 'Mengirim', tone: 'warning' },
    SENT: { label: 'Sent', labelId: 'Terkirim', tone: 'success' },
    PAUSED: { label: 'Paused', labelId: 'Dijeda', tone: 'processing' },
    FAILED: { label: 'Failed', labelId: 'Gagal', tone: 'error' }
  },
  fulfillment: {
    SUCCESS: { label: 'Success', labelId: 'Berhasil', tone: 'success' },
    FAILED: { label: 'Failed', labelId: 'Gagal', tone: 'error' },
    PENDING: { label: 'Pending', labelId: 'Menunggu', tone: 'warning' },
    PROCESSING: { label: 'Processing', labelId: 'Diproses', tone: 'processing' },
    SKIPPED: { label: 'Skipped', labelId: 'Dilewati', tone: 'neutral' }
  },
  invoice: {
    PENDING: { label: 'Pending', labelId: 'Menunggu', tone: 'warning' },
    PAID: { label: 'Paid', labelId: 'Lunas', tone: 'success' },
    EXPIRED: { label: 'Expired', labelId: 'Kedaluwarsa', tone: 'error' },
    CANCELLED: { label: 'Cancelled', labelId: 'Dibatalkan', tone: 'neutral' }
  },
  stock: {
    OUT: { label: 'Out of stock', labelId: 'Habis', tone: 'error' },
    LOW: { label: 'Low stock', labelId: 'Stok rendah', tone: 'warning' },
    AVAILABLE: { label: 'Available', labelId: 'Tersedia', tone: 'success' }
  },
  source: {
    WEBSITE: { label: 'Website', labelId: 'Website', tone: 'confirmed' },
    TELEGRAM: { label: 'Telegram', labelId: 'Telegram', tone: 'success' },
    ORDER: { label: 'Order', labelId: 'Order', tone: 'processing' },
    MANUAL: { label: 'Manual', labelId: 'Manual', tone: 'warning' }
  },
  'bot-health': {
    HEALTHY: { label: 'Healthy', labelId: 'Sehat', tone: 'success' },
    DEGRADED: { label: 'Degraded', labelId: 'Terganggu', tone: 'warning' },
    UNHEALTHY: { label: 'Unhealthy', labelId: 'Bermasalah', tone: 'error' },
    UNKNOWN: { label: 'Unknown', labelId: 'Tidak diketahui', tone: 'neutral' }
  },
  'whatsapp-state': {
    OPEN: { label: 'Connected', labelId: 'Terhubung', tone: 'success' },
    CONNECTING: { label: 'Connecting', labelId: 'Menghubungkan', tone: 'processing' },
    CLOSE: { label: 'Disconnected', labelId: 'Terputus', tone: 'warning' },
    ERROR: { label: 'Error', labelId: 'Bermasalah', tone: 'error' }
  }
}

const TONE_CLASS: Record<Tone, string> = {
  success: 'border-success/25 bg-success/12 text-success',
  warning: 'border-warning/25 bg-warning/12 text-warning',
  error: 'border-error/25 bg-error/12 text-error',
  info: 'border-info/25 bg-info/12 text-info',
  processing: 'border-status-processing/25 bg-status-processing/12 text-status-processing',
  confirmed: 'border-status-confirmed/25 bg-status-confirmed/12 text-status-confirmed',
  neutral: 'border-status-neutral/25 bg-status-neutral/12 text-status-neutral'
}

const TONE_DOT: Record<Tone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
  processing: 'bg-status-processing',
  confirmed: 'bg-status-confirmed',
  neutral: 'bg-status-neutral'
}

const NEUTRAL_TOKEN: StatusToken = { label: '-', labelId: '-', tone: 'neutral' }

export type ResolvedStatus = { label: string; labelId: string; tone: Tone; className: string; dotClassName: string }

export function resolveStatus(kind: StatusKind, key: string | null | undefined): ResolvedStatus {
  const token = (key && MAPS[kind][key.toUpperCase()]) || NEUTRAL_TOKEN
  return {
    ...token,
    className: TONE_CLASS[token.tone],
    dotClassName: TONE_DOT[token.tone]
  }
}

export function statusBadge(kind: StatusKind, key: string | null | undefined, locale: 'id' | 'en' = 'id'): ResolvedStatus {
  const resolved = resolveStatus(kind, key)
  return { ...resolved, label: locale === 'id' ? resolved.labelId : resolved.label }
}

export function statusOptions(kind: StatusKind, allLabel: string): Array<{ label: string; value: string }> {
  return [
    { label: allLabel, value: 'ALL' },
    ...Object.entries(MAPS[kind]).map(([key, token]) => ({ label: token.labelId, value: key }))
  ]
}

export const ORDER_STATUS_VALUES = Object.keys(MAPS.order) as OrderStatus[]
export const TICKET_STATUS_VALUES = Object.keys(MAPS['ticket-status']) as TicketStatus[]
export const TICKET_PRIORITY_VALUES = Object.keys(MAPS['ticket-priority']) as TicketPriority[]
export const BROADCAST_STATUS_VALUES = Object.keys(MAPS.broadcast) as BroadcastStatus[]
export const FULFILLMENT_STATUS_VALUES = Object.keys(MAPS.fulfillment) as FulfillmentStatus[]
