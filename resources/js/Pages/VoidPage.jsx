import { useRef, useState } from 'react'
import { Head } from '@inertiajs/react'
import { Plus, Layers, FolderOpen, Code, Users, Upload, Briefcase } from 'lucide-react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import Panel from '@/Components/Panel'
import BackgroundLayers from '@/Components/Void/BackgroundLayers'
import FloatingToolbox from '@/Components/Void/FloatingToolbox'
import FramesContainer from '@/Components/Void/FramesContainer'
import DeleteButton from '@/Components/Void/DeleteButton'
import { useScrollHandler } from '@/Components/Void/ScrollHandler'
import { useThemeStore } from '@/stores/useThemeStore'
import { useEditorStore } from '@/stores/useEditorStore'

export default function VoidPage() {
  const canvasRef = useRef(null)
  
  // Zustand stores
  const { isDark } = useThemeStore()
  const { panelStates, togglePanel } = useEditorStore()
  
  // Infinite scroll state - INCREASED scroll bounds for larger void space
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastPointerPos, setLastPointerPos] = useState({ x: 0, y: 0 })
  const scrollBounds = { width: 6000, height: 4000 } // INCREASED from 2000x1500

  // Sample frames data - DISTRIBUTED across the LARGER scroll area
  const [frames] = useState([
    { id: 1, title: 'Frame1', fileName: 'File1', x: 400, y: 300 },
    { id: 2, title: 'Frame2', fileName: 'File2', x: 1200, y: 400 },
    { id: 3, title: 'Frame3', fileName: 'File3', x: 800, y: 800 },
    { id: 4, title: 'Frame4', fileName: 'File4', x: 1600, y: 600 },
    { id: 5, title: 'Frame5', fileName: 'File5', x: 600, y: 1200 },
    { id: 6, title: 'Frame6', fileName: 'File6', x: 2400, y: 500 },
    { id: 7, title: 'Frame7', fileName: 'File7', x: 2000, y: 1000 },
    { id: 8, title: 'Frame8', fileName: 'File8', x: 3000, y: 700 },
    { id: 9, title: 'Frame9', fileName: 'File9', x: 1000, y: 1600 },
    { id: 10, title: 'Frame10', fileName: 'File10', x: 3500, y: 900 },
    { id: 11, title: 'Frame11', fileName: 'File11', x: 2200, y: 1400 },
    { id: 12, title: 'Frame12', fileName: 'File12', x: 4000, y: 1100 },
  ])

  // Use the scroll handler hook
  useScrollHandler({
    canvasRef,
    scrollPosition,
    setScrollPosition,
    isDragging,
    setIsDragging,
    lastPointerPos,
    setLastPointerPos,
    scrollBounds
  })

  // Panel handlers
  const handlePanelClose = (panelId) => {
    togglePanel(panelId)
  }

  const handlePanelMaximize = (panelId) => {
    console.log('Maximizing panel:', panelId)
    // You can implement panel maximize logic here
  }

  // Floating tools configuration
  const floatingTools = [
    { icon: Plus, label: 'New Frame', isPrimary: true },
    { icon: Layers, label: 'Frames', isPrimary: false },
    { icon: FolderOpen, label: 'Project Files', isPrimary: false },
    { icon: Code, label: 'Code Handler', isPrimary: false },
    { icon: Users, label: 'Team Collaborations', isPrimary: false },
    { icon: Upload, label: 'Import', isPrimary: false },
    { icon: Briefcase, label: 'Project', isPrimary: false }
  ]

  return (
    <AuthenticatedLayout>
      <Head title="VoidPage" />
      <div 
        ref={canvasRef}
        className={`relative w-full h-screen overflow-hidden transition-colors duration-1000 cursor-grab ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } ${
          isDark 
            ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
            : 'bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50'
        }`}
        style={{
          backgroundColor: isDark ? 'var(--color-bg)' : 'var(--color-bg)',
          userSelect: 'none',
          touchAction: 'none',
          // Optimize for smooth scrolling
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          perspective: 1000
        }}
      >
        {/* Background Layers */}
        <BackgroundLayers isDark={isDark} scrollPosition={scrollPosition} />

        {/* Floating Toolbox */}
        <FloatingToolbox tools={floatingTools} />

        {/* Delete Button - Positioned beside the left panel */}
        <DeleteButton />
        
        {/* Frames Container - OPTIMIZED infinite scroll with larger bounds */}
        <FramesContainer 
          frames={frames} 
          scrollPosition={scrollPosition} 
          scrollBounds={scrollBounds} 
        />
        
        {/* Dockable Panel - RIGHT SIDE ONLY with 2 stacked panels */}
        <Panel
          isOpen={true}
          panels={[
            {
              id: 'files-panel', 
              title: 'Project Files',
              content: (
                <div>
                  <h4 className="font-semibold mb-4 text-[var(--color-text)]">File Explorer</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 p-2 hover:bg-[var(--color-bg-hover)] rounded cursor-pointer">
                      <FolderOpen className="w-4 h-4 text-[var(--color-primary)]" />
                      <span className="text-sm text-[var(--color-text)]">src/</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 hover:bg-[var(--color-bg-hover)] rounded cursor-pointer ml-4">
                      <Code className="w-4 h-4 text-[var(--color-text-muted)]" />
                      <span className="text-sm text-[var(--color-text)]">components/</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 hover:bg-[var(--color-bg-hover)] rounded cursor-pointer ml-4">
                      <Code className="w-4 h-4 text-[var(--color-text-muted)]" />
                      <span className="text-sm text-[var(--color-text)]">pages/</span>
                    </div>
                  </div>
                </div>
              ),
              closable: true
            },
            {
              id: 'frames-panel',
              title: 'Frames',
              content: (
                <div>
                  <h4 className="font-semibold mb-4 text-[var(--color-text)]">Frame Manager</h4>
                  <div className="space-y-2">
                    {frames.map((frame) => (
                      <div key={frame.id} className="p-3 rounded-lg bg-[var(--color-bg-muted)] border border-[var(--color-border)]">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[var(--color-primary)]" />
                          <span className="text-sm text-[var(--color-text)]">{frame.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ),
              closable: true
            }
          ]}
          allowedDockPositions={['right']} // ONLY RIGHT SIDE DOCKING
          onPanelClose={handlePanelClose}
          onPanelMaximize={handlePanelMaximize}
        />
      </div>
    </AuthenticatedLayout>
  )
}