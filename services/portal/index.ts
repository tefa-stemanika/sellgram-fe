import { fetcher } from '../fetcher'

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type Customer = {
  id: string
  userId: string
  email: string
  name: string
  phone?: string
  hasEmail?: boolean
  hasWhatsapp?: boolean
  source?: string
  createdAt?: string
}

export type CustomerAuth = {
  email: string
  lastLoginAt: string
  isVerified: boolean
}

export type AuthResult = {
  customer: Customer
  token: string
}

export type PortalOrderItem = {
  id: string
  quantity: number
  price?: number
  product: {
    id: string
    name: string
    emoji: string
    price: number
  }
}

export type PortalOrder = {
  id: string
  orderId: string
  source: string
  status: string
  totalPrice: number
  paymentUrl?: string
  note?: string
  paidAt?: string
  createdAt: string
  updatedAt?: string
  orderItems: PortalOrderItem[]
}

export type OrdersResponse = {
  orders: PortalOrder[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function register(userId: string, payload: { email: string; password: string; name: string; phone?: string }) {
  const response = await fetcher<ApiResponse<AuthResult>>(`/portal/${userId}/register`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  return response.data
}

export async function login(userId: string, payload: { email: string; password: string }) {
  const response = await fetcher<ApiResponse<AuthResult>>(`/portal/${userId}/login`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  return response.data
}

export async function getProfile(userId: string, token: string) {
  const response = await fetcher<ApiResponse<Customer & { auth: CustomerAuth }>>(
    `/portal/${userId}/me`,
    { token }
  )
  return response.data
}

export async function updateProfile(userId: string, token: string, payload: { name?: string; phone?: string }) {
  const response = await fetcher<ApiResponse<Customer>>(`/portal/${userId}/me`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token
  })
  return response.data
}

export async function changePassword(userId: string, token: string, payload: { oldPassword: string; newPassword: string }) {
  const response = await fetcher<ApiResponse<{ message: string }>>(`/portal/${userId}/me/password`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token
  })
  return response.data
}

export async function getOrders(userId: string, token: string, page = 1, limit = 10) {
  const response = await fetcher<ApiResponse<OrdersResponse>>(
    `/portal/${userId}/me/orders?page=${page}&limit=${limit}`,
    { token }
  )
  return response.data
}

export async function getOrderDetail(userId: string, token: string, orderId: string) {
  const response = await fetcher<ApiResponse<PortalOrder>>(
    `/portal/${userId}/me/orders/${orderId}`,
    { token }
  )
  return response.data
}
