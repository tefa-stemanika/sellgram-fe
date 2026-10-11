import { forwardRef, type ElementType, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type SurfaceProps = HTMLAttributes<HTMLElement> & {
  elevation?: 1 | 2 | 3
  interactive?: boolean
  as?: ElementType
}

const SHADOW = {
  1: 'shadow-l1',
  2: 'shadow-l2',
  3: 'shadow-l3'
} as const

export const Surface = forwardRef<HTMLElement, SurfaceProps>(function Surface({ elevation = 1, interactive = false, as: Tag = 'div', className, ...props }, ref) {
  return (
    <Tag
      ref={ref}
      className={cn('rounded-lg border border-border bg-card text-card-foreground', SHADOW[elevation], interactive && 'transition-shadow duration-200 hover:shadow-l2', className)}
      {...props}
    />
  )
})
