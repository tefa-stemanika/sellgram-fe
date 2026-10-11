'use client'

import { ChangeEvent, forwardRef, useEffect, useMemo, useRef } from 'react'
import { Input } from '../ui/input'
import { Search } from 'lucide-react'
import _ from 'lodash'
import { cn } from '@/lib/utils'

export interface InputSearchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onChangeValue?: (value: string) => void;
  value?: string;
  hideIcon?: boolean;
  wrapperClassname?: string;
}

const InputSearch = forwardRef<HTMLInputElement, InputSearchProps>(
  ({ className, onChangeValue, value, hideIcon = false, wrapperClassname, ...props }, ref) => {
    const callbackRef = useRef(onChangeValue);
    useEffect(() => {
      callbackRef.current = onChangeValue;
    });

    const debouncedResults = useMemo(() => {
      const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (callbackRef.current) callbackRef.current(event.target.value)
      }
      return _.debounce(handleChange, 500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
      return () => {
        debouncedResults.cancel()
      }
    }, [debouncedResults])

    return (
      <div className={cn('w-full relative', wrapperClassname)}>
        <Input
          ref={ref}
          className={cn('pr-9', className)}
          onChange={debouncedResults}
          value={value}
          {...props}
        />
        {!hideIcon && (
          <div className="absolute top-[50%] right-3 -translate-y-[50%] text-muted-foreground">
            <Search className="size-4" aria-hidden />
          </div>
        )}
      </div>
    )
  }
)

InputSearch.displayName = 'InputSearch'

export default InputSearch
