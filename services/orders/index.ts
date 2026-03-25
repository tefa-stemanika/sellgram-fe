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

export type OrderItem = {
  id: number
  orderId: number
  productId: number
  quantity: number
  unitPrice: number
  product: {
    id: number
    userId: number
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
  id: number
  userId: number
  orderId: string
  telegramId: string
  username: string | null
  firstName: string | null
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

export async function getOrders(token: string, limit = 50): Promise<Order[]> {
  const response = await fetcher<{ success: boolean; data: Order[] }>(`/orders?limit=${limit}`, {
    token
  })
  return response.data
}

export async function getOrderById(token: string, id: number): Promise<Order> {
  const response = await fetcher<{ success: boolean; data: Order }>(`/orders/${id}`, { token })
  return response.data
}
