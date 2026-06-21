import { getToken } from '@/actions/auth'

import { BroadcastCreatePage } from './_components/broadcast-create-page'

export default async function Page() {
  const token = await getToken()
  return <BroadcastCreatePage token={token ?? ''} />
}
