import { getToken } from '@/actions/auth'
import { getBotCredentials } from '@/services/bot-credentials'

import { CredentialsClient } from './_components/credentials-client'

export default async function BotCredentialsPage() {
  const token = await getToken()
  const safeToken = token ?? ''
  const initialData = safeToken ? await getBotCredentials(safeToken).catch(() => []) : []

  return <CredentialsClient token={safeToken} initialData={initialData} />
}
