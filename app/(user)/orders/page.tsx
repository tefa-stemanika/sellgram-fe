import { getToken } from '@/actions/auth'

import { OrdersClient } from './_components/orders-client'

export default async function OrdersPage() {
  const token = await getToken()
  const safeToken = token ?? ''

  return <OrdersClient token={safeToken} />
}
