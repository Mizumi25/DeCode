import { useEffect, useRef, useCallback } from 'react'

export function useScrollHandler({
  canvasRef,
  scrollPosition,
  setScrollPosition,
  isDragging,
  setIsDragging,
  lastPointerPos,
  setLastPointerPos,
  scrollBounds,
  zoom = 1,
  onZoom = null
}) {
  
  // Track zoom gesture state for touch devices
  const touchStateRef = useRef({
    initialDistance: 0,
    initialZoom: zoom,
    isZooming: false
  })

  // Smooth zoom debouncing
  const zoomTimeoutRef = useRef(null)
  const lastZoomRef = useRef(zoom)

  // Check if target should be ignored for scrolling
    const shouldIgnoreTarget = (target) => {
      return target.closest('.preview-frame') || 
             target.closest('.lock-button') || 
             target.closest('.more-button') || 
             target.closest('.avatar') ||
             target.closest('.frame-header') ||
             target.closest('.floating-toolbox') ||
             target.closest('.floating-tool') ||
             target.closest('[data-panel]') ||
             target.closest('.modal') ||
             target.closest('button') ||
             target.closest('input') ||
             target.closest('select') ||
             target.closest('textarea') ||
             target.closest('[role="button"]') ||
             target.closest('.delete-button') ||
             target.closest('.clickable')
    }

  // Enhanced zoom function with smooth transitions
  const performZoom = useCallback((delta, centerX, centerY, isSmooth = true) => {
    if (!onZoom) return
    
    // Clear any pending zoom timeout for smoother continuous zooming
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current)
    }

    // Apply zoom immediately for responsiveness
    onZoom(delta, centerX, centerY)
    
    // Set a timeout to finish any smooth zoom transitions
    if (isSmooth) {
      zoomTimeoutRef.current = setTimeout(() => {
        lastZoomRef.current = zoom
      }, 50)
    }
  }, [onZoom, zoom])

  // Calculate distance between two touch points
  const getTouchDistance = (touches) => {
    const [touch1, touch2] = touches
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Get center point between two touches
  const getTouchCenter = (touches) => {
    const [touch1, touch2] = touches
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    }
  }
  
  // Enhanced pointer down handler
  const handlePointerDown = (e) => {
    // Don't handle if clicking on interactive elements
    if (shouldIgnoreTarget(e.target)) {
      return
    }
    
    setIsDragging(true)
    setLastPointerPos({ 
      x: e.clientX || e.touches?.[0]?.clientX, 
      y: e.clientY || e.touches?.[0]?.clientY 
    })
    document.body.style.cursor = 'grabbing'
    e.preventDefault()
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    
    const currentX = e.clientX || e.touches?.[0]?.clientX
    const currentY = e.clientY || e.touches?.[0]?.clientY
    
    // Adjust sensitivity based on zoom level - more zoomed in = less sensitive
    const sensitivity = 0.3 / zoom
    const deltaX = (currentX - lastPointerPos.x) * sensitivity
    const deltaY = (currentY - lastPointerPos.y) * sensitivity
    
    setScrollPosition(prev => {
      let newX = prev.x - deltaX
      let newY = prev.y - deltaY
      
      // Improved loop boundaries with seamless wrapping
      newX = ((newX % scrollBounds.width) + scrollBounds.width) % scrollBounds.width
      newY = ((newY % scrollBounds.height) + scrollBounds.height) % scrollBounds.height
      
      return { x: newX, y: newY }
    })
    
    setLastPointerPos({ x: currentX, y: currentY })
    e.preventDefault()
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    touchStateRef.current.isZooming = false
    document.body.style.cursor = ''
  }

  // Enhanced wheel handler with smooth zooming
  const handleWheel = (e) => {
    // Don't handle wheel on interactive elements
    if (shouldIgnoreTarget(e.target)) {
      return
    }
    
    // Check for zoom gesture (Ctrl/Cmd + wheel)
    if ((e.ctrlKey || e.metaKey) && onZoom) {
      const zoomDelta = -e.deltaY * 2 // Increase zoom sensitivity
      performZoom(zoomDelta, e.clientX, e.clientY, true)
      e.preventDefault()
      return
    }
    
    // Regular scroll with zoom-adjusted sensitivity
    const sensitivity = Math.max(0.1, 0.2 / zoom) // Prevent too slow scrolling at high zoom
    const deltaX = e.deltaX * sensitivity
    const deltaY = e.deltaY * sensitivity
    
    setScrollPosition(prev => {
      let newX = prev.x + deltaX
      let newY = prev.y + deltaY
      
      // Improved loop boundaries with seamless wrapping
      newX = ((newX % scrollBounds.width) + scrollBounds.width) % scrollBounds.width
      newY = ((newY % scrollBounds.height) + scrollBounds.height) % scrollBounds.height
      
      return { x: newX, y: newY }
    })
    
    e.preventDefault()
  }

  // Enhanced touch handlers with pinch-to-zoom
  const handleTouchStart = (e) => {
    if (shouldIgnoreTarget(e.target)) {
      return
    }
    
    if (e.touches.length === 2) {
      // Two-finger touch detected - prepare for pinch zoom
      const distance = getTouchDistance(e.touches)
      touchStateRef.current = {
        initialDistance: distance,
        initialZoom: zoom,
        isZooming: true
      }
      e.preventDefault()
      return
    }
    
    // Single touch - handle as regular pointer
    touchStateRef.current.isZooming = false
    handlePointerDown(e)
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchStateRef.current.isZooming) {
      // Two-finger pinch zoom
      const currentDistance = getTouchDistance(e.touches)
      const center = getTouchCenter(e.touches)
      const canvas = canvasRef.current
      
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        const centerX = center.x - rect.left
        const centerY = center.y - rect.top
        
        // Calculate zoom delta based on distance change
        const distanceChange = currentDistance - touchStateRef.current.initialDistance
        const zoomDelta = distanceChange * 3 // Adjust sensitivity
        
        performZoom(zoomDelta, centerX, centerY, false)
      }
      
      e.preventDefault()
      return
    }
    
    // Single touch - handle as regular pointer
    if (!touchStateRef.current.isZooming) {
      handlePointerMove(e)
    }
  }

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      handlePointerUp()
    } else if (e.touches.length === 1) {
      // Switched from two fingers to one
      touchStateRef.current.isZooming = false
    }
  }

  // Enhanced keyboard shortcuts for zoom
  const handleKeyDown = (e) => {
    if (!onZoom) return
    
    // Don't handle if focused on input elements
    if (document.activeElement && 
        (document.activeElement.tagName === 'INPUT' ||
         document.activeElement.tagName === 'TEXTAREA' ||
         document.activeElement.isContentEditable)) {
      return
    }
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
      e.preventDefault()
      performZoom(100, centerX, centerY, true) // Zoom in
    } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
      e.preventDefault()
      performZoom(-100, centerX, centerY, true) // Zoom out
    } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
      e.preventDefault()
      // Reset to 100% zoom
      const targetZoom = 1
      const currentZoom = zoom
      const zoomDelta = (targetZoom - currentZoom) * 500 // Adjust for smooth transition
      performZoom(zoomDelta, centerX, centerY, true)
    }
  }

  // Attach scroll handlers with proper cleanup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Canvas-specific events
    canvas.addEventListener('mousedown', handlePointerDown, { passive: false })
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    
    // Global events for movement and release
    const handleGlobalMouseMove = (e) => {
      if (isDragging && !touchStateRef.current.isZooming) {
        handlePointerMove(e)
      }
    }
    
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handlePointerUp()
      }
    }
    
    const handleGlobalTouchMove = (e) => {
      if (isDragging || touchStateRef.current.isZooming) {
        handleTouchMove(e)
      }
    }
    
    const handleGlobalTouchEnd = (e) => {
      if (isDragging || touchStateRef.current.isZooming) {
        handleTouchEnd(e)
      }
    }
    
    document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false })
    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
    document.addEventListener('touchend', handleGlobalTouchEnd)
    
    // Keyboard shortcuts
    if (onZoom) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      canvas.removeEventListener('mousedown', handlePointerDown)
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('touchmove', handleGlobalTouchMove)
      document.removeEventListener('touchend', handleGlobalTouchEnd)
      
      if (onZoom) {
        document.removeEventListener('keydown', handleKeyDown)
      }

      // Clear any pending zoom timeouts
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current)
      }
    }
  }, [isDragging, lastPointerPos, scrollBounds, setScrollPosition, setIsDragging, setLastPointerPos, zoom, onZoom, performZoom])

  // Update zoom reference when zoom changes
  useEffect(() => {
    lastZoomRef.current = zoom
  }, [zoom])

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }
}