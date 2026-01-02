import { useMemo } from 'react'
import { WindowFrame } from '@/components/ui/window-frame'
import type { WindowManager } from '@/components/ui/use-window-manager'
import { useThemeStore } from '@/stores/theme-store'
import { useCampaignStore } from '@/stores/campaign-store'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { Activity, Zap, AlertTriangle, Plus, Minus } from 'lucide-react'

interface ChaosControllerProps {
  isOpen: boolean
  onClose: () => void
  onMinimize?: () => void
  windowManager?: WindowManager
}

export function ChaosController({ isOpen, onClose, onMinimize, windowManager }: ChaosControllerProps) {
  const { t } = useTranslation()
  const isWin98 = useThemeStore((state) => state.mode === 'win98')
  
  const missions = useCampaignStore((state) => state.missions)
  const campaign = useCampaignStore((state) => state.campaign)
  const adjustMissionChaos = useCampaignStore((state) => state.adjustMissionChaos)
  const adjustMissionLooseEnds = useCampaignStore((state) => state.adjustMissionLooseEnds)
  const adjustMissionRealityRequestsFailed = useCampaignStore((state) => state.adjustMissionRealityRequestsFailed)

  // Find current active mission or the mission marked as nextMissionId
  const currentMission = useMemo(() => {
    // First try to find an active mission
    const activeMission = missions.find(m => m.status === 'active')
    if (activeMission) return activeMission
    
    // Then try nextMissionId from campaign
    if (campaign.nextMissionId) {
      const nextMission = missions.find(m => m.id === campaign.nextMissionId)
      if (nextMission) return nextMission
    }
    
    // Otherwise return the first non-archived mission
    return missions.find(m => m.status !== 'archived') ?? null
  }, [missions, campaign.nextMissionId])

  const handleAdjust = (type: 'chaos' | 'looseEnds' | 'realityFailed', delta: number) => {
    if (!currentMission) return
    
    const note = t('desktop.chaos.adjustNote')
    
    switch (type) {
      case 'chaos':
        adjustMissionChaos(currentMission.id, delta, note)
        break
      case 'looseEnds':
        adjustMissionLooseEnds(currentMission.id, delta, note)
        break
      case 'realityFailed':
        adjustMissionRealityRequestsFailed(currentMission.id, delta, note)
        break
    }
  }

  // Calculate total loose ends for weather warning
  const totalLooseEnds = useMemo(() => 
    missions.reduce((sum, m) => sum + (m.looseEnds ?? 0), 0), 
    [missions]
  )

  const getWeatherLevel = (looseEnds: number) => {
    if (looseEnds >= 77) return { level: 'W7', color: 'text-red-600', bg: 'bg-red-500/20' }
    if (looseEnds >= 66) return { level: '66', color: 'text-red-500', bg: 'bg-red-500/15' }
    if (looseEnds >= 55) return { level: '55', color: 'text-orange-500', bg: 'bg-orange-500/15' }
    if (looseEnds >= 44) return { level: '44', color: 'text-yellow-500', bg: 'bg-yellow-500/15' }
    if (looseEnds >= 33) return { level: '33', color: 'text-yellow-400', bg: 'bg-yellow-400/10' }
    if (looseEnds >= 22) return { level: '22', color: 'text-blue-400', bg: 'bg-blue-400/10' }
    if (looseEnds >= 11) return { level: '11', color: 'text-blue-300', bg: 'bg-blue-300/10' }
    return { level: '0', color: 'text-green-400', bg: 'bg-green-400/10' }
  }

  const weather = getWeatherLevel(totalLooseEnds)

  return (
    <WindowFrame
      title={t('desktop.chaos.title')}
      isOpen={isOpen}
      onClose={onClose}
      onMinimize={onMinimize}
      initialSize={{ width: 380, height: 320 }}
      windowId="chaos"
      windowManager={windowManager}
    >
      <div className={cn(
        "flex h-full flex-col p-3 gap-3",
        isWin98 ? "bg-[#dfdfdf] text-black" : "bg-agency-ink/80 text-agency-cyan"
      )}>
        {/* Current Mission Header */}
        <div className={cn(
          "flex items-center justify-between p-2 border",
          isWin98 ? "border-[#808080] bg-white" : "border-agency-cyan/30 bg-agency-ink/50"
        )}>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="text-xs font-bold uppercase">{t('desktop.chaos.currentMission')}</span>
          </div>
          <span className="text-xs font-mono truncate max-w-[150px]">
            {currentMission ? `${currentMission.code} · ${currentMission.name}` : t('desktop.chaos.noMission')}
          </span>
        </div>

        {currentMission ? (
          <>
            {/* Stat Controls */}
            <div className="flex-1 flex flex-col gap-2">
              {/* Chaos */}
              <StatRow
                label={t('app.common.chaos')}
                value={currentMission.chaos}
                onDecrease={() => handleAdjust('chaos', -1)}
                onIncrease={() => handleAdjust('chaos', 1)}
                icon={<Zap className="h-4 w-4" />}
                isWin98={isWin98}
                color="text-blue-500"
              />

              {/* Loose Ends */}
              <StatRow
                label={t('app.common.looseEnds')}
                value={currentMission.looseEnds}
                onDecrease={() => handleAdjust('looseEnds', -1)}
                onIncrease={() => handleAdjust('looseEnds', 1)}
                icon={<AlertTriangle className="h-4 w-4" />}
                isWin98={isWin98}
                color="text-purple-500"
              />

              {/* Reality Requests Failed */}
              <StatRow
                label={t('desktop.chaos.realityFailed')}
                value={currentMission.realityRequestsFailed ?? 0}
                onDecrease={() => handleAdjust('realityFailed', -1)}
                onIncrease={() => handleAdjust('realityFailed', 1)}
                icon={<Activity className="h-4 w-4" />}
                isWin98={isWin98}
                color="text-red-500"
              />
            </div>

            {/* Weather Warning */}
            <div className={cn(
              "flex items-center justify-between p-2 border text-xs",
              isWin98 ? "border-[#808080] bg-[#efefef]" : `border-agency-border/50 ${weather.bg}`
            )}>
              <span className="opacity-70">{t('app.common.weather')}</span>
              <div className="flex items-center gap-2">
                <span>{t('app.common.looseEnds')}: {totalLooseEnds}</span>
                <span className={cn("font-bold font-mono", weather.color)}>
                  [{weather.level}]
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs opacity-50">
            {t('desktop.chaos.noMissionHint')}
          </div>
        )}

        {/* Hint */}
        <div className="text-[10px] opacity-50 text-center">
          {t('desktop.chaos.hint')}
        </div>
      </div>
    </WindowFrame>
  )
}

