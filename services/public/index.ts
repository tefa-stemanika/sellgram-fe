import { fetcher } from '../fetcher'

export type StoreProfile = {
  name: string
}

export type PublicProduct = {
  id: string
  name: string
  description: string
  price: number
  emoji: string
  isAvailable: boolean
  createdAt: string
}

export type CreateOrderPayload = {
  userId: string
  productId: string
  quantity: number
  customerName: string
  customerPhone?: string
}

export type CreateOrderResponse = {
  orderId: string
  paymentUrl: string
  snapToken: string
  totalPrice: number
}

export type OrderStatus = {
  orderId: string
  source: string
  status: string
  totalPrice: number
  paymentUrl: string | null
  customerName: string | null
  customerPhone: string | null
  paidAt: string | null
  createdAt: string
}

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export async function getStoreProfile(userId: string): Promise<StoreProfile> {
  const response = await fetcher<ApiResponse<StoreProfile>>(
    `/public/profile/${userId}`
  )
  return response.data
}

export async function getPublicProducts(
  userId: string
): Promise<PublicProduct[]> {
  const response = await fetcher<ApiResponse<PublicProduct[]>>(
    `/public/products/${userId}`
  )
  return response.data
}

export async function getPublicProduct(
  userId: string,
  productId: string
): Promise<PublicProduct> {
  const response = await fetcher<ApiResponse<PublicProduct>>(
    `/public/products/${userId}/${productId}`
  )
  return response.data
}

export async function createOrder(
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> {
  const response = await fetcher<ApiResponse<CreateOrderResponse>>(
    '/public/orders',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  )
  return response.data
}

export type PublicOrderItem = {
  id: string
  name: string
  emoji: string
  price: number
  quantity: number
  subtotal: number
}

export type PublicOrderDetail = {
  orderId: string
  status: string
  totalPrice: number
  customerName: string | null
  customerPhone: string | null
  paidAt: string | null
  createdAt: string
  items: PublicOrderItem[]
}

export async function getOrderDetail(orderId: string): Promise<PublicOrderDetail> {
  const response = await fetcher<ApiResponse<PublicOrderDetail>>(
    `/public/orders/${orderId}/detail`
  )
  return response.data
}

export async function getOrderStatus(
  orderId: string
): Promise<OrderStatus> {
  const response = await fetcher<ApiResponse<OrderStatus>>(
    `/public/orders/${orderId}`
  )
  return response.data
}
