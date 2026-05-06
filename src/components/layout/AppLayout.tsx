import { useRef, useState } from 'react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import type { PanelImperativeHandle } from 'react-resizable-panels'
import { Navbar } from './Navbar'
import { SidebarPanel } from './SidebarPanel'
import { CanvasPanel } from './CanvasPanel'
import { PropertiesPanel } from './PropertiesPanel'
import { PanelErrorBoundary } from '@/components/error-boundary/PanelErrorBoundary'
import { CommandPalette } from '@/components/CommandPalette'

export function AppLayout() {
  const sidebarRef = useRef<PanelImperativeHandle | null>(null)
  const propertiesRef = useRef<PanelImperativeHandle | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [propertiesCollapsed, setPropertiesCollapsed] = useState(false)

  function toggleSidebar() {
    if (sidebarCollapsed) {
      sidebarRef.current?.expand()
      setSidebarCollapsed(false)
    } else {
      sidebarRef.current?.collapse()
      setSidebarCollapsed(true)
    }
  }

  function toggleProperties() {
    if (propertiesCollapsed) {
      propertiesRef.current?.expand()
      setPropertiesCollapsed(false)
    } else {
      propertiesRef.current?.collapse()
      setPropertiesCollapsed(true)
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar
        sidebarCollapsed={sidebarCollapsed}
        propertiesCollapsed={propertiesCollapsed}
        onToggleSidebar={toggleSidebar}
        onToggleProperties={toggleProperties}
      />
      <CommandPalette />
      <ResizablePanelGroup orientation="horizontal" className="flex-1 overflow-hidden">
        {/* Left sidebar — collapses to icon strip (~48px = ~3.5% at 1400px wide) */}
        <ResizablePanel
          panelRef={sidebarRef}
          defaultSize={22}
          minSize={3}
          maxSize={35}
          collapsible
          collapsedSize={3}
        >
          <PanelErrorBoundary name="Sidebar">
            <SidebarPanel collapsed={sidebarCollapsed} />
          </PanelErrorBoundary>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Canvas */}
        <ResizablePanel defaultSize={54} minSize={30} className="overflow-hidden">
          <PanelErrorBoundary name="Canvas">
            <CanvasPanel />
          </PanelErrorBoundary>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right properties panel — collapses to icon strip */}
        <ResizablePanel
          panelRef={propertiesRef}
          defaultSize={24}
          minSize={3}
          maxSize={40}
          collapsible
          collapsedSize={3}
        >
          <PanelErrorBoundary name="Properties">
            <PropertiesPanel collapsed={propertiesCollapsed} />
          </PanelErrorBoundary>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
