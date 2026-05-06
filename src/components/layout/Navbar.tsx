import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCVStore } from '@/store'
import { FileText, Code, Download, Eye, LayoutTemplate, Plus, Circle } from 'lucide-react'

export function Navbar() {
  const { t } = useTranslation()
  const isDirty = useCVStore((s) => s.isDirty)
  const cvName = useCVStore((s) => s.cv.name)

  return (
    <header className="flex h-12 items-center gap-2 border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <FileText className="size-5 text-primary" />
        <span className="font-semibold text-sm">CVForge</span>
      </div>

      <Separator orientation="vertical" className="mx-2 h-5" />

      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {cvName}
        {isDirty && (
          <Circle className="size-2 fill-amber-500 text-amber-500" aria-label="Unsaved changes" />
        )}
      </span>

      <div className="ms-auto flex items-center gap-1">
        <Button variant="ghost" size="sm">
          <Plus className="size-4" />
          {t('nav.newCv')}
        </Button>
        <Button variant="ghost" size="sm">
          <LayoutTemplate className="size-4" />
          {t('nav.templates')}
        </Button>
        <Button variant="ghost" size="sm">
          <Code className="size-4" />
          {t('nav.viewCode')}
        </Button>
        <Button variant="ghost" size="sm">
          <Eye className="size-4" />
          {t('nav.preview')}
        </Button>
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button size="sm">
          <Download className="size-4" />
          {t('nav.export')}
        </Button>
      </div>
    </header>
  )
}
