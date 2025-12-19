import { useState } from 'react'
import { Search, Image, Database, Download, Upload, Plus, RotateCcw } from 'lucide-react'
import { Panel } from '@/components/ui/panel'
import { useToast } from '@/components/ui/use-toast'
import { useTrans } from '@/lib/i18n-utils'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/theme-store'
import { useCampaignStore } from '@/stores/campaign-store'
import { DEFAULT_HQ_REQUISITIONS, DEFAULT_SIPHON_REQUISITIONS } from '@/stores/slices'
import type { RequisitionSource } from '@/lib/types'
import { RequisitionForm, type RequisitionFormData } from '../components/requisition-form'
import { RequisitionList } from '../components/requisition-list'
import { Portal } from '@/components/ui/portal'

export function RequisitionsPage() {
  const t = useTrans()
  const { showToast } = useToast()
  const themeMode = useThemeStore((state) => state.mode)
  const isSquare = themeMode === 'win98' || themeMode === 'retro'

  const requisitions = useCampaignStore((state) => state.requisitions)
  const createRequisition = useCampaignStore((state) => state.createRequisition)
  const updateRequisition = useCampaignStore((state) => state.updateRequisition)
  const deleteRequisition = useCampaignStore((state) => state.deleteRequisition)
  const toggleRequisitionStar = useCampaignStore((state) => state.toggleRequisitionStar)
  const reorderRequisitions = useCampaignStore((state) => state.reorderRequisitions)
  const importRequisitions = useCampaignStore((state) => state.importRequisitions)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [showImages, setShowImages] = useState(true)
  const [showDataModal, setShowDataModal] = useState(false)
  const [importText, setImportText] = useState('')

  const editingItem = requisitions.find((r) => r.id === editingId)

  const handleSubmit = (data: RequisitionFormData) => {
    if (editingId) {
      updateRequisition(editingId, data)
      setEditingId(null)
      showToast('success', t('requisitions.toast.updated', { name: data.name }))
    } else {
      createRequisition(data)
      showToast('success', t('requisitions.toast.created', { name: data.name }))
    }
  }

  const handleDelete = (id: string) => {
    const item = requisitions.find((r) => r.id === id)
    if (!item) return
    if (window.confirm(t('requisitions.deleteConfirm', { name: item.name }))) {
      deleteRequisition(id)
      showToast('success', t('requisitions.toast.deleted', { name: item.name }))
      if (editingId === id) {
        setEditingId(null)
      }
    }
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    // 滚动到表单
    document.querySelector('[data-requisition-form]')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  const handleExport = () => {
    const data = JSON.stringify(requisitions, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `requisitions-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('success', t('requisitions.toast.exported'))
  }

  const handleImport = (mode: 'append' | 'overwrite') => {
    try {
      const data = JSON.parse(importText)
      if (!Array.isArray(data)) throw new Error('Invalid format')
      
      // 转换旧格式（来自 HTML 版本），使用严格的类型检查以避免 any
      const converted = (data as unknown[]).map((itemRaw) => {
        const item = (itemRaw && typeof itemRaw === 'object') ? itemRaw as Record<string, unknown> : {}
        const src = typeof item.source === 'string' ? item.source : undefined
        const sourceValue: RequisitionSource = src === '三联城总部' || src === 'hq' ? 'hq'
          : (typeof src === 'string' && src.includes('Siphon')) || src === 'siphon' ? 'siphon'
          : 'branch'

        const prices = Array.isArray(item.prices)
          ? item.prices as unknown as { label: string; cost: number }[]
          : (() => {
              const c = item.cost
              const num = typeof c === 'number' ? c : (typeof c === 'string' ? Number(c) : 0)
              return [{ label: '花费', cost: Number.isFinite(num) ? num : 0 }]
            })()

        return {
          name: typeof item.name === 'string' ? item.name : String(item.name ?? ''),
          source: sourceValue,
          branchName: src && src !== '三联城总部' && !src.includes('Siphon') ? src : undefined,
          prices,
          description: typeof item.desc === 'string' ? item.desc : (typeof item.description === 'string' ? item.description : ''),
          condition: typeof item.condition === 'string' ? item.condition : '',
          purchasedBy: typeof item.purchasedBy === 'string' ? item.purchasedBy : '',
          image: typeof item.image === 'string' ? item.image : '',
          isNew: Boolean(item.isNew),
          starred: Boolean(item.starred),
        }
      })
      
      if (mode === 'overwrite' && !window.confirm(t('requisitions.importOverwriteConfirm'))) {
        return
      }
      
      importRequisitions(converted, mode)
      setImportText('')
      setShowDataModal(false)
      showToast('success', t('requisitions.toast.imported'))
    } catch (err) {
      console.error('[Requisitions] import error', err)
      showToast('error', t('requisitions.toast.importError'))
    }
  }

  const handleLoadDefaults = () => {
    if (window.confirm(t('requisitions.loadDefaultsConfirm'))) {
      importRequisitions([...DEFAULT_HQ_REQUISITIONS, ...DEFAULT_SIPHON_REQUISITIONS], 'append')
      showToast('success', t('requisitions.toast.defaultsLoaded'))
    }
  }

  const handleFactoryReset = () => {
    if (window.confirm(t('requisitions.factoryResetConfirm'))) {
      importRequisitions([], 'overwrite')
      showToast('success', t('requisitions.toast.factoryReset'))
    }
  }

  const buttonClass = cn(
    'flex items-center gap-2 border px-3 py-2 text-[0.7rem] uppercase tracking-[0.2em] transition',
    isSquare ? 'rounded-none' : 'rounded-xl'
  )

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <header>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-agency-muted">
              {t('requisitions.subtitle')}
            </p>
            <h1 className="text-2xl font-semibold text-white">
              {t('requisitions.title')}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={cn(buttonClass, 'border-agency-amber/60 text-agency-amber hover:border-agency-amber')}
              onClick={handleLoadDefaults}
            >
              <Plus className="h-3 w-3" />
              {t('requisitions.loadDefaults')}
            </button>
            <button
              type="button"
              className={cn(buttonClass, 'border-agency-cyan/60 text-agency-cyan hover:border-agency-cyan')}
              onClick={() => setShowDataModal(true)}
            >
              <Database className="h-3 w-3" />
              {t('requisitions.dataCenter')}
            </button>
          </div>
        </div>
      </header>

      {/* 工具栏 */}
      <div className={cn(
        'flex flex-wrap items-center gap-4 border bg-agency-panel/60 p-3',
        isSquare ? 'rounded-none border-agency-border' : 'rounded-xl border-agency-border/50'
      )}>
        {/* 搜索 */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-agency-muted" />
          <input
            type="text"
            placeholder={t('requisitions.searchPlaceholder')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className={cn(
              'w-full border border-agency-border bg-agency-ink/60 py-2 pl-10 pr-3 text-sm text-agency-cyan placeholder:text-agency-muted',
              isSquare ? 'rounded-none' : 'rounded-xl'
            )}
          />
        </div>

        {/* 显示图片开关 */}
        <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-agency-muted cursor-pointer">
          <input
            type="checkbox"
            checked={showImages}
            onChange={(e) => setShowImages(e.target.checked)}
            className="accent-agency-cyan"
          />
          <Image className="h-4 w-4" />
          {t('requisitions.showImages')}
        </label>

        {/* 导出 */}
        <button
          type="button"
          className={cn(buttonClass, 'border-agency-border text-agency-muted hover:border-agency-cyan hover:text-agency-cyan')}
          onClick={handleExport}
        >
          <Download className="h-3 w-3" />
          {t('requisitions.export')}
        </button>
      </div>

      {/* 表单 */}
      <Panel data-requisition-form>
        <div className="mb-3 text-xs uppercase tracking-[0.3em] text-agency-muted">
          {editingId ? t('requisitions.editing') : t('requisitions.create')}
        </div>
        <RequisitionForm
          key={editingId || 'create'}
          initialData={editingItem}
          onSubmit={handleSubmit}
          onCancel={handleCancelEdit}
          isEditing={!!editingId}
        />
      </Panel>

      {/* 列表 */}
      <RequisitionList
        items={requisitions}
        editingId={editingId}
        showImage={showImages}
        searchText={searchText}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStar={toggleRequisitionStar}
        onReorder={reorderRequisitions}
      />

      {/* 数据中心模态框 */}
      {showDataModal && (
        <Portal>
          <div 
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDataModal(false)}
          >
            <div 
              className={cn(
                'w-full max-w-lg border border-agency-border bg-agency-panel p-6',
                isSquare ? 'rounded-none' : 'rounded-2xl'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4 text-lg font-bold text-white">{t('requisitions.dataCenter')}</h3>
              
              {/* 导出区域 */}
              <div className="mb-4 space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-agency-muted">
                  {t('requisitions.exportJson')}
                </label>
                <textarea
                  readOnly
                  value={JSON.stringify(requisitions)}
                  className={cn(
                    'h-20 w-full border border-agency-border bg-agency-ink/60 p-2 font-mono text-xs text-agency-cyan',
                    isSquare ? 'rounded-none' : 'rounded-lg'
                  )}
                />
                <button
                  type="button"
                  className={cn(buttonClass, 'w-full justify-center border-agency-cyan/60 text-agency-cyan hover:border-agency-cyan')}
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(requisitions))
                    showToast('success', t('requisitions.toast.copied'))
                  }}
                >
                  {t('requisitions.copyToClipboard')}
                </button>
              </div>

              {/* 导入区域 */}
              <div className="mb-4 space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-agency-muted">
                  {t('requisitions.importJson')}
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={t('requisitions.importPlaceholder')}
                  className={cn(
                    'h-20 w-full border border-agency-border bg-agency-ink/60 p-2 font-mono text-xs text-agency-cyan placeholder:text-agency-muted',
                    isSquare ? 'rounded-none' : 'rounded-lg'
                  )}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={cn(buttonClass, 'flex-1 justify-center border-agency-amber/60 text-agency-amber hover:border-agency-amber')}
                    onClick={() => handleImport('append')}
                    disabled={!importText}
                  >
                    <Upload className="h-3 w-3" />
                    {t('requisitions.importAppend')}
                  </button>
                  <button
                    type="button"
                    className={cn(buttonClass, 'flex-1 justify-center border-agency-magenta/60 text-agency-magenta hover:border-agency-magenta')}
                    onClick={() => handleImport('overwrite')}
                    disabled={!importText}
                  >
                    <Upload className="h-3 w-3" />
                    {t('requisitions.importOverwrite')}
                  </button>
                </div>
              </div>

              {/* 危险操作 */}
              <div className="border-t border-agency-border pt-4">
                <button
                  type="button"
                  className={cn(buttonClass, 'w-full justify-center border-agency-magenta/60 text-agency-magenta hover:border-agency-magenta')}
                  onClick={handleFactoryReset}
                >
                  <RotateCcw className="h-3 w-3" />
                  {t('requisitions.factoryReset')}
                </button>
              </div>

              {/* 关闭按钮 */}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className={cn(buttonClass, 'border-agency-border text-agency-muted hover:border-agency-cyan hover:text-agency-cyan')}
                  onClick={() => setShowDataModal(false)}
                >
                  {t('app.common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
