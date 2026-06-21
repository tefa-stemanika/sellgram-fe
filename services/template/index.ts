import { fetcher } from '../fetcher'
import type { CampaignTemplate } from '@/schemas/broadcast'

export type ListTemplatesResponse = {
  success: boolean
  message: string
  data: CampaignTemplate[]
  metadata: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type TemplateDetailResponse = {
  success: boolean
  message: string
  data: CampaignTemplate
}

export type ListTemplatesParams = {
  page?: number
  limit?: number
  sortBy?: string
  sortDir?: string
}

export async function getTemplates(
  token: string,
  params: ListTemplatesParams = {}
): Promise<{
  data: CampaignTemplate[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.sortBy) query.set('sortBy', params.sortBy)
  if (params.sortDir) query.set('sortDir', params.sortDir)

  const qs = query.toString()
  const response = await fetcher<ListTemplatesResponse>(`/templates${qs ? `?${qs}` : ''}`, { token })
  return { data: response.data, meta: response.metadata }
}

export async function getTemplate(token: string, id: string): Promise<CampaignTemplate> {
  const response = await fetcher<TemplateDetailResponse>(`/templates/${id}`, { token })
  return response.data
}

export async function createTemplate(
  token: string,
  payload: { name: string; content: string; channel?: string; variables: { index: number; label: string; sample?: string }[] }
): Promise<CampaignTemplate> {
  const response = await fetcher<TemplateDetailResponse>('/templates', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function updateTemplate(
  token: string,
  id: string,
  payload: { name?: string; content?: string; variables?: { index: number; label: string; sample?: string }[] }
): Promise<CampaignTemplate> {
  const response = await fetcher<TemplateDetailResponse>(`/templates/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function deleteTemplate(token: string, id: string): Promise<void> {
  await fetcher<{ success: boolean }>(`/templates/${id}`, {
    method: 'DELETE',
    token,
  })
}
