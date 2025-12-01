// Pages/VoidPage.jsx - Modified sections only
import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { Head, usePage, router } from '@inertiajs/react'
import { Plus, Layers, FolderOpen, Code, Users, Upload, Briefcase, UserPlus, Camera } from 'lucide-react'
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
import { useCanvasSnapshot } from '@/hooks/useCanvasSnapshot'
import { useVoidSnapshot } from '@/hooks/useVoidSnapshot'

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
    workspaces,
    setCurrentWorkspace
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
 
  const scrollPositionRef = useRef(scrollPosition)
const zoomLevelRef = useRef(zoomLevel)

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

  // Comments: real-time channel and overlay rect
  const [commentChannelJoined, setCommentChannelJoined] = useState(false)
  const [overlayRect, setOverlayRect] = useState(null)
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [activeComment, setActiveComment] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [modalPos, setModalPos] = useState({ left: 0, top: 0 })


  // Frame dimensions for collision detection
  const frameWidth = 320
  const frameHeight = 224

  // Update current workspace based on project's workspace
  useEffect(() => {
    if (project?.workspace_id && workspaces.length > 0) {
      const projectWorkspace = workspaces.find(w => w.id === project.workspace_id);
      if (projectWorkspace && currentWorkspace?.id !== project.workspace_id) {
        console.log('VoidPage: Updating current workspace to:', projectWorkspace.name);
        setCurrentWorkspace(projectWorkspace);
      }
    }
  }, [project?.workspace_id, workspaces, currentWorkspace?.id, setCurrentWorkspace]);

  // Initialize frame lock system
  useEffect(() => {
    if (user?.id && !echoConnected) {
      console.log('Initializing frame lock system for user:', user.id)
      initializeLockSystem(user.id)
    }
  }, [user?.id, initializeLockSystem, echoConnected])

  // Enable Playwright-first thumbnail generation with automatic fallback
  // Captures on: 1) Every page visit, 2) Frame updates (debounced)
  const { generateSnapshot, scheduleSnapshot, isCapturing, captureMethod } = useVoidSnapshot(project?.uuid, {
    autoCapture: true, // Enable automatic capture when VoidPage loads
    captureDelay: 5000,
    usePlaywright: true, // Try Playwright first
    canvasFallback: true, // Fall back to canvas if Playwright fails
    onCaptureSuccess: (result) => {
      console.log('[VoidPage] ✅ Thumbnail captured successfully!', {
        method: result.method || captureMethod,
        url: result.thumbnailUrl || result.thumbnail_url
      })
    },
    onCaptureError: (error) => {
      console.error('[VoidPage] ❌ Thumbnail capture failed:', error)
    }
  })

  // Auto-capture thumbnail when frames are updated/edited (debounced 5 seconds after last change)
  useEffect(() => {
    if (!project?.uuid || !frames || frames.length === 0) return;

    console.log('[VoidPage] 📸 Frame data changed, scheduling thumbnail capture...');
    scheduleSnapshot(5000); // Debounce: wait 5s after last frame change

  }, [frames, scheduleSnapshot, project?.uuid])

  // Note: Zoom/pan changes captured via frames array changes
  // Manual snapshot function - now uses Playwright-first approach
  const generateProjectThumbnail = useCallback(async () => {
    if (!project?.uuid) return;
    
    console.log('[VoidPage] 🚀 Manually generating project thumbnail (Playwright-first)...');
    
    try {
      const result = await generateSnapshot();
      
      if (result && result.success) {
        console.log('[VoidPage] 🎉 SUCCESS! Thumbnail generated:', {
          method: result.method,
          url: result.thumbnailUrl || result.thumbnail_url
        });
        alert(`✅ Project thumbnail generated successfully using ${result.method === 'playwright' ? 'Playwright' : 'Canvas fallback'}!`);
      } else {
        console.error('[VoidPage] ❌ Thumbnail generation failed');
        alert('❌ Failed to generate thumbnail. Check console for details.');
      }
      
    } catch (error) {
      console.error('[VoidPage] ❌ Failed to generate thumbnail:', error);
      alert('❌ Failed to generate thumbnail: ' + error.message);
    }
  }, [project?.uuid, generateSnapshot])

  // Real-time frame events listener
  useEffect(() => {
    if (!currentWorkspace || !window.Echo || !project?.uuid) return;

    console.log('🔌 VoidPage: Subscribing to workspace channel for frames:', `workspace.${currentWorkspace.id}`);

    const channel = window.Echo.private(`workspace.${currentWorkspace.id}`);

    // Listen for frame created
    channel.listen('FrameCreated', (event) => {
      console.log('🖼️ Frame created event received:', event);
      
      // Only add frame if it belongs to current project
      if (event.project_uuid === project.uuid) {
        const newFrame = event.frame;
        setFrames(prevFrames => {
          // Check if frame already exists
          if (prevFrames.some(f => f.uuid === newFrame.uuid)) {
            console.log('⚠️ Frame already exists, skipping:', newFrame.uuid);
            return prevFrames;
          }
          
          console.log('✅ Adding new frame to canvas:', newFrame.name);
          
          // Map frame to state format
          const frameToAdd = {
            id: newFrame.id,
            uuid: newFrame.uuid,
            title: newFrame.name,
            fileName: `${newFrame.name}.${newFrame.type}`,
            x: newFrame.canvas_data?.position?.x || Math.random() * 1000 + 200,
            y: newFrame.canvas_data?.position?.y || Math.random() * 600 + 200,
            isDragging: false,
            isLoading: false,
            type: newFrame.type,
            settings: newFrame.settings
          };
          
          return [frameToAdd, ...prevFrames];
        });
      }
    });

    // Listen for frame deleted
    channel.listen('FrameDeleted', (event) => {
      console.log('🗑️ Frame deleted event received:', event);
      
      // Only remove frame if it belongs to current project
      if (event.project_uuid === project.uuid) {
        setFrames(prevFrames => {
          const filtered = prevFrames.filter(f => f.uuid !== event.frame_uuid);
          console.log('✅ Removed frame from canvas. Before:', prevFrames.length, 'After:', filtered.length);
          return filtered;
        });
      }
    });

    return () => {
      console.log('🔌 VoidPage: Unsubscribing from workspace channel');
      channel.stopListening('FrameCreated');
      channel.stopListening('FrameDeleted');
      window.Echo.leave(`workspace.${currentWorkspace.id}`);
    };
  }, [currentWorkspace?.id, project?.uuid]);

  // Load frames from database
  useEffect(() => {
    const loadFrames = async () => {
      try {
        console.log('🔍 [VoidPage] Loading frames for project:', project.uuid)
        
        const response = await fetch(`/api/projects/${project.uuid}/frames`, {
          headers: {
            'Accept': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
          },
          credentials: 'include'
        })

        console.log('📡 [VoidPage] API Response:', response.status, response.statusText, 'OK:', response.ok)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ [VoidPage] API Error:', response.status, errorText)
          return
        }

        const data = await response.json()
        console.log('✅ [VoidPage] Frames data received:', data)
        const framesToState = data.frames.map((frame, index) => {
          console.log('🖼️ [VoidPage] Mapping frame:', frame.name, frame.uuid)
          
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
        
        console.log('✅ [VoidPage] Mapped frames:', framesToState.length, 'frames')
        
        // Sort frames: GitHub imports first, then by creation date
        framesToState.sort((a, b) => {
          if (a.isGithubImport && !b.isGithubImport) return -1;
          if (!a.isGithubImport && b.isGithubImport) return 1;
          return 0;
        });
        
        console.log('🎯 [VoidPage] Setting frames state...')
        setFrames(framesToState)
        console.log('✅ [VoidPage] Frames state updated!')

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
        
        console.log('✅✅✅ [VoidPage] Frame loading complete! Total frames:', framesToState.length)
        
      } catch (error) {
        console.error('❌❌❌ [VoidPage] Error loading frames:', error)
        console.error('Stack:', error.stack)
      }
    }

    if (project?.uuid) {
      console.log('🚀 [VoidPage] Starting frame load for project:', project.uuid)
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
      
      // Schedule canvas snapshot after frame position change
      scheduleSnapshot()
    } catch (error) {
      console.error('Error updating frame position:', error)
    }
  }
}, [frames, zoom, scrollBounds, scheduleSnapshot])



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
        
        // Schedule canvas snapshot after frame deletion
        scheduleSnapshot()
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




