import { useState, useRef, type ChangeEvent } from 'react'
import { Github, Download, Upload, Monitor, Moon, Sun, Laptop } from 'lucide-react'
import { useThemeStore } from '@/stores/theme-store'
import { cn } from '@/lib/utils'

export function SettingsPage() {
  const themeMode = useThemeStore((state) => state.mode)
  const setThemeMode = useThemeStore((state) => state.setMode)
  const isWin98 = themeMode === 'win98'
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)

  const handleExportSettings = () => {
    const settings = {
      theme: themeMode,
      // Future settings can be added here
      version: '1.0.0'
    }
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const filename = `agency-settings-${Date.now()}.json`
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setImportMessage('设置已导出。')
  }

  const handleImportSettings = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const settings = JSON.parse(text)
        
        if (settings.theme) {
          setThemeMode(settings.theme)
        }
        
        setImportMessage('设置已导入。')
      } catch (error) {
        console.error('Failed to import settings', error)
        setImportMessage('导入失败：文件格式错误。')
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className={cn("text-2xl font-bold tracking-tight", isWin98 ? "font-mono" : "")}>系统设置</h1>
        <p className="text-agency-muted">配置 AgencyOS 的外观与行为。</p>
      </div>

      {/* Theme Settings */}
      <section className={cn(
        "space-y-4 border border-agency-border/60 p-6",
        isWin98 ? "bg-agency-ink" : "rounded-2xl bg-agency-ink/40"
      )}>
        <h2 className="text-lg font-semibold text-agency-cyan flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          界面主题
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <button
            onClick={() => setThemeMode('night')}
            className={cn(
              "flex flex-col items-center justify-center gap-3 border p-4 transition-all hover:border-agency-cyan hover:bg-agency-cyan/5",
              themeMode === 'night' 
                ? "border-agency-cyan bg-agency-cyan/10 text-agency-cyan" 
                : "border-agency-border text-agency-muted",
              isWin98 ? "rounded-none" : "rounded-xl"
            )}
          >
            <Moon className="h-6 w-6" />
            <span className="text-sm font-medium">夜间模式</span>
          </button>
          <button
            onClick={() => setThemeMode('day')}
            className={cn(
              "flex flex-col items-center justify-center gap-3 border p-4 transition-all hover:border-agency-cyan hover:bg-agency-cyan/5",
              themeMode === 'day' 
                ? "border-agency-cyan bg-agency-cyan/10 text-agency-cyan" 
                : "border-agency-border text-agency-muted",
              isWin98 ? "rounded-none" : "rounded-xl"
            )}
          >
            <Sun className="h-6 w-6" />
            <span className="text-sm font-medium">日间模式</span>
          </button>
          <button
            onClick={() => setThemeMode('win98')}
            className={cn(
              "flex flex-col items-center justify-center gap-3 border p-4 transition-all hover:border-agency-cyan hover:bg-agency-cyan/5",
              themeMode === 'win98' 
                ? "border-agency-cyan bg-agency-cyan/10 text-agency-cyan" 
                : "border-agency-border text-agency-muted",
              isWin98 ? "rounded-none" : "rounded-xl"
            )}
          >
            <Laptop className="h-6 w-6" />
            <span className="text-sm font-medium">Win98</span>
          </button>
        </div>
      </section>

      {/* Instructions */}
      <section className={cn(
        "space-y-4 border border-agency-border/60 p-6",
        isWin98 ? "bg-agency-ink" : "rounded-2xl bg-agency-ink/40"
      )}>
        <h2 className="text-lg font-semibold text-agency-cyan">使用说明</h2>
        <div className="space-y-4 text-sm text-agency-muted leading-relaxed">
          <p>
            <strong className="text-agency-cyan">AgencyOS</strong> 是专为桌面角色扮演游戏（TRPG）设计的战役管理工具。
            作为总经理（GM），你可以使用此工具追踪特工状态、任务进度以及异常体收容情况。
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="text-agency-cyan">仪表板</span>：概览当前战役的关键指标。
            </li>
            <li>
              <span className="text-agency-cyan">特工档案</span>：管理玩家角色的状态、伤害与压力。
            </li>
            <li>
              <span className="text-agency-cyan">任务控制</span>：追踪当前任务目标与完成度。
            </li>
            <li>
              <span className="text-agency-cyan">数据持久化</span>：所有战役数据自动保存在本地浏览器中。请定期导出快照以防数据丢失。
            </li>
          </ul>
        </div>
      </section>

      {/* Settings Persistence */}
      <section className={cn(
        "space-y-4 border border-agency-border/60 p-6",
        isWin98 ? "bg-agency-ink" : "rounded-2xl bg-agency-ink/40"
      )}>
        <h2 className="text-lg font-semibold text-agency-cyan">设置管理</h2>
        <p className="text-sm text-agency-muted">
          导入或导出您的个性化设置（如主题偏好）。此操作不会影响战役数据。
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleExportSettings}
            className={cn(
              "flex items-center gap-2 border border-agency-cyan px-4 py-2 text-sm text-agency-cyan transition-colors hover:bg-agency-cyan/10",
              isWin98 ? "rounded-none" : "rounded-lg"
            )}
          >
            <Download className="h-4 w-4" />
            导出设置
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex items-center gap-2 border border-agency-border px-4 py-2 text-sm text-agency-muted transition-colors hover:border-agency-cyan hover:text-agency-cyan",
              isWin98 ? "rounded-none" : "rounded-lg"
            )}
          >
            <Upload className="h-4 w-4" />
            导入设置
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportSettings}
          />
        </div>
        {importMessage && (
          <p className="text-xs text-agency-cyan animate-pulse">{importMessage}</p>
        )}
      </section>

      {/* Community */}
      <section className={cn(
        "space-y-4 border border-agency-border/60 p-6",
        isWin98 ? "bg-agency-ink" : "rounded-2xl bg-agency-ink/40"
      )}>
        <h2 className="text-lg font-semibold text-agency-cyan flex items-center gap-2">
          <Github className="h-5 w-5" />
          开源社区
        </h2>
        <p className="text-sm text-agency-muted">
          AgencyOS 是一个开源项目。欢迎各位总经理参与代码贡献，提交 Bug 反馈或功能建议。
        </p>
        <a
          href="https://github.com/shakugannosaints/AgencyOS"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-2 border border-agency-border px-4 py-2 text-sm text-agency-muted transition-colors hover:border-agency-cyan hover:text-agency-cyan",
            isWin98 ? "rounded-none" : "rounded-lg"
          )}
        >
          <Github className="h-4 w-4" />
          访问 GitHub 仓库
        </a>
      </section>
    </div>
  )
}
