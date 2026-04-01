import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg glass placeholder:text-muted-foreground/70 px-3 py-2 text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground hover:bg-white/15 dark:hover:bg-black/30 hover:border-white/40 dark:hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:bg-white/20 dark:focus-visible:bg-black/30 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }
