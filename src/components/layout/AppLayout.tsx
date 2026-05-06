import { useRef, useState } from 'react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import type { PanelImperativeHandle, PanelSize } from 'react-resizable-panels'
import { Navbar } from './Navbar'
import { SidebarPanel } from './SidebarPanel'
import { CanvasPanel } from './CanvasPanel'
import { PropertiesPanel } from './PropertiesPanel'
import { PanelErrorBoundary } from '@/components/error-boundary/PanelErrorBoundary'
import { CommandPalette } from '@/components/CommandPalette'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const sidebarRef = useRef<PanelImperativeHandle | null>(null)
  const propertiesRef = useRef<PanelImperativeHandle | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [propertiesCollapsed, setPropertiesCollapsed] = useState(false)

  function toggleSidebar() {
    if (sidebarCollapsed) {
      sidebarRef.current?.expand()
    } else {
      sidebarRef.current?.collapse()
    }
  }

  function toggleProperties() {
    if (propertiesCollapsed) {
      propertiesRef.current?.expand()
    } else {
      propertiesRef.current?.collapse()
    }
  }

  function handleSidebarResize(size: PanelSize) {
    setSidebarCollapsed(size.asPercentage === 0)
  }

  function handlePropertiesResize(size: PanelSize) {
    setPropertiesCollapsed(size.asPercentage === 0)
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
        {/* Left sidebar */}
        <ResizablePanel
          panelRef={sidebarRef}
          defaultSize={22}
          minSize={16}
          maxSize={35}
          collapsible
          collapsedSize={0}
          onResize={handleSidebarResize}
          className={cn('overflow-hidden', sidebarCollapsed && 'min-w-0')}
        >
          <PanelErrorBoundary name="Sidebar">
            <SidebarPanel />
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

        {/* Right properties panel */}
        <ResizablePanel
          panelRef={propertiesRef}
          defaultSize={24}
          minSize={18}
          maxSize={40}
          collapsible
          collapsedSize={0}
          onResize={handlePropertiesResize}
          className={cn('overflow-hidden', propertiesCollapsed && 'min-w-0')}
        >
          <PanelErrorBoundary name="Properties">
            <PropertiesPanel />
          </PanelErrorBoundary>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
