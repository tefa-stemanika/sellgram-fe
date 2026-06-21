export const PLANS = ['FREE', 'STARTER', 'PRO'] as const
export type Plan = (typeof PLANS)[number]

export const PLAN_INTERVALS = ['MONTHLY', 'YEARLY'] as const
export type PlanInterval = (typeof PLAN_INTERVALS)[number]

export const SUBSCRIPTION_STATUSES = ['ACTIVE', 'EXPIRED', 'CANCELLED', 'PAST_DUE'] as const
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]

export const INVOICE_STATUSES = ['PENDING', 'PAID', 'EXPIRED', 'CANCELLED'] as const
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

const PLAN_LABELS: Record<Plan, string> = {
  FREE: 'Gratis',
  STARTER: 'Starter',
  PRO: 'Pro',
}

export function getPlanLabel(plan: Plan): string {
  return PLAN_LABELS[plan]
}

const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  ACTIVE: 'Aktif',
  EXPIRED: 'Kadaluarsa',
  CANCELLED: 'Dibatalkan',
  PAST_DUE: 'Menunggak',
}

export function getSubscriptionStatusLabel(status: SubscriptionStatus): string {
  return SUBSCRIPTION_STATUS_LABELS[status]
}

const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  PENDING: 'Menunggu',
  PAID: 'Lunas',
  EXPIRED: 'Kadaluarsa',
  CANCELLED: 'Dibatalkan',
}

export function getInvoiceStatusLabel(status: InvoiceStatus): string {
  return INVOICE_STATUS_LABELS[status]
}

export type Subscription = {
  id: string
  plan: Plan
  status: SubscriptionStatus
  interval: PlanInterval
  currentPeriodStart: string
  currentPeriodEnd: string
  gracePeriodEnd: string
  cancelledAt: string | null
  cancelReason: string | null
}

export type PlanLimits = {
  products: number
  templates: number
  maxBroadcasts: number
  maxOrders: number
  canBroadcast: boolean
  canUseFulfillment: boolean
}

export type SubscriptionResponse = {
  success: boolean
  data: {
    plan: Plan
    subscription: Subscription | null
    limits: PlanLimits
  }
}

export type Invoice = {
  id: string
  invoiceNumber: string
  plan: Plan
  interval: PlanInterval
  amount: number
  status: InvoiceStatus
  paymentUrl: string | null
  paidAt: string | null
  paymentMethod: string | null
  periodStart: string
  periodEnd: string
  expiredAt: string | null
  createdAt: string
}

export type InvoicesResponse = {
  success: boolean
  data: Invoice[]
  metadata: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type UpgradePayload = {
  plan: Plan
  interval?: PlanInterval
}

export type UpgradeResponse = {
  success: boolean
  message: string
  data: {
    invoice: Invoice
    paymentUrl: string
  }
}

export type CancelResponse = {
  success: boolean
  message: string
  data: {
    cancelled: boolean
  }
}

export type PlanInfo = {
  name: string
  monthlyPrice: number
  yearlyPrice: number
  products: number | string
  templates: number | string
  maxBroadcasts: number | string
  maxOrders: number | string
  canBroadcast: boolean
  canUseFulfillment: boolean
  popular?: boolean
}

export const PLAN_MATRIX: PlanInfo[] = [
  {
    name: 'FREE',
    monthlyPrice: 0,
    yearlyPrice: 0,
    products: 10,
    templates: 1,
    maxBroadcasts: 0,
    maxOrders: 10,
    canBroadcast: false,
    canUseFulfillment: true,
  },
  {
    name: 'STARTER',
    monthlyPrice: 39000,
    yearlyPrice: 390000,
    products: 50,
    templates: 5,
    maxBroadcasts: 50,
    maxOrders: 200,
    canBroadcast: true,
    canUseFulfillment: true,
    popular: true,
  },
  {
    name: 'PRO',
    monthlyPrice: 79000,
    yearlyPrice: 790000,
    products: 'Tak terbatas',
    templates: 'Tak terbatas',
    maxBroadcasts: 'Tak terbatas',
    maxOrders: 'Tak terbatas',
    canBroadcast: true,
    canUseFulfillment: true,
  },
]

export const PLAN_PRICES: Record<Plan, Record<PlanInterval, number>> = {
  FREE: { MONTHLY: 0, YEARLY: 0 },
  STARTER: { MONTHLY: 39000, YEARLY: 390000 },
  PRO: { MONTHLY: 79000, YEARLY: 790000 },
}
