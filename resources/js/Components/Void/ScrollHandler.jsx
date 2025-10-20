// Components/Void/ScrollHandler.jsx - REPLACE ENTIRE FILE
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
  const isDraggingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef(null)
  const touchStateRef = useRef({
    initialDistance: 0,
    initialZoom: zoom,
    isZooming: false
  })

  // Optimized pointer down handler
  const handlePointerDown = useCallback((e) => {
    if (shouldIgnoreTarget(e.target)) return
    
    isDraggingRef.current = true
    setIsDragging(true)
    
    const clientX = e.clientX || e.touches?.[0]?.clientX
    const clientY = e.clientY || e.touches?.[0]?.clientY
    
    lastPosRef.current = { x: clientX, y: clientY }
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
    
    e.preventDefault()
    e.stopPropagation()
  }, [setIsDragging])


// Smooth pointer move with requestAnimationFrame
const handlePointerMove = useCallback((e) => {
  if (!isDraggingRef.current) return
  
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
}, [zoom, scrollBounds, setScrollPosition])

  // Clean pointer up handler
  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false
    setIsDragging(false)
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    touchStateRef.current.isZooming = false
  }, [setIsDragging])

// Enhanced wheel handler
const handleWheel = useCallback((e) => {
  if (shouldIgnoreTarget(e.target)) return
  
  // Zoom with Ctrl/Cmd
  if ((e.ctrlKey || e.metaKey) && onZoom) {
    const zoomDelta = -e.deltaY * 0.01
    const rect = canvasRef.current?.getBoundingClientRect()
    const centerX = e.clientX - (rect?.left || 0)
    const centerY = e.clientY - (rect?.top || 0)
    
    onZoom(zoomDelta, centerX, centerY)
    e.preventDefault()
    return
  }
  
  // FIXED: Always allow full scrollBounds, regardless of frame positions
  const sensitivity = Math.max(0.05, 0.15 / zoom)
  const deltaX = e.deltaX * sensitivity
  const deltaY = e.deltaY * sensitivity
  
  setScrollPosition(prev => {
    let newX = prev.x + deltaX
    let newY = prev.y + deltaY
    
    // FIXED: Allow scrolling to full bounds
    newX = Math.max(0, Math.min(scrollBounds.width - window.innerWidth / zoom, newX))
    newY = Math.max(0, Math.min(scrollBounds.height - window.innerHeight / zoom, newY))
    
    return { x: newX, y: newY }
  })
  
  e.preventDefault()
}, [zoom, onZoom, scrollBounds, setScrollPosition, canvasRef])

 // Target ignore helper - REMOVED canvas check
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
         target.closest('.delete-button')
  // REMOVED: target.closest('[data-canvas]') - Allow canvas scrolling
}

  // Setup event listeners
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const options = { passive: false }

    // Canvas events
    canvas.addEventListener('mousedown', handlePointerDown, options)
    canvas.addEventListener('wheel', handleWheel, options)
    canvas.addEventListener('touchstart', handlePointerDown, options)

    // Global events
    const handleGlobalMouseMove = (e) => {
      if (isDraggingRef.current) handlePointerMove(e)
    }
    
    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) handlePointerUp()
    }

    document.addEventListener('mousemove', handleGlobalMouseMove, options)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('touchmove', handlePointerMove, options)
    document.addEventListener('touchend', handlePointerUp)

    return () => {
      canvas.removeEventListener('mousedown', handlePointerDown)
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('touchstart', handlePointerDown)
      
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('touchmove', handlePointerMove)
      document.removeEventListener('touchend', handlePointerUp)

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