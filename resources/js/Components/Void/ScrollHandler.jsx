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
  
  // Infinite scroll handlers
  const handlePointerDown = (e) => {
    // Don't handle if it's a frame or interactive element
    if (e.target.closest('.preview-frame') || 
        e.target.closest('.lock-button') || 
        e.target.closest('.more-button') || 
        e.target.closest('.avatar')) {
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

    // Mouse events
    canvas.addEventListener('mousedown', handlePointerDown)
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    
    // Touch events with improved handling
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    
    // Global events
    document.addEventListener('mousemove', handlePointerMove)
    document.addEventListener('mouseup', handlePointerUp)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
    
    // Keyboard shortcuts
    if (onZoom) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      canvas.removeEventListener('mousedown', handlePointerDown)
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('mousemove', handlePointerMove)
      document.removeEventListener('mouseup', handlePointerUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      
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