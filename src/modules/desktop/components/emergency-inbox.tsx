import { useState, useEffect } from 'react'
import { WindowFrame } from '@/components/ui/window-frame'
import type { WindowManager } from '@/components/ui/use-window-manager'
import { useThemeStore } from '@/stores/theme-store'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { Mail, Plus, Trash2, Edit3, X, Check, AlertTriangle, FileWarning, Send, User } from 'lucide-react'

interface CustomMail {
  id: string
  subject: string
  from: string
  to: string
  date: string
  body: string
  icon: 'mail' | 'alert' | 'warning'
  isRead: boolean
}

interface EmergencyInboxProps {
  isOpen: boolean
  onClose: () => void
  onMinimize?: () => void
  windowManager?: WindowManager
}

const STORAGE_KEY = 'agency-emergency-mails'

const defaultMails: CustomMail[] = [
  {
    id: '1',
    subject: 'WARNING: CONTAINMENT BREACH',
    from: 'CENTRAL_COMMAND',
    to: 'ALL_PERSONNEL',
    date: 'xxxx-05-12',
    body: 'Containment breach detected in Sector [DATA EXPUNGED].\n\nAll personnel must proceed to Shelter [REDACTED] immediately.\n\nThis is not a drill.\nRepeat, this is not a drill.',
    icon: 'alert',
    isRead: false
  },
  {
    id: '2',
    subject: 'RE: Friday Frozen Yogurt Party',
    from: 'HR_DEPT',
    to: 'ALL_STAFF',
    date: 'xxxx-05-13',
    body: 'To All Staff:\n\nDue to the accidental escape of [REDACTED], this Friday\'s frozen yogurt party is cancelled.\n\nAlso, if you see any talking frozen yogurt, DO NOT CONSUME and report immediately.',
    icon: 'mail',
    isRead: true
  },
  {
    id: '3',
    subject: 'DO NOT LOOK AT THE MOON',
    from: 'UNKNOWN',
    to: '[RECIPIENT EXPUNGED]',
    date: '????-??-??',
    body: 'DO NOT LOOK AT THE MOON.\nDO NOT LOOK AT THE MOON.\nDO NOT LOOK AT THE MOON.\nDO NOT LOOK AT THE MOON.\n[SYSTEM INTERCEPT: ANOMALY HAZARD]',
    icon: 'warning',
    isRead: false
  }
]

