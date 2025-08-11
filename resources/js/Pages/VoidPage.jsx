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

export default function VoidPage({ isDark: initialIsDark }) {
  const canvasRef = useRef(null)
  const [isDark, setIsDark] = useState(initialIsDark || false)
  
  // Infinite scroll state - REDUCED scroll bounds and sensitivity
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastPointerPos, setLastPointerPos] = useState({ x: 0, y: 0 })
  const scrollBounds = { width: 2000, height: 1500 } // REDUCED from 4000x3000

  // Sample frames data - DISTRIBUTED across the scroll area
  const [frames] = useState([
    { id: 1, title: 'Frame1', fileName: 'File1', x: 200, y: 150 },
    { id: 2, title: 'Frame2', fileName: 'File2', x: 600, y: 200 },
    { id: 3, title: 'Frame3', fileName: 'File3', x: 400, y: 400 },
    { id: 4, title: 'Frame4', fileName: 'File4', x: 800, y: 300 },
    { id: 5, title: 'Frame5', fileName: 'File5', x: 300, y: 600 },
    { id: 6, title: 'Frame6', fileName: 'File6', x: 1200, y: 250 },
    { id: 7, title: 'Frame7', fileName: 'File7', x: 1000, y: 500 },
    { id: 8, title: 'Frame8', fileName: 'File8', x: 1500, y: 350 },
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

  // Handle theme changes from the header
  const handleThemeChange = (darkMode) => {
    setIsDark(darkMode)
  }

  // Panel handlers
  const handlePanelClose = (panelId) => {
    console.log('Closing panel:', panelId)
    // You can implement panel close logic here
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
    <AuthenticatedLayout onThemeChange={handleThemeChange}>
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
          touchAction: 'none'
        }}
      >
        {/* Background Layers */}
        <BackgroundLayers isDark={isDark} scrollPosition={scrollPosition} />

        {/* Floating Toolbox */}
        <FloatingToolbox tools={floatingTools} />

        {/* Delete Button - Positioned beside the right panel */}
        <DeleteButton />
        
        {/* Frames Container - FIXED infinite scroll */}
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