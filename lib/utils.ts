import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatIDRCurrency = (amount: number): string => {
  return `Rp${amount.toLocaleString('id-ID')}`
}

function parseDateValue(value: unknown): Date | null {
  if (!value) return null

  if (value instanceof Date) return value

  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }

  if (typeof value === 'object') {
    const ts = value as {
      seconds?: number
      _seconds?: number
      toDate?: () => Date
    }
    if (typeof ts.toDate === 'function') return ts.toDate()
    if (typeof ts.seconds === 'number') return new Date(ts.seconds * 1000)
    if (typeof ts._seconds === 'number') return new Date(ts._seconds * 1000)
  }

  return null
}

export const formatDate = (value: unknown): string => {
  const date = parseDateValue(value)
  if (!date) return '-'
  return format(date, 'dd MMMM yyyy')
}

export const formatDateTime = (value: unknown): string => {
  const date = parseDateValue(value)
  if (!date) return '-'
  return format(date, 'dd MMMM yyyy HH:mm')
}
