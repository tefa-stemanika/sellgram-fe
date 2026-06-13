import { getToken } from '@/actions/auth'

import { FulfillmentClient } from './_components/fulfillment-client'

export default async function FulfillmentPage() {
  const token = await getToken()
  const safeToken = token ?? ''

  return <FulfillmentClient token={safeToken} />
}
