import { useTranslation } from 'react-i18next'
import { useCVStore } from '@/store'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

function NoSelection() {
  return (
    <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
      Select a section to see its properties
    </div>
  )
}

export function PropertiesPanel() {
  const { t } = useTranslation()
  const selectedId = useCVStore((s) => s.selectedSectionId)
  const sections = useCVStore((s) => s.cv.sections)
  const updateSection = useCVStore((s) => s.updateSection)

  const section = sections.find((s) => s.id === selectedId)

  return (
    <aside className="flex h-full flex-col overflow-hidden">
      <div className="px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('properties.title')}
        </span>
      </div>
      <Separator />
      {!section ? (
        <NoSelection />
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">Section title</Label>
            <input
              className="w-full rounded-md border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={section.title}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">{t('properties.visibility')}</Label>
            <Switch
              checked={section.visible}
              onCheckedChange={(checked) => updateSection(section.id, { visible: checked })}
            />
          </div>
        </div>
      )}
    </aside>
  )
}
