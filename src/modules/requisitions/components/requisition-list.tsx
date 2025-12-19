import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useTrans } from '@/lib/i18n-utils'
import { useThemeStore } from '@/stores/theme-store'
import type { Requisition } from '@/lib/types'
import { RequisitionCard } from './requisition-card'

interface RequisitionListProps {
  items: Requisition[]
  editingId: string | null
  showImage?: boolean
  searchText?: string
  mode?: 'agency' | 'siphon'
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onToggleStar: (id: string) => void
  onReorder: (sourceId: string, targetId: string) => void
}

export function RequisitionList({
  items,
  editingId,
  showImage = true,
  searchText = '',
  mode = 'agency',
  onEdit,
  onDelete,
  onToggleStar,
  onReorder,
}: RequisitionListProps) {
  const t = useTrans()
  const themeMode = useThemeStore((state) => state.mode)
  const isSquare = themeMode === 'win98' || themeMode === 'retro'
  
  const [dragSourceId, setDragSourceId] = useState<string | null>(null)

  // 过滤搜索
  const filteredItems = items.filter((item) => {
    if (!searchText) return true
    const search = searchText.toLowerCase()
    return (
      item.name.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search) ||
      item.condition?.toLowerCase().includes(search) ||
      item.purchasedBy?.toLowerCase().includes(search) ||
      item.branchName?.toLowerCase().includes(search)
    )
  })

  // 按来源分类
  const hqItems = filteredItems.filter((item) => item.source === 'hq')
  const branchItems = filteredItems.filter((item) => item.source === 'branch')
  const siphonItems = filteredItems.filter((item) => item.source === 'siphon')

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragSourceId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (dragSourceId && dragSourceId !== targetId) {
      onReorder(dragSourceId, targetId)
    }
    setDragSourceId(null)
  }

  const handleDragEnd = () => {
    setDragSourceId(null)
  }

  // Siphon 模式：单一网格
  if (mode === 'siphon') {
    return (
      <div className="space-y-4">
        <SectionHeader 
          title={t('requisitions.sections.siphon')} 
          count={siphonItems.length}
          color="cyan"
          isSquare={isSquare}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {siphonItems.map((item) => (
            <RequisitionCard
              key={item.id}
              item={item}
              isEditing={editingId === item.id}
              showImage={showImage}
              onEdit={() => onEdit(item.id)}
              onDelete={() => onDelete(item.id)}
              onToggleStar={() => onToggleStar(item.id)}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item.id)}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
        {siphonItems.length === 0 && (
          <EmptyState message={t('requisitions.empty')} />
        )}
      </div>
    )
  }

  // Agency 模式：分栏展示
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* 总部申领物 */}
      <div className="space-y-4">
        <SectionHeader 
          title={t('requisitions.sections.hq')} 
          count={hqItems.length}
          color="magenta"
          isSquare={isSquare}
        />
        <div className="space-y-4">
          {hqItems.map((item) => (
            <RequisitionCard
              key={item.id}
              item={item}
              isEditing={editingId === item.id}
              showImage={showImage}
              onEdit={() => onEdit(item.id)}
              onDelete={() => onDelete(item.id)}
              onToggleStar={() => onToggleStar(item.id)}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item.id)}
              onDragEnd={handleDragEnd}
            />
          ))}
          {hqItems.length === 0 && (
            <EmptyState message={t('requisitions.emptyHq')} />
          )}
        </div>
      </div>

      {/* 分部申领物 */}
      <div className="space-y-4">
        <SectionHeader 
          title={t('requisitions.sections.branch')} 
          count={branchItems.length}
          color="amber"
          isSquare={isSquare}
        />
        <div className="space-y-4">
          {branchItems.map((item) => (
            <RequisitionCard
              key={item.id}
              item={item}
              isEditing={editingId === item.id}
              showImage={showImage}
              onEdit={() => onEdit(item.id)}
              onDelete={() => onDelete(item.id)}
              onToggleStar={() => onToggleStar(item.id)}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item.id)}
              onDragEnd={handleDragEnd}
            />
          ))}
          {branchItems.length === 0 && (
            <EmptyState message={t('requisitions.emptyBranch')} />
          )}
        </div>
      </div>
    </div>
  )
}

interface SectionHeaderProps {
  title: string
  count: number
  color: 'magenta' | 'amber' | 'cyan'
  isSquare?: boolean
}

function SectionHeader({ title, count, color }: SectionHeaderProps) {
  const colorClasses = {
    magenta: 'border-agency-magenta text-agency-magenta',
    amber: 'border-agency-amber text-agency-amber',
    cyan: 'border-agency-cyan text-agency-cyan',
  }

  const iconColors = {
    magenta: 'border-b-agency-magenta',
    amber: 'border-b-agency-amber',
    cyan: 'border-b-agency-cyan',
  }

  return (
    <div className={cn(
      'flex items-center gap-3 border-b-4 pb-2 text-lg font-bold',
      colorClasses[color]
    )}>
      {/* 三角形图标 */}
      <div className={cn(
        'h-0 w-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent',
        iconColors[color]
      )} />
      <span>{title}</span>
      <span className="text-sm font-normal text-agency-muted">({count})</span>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-agency-border/50 text-sm text-agency-muted">
      {message}
    </div>
  )
}
