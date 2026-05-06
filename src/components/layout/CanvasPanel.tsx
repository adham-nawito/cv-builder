import { useTranslation } from 'react-i18next'
import { useCVStore } from '@/store'
import { CVRenderer } from '@/components/cv/CVRenderer'

export function CanvasPanel() {
  const { t } = useTranslation()
  const cv = useCVStore((s) => s.cv)
  const selectSection = useCVStore((s) => s.selectSection)

  const hasVisibleContent = cv.sections.some((s) => s.visible)

  return (
    <main className="flex h-full flex-col items-center overflow-y-auto bg-muted/30 p-8">
      {hasVisibleContent ? (
        <section
          aria-label="CV canvas"
          className="w-full max-w-[794px] rounded-sm bg-background shadow-md"
          style={{ minHeight: '1123px' }}
        >
          <CVRenderer cv={cv} />
        </section>
      ) : (
        <button
          type="button"
          className="flex h-full w-full cursor-default items-center justify-center text-sm text-muted-foreground"
          onClick={() => selectSection(null)}
        >
          {t('canvas.empty')}
        </button>
      )}
    </main>
  )
}
