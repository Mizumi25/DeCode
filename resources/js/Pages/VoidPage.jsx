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

// Import panel components
import FramesPanel from '@/Components/Void/FramesPanel'
import ProjectFilesPanel from '@/Components/Void/ProjectFilesPanel'
import CodeHandlerPanel from '@/Components/Void/CodeHandlerPanel'
import TeamCollaborationPanel from '@/Components/Void/TeamCollaborationPanel'

export default function VoidPage() {
  const { project } = usePage().props
  const canvasRef = useRef(null)
  
  // Zustand stores
  const { isDark } = useThemeStore()
  const { panelStates, togglePanel, isPanelOpen, getOpenPanelsCount } = useEditorStore()
  
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
            type: frame.type,
            settings: frame.settings
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

  // Enhanced tool actions with panel toggling
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
      case 'Code Handler':
        togglePanel('code-panel')
        break
      case 'Team Collaborations':
        togglePanel('team-panel')
        break
      default:
        console.log(`Action for ${toolLabel} not implemented yet`)
    }
  }, [togglePanel])

  // Handle frame creation success
  const handleFrameCreated = useCallback(async (newFrame) => {
    setShowFrameCreator(false)
    
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
          type: frame.type,
          settings: frame.settings
        }))
        setFrames(framesToState)

        const newestFrame = data.frames[0]
        if (newestFrame && newestFrame.canvas_data?.position) {
          const targetX = newestFrame.canvas_data.position.x - 400
          const targetY = newestFrame.canvas_data.position.y - 300
          
          setScrollPosition({ x: targetX, y: targetY })
          
          setTimeout(() => {
            const newFrameElement = document.querySelector(`[data-frame-id="${newestFrame.uuid}"]`)
            if (newFrameElement) {
              newFrameElement.style.transition = 'all 0.5s ease-out'
              newFrameElement.style.transform = 'scale(1.05)'
              newFrameElement.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.5)'
              
              setTimeout(() => {
                newFrameElement.style.transform = 'scale(1)'
                newFrameElement.style.boxShadow = ''
              }, 1000)
            }
          }, 100)
        }
      }
    } catch (error) {
      console.error('Error reloading frames:', error)
    }
  }, [project?.uuid])

  // Enhanced floating tools configuration with visual feedback for active panels
  const floatingTools = useMemo(() => [
    { 
      icon: Plus, 
      label: 'New Frame', 
      isPrimary: true, 
      action: () => handleToolAction('New Frame') 
    },
    { 
      icon: Layers, 
      label: 'Frames', 
      isPrimary: false, 
      isActive: isPanelOpen('frames-panel'),
      action: () => handleToolAction('Frames') 
    },
    { 
      icon: FolderOpen, 
      label: 'Project Files', 
      isPrimary: false, 
      isActive: isPanelOpen('files-panel'),
      action: () => handleToolAction('Project Files') 
    },
    { 
      icon: Code, 
      label: 'Code Handler', 
      isPrimary: false, 
      isActive: isPanelOpen('code-panel'),
      action: () => handleToolAction('Code Handler') 
    },
    { 
      icon: Users, 
      label: 'Team Collaborations', 
      isPrimary: false, 
      isActive: isPanelOpen('team-panel'),
      action: () => handleToolAction('Team Collaborations') 
    },
    { 
      icon: Upload, 
      label: 'Import', 
      isPrimary: false, 
      action: () => handleToolAction('Import') 
    },
    { 
      icon: Briefcase, 
      label: 'Project', 
      isPrimary: false, 
      action: () => handleToolAction('Project') 
    }
  ], [handleToolAction, isPanelOpen])

  // Dynamic panel configuration based on state
  const activePanels = useMemo(() => {
    const panels = []
    
    if (panelStates['frames-panel']) {
      panels.push({
        id: 'frames-panel',
        title: 'Frames',
        content: <FramesPanel />,
        closable: true
      })
    }
    
    if (panelStates['files-panel']) {
      panels.push({
        id: 'files-panel', 
        title: 'Project Files',
        content: <ProjectFilesPanel />,
        closable: true
      })
    }
    
    if (panelStates['code-panel']) {
      panels.push({
        id: 'code-panel',
        title: 'Code Handler', 
        content: <CodeHandlerPanel />,
        closable: true
      })
    }
    
    if (panelStates['team-panel']) {
      panels.push({
        id: 'team-panel',
        title: 'Team Collaboration',
        content: <TeamCollaborationPanel />,
        closable: true
      })
    }
    
    return panels
  }, [panelStates])

  // Check if any panels are open
  const hasOpenPanels = getOpenPanelsCount() > 0

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

        {/* Delete Button */}
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
        
        {/* Dynamic Dockable Panel System */}
        {hasOpenPanels && (
          <Panel
            isOpen={true}
            panels={activePanels}
            allowedDockPositions={['right']}
            onPanelClose={handlePanelClose}
            onPanelMaximize={handlePanelMaximize}
          />
        )}

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