import { getToken } from '@/actions/auth'
import { getOrders } from '@/services/orders'
import { getProducts } from '@/services/products'

import { DashboardOverview } from '../_components/dashboard-overview'

async function DashboardPage() {
  const token = await getToken()

  if (!token) {
    return <DashboardOverview products={[]} recentOrders={[]} />
  }

  const [products, recentOrders] = await Promise.all([
    getProducts(token).catch(() => []),
    getOrders(token, 5).catch(() => [])
  ])

  return <DashboardOverview products={products} recentOrders={recentOrders} />
}

export default DashboardPage
