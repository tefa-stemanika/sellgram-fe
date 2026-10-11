import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type MetricCardProps = {
  label: string
  value: React.ReactNode
  icon?: LucideIcon
  hint?: React.ReactNode
  className?: string
}

export function MetricCard({ label, value, icon: Icon, hint, className }: MetricCardProps) {
  return (
    <div className={cn('surface flex items-start justify-between gap-3 p-5', className)}>
      <div className="min-w-0 space-y-1">
        <p className="text-caption truncate text-muted-foreground">{label}</p>
        <p className="text-subsection-header font-mono tabular-nums">{value}</p>
        {hint ? <p className="text-caption text-muted-foreground">{hint}</p> : null}
      </div>
      {Icon ? <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden /> : null}
    </div>
  )
}
