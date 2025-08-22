import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, GripVertical, Group, Ungroup, Search, Plus } from 'lucide-react'

export default function Panel({ 
  isOpen = true, 
  panels = [],
  initialPanels = [], 
  allowedDockPositions = ['left', 'right'],
  onPanelClose,
  onPanelStateChange, 
  className = '',
  snapToEdge = false, 
  mergePanels = false, 
  mergePosition = null, 
  showTabs = false,
  showSearch = false,
  tabConfig = null,
  onTabChange = null,
  onSearch = null,
  searchPlaceholder = "Search...",
}) {
  // Memoize the panels to use to prevent unnecessary re-calculations
  const panelsToUse = useMemo(() => {
    return initialPanels.length > 0 ? initialPanels : panels
  }, [initialPanels, panels])

  // Tab and search state
  const [activeTab, setActiveTab] = useState(tabConfig?.defaultTab || 'tab1')
  const [searchTerm, setSearchTerm] = useState('')

  // Memoize the initial state calculation
  const initialPanelState = useMemo(() => {
    if (panelsToUse.length === 0) {
      return { left: [], right: [] }
    }

    if (allowedDockPositions.includes('right') && !allowedDockPositions.includes('left')) {
      return { 
        left: [], 
        right: panelsToUse.slice(0, 2) 
      }
    }
    
    if (allowedDockPositions.includes('left') && !allowedDockPositions.includes('right')) {
      return { 
        left: panelsToUse.slice(0, 2),
        right: []
      }
    }

    const leftPanels = panelsToUse.slice(0, Math.min(2, Math.ceil(panelsToUse.length / 2)))
    const rightPanels = panelsToUse.slice(Math.ceil(panelsToUse.length / 2), Math.ceil(panelsToUse.length / 2) + 2)
    
    return {
      left: allowedDockPositions.includes('left') ? leftPanels : [],
      right: allowedDockPositions.includes('right') ? rightPanels : leftPanels.slice(0, 2)
    }
  }, [panelsToUse, allowedDockPositions])

  const [dockedPanels, setDockedPanels] = useState(initialPanelState)
  const [mergedStates, setMergedStates] = useState(() => {
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

  // Tab change handler
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
    onTabChange?.(tab)
  }, [onTabChange])

  // Search handler
  const handleSearch = useCallback((value) => {
    setSearchTerm(value)
    onSearch?.(value)
  }, [onSearch])

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

  // Notify parent of panel state changes
  useEffect(() => {
    if (onPanelStateChange) {
      const hasRightPanels = dockedPanels.right && dockedPanels.right.length > 0
      onPanelStateChange(hasRightPanels)
    }
  }, [dockedPanels.right?.length, onPanelStateChange])

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

  // Simplified getDropTarget
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
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    
    rafRef.current = requestAnimationFrame(() => {
      const draggedElement = document.querySelector('.dragged-panel')
      if (draggedElement) {
        const x = clientX - dragState.offset.x
        const y = clientY - dragState.offset.y
        
        draggedElement.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(3deg) scale(1.05)`
      }
      
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
    document.body.style.overflow = 'hidden'
    
    document.body.classList.add('dragging-panel')
  }, [])

  // Simplified drag end handler
  const endDrag = useCallback((clientX, clientY) => {
    if (!dragState.isDragging) return

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
            const panels = [...(prev[targetPosition] || [])]
            const draggedIndex = panels.findIndex(p => p.id === draggedPanel.id)
            
            if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
              panels.splice(draggedIndex, 1)
              panels.splice(targetIndex, 0, draggedPanel)
              newState[targetPosition] = panels
            }
            break
          }
          
          case 'move': {
            newState[startPosition] = (prev[startPosition] || []).filter(p => p.id !== draggedPanel.id)
            newState[targetPosition] = [draggedPanel]
            break
          }
          
          case 'add': {
            newState[startPosition] = (prev[startPosition] || []).filter(p => p.id !== draggedPanel.id)
            const targetPanels = [...(prev[targetPosition] || [])]
            targetPanels.splice(targetIndex, 0, draggedPanel)
            newState[targetPosition] = targetPanels
            break
          }
          
          case 'swap': {
            const targetPanels = [...(prev[targetPosition] || [])]
            const panelToSwap = targetPanels[targetIndex]
            
            if (panelToSwap) {
              newState[startPosition] = (prev[startPosition] || []).filter(p => p.id !== draggedPanel.id)
              
              targetPanels[targetIndex] = draggedPanel
              newState[targetPosition] = targetPanels
              
              newState[startPosition] = [...newState[startPosition], panelToSwap]
            }
            break
          }
        }
        
        return newState
      })
    }

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
    document.body.style.overflow = ''
    document.body.classList.remove('dragging-panel')
  }, [dragState, getDropTarget])

  // Mouse handlers
  const handleMouseDown = useCallback((e, panel, position) => {
    e.preventDefault()
    startDrag(e.clientX, e.clientY, panel, position, e.currentTarget.closest('.panel-container'))
  }, [startDrag])

  // Global mouse event handlers
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

  // Global touch event handlers
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

  // SIMPLIFIED MERGE SYSTEM - Single function to toggle merge state
  const toggleMerge = useCallback((position) => {
    setMergedStates(prev => ({
      ...prev,
      [position]: !prev[position]
    }))
  }, [])

  // Check if panel should show tabs and search (only components panel)
  const shouldShowTabsAndSearch = useCallback((panel) => {
    return panel.id === 'components' && showTabs && showSearch
  }, [showTabs, showSearch])

  // Render tabs (only for components panel)
  const renderTabs = (panel) => {
    if (!shouldShowTabsAndSearch(panel) || !tabConfig) return null

    return (
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="relative rounded-xl p-1" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
          <motion.div
            className="absolute top-1 bottom-1 rounded-lg shadow-md"
            style={{ backgroundColor: 'var(--color-surface)' }}
            initial={false}
            animate={{
              left: activeTab === tabConfig.tabs[0].id ? '4px' : 'calc(50% + 2px)',
              width: 'calc(50% - 6px)'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          
          <div className="relative z-10 grid grid-cols-2 gap-1">
            {tabConfig.tabs.map((tab) => {
              const IconComponent = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-text-muted)]'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Render search bar (only for components panel)
  const renderSearchBar = (panel) => {
    if (!shouldShowTabsAndSearch(panel)) return null

    return (
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border-0 border-b focus:outline-none transition-colors"
            style={{ 
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              '::placeholder': { color: 'var(--color-text-muted)' }
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
          />
        </div>
      </div>
    )
  }

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
                <Group className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  {panels.length} Panels Merged
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleMerge(position)
                }}
                className="flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors hover:bg-[var(--color-bg-hover)]"
                style={{ color: 'var(--color-text)' }}
                title="Split Panels"
              >
                <Ungroup className="w-4 h-4" />
                Split
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleClose(panels[0].id, position)
                }}
                className="p-1 rounded transition-colors hover:text-[var(--color-primary)]"
                style={{ color: 'var(--color-text-muted)' }}
                title="Close All"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Panel tabs within merged view */}
          <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
            {panels.map((panel, index) => (
              <button
                key={panel.id}
                className={`px-4 py-2 text-sm font-medium border-r transition-colors ${
                  index === 0 
                    ? 'bg-[var(--color-primary)] text-white' 
                    : 'hover:bg-[var(--color-bg-hover)] text-[var(--color-text)]'
                }`}
                style={{ borderColor: 'var(--color-border)' }}
              >
                {panel.title}
              </button>
            ))}
          </div>
          
          {/* Tabs and Search - only for components panel */}
          {renderTabs(panels[0])}
          {renderSearchBar(panels[0])}
          
          {/* Merged Content */}
          <div className="overflow-y-auto" style={{ 
            height: `calc(100% - ${88 + (shouldShowTabsAndSearch(panels[0]) ? 140 : 0)}px)` 
          }}>
            <div className="p-4">
              {panels[0]?.content}
            </div>
            
            {panels.slice(1).map((panel) => (
              <div key={panel.id} className="border-t p-4" style={{ borderColor: 'var(--color-border)' }}>
                <div className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
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
    
    const willBeAffected = dropTarget && dropTarget.position === position && 
      ((dropTarget.action === 'reorder' && dropTarget.index !== index) ||
       (dropTarget.action === 'add' && dropTarget.index <= index) ||
       (dropTarget.action === 'swap' && dropTarget.index === index))
    
    const panelHeight = getPanelHeight(position)
    const positionPanels = dockedPanels[position] || []
    const canMerge = positionPanels.length > 1

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
          className="rounded-lg border overflow-hidden h-full transition-all duration-200"
          style={{
            backgroundColor: willBeAffected ? 'rgba(251, 146, 60, 0.1)' : 'var(--color-surface)',
            borderColor: willBeAffected ? 'rgb(251, 146, 60)' : 'var(--color-border)',
            boxShadow: willBeAffected ? 'var(--shadow-lg)' : 'var(--shadow-md)',
          }}
        >
          {/* Panel Header */}
          <div 
            className="flex items-center justify-between border-b"
            style={{
              backgroundColor: 'var(--color-bg-muted)',
              borderColor: 'var(--color-border)',
              minHeight: '48px',
            }}
          >
            {/* Drag handle area */}
            <div 
              className="flex items-center gap-2 px-3 py-3 cursor-grab active:cursor-grabbing select-none touch-manipulation flex-1"
              onMouseDown={(e) => handleMouseDown(e, panel, position)}
              onTouchStart={(e) => handleTouchStart(e, panel, position)}
            >
              <GripVertical className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
              <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{panel.title}</h3>
              {willBeAffected && (
                <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600 font-medium">
                  {dropTarget?.action === 'swap' ? 'Will Swap' : 'Will Move'}
                </span>
              )}
            </div>
            
            {/* Action buttons - prevent event propagation */}
            <div className="flex items-center gap-1 px-3">
              {/* Single merge button - only show when there are multiple panels */}
              {canMerge && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    toggleMerge(position)
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors hover:bg-blue-100 hover:text-blue-700"
                  style={{ color: 'var(--color-text-muted)' }}
                  title="Merge all panels in this position"
                >
                  <Group className="w-3 h-3" />
                  Merge
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  handleClose(panel.id, position)
                }}
                className="p-1 rounded transition-colors hover:text-red-500"
                style={{ color: 'var(--color-text-muted)' }}
                title="Close Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Tabs and Search - only for components panel */}
          {renderTabs(panel)}
          {renderSearchBar(panel)}
          
          {/* Panel Content */}
          <div className="overflow-y-auto" style={{ 
            height: `calc(100% - ${48 + (shouldShowTabsAndSearch(panel) ? 140 : 0)}px)` 
          }}>
            <div className="p-4">
              {panel.content}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Render dock area with merge suggestion
  const renderDockArea = (position) => {
    const panels = dockedPanels[position] || []
    const dropTarget = getDropTarget()
    const isDropTarget = dropTarget && dropTarget.position === position
    const isMerged = mergedStates[position] && panels.length > 1
    
    if (!allowedDockPositions.includes(position)) return null

    const dockStyle = snapToEdge
      ? {
          position: 'relative',
          display: 'block',
          width: '320px',
          height: '100%',
          float: position,
        }
      : {
          position: 'absolute',
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
          {/* Merge suggestion banner when there are multiple panels */}
          {!isMerged && panels.length > 1 && (
            <motion.div 
              className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Group className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800 font-medium">
                    {panels.length} panels can be merged
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleMerge(position)
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Group className="w-3 h-3" />
                  Merge All
                </button>
              </div>
            </motion.div>
          )}

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

        {/* Drop zone indicators */}
        {isDropTarget && !isMerged && dragState.isDragging && (
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {panels.length === 0 ? (
              <div 
                className="absolute inset-0 rounded-lg border-2 border-dashed flex items-center justify-center"
                style={{
                  borderColor: 'var(--color-primary)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)'
                }}
              >
                <div 
                  className="px-4 py-2 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Drop Here
                </div>
              </div>
            ) : panels.length === 1 ? (
              <>
                <div 
                  className="absolute top-0 left-0 right-0 h-1/2 rounded-t-lg border-2 border-dashed flex items-center justify-center"
                  style={{
                    borderColor: 'var(--color-primary)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)'
                  }}
                >
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    Drop Top
                  </div>
                </div>
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1/2 rounded-b-lg border-2 border-dashed flex items-center justify-center"
                  style={{
                    borderColor: 'var(--color-primary)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)'
                  }}
                >
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    Drop Bottom
                  </div>
                </div>
              </>
            ) : (
              <>
                <div 
                  className="absolute top-0 left-0 right-0 h-1/2 rounded-t-lg border-2 border-dashed flex items-center justify-center"
                  style={{
                    borderColor: 'rgb(251, 146, 60)',
                    backgroundColor: 'rgba(251, 146, 60, 0.1)'
                  }}
                >
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: 'rgb(251, 146, 60)' }}
                  >
                    Swap Top
                  </div>
                </div>
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1/2 rounded-b-lg border-2 border-dashed flex items-center justify-center"
                  style={{
                    borderColor: 'rgb(251, 146, 60)',
                    backgroundColor: 'rgba(251, 146, 60, 0.1)'
                  }}
                >
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: 'rgb(251, 146, 60)' }}
                  >
                    Swap Bottom
                  </div>
                </div>
              </>
            )}
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
        
        .dragging-panel {
          overflow: hidden !important;
        }
        
        .dragging-panel * {
          pointer-events: none !important;
        }
        
        .dragging-panel .dragged-panel,
        .dragging-panel .dragged-panel * {
          pointer-events: none !important;
        }
        
        .dock-left-snapped {
          border-right: 1px solid var(--color-border, #3e3e3e);
        }
        
        .dock-right-snapped {
          border-left: 1px solid var(--color-border, #3e3e3e);
        }
      `}</style>
      
      {renderDockArea('left')}
      {renderDockArea('right')}

      {/* Drag preview */}
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