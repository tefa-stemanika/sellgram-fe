import type { ReactNode } from 'react'

type PageHeaderProps = {
  kicker?: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ kicker, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-4 ${className ?? ''}`}>
      <div className="space-y-1">
        {kicker ? <p className="kicker">{kicker}</p> : null}
        <h1 className="text-page-title max-w-[40ch] text-balance">{title}</h1>
        {description ? <p className="text-body-sm max-w-[65ch] text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
