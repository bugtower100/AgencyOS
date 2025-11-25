import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/theme-store'

interface CommandStripProps {
  label: string
  value: string
  icon?: ReactNode
  className?: string
}

export function CommandStrip({ label, value, icon, className }: CommandStripProps) {
  const themeMode = useThemeStore((state) => state.mode)
  const isWin98 = themeMode === 'win98'

  return (
    <div
      className={cn(
        'flex items-center justify-between border border-agency-border bg-agency-ink/60 px-3 py-2 text-xs uppercase tracking-[0.4em]',
        isWin98 ? 'rounded-none' : 'rounded-xl',
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
