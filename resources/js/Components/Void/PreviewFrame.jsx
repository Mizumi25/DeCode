// Components/Void/PreviewFrame.jsx - FIXED click navigation issue
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import ReactDOM from 'react-dom'
import { Plug, MoreHorizontal, Github, FileCode, Layers, RefreshCw, Camera, AlertTriangle, Copy, Trash2, Files, X } from 'lucide-react'
import ConfirmDialog from '@/Components/ConfirmDialog'
import FrameAssignmentModal from '@/Components/Void/FrameAssignmentModal'
import EnhancedLockButton from './EnhancedLockButton'
import EnhancedPreviewFrameLock from './EnhancedPreviewFrameLock'
import FrameAccessDialog from './FrameAccessDialog'
import useFrameLockStore from '@/stores/useFrameLockStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { useThumbnail } from '@/hooks/useThumbnail'
import { ThumbnailService } from '@/Services/ThumbnailService'
import RealTimeStackingAvatars from '@/Components/Header/Head/RealTimeStackingAvatars'
import ConfirmationDialog from '@/Components/ConfirmationDialog'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

const sizes = [
  { w: 80, h: 56 },
  { w: 64, h: 96 },
  { w: 72, h: 72 },
  { w: 52, h: 40 },
  { w: 96, h: 64 },
]

export default function PreviewFrame({ 
  title = 'Untitled', 
  index = 0, 
  x = 0, 
  y = 0, 
  fileName = 'File1',
  frameId,
  frame = null,
  isDragging = false,
  isLoading = false,
  onFrameClick,
  onFrameDelete,
  zoom = 1,
  isDraggable = true, // Will be set to false for viewers
  isDark = false,
  scrollPosition = { x: 0, y: 0 },
  onAutoScroll = null,
  hideHeader = false, // New prop to hide header for viewers
  linkMode = false, // Link mode active
  selectedFrameForLink = null, // Currently selected frame for linking
  frameAssignments = [], // ✅ NEW: Frame assignments for this frame
  onUnassign = null, // ✅ NEW: Callback to unassign frames
  allFrames = [], // ✅ NEW: All frames for assignment modal
  onAssign = null // ✅ NEW: Callback to assign frames
}) {
  const size = sizes[index % sizes.length]
  const { getLockStatus, subscribeToFrame, requestFrameAccess, addNotification } = useFrameLockStore()
  const { currentWorkspace } = useWorkspaceStore()
  const [myRole, setMyRole] = React.useState(null)
  const [showAccessDialog, setShowAccessDialog] = React.useState(false)
  const [isRequestLoading, setIsRequestLoading] = React.useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = React.useState(false)
  
  // ✅ NEW: Calculate assignments for this frame
  const myAssignments = useMemo(() => {
    if (!frame || !frameAssignments || frameAssignments.length === 0) return [];
    
    // Find assignments where this frame is involved
    return frameAssignments.filter(assignment => {
      const pageFrameUuid = assignment.pageFrame?.uuid || assignment.page_frame?.uuid;
      const componentFrameUuid = assignment.componentFrame?.uuid || assignment.component_frame?.uuid;
      return pageFrameUuid === frame.uuid || componentFrameUuid === frame.uuid;
    });
  }, [frame, frameAssignments])
  
  // Get lock status from Zustand store - FIRST
  const lockStatus = getLockStatus(frame?.uuid)
  
  // Fetch user's workspace role for discipline routing
  React.useEffect(() => {
    const fetchMyRole = async () => {
      if (!currentWorkspace?.uuid) return;
      
      try {
        const response = await fetch(`/api/workspaces/${currentWorkspace.uuid}/roles/my-role`, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setMyRole(data.data.role);
          }
        }
      } catch (error) {
        console.error('Failed to fetch role:', error);
      }
    };
    
    if (currentWorkspace?.uuid) {
      fetchMyRole();
    }
  }, [currentWorkspace?.uuid]);
  
  
  
  
  // Delete button proximity states
  const [isOverDeleteButton, setIsOverDeleteButton] = useState(false)
  const [isNearDeleteButton, setIsNearDeleteButton] = useState(false)
  const [deleteButtonVibration, setDeleteButtonVibration] = useState(0)
  const [frameScale, setFrameScale] = useState(1)
  
  // Tools menu state
  const [showTools, setShowTools] = useState(false)
  const toolsMenuRef = useRef(null)
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    onConfirm: null,
    showCancel: false,
  })
  
  // Handle tool actions
  const handleDuplicate = useCallback(async (e) => {
    e.stopPropagation()
    setShowTools(false)
    
    try {
      const response = await fetch(`/api/frames/${frame.uuid}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      })
      
      if (response.ok) {
        console.log('Frame duplicated successfully')
        setConfirmDialog({
          show: true,
          title: 'Success',
          message: `Frame "${title}" duplicated successfully!`,
          type: 'success',
          confirmText: 'OK',
          onConfirm: () => setConfirmDialog(prev => ({ ...prev, show: false })),
          showCancel: false,
        })
      } else {
        setConfirmDialog({
          show: true,
          title: 'Duplication Failed',
          message: 'Failed to duplicate frame. Please try again.',
          type: 'error',
          confirmText: 'OK',
          onConfirm: () => setConfirmDialog(prev => ({ ...prev, show: false })),
          showCancel: false,
        })
      }
    } catch (error) {
      console.error('Error duplicating frame:', error)
      setConfirmDialog({
        show: true,
        title: 'Error',
        message: 'An error occurred while duplicating the frame.',
        type: 'error',
        confirmText: 'OK',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, show: false })),
        showCancel: false,
      })
    }
  }, [frame?.uuid, title])
  
  const handleCopy = useCallback((e) => {
    e.stopPropagation()
    setShowTools(false)
    
    // Copy frame UUID to clipboard for pasting
    navigator.clipboard.writeText(frame.uuid)
    console.log('Frame copied to clipboard:', frame.uuid)
    
    setConfirmDialog({
      show: true,
      title: 'Copied',
      message: `Frame UUID copied to clipboard!`,
      type: 'success',
      confirmText: 'OK',
      onConfirm: () => setConfirmDialog(prev => ({ ...prev, show: false })),
      showCancel: false,
    })
  }, [frame?.uuid])
  
  const handleDelete = useCallback(async (e) => {
    e.stopPropagation()
    setShowTools(false)
    
    setConfirmDialog({
      show: true,
      title: 'Delete Frame',
      message: `Are you sure you want to delete "${title}"? This will delete the frame and all its components. This action cannot be undone.`,
      type: 'warning',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/frames/${frame.uuid}`, {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            }
          })
          
          const data = await response.json().catch(() => ({}))
          
          if (response.ok) {
            console.log('Frame deleted successfully', { frameUuid: frame.uuid })
            
            // Manually remove from UI immediately (don't wait for broadcast)
            if (onFrameDelete) {
              onFrameDelete(frame.uuid)
            }
            
            setConfirmDialog({
              show: true,
              title: 'Deleted',
              message: 'Frame and its components deleted successfully.',
              type: 'success',
              confirmText: 'OK',
              onConfirm: () => setConfirmDialog(prev => ({ ...prev, show: false })),
              showCancel: false,
            })
          } else {
            console.error('Delete failed:', response.status, data)
            const errorMessage = data.message || `Failed to delete frame (Status: ${response.status}). Please try again.`
            
            setConfirmDialog({
              show: true,
              title: 'Delete Failed',
              message: errorMessage,
              type: 'error',
              confirmText: 'OK',
              onConfirm: () => setConfirmDialog(prev => ({ ...prev, show: false })),
              showCancel: false,
            })
          }
        } catch (error) {
          console.error('Error deleting frame:', error)
          setConfirmDialog({
            show: true,
            title: 'Error',
            message: `An error occurred: ${error.message || 'Unknown error'}`,
            type: 'error',
            confirmText: 'OK',
            onConfirm: () => setConfirmDialog(prev => ({ ...prev, show: false })),
            showCancel: false,
          })
        }
      },
      onCancel: () => setConfirmDialog(prev => ({ ...prev, show: false })),
      showCancel: true,
    })
  }, [frame?.uuid, title])
  
  // Close tools menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target)) {
        setShowTools(false)
      }
    }
    
    if (showTools) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTools])
  
  
