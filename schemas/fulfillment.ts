import { z } from 'zod'

export const FULFILLMENT_TYPES = ['STOCK_POOL', 'SLOT_ASSIGN', 'API_EXTERNAL', 'MANUAL'] as const
export type FulfillmentType = (typeof FULFILLMENT_TYPES)[number]

export const FULFILLMENT_STATUSES = ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'SKIPPED'] as const
export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number]

export const STOCK_ITEM_STATUSES = ['AVAILABLE', 'USED', 'RESERVED', 'EXPIRED'] as const
export type StockItemStatus = (typeof STOCK_ITEM_STATUSES)[number]

export const SLOT_STATUSES = ['ACTIVE', 'AVAILABLE', 'EXPIRED'] as const
export type SlotStatus = (typeof SLOT_STATUSES)[number]

export const API_METHODS = ['POST', 'GET', 'PUT'] as const
export type ApiMethod = (typeof API_METHODS)[number]

const FULFILLMENT_TYPE_LABELS: Record<FulfillmentType, string> = {
  STOCK_POOL: 'Voucher / Stok',
  SLOT_ASSIGN: 'Akun Sharing',
  API_EXTERNAL: 'API Supplier',
  MANUAL: 'Manual / Fisik',
}

export function getFulfillmentTypeLabel(type: FulfillmentType): string {
  return FULFILLMENT_TYPE_LABELS[type]
}

const FULFILLMENT_STATUS_LABELS: Record<FulfillmentStatus, string> = {
  PENDING: 'Menunggu',
  PROCESSING: 'Diproses',
  SUCCESS: 'Berhasil',
  FAILED: 'Gagal',
  SKIPPED: 'Dilewati',
}

export function getFulfillmentStatusLabel(status: FulfillmentStatus): string {
  return FULFILLMENT_STATUS_LABELS[status]
}

export type FulfillmentConfig = {
  id: string
  userId: string
  productId: string
  type: FulfillmentType
  manualNote: string | null
  apiUrl: string | null
  apiMethod: string | null
  apiHeaders: Record<string, string> | null
  apiPayloadTemplate: string | null
  apiCredentials: string | null
  apiSuccessPath: string | null
  apiSuccessValue: string | null
  apiResultPath: string | null
  deliveryMessage: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type UpsertFulfillmentConfigPayload = {
  type: FulfillmentType
  manualNote?: string | null
  apiUrl?: string | null
  apiMethod?: string | null
  apiHeaders?: Record<string, string> | null
  apiPayloadTemplate?: string | null
  apiCredentials?: string | null
  apiSuccessPath?: string | null
  apiSuccessValue?: string | null
  apiResultPath?: string | null
  deliveryMessage?: string | null
  isActive?: boolean
}

export type StockItemOrderInfo = {
  source?: string | null
  firstName: string | null
  customerName: string | null
  customerPhone: string | null
  username: string | null
  telegramId: string | null
  whatsappId?: string | null
  customer: {
    name: string | null
    phone: string | null
    email: string | null
  } | null
}

export type StockItem = {
  id: string
  userId: string
  productId: string
  content: string
  status: StockItemStatus
  usedAt: string | null
  orderId: string | null
  createdAt: string
  updatedAt: string
  order?: StockItemOrderInfo | null
}

export type CreateStockItemsPayload = {
  items?: string[]
  content?: string
}

export type StockItemCount = {
  available: number
}

export type SlotAccount = {
  id: string
  userId: string
  productId: string
  label: string
  credentials: string
  totalSlots: number
  usedSlots: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: { slots: number }
}

export type CreateSlotAccountPayload = {
  label: string
  credentials: { email: string; password: string }
  totalSlots: number
}

export type UpdateSlotAccountPayload = {
  label?: string
  totalSlots?: number
  isActive?: boolean
}

export type Slot = {
  id: string
  userId: string
  slotAccountId: string
  productId: string
  slotIdentifier: string
  additionalInfo: string | null
  status: SlotStatus
  expiresAt: string | null
  assignedAt: string | null
  orderId: string | null
  createdAt: string
  updatedAt: string
  order?: StockItemOrderInfo | null
}

export type CreateSlotPayload = {
  slots: Array<{
    slotIdentifier: string
    additionalInfo?: string | null
  }>
}

export type FulfillmentLog = {
  id: string
  userId: string
  orderId: string
  productId: string
  type: FulfillmentType
  status: FulfillmentStatus
  attempts: number
  maxAttempts: number
  deliveredContent: string | null
  deliveredAt: string | null
  lastError: string | null
  lastAttemptAt: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  order?: {
    orderId: string
    totalPrice: number
  } | null
}

export type TicketFulfillmentLog = {
  id: string
  userId: string
  ticketId: string
  operation: string
  description: string
  metadata: Record<string, unknown> | null
  performedById: string
  createdAt: string
}

export type CreateTicketFulfillmentLogPayload = {
  operation: string
  description: string
  metadata?: Record<string, unknown>
}

export type FulfillmentLogsResponse = {
  success: boolean
  message: string
  data: FulfillmentLog[]
  metadata: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
