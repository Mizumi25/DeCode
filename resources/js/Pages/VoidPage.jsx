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

// ADD these imports at the top:
import {
  DndContext,
  PointerSensor,
  TouchSensor, // ADD THIS IMPORT
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import gsap from 'gsap'


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
  // Add after other state declarations
  const zoomContainerRef = useRef(null)
  const [isZooming, setIsZooming] = useState(false)

  // Fixed zoom state - use store directly with minimal local state
  const zoom = useMemo(() => zoomLevel / 100, [zoomLevel])
  const minZoom = 0.25
  const maxZoom = 3
  
  // Infinite scroll state
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastPointerPos, setLastPointerPos] = useState({ x: 0, y: 0 })

  const scrollBounds = { width: 50000, height: 50000 } // TRUE infinite space

  // Frame state
  const [frames, setFrames] = useState([])
  const [draggedFrame, setDraggedFrame] = useState(null)
  const [isFrameDragging, setIsFrameDragging] = useState(false)
  
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showProjectSwitcher, setShowProjectSwitcher] = useState(false)
  
  // ADD this after your state declarations
  const touchStateRef = useRef({
    initialDistance: 0,
    initialZoom: zoomLevel,
    isZooming: false
  })


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


const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5, // Slightly larger to prevent accidental drags
    },
  })
)

// FIXED drag handlers with proper position updates
const handleDragStart = useCallback((event) => {
  const frameId = event.active.id
  console.log('Drag start:', frameId)
  
  setDraggedFrame(frameId)
  setIsFrameDragging(true)
  
  setFrames(prev => prev.map(frame =>
    frame.id === frameId ? { ...frame, isDragging: true } : frame
  ))
}, [])

const handleDragMove = useCallback((event) => {
  // REMOVED: Don't update position during drag, let DnD Kit handle transform
}, [])

const handleDragEnd = useCallback(async (event) => {
  const frameId = event.active.id
  const { delta } = event
  
  console.log('Drag end:', frameId, 'Delta:', delta)
  
  // CRITICAL: Update actual position based on delta
  setFrames(prev => prev.map(frame => {
    if (frame.id !== frameId) return frame
    
    // Calculate new position with wrapping
    let newX = frame.x + (delta.x / zoom)
    let newY = frame.y + (delta.y / zoom)
    
    // Wrap positions within bounds (INFINITE LOOP EFFECT) - properly handle negatives
    while (newX < 0) newX += scrollBounds.width
    while (newX >= scrollBounds.width) newX -= scrollBounds.width
    while (newY < 0) newY += scrollBounds.height
    while (newY >= scrollBounds.height) newY -= scrollBounds.height
    
    return {
      ...frame,
      x: newX,
      y: newY,
      isDragging: false
    }
  }))
  
  setDraggedFrame(null)
  setIsFrameDragging(false)

  // Save position to backend
  const frame = frames.find(f => f.id === frameId)
  if (frame) {
    let newX = frame.x + (delta.x / zoom)
    let newY = frame.y + (delta.y / zoom)
    
    // Wrap positions - properly handle negatives
    while (newX < 0) newX += scrollBounds.width
    while (newX >= scrollBounds.width) newX -= scrollBounds.width
    while (newY < 0) newY += scrollBounds.height
    while (newY >= scrollBounds.height) newY -= scrollBounds.height
    
    try {
      await fetch(`/api/frames/${frame.uuid}/position`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({ x: newX, y: newY })
      })
    } catch (error) {
      console.error('Error updating frame position:', error)
    }
  }
}, [frames, zoom, scrollBounds])



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

// In your VoidPage.jsx, update the handleZoom function:
const handleZoom = useCallback((delta, centerX = null, centerY = null) => {
  const zoomStep = typeof delta === 'number' ? delta : (delta > 0 ? 10 : -10)
  const newZoomLevel = Math.min(300, Math.max(25, zoomLevel + zoomStep))
  
  console.log('VoidPage: Zoom changing to', newZoomLevel) // Debug log
  
  if (newZoomLevel === zoomLevel) return

  // Figma-like zoom to point
  if (centerX !== null && centerY !== null && canvasRef.current) {
    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = centerX - rect.left
    const mouseY = centerY - rect.top
    
    const oldZoom = zoomLevel / 100
    const newZoom = newZoomLevel / 100
    
    if (oldZoom > 0 && newZoom > 0) {
      const zoomFactor = newZoom / oldZoom
      const newScrollX = scrollPosition.x + (mouseX / oldZoom) * (1 - 1/zoomFactor)
      const newScrollY = scrollPosition.y + (mouseY / oldZoom) * (1 - 1/zoomFactor)
      
      setScrollPosition({ 
        x: Math.max(0, Math.min(scrollBounds.width - window.innerWidth / newZoom, newScrollX)),
        y: Math.max(0, Math.min(scrollBounds.height - window.innerHeight / newZoom, newScrollY))
      })
    }
  }
  
  // CRITICAL: Update store zoom level
  setZoomLevel(newZoomLevel)
}, [zoomLevel, scrollPosition, setZoomLevel, setScrollPosition, scrollBounds])




