import { fetcher } from '../fetcher'

export type BotConfig = {
  id: number
  mode: 'AI' | 'BUTTON'
  midtransIsProduction: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type BotConfigPayload = {
  mode?: 'AI' | 'BUTTON'
  midtransIsProduction?: boolean
}

export async function getBotConfig(token: string): Promise<BotConfig | null> {
  try {
    const response = await fetcher<{ success: boolean; data: BotConfig | null }>('/bot-config', {
      token
    })
    return response.data
  } catch {
    return null
  }
}

export async function createBotConfig(token: string, payload: BotConfigPayload): Promise<BotConfig> {
  const response = await fetcher<{ success: boolean; data: BotConfig }>('/bot-config', {
    method: 'POST',
    token,
    body: JSON.stringify(payload)
  })
  return response.data
}

export async function updateBotConfig(token: string, id: number, payload: BotConfigPayload): Promise<BotConfig> {
  const response = await fetcher<{ success: boolean; data: BotConfig }>(`/bot-config/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload)
  })
  return response.data
}
