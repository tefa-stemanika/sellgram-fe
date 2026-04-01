import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import Link from 'next/link'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'glass hover:bg-white/45 dark:hover:bg-black/30 hover:border-white/30 dark:hover:border-white/20 text-foreground font-semibold transition-all duration-200 backdrop-blur-xl',
        destructive:
          'glass bg-white/45 dark:bg-black/25 border-red-200/30 dark:border-red-900/30 hover:bg-white/25 dark:hover:bg-black/35 text-error font-semibold transition-all duration-200',
        outline:
          'border-1.5 border-white/30 dark:border-white/20 glass hover:bg-white/45 dark:hover:bg-black/20 text-foreground transition-all duration-200',
        secondary: 'glass hover:bg-white/45 dark:hover:bg-black/25 text-foreground transition-all duration-200',
        ghost: 'hover:bg-white/10 dark:hover:bg-black/20 text-foreground transition-all duration-200',
        link: 'text-primary underline-offset-4 hover:underline transition-colors'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-lg px-8',
        xl: 'h-12 px-8 text-base font-semibold',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  link?: string
  target?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, link, target, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    if (!!link) {
      return (
        <Link href={link} target={target}>
          <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
        </Link>
      )
    }

    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
