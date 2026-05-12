import { useCV } from '@/contexts/CVContext';
import { CVSectionComponent } from './CVSectionComponent.tsx';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDndContext } from '@dnd-kit/core';
import { useEffect, useRef, useState } from 'react';
import type { TemplateType } from '@/types/cv';

const PAPER_WIDTH_PX = 794; // 210mm at 96dpi

function useCanvasScale(wrapperRef: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const available = entry.contentRect.width - 48; // 24px padding each side
      setScale(available < PAPER_WIDTH_PX ? available / PAPER_WIDTH_PX : 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [wrapperRef]);
  return scale;
}

const TEMPLATE_FONTS: Record<TemplateType, string> = {
  classic:   "'Helvetica Neue', Arial, sans-serif",
  modern:    "'Helvetica Neue', Arial, sans-serif",
  minimal:   "'Georgia', 'Times New Roman', serif",
  executive: "'Georgia', 'Times New Roman', serif",
  creative:  "'Inter', system-ui, sans-serif",
};

export function CVCanvas() {
  const { state, selectSection } = useCV();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { active } = useDndContext();
  const isDragging = active !== null;
  const scale = useCanvasScale(wrapperRef);

  // Deselect on Escape, or clicking inside the canvas area but outside any section
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectSection(null);
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element;
      // Only deselect when the click lands inside the canvas paper but not on a section
      if (canvasRef.current?.contains(target) && !target.closest('.cv-section')) {
        selectSection(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onClick);
    };
  }, [selectSection]);

  return (
    <section
      ref={wrapperRef}
      aria-label="CV canvas"
      className="flex-1 cv-canvas-wrapper overflow-auto"
      style={{ touchAction: scale < 1 ? 'pan-y' : undefined }}
    >
      <div
        className="w-full flex justify-center py-6 px-4"
        style={scale < 1 ? { paddingTop: '1.5rem', paddingBottom: `${PAPER_WIDTH_PX * (1 - scale) * 0.5}px` } : undefined}
      >
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
            ...(scale < 1 ? { transform: `scale(${scale})`, transformOrigin: 'top center' } : {}),
          }}
        >
          {/* Alignment guides shown while reordering */}
          {isDragging && (
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

          {state.cv.sections.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <p className="text-lg font-medium mb-2">Start building your CV</p>
              <p className="text-sm">Click components from the left panel to add sections</p>
            </div>
          )}

          {state.cv.sections.length > 0 && (
            <SortableContext items={state.cv.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {state.cv.sections.map(section => (
                <CVSectionComponent
                  key={section.id}
                  section={section}
                  isPreview={state.isPreviewMode}
                />
              ))}
            </SortableContext>
          )}
        </main>
      </div>
    </section>
  );
}
