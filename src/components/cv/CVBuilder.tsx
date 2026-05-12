import { Navbar } from '@/components/cv/Navbar';
import { ComponentPalette } from '@/components/cv/ComponentPalette';
import { CVCanvas } from '@/components/cv/CVCanvas';
import { PropertiesPanel } from '@/components/cv/PropertiesPanel';
import { ATSScorePanel } from '@/components/cv/ATSScorePanel';
import { CommandPalette, useCommandPalette } from '@/components/cv/CommandPalette';
import { RecoveryPrompt } from '@/components/cv/RecoveryPrompt';
import { CVProvider, useCV } from '@/contexts/CVContext';
import { PanelErrorBoundary } from '@/components/PanelErrorBoundary';
import { useState, useEffect } from 'react';
import { hasUnsavedSession, loadSession } from '@/lib/storage';
import type { CVData } from '@/types/cv';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor,
  DragOverlay, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { exportPDF } from '@/utils/exportUtils';
import { ExportDialog } from '@/components/cv/ExportDialog';

function BuilderLayout() {
  const { state, dispatch } = useCV();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette();
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [recoverySession, setRecoverySession] = useState<CVData | null>(null);

  useEffect(() => {
    if (hasUnsavedSession()) {
      setRecoverySession(loadSession());
    }
  }, []);

  const handleExportConfirm = async (filename: string) => {
    setShowExportDialog(false);
    const el = document.getElementById('cv-canvas-paper');
    if (el) await exportPDF(el, filename);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
    const title = state.cv.sections.find(s => s.id === id)?.title ?? 'section';
    setAnnouncement(`Dragging ${title}`);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      setAnnouncement('');
      return;
    }
    const oldIndex = state.cv.sections.findIndex(s => s.id === active.id);
    const newIndex = state.cv.sections.findIndex(s => s.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      dispatch({ type: 'REORDER_SECTIONS', payload: arrayMove(state.cv.sections, oldIndex, newIndex) });
      const title = state.cv.sections[oldIndex].title;
      setAnnouncement(`Moved ${title} to position ${newIndex + 1}`);
    }
  };

  const activeSection = activeId ? state.cv.sections.find(s => s.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Screen-reader drag announcements */}
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <div className="h-screen flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 flex overflow-hidden relative">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden absolute top-2 left-2 z-30 p-2 bg-card border border-border rounded-md shadow-sm"
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>

          {/* Left sidebar */}
          {!state.isPreviewMode && (
            <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block absolute md:relative z-20 h-full`}>
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto">
                  <PanelErrorBoundary panelName="Component Palette">
                    <ComponentPalette />
                  </PanelErrorBoundary>
                </div>
                <PanelErrorBoundary panelName="ATS Score">
                  <ATSScorePanel />
                </PanelErrorBoundary>
              </div>
            </div>
          )}

          {/* Canvas */}
          <PanelErrorBoundary panelName="Canvas">
            <CVCanvas />
          </PanelErrorBoundary>

          {/* Right sidebar */}
          {!state.isPreviewMode && (
            <PanelErrorBoundary panelName="Properties">
              <PropertiesPanel />
            </PanelErrorBoundary>
          )}
        </div>
      </div>

      {/* Floating ghost shown while reordering sections */}
      <DragOverlay modifiers={[restrictToWindowEdges]}>
        {activeSection ? (
          <div className="px-3 py-2 bg-card border border-primary rounded-md shadow-lg text-sm font-medium opacity-90">
            {activeSection.title}
          </div>
        ) : null}
      </DragOverlay>

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onExportPDF={() => setShowExportDialog(true)}
      />

      {showExportDialog && (
        <ExportDialog
          format="PDF"
          defaultName={state.cv.name || 'cv'}
          onConfirm={handleExportConfirm}
          onCancel={() => setShowExportDialog(false)}
        />
      )}

      {recoverySession && (
        <RecoveryPrompt
          session={recoverySession}
          onRestore={() => {
            dispatch({ type: 'LOAD_CV', payload: recoverySession });
            setRecoverySession(null);
          }}
          onDiscard={() => setRecoverySession(null)}
        />
      )}
    </DndContext>
  );
}

export default function CVBuilder() {
  return (
    <CVProvider>
      <BuilderLayout />
    </CVProvider>
  );
}
