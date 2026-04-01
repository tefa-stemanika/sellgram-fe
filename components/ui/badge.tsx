import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full backdrop-blur-md border px-3 py-1.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-primary/30 bg-primary/15 text-primary hover:bg-primary/25',
        secondary: 'border-secondary/30 bg-secondary/15 text-secondary hover:bg-secondary/25',
        destructive: 'border-error/30 bg-error/15 text-error hover:bg-error/25',
        outline: 'border-border text-foreground hover:bg-muted/50',
        success: 'border-success/30 bg-success/15 text-success hover:bg-success/25',
        warning: 'border-warning/30 bg-warning/15 text-warning hover:bg-warning/25',
        error: 'border-error/30 bg-error/15 text-error hover:bg-error/25',
        info: 'border-info/30 bg-info/15 text-info hover:bg-info/25'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
