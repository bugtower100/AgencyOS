import { useState } from 'react'
import { WindowFrame } from '@/components/ui/window-frame'
import type { WindowManager } from '@/components/ui/use-window-manager'
import { useThemeStore } from '@/stores/theme-store'
import { cn } from '@/lib/utils'
import { Award, Plus, Minus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCampaignStore } from '@/stores/campaign-store'

interface CommendationEditorProps {
  isOpen: boolean
  onClose: () => void
  onMinimize?: () => void
  windowManager?: WindowManager
}

export function CommendationClicker({ isOpen, onClose, onMinimize, windowManager }: CommendationEditorProps) {
  const { t } = useTranslation()
  const isWin98 = useThemeStore((state) => state.mode === 'win98')
  
  // Get active agents from the campaign store
  const agents = useCampaignStore((state) => state.agents)
  const updateAgent = useCampaignStore((state) => state.updateAgent)
  
  // Filter for active agents only
  const activeAgents = agents.filter(agent => agent.status === 'active')

  // State for inline editing
  const [editingCell, setEditingCell] = useState<{ agentId: string; field: 'awardsDelta' | 'reprimandsDelta' } | null>(null)
  const [inputValue, setInputValue] = useState('')

  const handleDeltaChange = (agentId: string, field: 'awardsDelta' | 'reprimandsDelta', delta: number) => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return
    
    const currentValue = agent[field] ?? 0
    const newValue = Math.max(0, currentValue + delta)
    
    updateAgent(agentId, {
      codename: agent.codename,
      arcAnomaly: agent.arcAnomaly,
      arcReality: agent.arcReality,
      arcRole: agent.arcRole,
      qa: agent.qa,
      awards: agent.awards,
      reprimands: agent.reprimands,
      status: agent.status,
      claims: agent.claims,
      awardsDelta: field === 'awardsDelta' ? newValue : agent.awardsDelta,
      reprimandsDelta: field === 'reprimandsDelta' ? newValue : agent.reprimandsDelta,
    })
  }

  const handleSetValue = (agentId: string, field: 'awardsDelta' | 'reprimandsDelta', newValue: number) => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return
    
    const safeValue = Math.max(0, newValue)
    
    updateAgent(agentId, {
      codename: agent.codename,
      arcAnomaly: agent.arcAnomaly,
      arcReality: agent.arcReality,
      arcRole: agent.arcRole,
      qa: agent.qa,
      awards: agent.awards,
      reprimands: agent.reprimands,
      status: agent.status,
      claims: agent.claims,
      awardsDelta: field === 'awardsDelta' ? safeValue : agent.awardsDelta,
      reprimandsDelta: field === 'reprimandsDelta' ? safeValue : agent.reprimandsDelta,
    })
  }

  const startEditing = (agentId: string, field: 'awardsDelta' | 'reprimandsDelta', currentValue: number) => {
    setEditingCell({ agentId, field })
    setInputValue(String(currentValue))
  }

  const commitEdit = () => {
    if (editingCell) {
      const parsed = parseInt(inputValue, 10)
      if (!isNaN(parsed)) {
        handleSetValue(editingCell.agentId, editingCell.field, parsed)
      }
      setEditingCell(null)
    }
  }

  const cancelEdit = () => {
    setEditingCell(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  return (
    <WindowFrame
      title={t('desktop.commendation.title')}
      isOpen={isOpen}
      onClose={onClose}
      onMinimize={onMinimize}
      initialSize={{ width: 400, height: 350 }}
      windowId="commendation"
      windowManager={windowManager}
    >
      <div className={cn(
        "flex h-full flex-col p-4 gap-4 overflow-auto",
        isWin98 ? "bg-[#dfdfdf] text-black" : "bg-agency-ink/80 text-agency-cyan"
      )}>
        {/* Header */}
        <div className="flex items-center gap-2 pb-2 border-b border-current/20">
          <Award className="h-5 w-5 opacity-70" />
          <span className="text-sm font-bold">{t('desktop.commendation.editorTitle')}</span>
        </div>

        {/* Agent List */}
        {activeAgents.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm opacity-60">
            {t('desktop.commendation.noActiveAgents')}
          </div>
        ) : (
          <div className="flex-1 overflow-auto space-y-2">
            {/* Table Header */}
            <div className={cn(
              "grid grid-cols-[1fr_auto_auto] gap-2 px-2 py-1 text-xs font-bold opacity-70",
              isWin98 ? "" : "border-b border-agency-border"
            )}>
              <span>{t('desktop.commendation.agent')}</span>
              <span className="w-20 text-center">{t('agents.awardsDelta')}</span>
              <span className="w-20 text-center">{t('agents.reprimandsDelta')}</span>
            </div>
            
            {/* Agent Rows */}
            {activeAgents.map(agent => (
              <div 
                key={agent.id}
                className={cn(
                  "grid grid-cols-[1fr_auto_auto] gap-2 items-center px-2 py-1.5 rounded",
                  isWin98 ? "bg-white border border-[#808080]" : "bg-agency-panel/50 border border-agency-border/50"
                )}
              >
                <span className="text-sm font-medium truncate">{agent.codename}</span>
                
                {/* Awards Delta Controls */}
                <div className="flex items-center gap-1 w-20 justify-center">
                  <button
                    onClick={() => handleDeltaChange(agent.id, 'awardsDelta', -1)}
                    className={cn(
                      "w-5 h-5 flex items-center justify-center text-xs",
                      isWin98
                        ? "bg-[#c0c0c0] border border-t-white border-l-white border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white"
                        : "bg-agency-cyan/10 hover:bg-agency-cyan/20 rounded border border-agency-cyan/30"
                    )}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  {editingCell?.agentId === agent.id && editingCell?.field === 'awardsDelta' ? (
                    <input
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className={cn(
                        "w-8 text-center text-sm font-mono",
                        isWin98 
                          ? "bg-white border border-[#808080] text-black" 
                          : "bg-agency-ink border border-agency-cyan/50 text-agency-cyan"
                      )}
                    />
                  ) : (
                    <span 
                      className="w-6 text-center text-sm font-mono cursor-pointer hover:underline"
                      onClick={() => startEditing(agent.id, 'awardsDelta', agent.awardsDelta ?? 0)}
                      title={t('app.common.clickToEdit')}
                    >
                      {agent.awardsDelta ?? 0}
                    </span>
                  )}
                  <button
                    onClick={() => handleDeltaChange(agent.id, 'awardsDelta', 1)}
                    className={cn(
                      "w-5 h-5 flex items-center justify-center text-xs",
                      isWin98
                        ? "bg-[#c0c0c0] border border-t-white border-l-white border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white"
                        : "bg-agency-cyan/10 hover:bg-agency-cyan/20 rounded border border-agency-cyan/30"
                    )}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Reprimands Delta Controls */}
                <div className="flex items-center gap-1 w-20 justify-center">
                  <button
                    onClick={() => handleDeltaChange(agent.id, 'reprimandsDelta', -1)}
                    className={cn(
                      "w-5 h-5 flex items-center justify-center text-xs",
                      isWin98
                        ? "bg-[#c0c0c0] border border-t-white border-l-white border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white"
                        : "bg-agency-cyan/10 hover:bg-agency-cyan/20 rounded border border-agency-cyan/30"
                    )}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  {editingCell?.agentId === agent.id && editingCell?.field === 'reprimandsDelta' ? (
                    <input
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className={cn(
                        "w-8 text-center text-sm font-mono",
                        isWin98 
                          ? "bg-white border border-[#808080] text-black" 
                          : "bg-agency-ink border border-agency-cyan/50 text-agency-cyan"
                      )}
                    />
                  ) : (
                    <span 
                      className="w-6 text-center text-sm font-mono cursor-pointer hover:underline"
                      onClick={() => startEditing(agent.id, 'reprimandsDelta', agent.reprimandsDelta ?? 0)}
                      title={t('app.common.clickToEdit')}
                    >
                      {agent.reprimandsDelta ?? 0}
                    </span>
                  )}
                  <button
                    onClick={() => handleDeltaChange(agent.id, 'reprimandsDelta', 1)}
                    className={cn(
                      "w-5 h-5 flex items-center justify-center text-xs",
                      isWin98
                        ? "bg-[#c0c0c0] border border-t-white border-l-white border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white"
                        : "bg-agency-cyan/10 hover:bg-agency-cyan/20 rounded border border-agency-cyan/30"
                    )}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer hint */}
        <div className="text-xs opacity-50 text-center">
          {t('desktop.commendation.hint')}
        </div>
      </div>
    </WindowFrame>
  )
}
