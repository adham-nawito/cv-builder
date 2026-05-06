import { useCV } from '@/contexts/CVContext';
import { CVSectionComponent } from './CVSectionComponent.tsx';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent, type DragStartEvent
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, arrayMove
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useState, useRef, useEffect } from 'react';
import type { TemplateType } from '@/types/cv';

const TEMPLATE_FONTS: Record<TemplateType, string> = {
  classic:   "'Helvetica Neue', Arial, sans-serif",
  modern:    "'Helvetica Neue', Arial, sans-serif",
  minimal:   "'Georgia', 'Times New Roman', serif",
  executive: "'Georgia', 'Times New Roman', serif",
  creative:  "'Inter', system-ui, sans-serif",
};

export function CVCanvas() {
  const { state, dispatch, selectSection } = useCV();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showGuides, setShowGuides] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Deselect on Escape — attached to document so no non-interactive element needs handlers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectSection(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selectSection]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setShowGuides(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setShowGuides(false);

    if (!over || active.id === over.id) return;
    const oldIndex = state.cv.sections.findIndex(s => s.id === active.id);
    const newIndex = state.cv.sections.findIndex(s => s.id === over.id);
    const reordered = arrayMove(state.cv.sections, oldIndex, newIndex);
    dispatch({ type: 'REORDER_SECTIONS', payload: reordered });
  };

  return (
    <section aria-label="CV canvas" className="flex-1 cv-canvas-wrapper overflow-auto">
      {/* Clicking the background area deselects; using a button would be semantically wrong here,
          so we attach onClick to the scrollable container which is the conventional pattern. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className="w-full flex justify-center py-6 px-4" onClick={() => selectSection(null)}>
        <main
          ref={canvasRef}
          id="cv-canvas-paper"
          aria-label="CV document"
          className="cv-paper relative"
          style={{
            width: '210mm',
            minHeight: '297mm',
            maxWidth: '100%',
            fontFamily: TEMPLATE_FONTS[state.cv.template],
          }}
        >
          {/* Alignment guides shown while dragging */}
          {showGuides && activeId && (
            <>
              <div aria-hidden="true" className="absolute pointer-events-none z-50"
                style={{ left: '50%', top: 0, bottom: 0, width: 0, borderLeft: '1px dashed hsl(var(--guide-color))', opacity: 0.6 }} />
              <div aria-hidden="true" className="absolute pointer-events-none z-50"
                style={{ left: 0, top: 0, bottom: 0, width: 0, borderLeft: '1px dashed hsl(var(--guide-color) / 0.3)' }} />
              <div aria-hidden="true" className="absolute pointer-events-none z-50"
                style={{ right: 0, top: 0, bottom: 0, width: 0, borderRight: '1px dashed hsl(var(--guide-color) / 0.3)' }} />
              <div aria-hidden="true"
                className="absolute left-1 top-0 pointer-events-none z-50 text-[10px] font-mono px-1 rounded"
                style={{ color: 'hsl(var(--guide-color))', background: 'hsl(var(--guide-color) / 0.1)' }}
              >
                20mm
              </div>
            </>
          )}

          {state.cv.sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <p className="text-lg font-medium mb-2">Start building your CV</p>
              <p className="text-sm">Click components from the left panel to add sections</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={state.cv.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {state.cv.sections.map(section => (
                  <CVSectionComponent
                    key={section.id}
                    section={section}
                    isPreview={state.isPreviewMode}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </main>
      </div>
    </section>
  );
}
