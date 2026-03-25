import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatIDRCurrency = (amount: number): string => {
  return `Rp${amount.toLocaleString('id-ID')}`
}

export const formatDate = (value: unknown): string => {
  if (!value) return '-'

  let date: Date | null = null

  if (value instanceof Date) {
    date = value
  } else if (typeof value === 'string' || typeof value === 'number') {
    date = new Date(value)
  } else if (typeof value === 'object') {
    const timestampLike = value as {
      seconds?: number
      _seconds?: number
      toDate?: () => Date
    }

    if (typeof timestampLike.toDate === 'function') {
      date = timestampLike.toDate()
    } else if (typeof timestampLike.seconds === 'number') {
      date = new Date(timestampLike.seconds * 1000)
    } else if (typeof timestampLike._seconds === 'number') {
      date = new Date(timestampLike._seconds * 1000)
    }
  }

  if (!date || Number.isNaN(date.getTime())) return '-'

  return format(date, 'dd MMMM yyyy')
}
