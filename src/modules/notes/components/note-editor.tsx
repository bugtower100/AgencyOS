import { useState, useEffect, useRef } from 'react'
import { Bold, Italic, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

const FONT_OPTIONS = [
  { value: '', label: 'default font' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: '"Times New Roman", serif', label: 'Times New Roman' },
  { value: '"Courier New", monospace', label: 'Courier New' },
  { value: '"SimSun", serif', label: '宋体' },
  { value: '"Microsoft YaHei", sans-serif', label: '微软雅黑' },
  { value: '"KaiTi", serif', label: '楷体' },
]

interface NoteEditorProps {
  initialContent: string
  onSave: (content: string) => void
  className?: string
}

export function NoteEditor({ initialContent, onSave, className }: NoteEditorProps) {
  const { t } = useTranslation()
  const editorRef = useRef<HTMLDivElement>(null)
  const savedRangeRef = useRef<Range | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialContent) {
      editorRef.current.innerHTML = initialContent
    }
  }, [initialContent])

  const handleInput = () => {
    setIsDirty(true)
    if (editorRef.current) {
      const updatedContent = editorRef.current.innerHTML;
      onSave(updatedContent); // Save the updated content immediately
    }
  }

  // Simple auto-save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isDirty && editorRef.current) {
        onSave(editorRef.current.innerHTML)
        setIsDirty(false)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [isDirty, onSave])

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const applyItalic = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    if (range.collapsed) return

    const parentElement = range.commonAncestorContainer.parentElement

    if (parentElement && parentElement.style.fontStyle === 'italic') {
      // Remove italic style
      parentElement.style.fontStyle = ''
      parentElement.style.transform = ''
    } else {
      // Apply italic style
      const span = document.createElement('span')
      span.style.fontStyle = 'italic'
      span.style.transform = 'skewX(-8deg)'
      span.style.display = 'inline-block'

      try {
        range.surroundContents(span)
      } catch {
        // If surroundContents fails (e.g., partial selection), fallback to execCommand
        execCommand('italic')
      }
    }

    editorRef.current?.focus()
    setIsDirty(true)
  }

  const removeFontFamilyInRange = (range: Range) => {
    const walker = document.createTreeWalker(
      range.commonAncestorContainer,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          // Only accept nodes that intersect the range
          try {
            if (range.intersectsNode(node)) return NodeFilter.FILTER_ACCEPT
          } catch {
            // Some browsers throw when testing certain nodes; ignore
          }
          return NodeFilter.FILTER_REJECT
        }
      }
    )

    const toUnwrap: Element[] = []
    while (walker.nextNode()) {
      const node = walker.currentNode as Node
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        if (el.style && el.style.fontFamily) {
          el.style.fontFamily = ''
          // If the element is a span with no other attributes/styles, schedule to unwrap
          if (el.tagName.toLowerCase() === 'span' && el.getAttributeNames().length === 0 && !el.getAttribute('style')) {
            toUnwrap.push(el)
          }
        }
      }
    }

    // unwrap simple spans
    toUnwrap.forEach((el) => {
      const parent = el.parentNode
      if (!parent) return
      while (el.firstChild) parent.insertBefore(el.firstChild, el)
      parent.removeChild(el)
    })
  }

  const clearFontFamilyFromSelection = () => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    for (let i = 0; i < sel.rangeCount; i++) {
      const range = sel.getRangeAt(i)
      try {
        removeFontFamilyInRange(range)
      } catch {
        // ignore
      }
    }
  }

  const applyFont = (fontFamily: string) => {
    const doApply = (ff: string) => {
      if (!ff) {
        // remove only font-family styles within selection
        clearFontFamilyFromSelection()
        setIsDirty(true)
        return
      }

      // remove any existing font-family inside selection to avoid nesting
      clearFontFamilyFromSelection()

      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        execCommand('fontName', ff)
        return
      }

      const range = selection.getRangeAt(0)
      if (range.collapsed) {
        execCommand('fontName', ff)
        return
      }

      const span = document.createElement('span')
      span.style.fontFamily = ff

      try {
        range.surroundContents(span)
      } catch {
        execCommand('fontName', ff)
      }

      editorRef.current?.focus()
      setIsDirty(true)
    }

    // If a saved range exists (select stole focus), restore it first
    if (savedRangeRef.current) {
      const range = savedRangeRef.current
      savedRangeRef.current = null
      editorRef.current?.focus()
      // restore selection in next macrotask then apply
      setTimeout(() => {
        try {
          const sel = window.getSelection()
          sel?.removeAllRanges()
          sel?.addRange(range)
        } catch {
          // ignore if restoration fails
        }
        doApply(fontFamily)
      }, 0)
      return
    }

    doApply(fontFamily)
  }

  return (
    <div className={cn("flex flex-col border rounded-md overflow-hidden bg-background", className)}>
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
        <button
          onClick={() => execCommand('bold')}
          className="p-1.5 hover:bg-accent rounded transition-colors"
          title={t('notes.editor.bold')}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={applyItalic}
          className="p-1.5 hover:bg-accent rounded transition-colors"
          title={t('notes.editor.italic')}
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          onClick={() => execCommand('foreColor', '#ef4444')} // Red
          className="p-1.5 hover:bg-accent rounded transition-colors"
          title={t('notes.editor.colorRed')}
          aria-label={t('notes.editor.colorRed')}
        >
          <span className="inline-block h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: '#ef4444' }} />
        </button>
        <button
          onClick={() => execCommand('foreColor', '#3b82f6')} // Blue
          className="p-1.5 hover:bg-accent rounded transition-colors"
          title={t('notes.editor.colorBlue')}
          aria-label={t('notes.editor.colorBlue')}
        >
          <span className="inline-block h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: '#3b82f6' }} />
        </button>
        <button
          onClick={() => execCommand('foreColor', '#f59e0b')} // Yellow
          className="p-1.5 hover:bg-accent rounded transition-colors"
          title={t('notes.editor.colorYellow')}
          aria-label={t('notes.editor.colorYellow')}
        >
          <span className="inline-block h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: '#f59e0b' }} />
        </button>
        <button
          onClick={() => execCommand('foreColor', '#000000')} // Black
          className="p-1.5 hover:bg-accent rounded transition-colors"
          title={t('notes.editor.colorBlack')}
          aria-label={t('notes.editor.colorBlack')}
        >
          <span className="inline-block h-3 w-3 rounded-full shadow-sm border" style={{ backgroundColor: '#000000' }} />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <select
          onMouseDown={() => {
            // Save current selection range before the select steals focus
            const sel = window.getSelection()
            if (sel && sel.rangeCount > 0) {
              // clone the range to avoid future mutation
              savedRangeRef.current = sel.getRangeAt(0).cloneRange()
            }
          }}
          onChange={(e) => applyFont(e.target.value)}
          className="h-7 px-2 text-sm rounded border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
          defaultValue=""
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
        
        <div className="flex-1" />
        {isDirty && <Save className="w-4 h-4 text-muted-foreground animate-pulse" />}
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="flex-1 p-4 focus:outline-none min-h-[200px] prose prose-sm dark:prose-invert max-w-none"
        onInput={handleInput}
        onBlur={() => {
          if (editorRef.current) {
            onSave(editorRef.current.innerHTML)
            setIsDirty(false)
          }
        }}
      />
    </div>
  )
}
