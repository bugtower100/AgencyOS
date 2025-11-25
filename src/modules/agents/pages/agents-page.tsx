import { Panel } from '@/components/ui/panel'
import { useCampaignStore } from '@/stores/campaign-store'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { QA_CATEGORIES } from '@/lib/types'
import { useState } from 'react'

const agentSchema = z.object({
  codename: z.string().min(2, '请输入代号'),
  arcAnomaly: z.string().min(1),
  arcReality: z.string().min(1),
  arcRole: z.string().min(1),
  qa: z.object({
    focus: z.object({ current: z.number().min(0).max(9), max: z.number().min(1).max(9) }),
    deceit: z.object({ current: z.number().min(0).max(9), max: z.number().min(1).max(9) }),
    vitality: z.object({ current: z.number().min(0).max(9), max: z.number().min(1).max(9) }),
    empathy: z.object({ current: z.number().min(0).max(9), max: z.number().min(1).max(9) }),
    initiative: z.object({ current: z.number().min(0).max(9), max: z.number().min(1).max(9) }),
    resilience: z.object({ current: z.number().min(0).max(9), max: z.number().min(1).max(9) }),
    presence: z.object({ current: z.number().min(0).max(9), max: z.number().min(1).max(9) }),
    expertise: z.object({ current: z.number().min(0).max(9), max: z.number().min(1).max(9) }),
    mystique: z.object({ current: z.number().min(0).max(9), max: z.number().min(1).max(9) }),
  }),
  awards: z.number().min(0),
  reprimands: z.number().min(0),
  status: z.enum(['active', 'resting', 'retired', 'dead', 'pending']),
})

type AgentFormValues = z.infer<typeof agentSchema>

const createDefaultQAValues = (): AgentFormValues['qa'] =>
  QA_CATEGORIES.reduce((acc, category) => {
    acc[category.key] = { current: 1, max: 3 }
    return acc
  }, {} as AgentFormValues['qa'])

const createEmptyAgentForm = (): AgentFormValues => ({
  codename: '',
  arcAnomaly: '',
  arcReality: '',
  arcRole: '',
  qa: createDefaultQAValues(),
  awards: 0,
  reprimands: 0,
  status: 'active',
})

