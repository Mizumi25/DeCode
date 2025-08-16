import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, GripVertical, Maximize2, Minimize2 } from 'lucide-react'

export default function Panel({ 
  isOpen = true, 
  panels = [],
  initialPanels = [], // New prop for initial panels
  allowedDockPositions = ['left', 'right'],
  onPanelClose,
  onPanelStateChange, // New callback for state changes
  className = '',
  snapToEdge = false, // New prop for edge snapping
  mergePanels = false, // New prop for panel merging
  mergePosition = null, // Which position should be merged ('left' or 'right')
}) {
  // Memoize the panels to use to prevent unnecessary re-calculations
  const panelsToUse = useMemo(() => {
    return initialPanels.length > 0 ? initialPanels : panels
  }, [initialPanels, panels])

  // Memoize the initial state calculation
  const initialPanelState = useMemo(() => {
    if (panelsToUse.length === 0) {
      return { left: [], right: [] }
    }

    // If only right docking is allowed, put all panels on the right
    if (allowedDockPositions.includes('right') && !allowedDockPositions.includes('left')) {
      return { 
        left: [], 
        right: panelsToUse.slice(0, 2) // Max 2 panels per side
      }
    }
    
    // If only left docking is allowed, put all panels on the left
    if (allowedDockPositions.includes('left') && !allowedDockPositions.includes('right')) {
      return { 
        left: panelsToUse.slice(0, 2),
        right: []
      }
    }

    // Both sides allowed - distribute panels
    const leftPanels = panelsToUse.slice(0, Math.min(2, Math.ceil(panelsToUse.length / 2)))
    const rightPanels = panelsToUse.slice(Math.ceil(panelsToUse.length / 2), Math.ceil(panelsToUse.length / 2) + 2)
    
    return {
      left: allowedDockPositions.includes('left') ? leftPanels : [],
      right: allowedDockPositions.includes('right') ? rightPanels : leftPanels.slice(0, 2)
    }
  }, [panelsToUse, allowedDockPositions])

  const [dockedPanels, setDockedPanels] = useState(initialPanelState)
  const [mergedStates, setMergedStates] = useState(() => {
    // Initialize merged states based on mergePosition prop
    return {
      left: mergePosition === 'left',
      right: mergePosition === 'right'
    }
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

  // Only update panels when the memoized panelsToUse actually changes
  useEffect(() => {
    setDockedPanels(initialPanelState)
  }, [initialPanelState])

  // Update merged states when mergePosition prop changes
  useEffect(() => {
    setMergedStates({
      left: mergePosition === 'left',
      right: mergePosition === 'right'
    })
  }, [mergePosition])

  // Notify parent of panel state changes - ADD DEPENDENCY ARRAY
  useEffect(() => {
    if (onPanelStateChange) {
      const hasRightPanels = dockedPanels.right && dockedPanels.right.length > 0
      onPanelStateChange(hasRightPanels)
    }
  }, [dockedPanels.right?.length, onPanelStateChange]) // FIXED: Added proper dependencies

  // Calculate panel height with hover preview and merging
  const getPanelHeight = useCallback((position) => {
    const currentCount = dockedPanels[position]?.length || 0
    const isMerged = mergedStates[position]
    
    if (currentCount === 0) return 'calc(100% - 1rem)'
    if (currentCount === 1 || isMerged) return 'calc(100% - 1rem)'
    return 'calc(50% - 0.75rem)'
  }, [dockedPanels, mergedStates])

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

  // Toggle merge state for a position
  const toggleMerge = useCallback((position) => {
    setMergedStates(prev => ({
      ...prev,
      [position]: !prev[position]
    }))
  }, [])

  // Render merged panels
  const renderMergedPanels = (panels, position) => {
    if (!panels || panels.length === 0) return null
    
    return (
      <motion.div
        className="w-full h-full panel-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div 
          className="rounded-lg border overflow-hidden h-full"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Merged Header with tabs */}
          <div 
            className="flex items-center justify-between border-b"
            style={{
              backgroundColor: 'var(--color-bg-muted)',
              borderColor: 'var(--color-border)',
              minHeight: '48px',
            }}
          >
            <div className="flex items-center flex-1">
              <div className="flex items-center gap-2 px-3">
                <GripVertical className="w-5 h-5 text-[var(--color-text-muted)]" />
              </div>
              
              {/* Panel tabs */}
              <div className="flex border-r" style={{ borderColor: 'var(--color-border)' }}>
                {panels.map((panel, index) => (
                  <div
                    key={panel.id}
                    className={`px-3 py-2 text-sm font-medium cursor-pointer transition-colors border-r ${
                      index === 0 ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]'
                    }`}
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    {panel.title}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3">
              <button
                onClick={() => toggleMerge(position)}
                className="p-1 rounded transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                title="Split Panels"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleClose(panels[0].id, position)}
                className="p-1 rounded transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                title="Close All"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Merged Content - showing first panel by default */}
          <div className="overflow-y-auto" style={{ height: 'calc(100% - 48px)' }}>
            <div className="p-4">
              {panels[0]?.content}
            </div>
            
            {/* Show other panels collapsed */}
            {panels.slice(1).map((panel) => (
              <div key={panel.id} className="border-t p-4" style={{ borderColor: 'var(--color-border)' }}>
                <div className="text-sm font-medium text-[var(--color-text-muted)] mb-2">
                  {panel.title}
                </div>
                <div className="text-sm opacity-60">
                  {panel.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

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
            <div className="flex items-center gap-1">
              {/* Merge button - only show if there are 2 panels */}
              {dockedPanels[position]?.length === 2 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleMerge(position)
                  }}
                  className="p-1 rounded transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                  title="Merge Panels"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleClose(panel.id, position)
                }}
                className="p-1 rounded transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                title="Close Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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
    const isMerged = mergedStates[position] && panels.length > 1
    
    if (!allowedDockPositions.includes(position)) return null

    // Calculate positioning based on snapToEdge
    const dockStyle = snapToEdge
      ? {
          position: 'relative', // Changed from absolute to relative for snapToEdge
          display: 'block',
          width: '320px',
          height: '100%',
          float: position, // Use float to position left or right
        }
      : {
          position: 'absolute', // Keep absolute for non-snapToEdge
          [position === 'left' ? 'left' : 'right']: '1rem',
          top: '1rem',
          height: 'calc(100% - 2rem)',
          width: '320px'
        }

    const containerClass = snapToEdge 
      ? `dock-${position}-snapped` 
      : `dock-${position}`

    return (
      <div
        className={`${containerClass} z-40`}
        style={dockStyle}
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
            {isMerged ? (
              <motion.div key="merged" className="h-full">
                {renderMergedPanels(panels, position)}
              </motion.div>
            ) : (
              panels.map((panel, index) => renderPanel(panel, position, index))
            )}
          </AnimatePresence>
        </motion.div>

        {/* Drop zone indicator - ONLY shows when dragging */}
        {isDropTarget && !isMerged && (
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
        
        /* Snap to edge specific styles */
        .dock-left-snapped {
          border-right: 1px solid var(--color-border, #3e3e3e);
        }
        
        .dock-right-snapped {
          border-left: 1px solid var(--color-border, #3e3e3e);
        }
      `}</style>
      
      {renderDockArea('left')}
      {renderDockArea('right')}

      {/* Enhanced drag state with modern styling */}
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
            {/* Header with primary gradient */}
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
            
            {/* Panel Content with subtle tint */}
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