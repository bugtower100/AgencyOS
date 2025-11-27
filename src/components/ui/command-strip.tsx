import type { ReactNode } from 'react'
import { useIsTheme, useIsRetroStyle } from '@/lib/theme-utils'

interface CommandStripProps {
  label: string
  value: string
  icon?: ReactNode
  className?: string
}

export function CommandStrip({ label, value, icon, className }: CommandStripProps) {
  const isWin98 = useIsTheme('win98')
  const isRetroStyle = useIsRetroStyle()

  // 构建基础样式类
  const baseClass = 'flex items-center justify-between border border-agency-border px-3 py-2 text-xs uppercase tracking-[0.4em]'
  const themeClass = isWin98 
    ? 'rounded-none win98-inset' 
    : (isRetroStyle ? 'rounded-none bg-agency-ink/60' : 'rounded-xl bg-agency-ink/60')

  return (
    <div
      className={`${baseClass} ${themeClass} ${className || ''}`}
    >
      <span className="flex items-center gap-2 text-agency-muted">
        {icon}
        {label}
      </span>
      <span className="font-mono text-agency-amber">{value}</span>
    </div>
  )
}
