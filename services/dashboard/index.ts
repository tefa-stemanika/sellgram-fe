import { fetcher } from '../fetcher'

export type DashboardRevenueChange = {
  percentage: number
  trend: 'up' | 'down' | 'stable'
}

export type DashboardOrder = {
  id: string
  orderId: string
  firstName: string | null
  username: string | null
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
  recentOrders: DashboardOrder[]
}

export async function getDashboard(token: string): Promise<DashboardData> {
  const response = await fetcher<{ success: boolean; data: DashboardData }>('/dashboard', { token })
  return response.data
}
