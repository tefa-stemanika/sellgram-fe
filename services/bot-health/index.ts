import { fetcher } from '../fetcher'

export type BotHealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown'

export type BotHealthIssue = {
  code: string
  severity?: 'critical' | 'warning'
  message?: string
}

export type BotHealth = {
  userId: string
  status: BotHealthStatus
  cached: boolean
  checkedAt: string
  cacheTtlSeconds: number
  checks: {
    token: {
      status: string
      botId?: number | null
      username?: string | null
      firstName?: string | null
      error?: string | null
    }
    webhook: {
      status: string
      url?: string | null
      expectedUrl?: string | null
      pendingUpdateCount?: number | null
      lastErrorAt?: string | null
      lastErrorMessage?: string | null
      error?: string | null
    }
    runtime: {
      active: boolean
    }
    activity: {
      lastUpdateAt?: string | null
    }
  }
  issues: BotHealthIssue[]
}

export async function getBotHealth(token: string, refresh = false): Promise<BotHealth> {
  const response = await fetcher<{ success: boolean; data: BotHealth }>(`/bots/health${refresh ? '?refresh=true' : ''}`, {
    token
  })
  return response.data
}
