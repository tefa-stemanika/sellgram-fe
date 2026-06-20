import { getToken } from '@/actions/auth'

import { BroadcastDetailPage } from './_components/broadcast-detail-page'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function BroadcastDetail(props: PageProps) {
  const { id } = await props.params
  const token = await getToken()
  const safeToken = token ?? ''

  return <BroadcastDetailPage broadcastId={id} token={safeToken} />
}
