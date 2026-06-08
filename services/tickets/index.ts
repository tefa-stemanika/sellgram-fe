import { fetcher } from '../fetcher'

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_CUSTOMER'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED'

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type Label = {
  id: string
  userId: string
  name: string
  color: string
  createdAt: string
  _count?: { tickets: number }
}

export type TicketLabel = {
  ticketId: string
  labelId: string
  label: Label
}

export type TicketOrder = {
  id: string
  totalPrice: number
  status: string
}

export type Ticket = {
  id: string
  userId: string
  orderId: string | null
  title: string
  description: string | null
  status: TicketStatus
  priority: TicketPriority
  source: string
  customerName: string | null
  customerContact: string | null
  resolvedAt: string | null
  closedAt: string | null
  createdAt: string
  updatedAt: string
  labels: TicketLabel[]
  order: TicketOrder | null
  _count: { comments: number }
}

export type TicketComment = {
  id: string
  ticketId: string
  userId: string
  body: string
  isInternal: boolean
  createdAt: string
  updatedAt: string
  user: { id: string; name: string }
}

export type TicketActivity = {
  id: string
  ticketId: string
  userId: string | null
  action: string
  metadata: Record<string, string> | null
  createdAt: string
}

export type TicketDetail = Ticket & {
  comments: TicketComment[]
  activities: TicketActivity[]
  order: Ticket['order'] & {
    orderId: string
    source: string
    telegramId: string | null
    username: string | null
    firstName: string | null
    customerName: string | null
    customerPhone: string | null
    paymentUrl: string | null
    midtransOrderId: string | null
    paidAt: string | null
    createdAt: string
    updatedAt: string
    orderItems: Array<{
      id: string
      orderId: string
      productId: string
      quantity: number
      unitPrice: number
      product: {
        id: string
        name: string
        price: number
        emoji: string
      }
    }>
  }
}

type TicketsListResponse = {
  success: boolean
  message: string
  data: Ticket[]
  metadata: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

type ListTicketsParams = {
  status?: TicketStatus
  priority?: TicketPriority
  labelId?: string
  search?: string
  page?: number
  limit?: number
}

export async function getTicketsByStatus(
  token: string,
  status: TicketStatus,
  params?: { page?: number; limit?: number }
): Promise<{
  data: Ticket[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}> {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))
  if (!params?.limit) query.set('limit', '20')

  const qs = query.toString()
  const response = await fetcher<TicketsListResponse>(`/tickets/status/${status}${qs ? `?${qs}` : ''}`, {
    token
  })

  return {
    data: response.data,
    meta: response.metadata
  }
}

export async function getTicketDetail(token: string, ticketId: string): Promise<TicketDetail> {
  const response = await fetcher<{ success: boolean; message: string; data: TicketDetail }>(
    `/tickets/${ticketId}`,
    { token }
  )
  return response.data
}

export async function updateTicketStatus(
  token: string,
  ticketId: string,
  status: TicketStatus
): Promise<void> {
  await fetcher(`/tickets/${ticketId}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ status })
  })
}

export async function updateTicketPriority(
  token: string,
  ticketId: string,
  priority: TicketPriority
): Promise<void> {
  await fetcher(`/tickets/${ticketId}/priority`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ priority })
  })
}

export async function attachLabel(
  token: string,
  ticketId: string,
  labelId: string
): Promise<void> {
  await fetcher(`/tickets/${ticketId}/labels`, {
    method: 'POST',
    token,
    body: JSON.stringify({ labelId })
  })
}

export async function detachLabel(
  token: string,
  ticketId: string,
  labelId: string
): Promise<void> {
  await fetcher(`/tickets/${ticketId}/labels/${labelId}`, {
    method: 'DELETE',
    token
  })
}

export async function addComment(
  token: string,
  ticketId: string,
  body: string,
  isInternal: boolean = false
): Promise<TicketComment> {
  const response = await fetcher<{ success: boolean; message: string; data: TicketComment }>(
    `/tickets/${ticketId}/comments`,
    {
      method: 'POST',
      token,
      body: JSON.stringify({ body, isInternal })
    }
  )
  return response.data
}

export async function updateComment(
  token: string,
  ticketId: string,
  commentId: string,
  body: string
): Promise<void> {
  await fetcher(`/tickets/${ticketId}/comments/${commentId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify({ body })
  })
}

export async function deleteComment(
  token: string,
  ticketId: string,
  commentId: string
): Promise<void> {
  await fetcher(`/tickets/${ticketId}/comments/${commentId}`, {
    method: 'DELETE',
    token
  })
}

export async function getLabels(token: string): Promise<Label[]> {
  const response = await fetcher<{ success: boolean; message: string; data: Label[] }>('/labels', {
    token
  })
  return response.data
}

export async function createLabel(
  token: string,
  name: string,
  color?: string
): Promise<Label> {
  const response = await fetcher<{ success: boolean; message: string; data: Label }>('/labels', {
    method: 'POST',
    token,
    body: JSON.stringify({ name, color })
  })
  return response.data
}

export async function updateLabel(
  token: string,
  labelId: string,
  data: { name?: string; color?: string }
): Promise<void> {
  await fetcher(`/labels/${labelId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(data)
  })
}

export async function deleteLabel(token: string, labelId: string): Promise<void> {
  await fetcher(`/labels/${labelId}`, {
    method: 'DELETE',
    token
  })
}
