import { getToken } from '@/actions/auth'
import { TicketsClient } from './_components/tickets-client'

export default async function TicketsPage() {
  const token = await getToken()
  const safeToken = token ?? ''

  return <TicketsClient token={safeToken} />
}
