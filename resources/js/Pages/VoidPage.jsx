// Pages/VoidPage.jsx - Modified sections only
import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { Head, usePage, router } from '@inertiajs/react'
import { Plus, Layers, FolderOpen, Code, Users, Upload, Briefcase, UserPlus } from 'lucide-react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import Panel from '@/Components/Panel'
import BackgroundLayers from '@/Components/Void/BackgroundLayers'
import FloatingToolbox from '@/Components/Void/FloatingToolbox'
import FramesContainer from '@/Components/Void/FramesContainer'
import DeleteButton from '@/Components/Void/DeleteButton'
import FrameCreator from '@/Components/Void/FrameCreator'
import ConfirmationDialog from '@/Components/ConfirmationDialog'
import Modal from '@/Components/Modal'
import InfiniteGrid from '@/Components/Void/InfiniteGrid'
import LockRequestNotificationManager from '@/Components/Void/LockRequestNotificationManager'
import NotificationToastContainer from '@/Components/Notifications/NotificationToast'
import { useScrollHandler } from '@/Components/Void/ScrollHandler'
import { useThemeStore } from '@/stores/useThemeStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import useFrameLockStore from '@/stores/useFrameLockStore'

// Import panel components
import FramesPanel from '@/Components/Void/FramesPanel'
import ProjectFilesPanel from '@/Components/Void/ProjectFilesPanel'
import CodeHandlerPanel from '@/Components/Void/CodeHandlerPanel'
import TeamCollaborationPanel from '@/Components/Void/TeamCollaborationPanel'

import CreateWorkspaceModal from '@/Components/Workspaces/CreateWorkspaceModal'
import InviteModal from '@/Components/Workspaces/InviteModal'
import ProjectSwitcherModal from '@/Components/Void/ProjectSwitcherModal'



