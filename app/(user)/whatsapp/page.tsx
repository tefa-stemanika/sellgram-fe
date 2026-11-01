import { getToken } from '@/actions/auth'

import { WhatsAppClient } from './_components/whatsapp-client'

export default async function WhatsAppPage() {
  const token = await getToken()
  const safeToken = token ?? ''

  return <WhatsAppClient token={safeToken} />
}
