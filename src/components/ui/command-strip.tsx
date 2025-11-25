import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CommandStripProps {
  label: string
  value: string
  icon?: ReactNode
  className?: string
}

export function CommandStrip({ label, value, icon, className }: CommandStripProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-xl border border-agency-border bg-agency-ink/60 px-3 py-2 text-xs uppercase tracking-[0.4em]',
        className,
      )}
    >
      <span className="flex items-center gap-2 text-agency-muted">
        {icon}
        {label}
      </span>
      <span className="font-mono text-agency-amber">{value}</span>
    </div>
  )
}
