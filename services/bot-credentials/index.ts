import { fetcher } from '../fetcher'

export type BotCredential = {
  id: number
  key: string
  createdAt: string
  updatedAt: string
}

export type CreateCredentialPayload = {
  key: string
  value: string
}

export type UpdateCredentialPayload = {
  value: string
}

export async function getBotCredentials(token: string): Promise<BotCredential[]> {
  const response = await fetcher<{ success: boolean; data: BotCredential[] }>('/bot-credentials', {
    token
  })
  return response.data
}

export async function createBotCredential(token: string, payload: CreateCredentialPayload): Promise<BotCredential> {
  const response = await fetcher<{ success: boolean; data: BotCredential }>('/bot-credentials', {
    method: 'POST',
    token,
    body: JSON.stringify(payload)
  })
  return response.data
}

export async function updateBotCredential(
  token: string,
  id: number,
  payload: UpdateCredentialPayload
): Promise<BotCredential> {
  const response = await fetcher<{ success: boolean; data: BotCredential }>(`/bot-credentials/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload)
  })
  return response.data
}

export async function deleteBotCredential(token: string, id: number): Promise<void> {
  await fetcher<{ success: boolean }>(`/bot-credentials/${id}`, {
    method: 'DELETE',
    token
  })
}
