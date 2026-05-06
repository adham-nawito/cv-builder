import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { Navbar } from './Navbar'
import { SidebarPanel } from './SidebarPanel'
import { CanvasPanel } from './CanvasPanel'
import { PropertiesPanel } from './PropertiesPanel'
import { PanelErrorBoundary } from '@/components/error-boundary/PanelErrorBoundary'

export function AppLayout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />
      <ResizablePanelGroup orientation="horizontal" className="flex-1 overflow-hidden">
        <ResizablePanel defaultSize={20} minSize={14} maxSize={30} className="overflow-hidden">
          <PanelErrorBoundary name="Sidebar">
            <SidebarPanel />
          </PanelErrorBoundary>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={55} minSize={30} className="overflow-hidden">
          <PanelErrorBoundary name="Canvas">
            <CanvasPanel />
          </PanelErrorBoundary>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={25} minSize={16} maxSize={35} className="overflow-hidden">
          <PanelErrorBoundary name="Properties">
            <PropertiesPanel />
          </PanelErrorBoundary>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
