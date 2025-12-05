import { useState, useEffect, useMemo } from 'react'
import { WindowFrame } from '@/components/ui/window-frame'
import { useThemeStore } from '@/stores/theme-store'
import { useCampaignStore } from '@/stores/campaign-store'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { Activity, Zap } from 'lucide-react'

interface ChaosControllerProps {
  isOpen: boolean
  onClose: () => void
}

export function ChaosController({ isOpen, onClose }: ChaosControllerProps) {
  const { t } = useTranslation()
  const isWin98 = useThemeStore((state) => state.mode === 'win98')
  const missions = useCampaignStore((state) => state.missions)
  const looseEnds = useMemo(() => missions.reduce((sum, m) => sum + (m.looseEnds ?? 0), 0), [missions])

  // Map looseEnds to a base stability value: looseEnds = 0 -> 100, looseEnds >= 77 -> 0
  const baseStability = useMemo(() => Math.max(0, 100 * (1 - looseEnds / 77)), [looseEnds])

  // Jitter range around base stability (fluctuation amplitude)
  const jitter = Math.min(12, Math.max(4, Math.round(baseStability * 0.08)))

  const [stability, setStability] = useState(() => {
    if (looseEnds >= 77) return 0
    // initialize near base
    return Math.max(0, Math.min(100, baseStability + (Math.random() - 0.5) * jitter))
  })
  const [isStabilizing, setIsStabilizing] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => {
      setStability(prev => {
        // If catastrophe threshold reached, always zero
        if (looseEnds >= 77) return 0

        // Determine target based on whether we are stabilizing
        const highTarget = Math.min(100, baseStability + jitter)
        const lowTarget = Math.max(0, baseStability - jitter)
        const target = isStabilizing ? highTarget : (lowTarget + Math.random() * (highTarget - lowTarget))

        // Smooth transition: step towards target a little each tick
        const smoothing = 0.25
        const next = prev + (target - prev) * smoothing
        return Math.max(0, Math.min(100, next))
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isOpen, baseStability, looseEnds, isStabilizing, jitter])

  const handleStabilize = () => {
    if (looseEnds >= 77) return // impossible to stabilize
    setIsStabilizing(true)
    // Immediately boost stability to upper part of range
    const boosted = Math.min(100, baseStability + jitter)
    setStability(boosted)
    setTimeout(() => {
      setIsStabilizing(false)
      // leave interval to return to normal fluctuations
    }, 2000)
  }

  return (
    <WindowFrame
      title={t('desktop.chaos.title')}
      isOpen={isOpen}
      onClose={onClose}
      initialSize={{ width: 400, height: 300 }}
    >
      <div className={cn(
        "flex h-full flex-col p-4 gap-4",
        isWin98 ? "bg-[#dfdfdf] text-black" : "bg-agency-ink/80 text-agency-cyan"
      )}>
        <div className={cn(
          "flex items-center justify-between p-2 border",
          isWin98 ? "border-[#808080] bg-white" : "border-agency-cyan/30 bg-agency-ink/50"
        )}>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 animate-pulse" />
            <span className="text-xs font-bold uppercase">{t('desktop.chaos.status')}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn(
            "font-mono text-sm font-bold",
            stability < 50 ? "text-blue-500" : "text-red-500"
          )}>
            {stability.toFixed(2)}%
          </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-6">
            {/* Visualizers */}
            <div className="flex justify-around">
                <div className="flex flex-col items-center gap-2">
                    <div className={cn("h-16 w-4 rounded-full overflow-hidden relative", isWin98 ? "bg-gray-300" : "bg-agency-ink")}>
                        <div 
                            className={cn("absolute bottom-0 w-full transition-all duration-300", isWin98 ? "bg-red-600" : "bg-agency-cyan")}
                            style={{ height: `${stability}%` }}
                        />
                    </div>
                    <span className="text-[10px] uppercase">Stable</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className={cn("h-16 w-4 rounded-full overflow-hidden relative", isWin98 ? "bg-gray-300" : "bg-agency-ink")}>
                        <div 
                            className={cn("absolute bottom-0 w-full transition-all duration-300", isWin98 ? "bg-blue-600" : "bg-agency-magenta")}
                            style={{ height: `${Math.max(0, 100 - stability)}%` }}
                        />
                    </div>
                    <span className="text-[10px] uppercase">Disintegrative</span>
                </div>
            </div>
        </div>

        <button
          onClick={handleStabilize}
            disabled={isStabilizing || looseEnds >= 77}
          className={cn(
            "w-full py-2 px-4 text-xs font-bold uppercase transition-all flex items-center justify-center gap-2",
            isWin98
              ? "border-2 border-b-[#404040] border-l-[#ffffff] border-r-[#404040] border-t-[#ffffff] bg-[#c0c0c0] active:border-b-[#ffffff] active:border-l-[#404040] active:border-r-[#ffffff] active:border-t-[#404040]"
              : "border border-agency-cyan bg-agency-cyan/10 text-agency-cyan hover:bg-agency-cyan/20"
          )}
        >
          <Zap className={cn("h-3 w-3", isStabilizing && "animate-spin")} />
          {isStabilizing ? t('desktop.chaos.stabilizing') : t('desktop.chaos.stabilize')}
        </button>
      </div>
    </WindowFrame>
  )
}
