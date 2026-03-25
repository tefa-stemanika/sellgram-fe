import { getToken } from '@/actions/auth'
import { getOrders } from '@/services/orders'

import { OrdersClient } from './_components/orders-client'

export default async function OrdersPage() {
  const token = await getToken()
  const safeToken = token ?? ''
  const initialData = safeToken ? await getOrders(safeToken, 50).catch(() => []) : []

  return <OrdersClient initialData={initialData} />
}
