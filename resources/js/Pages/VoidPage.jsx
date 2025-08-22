import { useRef, useState, useCallback, useMemo } from 'react'
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
  
  // Zoom state
  const [zoom, setZoom] = useState(1)
  const minZoom = 0.25
  const maxZoom = 3
  
  // Infinite scroll state - INCREASED scroll bounds for larger void space
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastPointerPos, setLastPointerPos] = useState({ x: 0, y: 0 })
  const scrollBounds = { width: 8000, height: 6000 } // INCREASED from 6000x4000

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

  // Enhanced scroll handler with zoom support
  const enhancedScrollHandler = useScrollHandler({
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

  // Override the wheel handler to include zoom
  const handleWheel = useCallback((e) => {
    // Don't handle wheel events on frames
    if (e.target.closest('.preview-frame')) {
      return
    }
    
    if (e.ctrlKey || e.metaKey) {
      // Zoom with Ctrl/Cmd + wheel
      handleZoom(-e.deltaY, e.clientX, e.clientY)
    } else {
      // Regular scroll with zoom-adjusted sensitivity
      const sensitivity = 0.2 / zoom
      const deltaX = e.deltaX * sensitivity
      const deltaY = e.deltaY * sensitivity
      
      setScrollPosition(prev => {
        let newX = prev.x + deltaX
        let newY = prev.y + deltaY
        
        newX = ((newX % scrollBounds.width) + scrollBounds.width) % scrollBounds.width
        newY = ((newY % scrollBounds.height) + scrollBounds.height) % scrollBounds.height
        
        return { x: newX, y: newY }
      })
    }
    e.preventDefault()
  }, [zoom, scrollBounds, setScrollPosition, handleZoom])

  // Touch handlers that don't interfere with frames
  const handleTouchStart = (e) => {
    if (e.target.closest('.preview-frame')) {
      return
    }
    
    if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches)
      const center = getTouchCenter(e.touches)
      setTouchDistance(distance)
      setLastTouchCenter(center)
      e.preventDefault()
    }
  }

  const handleTouchMove = (e) => {
    if (e.target.closest('.preview-frame')) {
      return
    }
    
    if (e.touches.length === 2 && touchDistance > 0) {
      const newDistance = getTouchDistance(e.touches)
      const newCenter = getTouchCenter(e.touches)
      
      // Handle pinch zoom
      const scale = newDistance / touchDistance
      const zoomDelta = scale > 1 ? 1 : -1
      handleZoom(zoomDelta * 10, newCenter.x, newCenter.y)
      
      setTouchDistance(newDistance)
      setLastTouchCenter(newCenter)
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      setTouchDistance(0)
    }
  }

  // Touch pinch zoom handling
  const [touchDistance, setTouchDistance] = useState(0)
  const [lastTouchCenter, setLastTouchCenter] = useState({ x: 0, y: 0 })

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getTouchCenter = (touches) => {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    }
  }

  

  
  

  // Panel handlers
  const handlePanelClose = (panelId) => {
    togglePanel(panelId)
  }

  const handlePanelMaximize = (panelId) => {
    console.log('Maximizing panel:', panelId)
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Zoom indicator - centered and subtle */}
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-mono opacity-60 hover:opacity-90 transition-opacity duration-200">
          {Math.round(zoom * 100)}%
        </div>

        {/* Background Layers */}
        <BackgroundLayers isDark={isDark} scrollPosition={scrollPosition} />

        {/* Floating Toolbox */}
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
                  <h4 className="font-semibold mb-4 text-[var(--color-text)]">Frame Manager</h4>
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
      </div>
    </AuthenticatedLayout>
  )
}