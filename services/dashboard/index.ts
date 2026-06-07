import { fetcher } from '../fetcher'

export type DashboardRevenueChange = {
  percentage: number
  trend: 'up' | 'down' | 'stable'
}

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
  revenueChange: DashboardRevenueChange
  ordersBySource: {
    TELEGRAM: number
    WEBSITE: number
  }
  revenueBySource: {
    TELEGRAM: number
    WEBSITE: number
  }
  recentOrders: DashboardOrder[]
}

export async function getDashboard(token: string): Promise<DashboardData> {
  const response = await fetcher<{ success: boolean; data: DashboardData }>('/dashboard', { token })
  return response.data
}
