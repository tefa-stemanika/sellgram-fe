import { Loader2 } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'

type LoadingButtonProps = ButtonProps & {
  loading?: boolean
}

export function LoadingButton({ loading, children, disabled, ...props }: LoadingButtonProps) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}
