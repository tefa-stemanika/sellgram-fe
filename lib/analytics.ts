import { format } from 'date-fns'

import { parseDateValue } from '@/lib/utils'
import type { Order } from '@/services/orders'

export type DailyPoint = {
  key: string
  label: string
  orders: number
}

function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** Buckets orders per local calendar day for the last `days` days (oldest → newest). */
export function buildDailySeries(orders: Pick<Order, 'createdAt'>[], days = 14): DailyPoint[] {
  const today = new Date()
  const points = new Map<string, DailyPoint>()

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)
    points.set(dayKey(date), { key: dayKey(date), label: format(date, 'd MMM'), orders: 0 })
  }

  for (const order of orders) {
    const date = parseDateValue(order.createdAt)
    if (!date) continue
    const point = points.get(dayKey(date))
    if (point) point.orders += 1
  }

  return Array.from(points.values())
}
