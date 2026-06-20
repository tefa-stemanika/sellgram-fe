import { getToken } from '@/actions/auth'

import { BroadcastsClient } from './_components/broadcasts-client'

export default async function BroadcastsPage() {
  const token = await getToken()
  const safeToken = token ?? ''

  return <BroadcastsClient token={safeToken} />
}
