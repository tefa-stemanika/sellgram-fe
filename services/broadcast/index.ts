import { fetcher } from '../fetcher'
import type {
  BroadcastCampaign,
  BroadcastRecipient,
  ListBroadcastsParams,
  PreviewCustomer,
  PreviewResponse,
  BroadcastFilters,
} from '@/schemas/broadcast'

export type ListBroadcastsResponse = {
  success: boolean
  message: string
  data: BroadcastCampaign[]
  metadata: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type BroadcastDetailResponse = {
  success: boolean
  message: string
  data: BroadcastCampaign
}

export type BroadcastRecipientsResponse = {
  success: boolean
  message: string
  data: BroadcastRecipient[]
  metadata: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type BroadcastPreviewResponse = {
  success: boolean
  message: string
  data: PreviewResponse
}

export type BroadcastActionResponse = {
  success: boolean
  message: string
  data: {
    id: string
    status?: string
    totalCustomers?: number
    updatedAt?: string
  }
}

export async function getBroadcasts(
  token: string,
  params: ListBroadcastsParams = {}
): Promise<{
  data: BroadcastCampaign[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.status) query.set('status', params.status)
  if (params.sortBy) query.set('sortBy', params.sortBy)
  if (params.sortDir) query.set('sortDir', params.sortDir)

  const qs = query.toString()
  const response = await fetcher<ListBroadcastsResponse>(`/broadcasts${qs ? `?${qs}` : ''}`, {
    token
  })

  return {
    data: response.data,
    meta: response.metadata
  }
}

export async function getBroadcast(token: string, id: string): Promise<BroadcastCampaign> {
  const response = await fetcher<BroadcastDetailResponse>(`/broadcasts/${id}`, { token })
  return response.data
}

export async function createBroadcast(
  token: string,
  payload: {
    name: string
    message: string
    channel?: string
    filters?: BroadcastFilters
    scheduledAt?: string
  }
): Promise<BroadcastCampaign> {
  const response = await fetcher<BroadcastDetailResponse>('/broadcasts', {
    method: 'POST',
    token,
    body: JSON.stringify(payload)
  })
  return response.data
}

export async function updateBroadcast(
  token: string,
  id: string,
  payload: {
    name?: string
    message?: string
    channel?: string
    filters?: BroadcastFilters
    scheduledAt?: string | null
  }
): Promise<BroadcastCampaign> {
  const response = await fetcher<BroadcastDetailResponse>(`/broadcasts/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload)
  })
  return response.data
}

export async function deleteBroadcast(token: string, id: string): Promise<void> {
  await fetcher<{ success: boolean }>(`/broadcasts/${id}`, {
    method: 'DELETE',
    token
  })
}

export async function sendBroadcast(token: string, id: string): Promise<BroadcastActionResponse> {
  const response = await fetcher<BroadcastActionResponse>(`/broadcasts/${id}/send`, {
    method: 'POST',
    token
  })
  return response
}

export async function pauseBroadcast(token: string, id: string): Promise<BroadcastActionResponse> {
  const response = await fetcher<BroadcastActionResponse>(`/broadcasts/${id}/pause`, {
    method: 'POST',
    token
  })
  return response
}

export async function resumeBroadcast(token: string, id: string): Promise<BroadcastActionResponse> {
  const response = await fetcher<BroadcastActionResponse>(`/broadcasts/${id}/resume`, {
    method: 'POST',
    token
  })
  return response
}

export async function cancelBroadcast(token: string, id: string): Promise<BroadcastActionResponse> {
  const response = await fetcher<BroadcastActionResponse>(`/broadcasts/${id}/cancel`, {
    method: 'POST',
    token
  })
  return response
}

export async function getRecipients(
  token: string,
  broadcastId: string,
  params: { status?: string; page?: number; limit?: number } = {}
): Promise<{
  data: BroadcastRecipient[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.status) query.set('status', params.status)

  const qs = query.toString()
  const response = await fetcher<BroadcastRecipientsResponse>(
    `/broadcasts/${broadcastId}/recipients${qs ? `?${qs}` : ''}`,
    { token }
  )

  return {
    data: response.data,
    meta: response.metadata
  }
}

export async function previewBroadcast(
  token: string,
  filters: BroadcastFilters = {}
): Promise<PreviewResponse> {
  const response = await fetcher<BroadcastPreviewResponse>('/broadcasts/preview', {
    method: 'POST',
    token,
    body: JSON.stringify({ filters })
  })
  return response.data
}
