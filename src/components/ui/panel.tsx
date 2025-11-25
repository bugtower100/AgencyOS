import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-agency-border bg-agency-panel/90 p-4 text-agency-cyan shadow-panel backdrop-blur-lg',
        className,
      )}
      {...props}
    />
  )
}
