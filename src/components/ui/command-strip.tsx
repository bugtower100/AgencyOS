import type { ReactNode } from 'react'
import { useIsTheme, useIsRetroStyle } from '@/lib/theme-utils'

interface CommandStripProps {
  label: string
  value: string
  icon?: ReactNode
  className?: string
  tooltip?: ReactNode
}

export function CommandStrip({ label, value, icon, className, tooltip }: CommandStripProps) {
  const isWin98 = useIsTheme('win98')
  const isRetroStyle = useIsRetroStyle()

  // 构建基础样式类
  const baseClass = 'flex items-center justify-between border border-agency-border px-3 py-2 text-xs uppercase tracking-[0.4em]'
  const themeClass = isWin98 
    ? 'rounded-none win98-inset' 
    : (isRetroStyle ? 'rounded-none bg-agency-ink/60' : 'rounded-xl bg-agency-ink/60')

  const safeId = `command-strip-tooltip-${String(label).replace(/[^a-zA-Z0-9_-]/g, '-')}`

  return (
    <div
      className={`relative group ${baseClass} ${themeClass} ${className || ''}`}
  aria-describedby={tooltip ? safeId : undefined}
      tabIndex={tooltip ? 0 : undefined}
    >
      <span className="flex items-center gap-2 text-agency-muted">
        {icon}
        {label}
      </span>
      <span className="font-mono text-agency-amber">{value}</span>
      {tooltip ? (
        <div
          id={safeId}
          role="tooltip"
          className="pointer-events-none absolute top-full left-1/2 z-50 mt-2 w-max -translate-x-1/2 whitespace-normal rounded-md border border-agency-border/60 bg-agency-ink/95 p-3 text-sm text-white opacity-0 transition-opacity duration-150 ease-in-out shadow-lg group-hover:opacity-100 group-focus:opacity-100"
        >
          {tooltip}
        </div>
      ) : null}
    </div>
  )
}