// REPLACE the handlePinchZoom function with this:
const handlePinchZoom = useCallback((event) => {
  if (event.touches.length !== 2) return
  
  event.preventDefault()
  event.stopPropagation()
  
  const touch1 = event.touches[0]
  const touch2 = event.touches[1]
  
  const distance = Math.hypot(
    touch1.clientX - touch2.clientX,
    touch1.clientY - touch2.clientY
  )
  
  if (!touchStateRef.current.initialDistance) {
    touchStateRef.current = {
      initialDistance: distance,
      initialZoom: zoomLevel,
      isZooming: true
    }
    setIsZooming(true)
    return
  }
  
  const zoomChange = distance / touchStateRef.current.initialDistance
  const newZoomLevel = Math.min(300, Math.max(25, touchStateRef.current.initialZoom * zoomChange))
  
  // Calculate center point between two touches
  const centerX = (touch1.clientX + touch2.clientX) / 2
  const centerY = (touch1.clientY + touch2.clientY) / 2
  
  // Update zoom level in store
  setZoomLevel(Math.round(newZoomLevel))
  
  // Update scroll position to zoom to center point
  if (canvasRef.current) {
    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = centerX - rect.left
    const mouseY = centerY - rect.top
    
    const oldZoom = touchStateRef.current.initialZoom / 100
    const newZoom = newZoomLevel / 100
    
    if (oldZoom > 0 && newZoom > 0) {
      const zoomChangeFactor = newZoom / oldZoom
      const newScrollX = scrollPosition.x + (mouseX / oldZoom) * (1 - 1/zoomChangeFactor)
      const newScrollY = scrollPosition.y + (mouseY / oldZoom) * (1 - 1/zoomChangeFactor)
      
      setScrollPosition({ 
        x: Math.max(0, Math.min(scrollBounds.width - window.innerWidth / newZoom, newScrollX)),
        y: Math.max(0, Math.min(scrollBounds.height - window.innerHeight / newZoom, newScrollY))
      })
    }
  }
}, [zoomLevel, scrollPosition, setZoomLevel, setScrollPosition, scrollBounds])



// ADD after handlePinchZoom
const handleTouchEnd = useCallback(() => {
  touchStateRef.current = {
    initialDistance: 0,
    initialZoom: zoomLevel,
    isZooming: false
  }
  setIsZooming(false)
}, [zoomLevel])




// UPDATE the scroll handler usage:
useScrollHandler({
  canvasRef,
  scrollPosition,
  setScrollPosition,
  isDragging,
  setIsDragging,
  lastPointerPos,
  setLastPointerPos,
  scrollBounds,
  zoom: zoomLevel / 100, // Pass the actual zoom level from store
  onZoom: handleZoom,
  onPinchZoom: handlePinchZoom,
  onTouchEnd: handleTouchEnd
})

// FORCE: Ensure scroll bounds are always respected
useEffect(() => {
  console.log('🌌 SCROLL BOUNDS:', scrollBounds)
  console.log('📍 Current scroll:', scrollPosition)
  console.log('🖼️ Frame positions:', frames.map(f => ({ id: f.id, x: f.x, y: f.y })))
}, [scrollBounds, scrollPosition, frames])

  // Panel handlers
  const handlePanelClose = (panelId) => {
    togglePanel(panelId)
  }

  const handlePanelMaximize = (panelId) => {
    console.log('Maximizing panel:', panelId)
  }

  // CENTER / NAVIGATE to a frame and animate scroll
  const handleSelectFrame = useCallback((frame) => {
    if (!frame || !canvasRef.current) return

    const vw = window.innerWidth
    const vh = window.innerHeight
    const currentZoom = zoom || 1

    // Compute target scroll so the frame's center becomes viewport center
    const targetX = Math.max(
      0,
      Math.min(
        scrollBounds.width - vw / currentZoom,
        frame.x - (vw / (2 * currentZoom)) + (frameWidth / 2)
      )
    )

    const targetY = Math.max(
      0,
      Math.min(
        scrollBounds.height - vh / currentZoom,
        frame.y - (vh / (2 * currentZoom)) + (frameHeight / 2)
      )
    )

    // Animate scrollPosition to target using gsap for a smooth auto-scroll "camera" effect
    gsap.killTweensOf(scrollPosition) // ensure no duplicates
    gsap.to(scrollPosition, {
      x: targetX,
      y: targetY,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => {
        // Use setter so React state updates and UI re-renders with latest values
        setScrollPosition({ x: scrollPosition.x, y: scrollPosition.y })
      },
      onComplete: () => {
        setScrollPosition({ x: targetX, y: targetY })
      }
    })
  }, [scrollBounds, frameWidth, frameHeight, setScrollPosition, zoom, scrollPosition])

  // Immediate delete (called from FramesPanel)
  const handleImmediateDeleteFrame = useCallback(async (frame) => {
    if (!frame) return
    if (!confirm(`Delete frame "${frame.title}"? This cannot be undone.`)) return

    try {
      const response = await fetch(`/api/frames/${frame.uuid}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      })

      if (response.ok) {
        setFrames(prev => prev.filter(f => f.id !== frame.id))
      } else {
        console.error('Failed to delete frame')
        alert('Failed to delete frame')
      }
    } catch (err) {
      console.error('Error deleting frame:', err)
      alert('Error deleting frame')
    }
  }, [])

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
        // pass frames and handlers so panel can center, create and delete frames
        content: (
          <FramesPanel 
            frames={frames}
            onSelectFrame={handleSelectFrame}
            onDeleteFrame={handleImmediateDeleteFrame}
            onAddFrame={() => setShowFrameCreator(true)}
            zoom={zoom}
          />
        ),
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
     <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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
        // CRITICAL: Remove min-width/min-height constraints
        cursor: isDragging ? 'grabbing' : 'grab',
        position: 'relative',
        overflow: 'hidden'
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
            onFrameClick={handleFrameClick}  // KEEP this
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
      </DndContext>
    </AuthenticatedLayout>
  )
}