// REPLACE the DnD Kit hook section with:
  const { attributes, listeners, setNodeRef, transform, isDragging: dndIsDragging } = useDraggable({
    id: frameId,
    disabled: !isDraggable || (lockStatus?.is_locked && !lockStatus.locked_by_me)
  })
  
  

  // Listen for delete button proximity events
  useEffect(() => {
    const handleDeleteProximity = (e) => {
      if (!dndIsDragging || !frameRef.current) return
      
      const { isNearby, isHovering, isDragOver, vibrationIntensity, buttonRect } = e.detail
      
      const frameRect = frameRef.current.getBoundingClientRect()
      
      // Check if frame edges are touching/near the delete button
      const isFrameNear = (
        frameRect.right >= buttonRect.left - 80 &&
        frameRect.left <= buttonRect.right + 80 &&
        frameRect.bottom >= buttonRect.top - 80 &&
        frameRect.top <= buttonRect.bottom + 80
      )
      
      // Check if frame is directly over delete button
      const isFrameOver = (
        frameRect.right >= buttonRect.left &&
        frameRect.left <= buttonRect.right &&
        frameRect.bottom >= buttonRect.top &&
        frameRect.top <= buttonRect.bottom
      )
      
      setIsNearDeleteButton(isFrameNear && isNearby)
      setIsOverDeleteButton(isFrameOver && isDragOver)
      setDeleteButtonVibration(isFrameNear ? vibrationIntensity : 0)
      
      // Shrink frame when hovering over delete button
      if (isFrameOver && isDragOver) {
        setFrameScale(0.7) // Shrink to 70%
      } else if (isFrameNear && isHovering) {
        setFrameScale(0.85) // Slightly shrink when nearby
      } else {
        setFrameScale(1) // Normal size
      }
    }

    window.addEventListener('deleteButtonProximity', handleDeleteProximity)
    return () => {
      window.removeEventListener('deleteButtonProximity', handleDeleteProximity)
    }
  }, [dndIsDragging])


  
  
  
  
  
  
  
  // ENHANCED: Use thumbnail hook for real-time updates
  const {
    thumbnailUrl,
    isLoading: thumbnailLoading,
    isGenerating: thumbnailGenerating,
    error: thumbnailError,
    lastGenerated,
    generateThumbnail,
    refreshThumbnail,
    isValidThumbnail,
    placeholderUrl
  } = useThumbnail(frame?.uuid, frame?.type || 'page', {
    autoGenerate: true,
    enableRealTimeUpdates: true,
    preloadThumbnails: true
  })

  const [showLoadingContent, setShowLoadingContent] = useState(isLoading)
  const [showThumbnailActions, setShowThumbnailActions] = useState(false)
  const [thumbnailLoadError, setThumbnailLoadError] = useState(false)
  const [imageLoadAttempts, setImageLoadAttempts] = useState(0)
  const frameRef = useRef(null)
  const headerRef = useRef(null)
  
  // Auto-scroll related state
  const autoScrollRef = useRef(null)
  const [autoScrollActive, setAutoScrollActive] = useState(false)
  
  
  
  
  // Enhanced transform handling for smooth levitation
