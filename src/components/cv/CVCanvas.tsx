import { useCV } from '@/contexts/CVContext';
import { CVSectionComponent } from './CVSectionComponent';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent, DragOverlay, type DragStartEvent
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, arrayMove
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useState, useRef, useCallback, useEffect } from 'react';

export function CVCanvas() {
  const { state, dispatch, selectSection } = useCV();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [guides, setGuides] = useState<{ top?: number; bottom?: number; center?: number; distance?: { y: number; height: number } } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragMove = useCallback(() => {
    if (!activeId || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const sectionEls = Array.from(canvas.querySelectorAll('.cv-section'));
    const canvasRect = canvas.getBoundingClientRect();

    const activeEl = sectionEls.find(el => {
      const sortableId = el.getAttribute('data-id') || el.closest('[data-id]')?.getAttribute('data-id');
      return false; // We'll use simpler center guide
    });

    // Show center alignment guide
    const centerX = canvasRect.width / 2;
    setGuides({ center: centerX });
  }, [activeId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setGuides(null);

    if (!over || active.id === over.id) return;
    const oldIndex = state.cv.sections.findIndex(s => s.id === active.id);
    const newIndex = state.cv.sections.findIndex(s => s.id === over.id);
    const reordered = arrayMove(state.cv.sections, oldIndex, newIndex);
    dispatch({ type: 'REORDER_SECTIONS', payload: reordered });
  };

  const handleCanvasClick = () => {
    selectSection(null);
  };

  const activeSection = activeId ? state.cv.sections.find(s => s.id === activeId) : null;

  return (
    <div className="flex-1 cv-canvas-wrapper overflow-auto" onClick={handleCanvasClick}>
      <div className="w-full flex justify-center py-6 px-4">
        <div
          ref={canvasRef}
          id="cv-canvas-paper"
          className="cv-paper relative"
          style={{
            width: '210mm',
            minHeight: '297mm',
            maxWidth: '100%',
            fontFamily: state.cv.template === 'modern'
              ? "'Helvetica Neue', Arial, sans-serif"
              : state.cv.template === 'minimal'
                ? "'Georgia', 'Times New Roman', serif"
                : "'Helvetica Neue', Arial, sans-serif",
          }}
        >
          {/* Alignment guides */}
          {guides && activeId && (
            <>
              {/* Center vertical guide */}
              <div
                className="absolute pointer-events-none z-50"
                style={{
                  left: '50%',
                  top: 0,
                  bottom: 0,
                  width: 0,
                  borderLeft: '1px dashed hsl(var(--guide-color))',
                  opacity: 0.6,
                }}
              />
              {/* Left margin guide */}
              <div
                className="absolute pointer-events-none z-50"
                style={{
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 0,
                  borderLeft: '1px dashed hsl(var(--guide-color) / 0.3)',
                }}
              />
              {/* Right margin guide */}
              <div
                className="absolute pointer-events-none z-50"
                style={{
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 0,
                  borderRight: '1px dashed hsl(var(--guide-color) / 0.3)',
                }}
              />
              {/* Top spacing indicator */}
              <div
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
              onDragMove={handleDragMove}
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
        </div>
      </div>
    </div>
  );
}
