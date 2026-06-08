import { fetcher } from '../fetcher'

export type ApiDateValue =
  | string
  | number
  | Date
  | { seconds?: number; _seconds?: number; nanoseconds?: number; _nanoseconds?: number; toDate?: () => Date }
  | Record<string, unknown>
  | null

export type CustomerSource = 'WEBSITE' | 'TELEGRAM' | 'ORDER' | 'MANUAL'

export type CustomerOrderItem = {
  id: string
  orderId: string
  productId: string
  quantity: number
  unitPrice: number
  product: {
    id: string
    name: string
    emoji: string
  }
}

export type CustomerOrder = {
  id: string
  orderId: string
  source: string
  totalPrice: number
  status: string
  paidAt: ApiDateValue
  createdAt: ApiDateValue
  orderItems: CustomerOrderItem[]
}

export type Customer = {
  id: string
  name: string | null
  username: string | null
  email: string | null
  phone: string | null
  telegramId: string | null
  hasTelegram: boolean
  hasWhatsapp: boolean
  hasEmail: boolean
  source: string
  totalOrders: number
  totalSpent: number
  lastOrderAt: ApiDateValue
  createdAt: ApiDateValue
}

export type CustomerDetail = Customer & {
  orders: CustomerOrder[]
}

export type ListCustomersParams = {
  page?: number
  limit?: number
  search?: string
  source?: string
  orderSource?: string
}

export type CreateCustomerPayload = {
  name: string
  email?: string
  phone?: string
}

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>

export type ListCustomersResponse = {
  success: boolean
  message: string
  data: Customer[]
  metadata: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function getCustomers(
  token: string,
  params: ListCustomersParams = {}
): Promise<{
  data: Customer[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search) query.set('search', params.search)
  if (params.source && params.source !== 'ALL') query.set('source', params.source)
  if (params.orderSource) query.set('orderSource', params.orderSource)

  const qs = query.toString()
  const response = await fetcher<ListCustomersResponse>(`/customers${qs ? `?${qs}` : ''}`, {
    token
  })

  return {
    data: response.data,
    meta: response.metadata
  }
}

export async function getCustomer(token: string, id: string): Promise<CustomerDetail> {
  const response = await fetcher<{ success: boolean; data: CustomerDetail }>(`/customers/${id}`, {
    token
  })
  return response.data
}

export async function createCustomer(
  token: string,
  payload: CreateCustomerPayload
): Promise<Customer> {
  const response = await fetcher<{ success: boolean; data: Customer }>('/customers', {
    method: 'POST',
    token,
    body: JSON.stringify(payload)
  })
  return response.data
}

export async function updateCustomer(
  token: string,
  id: string,
  payload: UpdateCustomerPayload
): Promise<Customer> {
  const response = await fetcher<{ success: boolean; data: Customer }>(`/customers/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload)
  })
  return response.data
}

export async function deleteCustomer(token: string, id: string): Promise<void> {
  await fetcher<{ success: boolean }>(`/customers/${id}`, {
    method: 'DELETE',
    token
  })
}
