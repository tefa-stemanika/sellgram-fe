import { fetcher } from '../fetcher'

export type ApiDateValue =
  | string
  | number
  | Date
  | { seconds?: number; _seconds?: number; nanoseconds?: number; _nanoseconds?: number; toDate?: () => Date }
  | Record<string, unknown>
  | null

export type OrderStatus =
  | 'PENDING'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PAYMENT_FAILED'

export type OrderSource = 'TELEGRAM' | 'WHATSAPP' | 'WEBSITE' | 'API'

export const ORDER_SOURCES: readonly OrderSource[] = ['TELEGRAM', 'WHATSAPP', 'WEBSITE', 'API']

export type OrderItem = {
  id: string
  orderId: string
  productId: string
  quantity: number
  unitPrice: number
  product: {
    id: string
    userId: string
    name: string
    description: string
    price: number
    emoji: string
    isAvailable: boolean
    createdAt: ApiDateValue
    updatedAt: ApiDateValue
  }
}

export type Order = {
  id: string
  userId: string
  orderId: string
  source: string
  telegramId: string | null
  whatsappId: string | null
  username: string | null
  firstName: string | null
  customerName: string | null
  customerPhone: string | null
  customerId: string | null
  totalPrice: number
  status: OrderStatus
  paymentUrl: string | null
  qrString: string | null
  midtransOrderId: string | null
  paidAt: ApiDateValue
  createdAt: ApiDateValue
  updatedAt: ApiDateValue
  orderItems: OrderItem[]
}

export type ListOrdersParams = {
  page?: number
  limit?: number
  search?: string
  status?: string
  source?: string
  sortBy?: string
  sortDir?: string
}

export type ListOrdersResponse = {
  success: boolean
  message: string
  data: Order[]
  metadata: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function getOrders(
  token: string,
  params: ListOrdersParams = {}
): Promise<{
  data: Order[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search) query.set('search', params.search)
  if (params.status && params.status !== 'ALL') query.set('status', params.status)
  if (params.source && params.source !== 'ALL') query.set('source', params.source)
  if (params.sortBy) query.set('sortBy', params.sortBy)
  if (params.sortDir) query.set('sortDir', params.sortDir)

  const qs = query.toString()
  const response = await fetcher<ListOrdersResponse>(`/orders${qs ? `?${qs}` : ''}`, { token })

  return {
    data: response.data,
    meta: response.metadata
  }
}

export async function getOrderById(token: string, id: string): Promise<Order> {
  const response = await fetcher<{ success: boolean; data: Order }>(`/orders/${id}`, { token })
  return response.data
}