const enhancedTransform = useMemo(() => {
  if (!transform) return null
  
  // Add levitation effect when dragging
  return {
    ...transform,
    scaleX: 1.05,
    scaleY: 1.05,
    z: 1000 // Ensure it's above other elements
  }
}, [transform])
  
  
  
  
  
  // Subscribe to frame-specific lock events
  useEffect(() => {
    if (frame?.uuid) {
      const unsubscribe = subscribeToFrame(frame.uuid)
      return unsubscribe
    }
  }, [frame?.uuid, subscribeToFrame])

  // ENHANCED: Handle thumbnail generation with retry logic
  const handleGenerateThumbnail = useCallback(async (e) => {
    e.stopPropagation()
    
    try {
      console.log(`[PreviewFrame] Manual thumbnail generation for ${frame?.uuid}`);
      setImageLoadAttempts(0);
      setThumbnailLoadError(false);
      await generateThumbnail()
    } catch (error) {
      console.error('Failed to generate thumbnail:', error)
      setThumbnailLoadError(true);
    }
  }, [generateThumbnail, frame?.uuid])

  // ENHANCED: Handle thumbnail refresh with error reset
  const handleRefreshThumbnail = useCallback(async (e) => {
    e.stopPropagation()
    
    try {
      console.log(`[PreviewFrame] Manual thumbnail refresh for ${frame?.uuid}`);
      setImageLoadAttempts(0);
      setThumbnailLoadError(false);
      
      if (frame?.uuid) {
        ThumbnailService.clearCache(frame.uuid);
      }
      
      await refreshThumbnail()
    } catch (error) {
      console.error('Failed to refresh thumbnail:', error)
      setThumbnailLoadError(true);
    }
  }, [refreshThumbnail, frame?.uuid])

  // ENHANCED: Handle thumbnail image load error with retry logic
  const handleThumbnailImageError = useCallback(() => {
    console.warn(`[PreviewFrame] Thumbnail load error for ${frame?.uuid}, attempt ${imageLoadAttempts + 1}`);
    
    setImageLoadAttempts(prev => prev + 1);
    
    if (imageLoadAttempts >= 2) {
      setThumbnailLoadError(true);
    } else {
      setTimeout(() => {
        const img = document.querySelector(`[data-thumbnail-frame="${frame?.uuid}"]`);
        if (img && thumbnailUrl) {
          const separator = thumbnailUrl.includes('?') ? '&' : '?';
          img.src = `${thumbnailUrl}${separator}_retry=${Date.now()}`;
        }
      }, 1000);
    }
  }, [imageLoadAttempts, thumbnailUrl, frame?.uuid])

  // ENHANCED: Handle thumbnail image load success
  const handleThumbnailImageLoad = useCallback(() => {
    console.log(`[PreviewFrame] Thumbnail loaded successfully for ${frame?.uuid}`);
    setThumbnailLoadError(false);
    setImageLoadAttempts(0);
  }, [frame?.uuid])

  // Simulate loading completion after 2-4 seconds
  useEffect(() => {
    if (isLoading) {
      const loadingTime = 2000 + Math.random() * 2000
      const timer = setTimeout(() => {
        setShowLoadingContent(false)
      }, loadingTime)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  // Auto-scroll functionality when dragging near edges
  const handleAutoScroll = useCallback((clientX, clientY) => {
    if (!onAutoScroll || !isDragging) return

    const scrollZone = 50
    const scrollSpeed = 2
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    let scrollDelta = { x: 0, y: 0 }

    if (clientX < scrollZone) {
      scrollDelta.x = -scrollSpeed * (1 - clientX / scrollZone)
    } else if (clientX > windowWidth - scrollZone) {
      scrollDelta.x = scrollSpeed * ((clientX - (windowWidth - scrollZone)) / scrollZone)
    }

    if (clientY < scrollZone + 60) {
      scrollDelta.y = -scrollSpeed * (1 - (clientY - 60) / scrollZone)
    } else if (clientY > windowHeight - scrollZone) {
      scrollDelta.y = scrollSpeed * ((clientY - (windowHeight - scrollZone)) / scrollZone)
    }

    if (scrollDelta.x !== 0 || scrollDelta.y !== 0) {
      if (!autoScrollActive) {
        setAutoScrollActive(true)
        const autoScroll = () => {
          if (!isDragging) {
            setAutoScrollActive(false)
            return
          }
          
          onAutoScroll(scrollDelta)
          autoScrollRef.current = requestAnimationFrame(autoScroll)
        }
        autoScrollRef.current = requestAnimationFrame(autoScroll)
      }
    } else {
      if (autoScrollActive) {
        setAutoScrollActive(false)
        if (autoScrollRef.current) {
          cancelAnimationFrame(autoScrollRef.current)
          autoScrollRef.current = null
        }
      }
    }
  }, [isDragging, onAutoScroll, autoScrollActive])

  // Clean up auto-scroll on unmount or drag end
  useEffect(() => {
    if (!isDragging && autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current)
      autoScrollRef.current = null
      setAutoScrollActive(false)
    }
    
    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current)
      }
    }
  }, [isDragging])

  // Handle access request for editors
  const handleRequestAccess = async (message) => {
    setIsRequestLoading(true);
    
    try {
      const success = await requestFrameAccess(frame.uuid, 'forge', message);
      
      if (success) {
        addNotification({
          type: 'lock_request',
          title: 'Access Requested',
          message: `Your request to access "${title}" has been sent.`,
        });
        setShowAccessDialog(false);
      } else {
        addNotification({
          type: 'error',
          title: 'Request Failed',
          message: 'Failed to send access request. Please try again.',
        });
      }
    } catch (error) {
      console.error('Failed to request access:', error);
      addNotification({
        type: 'error',
        title: 'Request Error',
        message: error.message || 'An error occurred.',
      });
    } finally {
      setIsRequestLoading(false);
    }
  };

  // Handle owner bypass
  const handleOwnerBypass = () => {
    setShowAccessDialog(false);
    
    // Owner can enter despite lock
    if (onFrameClick && frame) {
      // Show notification to users inside
      addNotification({
        type: 'owner_bypass',
        title: 'Owner Entering',
        message: `Workspace owner is entering the frame.`,
      });
      
      onFrameClick(frame);
    }
  };

  // FIXED: Updated handleFrameClick to properly handle thumbnail actions and lock status
  const handleFrameClick = (e) => {
    // Check if click is on interactive elements or actual thumbnail action buttons
    const isInteractiveElement = e.target.closest('.lock-button') || 
                                 e.target.closest('.more-button') || 
                                 e.target.closest('.avatar') ||
                                 e.target.closest('.frame-header') ||
                                 e.target.closest('button') // This will catch the thumbnail action buttons
    
    console.log('🖱️ Frame clicked:', {
      frameTitle: frame?.name,
      linkMode,
      isInteractiveElement,
      isDragging,
      dndIsDragging,
      hasOnFrameClick: !!onFrameClick
    });
    
    // Don't navigate if we're in a dragging state or clicked on interactive elements
    if (isInteractiveElement || dndIsDragging) {
      console.log('❌ Click blocked:', { isInteractiveElement, isDragging, dndIsDragging });
      return;
    }
    
    // In link mode, skip lock checks and go straight to onFrameClick
    if (linkMode) {
      console.log('🔗 Link mode active, calling onFrameClick');
      if (onFrameClick && frame) {
        onFrameClick(frame);
      }
      return;
    }
    
    // Handle locked frame access (only in normal mode)
    if (lockStatus?.is_locked && !lockStatus.locked_by_me) {
      // Check if user can bypass lock (owner)
      if (lockStatus.can_bypass_lock) {
        // Owner: show dialog with bypass option
        setShowAccessDialog(true);
      } else if (lockStatus.can_request) {
        // Editor: show dialog with request option
        setShowAccessDialog(true);
      } else {
        // Viewer: cannot access at all
        addNotification({
          type: 'error',
          title: 'Frame Locked',
          message: `This frame is locked by ${lockStatus.locked_by?.name || 'someone'}.`,
        });
      }
      return;
    }
    
    // Normal click - navigate to frame
    if (onFrameClick && frame) {
      onFrameClick(frame);
    }
  };

  



