import { cn } from '@/lib/utils'

type QuotaBarProps = {
  label: string
  used: number
  total: number | 'Unlimited'
  /** Rendered after the number, e.g. "chat" or "kontak". */
  unit?: string
  className?: string
}

export function QuotaBar({ label, used, total, unit, className }: QuotaBarProps) {
  const unlimited = total === 'Unlimited'
  const ratio = unlimited || total <= 0 ? 0 : Math.min(100, Math.round((used / total) * 100))
  const tone = !unlimited && ratio >= 90 ? 'bg-error' : !unlimited && ratio >= 70 ? 'bg-warning' : 'bg-primary'

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-caption truncate text-muted-foreground">{label}</p>
        <p className="text-mono-data font-mono tabular text-foreground">
          {unlimited ? (
            'Unlimited'
          ) : (
            <>
              {used.toLocaleString('id-ID')}
              {unit ? ` ${unit}` : ''} / {total.toLocaleString('id-ID')}
            </>
          )}
        </p>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={unlimited ? undefined : ratio}>
        {!unlimited ? <div className={cn('h-full rounded-full transition-[width] duration-500 ease-out', tone)} style={{ width: `${ratio}%` }} /> : null}
      </div>
    </div>
  )
}
