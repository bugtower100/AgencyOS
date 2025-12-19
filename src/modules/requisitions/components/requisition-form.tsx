import { useState, useRef } from 'react'
import { Plus, X, Image as ImageIcon, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTrans, useCommonTranslations } from '@/lib/i18n-utils'
import { useThemeStore } from '@/stores/theme-store'
import type { Requisition, RequisitionPrice, RequisitionSource } from '@/lib/types'

export interface RequisitionFormData {
  name: string
  source: RequisitionSource
  branchName?: string
  prices: RequisitionPrice[]
  description: string
  condition?: string
  purchasedBy?: string
  image?: string
  isNew?: boolean
}

interface RequisitionFormProps {
  initialData?: Requisition
  onSubmit: (data: RequisitionFormData) => void
  onCancel?: () => void
  isEditing?: boolean
  /** 当前模式：agency 或 siphon */
  mode?: 'agency' | 'siphon'
}

export function RequisitionForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  mode = 'agency',
}: RequisitionFormProps) {
  const t = useTrans()
  const { cancel, submit, update } = useCommonTranslations()
  const themeMode = useThemeStore((state) => state.mode)
  const isSquare = themeMode === 'win98' || themeMode === 'retro'
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<RequisitionFormData>({
    name: initialData?.name ?? '',
    source: initialData?.source ?? (mode === 'siphon' ? 'siphon' : 'hq'),
    branchName: initialData?.branchName ?? '',
    prices: initialData?.prices ?? [{ label: '', cost: 0 }],
    description: initialData?.description ?? '',
    condition: initialData?.condition ?? '',
    purchasedBy: initialData?.purchasedBy ?? '',
    image: initialData?.image ?? '',
    isNew: initialData?.isNew ?? false,
  })

  const isSiphon = formData.source === 'siphon'
  const currencyName = isSiphon
    ? t('requisitions.currency.reprimands')
    : t('requisitions.currency.awards')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    onSubmit(formData)
    if (!isEditing) {
      // 重置表单
      setFormData({
        name: '',
        source: mode === 'siphon' ? 'siphon' : 'hq',
        branchName: '',
        prices: [{ label: '', cost: 0 }],
        description: '',
        condition: '',
        purchasedBy: '',
        image: '',
        isNew: false,
      })
    }
  }

  const addPrice = () => {
    setFormData((prev) => ({
      ...prev,
      prices: [...prev.prices, { label: '', cost: 0 }],
    }))
  }

  const removePrice = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      prices: prev.prices.filter((_, i) => i !== index),
    }))
  }

  const updatePrice = (index: number, field: 'label' | 'cost', value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      prices: prev.prices.map((p, i) =>
        i === index ? { ...p, [field]: field === 'cost' ? Number(value) : value } : p
      ),
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new window.Image()
      img.src = event.target?.result as string
      img.onload = () => {
        // 裁剪为正方形并压缩
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const size = Math.min(img.width, img.height)
        const startX = (img.width - size) / 2
        const startY = (img.height - size) / 2
        const finalSize = Math.min(size, 400)
        
        canvas.width = finalSize
        canvas.height = finalSize
        ctx.drawImage(img, startX, startY, size, size, 0, 0, finalSize, finalSize)
        
        const base64 = canvas.toDataURL('image/jpeg', 0.8)
        setFormData((prev) => ({ ...prev, image: base64 }))
      }
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const inputClass = cn(
    'w-full border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan',
    isSquare ? 'rounded-none' : 'rounded-xl',
    'border-agency-border focus:border-agency-cyan focus:outline-none'
  )

  const labelClass = 'space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted'

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-4">
      {/* 名称 */}
      <label className={cn(labelClass, 'md:col-span-2')}>
        <span className="flex items-center gap-2">
          {t('requisitions.form.name')}
          <label className="flex items-center gap-1 text-[0.6rem] normal-case tracking-normal">
            <input
              type="checkbox"
              checked={formData.isNew}
              onChange={(e) => setFormData((prev) => ({ ...prev, isNew: e.target.checked }))}
            />
            NEW
          </label>
        </span>
        <input
          type="text"
          className={inputClass}
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder={t('requisitions.form.namePlaceholder')}
        />
      </label>

      {/* 来源 */}
      <label className={labelClass}>
        {t('requisitions.form.source')}
        <select
          className={inputClass}
          value={formData.source}
          onChange={(e) => setFormData((prev) => ({ ...prev, source: e.target.value as RequisitionSource }))}
          disabled={mode === 'siphon'}
        >
          <option value="hq">{t('requisitions.source.hq')}</option>
          <option value="branch">{t('requisitions.source.branch')}</option>
          <option value="siphon">{t('requisitions.source.siphon')}</option>
        </select>
      </label>

      {/* 分部名称（仅当来源为 branch 时显示） */}
      {formData.source === 'branch' && (
        <label className={labelClass}>
          {t('requisitions.form.branchName')}
          <input
            type="text"
            className={inputClass}
            value={formData.branchName}
            onChange={(e) => setFormData((prev) => ({ ...prev, branchName: e.target.value }))}
            placeholder={t('requisitions.form.branchNamePlaceholder')}
          />
        </label>
      )}

      {/* 价格列表 */}
      <div className={cn(labelClass, 'md:col-span-2')}>
        <span className="flex items-center justify-between">
          {t('requisitions.form.prices')} ({currencyName})
          <button
            type="button"
            className="flex items-center gap-1 border border-agency-cyan/60 px-2 py-1 text-[0.6rem] text-agency-cyan hover:border-agency-cyan"
            onClick={addPrice}
          >
            <Plus className="h-3 w-3" />
            {t('requisitions.form.addPrice')}
          </button>
        </span>
        <div className="space-y-2">
          {formData.prices.map((price, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                className={cn(inputClass, 'flex-[2]')}
                value={price.label}
                onChange={(e) => updatePrice(index, 'label', e.target.value)}
                placeholder={t('requisitions.form.priceLabelPlaceholder')}
              />
              <input
                type="number"
                className={cn(inputClass, 'w-20')}
                value={price.cost}
                onChange={(e) => updatePrice(index, 'cost', e.target.value)}
                min={0}
              />
              {formData.prices.length > 1 && (
                <button
                  type="button"
                  className="text-agency-muted hover:text-agency-magenta"
                  onClick={() => removePrice(index)}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 图片上传 */}
      <div className={cn(labelClass, 'md:col-span-2')}>
        {t('requisitions.form.image')}
        <div className="flex items-start gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            className={cn(
              'flex items-center gap-2 border border-agency-border px-3 py-2 text-agency-muted hover:border-agency-cyan hover:text-agency-cyan',
              isSquare ? 'rounded-none' : 'rounded-xl'
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" />
            {t('requisitions.form.uploadImage')}
          </button>
          {formData.image && (
            <div className="relative">
              <img
                src={formData.image}
                alt="Preview"
                className={cn(
                  'h-16 w-16 object-cover border border-agency-border',
                  isSquare ? 'rounded-none' : 'rounded-lg'
                )}
              />
              <button
                type="button"
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                onClick={removeImage}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 描述 */}
      <label className={cn(labelClass, 'md:col-span-4')}>
        {t('requisitions.form.description')}
        <textarea
          className={cn(inputClass, 'min-h-[80px] resize-y')}
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder={t('requisitions.form.descriptionPlaceholder')}
        />
      </label>

      {/* 条件 */}
      <label className={cn(labelClass, 'md:col-span-2')}>
        {t('requisitions.form.condition')}
        <input
          type="text"
          className={inputClass}
          value={formData.condition}
          onChange={(e) => setFormData((prev) => ({ ...prev, condition: e.target.value }))}
          placeholder={t('requisitions.form.conditionPlaceholder')}
        />
      </label>

      {/* 已购买特工 */}
      <label className={cn(labelClass, 'md:col-span-2')}>
        {t('requisitions.form.purchasedBy')}
        <input
          type="text"
          className={inputClass}
          value={formData.purchasedBy}
          onChange={(e) => setFormData((prev) => ({ ...prev, purchasedBy: e.target.value }))}
          placeholder={t('requisitions.form.purchasedByPlaceholder')}
        />
      </label>

      {/* 按钮 */}
      <div className="flex items-center justify-end gap-3 md:col-span-4">
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              'border border-agency-border px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-muted hover:border-agency-muted',
              isSquare ? 'rounded-none' : 'rounded-2xl'
            )}
          >
            {cancel}
          </button>
        )}
        <button
          type="submit"
          disabled={!formData.name.trim()}
          className={cn(
            'border px-4 py-2 text-xs uppercase tracking-[0.3em] transition',
            isSquare ? 'rounded-none' : 'rounded-2xl',
            formData.name.trim()
              ? 'border-agency-cyan/60 text-agency-cyan hover:border-agency-cyan'
              : 'border-agency-border text-agency-border cursor-not-allowed'
          )}
        >
          {isEditing ? update : submit}
        </button>
      </div>
    </form>
  )
}
