import { fetcher } from '../fetcher'

export type DashboardOrder = {
  id: string
  orderId: string
  source: string
  firstName: string | null
  username: string | null
  telegramId: string | null
  whatsappId: string | null
  customerName: string | null
  customerPhone: string | null
  status: string
  totalPrice: number
  createdAt: string
}

/** Keyed by order source enum; the backend only returns sources that have data. */
export type SourceBreakdown = Record<string, number>

export type DashboardData = {
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  revenueGrowth: number
  ordersBySource: SourceBreakdown
  revenueBySource: SourceBreakdown
  recentOrders: DashboardOrder[]
  tickets: {
    total: number
    open: number
    closed: number
  }
}

export async function getDashboard(token: string): Promise<DashboardData> {
  const response = await fetcher<{ success: boolean; data: DashboardData }>('/dashboard', { token })
  return response.data
}

export type QuotaData = {
  plan: string
  products: { used: number; total: number | 'Unlimited' }
  templates: { used: number; total: number | 'Unlimited' }
  broadcastsPerMonth: { used: number; total: number | 'Unlimited' }
  ordersPerMonth: { used: number; total: number | 'Unlimited' }
}

export async function getQuota(token: string): Promise<QuotaData> {
  const response = await fetcher<{ success: boolean; data: QuotaData }>('/bots/quota', { token })
  return response.data
}
