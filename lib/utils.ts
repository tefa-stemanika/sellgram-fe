import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

export const formatIDRCurrency = (amount: number): string => {
  return `Rp${amount.toLocaleString('id-ID')}`
}

/** Indonesian numbers arrive bare ("62813...", "0813...", "813..."); render them as "+62...". */
export function formatPhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return raw
  if (digits.startsWith('62')) return `+${digits}`
  if (digits.startsWith('0')) return `+62${digits.slice(1)}`
  return `+62${digits}`
}

export function parseDateValue(value: unknown): Date | null {
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
