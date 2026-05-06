import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCVStore } from '@/store'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import {
  FileText, Code, Download, Eye, LayoutTemplate, Plus, Circle,
  Undo2, Redo2, Search, PanelLeft, PanelRight,
} from 'lucide-react'

type Props = Readonly<{
  sidebarCollapsed: boolean
  propertiesCollapsed: boolean
  onToggleSidebar: () => void
  onToggleProperties: () => void
}>

export function Navbar({ sidebarCollapsed, propertiesCollapsed, onToggleSidebar, onToggleProperties }: Props) {
  const { t } = useTranslation()
  const isDirty = useCVStore((s) => s.isDirty)
  const cvName = useCVStore((s) => s.cv.name)
  const undo = useCVStore((s) => s.undo)
  const redo = useCVStore((s) => s.redo)
  const canUndo = useCVStore((s) => s.canUndo)
  const canRedo = useCVStore((s) => s.canRedo)

  useKeyboardShortcuts()

  return (
    <header className="flex h-12 shrink-0 items-center gap-1 border-b bg-background px-3">
      {/* Panel toggles */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            onClick={onToggleSidebar}
            aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          >
            <PanelLeft className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}</TooltipContent>
      </Tooltip>

      <div className="flex items-center gap-1.5 px-1">
        <FileText className="size-4 text-primary" aria-hidden="true" />
        <span className="font-semibold text-sm">CVForge</span>
      </div>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {cvName}
        {isDirty && (
          <Circle className="size-2 fill-amber-500 text-amber-500" aria-label="Unsaved changes" />
        )}
      </span>

      {/* Undo / Redo */}
      <div className="ms-3 flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" onClick={undo} disabled={!canUndo} aria-label="Undo (Ctrl+Z)">
              <Undo2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" onClick={redo} disabled={!canRedo} aria-label="Redo (Ctrl+Shift+Z)">
              <Redo2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
        </Tooltip>
      </div>

      <div className="ms-auto flex items-center gap-1">
        {/* Command palette */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => globalThis.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))}
              aria-label="Open command palette (Ctrl+K)"
            >
              <Search className="size-3.5" aria-hidden="true" />
              <span className="hidden sm:inline text-xs">Search…</span>
              <kbd className="hidden sm:inline rounded border px-1 text-[10px]">⌘K</kbd>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Command palette (Ctrl+K)</TooltipContent>
        </Tooltip>

        <Button variant="ghost" size="sm">
          <Plus className="size-4" aria-hidden="true" />
          {t('nav.newCv')}
        </Button>
        <Button variant="ghost" size="sm">
          <LayoutTemplate className="size-4" aria-hidden="true" />
          {t('nav.templates')}
        </Button>
        <Button variant="ghost" size="sm">
          <Code className="size-4" aria-hidden="true" />
          {t('nav.viewCode')}
        </Button>
        <Button variant="ghost" size="sm">
          <Eye className="size-4" aria-hidden="true" />
          {t('nav.preview')}
        </Button>

        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button size="sm">
          <Download className="size-4" aria-hidden="true" />
          {t('nav.export')}
        </Button>

        <Separator orientation="vertical" className="mx-1 h-5" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground"
              onClick={onToggleProperties}
              aria-label={propertiesCollapsed ? 'Show properties' : 'Hide properties'}
            >
              <PanelRight className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{propertiesCollapsed ? 'Show properties' : 'Hide properties'}</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
