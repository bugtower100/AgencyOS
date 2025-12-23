import { FormFieldError } from '@/components/ui/form-field'
import { useCommonTranslations, useTrans } from '@/lib/i18n-utils'
import { QA_CATEGORIES, type AgentSummary, type AgentClaimRecord } from '@/lib/types'
import { createId } from '@/lib/utils'
import { useCampaignStore } from '@/stores/campaign-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const agentSchema = z.object({
  codename: z.string().min(2, '请输入代号'),
  arcAnomaly: z.string().min(1),
  arcReality: z.string().min(1),
  arcRole: z.string().min(1),
  qa: z.object({
    focus: z.object({ current: z.number().min(0).max(9), max: z.number().min(0).max(9) }),
    deceit: z.object({ current: z.number().min(0).max(9), max: z.number().min(0).max(9) }),
    vitality: z.object({ current: z.number().min(0).max(9), max: z.number().min(0).max(9) }),
    empathy: z.object({ current: z.number().min(0).max(9), max: z.number().min(0).max(9) }),
    initiative: z.object({ current: z.number().min(0).max(9), max: z.number().min(0).max(9) }),
    resilience: z.object({ current: z.number().min(0).max(9), max: z.number().min(0).max(9) }),
    presence: z.object({ current: z.number().min(0).max(9), max: z.number().min(0).max(9) }),
    expertise: z.object({ current: z.number().min(0).max(9), max: z.number().min(0).max(9) }),
    mystique: z.object({ current: z.number().min(0).max(9), max: z.number().min(0).max(9) }),
  }),
  awards: z.number().min(0),
  reprimands: z.number().min(0),
  status: z.enum(['active', 'resting', 'retired', 'dead', 'pending']),
})

export type AgentFormValues = z.infer<typeof agentSchema>

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

// 下拉选项（允许自定义输入，也可从下拉选择）
const ANOMALY_OPTIONS = ['低语', '目录', '汲取', '时计', '生长', '枪械', '梦境', '流形', '缺位']
const REALITY_OPTIONS = ['看护者', '卷王', '被追捕者', '明星', '底层草根', '新生儿', '海王', '顶梁柱', '异类']
const ROLE_OPTIONS = ['公关', '研发', '咖啡师', '首席执行官', '实习生', '掘墓人', '接待处', '热线', '小丑']

interface AgentFormProps {
  initialData?: AgentSummary
  onSubmit: (values: AgentFormValues, claims: AgentClaimRecord[]) => void
  onCancel: () => void
  isEditing: boolean
}

