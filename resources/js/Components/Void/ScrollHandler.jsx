import { useEffect } from 'react'

export function useScrollHandler({
  canvasRef,
  scrollPosition,
  setScrollPosition,
  isDragging,
  setIsDragging,
  lastPointerPos,
  setLastPointerPos,
  scrollBounds
}) {
  
  // Infinite scroll handlers
  const handlePointerDown = (e) => {
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
    
    // REDUCED sensitivity - multiply by 0.3 to make it slower
    const deltaX = (currentX - lastPointerPos.x) * 0.3
    const deltaY = (currentY - lastPointerPos.y) * 0.3
    
    setScrollPosition(prev => {
      let newX = prev.x - deltaX
      let newY = prev.y - deltaY
      
      // IMPROVED Loop boundaries - use modulo for seamless wrapping
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
    // REDUCED wheel sensitivity - multiply by 0.2 to make it much slower
    const deltaX = e.deltaX * 0.2
    const deltaY = e.deltaY * 0.2
    
    setScrollPosition(prev => {
      let newX = prev.x + deltaX
      let newY = prev.y + deltaY
      
      // IMPROVED Loop boundaries - use modulo for seamless wrapping
      newX = ((newX % scrollBounds.width) + scrollBounds.width) % scrollBounds.width
      newY = ((newY % scrollBounds.height) + scrollBounds.height) % scrollBounds.height
      
      return { x: newX, y: newY }
    })
    
    e.preventDefault()
  }

  // Attach scroll handlers
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Mouse events
    canvas.addEventListener('mousedown', handlePointerDown)
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    
    // Touch events
    canvas.addEventListener('touchstart', handlePointerDown, { passive: false })
    
    // Global events
    document.addEventListener('mousemove', handlePointerMove)
    document.addEventListener('mouseup', handlePointerUp)
    document.addEventListener('touchmove', handlePointerMove, { passive: false })
    document.addEventListener('touchend', handlePointerUp)

    return () => {
      canvas.removeEventListener('mousedown', handlePointerDown)
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('mousemove', handlePointerMove)
      document.removeEventListener('mouseup', handlePointerUp)
      document.removeEventListener('touchmove', handlePointerMove)
      document.removeEventListener('touchend', handlePointerUp)
    }
  }, [isDragging, lastPointerPos, scrollBounds, setScrollPosition, setIsDragging, setLastPointerPos])

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel
  }
}