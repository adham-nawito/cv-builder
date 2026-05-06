import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { GripVertical, Lock, LockOpen, Copy, Trash2 } from 'lucide-react'
import type { Section } from '@/schemas/cv'
import { useCVStore } from '@/store'
import { CVRenderer } from '@/components/cv/CVRenderer'
import type { CV } from '@/schemas/cv'

type Props = Readonly<{
  section: Section
  isSelected: boolean
  onSelect: () => void
  cv: CV
}>

export function SortableSectionItem({ section, isSelected, onSelect, cv }: Props) {
  const updateSection = useCVStore((s) => s.updateSection)
  const removeSection = useCVStore((s) => s.removeSection)
  const duplicateSection = useCVStore((s) => s.duplicateSection)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    disabled: section.locked,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Build a single-section CV proxy just for rendering this section
  const sectionCV: CV = { ...cv, sections: [section] }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-sm border-2 transition-colors',
        isSelected ? 'border-primary/50 bg-primary/5' : 'border-transparent hover:border-border',
        isDragging && 'opacity-50 shadow-lg',
        !section.visible && 'opacity-40'
      )}
      aria-selected={isSelected}
      aria-label={`CV section: ${section.title}`}
    >
      {/* Drag handle — keyboard accessible */}
      <button
        type="button"
        className={cn(
          'absolute start-0 top-1/2 -translate-x-full -translate-y-1/2 flex items-center justify-center rounded-s-sm p-1',
          'text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
          section.locked && 'cursor-not-allowed',
        )}
        aria-label={`Drag ${section.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      {/* Section content */}
      <button
        type="button"
        className="w-full cursor-pointer text-start"
        onClick={onSelect}
        onKeyDown={(e) => e.key === 'Enter' && onSelect()}
        aria-label={`Select section: ${section.title}`}
      >
        <CVRenderer cv={sectionCV} />
      </button>

      {/* Floating controls (visible on hover / selection) */}
      {isSelected && (
        <div
          className="absolute end-1 top-1 flex items-center gap-0.5 rounded-md border bg-background p-0.5 shadow-sm"
          aria-label="Section controls"
        >
          <button
            type="button"
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={section.locked ? 'Unlock section' : 'Lock section'}
            onClick={(e) => { e.stopPropagation(); updateSection(section.id, { locked: !section.locked }) }}
          >
            {section.locked ? <Lock className="size-3" /> : <LockOpen className="size-3" />}
          </button>
          <button
            type="button"
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Duplicate section"
            onClick={(e) => { e.stopPropagation(); duplicateSection(section.id) }}
          >
            <Copy className="size-3" />
          </button>
          <button
            type="button"
            className="rounded p-1 text-muted-foreground hover:bg-destructive hover:text-white focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Delete section"
            onClick={(e) => { e.stopPropagation(); removeSection(section.id) }}
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      )}
    </div>
  )
}