// Keep refs in sync
useEffect(() => {
  scrollPositionRef.current = scrollPosition
}, [scrollPosition])

useEffect(() => {
  zoomLevelRef.current = zoomLevel
}, [zoomLevel])

// FIXED handleZoom - now stable, doesn't recreate on every zoom/scroll change
const handleZoom = useCallback((delta, centerX = null, centerY = null) => {
  const currentZoomLevel = zoomLevelRef.current
  const currentScrollPos = scrollPositionRef.current
  
  const zoomStep = typeof delta === 'number' ? delta : (delta > 0 ? 10 : -10)
  const newZoomLevel = Math.min(300, Math.max(25, currentZoomLevel + zoomStep))
  
  console.log('VoidPage: Zoom changing to', newZoomLevel)
  
  if (newZoomLevel === currentZoomLevel) return

  // Figma-like zoom to point
  if (centerX !== null && centerY !== null && canvasRef.current) {
    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = centerX - rect.left
    const mouseY = centerY - rect.top
    
    const oldZoom = currentZoomLevel / 100
    const newZoom = newZoomLevel / 100
    
    if (oldZoom > 0 && newZoom > 0) {
      const zoomFactor = newZoom / oldZoom
      const newScrollX = currentScrollPos.x + (mouseX / oldZoom) * (1 - 1/zoomFactor)
      const newScrollY = currentScrollPos.y + (mouseY / oldZoom) * (1 - 1/zoomFactor)
      
      setScrollPosition({ 
        x: Math.max(0, Math.min(scrollBounds.width - window.innerWidth / newZoom, newScrollX)),
        y: Math.max(0, Math.min(scrollBounds.height - window.innerHeight / newZoom, newScrollY))
      })
    }
  }
  
  // CRITICAL: Update store zoom level
  setZoomLevel(newZoomLevel)
}, [setZoomLevel, setScrollPosition, scrollBounds])


