import { useTranslation } from 'react-i18next'
import { useCVStore } from '@/store'
import { cn } from '@/lib/utils'

export function CanvasPanel() {
  const { t } = useTranslation()
  const cv = useCVStore((s) => s.cv)
  const selectedId = useCVStore((s) => s.selectedSectionId)
  const selectSection = useCVStore((s) => s.selectSection)

  const visibleSections = cv.sections.filter((s) => s.visible)

  return (
    <main
      className="flex h-full flex-col items-center overflow-y-auto bg-muted/30 p-8"
      onClick={() => selectSection(null)}
    >
      {visibleSections.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          {t('canvas.empty')}
        </div>
      ) : (
        <div
          className="w-full max-w-[794px] rounded-sm bg-background shadow-md"
          style={{ minHeight: '1123px' }}
        >
          {visibleSections.map((section) => (
            <div
              key={section.id}
              className={cn(
                'border-2 border-transparent px-10 py-4 transition-colors cursor-pointer',
                selectedId === section.id && 'border-primary/40 bg-primary/5'
              )}
              onClick={(e) => { e.stopPropagation(); selectSection(section.id) }}
            >
              {section.type !== 'spacer' && (
                <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.title}
                </h2>
              )}
              {section.type === 'spacer' ? (
                <div style={{ height: section.height }} />
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  {section.blocks.length === 0
                    ? `No content yet — click to edit`
                    : `${section.blocks.length} block(s)`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
