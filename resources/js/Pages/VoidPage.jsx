import { useRef, useState, useCallback, useMemo } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { Plus, Layers, FolderOpen, Code, Users, Upload, Briefcase } from 'lucide-react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import Panel from '@/Components/Panel'
import BackgroundLayers from '@/Components/Void/BackgroundLayers'
import FloatingToolbox from '@/Components/Void/FloatingToolbox'
import FramesContainer from '@/Components/Void/FramesContainer'
import DeleteButton from '@/Components/Void/DeleteButton'
import FrameCreator from '@/Components/Void/FrameCreator'
import Modal from '@/Components/Modal'
import { useScrollHandler } from '@/Components/Void/ScrollHandler'
import { useThemeStore } from '@/stores/useThemeStore'
import { useEditorStore } from '@/stores/useEditorStore'

export default function VoidPage() {
  const { project } = usePage().props // Get project from Inertia props
  const canvasRef = useRef(null)
  
  // Zustand stores
  const { isDark } = useThemeStore()
  const { panelStates, togglePanel } = useEditorStore()
  
  // Modal state
  const [showFrameCreator, setShowFrameCreator] = useState(false)
  
  // Zoom state
  const [zoom, setZoom] = useState(1)
  const minZoom = 0.25
  const maxZoom = 3
  
  // Infinite scroll state - INCREASED scroll bounds for larger void space
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastPointerPos, setLastPointerPos] = useState({ x: 0, y: 0 })
  const scrollBounds = { width: 8000, height: 6000 }

  // Frame state with drag support and collision detection - optimized
  const initialFrames = useMemo(() => [
    { id: 1, title: 'Frame1', fileName: 'File1', x: 400, y: 300, isDragging: false, isLoading: true },
    { id: 2, title: 'Frame2', fileName: 'File2', x: 1200, y: 400, isDragging: false, isLoading: false },
    { id: 3, title: 'Frame3', fileName: 'File3', x: 800, y: 800, isDragging: false, isLoading: true },
    { id: 4, title: 'Frame4', fileName: 'File4', x: 1600, y: 600, isDragging: false, isLoading: false },
    { id: 5, title: 'Frame5', fileName: 'File5', x: 600, y: 1200, isDragging: false, isLoading: true },
    { id: 6, title: 'Frame6', fileName: 'File6', x: 2400, y: 500, isDragging: false, isLoading: false },
    { id: 7, title: 'Frame7', fileName: 'File7', x: 2000, y: 1000, isDragging: false, isLoading: true },
    { id: 8, title: 'Frame8', fileName: 'File8', x: 3000, y: 700, isDragging: false, isLoading: false },
    { id: 9, title: 'Frame9', fileName: 'File9', x: 1000, y: 1600, isDragging: false, isLoading: false },
    { id: 10, title: 'Frame10', fileName: 'File10', x: 3500, y: 900, isDragging: false, isLoading: true },
    { id: 11, title: 'Frame11', fileName: 'File11', x: 2200, y: 1400, isDragging: false, isLoading: false },
    { id: 12, title: 'Frame12', fileName: 'File12', x: 4000, y: 1100, isDragging: false, isLoading: true },
  ], [])
  
  const [frames, setFrames] = useState(initialFrames)

  // Frame dimensions for collision detection
  const frameWidth = 320 // 80 * 4
  const frameHeight = 224 // 56 * 4 (average)

  // Collision detection helper - optimized
  const checkCollision = useCallback((newX, newY, frameId) => {
    const buffer = 20
    return frames.some(frame => {
      if (frame.id === frameId) return false
      
      return (
        newX < frame.x + frameWidth + buffer &&
        newX + frameWidth + buffer > frame.x &&
        newY < frame.y + frameHeight + buffer &&
        newY + frameHeight + buffer > frame.y
      )
    })
  }, [frames, frameWidth, frameHeight])

  // Frame drag handlers - optimized with useCallback
  const handleFrameDragStart = useCallback((frameId) => {
    setFrames(prev => prev.map(frame =>
      frame.id === frameId ? { ...frame, isDragging: true } : frame
    ))
  }, [])

  const handleFrameDrag = useCallback((frameId, newX, newY) => {
    // Check for collision
    if (checkCollision(newX, newY, frameId)) {
      return // Don't update position if collision detected
    }

    setFrames(prev => prev.map(frame =>
      frame.id === frameId ? { ...frame, x: Math.max(0, newX), y: Math.max(0, newY) } : frame
    ))
  }, [checkCollision])

  const handleFrameDragEnd = useCallback((frameId) => {
    setFrames(prev => prev.map(frame =>
      frame.id === frameId ? { ...frame, isDragging: false } : frame
    ))
  }, [])

  // Zoom handlers
  const handleZoom = useCallback((delta, centerX, centerY) => {
    const zoomFactor = delta > 0 ? 1.1 : 0.9
    const newZoom = Math.min(maxZoom, Math.max(minZoom, zoom * zoomFactor))
    
    if (newZoom === zoom) return

    // Calculate scroll position to zoom toward the center point
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const mouseX = centerX - rect.left
      const mouseY = centerY - rect.top
      
      const zoomRatio = newZoom / zoom
      const newScrollX = scrollPosition.x + (mouseX / zoom) * (zoomRatio - 1)
      const newScrollY = scrollPosition.y + (mouseY / zoom) * (zoomRatio - 1)
      
      setScrollPosition({ x: newScrollX, y: newScrollY })
    }
    
    setZoom(newZoom)
  }, [zoom, scrollPosition])

  // Enhanced scroll handler with zoom support - Now non-interfering
  useScrollHandler({
    canvasRef,
    scrollPosition,
    setScrollPosition,
    isDragging,
    setIsDragging,
    lastPointerPos,
    setLastPointerPos,
    scrollBounds,
    zoom,
    onZoom: handleZoom
  })

  // Panel handlers
  const handlePanelClose = (panelId) => {
    togglePanel(panelId)
  }

  const handlePanelMaximize = (panelId) => {
    console.log('Maximizing panel:', panelId)
  }

  // Handle tool actions
  const handleToolAction = useCallback((toolLabel) => {
    switch (toolLabel) {
      case 'New Frame':
        setShowFrameCreator(true)
        break
      case 'Frames':
        togglePanel('frames-panel')
        break
      case 'Project Files':
        togglePanel('files-panel')
        break
      default:
        console.log(`Action for ${toolLabel} not implemented yet`)
    }
  }, [togglePanel])

  // Handle frame creation success
  const handleFrameCreated = useCallback((newFrame) => {
    // Add the new frame to the frames state
    const canvasData = newFrame.canvas_data || {}
    const position = canvasData.position || { x: 400, y: 300 }
    
    const frameForState = {
      id: newFrame.id,
      title: newFrame.name,
      fileName: `${newFrame.name}.${newFrame.type}`,
      x: position.x,
      y: position.y,
      isDragging: false,
      isLoading: false,
      uuid: newFrame.uuid,
      type: newFrame.type
    }

    setFrames(prev => [...prev, frameForState])
  }, [])

  // Floating tools configuration
  const floatingTools = [
    { icon: Plus, label: 'New Frame', isPrimary: true, action: () => handleToolAction('New Frame') },
    { icon: Layers, label: 'Frames', isPrimary: false, action: () => handleToolAction('Frames') },
    { icon: FolderOpen, label: 'Project Files', isPrimary: false, action: () => handleToolAction('Project Files') },
    { icon: Code, label: 'Code Handler', isPrimary: false, action: () => handleToolAction('Code Handler') },
    { icon: Users, label: 'Team Collaborations', isPrimary: false, action: () => handleToolAction('Team Collaborations') },
    { icon: Upload, label: 'Import', isPrimary: false, action: () => handleToolAction('Import') },
    { icon: Briefcase, label: 'Project', isPrimary: false, action: () => handleToolAction('Project') }
  ]

  return (
    <AuthenticatedLayout>
      <Head title={`Void - ${project?.name || 'Project'}`} />
      <div 
        ref={canvasRef}
        className={`relative w-full h-screen overflow-hidden transition-colors duration-1000 ${
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
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          perspective: 1000
        }}
      >
        {/* Zoom indicator - centered and subtle */}
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-mono opacity-60 hover:opacity-90 transition-opacity duration-200">
          {Math.round(zoom * 100)}%
        </div>

        {/* Background Layers */}
        <BackgroundLayers isDark={isDark} scrollPosition={scrollPosition} />

        {/* Floating Toolbox with actions */}
        <FloatingToolbox tools={floatingTools} />

        {/* Delete Button - Enhanced */}
        <DeleteButton zoom={zoom} />
        
        {/* Frames Container with zoom and drag support */}
        <div 
          className="absolute inset-0 z-15" 
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: '0 0',
            willChange: 'transform' 
          }}
        >
          <FramesContainer 
            frames={frames} 
            scrollPosition={scrollPosition} 
            scrollBounds={scrollBounds}
            onFrameDragStart={handleFrameDragStart}
            onFrameDrag={handleFrameDrag}
            onFrameDragEnd={handleFrameDragEnd}
            zoom={zoom}
            isDark={isDark}
          />
        </div>
        
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
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-[var(--color-text)]">Frame Manager</h4>
                    <button
                      onClick={() => setShowFrameCreator(true)}
                      className="px-2 py-1 text-xs bg-[var(--color-primary)] text-white rounded hover:opacity-90 transition-opacity"
                    >
                      New Frame
                    </button>
                  </div>
                  <div className="space-y-2">
                    {frames.map((frame) => (
                      <div key={frame.id} className="p-3 rounded-lg bg-[var(--color-bg-muted)] border border-[var(--color-border)]">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[var(--color-primary)]" />
                          <span className="text-sm text-[var(--color-text)]">{frame.title}</span>
                          {frame.isLoading && (
                            <div className="ml-auto">
                              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ),
              closable: true
            }
          ]}
          allowedDockPositions={['right']}
          onPanelClose={handlePanelClose}
          onPanelMaximize={handlePanelMaximize}
        />

        {/* Frame Creator Modal */}
        <Modal
          show={showFrameCreator}
          onClose={() => setShowFrameCreator(false)}
          title="Create New Frame"
          maxWidth="lg"
          closeable={true}
          blurBackground={true}
        >
          <FrameCreator
            project={project}
            onFrameCreated={handleFrameCreated}
            onClose={() => setShowFrameCreator(false)}
          />
        </Modal>
      </div>
    </AuthenticatedLayout>
  )
}