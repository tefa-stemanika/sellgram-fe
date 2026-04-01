import * as React from 'react'

import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-lg glass px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:bg-white/20 dark:focus-visible:bg-black/30 hover:bg-white/15 dark:hover:bg-black/20 hover:border-white/40 dark:hover:border-white/20 transition-all disabled:cursor-not-allowed disabled:opacity-50 resize-vertical',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