interface StatRowProps {
  label: string
  value: number
  onDecrease: () => void
  onIncrease: () => void
  icon: React.ReactNode
  isWin98: boolean
  color: string
}

function StatRow({ label, value, onDecrease, onIncrease, icon, isWin98, color }: StatRowProps) {
  return (
    <div className={cn(
      "flex items-center justify-between p-2 border",
      isWin98 ? "border-[#808080] bg-white" : "border-agency-border/50 bg-agency-ink/30"
    )}>
      <div className="flex items-center gap-2">
        <span className={color}>{icon}</span>
        <span className="text-xs font-bold uppercase">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onDecrease}
          className={cn(
            "w-6 h-6 flex items-center justify-center",
            isWin98
              ? "bg-[#c0c0c0] border border-t-white border-l-white border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white"
              : "bg-agency-cyan/10 hover:bg-agency-cyan/20 rounded border border-agency-cyan/30"
          )}
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className={cn("w-8 text-center font-mono font-bold", color)}>
          {value}
        </span>
        <button
          onClick={onIncrease}
          className={cn(
            "w-6 h-6 flex items-center justify-center",
            isWin98
              ? "bg-[#c0c0c0] border border-t-white border-l-white border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white"
              : "bg-agency-cyan/10 hover:bg-agency-cyan/20 rounded border border-agency-cyan/30"
          )}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
