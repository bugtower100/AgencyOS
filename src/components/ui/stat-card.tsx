import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
  intent?: 'default' | 'warning' | 'critical'
  className?: string
}

const intentStyles: Record<string, string> = {
  default: 'text-agency-cyan border-agency-border',
  warning: 'text-agency-amber border-agency-amber/50',
  critical: 'text-agency-magenta border-agency-magenta/60',
}

export function StatCard({ label, value, hint, icon, intent = 'default', className }: StatCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl border bg-agency-panel/70 p-4 shadow-panel',
        intentStyles[intent],
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-current/40 bg-agency-ink/60 text-2xl">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.3em] text-agency-muted">{label}</p>
        <p className="text-2xl font-semibold text-current">{value}</p>
        {hint ? <p className="text-xs text-agency-muted">{hint}</p> : null}
      </div>
    </div>
  )
}
