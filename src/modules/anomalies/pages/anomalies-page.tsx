import { Panel } from '@/components/ui/panel'
import { useCampaignStore } from '@/stores/campaign-store'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

const anomalySchema = z.object({
  codename: z.string().min(2),
  focus: z.string().min(2),
  domain: z.string().min(2),
  status: z.enum(['active', 'contained', 'neutralized', 'escaped']),
})

type AnomalyFormValues = z.infer<typeof anomalySchema>

export function AnomaliesPage() {
  const anomalies = useCampaignStore((state) => state.anomalies)
  const createAnomaly = useCampaignStore((state) => state.createAnomaly)
  const updateAnomaly = useCampaignStore((state) => state.updateAnomaly)
  const deleteAnomaly = useCampaignStore((state) => state.deleteAnomaly)
  const [editingAnomalyId, setEditingAnomalyId] = useState<string | null>(null)
  const createDefaultValues = (): AnomalyFormValues => ({
    codename: '',
    focus: '',
    domain: '',
    status: 'active',
  })
  const form = useForm<AnomalyFormValues>({
    resolver: zodResolver(anomalySchema),
    defaultValues: createDefaultValues(),
  })

  const onSubmit = (values: AnomalyFormValues) => {
    if (editingAnomalyId) {
      updateAnomaly(editingAnomalyId, values)
      setEditingAnomalyId(null)
    } else {
      createAnomaly(values)
    }
    form.reset(createDefaultValues())
  }

  const startEdit = (id: string) => {
    const anomaly = anomalies.find((item) => item.id === id)
    if (!anomaly) return
    setEditingAnomalyId(id)
    const { id: _id, ...rest } = anomaly
    form.reset(rest)
  }

  const cancelEdit = () => {
    setEditingAnomalyId(null)
    form.reset(createDefaultValues())
  }

  const handleDelete = (id: string) => {
    const anomaly = anomalies.find((item) => item.id === id)
    if (!anomaly) return
    if (window.confirm(`确认删除异常体「${anomaly.codename}」？`)) {
      deleteAnomaly(id)
      if (editingAnomalyId === id) {
        cancelEdit()
      }
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-agency-muted">收容库</p>
        <h1 className="text-2xl font-semibold text-white">异常体总览</h1>
      </header>

      <Panel>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-4">
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            代号
            <input className="mt-1 w-full rounded-xl border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan" {...form.register('codename')} />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            焦点
            <input className="mt-1 w-full rounded-xl border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan" {...form.register('focus')} />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            领域
            <input className="mt-1 w-full rounded-xl border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan" {...form.register('domain')} />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            状态
            <select className="mt-1 w-full rounded-xl border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan" {...form.register('status')}>
              <option value="active">活跃</option>
              <option value="contained">已收容</option>
              <option value="neutralized">已中和</option>
              <option value="escaped">已逃脱</option>
            </select>
          </label>
          <div className="md:col-span-4 flex items-center gap-3">
            {editingAnomalyId ? (
              <button type="button" onClick={cancelEdit} className="rounded-2xl border border-agency-border px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-muted">
                取消编辑
              </button>
            ) : null}
            <button type="submit" className="rounded-2xl border border-agency-cyan/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-cyan">
              {editingAnomalyId ? '保存异常体' : '录入异常体'}
            </button>
          </div>
        </form>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        {anomalies.map((anomaly) => (
          <Panel key={anomaly.id} className={editingAnomalyId === anomaly.id ? 'border-agency-cyan/60' : undefined}>
            <p className="text-xs uppercase tracking-[0.4em] text-agency-muted">{anomaly.status}</p>
            <h2 className="text-xl font-semibold text-white">{anomaly.codename}</h2>
            <p className="text-sm text-agency-muted">焦点：{anomaly.focus}</p>
            <p className="text-sm text-agency-muted">领域：{anomaly.domain}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="rounded-xl border border-agency-border px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-agency-muted hover:border-agency-cyan hover:text-agency-cyan"
                onClick={() => startEdit(anomaly.id)}
              >
                {editingAnomalyId === anomaly.id ? '编辑中' : '编辑'}
              </button>
              <button
                type="button"
                className="rounded-xl border border-agency-border/70 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-agency-muted hover:border-agency-magenta hover:text-agency-magenta"
                onClick={() => handleDelete(anomaly.id)}
              >
                删除
              </button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}
