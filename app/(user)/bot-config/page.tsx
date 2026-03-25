import { getToken } from '@/actions/auth'
import { getBotConfig } from '@/services/bot-config'

import { BotConfigClient } from './_components/bot-config-client'

export default async function BotConfigPage() {
  const token = await getToken()
  const safeToken = token ?? ''
  const initialConfig = safeToken ? await getBotConfig(safeToken) : null

  return <BotConfigClient token={safeToken} initialConfig={initialConfig} />
}
