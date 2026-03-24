import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatIDRCurrency = (amount: number): string => {
  return `Rp${amount.toLocaleString('id-ID')}`
}

export const formatDate = (date: Date): string => {
  return !!date ? format(date, 'dd MMMM yyyy') : '-'
}
