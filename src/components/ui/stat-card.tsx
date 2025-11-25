import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import { useThemeStore } from '@/stores/theme-store'

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

const intentStylesWin98: Record<string, string> = {
  default: 'text-black border-agency-border/80',
  warning: 'text-agency-amber border-agency-border/80',
  critical: 'text-agency-magenta border-agency-border/80',
}

export function StatCard({ label, value, hint, icon, intent = 'default', className }: StatCardProps) {
  const themeMode = useThemeStore((state) => state.mode)
  const isWin98 = themeMode === 'win98'
  const isRetro = themeMode === 'retro'

  if (isWin98) {
    // win98 主题下的专用样式 (Authentic)
    return (
      <div
        className={cn(
          'flex items-center gap-4 border bg-agency-panel p-4 rounded-none shadow-none border-agency-border/80',
          intentStylesWin98[intent],
          className,
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center win98-inset bg-white text-2xl">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.3em] text-black">{label}</p>
          <p className="text-2xl font-semibold text-current">{value}</p>
          {hint ? <p className="text-xs text-agency-muted">{hint}</p> : null}
        </div>
      </div>
    )
  }

  if (isRetro) {
    // Retro 主题下的专用样式 (Old Win98)
    return (
      <div
        className={cn(
          'flex items-center gap-4 border bg-agency-panel/70 p-4 rounded-none shadow-none border-agency-border/80',
          intentStylesWin98[intent],
          className,
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center border border-agency-border/90 bg-agency-panel/100 text-2xl">
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

  // Default / Night / Day
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
