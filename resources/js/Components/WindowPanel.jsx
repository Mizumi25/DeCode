import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Maximize, 
  Minimize, 
  Square, 
  Maximize2,
  GripVertical,
  Monitor,
  PictureInPicture
} from 'lucide-react'

export default function WindowPanel({
  isOpen = false,
  title = "Window Panel",
  content = null,
  onClose,
  onModeChange,
  initialMode = "modal", // "modal", "window", "fullscreen"
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 600, height: 400 },
  minSize = { width: 300, height: 200 },
  maxSize = { width: 1200, height: 800 },
  isDraggable = true,
  isResizable = true,
  className = "",
  zIndexBase = 1000,
  panelCollisionOffset = 320, // Offset for panel collision detection
  isMobile = false
}) {
  // Window state
  const [mode, setMode] = useState(initialMode)
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialSize)
  const [isMinimized, setIsMinimized] = useState(false)
  const [previousState, setPreviousState] = useState(null)

  // Drag and resize state
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Refs
  const windowRef = useRef(null)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const resizeStartPos = useRef({ x: 0, y: 0 })
  const resizeStartSize = useRef({ width: 0, height: 0 })

  // Calculate z-index based on mode
  const getZIndex = () => {
    switch (mode) {
      case 'fullscreen':
        return zIndexBase + 50
      case 'modal':
        return zIndexBase + 30
      case 'window':
        return zIndexBase + 10
      default:
        return zIndexBase
    }
  }

  // Check for panel collision (simple detection)
  const checkPanelCollision = useCallback((newPosition) => {
    const windowWidth = window.innerWidth
    const leftPanelExists = document.querySelector('.dock-left')
    const rightPanelExists = document.querySelector('.dock-right')
    
    let adjustedPosition = { ...newPosition }
    
    // Left panel collision
    if (leftPanelExists && newPosition.x < panelCollisionOffset) {
      adjustedPosition.x = panelCollisionOffset + 10
    }
    
    // Right panel collision
    if (rightPanelExists && (newPosition.x + size.width) > (windowWidth - panelCollisionOffset)) {
      adjustedPosition.x = windowWidth - panelCollisionOffset - size.width - 10
    }
    
    return adjustedPosition
  }, [size.width, panelCollisionOffset])

  // Mode change handler
  const handleModeChange = useCallback((newMode) => {
    if (newMode === mode) return

    // Save current state before changing mode
    if (mode !== 'fullscreen') {
      setPreviousState({
        mode,
        position: { ...position },
        size: { ...size }
      })
    }

    switch (newMode) {
      case 'fullscreen':
        setSize({ width: window.innerWidth, height: window.innerHeight })
        setPosition({ x: 0, y: 0 })
        break
      case 'window':
        if (previousState && previousState.mode === 'modal') {
          setPosition(previousState.position)
          setSize(previousState.size)
        } else {
          // Default window positioning - behind panels
          const windowWidth = window.innerWidth
          const windowHeight = window.innerHeight
          setSize({ 
            width: Math.min(800, windowWidth - 100), 
            height: Math.min(600, windowHeight - 100) 
          })
          setPosition({ x: 50, y: 50 })
        }
        break
      case 'modal':
        if (previousState && previousState.mode !== 'fullscreen') {
          setPosition(checkPanelCollision(previousState.position))
          setSize(previousState.size)
        } else {
          // Default modal positioning - avoid panels
          const windowWidth = window.innerWidth
          const windowHeight = window.innerHeight
          const newSize = { width: 600, height: 400 }
          const centeredPos = {
            x: (windowWidth - newSize.width) / 2,
            y: (windowHeight - newSize.height) / 2
          }
          setSize(newSize)
          setPosition(checkPanelCollision(centeredPos))
        }
        break
    }

    setMode(newMode)
    setIsMinimized(false)
    onModeChange?.(newMode)
  }, [mode, position, size, previousState, onModeChange, checkPanelCollision])

  // Drag handlers
  const handleDragStart = useCallback((e) => {
    if (!isDraggable || mode === 'fullscreen') return

    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX
    const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY

    setIsDragging(true)
    dragStartPos.current = { x: clientX, y: clientY }
    setDragOffset({
      x: clientX - position.x,
      y: clientY - position.y
    })

    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
  }, [isDraggable, mode, position])

  const handleDragMove = useCallback((e) => {
    if (!isDragging) return

    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX
    const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY

    const newPosition = {
      x: clientX - dragOffset.x,
      y: clientY - dragOffset.y
    }

    // Boundary constraints
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    
    newPosition.x = Math.max(-size.width + 100, Math.min(windowWidth - 100, newPosition.x))
    newPosition.y = Math.max(0, Math.min(windowHeight - 50, newPosition.y))

    // Apply collision detection for modal mode
    const finalPosition = mode === 'modal' ? checkPanelCollision(newPosition) : newPosition
    setPosition(finalPosition)
  }, [isDragging, dragOffset, size, mode, checkPanelCollision])

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return

    setIsDragging(false)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }, [isDragging])

  // Resize handlers
  const handleResizeStart = useCallback((e, handle) => {
    if (!isResizable || mode === 'fullscreen') return

    e.stopPropagation()
    
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX
    const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY

    setIsResizing(true)
    setResizeHandle(handle)
    resizeStartPos.current = { x: clientX, y: clientY }
    resizeStartSize.current = { ...size }

    document.body.style.userSelect = 'none'
    document.body.style.cursor = getResizeCursor(handle)
  }, [isResizable, mode, size])

  const handleResizeMove = useCallback((e) => {
    if (!isResizing || !resizeHandle) return

    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX
    const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY

    const deltaX = clientX - resizeStartPos.current.x
    const deltaY = clientY - resizeStartPos.current.y

    let newSize = { ...resizeStartSize.current }
    let newPosition = { ...position }

    switch (resizeHandle) {
      case 'se':
        newSize.width = Math.max(minSize.width, Math.min(maxSize.width, resizeStartSize.current.width + deltaX))
        newSize.height = Math.max(minSize.height, Math.min(maxSize.height, resizeStartSize.current.height + deltaY))
        break
      case 'sw':
        newSize.width = Math.max(minSize.width, Math.min(maxSize.width, resizeStartSize.current.width - deltaX))
        newSize.height = Math.max(minSize.height, Math.min(maxSize.height, resizeStartSize.current.height + deltaY))
        newPosition.x = position.x + (resizeStartSize.current.width - newSize.width)
        break
      case 'ne':
        newSize.width = Math.max(minSize.width, Math.min(maxSize.width, resizeStartSize.current.width + deltaX))
        newSize.height = Math.max(minSize.height, Math.min(maxSize.height, resizeStartSize.current.height - deltaY))
        newPosition.y = position.y + (resizeStartSize.current.height - newSize.height)
        break
      case 'nw':
        newSize.width = Math.max(minSize.width, Math.min(maxSize.width, resizeStartSize.current.width - deltaX))
        newSize.height = Math.max(minSize.height, Math.min(maxSize.height, resizeStartSize.current.height - deltaY))
        newPosition.x = position.x + (resizeStartSize.current.width - newSize.width)
        newPosition.y = position.y + (resizeStartSize.current.height - newSize.height)
        break
      case 'n':
        newSize.height = Math.max(minSize.height, Math.min(maxSize.height, resizeStartSize.current.height - deltaY))
        newPosition.y = position.y + (resizeStartSize.current.height - newSize.height)
        break
      case 's':
        newSize.height = Math.max(minSize.height, Math.min(maxSize.height, resizeStartSize.current.height + deltaY))
        break
      case 'e':
        newSize.width = Math.max(minSize.width, Math.min(maxSize.width, resizeStartSize.current.width + deltaX))
        break
      case 'w':
        newSize.width = Math.max(minSize.width, Math.min(maxSize.width, resizeStartSize.current.width - deltaX))
        newPosition.x = position.x + (resizeStartSize.current.width - newSize.width)
        break
    }

    setSize(newSize)
    if (newPosition.x !== position.x || newPosition.y !== position.y) {
      setPosition(mode === 'modal' ? checkPanelCollision(newPosition) : newPosition)
    }
  }, [isResizing, resizeHandle, position, minSize, maxSize, mode, checkPanelCollision])

  const handleResizeEnd = useCallback(() => {
    if (!isResizing) return

    setIsResizing(false)
    setResizeHandle(null)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }, [isResizing])

  // Get resize cursor
  const getResizeCursor = (handle) => {
    const cursors = {
      'nw': 'nw-resize',
      'n': 'n-resize',
      'ne': 'ne-resize',
      'e': 'e-resize',
      'se': 'se-resize',
      's': 's-resize',
      'sw': 'sw-resize',
      'w': 'w-resize'
    }
    return cursors[handle] || 'default'
  }

  // Global event listeners
  useEffect(() => {
    const handleMouseMove = (e) => {
      handleDragMove(e)
      handleResizeMove(e)
    }

    const handleMouseUp = (e) => {
      handleDragEnd(e)
      handleResizeEnd(e)
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleMouseMove, { passive: false })
      document.addEventListener('touchend', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleMouseMove)
        document.removeEventListener('touchend', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, handleDragMove, handleDragEnd, handleResizeMove, handleResizeEnd])

  // Minimize/Maximize handlers
  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const handleMaximize = () => {
    if (mode === 'fullscreen') {
      handleModeChange('modal')
    } else {
      handleModeChange('fullscreen')
    }
  }

  // Render resize handles
  const renderResizeHandles = () => {
    if (!isResizable || mode === 'fullscreen' || isMinimized) return null

    const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
    
    return handles.map(handle => (
      <div
        key={handle}
        className={`absolute resize-handle resize-${handle}`}
        onMouseDown={(e) => handleResizeStart(e, handle)}
        onTouchStart={(e) => handleResizeStart(e, handle)}
        style={{
          cursor: getResizeCursor(handle),
          zIndex: 10
        }}
      />
    ))
  }

  if (!isOpen) return null

  return (
    <>
      <style>{`
        .window-panel {
          will-change: transform;
          backface-visibility: hidden;
        }
        
        .resize-handle {
          background: transparent;
        }
        
        .resize-nw { top: -4px; left: -4px; width: 8px; height: 8px; cursor: nw-resize; }
        .resize-n { top: -4px; left: 8px; right: 8px; height: 8px; cursor: n-resize; }
        .resize-ne { top: -4px; right: -4px; width: 8px; height: 8px; cursor: ne-resize; }
        .resize-e { top: 8px; right: -4px; bottom: 8px; width: 8px; cursor: e-resize; }
        .resize-se { bottom: -4px; right: -4px; width: 8px; height: 8px; cursor: se-resize; }
        .resize-s { bottom: -4px; left: 8px; right: 8px; height: 8px; cursor: s-resize; }
        .resize-sw { bottom: -4px; left: -4px; width: 8px; height: 8px; cursor: sw-resize; }
        .resize-w { top: 8px; left: -4px; bottom: 8px; width: 8px; cursor: w-resize; }
        
        .window-panel-dragging {
          pointer-events: none;
        }
        
        .window-panel-dragging * {
          pointer-events: none;
        }
      `}</style>

      <AnimatePresence>
        <motion.div
          ref={windowRef}
          className={`window-panel fixed ${className} ${isDragging ? 'window-panel-dragging' : ''}`}
          style={{
            left: position.x,
            top: position.y,
            width: size.width,
            height: isMinimized ? 'auto' : size.height,
            zIndex: getZIndex(),
            minWidth: minSize.width,
            minHeight: isMinimized ? 'auto' : minSize.height,
            maxWidth: maxSize.width,
            maxHeight: maxSize.height
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            transition: { type: "spring", damping: 25, stiffness: 300 }
          }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border overflow-hidden h-full flex flex-col"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              boxShadow: mode === 'modal' ? 'var(--shadow-2xl)' : 'var(--shadow-lg)'
            }}
          >
            {/* Window Header */}
            <div
              className="flex items-center justify-between px-4 py-2 border-b select-none"
              style={{
                backgroundColor: 'var(--color-bg-muted)',
                borderColor: 'var(--color-border)',
                cursor: isDraggable && mode !== 'fullscreen' ? 'grab' : 'default'
              }}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              {/* Title and Drag Handle */}
              <div className="flex items-center gap-2 flex-1">
                {isDraggable && mode !== 'fullscreen' && (
                  <GripVertical 
                    className="w-4 h-4" 
                    style={{ color: 'var(--color-text-muted)' }} 
                  />
                )}
                <h3 
                  className="font-semibold text-sm truncate"
                  style={{ color: 'var(--color-text)' }}
                >
                  {title}
                </h3>
                <div className="flex items-center gap-1 text-xs">
                  {mode === 'modal' && (
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: 'var(--color-primary)',
                        color: 'white'
                      }}
                    >
                      Modal
                    </span>
                  )}
                  {mode === 'window' && (
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: 'var(--color-accent)',
                        color: 'white'
                      }}
                    >
                      Window
                    </span>
                  )}
                  {mode === 'fullscreen' && (
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: 'var(--color-success)',
                        color: 'white'
                      }}
                    >
                      Fullscreen
                    </span>
                  )}
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1">
                {/* Mode Switcher */}
                <div className="flex items-center gap-1 mr-2">
                  <button
                    onClick={() => handleModeChange('modal')}
                    className="p-1 rounded transition-colors"
                    style={{ 
                      color: mode === 'modal' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      backgroundColor: mode === 'modal' ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)' : 'transparent'
                    }}
                    title="Modal Mode"
                  >
                    <PictureInPicture className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleModeChange('window')}
                    className="p-1 rounded transition-colors"
                    style={{ 
                      color: mode === 'window' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      backgroundColor: mode === 'window' ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent'
                    }}
                    title="Window Mode"
                  >
                    <Monitor className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleModeChange('fullscreen')}
                    className="p-1 rounded transition-colors"
                    style={{ 
                      color: mode === 'fullscreen' ? 'var(--color-success)' : 'var(--color-text-muted)',
                      backgroundColor: mode === 'fullscreen' ? 'color-mix(in srgb, var(--color-success) 10%, transparent)' : 'transparent'
                    }}
                    title="Fullscreen Mode"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Standard Window Controls */}
                <button
                  onClick={handleMinimize}
                  className="p-1 rounded transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  title={isMinimized ? 'Restore' : 'Minimize'}
                >
                  {isMinimized ? <Square className="w-3 h-3" /> : <Minimize className="w-3 h-3" />}
                </button>
                
                <button
                  onClick={handleMaximize}
                  className="p-1 rounded transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-hover)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  title={mode === 'fullscreen' ? 'Restore' : 'Maximize'}
                >
                  <Maximize className="w-3 h-3" />
                </button>
                
                <button
                  onClick={onClose}
                  className="p-1 rounded transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgb(239, 68, 68)'
                    e.target.style.color = 'white'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent'
                    e.target.style.color = 'var(--color-text-muted)'
                  }}
                  title="Close"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Window Content */}
            {!isMinimized && (
              <div className="flex-1 overflow-auto">
                {content || (
                  <div className="p-6">
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                        Demo Window Panel
                      </h2>
                      <div className="space-y-2">
                        <p style={{ color: 'var(--color-text)' }}>
                          This is a demo window panel that can operate in different modes:
                        </p>
                        <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                          <li><strong>Modal Mode:</strong> Floats above content and avoids panel collisions</li>
                          <li><strong>Window Mode:</strong> Operates as a background window</li>
                          <li><strong>Fullscreen Mode:</strong> Takes up the entire viewport</li>
                        </ul>
                      </div>
                      
                      <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                        <h3 className="font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                          Current State:
                        </h3>
                        <div className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                          <div>Mode: <strong>{mode}</strong></div>
                          <div>Position: {position.x}, {position.y}</div>
                          <div>Size: {size.width} × {size.height}</div>
                          <div>Dragging: {isDragging ? 'Yes' : 'No'}</div>
                          <div>Resizing: {isResizing ? 'Yes' : 'No'}</div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-2">
                        <p style={{ color: 'var(--color-text)' }}>
                          Try dragging the window by the header, resizing by the edges, or switching modes with the controls.
                        </p>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          In modal mode, the window will avoid colliding with docked panels.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Resize Handles */}
            {renderResizeHandles()}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}