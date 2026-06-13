import { fetcher } from '@/services/fetcher'
import type { FulfillmentConfig, UpsertFulfillmentConfigPayload, StockItem, CreateStockItemsPayload, StockItemCount, SlotAccount, CreateSlotAccountPayload, UpdateSlotAccountPayload, Slot, CreateSlotPayload, FulfillmentLog, TicketFulfillmentLog, CreateTicketFulfillmentLogPayload } from '@/schemas/fulfillment'

type ApiResponse<T> = { success: boolean; message: string; data: T }
type ApiListResponse<T> = ApiResponse<T[]> & { metadata: { total: number; page: number; limit: number; totalPages: number } }

export async function getFulfillmentConfig(productId: number, token?: string) {
  return fetcher<ApiResponse<FulfillmentConfig | null>>(`/products/${productId}/fulfillment`, { token })
}

export async function upsertFulfillmentConfig(productId: number, payload: UpsertFulfillmentConfigPayload, token?: string) {
  return fetcher<ApiResponse<FulfillmentConfig>>(`/products/${productId}/fulfillment`, {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  })
}

export async function deleteFulfillmentConfig(productId: number, token?: string) {
  return fetcher<ApiResponse<null>>(`/products/${productId}/fulfillment`, {
    method: 'DELETE',
    token,
  })
}

export async function listStockItems(productId: number, params: { page?: number; limit?: number } = {}, token?: string) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  return fetcher<ApiListResponse<StockItem>>(`/products/${productId}/stock-items?${query}`, { token })
}

export async function createStockItems(productId: number, payload: CreateStockItemsPayload, token?: string) {
  return fetcher<ApiResponse<StockItem[]>>(`/products/${productId}/stock-items`, {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  })
}

export async function deleteStockItem(productId: number, itemId: string, token?: string) {
  return fetcher<ApiResponse<null>>(`/products/${productId}/stock-items/${itemId}`, {
    method: 'DELETE',
    token,
  })
}

export async function getStockItemsCount(productId: number, token?: string) {
  return fetcher<ApiResponse<StockItemCount>>(`/products/${productId}/stock-items/count`, { token })
}

export async function listSlotAccounts(productId: number, token?: string) {
  return fetcher<ApiResponse<SlotAccount[]>>(`/products/${productId}/slot-accounts`, { token })
}

export async function createSlotAccount(productId: number, payload: CreateSlotAccountPayload, token?: string) {
  return fetcher<ApiResponse<SlotAccount>>(`/products/${productId}/slot-accounts`, {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  })
}

export async function updateSlotAccount(productId: number, accountId: string, payload: UpdateSlotAccountPayload, token?: string) {
  return fetcher<ApiResponse<SlotAccount>>(`/products/${productId}/slot-accounts/${accountId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    token,
  })
}

export async function deleteSlotAccount(productId: number, accountId: string, token?: string) {
  return fetcher<ApiResponse<null>>(`/products/${productId}/slot-accounts/${accountId}`, {
    method: 'DELETE',
    token,
  })
}

export async function listSlots(productId: number, accountId: string, token?: string) {
  return fetcher<ApiResponse<Slot[]>>(`/products/${productId}/slot-accounts/${accountId}/slots`, { token })
}

export async function createSlots(productId: number, accountId: string, payload: CreateSlotPayload, token?: string) {
  return fetcher<ApiResponse<Slot[]>>(`/products/${productId}/slot-accounts/${accountId}/slots`, {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  })
}

export async function deleteSlot(productId: number, accountId: string, slotId: string, token?: string) {
  return fetcher<ApiResponse<null>>(`/products/${productId}/slot-accounts/${accountId}/slots/${slotId}`, {
    method: 'DELETE',
    token,
  })
}

export async function releaseSlot(productId: number, accountId: string, slotId: string, token?: string) {
  return fetcher<ApiResponse<Slot>>(`/products/${productId}/slot-accounts/${accountId}/slots/${slotId}/release`, {
    method: 'PATCH',
    token,
  })
}

export async function listFulfillmentLogs(params: { page?: number; limit?: number; status?: string; type?: string; search?: string; productId?: string; orderId?: string } = {}, token?: string) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.status) query.set('status', params.status)
  if (params.type) query.set('type', params.type)
  if (params.search) query.set('search', params.search)
  if (params.productId) query.set('productId', params.productId)
  if (params.orderId) query.set('orderId', params.orderId)
  return fetcher<ApiListResponse<FulfillmentLog>>(`/fulfillment-logs?${query}`, { token })
}

export async function getFulfillmentLog(logId: string, token?: string) {
  return fetcher<ApiResponse<FulfillmentLog>>(`/fulfillment-logs/${logId}`, { token })
}

export async function retryFulfillment(logId: string, token?: string) {
  return fetcher<ApiResponse<FulfillmentLog>>(`/fulfillment-logs/${logId}/retry`, {
    method: 'POST',
    token,
  })
}

export async function listTicketFulfillmentLogs(ticketId: string, token?: string) {
  return fetcher<ApiResponse<TicketFulfillmentLog[]>>(`/fulfillment/${ticketId}/logs`, { token })
}

export async function createTicketFulfillmentLog(ticketId: string, payload: CreateTicketFulfillmentLogPayload, token?: string) {
  return fetcher<ApiResponse<TicketFulfillmentLog>>(`/fulfillment/${ticketId}/log`, {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  })
}
