import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import rehypeRaw from 'rehype-raw'

interface NoteEditorProps {
  initialContent: string
  onSave: (content: string) => void
  className?: string
}

export function NoteEditor({ initialContent, onSave, className }: NoteEditorProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState(initialContent || '')
  const [isDirty, setIsDirty] = useState(false)
  const [mode, setMode] = useState<'edit' | 'preview' | 'both'>('edit')

  useEffect(() => {
    setValue(initialContent || '')
  }, [initialContent])

  // debounce auto-save
  useEffect(() => {
    if (!isDirty) return
    const id = setTimeout(() => {
      onSave(value)
      setIsDirty(false)
    }, 800)
    return () => clearTimeout(id)
  }, [isDirty, value, onSave])

  return (
    <div className={cn('flex flex-col border rounded-md overflow-hidden bg-background', className)}>
      <div className="flex items-center gap-2 p-2 border-b bg-muted/50">
        <div className="text-sm text-muted-foreground">{t('notes.editor.markdownMode') || 'Markdown'}</div>
        <div className="flex-1" />

        <div className="inline-flex rounded-md bg-muted/10 p-0.5">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={cn(
              'px-3 py-1 text-sm rounded-md transition-colors',
              mode === 'edit' ? 'bg-background text-foreground ring-1 ring-ring' : 'text-muted-foreground hover:bg-muted/50'
            )}
          >
            {t('notes.editor.edit') || 'Edit'}
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={cn(
              'px-3 py-1 text-sm rounded-md transition-colors',
              mode === 'preview' ? 'bg-background text-foreground ring-1 ring-ring' : 'text-muted-foreground hover:bg-muted/50'
            )}
          >
            {t('notes.editor.preview') || 'Preview'}
          </button>
          <button
            type="button"
            onClick={() => setMode('both')}
            className={cn(
              'px-3 py-1 text-sm rounded-md transition-colors',
              mode === 'both' ? 'bg-background text-foreground ring-1 ring-ring' : 'text-muted-foreground hover:bg-muted/50'
            )}
          >
            {t('notes.editor.split') || 'Split'}
          </button>
        </div>

        {isDirty && <Save className="w-4 h-4 text-muted-foreground animate-pulse ml-2" />}
      </div>

      <div className="p-4">
        {mode === 'edit' && (
          <textarea
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setIsDirty(true)
            }}
            className="w-full min-h-[200px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            placeholder={t('notes.contentPlaceholder') || 'Write markdown here...'}
          />
        )}

        {mode === 'preview' && (
          <div className="w-full min-h-[200px] rounded-md border border-input bg-transparent p-3 prose prose-sm dark:prose-invert overflow-auto">
            {/*
              We enable rehypeRaw to allow rendering of embedded HTML inside Markdown.
              For security, rehypeSanitize is applied after rehypeRaw to strip dangerous elements/attributes.
              If you need a custom allowlist, replace rehypeSanitize with a schema from 'hast-util-sanitize'.
            */}
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
              {value || ''}
            </ReactMarkdown>
          </div>
        )}

        {mode === 'both' && (
          <div className="flex flex-col md:flex-row gap-4">
            <textarea
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setIsDirty(true)
              }}
              className="flex-1 min-h-[200px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              placeholder={t('notes.contentPlaceholder') || 'Write markdown here...'}
            />

            <div className="flex-1 min-h-[200px] rounded-md border border-input bg-transparent p-3 prose prose-sm dark:prose-invert overflow-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
                {value || ''}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