const handlePinchZoom = useCallback((event) => {
  if (event.touches.length !== 2) return
  
  event.preventDefault()
  event.stopPropagation()
  
  const currentZoomLevel = zoomLevelRef.current
  const currentScrollPos = scrollPositionRef.current
  
  const touch1 = event.touches[0]
  const touch2 = event.touches[1]
  
  const distance = Math.hypot(
    touch1.clientX - touch2.clientX,
    touch1.clientY - touch2.clientY
  )
  
  if (!touchStateRef.current.initialDistance) {
    touchStateRef.current = {
      initialDistance: distance,
      initialZoom: currentZoomLevel,
      isZooming: true
    }
    setIsZooming(true)
    return
  }
  
  const zoomChange = distance / touchStateRef.current.initialDistance
  const newZoomLevel = Math.min(300, Math.max(25, touchStateRef.current.initialZoom * zoomChange))
  
  const centerX = (touch1.clientX + touch2.clientX) / 2
  const centerY = (touch1.clientY + touch2.clientY) / 2
  
  setZoomLevel(Math.round(newZoomLevel))
  
  if (canvasRef.current) {
    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = centerX - rect.left
    const mouseY = centerY - rect.top
    
    const oldZoom = touchStateRef.current.initialZoom / 100
    const newZoom = newZoomLevel / 100
    
    if (oldZoom > 0 && newZoom > 0) {
      const zoomChangeFactor = newZoom / oldZoom
      const newScrollX = currentScrollPos.x + (mouseX / oldZoom) * (1 - 1/zoomChangeFactor)
      const newScrollY = currentScrollPos.y + (mouseY / oldZoom) * (1 - 1/zoomChangeFactor)
      
      setScrollPosition({ 
        x: Math.max(0, Math.min(scrollBounds.width - window.innerWidth / newZoom, newScrollX)),
        y: Math.max(0, Math.min(scrollBounds.height - window.innerHeight / newZoom, newScrollY))
      })
    }
  }
}, [setZoomLevel, setScrollPosition, scrollBounds])

// FIXED handleTouchEnd - use ref
const handleTouchEnd = useCallback(() => {
  touchStateRef.current = {
    initialDistance: 0,
    initialZoom: zoomLevelRef.current,
    isZooming: false
  }
  setIsZooming(false)
}, [])



