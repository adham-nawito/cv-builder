import { useTranslation } from 'react-i18next'
import { useCVStore } from '@/store'
import { Separator } from '@/components/ui/separator'
import { SectionEditor } from '@/components/editors/SectionEditor'

function NoSelection() {
  return (
    <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
      Select a section on the canvas to edit its properties
    </div>
  )
}

export function PropertiesPanel() {
  const { t } = useTranslation()
  const selectedId = useCVStore((s) => s.selectedSectionId)
  const sections = useCVStore((s) => s.cv.sections)

  const section = sections.find((s) => s.id === selectedId)

  return (
    <aside className="flex h-full flex-col overflow-hidden" aria-label="Properties panel">
      <div className="px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('properties.title')}
        </span>
      </div>
      <Separator />
      {section ? (
        <div className="flex-1 overflow-y-auto p-3">
          <SectionEditor section={section} />
        </div>
      ) : (
        <NoSelection />
      )}
    </aside>
  )
}
