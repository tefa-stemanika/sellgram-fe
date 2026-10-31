import { AtSign, Hash, Mail, Phone, User, type LucideIcon } from 'lucide-react'

import { InfoCard } from '@/components/shared/info-card'
import { cn, formatPhoneNumber } from '@/lib/utils'

/**
 * Shape of any order-ish payload carrying buyer identity: Order, DashboardOrder,
 * TicketDetail['order'] and StockItemOrderInfo all satisfy it.
 */
export type BuyerLike = {
  source?: string | null
  firstName?: string | null
  customerName?: string | null
  username?: string | null
  telegramId?: string | null
  whatsappId?: string | null
  customerPhone?: string | null
  email?: string | null
  customer?: { name?: string | null; phone?: string | null; email?: string | null } | null
}

export type BuyerLine = { key: string; label: string; value: string; icon: LucideIcon; mono?: boolean }

const WHATSAPP_PERSONAL_JID = '@s.whatsapp.net'

/** Raw JIDs ("62813...@s.whatsapp.net", "12345678@lid"); never a primary contact. */
export function buyerJid(order: BuyerLike): string | null {
  if (!order.whatsappId || !order.whatsappId.includes('@')) return null
  return order.whatsappId
}

export function buyerPhone(order: BuyerLike): string | null {
  const raw = order.customerPhone || order.customer?.phone || jidNumber(order)
  return raw ? formatPhoneNumber(raw) : null
}

function jidNumber(order: BuyerLike): string | null {
  const jid = buyerJid(order)
  if (!jid || !jid.endsWith(WHATSAPP_PERSONAL_JID)) return null
  return jid.split('@')[0].replace(/\D/g, '') || null
}

export function buyerName(order: BuyerLike): string | null {
  return order.customerName || order.firstName || order.customer?.name || order.username || null
}

export function buyerEmail(order: BuyerLike): string | null {
  return order.email || order.customer?.email || null
}

/** Label/value rows in display order. Never includes an empty row. */
export function buyerLines(order: BuyerLike): BuyerLine[] {
  const source = (order.source || '').toUpperCase()
  const name = buyerName(order)
  const phone = buyerPhone(order)
  const email = buyerEmail(order)
  const lines: BuyerLine[] = []

  if (name) lines.push({ key: 'name', label: 'Nama', value: name, icon: User })

  if (source === 'TELEGRAM') {
    if (order.username) lines.push({ key: 'username', label: 'Username', value: `@${order.username}`, icon: AtSign })
    if (order.telegramId)
      lines.push({ key: 'telegramId', label: 'Telegram ID', value: order.telegramId, icon: Hash, mono: true })
  } else if (source === 'WHATSAPP') {
    if (phone) lines.push({ key: 'phone', label: 'No. WhatsApp', value: phone, icon: Phone, mono: true })
  } else {
    if (phone) lines.push({ key: 'phone', label: 'No. HP', value: phone, icon: Phone, mono: true })
    if (email) lines.push({ key: 'email', label: 'Email', value: email, icon: Mail })
    if (source !== 'WEBSITE' && order.username)
      lines.push({ key: 'username', label: 'Username', value: `@${order.username}`, icon: AtSign })
  }

  return lines
}

type OrderBuyerInfoProps = {
  order: BuyerLike
  /** `cell` for tables, `rows` for dense panels, `cards` for dialog grids. */
  variant?: 'cell' | 'rows' | 'cards'
  className?: string
}

export function OrderBuyerInfo({ order, variant = 'rows', className }: OrderBuyerInfoProps) {
  const lines = buyerLines(order)

  if (!lines.length) {
    return variant === 'cell' ? <span className="font-medium">-</span> : <p className="text-muted-foreground">-</p>
  }

  if (variant === 'cell') {
    const [primary, secondary] = lines
    return (
      <div className={cn('min-w-0', className)}>
        <p className="truncate font-medium">{primary.value}</p>
        {secondary ? (
          <p className={cn('truncate text-caption text-muted-foreground', secondary.mono && 'font-mono tabular')}>
            {secondary.value}
          </p>
        ) : null}
      </div>
    )
  }

  if (variant === 'cards') {
    return (
      <>
        {lines.map((line) => (
          <InfoCard key={line.key} icon={line.icon} label={line.label} value={line.value} mono={line.mono} />
        ))}
      </>
    )
  }

  return (
    <div className={cn('space-y-1', className)}>
      {lines.map((line) => (
        <p key={line.key} className="flex items-baseline gap-1.5">
          <span className="shrink-0">{line.label}:</span>
          <span className={cn('min-w-0 break-all', line.mono && 'font-mono tabular')}>{line.value}</span>
        </p>
      ))}
    </div>
  )
}