export function AgentsPage() {
  const agents = useCampaignStore((state) => state.agents)
  const createAgent = useCampaignStore((state) => state.createAgent)
  const updateAgent = useCampaignStore((state) => state.updateAgent)
  const deleteAgent = useCampaignStore((state) => state.deleteAgent)
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null)
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: createEmptyAgentForm(),
  })

  const onSubmit = (values: AgentFormValues) => {
    if (editingAgentId) {
      updateAgent(editingAgentId, values)
      setEditingAgentId(null)
    } else {
      createAgent(values)
    }
    form.reset(createEmptyAgentForm())
  }

  const startEdit = (agentId: string) => {
    const agent = agents.find((item) => item.id === agentId)
    if (!agent) return
    setEditingAgentId(agentId)
    const { id: _id, ...rest } = agent
    form.reset({ ...rest })
  }

  const cancelEdit = () => {
    setEditingAgentId(null)
    form.reset(createEmptyAgentForm())
  }

  const handleDelete = (agentId: string) => {
    const target = agents.find((agent) => agent.id === agentId)
    if (!target) return
    if (window.confirm(`确认删除特工「${target.codename}」？`)) {
      deleteAgent(agentId)
      if (editingAgentId === agentId) {
        cancelEdit()
      }
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-agency-muted">人力资源档案</p>
        <h1 className="text-2xl font-semibold text-white">特工列表</h1>
      </header>
      <Panel>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
            代号
            <input
              className="w-full rounded-xl border border-agency-border bg-agency-ink/60 px-3 py-2 font-mono text-sm text-agency-cyan"
              {...form.register('codename')}
            />
          </label>
          <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
            异常
            <input className="w-full rounded-xl border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan" {...form.register('arcAnomaly')} />
          </label>
          <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
            现实
            <input className="w-full rounded-xl border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan" {...form.register('arcReality')} />
          </label>
          <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
            职能
            <input className="w-full rounded-xl border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan" {...form.register('arcRole')} />
          </label>
          <div className="space-y-2 text-xs uppercase tracking-[0.3em] text-agency-muted md:col-span-3">
            <p>QA 当前/上限</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {QA_CATEGORIES.map((category) => (
                <label key={category.key} className="space-y-1 rounded-2xl border border-agency-border/80 bg-agency-ink/60 p-3">
                  <span className="text-[0.65rem] tracking-[0.4em] text-agency-muted">{category.label}</span>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="number"
                      className="w-full rounded-xl border border-agency-border bg-agency-ink px-3 py-2 text-sm text-agency-cyan"
                      {...form.register(`qa.${category.key}.current` as const, { valueAsNumber: true })}
                    />
                    <input
                      type="number"
                      className="w-full rounded-xl border border-agency-border bg-agency-ink px-3 py-2 text-sm text-agency-cyan"
                      {...form.register(`qa.${category.key}.max` as const, { valueAsNumber: true })}
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>
          <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
            嘉奖/申诫
            <div className="flex gap-2">
              <input type="number" className="w-full rounded-xl border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan" {...form.register('awards', { valueAsNumber: true })} />
              <input type="number" className="w-full rounded-xl border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan" {...form.register('reprimands', { valueAsNumber: true })} />
            </div>
          </label>
          <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
            状态
            <select className="w-full rounded-xl border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan" {...form.register('status')}>
              <option value="active">在职</option>
              <option value="resting">休整</option>
              <option value="retired">退休</option>
              <option value="dead">死亡</option>
              <option value="pending">待入职</option>
            </select>
          </label>
          <div className="flex items-center gap-3 self-end">
            {editingAgentId ? (
              <button type="button" onClick={cancelEdit} className="rounded-2xl border border-agency-border px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-muted">
                取消编辑
              </button>
            ) : null}
            <button type="submit" className="rounded-2xl border border-agency-cyan/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-cyan transition hover:border-agency-cyan">
              {editingAgentId ? '保存特工' : '录入特工'}
            </button>
          </div>
        </form>
      </Panel>
      <Panel className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-agency-border/60 text-sm">
          <thead className="bg-agency-ink/60 text-xs uppercase tracking-[0.3em] text-agency-muted">
            <tr>
              <th className="px-4 py-3 text-left">代号</th>
              <th className="px-4 py-3 text-left">异常</th>
              <th className="px-4 py-3 text-left">现实</th>
              <th className="px-4 py-3 text-left">职能</th>
              <th className="px-4 py-3 text-left">QA 素质</th>
              <th className="px-4 py-3 text-left">嘉奖</th>
              <th className="px-4 py-3 text-left">申诫</th>
              <th className="px-4 py-3 text-left">状态</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-agency-border/40">
            {agents.map((agent) => (
              <tr key={agent.id} className={`cursor-pointer hover:bg-agency-ink/40 ${editingAgentId === agent.id ? 'bg-agency-ink/40' : ''}`} onClick={() => startEdit(agent.id)}>
                <td className="px-4 py-3 font-mono text-agency-cyan">{agent.codename}</td>
                <td className="px-4 py-3">{agent.arcAnomaly}</td>
                <td className="px-4 py-3">{agent.arcReality}</td>
                <td className="px-4 py-3">{agent.arcRole}</td>
                <td className="px-4 py-3">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {QA_CATEGORIES.map((category) => (
                      <div key={category.key} className="rounded-xl border border-agency-border/60 bg-agency-ink/40 px-3 py-2 text-[0.65rem] uppercase tracking-[0.3em] text-agency-muted">
                        <div className="flex items-center justify-between font-medium">
                          <span>{category.label}</span>
                          <span className="font-mono text-agency-cyan">{agent.qa[category.key].current} / {agent.qa[category.key].max}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-agency-amber">+{agent.awards}</td>
                <td className="px-4 py-3 text-agency-magenta">-{agent.reprimands}</td>
                <td className="px-4 py-3 uppercase tracking-[0.3em] text-xs text-agency-muted">{agent.status}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="rounded-xl border border-agency-border px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-agency-muted hover:border-agency-magenta hover:text-agency-magenta"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleDelete(agent.id)
                    }}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  )
}
