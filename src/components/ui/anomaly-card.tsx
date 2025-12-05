import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { AnomalySummary } from '@/lib/types'
import { useTrans } from '@/lib/i18n-utils'

export interface AnomalyCardProps {
  anomaly: AnomalySummary
  className?: string
  isEditing?: boolean
  actions?: ReactNode
}

export default function AnomalyCard({ anomaly, className, isEditing, actions }: AnomalyCardProps) {
  const t = useTrans()
  return (
    <div className={cn('rounded-2xl border border-agency-border/60 bg-agency-ink/50 p-4', isEditing ? 'border-agency-cyan/60' : '', className)}>
      <p className="text-sm text-agency-muted">{anomaly.focus}</p>
      <h3 className="text-lg font-semibold text-white">{anomaly.codename}</h3>
      <p className="text-xs text-agency-muted">{t('anomalies.card.domain')}：{anomaly.domain}</p>
      <p className="text-xs uppercase tracking-[0.4em] text-agency-cyan">{anomaly.status}</p>
      {actions ? (
        <div className="mt-4 flex gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  )
}
