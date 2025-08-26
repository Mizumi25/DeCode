import { useEffect } from 'react'

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
  
  // Check if target should be ignored for scrolling
  const shouldIgnoreTarget = (target) => {
    return target.closest('.preview-frame') || 
           target.closest('.lock-button') || 
           target.closest('.more-button') || 
           target.closest('.avatar') ||
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
  
  // Infinite scroll handlers
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
    document.body.style.cursor = ''
  }

  const handleWheel = (e) => {
    // Don't handle wheel on interactive elements
    if (shouldIgnoreTarget(e.target)) {
      return
    }
    
    // Check for zoom gesture (Ctrl/Cmd + wheel)
    if ((e.ctrlKey || e.metaKey) && onZoom) {
      const zoomDelta = -e.deltaY
      onZoom(zoomDelta, e.clientX, e.clientY)
      e.preventDefault()
      return
    }
    
    // Regular scroll with zoom-adjusted sensitivity
    const sensitivity = 0.2 / zoom
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

  // Pinch zoom support for touch devices
  const handleTouchStart = (e) => {
    if (shouldIgnoreTarget(e.target)) {
      return
    }
    
    if (e.touches.length === 2) {
      // Two-finger touch detected - prepare for pinch zoom
      e.preventDefault()
      return
    }
    
    // Single touch - handle as regular pointer
    handlePointerDown(e)
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      // Two-finger pinch zoom
      e.preventDefault()
      return
    }
    
    // Single touch - handle as regular pointer
    handlePointerMove(e)
  }

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      handlePointerUp()
    }
  }

  // Keyboard shortcuts for zoom
  const handleKeyDown = (e) => {
    if (!onZoom) return
    
    // Don't handle if focused on input elements
    if (document.activeElement && 
        (document.activeElement.tagName === 'INPUT' ||
         document.activeElement.tagName === 'TEXTAREA' ||
         document.activeElement.isContentEditable)) {
      return
    }
    
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
      e.preventDefault()
      const canvas = canvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        onZoom(100, centerX, centerY) // Zoom in
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
      e.preventDefault()
      const canvas = canvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        onZoom(-100, centerX, centerY) // Zoom out
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
      e.preventDefault()
      // Reset zoom to 100%
      if (onZoom) {
        const canvas = canvasRef.current
        if (canvas) {
          const rect = canvas.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2
          // This would need to be handled differently to reset zoom
          // For now, just zoom in/out toward center
          onZoom(0, centerX, centerY)
        }
      }
    }
  }

  // Attach scroll handlers
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Only attach mouse events to canvas directly
    canvas.addEventListener('mousedown', handlePointerDown)
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    
    // Global events only for movement and release
    const handleGlobalMouseMove = (e) => {
      if (isDragging) {
        handlePointerMove(e)
      }
    }
    
    const handleGlobalMouseUp = (e) => {
      if (isDragging) {
        handlePointerUp()
      }
    }
    
    const handleGlobalTouchMove = (e) => {
      if (isDragging) {
        handleTouchMove(e)
      }
    }
    
    const handleGlobalTouchEnd = (e) => {
      if (isDragging) {
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
    }
  }, [isDragging, lastPointerPos, scrollBounds, setScrollPosition, setIsDragging, setLastPointerPos, zoom, onZoom])

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