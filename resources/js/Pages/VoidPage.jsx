import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { Head, usePage, router } from '@inertiajs/react'
import { Plus, Layers, FolderOpen, Code, Users, Upload, Briefcase } from 'lucide-react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import Panel from '@/Components/Panel'
import BackgroundLayers from '@/Components/Void/BackgroundLayers'
import FloatingToolbox from '@/Components/Void/FloatingToolbox'
import FramesContainer from '@/Components/Void/FramesContainer'
import DeleteButton from '@/Components/Void/DeleteButton'
import FrameCreator from '@/Components/Void/FrameCreator'
import ConfirmationDialog from '@/Components/ConfirmationDialog'
import Modal from '@/Components/Modal'
import { useScrollHandler } from '@/Components/Void/ScrollHandler'
import { useThemeStore } from '@/stores/useThemeStore'
import { useEditorStore } from '@/stores/useEditorStore'

export default function VoidPage() {
  const { project } = usePage().props
  const canvasRef = useRef(null)
  
  // Zustand stores
  const { isDark } = useThemeStore()
  const { panelStates, togglePanel } = useEditorStore()
  
  // Modal states
  const [showFrameCreator, setShowFrameCreator] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [frameToDelete, setFrameToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Zoom state
  const [zoom, setZoom] = useState(1)
  const minZoom = 0.25
  const maxZoom = 3
  
  // Infinite scroll state
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastPointerPos, setLastPointerPos] = useState({ x: 0, y: 0 })
  const scrollBounds = { width: 8000, height: 6000 }

  // Frame state
  const [frames, setFrames] = useState([])
  const [draggedFrame, setDraggedFrame] = useState(null)
  const [isFrameDragging, setIsFrameDragging] = useState(false)

  // Frame dimensions for collision detection
  const frameWidth = 320
  const frameHeight = 224

  // Load frames from database
  useEffect(() => {
    const loadFrames = async () => {
      try {
        const response = await fetch(`/api/projects/${project.uuid}/frames`, {
          headers: {
            'Accept': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
          }
        })

        if (response.ok) {
          const data = await response.json()
          const framesToState = data.frames.map(frame => ({
            id: frame.id,
            uuid: frame.uuid,
            title: frame.name,
            fileName: `${frame.name}.${frame.type}`,
            x: frame.canvas_data?.position?.x || Math.random() * 1000 + 200,
            y: frame.canvas_data?.position?.y || Math.random() * 600 + 200,
            isDragging: false,
            isLoading: false,
            type: frame.type
          }))
          setFrames(framesToState)
        }
      } catch (error) {
        console.error('Error loading frames:', error)
      }
    }

    if (project?.uuid) {
      loadFrames()
    }
  }, [project?.uuid])

  // Collision detection helper
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

  // Frame drag handlers
  const handleFrameDragStart = useCallback((frameId) => {
    setFrames(prev => prev.map(frame =>
      frame.id === frameId ? { ...frame, isDragging: true } : frame
    ))
    setDraggedFrame(frameId)
    setIsFrameDragging(true)
  }, [])

  const handleFrameDrag = useCallback((frameId, newX, newY) => {
    // Check for collision
    if (checkCollision(newX, newY, frameId)) {
      return
    }

    setFrames(prev => prev.map(frame =>
      frame.id === frameId ? { ...frame, x: Math.max(0, newX), y: Math.max(0, newY) } : frame
    ))
  }, [checkCollision])

  const handleFrameDragEnd = useCallback(async (frameId) => {
    setFrames(prev => prev.map(frame =>
      frame.id === frameId ? { ...frame, isDragging: false } : frame
    ))
    setDraggedFrame(null)
    setIsFrameDragging(false)

    // Update frame position in database
    const frame = frames.find(f => f.id === frameId)
    if (frame) {
      try {
        await fetch(`/api/frames/${frame.uuid}/position`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
          },
          body: JSON.stringify({
            x: frame.x,
            y: frame.y
          })
        })
      } catch (error) {
        console.error('Error updating frame position:', error)
      }
    }
  }, [frames])

  // Handle frame drop on delete button
  const handleFrameDropDelete = useCallback(() => {
    if (draggedFrame) {
      const frame = frames.find(f => f.id === draggedFrame)
      if (frame) {
        setFrameToDelete(frame)
        setShowDeleteConfirmation(true)
      }
    }
  }, [draggedFrame, frames])

  // Delete frame confirmation
  const handleDeleteFrame = async () => {
    if (!frameToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/frames/${frameToDelete.uuid}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      })

      if (response.ok) {
        setFrames(prev => prev.filter(frame => frame.id !== frameToDelete.id))
        setShowDeleteConfirmation(false)
        setFrameToDelete(null)
      } else {
        console.error('Failed to delete frame')
      }
    } catch (error) {
      console.error('Error deleting frame:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle frame click for navigation
  const handleFrameClick = useCallback((frame) => {
    // Navigate to forge page with frame UUID in URL
    router.visit(`/void/${project.uuid}/frame=${frame.uuid}/modeForge`)
  }, [project?.uuid])

  // Zoom handlers
  const handleZoom = useCallback((delta, centerX, centerY) => {
    const zoomFactor = delta > 0 ? 1.1 : 0.9
    const newZoom = Math.min(maxZoom, Math.max(minZoom, zoom * zoomFactor))
    
    if (newZoom === zoom) return

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

  // Scroll handler
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
  const handleFrameCreated = useCallback(async (newFrame) => {
    // If newFrame is null, it means we need to reload frames from server
    if (!newFrame) {
      // Reload frames from database
      try {
        const response = await fetch(`/api/projects/${project.uuid}/frames`, {
          headers: {
            'Accept': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
          }
        })

        if (response.ok) {
          const data = await response.json()
          const framesToState = data.frames.map(frame => ({
            id: frame.id,
            uuid: frame.uuid,
            title: frame.name,
            fileName: `${frame.name}.${frame.type}`,
            x: frame.canvas_data?.position?.x || Math.random() * 1000 + 200,
            y: frame.canvas_data?.position?.y || Math.random() * 600 + 200,
            isDragging: false,
            isLoading: false,
            type: frame.type
          }))
          setFrames(framesToState)
        }
      } catch (error) {
        console.error('Error reloading frames:', error)
      }
      return
    }

    // Original logic for direct frame data
    const canvasData = newFrame.canvas_data || {}
    const position = canvasData.position || { x: 400, y: 300 }
    
    const frameForState = {
      id: newFrame.id,
      uuid: newFrame.uuid,
      title: newFrame.name,
      fileName: `${newFrame.name}.${newFrame.type}`,
      x: position.x,
      y: position.y,
      isDragging: false,
      isLoading: false,
      type: newFrame.type
    }

    setFrames(prev => [...prev, frameForState])
  }, [project?.uuid])

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
        {/* Zoom indicator */}
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-mono opacity-60 hover:opacity-90 transition-opacity duration-200">
          {Math.round(zoom * 100)}%
        </div>

        {/* Background Layers */}
        <BackgroundLayers isDark={isDark} scrollPosition={scrollPosition} />

        {/* Floating Toolbox */}
        <FloatingToolbox tools={floatingTools} />

        {/* Delete Button - Now on the right */}
        <DeleteButton 
          zoom={zoom} 
          onFrameDrop={handleFrameDropDelete}
          isDragActive={isFrameDragging}
        />
        
        {/* Frames Container */}
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
            onFrameClick={handleFrameClick}
            zoom={zoom}
            isDark={isDark}
          />
        </div>
        
        {/* Dockable Panel */}
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

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          show={showDeleteConfirmation}
          onClose={() => {
            setShowDeleteConfirmation(false)
            setFrameToDelete(null)
          }}
          onConfirm={handleDeleteFrame}
          type="delete"
          title="Delete Frame"
          message={`Are you sure you want to delete "${frameToDelete?.title}"? This action cannot be undone and will permanently remove the frame and all its content.`}
          confirmText="Delete Frame"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </AuthenticatedLayout>
  )
}