import { fetcher } from '../fetcher'

export type WhatsAppWebhookStatus = {
  url?: string | null
  enabled?: boolean
  events?: string[]
  expectedUrl?: string | null
  synced?: boolean
}

export type WhatsAppStatus = {
  userId: string
  configured: boolean
  instance: string | null
  instanceSource: 'tenant' | 'env' | string
  ownInstance: boolean
  instanceExists: boolean
  instanceLimit: number
  suggestedInstance?: string | null
  apiUrl: string | null
  state: string | null
  connected: boolean
  webhook: WhatsAppWebhookStatus
  errors: string[]
}

export type WhatsAppQr = {
  base64?: string | null
  code?: string | null
  pairingCode?: string | null
  count?: number | null
}

export type WhatsAppWebhookResult = {
  success?: boolean
  action?: 'created' | 'updated' | 'unchanged' | string
  webhookUrl?: string | null
  events?: string[]
}

export type CreateInstanceResult = {
  userId: string
  created: boolean
  instance: string
  instanceSource: string
  instanceLimit: number
  apiUrl: string | null
  state: string | null
  connected: boolean
  qr?: WhatsAppQr | null
  webhook?: WhatsAppWebhookResult | null
}

export type ConnectResult = WhatsAppQr & {
  userId: string
  instance: string
  state: string | null
  connected: boolean
  webhook?: WhatsAppWebhookResult | null
}

export type RestartResult = {
  userId?: string
  restarted: boolean
  restartError?: string | null
  webhookUrl?: string | null
  webhook?: WhatsAppWebhookResult | null
  status: WhatsAppStatus
}

export async function getWhatsAppStatus(token: string): Promise<WhatsAppStatus> {
  const response = await fetcher<{ success: boolean; data: WhatsAppStatus }>('/bots/whatsapp/status', { token })
  return response.data
}

export async function createWhatsAppInstance(token: string, number?: string): Promise<CreateInstanceResult> {
  const response = await fetcher<{ success: boolean; data: CreateInstanceResult }>('/bots/whatsapp/instance', {
    method: 'POST',
    token,
    body: JSON.stringify(number ? { number } : {})
  })
  return response.data
}

export async function getWhatsAppConnect(token: string, number?: string): Promise<ConnectResult> {
  const query = number ? `?number=${encodeURIComponent(number)}` : ''
  const response = await fetcher<{ success: boolean; data: ConnectResult }>(`/bots/whatsapp/connect${query}`, { token })
  return response.data
}

export async function restartWhatsApp(token: string): Promise<RestartResult> {
  const response = await fetcher<{ success: boolean; data: RestartResult }>('/bots/whatsapp/restart', {
    method: 'POST',
    token
  })
  return response.data
}