export function EmergencyInbox({ isOpen, onClose, onMinimize, windowManager }: EmergencyInboxProps) {
  const { t } = useTranslation()
  const isWin98 = useThemeStore((state) => state.mode === 'win98')
  const [mails, setMails] = useState<CustomMail[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : defaultMails
    } catch {
      return defaultMails
    }
  })
  const [selectedMailId, setSelectedMailId] = useState<string | null>(null)
  const [editingMailId, setEditingMailId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<CustomMail>>({})

  // Persist mails to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mails))
  }, [mails])

  const selectedMail = mails.find(m => m.id === selectedMailId)

  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case 'alert': return AlertTriangle
      case 'warning': return FileWarning
      default: return Mail
    }
  }

  const handleSelectMail = (id: string) => {
    setSelectedMailId(id)
    setEditingMailId(null)
    // Mark as read
    setMails(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m))
  }

  const handleAddMail = () => {
    const newMail: CustomMail = {
      id: Date.now().toString(),
      subject: t('desktop.emergency.newMail.subject'),
      from: 'SENDER',
      to: 'RECIPIENT',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '-'),
      body: t('desktop.emergency.newMail.body'),
      icon: 'mail',
      isRead: false
    }
    setMails(prev => [newMail, ...prev])
    setSelectedMailId(newMail.id)
    setEditingMailId(newMail.id)
    setEditForm(newMail)
  }

  const handleDeleteMail = (id: string) => {
    setMails(prev => prev.filter(m => m.id !== id))
    if (selectedMailId === id) {
      setSelectedMailId(null)
    }
    setEditingMailId(null)
  }

  const handleEditMail = (mail: CustomMail) => {
    setEditingMailId(mail.id)
    setEditForm({ ...mail })
  }

  const handleSaveEdit = () => {
    if (!editingMailId || !editForm) return
    setMails(prev => prev.map(m => 
      m.id === editingMailId 
        ? { ...m, ...editForm } as CustomMail
        : m
    ))
    setEditingMailId(null)
    setEditForm({})
  }

  const handleCancelEdit = () => {
    setEditingMailId(null)
    setEditForm({})
  }

  const handleResetToDefaults = () => {
    setMails(defaultMails)
    setSelectedMailId(null)
    setEditingMailId(null)
  }

  return (
    <WindowFrame
      title={t('desktop.emergency.title')}
      isOpen={isOpen}
      onClose={onClose}
      onMinimize={onMinimize}
      initialSize={{ width: 700, height: 500 }}
      windowId="emergency"
      windowManager={windowManager}
    >
      <div className={cn(
        "flex h-full flex-col",
        isWin98 ? "bg-[#dfdfdf] text-black" : "bg-agency-ink/80 text-agency-cyan"
      )}>
        {/* Toolbar */}
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 border-b",
          isWin98 ? "border-[#808080] bg-[#c0c0c0]" : "border-agency-border bg-agency-ink/50"
        )}>
          <button
            onClick={handleAddMail}
            className={cn(
              "flex items-center gap-1 px-2 py-1 text-xs",
              isWin98
                ? "border border-t-white border-l-white border-b-[#404040] border-r-[#404040] bg-[#c0c0c0] hover:bg-[#d0d0d0]"
                : "border border-agency-cyan/50 hover:bg-agency-cyan/10 rounded"
            )}
            title={t('desktop.emergency.addMail')}
          >
            <Plus className="h-3 w-3" />
            <span>{t('desktop.emergency.addMail')}</span>
          </button>
          <button
            onClick={handleResetToDefaults}
            className={cn(
              "flex items-center gap-1 px-2 py-1 text-xs ml-auto",
              isWin98
                ? "border border-t-white border-l-white border-b-[#404040] border-r-[#404040] bg-[#c0c0c0] hover:bg-[#d0d0d0]"
                : "border border-agency-cyan/50 hover:bg-agency-cyan/10 rounded"
            )}
            title={t('desktop.emergency.resetDefaults')}
          >
            {t('desktop.emergency.resetDefaults')}
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Mail List */}
          <div className={cn(
            "w-1/3 border-r flex flex-col overflow-auto",
            isWin98 ? "border-[#808080]" : "border-agency-border"
          )}>
            {mails.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs opacity-50 p-4">
                {t('desktop.emergency.noMails')}
              </div>
            ) : (
              mails.map((mail) => {
                const IconComponent = getIconComponent(mail.icon)
                const isSelected = selectedMailId === mail.id
                return (
                  <div
                    key={mail.id}
                    onClick={() => handleSelectMail(mail.id)}
                    className={cn(
                      "flex flex-col gap-1 p-2 text-left text-xs border-b transition-colors cursor-pointer group",
                      isWin98 
                        ? "border-[#808080]" 
                        : "border-agency-border hover:bg-agency-cyan/10",
                      !isWin98 && isSelected && "bg-agency-cyan/20",
                      !mail.isRead && "font-bold"
                    )}
                    style={isWin98 ? {
                      backgroundColor: isSelected ? '#000080' : undefined,
                      color: isSelected ? '#ffffff' : undefined,
                    } : undefined}
                    onMouseEnter={(e) => {
                      if (isWin98 && !isSelected) {
                        e.currentTarget.style.backgroundColor = '#000080'
                        e.currentTarget.style.color = '#ffffff'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isWin98 && !isSelected) {
                        e.currentTarget.style.backgroundColor = ''
                        e.currentTarget.style.color = ''
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate flex-1">{mail.subject}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteMail(mail.id)
                        }}
                        className={cn(
                          "opacity-0 group-hover:opacity-100 p-0.5 transition-opacity",
                          isWin98 ? "hover:bg-red-500" : "hover:text-red-400"
                        )}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex justify-between opacity-70 text-[10px]">
                      <span className="truncate">{mail.from}</span>
                      <span>{mail.date}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Mail Content / Editor */}
          <div className="flex-1 flex flex-col min-h-0 overflow-auto">
            {selectedMail ? (
              editingMailId === selectedMail.id ? (
                /* Edit Mode */
                <div className="flex flex-col h-full p-3 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase opacity-70">{t('desktop.emergency.editMode')}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={handleSaveEdit}
                        className={cn(
                          "p-1",
                          isWin98
                            ? "border border-t-white border-l-white border-b-[#404040] border-r-[#404040] bg-[#c0c0c0]"
                            : "border border-green-500/50 text-green-400 hover:bg-green-500/10 rounded"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className={cn(
                          "p-1",
                          isWin98
                            ? "border border-t-white border-l-white border-b-[#404040] border-r-[#404040] bg-[#c0c0c0]"
                            : "border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded"
                        )}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Edit Form */}
                  <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1.5 text-xs">
                    <label className="opacity-70 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {t('desktop.emergency.form.subject')}
                    </label>
                    <input
                      value={editForm.subject ?? ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                      className={cn(
                        "px-1.5 py-0.5 text-xs",
                        isWin98
                          ? "border border-[#808080] shadow-[inset_1px_1px_#000000] bg-white"
                          : "border border-agency-border bg-agency-ink/50 rounded"
                      )}
                    />

                    <label className="opacity-70 flex items-center gap-1">
                      <Send className="h-3 w-3" />
                      {t('desktop.emergency.form.from')}
                    </label>
                    <input
                      value={editForm.from ?? ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, from: e.target.value }))}
                      className={cn(
                        "px-1.5 py-0.5 text-xs",
                        isWin98
                          ? "border border-[#808080] shadow-[inset_1px_1px_#000000] bg-white"
                          : "border border-agency-border bg-agency-ink/50 rounded"
                      )}
                    />

                    <label className="opacity-70 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {t('desktop.emergency.form.to')}
                    </label>
                    <input
                      value={editForm.to ?? ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, to: e.target.value }))}
                      className={cn(
                        "px-1.5 py-0.5 text-xs",
                        isWin98
                          ? "border border-[#808080] shadow-[inset_1px_1px_#000000] bg-white"
                          : "border border-agency-border bg-agency-ink/50 rounded"
                      )}
                    />

                    <label className="opacity-70">{t('desktop.emergency.form.date')}</label>
                    <input
                      value={editForm.date ?? ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                      className={cn(
                        "px-1.5 py-0.5 text-xs",
                        isWin98
                          ? "border border-[#808080] shadow-[inset_1px_1px_#000000] bg-white"
                          : "border border-agency-border bg-agency-ink/50 rounded"
                      )}
                    />

                    <label className="opacity-70">{t('desktop.emergency.form.icon')}</label>
                    <select
                      value={editForm.icon ?? 'mail'}
                      onChange={(e) => setEditForm(prev => ({ ...prev, icon: e.target.value as CustomMail['icon'] }))}
                      className={cn(
                        "px-1.5 py-0.5 text-xs",
                        isWin98
                          ? "border border-[#808080] shadow-[inset_1px_1px_#000000] bg-white"
                          : "border border-agency-border bg-agency-ink/50 rounded"
                      )}
                    >
                      <option value="mail">{t('desktop.emergency.icons.mail')}</option>
                      <option value="alert">{t('desktop.emergency.icons.alert')}</option>
                      <option value="warning">{t('desktop.emergency.icons.warning')}</option>
                    </select>
                  </div>

                  <label className="opacity-70 text-xs mt-2">{t('desktop.emergency.form.body')}</label>
                  <textarea
                    value={editForm.body ?? ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, body: e.target.value }))}
                    className={cn(
                      "flex-1 px-2 py-1.5 text-xs font-mono resize-none min-h-[100px]",
                      isWin98
                        ? "border border-[#808080] shadow-[inset_1px_1px_#000000] bg-white"
                        : "border border-agency-border bg-agency-ink/50 rounded"
                    )}
                  />
                </div>
              ) : (
                /* View Mode */
                <div className="flex flex-col h-full">
                  {/* Mail Header */}
                  <div className={cn(
                    "p-3 border-b",
                    isWin98 ? "border-[#808080] bg-[#efefef]" : "border-agency-border bg-agency-ink/30"
                  )}>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm">{selectedMail.subject}</h3>
                      <button
                        onClick={() => handleEditMail(selectedMail)}
                        className={cn(
                          "p-1 flex-shrink-0",
                          isWin98
                            ? "border border-t-white border-l-white border-b-[#404040] border-r-[#404040] bg-[#c0c0c0]"
                            : "border border-agency-cyan/50 hover:bg-agency-cyan/10 rounded"
                        )}
                        title={t('app.common.edit')}
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="mt-2 text-xs space-y-0.5 opacity-80">
                      <div className="flex gap-2">
                        <span className="opacity-70">{t('desktop.emergency.form.from')}:</span>
                        <span className="font-mono">{selectedMail.from}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="opacity-70">{t('desktop.emergency.form.to')}:</span>
                        <span className="font-mono">{selectedMail.to}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="opacity-70">{t('desktop.emergency.form.date')}:</span>
                        <span className="font-mono">{selectedMail.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mail Body */}
                  <div className="flex-1 p-4 overflow-auto">
                    <div className="text-sm font-mono whitespace-pre-wrap leading-relaxed">
                      {selectedMail.body}
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-xs opacity-50">
                {t('desktop.emergency.noSelection')}
              </div>
            )}
          </div>
        </div>
      </div>
    </WindowFrame>
  )
}
