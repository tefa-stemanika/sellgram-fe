import { getToken } from '@/actions/auth'

import { CredentialsClient } from './_components/credentials-client'

export default async function BotCredentialsPage() {
  const token = await getToken()
  const safeToken = token ?? ''

  return <CredentialsClient token={safeToken} />
}
