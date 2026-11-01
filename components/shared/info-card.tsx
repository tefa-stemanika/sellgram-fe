import type { LucideIcon } from 'lucide-react'

import { Surface } from '@/components/shared/surface'
import { cn } from '@/lib/utils'

type InfoCardProps = {
  icon: LucideIcon
  label: string
  value: string
  mono?: boolean
  className?: string
}

export function InfoCard({ icon: Icon, label, value, mono = false, className }: InfoCardProps) {
  return (
    <Surface className={cn('p-3', className)}>
      <div className="flex items-center gap-2 text-caption text-muted-foreground">
        <Icon className="h-3 w-3" aria-hidden />
        {label}
      </div>
      <p className={cn('mt-1 break-all font-medium', mono && 'font-mono text-mono-data tabular')}>{value}</p>
    </Surface>
  )
}