export default function VoidPage() {
  const { project, auth } = usePage().props
  const user = auth?.user
  const canvasRef = useRef(null)
  
  // Zustand stores
  const { isDark } = useThemeStore()
  const { 
    panelStates, 
    togglePanel, 
    isPanelOpen, 
    getOpenPanelsCount, 
    zoomLevel, 
    setZoomLevel,
    gridVisible, 
    setGridVisible
  } = useEditorStore()
  
  const { 
    currentWorkspace,
    workspaces 
  } = useWorkspaceStore()
  
  const { 
    initialize: initializeLockSystem, 
    setLockStatus,
    lockRequests,
    getPendingRequestsCount,
    echoConnected 
  } = useFrameLockStore()
  
  // Modal states
  const [showFrameCreator, setShowFrameCreator] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [frameToDelete, setFrameToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fixed zoom state - use store directly with minimal local state
  const zoom = useMemo(() => zoomLevel / 100, [zoomLevel])
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
  
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showProjectSwitcher, setShowProjectSwitcher] = useState(false)


  // Frame dimensions for collision detection
  const frameWidth = 320
  const frameHeight = 224

  // Initialize frame lock system
  useEffect(() => {
    if (user?.id && !echoConnected) {
      console.log('Initializing frame lock system for user:', user.id)
      initializeLockSystem(user.id)
    }
  }, [user?.id, initializeLockSystem, echoConnected])

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
          const framesToState = data.frames.map((frame, index) => {
            // Enhanced frame mapping with GitHub import detection
            const isGithubImport = frame.settings?.imported_from_github || 
                                  frame.canvas_data?.github_imported ||
                                  frame.canvas_data?.github_file;
            
            // Get GitHub file metadata if available
            const githubFile = frame.canvas_data?.github_file;
            
            return {
              id: frame.id,
              uuid: frame.uuid,
              title: frame.name,
              fileName: isGithubImport 
                ? (githubFile?.filename || `${frame.name}.${githubFile?.extension || frame.type}`)
                : `${frame.name}.${frame.type}`,
              x: frame.canvas_data?.position?.x || (200 + (index % 4) * 350),
              y: frame.canvas_data?.position?.y || (200 + Math.floor(index / 4) * 350),
              isDragging: false,
              isLoading: false,
              type: frame.type,
              settings: frame.settings,
              // GitHub-specific metadata
              githubFile: githubFile || null,
              isGithubImport: isGithubImport,
              complexity: githubFile?.estimated_complexity || 'simple',
              // Additional GitHub display info
              githubPath: githubFile?.path || null,
              githubExtension: githubFile?.extension || null
            }
          })
          
          // Sort frames: GitHub imports first, then by creation date
          framesToState.sort((a, b) => {
            if (a.isGithubImport && !b.isGithubImport) return -1;
            if (!a.isGithubImport && b.isGithubImport) return 1;
            return 0;
          });
          
          setFrames(framesToState)

          // Load lock status for each frame
          framesToState.forEach(frame => {
            if (frame.lock_status) {
              setLockStatus(frame.uuid, frame.lock_status)
            }
          })
          
          // Auto-focus on GitHub imported frames if this is a fresh import
          const githubFrames = framesToState.filter(f => f.isGithubImport);
          if (githubFrames.length > 0 && !sessionStorage.getItem(`viewed-${project.uuid}`)) {
            // Center view on first GitHub frame
            const firstFrame = githubFrames[0];
            setScrollPosition({ 
              x: Math.max(0, firstFrame.x - 400), 
              y: Math.max(0, firstFrame.y - 300) 
            });
            
            // Mark as viewed to prevent auto-centering on subsequent visits
            sessionStorage.setItem(`viewed-${project.uuid}`, 'true');
            
            // Add visual highlight effect for GitHub imported frames
            setTimeout(() => {
              githubFrames.forEach(frame => {
                const frameElement = document.querySelector(`[data-frame-uuid="${frame.uuid}"]`);
                if (frameElement) {
                  frameElement.style.transition = 'all 0.8s ease-out';
                  frameElement.style.transform = 'scale(1.05)';
                  frameElement.style.boxShadow = '0 0 30px rgba(34, 197, 94, 0.5)';
                  
                  setTimeout(() => {
                    frameElement.style.transform = 'scale(1)';
                    frameElement.style.boxShadow = '';
                  }, 2000);
                }
              });
            }, 500);
            
            // Show import success notification
            if (githubFrames.length > 0) {
              const pages = githubFrames.filter(f => f.type === 'page').length;
              const components = githubFrames.filter(f => f.type === 'component').length;
              
              let message = `Successfully imported ${githubFrames.length} frame${githubFrames.length > 1 ? 's' : ''}`;
              if (pages > 0) message += ` (${pages} page${pages > 1 ? 's' : ''})`;
              if (components > 0) message += ` ${pages > 0 ? 'and ' : ''}(${components} component${components > 1 ? 's' : ''})`;
              
              console.log(`🎉 ${message} from GitHub repository!`);
            }
          }
        }
      } catch (error) {
        console.error('Error loading frames:', error)
      }
    }

    if (project?.uuid) {
      loadFrames()
    }
  }, [project?.uuid, setLockStatus])

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

  // Fixed zoom handlers - 1% increments only, real-time updates
  const handleZoom = useCallback((delta, centerX = null, centerY = null) => {
    // For 1% increments from toolbar
    if (typeof delta === 'number' && Math.abs(delta) === 1) {
      const newZoomLevel = Math.min(300, Math.max(25, zoomLevel + delta))
      setZoomLevel(newZoomLevel)
      return
    }
    
    // For smooth zoom from mouse/wheel (convert to percentage steps)
    const zoomStep = delta > 0 ? 5 : -5 // 5% steps for smooth zoom
    const newZoomLevel = Math.min(300, Math.max(25, zoomLevel + zoomStep))
    
    if (newZoomLevel === zoomLevel) return

    if (centerX !== null && centerY !== null) {
      const canvas = canvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        const mouseX = centerX - rect.left
        const mouseY = centerY - rect.top
        
        const oldZoom = zoomLevel / 100
        const newZoom = newZoomLevel / 100
        const zoomRatio = newZoom / oldZoom
        
        const newScrollX = scrollPosition.x + (mouseX / oldZoom) * (zoomRatio - 1)
        const newScrollY = scrollPosition.y + (mouseY / oldZoom) * (zoomRatio - 1)
        
        setScrollPosition({ x: newScrollX, y: newScrollY })
      }
    }
    
    setZoomLevel(newZoomLevel)
  }, [zoomLevel, scrollPosition, setZoomLevel])

  // Scroll handler with fixed zoom support
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
      case 'Import':
        console.log('Import action - redirect to project creation with import tab')
        // You can implement import logic here or redirect to project page
        break
      case 'Project':
        setShowProjectSwitcher(true)
        break
      case 'Invite to Workspace':
        setShowInviteModal(true)
        break
      case 'Create Workspace':
        setShowCreateWorkspace(true)
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
            const newFrameElement = document.querySelector(`[data-frame-uuid="${newestFrame.uuid}"]`)
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
      badge: getPendingRequestsCount() > 0 ? getPendingRequestsCount() : null,
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
    },
    // Add new workspace management tools
    ...(currentWorkspace && currentWorkspace.type !== 'personal' ? [{
      icon: UserPlus,
      label: 'Invite to Workspace',
      isPrimary: false,
      action: () => handleToolAction('Invite to Workspace')
    }] : []),
    {
      icon: Plus,
      label: 'Create Workspace',
      isPrimary: false,
      action: () => handleToolAction('Create Workspace')
    }
  ], [handleToolAction, isPanelOpen, getPendingRequestsCount, currentWorkspace])


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
        closable: true,
        badge: getPendingRequestsCount() > 0 ? getPendingRequestsCount() : null
      })
    }
    
    return panels
  }, [panelStates, getPendingRequestsCount])

  // Check if any panels are open
  const hasOpenPanels = getOpenPanelsCount() > 0

  return (
    <AuthenticatedLayout 
      gridVisible={gridVisible} 
      setGridVisible={setGridVisible}
      zoomLevel={zoomLevel}
      onZoomChange={handleZoom}
      project={project}
      frame={null}
    >
      <Head title={`Void - ${project?.name || 'Project'}`} />
      <div 
        ref={canvasRef}
        data-canvas="true"
        className={`relative w-full h-screen overflow-hidden ${
          isDark 
            ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
            : 'bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50'
        }`}
        style={{
          backgroundColor: isDark ? 'var(--color-bg)' : 'var(--color-bg)',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {/* Background Layers - z-index: 5 */}
        <BackgroundLayers isDark={isDark} scrollPosition={scrollPosition} />

        {/* Infinite Grid - z-index: 8 (behind frames but above background) */}
        <InfiniteGrid
          isVisible={gridVisible}
          scrollPosition={scrollPosition}
          zoom={zoom}
          isDark={isDark}
          scrollBounds={scrollBounds}
        />

        {/* Frames Container - z-index: 15 (above grid) */}
        <div 
          className="absolute inset-0"
          style={{ 
            zIndex: 15,
            transform: `scale(${zoom}) translateZ(0)`,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
        >
          <FramesContainer 
            frames={frames} 
            scrollPosition={scrollPosition} 
            scrollBounds={scrollBounds}
            setScrollPosition={setScrollPosition}
            onFrameDragStart={handleFrameDragStart}
            onFrameDrag={handleFrameDrag}
            onFrameDragEnd={handleFrameDragEnd}
            onFrameClick={handleFrameClick}
            zoom={zoom}
            isDark={isDark}
          />
        </div>

        {/* UI Elements - z-index: 20+ (above everything) */}
        <FloatingToolbox tools={floatingTools} />

        <DeleteButton 
          zoom={zoom} 
          onFrameDrop={handleFrameDropDelete}
          isDragActive={isFrameDragging}
        />
        
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
        
        {/* Project Switcher Modal */}
        <ProjectSwitcherModal
          show={showProjectSwitcher}
          onClose={() => setShowProjectSwitcher(false)}
          currentProject={project}
        />
  
        {/* Create Workspace Modal */}
        <CreateWorkspaceModal 
          show={showCreateWorkspace}
          onClose={() => setShowCreateWorkspace(false)}
        />
  
        {/* Invite Modal */}
        <InviteModal
          show={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          workspaceId={currentWorkspace?.uuid}
          forceInviteMode={true}
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

        {/* Lock Request Notifications */}
        <LockRequestNotificationManager
          position="bottom-right"
          maxVisibleRequests={3}
        />

        {/* System Notifications */}
        <NotificationToastContainer
          position="top-right"
        />
      </div>
    </AuthenticatedLayout>
  )
}