// Now useScrollHandler won't trigger infinite loops
useScrollHandler({
  canvasRef,
  scrollPosition,
  setScrollPosition,
  isDragging,
  setIsDragging,
  lastPointerPos,
  setLastPointerPos,
  scrollBounds,
  zoom: zoomLevel / 100,
  onZoom: handleZoom, // Stable reference now
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

  // Comments: bring in store selectors
  const {
    commentMode,
    setCommentContext,
    addComment,
    commentsByContext
  } = useEditorStore()

  // Comments: set context for Void using project uuid
  useEffect(() => {
    if (project?.uuid) {
      setCommentContext(`void:${project.uuid}`)
    }
  }, [project?.uuid, setCommentContext])

  // Comments: join presence channel for project and listen to whispers
  useEffect(() => {
    if (!project?.uuid || !window.Echo || commentChannelJoined) return
    try {
      const chName = `project.${project.uuid}`
      const presence = window.Echo.join(chName)
      presence.listenForWhisper('comment.created', (payload) => {
        if (!payload || !payload.contextKey || !payload.comment) return
        addComment(payload.contextKey, payload.comment)
      })
      setCommentChannelJoined(true)
      return () => {
        try { window.Echo.leave(chName) } catch {}
        setCommentChannelJoined(false)
      }
    } catch (e) {
      console.warn('Void comments: failed to join presence channel', e)
    }
  }, [project?.uuid, commentChannelJoined, addComment])

  // Comments: derive current comments and track overlay rect
  const currentComments = useMemo(() => {
    const key = project?.uuid ? `void:${project.uuid}` : null
    return key && commentsByContext[key] ? commentsByContext[key] : []
  }, [commentsByContext, project?.uuid])

  useEffect(() => {
    const updateRect = () => {
      if (canvasRef.current) {
        setOverlayRect(canvasRef.current.getBoundingClientRect())
      }
    }
    updateRect()
    window.addEventListener('resize', updateRect)
    return () => window.removeEventListener('resize', updateRect)
  }, [canvasRef, currentComments.length])

  // Comments: handle click to add pin
  const handleCanvasClick = useCallback((e) => {
    if (commentMode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        const text = window.prompt('Add a comment')
        if (text && text.trim()) {
          const comment = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
            text: text.trim(),
            x, y,
            ts: Date.now(),
            user: { id: user?.id, name: user?.name, avatar: user?.avatar || null },
            replies: []
          }
          const ctx = `void:${project?.uuid}`
          addComment(ctx, comment)
          try {
            const ch = `project.${project?.uuid}`
            window.Echo?.join(ch)?.whisper('comment.created', { contextKey: ctx, comment })
          } catch {}
        }
        return
      }
    }
  }, [commentMode, addComment, project?.uuid])

  // Listen for replies
  useEffect(() => {
    if (!project?.uuid || !window.Echo) return
    try {
      const ch = `project.${project.uuid}`
      const presence = window.Echo.join(ch)
      presence.listenForWhisper('comment.replied', (payload) => {
        const { contextKey, parentId, reply } = payload || {}
        if (!contextKey || !parentId || !reply) return
        // Append reply to the correct comment
        const list = commentsByContext[contextKey] || []
        const idx = list.findIndex(c => c.id === parentId)
        if (idx !== -1) {
          const updated = [...list]
          updated[idx] = { ...updated[idx], replies: [...(updated[idx].replies || []), reply] }
          // Reuse addComment to trigger store update minimally by adding a no-op followed by fixing list
          // Safer: directly set via store set - but we only have addComment; do a shallow trick
          // Fallback: update local activeComment if open
          setActiveComment(prev => prev && prev.id === parentId ? { ...updated[idx] } : prev)
        }
      })
    } catch {}
  }, [project?.uuid, commentsByContext])

  const openCommentModal = useCallback((c) => {
    if (!overlayRect) return
    setActiveComment(c)
    setReplyText('')
    setCommentModalOpen(true)
    setModalPos({ left: overlayRect.left + c.x + 12, top: overlayRect.top + c.y - 12 })
  }, [overlayRect])

  const navigateMention = useCallback((type, projectId, frameId) => {
    if (type === 'project' && projectId) {
      router.visit(`/void/${projectId}`)
    } else if (type === 'frame' && (frameId || projectId)) {
      const proj = projectId || project?.uuid
      if (proj && (frameId)) router.visit(`/void/${proj}/frame=${frameId}/modeForge`)
    }
  }, [project?.uuid])

  const renderContentWithLinks = useCallback((text) => {
    // Support #project:<uuid> and #frame:<uuid> or #frame:<projectUuid>/<frameUuid>
    const parts = []
    let lastIndex = 0
    const regex = /(#[Pp]roject:([a-f0-9-]{8,}))|(#[Ff]rame:([a-f0-9-]{8,})(?:\/?([a-f0-9-]{8,}))?)/g
    let m
    while ((m = regex.exec(text)) !== null) {
      if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index))
      if (m[1]) {
        const projId = m[2]
        parts.push(
          <span key={`p-${m.index}`} className="px-1 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded cursor-pointer hover:underline" onClick={() => navigateMention('project', projId)}>
            #{`project:${projId}`}
          </span>
        )
      } else if (m[3]) {
        const projId = m[4]
        const frameId = m[5]
        parts.push(
          <span key={`f-${m.index}`} className="px-1 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded cursor-pointer hover:underline" onClick={() => navigateMention('frame', projId, frameId)}>
            #{`frame:${projId}${frameId ? '/' + frameId : ''}`}
          </span>
        )
      }
      lastIndex = regex.lastIndex
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex))
    return <>{parts}</>
  }, [navigateMention])

  const handleSendReply = useCallback(() => {
    const trimmed = replyText.trim()
    if (!activeComment || !trimmed) return
    const reply = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      text: trimmed,
      ts: Date.now(),
      user: { id: user?.id, name: user?.name, avatar: user?.avatar || null }
    }
    // Update local activeComment and store list
    const ctx = `void:${project?.uuid}`
    setActiveComment(prev => prev ? { ...prev, replies: [...(prev.replies || []), reply] } : prev)
    try {
      const ch = `project.${project?.uuid}`
      window.Echo?.join(ch)?.whisper('comment.replied', { contextKey: ctx, parentId: activeComment.id, reply })
    } catch {}
    setReplyText('')
  }, [replyText, activeComment, project?.uuid])

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
        
        // Schedule canvas snapshot after frame creation
        scheduleSnapshot()
      }
    } catch (error) {
      console.error('Error reloading frames:', error)
    }
  }, [project?.uuid, scheduleSnapshot])

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
      icon: Camera, 
      label: 'Generate Thumbnail', 
      isPrimary: false, 
      action: generateProjectThumbnail
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
        overflow: 'hidden',
        // 🔥 FIXED: Ensure floating elements can be interacted with
        pointerEvents: 'auto'
      }}
      onClick={handleCanvasClick}
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

        {overlayRect && currentComments && currentComments.map((c) => (
          <div
            key={c.id}
            style={{ position: 'fixed', left: overlayRect.left + c.x, top: overlayRect.top + c.y, transform: 'translate(-50%, -100%)', zIndex: 60 }}
            className="pointer-events-auto cursor-pointer"
            title={new Date(c.ts).toLocaleString()}
            onClick={() => openCommentModal(c)}
          >
            <div className="w-4 h-4 rounded-full bg-[var(--color-primary)] shadow flex items-center justify-center text-[8px] text-white">
              {c.user?.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
          </div>
        ))}

        {commentModalOpen && activeComment && (
          <div
            className="fixed z-70 w-80 max-w-[85vw] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-2xl"
            style={{ left: Math.min(modalPos.left, window.innerWidth - 340), top: Math.min(modalPos.top, window.innerHeight - 300) }}
          >
            <div className="flex items-center justify-between p-2 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-[10px]">
                  {activeComment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="text-xs font-medium text-[var(--color-text)]">{activeComment.user?.name || 'User'}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">{new Date(activeComment.ts).toLocaleString()}</div>
                </div>
              </div>
              <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-2" onClick={() => setCommentModalOpen(false)}>×</button>
            </div>
            <div className="p-2 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              <div className="text-sm text-[var(--color-text)] break-words">{renderContentWithLinks(activeComment.text)}</div>
              {activeComment.replies && activeComment.replies.map(r => (
                <div key={r.id} className="flex gap-2 items-start">
                  <div className="w-5 h-5 rounded-full bg-[var(--color-bg-muted)] text-[10px] flex items-center justify-center text-[var(--color-text)]">
                    {r.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] text-[var(--color-text)]">{renderContentWithLinks(r.text)}</div>
                    <div className="text-[9px] text-[var(--color-text-muted)]">{new Date(r.ts).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-[var(--color-border)]">
              <div className="relative">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                  placeholder="Reply... use #project:<uuid> or #frame:<uuid>"
                  className="w-full px-2 py-1 pr-8 border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                />
                <button className="absolute right-1 bottom-1 px-2 py-0.5 bg-[var(--color-primary)] text-white rounded text-[11px]" onClick={handleSendReply} disabled={!replyText.trim()}>Send</button>
              </div>
            </div>
          </div>
        )}
        
        {/* Dynamic Dockable Panel System */}
        {hasOpenPanels && (
          <Panel
            isOpen={true}
            panels={activePanels}
            allowedDockPositions={['right']}
            onPanelClose={handlePanelClose}
            onPanelMaximize={handlePanelMaximize}
            defaultWidth={320}
            minWidth={280}
            maxWidth={400}
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