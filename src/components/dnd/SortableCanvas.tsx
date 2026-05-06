import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import { useCVStore } from '@/store'
import { SortableSectionItem } from './SortableSectionItem'

export function SortableCanvas() {
  const cv = useCVStore((s) => s.cv)
  const selectedId = useCVStore((s) => s.selectedSectionId)
  const selectSection = useCVStore((s) => s.selectSection)
  const setSections = useCVStore((s) => s.setSections)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = cv.sections.findIndex((s) => s.id === active.id)
    const newIndex = cv.sections.findIndex((s) => s.id === over.id)
    setSections(arrayMove(cv.sections, oldIndex, newIndex))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={cv.sections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className="space-y-0"
          role="list"
          aria-label="CV sections — drag to reorder"
        >
          {cv.sections.map((section) => (
            <SortableSectionItem
              key={section.id}
              section={section}
              cv={cv}
              isSelected={selectedId === section.id}
              onSelect={() => selectSection(section.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
