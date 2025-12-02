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
  onZoom = null,
  onPinchZoom = null,
  onTouchEnd = null
}) {
  const isDraggingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const startPosRef = useRef({ x: 0, y: 0 })
  const hasCrossedThresholdRef = useRef(false)
  const animationFrameRef = useRef(null)
  const DRAG_THRESHOLD = 3 // pixels
  const touchStateRef = useRef({
    initialDistance: 0,
    initialZoom: 1,
    isZooming: false
  })

  // Target ignore helper
  const shouldIgnoreTarget = (target) => {
    if (!target) return false

    // 🔥 DEBUG: Log what's being clicked
    console.log('🎯 ScrollHandler checking target:', {
      tagName: target.tagName,
      className: target.className,
      id: target.id,
      dataset: target.dataset
    });

    // 🔥 FIXED: Added proper selectors for FloatingToolbox and all interactive elements
    const selectors = [
      '.preview-frame',
      '.lock-button',
      '.more-button',
      '.avatar',
      '.frame-header',
      '.floating-toolbox',
      '.floating-tool',
      'button', // 🔥 CRITICAL: Ignore all buttons
      '[data-panel]',
      '.panel-container',
      '.panel-stack',
      '.dragged-panel',
      '.dragging-panel',
      '.dock-left',
      '.dock-right',
      '.dock-left-snapped',
      '.dock-right-snapped',
      '.delete-button',
      // 🔥 NEW: Frame containers
      '.frame-container', // Container wrapper
      '[data-container-element="true"]', // Data attribute check
      // 🔥 NEW: Specific selectors for FloatingToolbox
      '[data-tool-index]', // The wrapper div
      '.tool-icon', // The icon inside button
      '.group', // The group wrapper
      '.ftb-label', // The label
      '.z-50', // Any element with z-50 class
      // 🔥 NEW: Generic interactive elements
      '[role="button"]',
      '.cursor-pointer',
      '.pointer-events-auto'
    ]

    const shouldIgnore = selectors.some(sel => !!target.closest(sel));
    console.log('🎯 ScrollHandler decision:', shouldIgnore ? '✅ IGNORING (allowing interaction)' : '❌ CAPTURING (blocking interaction)');
    
    return shouldIgnore;
  }

  // Optimized pointer down handler with threshold
  const handlePointerDown = useCallback((e) => {
    if (shouldIgnoreTarget(e.target)) return
    
    // Don't start drag if it's a two-finger touch (zoom)
    if (e.touches?.length === 2) {
      return
    }
    
    const clientX = e.clientX || e.touches?.[0]?.clientX
    const clientY = e.clientY || e.touches?.[0]?.clientY
    
    // Track start position but don't start dragging yet
    isDraggingRef.current = true // Track that pointer is down
    hasCrossedThresholdRef.current = false // Reset threshold
    startPosRef.current = { x: clientX, y: clientY }
    lastPosRef.current = { x: clientX, y: clientY }
    
    // Don't prevent default yet - allow clicks to work
  }, [setIsDragging])

  // Smooth pointer move with requestAnimationFrame and threshold
  const handlePointerMove = useCallback((e) => {
    // If the move event started over a panel (or moved over one), ignore it.
    if (shouldIgnoreTarget(e.target)) return

    // Handle pinch zoom first - PRIORITY
    if (e.touches?.length === 2 && onPinchZoom) {
      onPinchZoom(e)
      isDraggingRef.current = false
      hasCrossedThresholdRef.current = false
      setIsDragging(false)
      return
    }
    
    if (!isDraggingRef.current) return
    
    const clientX = e.clientX || e.touches?.[0]?.clientX
    const clientY = e.clientY || e.touches?.[0]?.clientY
    
    // Check threshold if not crossed yet
    if (!hasCrossedThresholdRef.current) {
      const deltaX = Math.abs(clientX - startPosRef.current.x)
      const deltaY = Math.abs(clientY - startPosRef.current.y)
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      
      if (distance < DRAG_THRESHOLD) {
        return // Not moved enough yet - allow click to work
      }
      
      // Threshold crossed - start actual dragging
      hasCrossedThresholdRef.current = true
      setIsDragging(true)
      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const clientX = e.clientX || e.touches?.[0]?.clientX
      const clientY = e.clientY || e.touches?.[0]?.clientY
      
      const deltaX = (clientX - lastPosRef.current.x) * (0.8 / zoom)
      const deltaY = (clientY - lastPosRef.current.y) * (0.8 / zoom)
      
      setScrollPosition(prev => {
        let newX = prev.x - deltaX
        let newY = prev.y - deltaY
        
        newX = Math.max(-scrollBounds.width * 0.1, Math.min(scrollBounds.width * 1.1 - window.innerWidth / zoom, newX))
        newY = Math.max(-scrollBounds.height * 0.1, Math.min(scrollBounds.height * 1.1 - window.innerHeight / zoom, newY))
        
        return { x: newX, y: newY }
      })
      
      lastPosRef.current = { x: clientX, y: clientY }
    })
    
    e.preventDefault()
    e.stopPropagation()
  }, [zoom, scrollBounds, setScrollPosition, onPinchZoom, setIsDragging])

  // Clean pointer up handler
  const handlePointerUp = useCallback((e) => {
    // If threshold was never crossed, it was a click
    if (!hasCrossedThresholdRef.current) {
      console.log('✅ Click detected (within threshold)')
    }
    
    isDraggingRef.current = false
    hasCrossedThresholdRef.current = false
    setIsDragging(false)
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    // Handle touch end for zoom
    if ((e.type === 'touchend' || e.type === 'touchcancel') && onTouchEnd) {
      onTouchEnd(e)
    }
    
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [setIsDragging, onTouchEnd])

  // Enhanced wheel handler with Figma-like zoom
  const handleWheel = useCallback((e) => {
    if (shouldIgnoreTarget(e.target)) return
    
    // Zoom with Ctrl/Cmd or custom logic
    if ((e.ctrlKey || e.metaKey) && onZoom) {
      const zoomDelta = -e.deltaY * 0.5 // Increased sensitivity
      const rect = canvasRef.current?.getBoundingClientRect()
      const centerX = e.clientX - (rect?.left || 0)
      const centerY = e.clientY - (rect?.top || 0)
      
      onZoom(zoomDelta, centerX, centerY)
      e.preventDefault()
      e.stopPropagation()
      return
    }
    
    // Regular scrolling
    const sensitivity = Math.max(0.05, 0.15 / zoom)
    const deltaX = e.deltaX * sensitivity
    const deltaY = e.deltaY * sensitivity
    
    setScrollPosition(prev => {
      let newX = prev.x + deltaX
      let newY = prev.y + deltaY
      
      newX = Math.max(0, Math.min(scrollBounds.width - window.innerWidth / zoom, newX))
      newY = Math.max(0, Math.min(scrollBounds.height - window.innerHeight / zoom, newY))
      
      return { x: newX, y: newY }
    })
    
    e.preventDefault()
    e.stopPropagation()
  }, [zoom, onZoom, scrollBounds, setScrollPosition, canvasRef])

  // Setup event listeners with proper touch handling
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const options = { passive: false }

    // Canvas events
    canvas.addEventListener('mousedown', handlePointerDown, options)
    canvas.addEventListener('wheel', handleWheel, options)
    canvas.addEventListener('touchstart', handlePointerDown, options)
    canvas.addEventListener('touchmove', handlePointerMove, options)
    canvas.addEventListener('touchend', handlePointerUp, options)
    canvas.addEventListener('touchcancel', handlePointerUp, options)

    // Global events
    const handleGlobalMouseMove = (e) => {
      if (isDraggingRef.current) handlePointerMove(e)
    }
    
    const handleGlobalMouseUp = (e) => {
      if (isDraggingRef.current) handlePointerUp(e)
    }

    document.addEventListener('mousemove', handleGlobalMouseMove, options)
    document.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      canvas.removeEventListener('mousedown', handlePointerDown)
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('touchstart', handlePointerDown)
      canvas.removeEventListener('touchmove', handlePointerMove)
      canvas.removeEventListener('touchend', handlePointerUp)
      canvas.removeEventListener('touchcancel', handlePointerUp)
      
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [handlePointerDown, handlePointerMove, handlePointerUp, handleWheel, canvasRef])

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel
  }
}