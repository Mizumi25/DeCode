import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, GripVertical } from 'lucide-react'

export default function Panel({ 
  isOpen = true, 
  panels = [],
  allowedDockPositions = ['left', 'right'],
  onPanelClose,
  className = '',
}) {
  const [dockedPanels, setDockedPanels] = useState({
    left: [],
    right: []
  })
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedPanel: null,
    startPosition: null,
    currentPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    dragElement: null
  })

  // Use ref for drag position to avoid re-renders during drag
  const dragPositionRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)

  // Initialize panels
  useEffect(() => {
    if (panels.length > 0) {
      const leftPanels = panels.slice(0, Math.min(2, Math.ceil(panels.length / 2)))
      const rightPanels = panels.slice(Math.ceil(panels.length / 2), Math.ceil(panels.length / 2) + 2)
      
      setDockedPanels({
        left: allowedDockPositions.includes('left') ? leftPanels : [],
        right: allowedDockPositions.includes('right') ? rightPanels : leftPanels.slice(0, 2)
      })
    }
  }, [panels, allowedDockPositions])

  // Calculate panel height with hover preview
  const getPanelHeight = useCallback((position) => {
    const currentCount = dockedPanels[position]?.length || 0
    if (currentCount === 0) return 'calc(100% - 1rem)'
    if (currentCount === 1) return 'calc(100% - 1rem)'
    return 'calc(50% - 0.75rem)'
  }, [dockedPanels])

  // Get target drop zone
  const getDropZone = useCallback(() => {
    if (!dragState.isDragging) return null
    const windowWidth = window.innerWidth
    const mouseX = dragPositionRef.current.x
    return mouseX < windowWidth / 2 ? 'left' : 'right'
  }, [dragState.isDragging])

  // Get drop target info with position and swap detection
  const getDropTarget = useCallback(() => {
    if (!dragState.isDragging) return null
    
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const { x: mouseX, y: mouseY } = dragPositionRef.current
    
    const targetPosition = mouseX < windowWidth / 2 ? 'left' : 'right'
    
    if (!allowedDockPositions.includes(targetPosition)) return null
    
    const targetPanels = dockedPanels[targetPosition] || []
    const { startPosition, draggedPanel } = dragState
    
    // Same dock reordering
    if (targetPosition === startPosition && targetPanels.length === 2) {
      const midY = windowHeight / 2
      const targetIndex = mouseY < midY ? 0 : 1
      const currentIndex = targetPanels.findIndex(p => p.id === draggedPanel.id)
      
      if (targetIndex !== currentIndex) {
        return {
          position: targetPosition,
          index: targetIndex,
          action: 'reorder'
        }
      }
    }
    
    // Different dock or empty dock
    if (targetPosition !== startPosition) {
      if (targetPanels.length === 0) {
        return {
          position: targetPosition,
          index: 0,
          action: 'move'
        }
      } else if (targetPanels.length === 1) {
        const midY = windowHeight / 2
        return {
          position: targetPosition,
          index: mouseY < midY ? 0 : 1,
          action: 'add'
        }
      } else if (targetPanels.length === 2) {
        const midY = windowHeight / 2
        return {
          position: targetPosition,
          index: mouseY < midY ? 0 : 1,
          action: 'swap'
        }
      }
    }
    
    return null
  }, [dragState.isDragging, dragState.startPosition, dragState.draggedPanel, dockedPanels, allowedDockPositions])

  // Optimized drag update using RAF
  const updateDragPosition = useCallback((clientX, clientY) => {
    if (!dragState.isDragging) return

    dragPositionRef.current = { x: clientX, y: clientY }
    
    // Cancel previous RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    
    // Use RAF for smooth 60fps updates
    rafRef.current = requestAnimationFrame(() => {
      const draggedElement = document.querySelector('.dragged-panel')
      if (draggedElement) {
        const x = clientX - dragState.offset.x
        const y = clientY - dragState.offset.y
        
        // Use transform for hardware acceleration
        draggedElement.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(3deg) scale(1.05)`
      }
      
      // Update drop zone state less frequently
      setDragState(prev => ({
        ...prev,
        currentPosition: { x: clientX, y: clientY }
      }))
    })
  }, [dragState.isDragging, dragState.offset])

  // Unified drag start handler
  const startDrag = useCallback((clientX, clientY, panel, position, element) => {
    const rect = element.getBoundingClientRect()
    
    dragPositionRef.current = { x: clientX, y: clientY }
    
    setDragState({
      isDragging: true,
      draggedPanel: panel,
      startPosition: position,
      currentPosition: { x: clientX, y: clientY },
      offset: {
        x: clientX - rect.left,
        y: clientY - rect.top
      },
      dragElement: element
    })

    document.body.style.userSelect = 'none'
    document.body.style.touchAction = 'none'
    document.body.style.cursor = 'grabbing'
  }, [])

  // Enhanced drag end handler with swapping
  const endDrag = useCallback((clientX, clientY) => {
    if (!dragState.isDragging) return

    // Cancel any pending RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    const dropTarget = getDropTarget()
    const { draggedPanel, startPosition } = dragState

    if (dropTarget) {
      const { position: targetPosition, index: targetIndex, action } = dropTarget
      
      setDockedPanels(prev => {
        const newState = { ...prev }
        
        switch (action) {
          case 'reorder': {
            // Reorder within same dock
            const panels = [...(prev[targetPosition] || [])]
            const draggedIndex = panels.findIndex(p => p.id === draggedPanel.id)
            
            if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
              // Remove and reinsert at new position
              panels.splice(draggedIndex, 1)
              panels.splice(targetIndex, 0, draggedPanel)
              newState[targetPosition] = panels
            }
            break
          }
          
          case 'move': {
            // Move to empty dock
            newState[startPosition] = (prev[startPosition] || []).filter(p => p.id !== draggedPanel.id)
            newState[targetPosition] = [draggedPanel]
            break
          }
          
          case 'add': {
            // Add to dock with 1 panel
            newState[startPosition] = (prev[startPosition] || []).filter(p => p.id !== draggedPanel.id)
            const targetPanels = [...(prev[targetPosition] || [])]
            targetPanels.splice(targetIndex, 0, draggedPanel)
            newState[targetPosition] = targetPanels
            break
          }
          
          case 'swap': {
            // Swap with panel in full dock
            const targetPanels = [...(prev[targetPosition] || [])]
            const panelToSwap = targetPanels[targetIndex]
            
            if (panelToSwap) {
              // Remove dragged panel from source
              newState[startPosition] = (prev[startPosition] || []).filter(p => p.id !== draggedPanel.id)
              
              // Replace target panel with dragged panel
              targetPanels[targetIndex] = draggedPanel
              newState[targetPosition] = targetPanels
              
              // Add swapped panel to source position
              newState[startPosition] = [...newState[startPosition], panelToSwap]
            }
            break
          }
        }
        
        return newState
      })
    }

    // Clean up
    setDragState({
      isDragging: false,
      draggedPanel: null,
      startPosition: null,
      currentPosition: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      dragElement: null
    })

    document.body.style.userSelect = ''
    document.body.style.touchAction = ''
    document.body.style.cursor = ''
  }, [dragState, getDropTarget])

  // Mouse handlers
  const handleMouseDown = useCallback((e, panel, position) => {
    e.preventDefault()
    startDrag(e.clientX, e.clientY, panel, position, e.currentTarget.closest('.panel-container'))
  }, [startDrag])

  // Global mouse event handlers with throttling
  useEffect(() => {
    if (!dragState.isDragging) return

    const handleMouseMove = (e) => {
      e.preventDefault()
      updateDragPosition(e.clientX, e.clientY)
    }

    const handleMouseUp = (e) => {
      e.preventDefault()
      endDrag(e.clientX, e.clientY)
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: false })
    document.addEventListener('mouseup', handleMouseUp, { passive: false })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [dragState.isDragging, updateDragPosition, endDrag])

  // Touch handlers
  const handleTouchStart = useCallback((e, panel, position) => {
    e.preventDefault()
    const touch = e.touches[0]
    startDrag(touch.clientX, touch.clientY, panel, position, e.currentTarget.closest('.panel-container'))
  }, [startDrag])

  // Global touch event handlers with throttling
  useEffect(() => {
    if (!dragState.isDragging) return

    const handleTouchMove = (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      updateDragPosition(touch.clientX, touch.clientY)
    }

    const handleTouchEnd = (e) => {
      e.preventDefault()
      const touch = e.changedTouches[0]
      endDrag(touch.clientX, touch.clientY)
    }

    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [dragState.isDragging, updateDragPosition, endDrag])

  // Panel close handler
  const handleClose = useCallback((panelId, position) => {
    setDockedPanels(prev => ({
      ...prev,
      [position]: (prev[position] || []).filter(p => p.id !== panelId)
    }))
    onPanelClose?.(panelId)
  }, [onPanelClose])

  // Render single panel with visual feedback
  const renderPanel = (panel, position, index) => {
    const isDragged = dragState.isDragging && dragState.draggedPanel?.id === panel.id
    const dropTarget = getDropTarget()
    
    // Check if this panel will be affected
    const willBeAffected = dropTarget && dropTarget.position === position && 
      ((dropTarget.action === 'reorder' && dropTarget.index !== index) ||
       (dropTarget.action === 'add' && dropTarget.index <= index) ||
       (dropTarget.action === 'swap' && dropTarget.index === index))
    
    const panelHeight = getPanelHeight(position)

    return (
      <motion.div
        key={panel.id}
        className={`w-full panel-container ${isDragged ? 'opacity-30' : 'opacity-100'}`}
        initial={{ opacity: 0, y: 20, height: 0 }}
        animate={{ 
          opacity: isDragged ? 0.3 : 1, 
          y: 0, 
          height: panelHeight,
          scale: willBeAffected ? 0.95 : 1,
        }}
        exit={{ 
          opacity: 0, 
          y: -20, 
          height: 0
        }}
        transition={{ 
          type: "spring", 
          damping: 25, 
          stiffness: 300,
          height: { duration: 0.3, ease: "easeInOut" },
          scale: { duration: 0.2, ease: "easeOut" }
        }}
        layout
      >
        <div 
          className={`rounded-lg border overflow-hidden h-full transition-all duration-200`}
          style={{
            backgroundColor: willBeAffected ? 'rgba(251, 146, 60, 0.1)' : 'var(--color-surface)',
            borderColor: willBeAffected ? 'rgb(251, 146, 60)' : 'var(--color-border)',
            boxShadow: willBeAffected ? 'var(--shadow-lg)' : 'var(--shadow-md)',
          }}
        >
          {/* Panel Header */}
          <div 
            className="flex items-center justify-between px-3 py-3 border-b cursor-grab active:cursor-grabbing select-none touch-manipulation"
            style={{
              backgroundColor: 'var(--color-bg-muted)',
              borderColor: 'var(--color-border)',
              minHeight: '48px',
            }}
            onMouseDown={(e) => handleMouseDown(e, panel, position)}
            onTouchStart={(e) => handleTouchStart(e, panel, position)}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="w-5 h-5 text-[var(--color-text-muted)]" />
              <h3 className="font-semibold text-sm text-[var(--color-text)]">{panel.title}</h3>
              {willBeAffected && (
                <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600 font-medium">
                  {dropTarget?.action === 'swap' ? 'Will Swap' : 'Will Move'}
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleClose(panel.id, position)
              }}
              className="p-2 rounded transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-primary)] touch-manipulation"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Panel Content */}
          <div className="overflow-y-auto" style={{ height: 'calc(100% - 48px)' }}>
            <div className="p-4">
              {panel.content}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Render dock area
  const renderDockArea = (position) => {
    const panels = dockedPanels[position] || []
    const dropTarget = getDropTarget()
    const isDropTarget = dropTarget && dropTarget.position === position
    
    if (!allowedDockPositions.includes(position)) return null

    return (
      <div
        className={`dock-${position} absolute top-4 ${position === 'left' ? 'left-4' : 'right-4'} w-80 z-40`}
        style={{ height: 'calc(100% - 2rem)' }}
      >
        {/* Vertical Stack Container */}
        <motion.div
          className="flex flex-col h-full gap-2 relative"
          animate={{
            scale: isDropTarget ? 1.02 : 1,
          }}
          transition={{ 
            type: "spring", 
            damping: 20, 
            stiffness: 300
          }}
        >
          <AnimatePresence mode="popLayout">
            {panels.map((panel, index) => renderPanel(panel, position, index))}
          </AnimatePresence>
        </motion.div>

        {/* Drop zone indicator */}
        {isDropTarget && (
          <motion.div 
            className="absolute inset-0 rounded-lg border-2 border-dashed pointer-events-none flex items-center justify-center"
            style={{
              borderColor: dropTarget?.action === 'swap' ? 'rgb(251, 146, 60)' : 'var(--color-primary)',
              backgroundColor: dropTarget?.action === 'swap' ? 'rgba(251, 146, 60, 0.1)' : 'rgba(59, 130, 246, 0.1)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              className="px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{
                backgroundColor: dropTarget?.action === 'swap' ? 'rgb(251, 146, 60)' : 'var(--color-primary)'
              }}
            >
              {dropTarget?.action === 'swap' ? 'Swap Position' : 'Drop Here'}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {panels.length === 0 && !dragState.isDragging && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center rounded-lg border-2 border-dashed"
            style={{ borderColor: 'var(--color-border)', opacity: 0.3 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
          >
            <span className="text-sm text-[var(--color-text-muted)]">Drop panels here</span>
          </motion.div>
        )}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <>
      <style jsx global>{`
        .touch-manipulation {
          touch-action: manipulation;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        
        .panel-stack {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dragged-panel {
          position: fixed !important;
          z-index: 9999 !important;
          pointer-events: none;
          will-change: transform;
          backface-visibility: hidden;
          perspective: 1000px;
        }

        .panel-container {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }
      `}</style>
      
      {renderDockArea('left')}
      {renderDockArea('right')}

      {/* PREMIUM DRAG STATE DESIGN - Modern primary + transparent gradient */}
      {dragState.isDragging && dragState.draggedPanel && (
        <div
          className="dragged-panel w-80"
          style={{
            left: 0,
            top: 0,
            transform: `translate3d(${dragState.currentPosition.x - dragState.offset.x}px, ${dragState.currentPosition.y - dragState.offset.y}px, 0) rotate(3deg) scale(1.05)`,
          }}
        >
          <div
            className="rounded-lg border-2 overflow-hidden shadow-2xl backdrop-blur-sm"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-primary)',
              height: '300px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* ORIGINAL HEADER DESIGN - Exact Copy */}
            <div 
              className="flex items-center justify-between px-3 py-2 border-b bg-gradient-to-r"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4" />
                <h3 className="font-medium text-sm">{dragState.draggedPanel.title}</h3>
              </div>
            </div>
            
            {/* Panel Content - Very Subtle Primary Tint */}
            <div 
              className="p-3 overflow-y-auto" 
              style={{ 
                height: 'calc(100% - 42px)',
                backgroundColor: 'var(--color-surface)',
                background: 'linear-gradient(180deg, var(--color-surface) 0%, color-mix(in srgb, var(--color-primary) 2%, var(--color-surface)) 100%)'
              }}
            >
              <div className="text-sm">
                {dragState.draggedPanel.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}