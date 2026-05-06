import { useTranslation } from 'react-i18next'
import { useCVStore } from '@/store'
import { SortableCanvas } from '@/components/dnd/SortableCanvas'

export function CanvasPanel() {
  const { t } = useTranslation()
  const cv = useCVStore((s) => s.cv)
  const selectSection = useCVStore((s) => s.selectSection)
  const hasSections = cv.sections.length > 0

  function handleDeselect(e: React.KeyboardEvent | React.MouseEvent) {
    if ('key' in e && e.key !== 'Escape') return
    selectSection(null)
  }

  return (
    <main className="flex h-full flex-col items-center overflow-y-auto bg-muted/30 p-8">
      {hasSections ? (
        <section
          aria-label="CV canvas"
          className="w-full max-w-[794px] rounded-sm bg-background shadow-md"
          style={{ minHeight: '1123px' }}
        >
          <SortableCanvas />
        </section>
      ) : (
        <button
          type="button"
          className="flex h-full w-full cursor-default items-center justify-center text-sm text-muted-foreground"
          onClick={handleDeselect}
          onKeyDown={handleDeselect}
        >
          {t('canvas.empty')}
        </button>
      )}
    </main>
  )
}
