import type { ReactNode } from 'react'
import { useIsTheme, useIntentClassnames } from '@/lib/theme-utils'

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
  intent?: 'default' | 'warning' | 'critical'
  className?: string
}

export function StatCard({ label, value, hint, icon, intent = 'default', className }: StatCardProps) {
  const isWin98 = useIsTheme('win98')
  const isRetro = useIsTheme('retro')
  const intentClass = useIntentClassnames(intent)

  // 通用的卡片容器样式
  const getCardContainerClass = () => {
    if (isWin98) {
      return `flex items-center gap-4 border bg-agency-panel p-4 rounded-none shadow-none border-agency-border/80 ${intentClass} ${className || ''}`
    } else if (isRetro) {
      return `flex items-center gap-4 border bg-agency-panel/70 p-4 rounded-none shadow-none border-agency-border/80 ${intentClass} ${className || ''}`
    } else {
      return `flex items-center gap-4 rounded-2xl border bg-agency-panel/70 p-4 shadow-panel ${intentClass} ${className || ''}`
    }
  }

  // 通用的图标容器样式
  const getIconContainerClass = () => {
    if (isWin98) {
      return 'flex h-12 w-12 items-center justify-center win98-inset bg-white text-2xl'
    } else if (isRetro) {
      return 'flex h-12 w-12 items-center justify-center border border-agency-border/90 bg-agency-panel/100 text-2xl'
    } else {
      return 'flex h-12 w-12 items-center justify-center rounded-xl border border-current/40 bg-agency-ink/60 text-2xl'
    }
  }

  // 通用的标签样式
  const getLabelClass = () => {
    return isWin98 ? 'text-xs uppercase tracking-[0.3em] text-black' : 'text-xs uppercase tracking-[0.3em] text-agency-muted'
  }

  return (
    <div className={getCardContainerClass()}>
      <div className={getIconContainerClass()}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={getLabelClass()}>{label}</p>
        <p className="text-2xl font-semibold text-current">{value}</p>
        {hint ? <p className="text-xs text-agency-muted">{hint}</p> : null}
      </div>
    </div>
  )
}
