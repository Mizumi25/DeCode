import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Group, Ungroup, Search, Plus, Layers, MoreHorizontal } from 'lucide-react'

export default function Panel({ 
  isOpen = true, 
  panels = [],
  initialPanels = [], 
  allowedDockPositions = ['left', 'right'],
  maxPanelsPerDock = 4,
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
  isMobile = false,
  defaultWidth = 320,
  minWidth = 280,
  maxWidth = 400,
  // NEW: Default merge configurations
  defaultDockPosition = {}
}) {
  const panelsToUse = useMemo(() => {
    return initialPanels.length > 0 ? initialPanels : panels
  }, [initialPanels, panels])

  // Tab and search state
  const [activeTab, setActiveTab] = useState(tabConfig?.defaultTab || 'tab1')
  const [searchTerm, setSearchTerm] = useState('')

  // ENHANCED: Merge display modes for each position
  const [mergeDisplayModes, setMergeDisplayModes] = useState({
    left: 'tabs', // 'tabs' or 'stacked'
    right: 'tabs'
  })

  // ENHANCED: Active tab for merged panels
  const [mergedActiveTabs, setMergedActiveTabs] = useState({
    left: 0,
    right: 0
  })

  // FIXED: Initialize with default merging for properties + assets
  const initialPanelState = useMemo(() => {
    if (panelsToUse.length === 0) {
      return { left: [], right: [] }
    }

    // Separate panels by their default dock positions
    const leftPanels = []
    const rightPanels = []
    
    panelsToUse.forEach(panel => {
      const dockPosition = defaultDockPosition[panel.id] || 'left'
      if (dockPosition === 'left' && allowedDockPositions.includes('left')) {
        leftPanels.push(panel)
      } else if (dockPosition === 'right' && allowedDockPositions.includes('right')) {
        rightPanels.push(panel)
      } else if (allowedDockPositions.includes('left')) {
        leftPanels.push(panel)
      } else {
        rightPanels.push(panel)
      }
    })

    return {
      left: leftPanels.slice(0, maxPanelsPerDock),
      right: rightPanels.slice(0, maxPanelsPerDock)
    }
  }, [panelsToUse, allowedDockPositions, maxPanelsPerDock, defaultDockPosition])

  const [dockedPanels, setDockedPanels] = useState(initialPanelState)
  
  // FIXED: Default merge state - merge properties and assets by default
  const [mergedStates, setMergedStates] = useState(() => {
    const defaultMerged = {
      left: mergePosition === 'left',
      right: mergePosition === 'right' || true // Default merge for right dock (properties + assets)
    }
    return defaultMerged
  })

  // Drag state - ENHANCED with better position tracking
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedPanel: null,
    startPosition: null,
    startIndex: null, // Track original index
    currentPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    dragElement: null,
    snapBackTimeout: null // For snap-back animation
  })

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

  // Update panels when the memoized panelsToUse changes
  useEffect(() => {
    setDockedPanels(initialPanelState)
  }, [initialPanelState])

  // Update merged states when mergePosition prop changes
  useEffect(() => {
    setMergedStates(prev => ({
      ...prev,
      left: mergePosition === 'left',
      right: mergePosition === 'right' || prev.right // Keep default right merge
    }))
  }, [mergePosition])

  // Notify parent of panel state changes
  useEffect(() => {
    if (onPanelStateChange) {
      const hasRightPanels = dockedPanels.right && dockedPanels.right.length > 0
      onPanelStateChange(hasRightPanels)
    }
  }, [dockedPanels.right?.length, onPanelStateChange])

  // ENHANCED: Merge display mode toggle
  const toggleMergeDisplayMode = useCallback((position) => {
    setMergeDisplayModes(prev => ({
      ...prev,
      [position]: prev[position] === 'tabs' ? 'stacked' : 'tabs'
    }))
  }, [])

  // ENHANCED: Set active tab for merged panels
  const setMergedActiveTab = useCallback((position, tabIndex) => {
    setMergedActiveTabs(prev => ({
      ...prev,
      [position]: tabIndex
    }))
  }, [])

  const getPanelHeight = useCallback((position) => {
    const currentCount = dockedPanels[position]?.length || 0
    const isMerged = mergedStates[position]
    
    if (currentCount === 0) return 'calc(100% - 1rem)'
    if (currentCount === 1 || isMerged) return 'calc(100% - 1rem)'
    if (currentCount === 2) return 'calc(50% - 0.75rem)'
    if (currentCount === 3) return 'calc(33.333% - 0.67rem)'
    if (currentCount >= 4) return 'calc(25% - 0.75rem)'
    
    return `calc(${100 / Math.min(currentCount, maxPanelsPerDock)}% - 0.75rem)`
  }, [dockedPanels, mergedStates, maxPanelsPerDock])

  const getDropZone = useCallback(() => {
    if (!dragState.isDragging) return null
    const windowWidth = window.innerWidth
    const mouseX = dragPositionRef.current.x
    return mouseX < windowWidth / 2 ? 'left' : 'right'
  }, [dragState.isDragging])

  // FIXED: Improved drop target calculation with snap-back prevention
  const getDropTarget = useCallback(() => {
    if (!dragState.isDragging) return null
    
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const { x: mouseX, y: mouseY } = dragPositionRef.current
    
    const targetPosition = mouseX < windowWidth / 2 ? 'left' : 'right'
    
    if (!allowedDockPositions.includes(targetPosition)) return null
    
    const targetPanels = dockedPanels[targetPosition] || []
    const { startPosition, draggedPanel, startIndex } = dragState
    
    // FIXED: Same position, same index = no change (prevent unnecessary updates)
    if (targetPosition === startPosition) {
      const panelCount = Math.min(targetPanels.length, maxPanelsPerDock)
      
      if (panelCount <= 1) return null // Single panel, nowhere to move
      
      let targetIndex
      if (panelCount === 2) {
        const midY = windowHeight / 2
        targetIndex = mouseY < midY ? 0 : 1
      } else if (panelCount === 3) {
        const sectionHeight = windowHeight / 3
        targetIndex = Math.floor(mouseY / sectionHeight)
      } else {
        const sectionHeight = windowHeight / 4
        targetIndex = Math.floor(mouseY / sectionHeight)
        targetIndex = Math.min(targetIndex, maxPanelsPerDock - 1)
      }
      
      // FIXED: If target index equals start index, return null to prevent updates
      if (targetIndex === startIndex) {
        return null
      }
      
      return {
        position: targetPosition,
        index: targetIndex,
        action: 'reorder'
      }
    }
    
    // Different dock
    if (targetPosition !== startPosition) {
      if (targetPanels.length === 0) {
        return {
          position: targetPosition,
          index: 0,
          action: 'move'
        }
      } else if (targetPanels.length < maxPanelsPerDock) {
        let targetIndex
        const panelCount = targetPanels.length
        
        if (panelCount === 1) {
          const midY = windowHeight / 2
          targetIndex = mouseY < midY ? 0 : 1
        } else if (panelCount === 2) {
          const sectionHeight = windowHeight / 3
          targetIndex = Math.floor(mouseY / sectionHeight)
          targetIndex = Math.min(targetIndex, 2)
        } else {
          const sectionHeight = windowHeight / (panelCount + 1)
          targetIndex = Math.floor(mouseY / sectionHeight)
          targetIndex = Math.min(targetIndex, panelCount)
        }
        
        return {
          position: targetPosition,
          index: targetIndex,
          action: 'add'
        }
      } else {
        // Swap when at max capacity
        let targetIndex
        const sectionHeight = windowHeight / maxPanelsPerDock
        targetIndex = Math.floor(mouseY / sectionHeight)
        targetIndex = Math.min(targetIndex, maxPanelsPerDock - 1)
        
        return {
          position: targetPosition,
          index: targetIndex,
          action: 'swap'
        }
      }
    }
    
    return null
  }, [dragState, dockedPanels, allowedDockPositions, maxPanelsPerDock])

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

  // Unified drag start handler - ENHANCED with index tracking
  const startDrag = useCallback((clientX, clientY, panel, position, element) => {
    const rect = element.getBoundingClientRect()
    const panelsInPosition = dockedPanels[position] || []
    const startIndex = panelsInPosition.findIndex(p => p.id === panel.id)
    
    dragPositionRef.current = { x: clientX, y: clientY }
    
    setDragState({
      isDragging: true,
      draggedPanel: panel,
      startPosition: position,
      startIndex: startIndex,
      currentPosition: { x: clientX, y: clientY },
      offset: {
        x: clientX - rect.left,
        y: clientY - rect.top
      },
      dragElement: element,
      snapBackTimeout: null
    })

    document.body.style.userSelect = 'none'
    document.body.style.touchAction = 'none'
    document.body.style.cursor = 'grabbing'
    document.body.classList.add('dragging-panel')
  }, [dockedPanels])

  // FIXED: Enhanced drag end with snap-back prevention
  const endDrag = useCallback((clientX, clientY) => {
    if (!dragState.isDragging) return

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    const dropTarget = getDropTarget()
    const { draggedPanel, startPosition, startIndex } = dragState

    // FIXED: Only update if there's a valid drop target
    if (dropTarget && dropTarget.action && dropTarget.position && dropTarget.index !== undefined) {
      const { position: targetPosition, index: targetIndex, action } = dropTarget
      
      setDockedPanels(prev => {
        const newState = { ...prev }
        
        switch (action) {
          case 'reorder': {
            if (startPosition === targetPosition && startIndex !== targetIndex) {
              const panels = [...(prev[targetPosition] || [])]
              panels.splice(startIndex, 1)
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
    // If no valid drop target, panel stays in original position (no snap-back needed)

    setDragState({
      isDragging: false,
      draggedPanel: null,
      startPosition: null,
      startIndex: null,
      currentPosition: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      dragElement: null,
      snapBackTimeout: null
    })

    document.body.style.userSelect = ''
    document.body.style.touchAction = ''
    document.body.style.cursor = ''
    document.body.classList.remove('dragging-panel')
  }, [dragState, getDropTarget])

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

  const handleClose = useCallback((panelId, position) => {
    setDockedPanels(prev => ({
      ...prev,
      [position]: (prev[position] || []).filter(p => p.id !== panelId)
    }))
    onPanelClose?.(panelId)
  }, [onPanelClose])

  const toggleMerge = useCallback((position) => {
    setMergedStates(prev => ({
      ...prev,
      [position]: !prev[position]
    }))
    
    // Reset active tab when merging/unmerging
    if (!mergedStates[position]) {
      setMergedActiveTab(position, 0)
    }
  }, [mergedStates, setMergedActiveTab])

  const shouldShowTabsAndSearch = useCallback((panel) => {
    return panel.id === 'components-panel' && showTabs && showSearch
  }, [showTabs, showSearch])

  // ENHANCED: Render merged panels with tabbing system
  const renderMergedPanels = (panels, position) => {
    if (!panels || panels.length === 0) return null
    
    const displayMode = mergeDisplayModes[position]
    const activeTabIndex = mergedActiveTabs[position]
    const activePanel = panels[activeTabIndex] || panels[0]
    
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
          {/* Merged Header */}
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
              {/* Display Mode Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleMergeDisplayMode(position)
                }}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors"
                style={{ 
                  color: 'var(--color-text)',
                  backgroundColor: displayMode === 'tabs' ? 'var(--color-primary-soft)' : 'transparent'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = displayMode === 'tabs' ? 'var(--color-primary-soft)' : 'transparent'}
                title={displayMode === 'tabs' ? 'Switch to Stacked View' : 'Switch to Tabbed View'}
              >
                <Layers className="w-3 h-3" />
                {displayMode === 'tabs' ? 'Tabs' : 'Stack'}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleMerge(position)
                }}
                className="flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                style={{ 
                  color: 'var(--color-text)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
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
                className="p-1 rounded transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}
                title="Close All"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Tab Navigation — only show when in 'tabs' display mode */}
          {displayMode === 'tabs' && (
            <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
              {panels.map((panel, index) => (
                <button
                  key={panel.id}
                  onClick={() => setMergedActiveTab(position, index)}
                  className={`px-4 py-2 text-sm font-medium border-r transition-colors flex-1 ${
                    index === activeTabIndex 
                      ? 'text-white' 
                      : 'text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]'
                  }`}
                  style={{ 
                    borderColor: 'var(--color-border)',
                    backgroundColor: index === activeTabIndex ? 'var(--color-primary)' : 'transparent'
                  }}
                >
                  {panel.title}
                </button>
              ))}
            </div>
          )}
          
          {/* Content Area */}
          <div className="flex-1 overflow-hidden" style={{ height: 'calc(100% - 96px)' }}>
            {displayMode === 'tabs' ? (
              // TABBED VIEW
              <div className="h-full">
                {/* Tabs and Search for active panel */}
                {renderTabs(activePanel)}
                {renderSearchBar(activePanel)}
                
                {/* Active Panel Content */}
                <div className="h-full overflow-y-auto" style={{ 
                  height: `calc(100% - ${shouldShowTabsAndSearch(activePanel) ? 140 : 0}px)` 
                }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTabIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 h-full"
                    >
                      {activePanel?.content}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              // STACKED VIEW
              <div className="h-full overflow-y-auto">
                {panels.map((panel, index) => (
                  <div key={panel.id} className={index > 0 ? 'border-t' : ''} style={{ borderColor: 'var(--color-border)' }}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                          {panel.title}
                        </h4>
                        <button
                          onClick={() => setMergedActiveTab(position, index)}
                          className="text-xs px-2 py-1 rounded transition-colors"
                          style={{ 
                            color: 'var(--color-primary)',
                            backgroundColor: 'var(--color-primary-soft)'
                          }}
                        >
                          Focus
                        </button>
                      </div>
                      <div className="text-sm">
                        {panel.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

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
              backgroundColor: 'var(--color-bg)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
          />
        </div>
      </div>
    )
  }

  // Rest of the render functions remain the same...
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
            pointerEvents: 'auto', // CRITICAL: Only the visible panel gets clicks
            overflow: 'hidden', // Prevent any overflow
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
              <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{panel.title}</h3>
              {willBeAffected && (
                <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600 font-medium">
                  {dropTarget?.action === 'swap' ? 'Will Swap' : 'Will Move'}
                </span>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-1 px-3">
              {canMerge && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    toggleMerge(position)
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors"
                  style={{ 
                    color: 'var(--color-text-muted)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--color-bg-hover)'
                    e.target.style.color = 'var(--color-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent'
                    e.target.style.color = 'var(--color-text-muted)'
                  }}
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
                className="p-1 rounded transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}
                title="Close Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Tabs and Search */}
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

  // Render dock area
  const renderDockArea = (position) => {
    const panels = dockedPanels[position] || []
    const dropTarget = getDropTarget()
    const isDropTarget = dropTarget && dropTarget.position === position
    const isMerged = mergedStates[position] && panels.length > 1
    
    if (!allowedDockPositions.includes(position)) return null

    const panelWidth = isMobile ? minWidth : defaultWidth

    const dockStyle = snapToEdge
      ? {
          position: 'relative',
          display: 'block',
          width: `${panelWidth}px`,
          height: '100%',
          float: position,
          overflow: 'hidden',
          // REMOVE: pointerEvents: 'none'
        }
      : {
          position: 'absolute',
          [position === 'left' ? 'left' : 'right']: '1rem',
          top: '1rem',
          height: 'calc(100% - 2rem)',
          width: `${panelWidth}px`,
          overflow: 'hidden',
          // REMOVE: pointerEvents: 'none'
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
              className="border rounded-md px-3 py-2 mb-1"
              style={{
                backgroundColor: 'var(--color-bg-muted)',
                borderColor: 'var(--color-border)'
              }}
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Group className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                    {panels.length} panels can be merged
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleMerge(position)
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  <Group className="w-3 h-3" />
                  Merge
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
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                }}
              >
                <div 
                  className="px-4 py-2 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Drop Here
                </div>
              </div>
            ) : (
              // Multi-zone drop indicators based on panel count
              Array.from({ length: Math.min(panels.length + 1, maxPanelsPerDock) }, (_, i) => {
                const isSwap = panels.length >= maxPanelsPerDock
                const zones = isSwap ? maxPanelsPerDock : panels.length + 1
                const height = `${100 / zones}%`
                const top = `${(100 / zones) * i}%`
                
                return (
                  <div 
                    key={i}
                    className="absolute left-0 right-0 border-2 border-dashed flex items-center justify-center"
                    style={{
                      height,
                      top,
                      borderColor: isSwap ? 'rgb(251, 146, 60)' : 'var(--color-primary)',
                      backgroundColor: isSwap ? 'rgba(251, 146, 60, 0.1)' : 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                      borderRadius: i === 0 ? '0.5rem 0.5rem 0 0' : i === zones - 1 ? '0 0 0.5rem 0.5rem' : '0'
                    }}
                  >
                    <div 
                      className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: isSwap ? 'rgb(251, 146, 60)' : 'var(--color-primary)' }}
                    >
                      {isSwap ? `Swap ${i + 1}` : i === panels.length ? 'Drop Last' : `Drop ${i + 1}`}
                    </div>
                  </div>
                )
              })
            )}
          </motion.div>
        )}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <>
      <style>{`
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
          className="dragged-panel"
          style={{
            left: 0,
            top: 0,
            width: `${isMobile ? minWidth : defaultWidth}px`,
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