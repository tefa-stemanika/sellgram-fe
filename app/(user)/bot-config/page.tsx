import { getToken } from '@/actions/auth'

import { BotConfigClient } from './_components/bot-config-client'

export default async function BotConfigPage() {
  const token = await getToken()
  const safeToken = token ?? ''

  return <BotConfigClient token={safeToken} />
}