export function AgentForm({ initialData, onSubmit, onCancel, isEditing }: AgentFormProps) {
  const t = useTrans()
  const { delete: deleteText, cancel: cancelText, update: updateText, submit: submitText } = useCommonTranslations()
  
  // 从申领物库获取可选物品
  const requisitions = useCampaignStore((state) => state.requisitions)
  
  const [claims, setClaims] = useState<AgentClaimRecord[]>(initialData?.claims || [])
  const [claimDraft, setClaimDraft] = useState({
    itemName: '',
    category: '',
    reason: '',
    requisitionId: '',
  })

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: initialData ? {
      codename: initialData.codename,
      arcAnomaly: initialData.arcAnomaly,
      arcReality: initialData.arcReality,
      arcRole: initialData.arcRole,
      qa: initialData.qa,
      awards: initialData.awards,
      reprimands: initialData.reprimands,
      status: initialData.status,
    } : createEmptyAgentForm(),
  })

  // 控制自定义下拉展开状态和外部点击收起
  const [anomalyOpen, setAnomalyOpen] = useState(false)
  const [realityOpen, setRealityOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const anomalyRef = useRef<HTMLLabelElement | null>(null)
  const realityRef = useRef<HTMLLabelElement | null>(null)
  const roleRef = useRef<HTMLLabelElement | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (anomalyRef.current && !anomalyRef.current.contains(target)) setAnomalyOpen(false)
      if (realityRef.current && !realityRef.current.contains(target)) setRealityOpen(false)
      if (roleRef.current && !roleRef.current.contains(target)) setRoleOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAnomalyOpen(false)
        setRealityOpen(false)
        setRoleOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const handleSubmit = (values: AgentFormValues) => {
    onSubmit(values, claims)
    if (!isEditing) {
      form.reset(createEmptyAgentForm())
      setClaims([])
    }
    setClaimDraft({ itemName: '', category: '', reason: '', requisitionId: '' })
  }

  const handleAddClaim = () => {
    if (!claimDraft.itemName.trim()) return
    
    // 如果选择了申领物库中的物品，使用其信息
    const selectedReq = requisitions.find(r => r.id === claimDraft.requisitionId)
    
    const next: AgentClaimRecord[] = [
      ...claims,
      {
        id: createId(),
        itemName: claimDraft.itemName.trim(),
        category: claimDraft.category.trim() || (selectedReq ? getSourceLabel(selectedReq.source, selectedReq.branchName) : t('agents.claims.uncategorized')),
        reason: claimDraft.reason.trim() || t('agents.claims.reasonDefault'),
        claimedAt: new Date().toISOString(),
        status: 'pending',
        requisitionId: claimDraft.requisitionId || undefined,
      },
    ]
    setClaims(next)
    setClaimDraft({ itemName: '', category: '', reason: '', requisitionId: '' })
  }
  
  // 辅助函数：获取来源标签
  const getSourceLabel = (source: string, branchName?: string): string => {
    switch (source) {
      case 'hq': return t('requisitions.source.hq')
      case 'siphon': return t('requisitions.source.siphon')
      case 'branch': return branchName || t('requisitions.source.branch')
      default: return source
    }
  }
  
  // 从申领物库选择物品
  const handleSelectRequisition = (requisitionId: string) => {
    const req = requisitions.find(r => r.id === requisitionId)
    if (req) {
      setClaimDraft(prev => ({
        ...prev,
        itemName: req.name,
        category: getSourceLabel(req.source, req.branchName),
        requisitionId: req.id,
      }))
    }
  }

  const handleDeleteClaim = (claimId: string) => {
    setClaims(claims.filter((item) => item.id !== claimId))
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 md:grid-cols-4">
      <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
        {t('agents.form.codename')}
        <input
          className={`w-full border bg-agency-ink/60 px-3 py-2 font-mono text-sm text-agency-cyan rounded-xl win98:rounded-none ${form.formState.errors.codename ? "border-agency-magenta" : "border-agency-border"}`}
          {...form.register('codename')}
        />
        <FormFieldError error={form.formState.errors.codename} />
      </label>
      <label ref={anomalyRef} className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted relative">
        {t('agents.form.arcAnomalyf')}
        <div className="flex items-center gap-2">
          <input
            className={`w-full border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none ${form.formState.errors.arcAnomaly ? "border-agency-magenta" : "border-agency-border"}`}
            {...form.register('arcAnomaly')}
            onFocus={() => setAnomalyOpen(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') setAnomalyOpen(false) }}
          />
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={anomalyOpen}
            onClick={() => setAnomalyOpen((v) => !v)}
            className="border border-agency-border px-2 py-2 rounded-xl win98:rounded-none"
          >
            ▾
          </button>
        </div>
        <FormFieldError error={form.formState.errors.arcAnomaly} />
        {anomalyOpen && (
          <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border border-agency-border bg-agency-ink/80 p-1 text-sm shadow-lg">
            {ANOMALY_OPTIONS.map((opt) => (
              <li
                key={opt}
                role="option"
                onClick={() => {
                  form.setValue('arcAnomaly', opt, { shouldDirty: true, shouldTouch: true })
                  setAnomalyOpen(false)
                }}
                className="cursor-pointer rounded px-2 py-1 hover:bg-agency-amber/10"
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </label>
      <label ref={realityRef} className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted relative">
        {t('agents.form.arcRealityf')}
        <div className="flex items-center gap-2">
          <input
            className={`w-full border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none ${form.formState.errors.arcReality ? "border-agency-magenta" : "border-agency-border"}`}
            {...form.register('arcReality')}
            onFocus={() => setRealityOpen(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') setRealityOpen(false) }}
          />
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={realityOpen}
            onClick={() => setRealityOpen((v) => !v)}
            className="border border-agency-border px-2 py-2 rounded-xl win98:rounded-none"
          >
            ▾
          </button>
        </div>
        <FormFieldError error={form.formState.errors.arcReality} />
        {realityOpen && (
          <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border border-agency-border bg-agency-ink/80 p-1 text-sm shadow-lg">
            {REALITY_OPTIONS.map((opt) => (
              <li
                key={opt}
                role="option"
                onClick={() => {
                  form.setValue('arcReality', opt, { shouldDirty: true, shouldTouch: true })
                  setRealityOpen(false)
                }}
                className="cursor-pointer rounded px-2 py-1 hover:bg-agency-amber/10"
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </label>
      <label ref={roleRef} className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted relative">
        {t('agents.form.arcRolef')}
        <div className="flex items-center gap-2">
          <input
            className={`w-full border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none ${form.formState.errors.arcRole ? "border-agency-magenta" : "border-agency-border"}`}
            {...form.register('arcRole')}
            onFocus={() => setRoleOpen(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') setRoleOpen(false) }}
          />
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={roleOpen}
            onClick={() => setRoleOpen((v) => !v)}
            className="border border-agency-border px-2 py-2 rounded-xl win98:rounded-none"
          >
            ▾
          </button>
        </div>
        <FormFieldError error={form.formState.errors.arcRole} />
        {roleOpen && (
          <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border border-agency-border bg-agency-ink/80 p-1 text-sm shadow-lg">
            {ROLE_OPTIONS.map((opt) => (
              <li
                key={opt}
                role="option"
                onClick={() => {
                  form.setValue('arcRole', opt, { shouldDirty: true, shouldTouch: true })
                  setRoleOpen(false)
                }}
                className="cursor-pointer rounded px-2 py-1 hover:bg-agency-amber/10"
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </label>
      <div className="space-y-2 text-xs uppercase tracking-[0.3em] text-agency-muted md:col-span-3">
        <p>{t('agents.form.qaLabel')}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QA_CATEGORIES.map((category) => (
            <label key={category.key} className="space-y-1 border border-agency-border/80 bg-agency-ink/60 p-3 rounded-2xl win98:rounded-none">
              <span className="text-[0.65rem] tracking-[0.4em] text-agency-muted">{t(`agents.stats.${category.key}`)}</span>
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  className="w-full border border-agency-border bg-agency-ink px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none"
                  {...form.register(`qa.${category.key}.current` as const, { valueAsNumber: true })}
                />
                <input
                  type="number"
                  className="w-full border border-agency-border bg-agency-ink px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none"
                  {...form.register(`qa.${category.key}.max` as const, { valueAsNumber: true })}
                />
              </div>
            </label>
          ))}
        </div>
      </div>
      <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
        {t('agents.form.awards')}/{t('agents.form.reprimands')}
        <div className="flex gap-2">
          <input type="number" className="w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('awards', { valueAsNumber: true })} />
          <input type="number" className="w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('reprimands', { valueAsNumber: true })} />
        </div>
      </label>
      <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
        {t('agents.form.status')}
        <select className="w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none" {...form.register('status')}>
          <option value="active">{t('agents.statusOptions.active')}</option>
          <option value="resting">{t('agents.statusOptions.resting')}</option>
          <option value="retired">{t('agents.statusOptions.retired')}</option>
          <option value="dead">{t('agents.statusOptions.dead')}</option>
          <option value="pending">{t('agents.statusOptions.pending')}</option>
        </select>
      </label>
      <div className="md:col-span-3 space-y-2 text-xs uppercase tracking-[0.3em] text-agency-muted">
        <div className="flex items-center justify-between">
          <span>{t('agents.claims.title')}</span>
          <span className="text-[0.65rem] text-agency-muted normal-case">{t('agents.claims.count', { count: claims.length })}</span>
        </div>
        
        {/* 从申领物库选择 */}
        {requisitions.length > 0 && (
          <div className="mb-2">
            <label className="space-y-1">
              <span className="text-[0.65rem] tracking-[0.3em]">{t('agents.claims.selectFromLibrary')}</span>
              <select
                className="w-full border border-agency-amber/60 bg-agency-ink/60 px-3 py-2 text-sm text-agency-amber rounded-xl win98:rounded-none"
                value={claimDraft.requisitionId}
                onChange={(e) => handleSelectRequisition(e.target.value)}
              >
                <option value="">{t('agents.claims.selectPlaceholder')}</option>
                {requisitions.map((req) => (
                  <option key={req.id} value={req.id}>
                    {req.name} ({getSourceLabel(req.source, req.branchName)})
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        
        <div className="grid gap-3 md:grid-cols-[2fr_1.5fr_3fr_auto] items-start">
          <label className="space-y-1">
            <span className="text-[0.65rem] tracking-[0.3em]">{t('agents.claims.itemName')}</span>
            <input
              className="w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none"
              value={claimDraft.itemName}
              onChange={(e) => setClaimDraft((prev) => ({ ...prev, itemName: e.target.value, requisitionId: '' }))}
              placeholder={t('agents.claims.itemNamePlaceholder')}
            />
          </label>
          <label className="space-y-1">
            <span className="text-[0.65rem] tracking-[0.3em]">{t('agents.claims.category')}</span>
            <input
              className="w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none"
              value={claimDraft.category}
              onChange={(e) => setClaimDraft((prev) => ({ ...prev, category: e.target.value }))}
              placeholder={t('agents.claims.categoryPlaceholder')}
            />
          </label>
          <label className="space-y-1">
            <span className="text-[0.65rem] tracking-[0.3em]">{t('agents.claims.reason')}</span>
            <input
              className="w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none"
              value={claimDraft.reason}
              onChange={(e) => setClaimDraft((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder={t('agents.claims.reasonPlaceholder')}
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAddClaim}
              className="w-full border border-agency-cyan/60 px-3 py-2 text-[0.7rem] uppercase tracking-[0.3em] text-agency-cyan hover:border-agency-cyan disabled:border-agency-border disabled:text-agency-border rounded-2xl win98:rounded-none"
              disabled={!claimDraft.itemName.trim()}
            >
              {t('agents.claims.addClaim')}
            </button>
          </div>
        </div>
        {claims.length ? (
          <div className="mt-2 space-y-2 border border-agency-border/80 bg-agency-ink/60 p-3 rounded-2xl win98:rounded-none">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-agency-muted">{t('agents.claims.history')}</p>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-start justify-between gap-3 border border-agency-border/60 bg-agency-ink/80 px-3 py-2 text-[0.75rem] text-agency-muted rounded-xl win98:rounded-none"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-agency-cyan">{claim.itemName}</span>
                      <span className="rounded-full border border-agency-border px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.3em]">
                        {claim.category || t('agents.claims.uncategorized')}
                      </span>
                      <span className="text-[0.6rem] uppercase tracking-[0.3em] text-agency-muted">
                        {new Date(claim.claimedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[0.7rem] leading-relaxed">{t('agents.claims.reason')}：{claim.reason}</p>
                    <p className="text-[0.65rem] uppercase tracking-[0.3em] text-agency-amber">{t('agents.claims.status')}：{claim.status}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteClaim(claim.id)}
                    className="mt-1 border border-agency-border px-2 py-1 text-[0.6rem] uppercase tracking-[0.3em] text-agency-muted hover:border-agency-magenta hover:text-agency-magenta rounded-xl win98:rounded-none"
                  >
                    {deleteText}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-3 self-end">
        {isEditing ? (
          <button type="button" onClick={onCancel} className="border border-agency-border px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-muted rounded-2xl win98:rounded-none">
            {cancelText}
          </button>
        ) : null}
        <button type="submit" className="border border-agency-cyan/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-cyan transition hover:border-agency-cyan rounded-2xl win98:rounded-none">
          {isEditing ? updateText : submitText}
        </button>
      </div>
    </form>
  )
}