// Update the frame style to include hover effects
const getFrameStyles = () => {
  const baseStyles = {
    position: 'absolute',
    left: x,
    top: y,
    width: `${size.w * 4}px`,
    height: `${size.h * 4}px`,
    backgroundColor: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    border: `2px solid ${isDark ? 'rgba(100, 100, 100, 0.5)' : 'rgba(200, 200, 200, 0.5)'}`,
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    zIndex: dndIsDragging ? 1000 : 10,
    transform: dndIsDragging ? 'scale(1.05)' : 'scale(1)',
    willChange: dndIsDragging ? 'transform' : 'auto',
    pointerEvents: 'auto'
  }

  // Calculate vibration offset
  let vibrationOffset = { x: 0, y: 0 }
  if (deleteButtonVibration > 0 && dndIsDragging && !isOverDeleteButton) {
    const maxOffset = 4
    vibrationOffset = {
      x: (Math.random() - 0.5) * maxOffset * deleteButtonVibration,
      y: (Math.random() - 0.5) * maxOffset * deleteButtonVibration
    }
  }

  // Apply DnD transform with scale and vibration
  if (transform && dndIsDragging) {
    const translateX = transform.x + vibrationOffset.x
    const translateY = transform.y + vibrationOffset.y
    baseStyles.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${frameScale * 1.05})`
    baseStyles.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(59, 130, 246, 0.6)'
    baseStyles.cursor = 'grabbing'
    baseStyles.transition = deleteButtonVibration > 0 ? 'none' : 'all 0.2s ease-out'
  }

  // ENHANCED: Add delete button hover effect - frame scales down and gets red tint
  if (isOverDeleteButton && dndIsDragging) {
    baseStyles.boxShadow = '0 25px 50px -12px rgba(239, 68, 68, 0.4), 0 0 0 3px rgba(239, 68, 68, 0.3)'
    baseStyles.filter = 'brightness(0.9) hue-rotate(-10deg)'
    baseStyles.animation = 'pulse 0.5s ease-in-out infinite'
  } else if (isNearDeleteButton && dndIsDragging) {
    baseStyles.boxShadow = '0 25px 50px -12px rgba(239, 68, 68, 0.2), 0 0 0 2px rgba(239, 68, 68, 0.2)'
  }

  // Lock status styles
  if (lockStatus?.is_locked) {
    if (lockStatus.locked_by_me) {
      baseStyles.boxShadow = dndIsDragging 
        ? '0 25px 50px -12px rgba(59, 130, 246, 0.4), 0 0 0 2px rgba(59, 130, 246, 0.3)' 
        : '0 10px 30px -5px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.2)'
    } else {
      baseStyles.boxShadow = dndIsDragging 
        ? '0 25px 50px -12px rgba(239, 68, 68, 0.4), 0 0 0 2px rgba(239, 68, 68, 0.3)' 
        : '0 10px 30px -5px rgba(239, 68, 68, 0.2), 0 4px 6px -2px rgba(239, 68, 68, 0.1), 0 0 0 1px rgba(239, 68, 68, 0.2)'
    }
  } else if (!dndIsDragging) {
    baseStyles.boxShadow = '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  }

  return baseStyles
}
  




// Enhanced style calculation with proper positioning
const style = useMemo(() => {
  const baseStyles = {
    position: 'absolute',
    left: x,
    top: y,
    width: `${size.w * 4}px`,
    height: `${size.h * 4}px`,
    backgroundColor: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    border: `2px solid ${isDark ? 'rgba(100, 100, 100, 0.5)' : 'rgba(200, 200, 200, 0.5)'}`,
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    zIndex: dndIsDragging ? 1000 : 10,
    transform: dndIsDragging ? 'scale(1.05)' : 'scale(1)',
    willChange: dndIsDragging ? 'transform' : 'auto',
    pointerEvents: 'auto' // CRITICAL: Ensure frames are always interactive
  }

  // Apply DnD transform WITHOUT changing left/top
  if (transform && dndIsDragging) {
    baseStyles.transform = `translate3d(${transform.x}px, ${transform.y}px, 0) scale(1.05)`
    baseStyles.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(59, 130, 246, 0.6)'
    baseStyles.cursor = 'grabbing'
  }

  // Lock status styles (keeping your existing logic)
  if (lockStatus?.is_locked) {
    if (lockStatus.locked_by_me) {
      baseStyles.boxShadow = dndIsDragging 
        ? '0 25px 50px -12px rgba(59, 130, 246, 0.4), 0 0 0 2px rgba(59, 130, 246, 0.3)' 
        : '0 10px 30px -5px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.2)'
    } else {
      baseStyles.boxShadow = dndIsDragging 
        ? '0 25px 50px -12px rgba(239, 68, 68, 0.4), 0 0 0 2px rgba(239, 68, 68, 0.3)' 
        : '0 10px 30px -5px rgba(239, 68, 68, 0.2), 0 4px 6px -2px rgba(239, 68, 68, 0.1), 0 0 0 1px rgba(239, 68, 68, 0.2)'
    }
  } else if (!dndIsDragging) {
    baseStyles.boxShadow = '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  }

  return baseStyles
}, [x, y, size.w, size.h, dndIsDragging, lockStatus, transform, isDark])




// Enhanced drag overlay effect
useEffect(() => {
  if (dndIsDragging) {
    document.body.style.cursor = 'grabbing'
    // Add smooth transition only when starting to drag
    if (frameRef.current) {
      frameRef.current.style.transition = 'box-shadow 0.2s ease-out, transform 0.1s ease-out'
    }
  } else {
    document.body.style.cursor = ''
    // Remove transition after drag ends for performance
    if (frameRef.current) {
      frameRef.current.style.transition = 'all 0.3s ease-out'
    }
  }

  return () => {
    document.body.style.cursor = ''
  }
}, [dndIsDragging])




// In the PreviewFrame component, add this useEffect for delete button hover detection
useEffect(() => {
  const handleMouseMove = (e) => {
    if (!isDragging || !deleteButtonRef.current) return

    const deleteButton = deleteButtonRef.current
    const rect = deleteButton.getBoundingClientRect()
    
    // Enhanced collision detection with frame boundaries
    const frameRect = frameRef.current?.getBoundingClientRect()
    if (!frameRect) return

    // Check if frame is hovering over delete button area
    const isOverDelete = (
      frameRect.right >= rect.left - 30 &&
      frameRect.left <= rect.right + 30 &&
      frameRect.bottom >= rect.top - 30 &&
      frameRect.top <= rect.bottom + 30
    )

    // Dispatch custom event for delete button to listen to
    if (isOverDelete) {
      document.dispatchEvent(new CustomEvent('frameHoverDelete', { 
        detail: { isHoveringDelete: true, frameId: frameId }
      }))
    } else {
      document.dispatchEvent(new CustomEvent('frameLeaveDelete', { 
        detail: { isHoveringDelete: false, frameId: frameId }
      }))
    }
  }

  if (isDragging) {
    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      // Clean up by sending leave event when drag ends
      document.dispatchEvent(new CustomEvent('frameLeaveDelete', { 
        detail: { isHoveringDelete: false, frameId: frameId }
      }))
    }
  }
}, [isDragging, frameId])

// Also add a ref to access the delete button in the global scope
const deleteButtonRef = useRef(null)

// Initialize delete button ref on mount
useEffect(() => {
  deleteButtonRef.current = document.querySelector('.delete-button-container')
}, [])








    // ENHANCED: Render thumbnail with better error handling and SVG support
    const renderThumbnailContent = () => {
      if (showLoadingContent || (thumbnailLoading && !thumbnailUrl)) {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative">
            <svg className="w-8 h-8 animate-spin mb-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <div className="text-xs opacity-60 font-medium">
              {thumbnailGenerating ? 'Updating preview...' : 'Loading preview...'}
            </div>
          </div>
        )
      }
  
      const displayUrl = thumbnailUrl || placeholderUrl;
      const showRealThumbnail = thumbnailUrl && isValidThumbnail && !thumbnailLoadError && imageLoadAttempts < 3;
  
      return (
        <div className="w-full h-full relative rounded-lg overflow-hidden group">
          <div className="absolute inset-0 w-full h-full">
            {showRealThumbnail ? (
              <div className="w-full h-full relative">
                {/* FIXED: Enhanced SVG handling */}
                {(displayUrl.endsWith('.svg') || displayUrl.includes('.svg') || displayUrl.includes('data:image/svg+xml')) ? (
                  <div 
                    className="w-full h-full svg-thumbnail"
                    style={{
                      backgroundImage: `url("${displayUrl}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                ) : (
                  <img 
                    src={displayUrl}
                    alt={`${title} thumbnail`}
                    className="w-full h-full object-cover"
                    data-thumbnail-frame={frame?.uuid}
                    onLoad={handleThumbnailImageLoad}
                    onError={handleThumbnailImageError}
                    loading="lazy"
                  />
                )}
              </div>
            ) : (
              <div className="w-full h-full">
                {displayUrl && !thumbnailLoadError ? (
                  /* FIXED: Enhanced SVG detection and handling */
                  (displayUrl.includes('data:image/svg+xml') || displayUrl.endsWith('.svg') || displayUrl.includes('.svg')) ? (
                    <div 
                      className="w-full h-full svg-fallback-thumbnail"
                      style={{
                        backgroundImage: `url("${displayUrl}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                      onError={(e) => {
                        console.error('SVG background load failed:', e);
                        setThumbnailLoadError(true);
                      }}
                    />
                  ) : (
                    <img 
                      src={displayUrl}
                      alt="Thumbnail placeholder"
                      className="w-full h-full object-cover opacity-70"
                      onError={() => setThumbnailLoadError(true)}
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                        <div className="h-6 bg-blue-200 dark:bg-blue-800 rounded mt-3"></div>
                        <div className="grid grid-cols-2 gap-1 mt-2">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>
                    </div>
                    
                    {thumbnailLoadError && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Preview unavailable
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
  
          {/* FIXED: Thumbnail action overlay - only shows on hover and doesn't block clicks when hidden */}
          {showThumbnailActions && (
            <div className="thumbnail-actions absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center gap-2 transition-all duration-200">
              <button
                onClick={handleGenerateThumbnail}
                disabled={thumbnailGenerating}
                className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors disabled:opacity-50"
                title="Generate thumbnail"
              >
                <Camera className={`w-4 h-4 text-white ${thumbnailGenerating ? 'animate-pulse' : ''}`} />
              </button>
              
              <button
                onClick={handleRefreshThumbnail}
                disabled={thumbnailLoading}
                className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors disabled:opacity-50"
                title="Refresh thumbnail"
              >
                <RefreshCw className={`w-4 h-4 text-white ${thumbnailLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
  
          {/* ENHANCED: Thumbnail status indicators */}
          <div className="absolute top-2 left-2 flex gap-1">
            {thumbnailGenerating && (
              <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Camera className="w-3 h-3" />
                Updating
              </div>
            )}
            
            {thumbnailLoadError && imageLoadAttempts >= 3 && (
              <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Error
              </div>
            )}
            
            {lastGenerated && isValidThumbnail && !thumbnailLoadError && (
              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Live
              </div>
            )}
            
            {imageLoadAttempts > 0 && imageLoadAttempts < 3 && (
              <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Retry {imageLoadAttempts}/3
              </div>
            )}
          </div>
        </div>
      )
    }

  // Combine refs for both DnD and proximity detection
  const combinedRef = useCallback((node) => {
    frameRef.current = node
    setNodeRef(node)
  }, [setNodeRef])

  // Check if this frame is selected for linking
  const isSelectedForLink = linkMode && selectedFrameForLink?.uuid === frame?.uuid;
  
  return (
  <div
    ref={combinedRef}  // Use combined ref
    {...listeners}
    {...attributes}
    data-frame-uuid={frame?.uuid}
    className={`preview-frame absolute rounded-xl p-3 transition-all duration-300 ease-out flex flex-col group ${
      isDragging ? 'shadow-2xl scale-105 z-50' : 'shadow-lg hover:shadow-xl hover:-translate-y-1'
    } ${lockStatus?.is_locked && !lockStatus.locked_by_me ? 'cursor-not-allowed' : linkMode ? 'cursor-pointer' : 'cursor-grab'}
    ${isSelectedForLink ? 'ring-4 ring-[var(--color-primary)] ring-offset-2' : ''}`}
    style={style}
    onClick={handleFrameClick}
    onMouseEnter={() => setShowThumbnailActions(true)}
    onMouseLeave={() => setShowThumbnailActions(false)}
  >
      {/* Lock overlay for locked frames */}
      {lockStatus?.is_locked && !lockStatus.locked_by_me && (
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20 rounded-xl z-10 flex items-center justify-center">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Locked by {lockStatus.locked_by?.name}
            </p>
          </div>
        </div>
      )}

      {/* Link mode indicator */}
      {linkMode && isSelectedForLink && (
        <div className="absolute -top-2 -right-2 z-20">
          <div className="bg-[var(--color-primary)] text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
            Selected
          </div>
        </div>
      )}
      
      {/* Link mode helper - show what type of frame this is */}
      {linkMode && !isSelectedForLink && (
        <div className="absolute -top-2 -right-2 z-20">
          <div className={`px-2 py-1 rounded-full text-xs font-medium shadow-lg ${
            frame?.type === 'page' 
              ? 'bg-blue-500 text-white' 
              : 'bg-purple-500 text-white'
          }`}>
            {frame?.type === 'page' ? 'Page' : 'Component'}
          </div>
        </div>
      )}

      {/* Frame Title - Always visible, even for viewers */}
      {hideHeader ? (
        // Viewer: Just show title, NOT draggable (no ref, no drag class)
        <div className="mb-3 -mt-1 select-none" style={{ pointerEvents: 'none' }}>
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 
              className="text-xs font-medium text-[var(--color-text)] truncate"
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                cursor: 'default'
              }}
            >
              {title}
            </h3>
          </div>
        </div>
      ) : (
        // Full header for non-viewers
        <div 
          ref={headerRef}
          className={`frame-header flex items-center justify-between mb-3 -mt-1 min-w-0 hover:bg-white/5 dark:hover:bg-black/5 rounded-lg p-1 -m-1 transition-colors`}
        >
        <div className="flex items-center gap-2 text-xs min-w-0 flex-1" style={{ color: 'var(--color-text-muted)' }}>
          <span className="font-semibold text-sm truncate max-w-[120px]" title={title}>
            {title}
          </span>
          <span className="opacity-60 flex-shrink-0">•</span>
          <span className="opacity-80 truncate max-w-[100px]" title={fileName}>
            ({fileName})
          </span>
          
          {frame?.isGithubImport ? (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Github className="w-3 h-3 text-green-600" />
              <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                {frame.githubExtension?.toUpperCase() || 'GH'}
              </span>
            </div>
          ) : (
            <Plug className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
          )}
          
          {/* ✅ NEW: Assignment badge - opens professional modal */}
          {myAssignments.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAssignmentModal(true);
              }}
              className="flex items-center gap-1 px-2 py-1 bg-[var(--color-primary)] text-white rounded-full text-xs font-medium hover:bg-[var(--color-primary)]/80 transition-all hover:scale-105 flex-shrink-0"
              title="View and manage frame assignments"
            >
              <Layers className="w-3 h-3" />
              {myAssignments.length}
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {frame?.isGithubImport && frame.complexity && (
            <div className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
              frame.complexity === 'high' ? 'bg-red-100 text-red-700' :
              frame.complexity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {frame.complexity}
            </div>
          )}
          
          <div className="lock-button flex-shrink-0">
            <EnhancedPreviewFrameLock
              frameUuid={frame?.uuid}
            />
          </div>
          
          {/* Real-time Stacking Avatars - Shows who is inside this frame */}
          <div className="flex-shrink-0">
            <RealTimeStackingAvatars 
              frameId={frame?.uuid}
              currentMode="forge"
            />
          </div>
          
          <div className="relative" ref={toolsMenuRef}>
            <button 
              className="more-button p-1.5 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200 hover:scale-110 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                setShowTools(!showTools)
              }}
            >
              <MoreHorizontal className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            </button>
            
            {/* Tools dropdown menu */}
            {showTools && (
              <div 
                className="absolute right-0 top-full mt-1 w-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 py-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleDuplicate}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-bg-muted)] flex items-center gap-2 text-[var(--color-text)]"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  onClick={handleCopy}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-bg-muted)] flex items-center gap-2 text-[var(--color-text)]"
                >
                  <Files className="w-4 h-4" />
                  Copy
                </button>
                <div className="h-px bg-[var(--color-border)] my-1" />
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* ENHANCED: Content Area with real-time thumbnail */}
      <div className="rounded-lg mb-3 flex-1 relative overflow-hidden">
        {renderThumbnailContent()}
      </div>
      
      {/* Bottom mock lines */}
      {!showLoadingContent && (
        <div className="space-y-2">
          <div
            className="rounded-full transition-all duration-300 group-hover:bg-blue-300"
            style={{
              height: '4px',
              width: '70%',
              backgroundColor: 'var(--color-border)',
            }}
          />
          <div
            className="rounded-full transition-all duration-300 group-hover:bg-blue-300"
            style={{
              height: '4px',
              width: '50%',
              backgroundColor: 'var(--color-border)',
            }}
          />
        </div>
      )}
      
      {/* Enhanced indicators */}
      {isDragging && (
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full shadow-lg animate-pulse"></div>
      )}
      
      {autoScrollActive && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full shadow-lg animate-ping"></div>
      )}
      
      {thumbnailGenerating && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full shadow-lg animate-pulse"></div>
      )}
      
      {/* Render Confirmation Dialog as Portal (renders at document body level) */}
      {confirmDialog.show && ReactDOM.createPortal(
        <ConfirmationDialog
          show={confirmDialog.show}
          onClose={() => setConfirmDialog(prev => ({ ...prev, show: false }))}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
          type={confirmDialog.type}
          variant={confirmDialog.type === 'success' ? 'primary' : confirmDialog.type === 'error' ? 'danger' : confirmDialog.type === 'warning' ? 'warning' : 'primary'}
        />,
        document.body
      )}
      
      {/* Frame Access Dialog for locked frames */}
      <FrameAccessDialog
        isOpen={showAccessDialog}
        onClose={() => setShowAccessDialog(false)}
        onBypass={handleOwnerBypass}
        onRequest={handleRequestAccess}
        lockStatus={lockStatus}
        userRole={myRole}
        frameName={title}
        isLoading={isRequestLoading}
      />
      
      {/* ✅ NEW: Professional Assignment Manager Modal */}
      <FrameAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        currentFrame={frame}
        allFrames={allFrames}
        frameAssignments={frameAssignments}
        onUnassign={onUnassign}
        onAssign={onAssign}
        linkMode={linkMode}
        onRequestUnlink={(assignment, frameName) => {
          // Request unlink via parent (VoidPage) to use page-level confirm dialog
          if (onUnassign) {
            onUnassign(assignment, frameName, true); // true = show confirm dialog
          }
        }}
      />
    </div>
  )
}