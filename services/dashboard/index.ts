import { fetcher } from '../fetcher'

export type DashboardOrder = {
  id: string
  orderId: string
  source: string
  firstName: string | null
  username: string | null
  customerName: string | null
  customerPhone: string | null
  status: string
  totalPrice: number
  createdAt: string
}

export type DashboardData = {
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  revenueGrowth: number
  ordersBySource: {
    TELEGRAM: number
    WEBSITE: number
  }
  revenueBySource: {
    TELEGRAM: number
    WEBSITE: number
  }
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
