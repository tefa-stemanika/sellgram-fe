import { statusBadge, type StatusKind } from '@/lib/status-tokens'
import { cn } from '@/lib/utils'

type StatusBadgeProps = {
  kind: StatusKind
  value: string | null | undefined
  locale?: 'id' | 'en'
  withDot?: boolean
  className?: string
}

export function StatusBadge({ kind, value, locale = 'id', withDot = false, className }: StatusBadgeProps) {
  const status = statusBadge(kind, value, locale)
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-caption font-medium', status.className, className)}>
      {withDot ? <span className={cn('size-1.5 rounded-full', status.dotClassName)} aria-hidden /> : null}
      {status.label}
    </span>
  )
}
