import { useTranslation } from 'react-i18next'
import { useCVStore } from '@/store'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SectionEditor } from '@/components/editors/SectionEditor'
import { SECTION_ICONS, SECTION_LABELS } from '@/lib/sectionMeta'

type Props = Readonly<{ collapsed?: boolean }>

function NoSelection() {
  return (
    <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
      Select a section on the canvas to edit its properties
    </div>
  )
}

export function PropertiesPanel({ collapsed = false }: Props) {
  const { t } = useTranslation()
  const selectedId = useCVStore((s) => s.selectedSectionId)
  const sections = useCVStore((s) => s.cv.sections)
  const selectSection = useCVStore((s) => s.selectSection)

  const section = sections.find((s) => s.id === selectedId)

  if (collapsed) {
    return (
      <aside className="flex h-full flex-col items-center overflow-hidden py-2 gap-0.5" aria-label="Properties panel (collapsed)">
        {sections.map((s) => {
          const Icon = SECTION_ICONS[s.type]
          return (
            <Tooltip key={s.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={`flex size-8 items-center justify-center rounded-md transition-colors hover:bg-accent${selectedId === s.id ? ' bg-accent' : ''}`}
                  onClick={() => selectSection(s.id)}
                  aria-label={s.title || SECTION_LABELS[s.type]}
                >
                  <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {s.title || SECTION_LABELS[s.type]}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </aside>
    )
  }

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
