import { X, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/theme-store'
import { useTrans } from '@/lib/i18n-utils'
import type { Requisition } from '@/lib/types'

interface RequisitionCardProps {
  item: Requisition
  isEditing?: boolean
  isSelected?: boolean
  showImage?: boolean
  draggable?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onToggleStar?: () => void
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  onDragEnd?: () => void
}

export function RequisitionCard({
  item,
  isEditing,
  isSelected,
  showImage = true,
  draggable = true,
  onEdit,
  onDelete,
  onToggleStar,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: RequisitionCardProps) {
  const t = useTrans()
  const themeMode = useThemeStore((state) => state.mode)
  const isSiphon = item.source === 'siphon'
  const isBranch = item.source === 'branch'
  
  // 货币名称
  const currencyName = isSiphon 
    ? t('requisitions.currency.reprimands')
    : t('requisitions.currency.awards')

  // 来源显示
  const sourceDisplay = getSourceDisplay(item, t)

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden transition-all duration-200',
        'border bg-agency-panel/90 backdrop-blur-sm',
        // 左边框颜色
        isSiphon 
          ? 'border-l-4 border-l-agency-cyan border-agency-cyan/30'
          : isBranch 
            ? 'border-l-4 border-l-agency-amber border-agency-border'
            : 'border-l-4 border-l-agency-magenta border-agency-border',
        // 圆角
        themeMode === 'win98' || themeMode === 'retro' ? 'rounded-none' : 'rounded-lg',
        // 状态样式
        isEditing && 'ring-2 ring-agency-amber',
        isSelected && 'ring-2 ring-agency-magenta',
        // 悬停效果
        'hover:-translate-y-0.5 hover:shadow-lg cursor-pointer'
      )}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={onEdit}
    >
      {/* 删除按钮 */}
      {onDelete && (
        <button
          type="button"
          className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-agency-ink text-agency-muted opacity-0 transition-opacity group-hover:opacity-100 hover:bg-agency-magenta hover:text-white"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* 顶部区域：图片和元信息 */}
      <div className={cn(
        'flex border-b border-agency-border/40',
        isSiphon ? 'bg-agency-cyan/5' : 'bg-agency-ink/30'
      )}>
        {/* 图片区域 */}
        {showImage && (
          <div className={cn(
            'flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden border-r border-agency-border/40',
            isSiphon ? 'bg-black/30' : 'bg-agency-ink/50'
          )}>
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <PlaceholderIcon isSiphon={isSiphon} />
            )}
          </div>
        )}

        {/* 元信息区域 */}
        <div className="flex flex-1 flex-col gap-1 p-3">
          {/* 头部：名称和星标 */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {draggable && (
                <GripVertical className="h-3 w-3 text-agency-muted opacity-0 group-hover:opacity-50 cursor-grab" />
              )}
              <span className={cn(
                'font-bold leading-tight',
                isSiphon ? 'text-agency-cyan' : 'text-white'
              )}>
                {item.name}
              </span>
              {item.isNew && (
                <span className="rounded bg-agency-amber px-1.5 py-0.5 text-[0.6rem] font-bold text-black">
                  NEW
                </span>
              )}
            </div>
            {onToggleStar && (
              <button
                type="button"
                className={cn(
                  'text-lg transition-colors',
                  item.starred ? 'text-agency-amber' : 'text-agency-border hover:text-agency-amber'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleStar()
                }}
              >
                ★
              </button>
            )}
          </div>

          {/* 来源标签 */}
          {sourceDisplay && (
            <span className={cn(
              'w-fit rounded px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider',
              isSiphon 
                ? 'bg-agency-cyan/20 text-agency-cyan'
                : 'bg-agency-border/50 text-agency-muted'
            )}>
              {sourceDisplay}
            </span>
          )}

          {/* 价格列表 */}
          <div className="mt-auto flex flex-col gap-1">
            {item.prices.map((price, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-between rounded px-2 py-1 text-[0.75rem] font-medium',
                  isSiphon
                    ? 'border border-agency-cyan/50 text-agency-cyan'
                    : 'bg-[#D92B3A] text-white' // 始终使用机构红
                )}
              >
                <span>{price.label}</span>
                <span className="mx-2 flex-1 border-b border-dashed border-current/30" />
                <span>
                  {price.cost} {isSiphon ? (
                    <span className="inline-block rotate-1 rounded bg-agency-cyan/20 px-1 py-0.5 font-bold text-agency-cyan">
                      {currencyName}
                    </span>
                  ) : currencyName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部区域：描述和标签 */}
      <div className="flex flex-1 flex-col p-3">
        <p className={cn(
          'whitespace-pre-wrap text-sm leading-relaxed',
          isSiphon ? 'text-agency-cyan/80' : 'text-agency-muted'
        )}>
          {item.description}
        </p>

        {/* 条件和购买者标签 */}
        {(item.condition || item.purchasedBy) && (
          <div className="mt-auto flex flex-col gap-1 pt-2">
            {item.condition && (
              <span className={cn(
                'w-fit rounded px-2 py-0.5 text-[0.75rem] font-medium',
                isSiphon
                  ? 'border border-agency-magenta/60 text-agency-magenta'
                  : 'bg-agency-magenta/10 text-agency-magenta'
              )}>
                {t('requisitions.card.condition')}: {item.condition}
              </span>
            )}
            {item.purchasedBy && (
              <span className={cn(
                'w-fit rounded border-l-2 px-2 py-0.5 text-[0.75rem] font-medium',
                isSiphon
                  ? 'border-l-agency-cyan bg-agency-cyan/10 text-white'
                  : 'border-l-agency-amber bg-agency-amber/10 text-agency-amber'
              )}>
                {t('requisitions.card.purchasedBy')}: {item.purchasedBy}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function PlaceholderIcon({ isSiphon }: { isSiphon: boolean }) {
  if (isSiphon) {
    // Siphon 眼睛图标
    return (
      <div className="relative h-12 w-12 rotate-[-45deg] rounded-[75%_15%] border-2 border-agency-cyan shadow-[0_0_10px_rgba(76,201,240,0.5)]">
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_white]" />
      </div>
    )
  }
  // 机构三角形图标 - 始终使用机构红 #D92B3A
  return (
    <div className="h-0 w-0 border-l-[24px] border-r-[24px] border-b-[40px] border-l-transparent border-r-transparent border-b-[#D92B3A]" />
  )
}

function getSourceDisplay(item: Requisition, t: (key: string) => string): string {
  switch (item.source) {
    case 'hq':
      return t('requisitions.source.hq')
    case 'branch':
      return item.branchName || t('requisitions.source.branch')
    case 'siphon':
      return t('requisitions.source.siphon')
    default:
      return ''
  }
}
