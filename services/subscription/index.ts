import { fetcher } from '@/services/fetcher'
import type { Plan, PlanInterval, Subscription, PlanLimits, Invoice, UpgradePayload } from '@/schemas/subscription'

export const getSubscription = async (token: string) => {
  const res = await fetcher<{
    success: boolean
    data: { plan: Plan; subscription: Subscription | null; limits: PlanLimits }
  }>('/subscription', { token })
  return res.data
}

export const upgradePlan = async (token: string, payload: UpgradePayload) => {
  const res = await fetcher<{
    success: boolean
    message: string
    data: { invoice: Invoice; paymentUrl: string }
  }>('/subscription/upgrade', {
    token,
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}

export const cancelSubscription = async (token: string, reason?: string) => {
  const res = await fetcher<{
    success: boolean
    message: string
    data: { cancelled: boolean }
  }>('/subscription/cancel', {
    token,
    method: 'POST',
    body: JSON.stringify({ cancelReason: reason }),
  })
  return res.data
}

export const getInvoices = async (token: string, page = 1, limit = 10) => {
  const res = await fetcher<{
    success: boolean
    data: Invoice[]
    metadata: { total: number; page: number; limit: number; totalPages: number }
  }>(`/invoices?page=${page}&limit=${limit}`, { token })
  return res
}
