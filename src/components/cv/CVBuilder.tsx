import { Navbar } from '@/components/cv/Navbar';
import { ComponentPalette } from '@/components/cv/ComponentPalette';
import { CVCanvas } from '@/components/cv/CVCanvas';
import { PropertiesPanel } from '@/components/cv/PropertiesPanel';
import { ATSScorePanel } from '@/components/cv/ATSScorePanel';
import { CVProvider, useCV } from '@/contexts/CVContext';
import { PanelErrorBoundary } from '@/components/PanelErrorBoundary';
import { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

function BuilderLayout() {
  const { state } = useCV();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
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
  );
}

export default function CVBuilder() {
  return (
    <CVProvider>
      <BuilderLayout />
    </CVProvider>
  );
}
