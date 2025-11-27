import type { HTMLAttributes } from 'react'
import { usePanelClassnames } from '@/lib/theme-utils'

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const baseClass = usePanelClassnames()

  return (
    <div
      className={`${baseClass} ${className || ''}`}
      {...props}
    />
  )
}
