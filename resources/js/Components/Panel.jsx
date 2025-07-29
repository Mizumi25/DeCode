import React, { useState, useRef, useEffect } from 'react'
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
    currentPosition: 'left'
  })

  // Initialize panels
  useEffect(() => {
    if (panels.length > 0) {
      const leftPanels = panels.slice(0, Math.ceil(panels.length / 2))
      const rightPanels = panels.slice(Math.ceil(panels.length / 2))
      
      setDockedPanels({
        left: allowedDockPositions.includes('left') ? leftPanels : [],
        right: allowedDockPositions.includes('right') ? rightPanels : leftPanels
      })
    }
  }, [panels, allowedDockPositions])

  // Handle drag start
  const handleDragStart = (e, panel, position) => {
    setDragState({
      isDragging: true,
      draggedPanel: panel,
      startPosition: position,
      currentPosition: position
    })
  }

  // Handle drag over
  const handleDragOver = (e, position) => {
    e.preventDefault()
    if (allowedDockPositions.includes(position)) {
      setDragState(prev => ({ ...prev, currentPosition: position }))
    }
  }

  // Handle drop
  const handleDrop = (e, targetPosition) => {
    e.preventDefault()
    const { draggedPanel, startPosition } = dragState
    
    if (!draggedPanel || !allowedDockPositions.includes(targetPosition)) return

    // Remove from start position
    setDockedPanels(prev => ({
      ...prev,
      [startPosition]: prev[startPosition].filter(p => p.id !== draggedPanel.id),
      [targetPosition]: [...prev[targetPosition], draggedPanel]
    }))

    setDragState({
      isDragging: false,
      draggedPanel: null,
      startPosition: null,
      currentPosition: 'left'
    })
  }

  // Panel close handler
  const handleClose = (panelId, position) => {
    setDockedPanels(prev => ({
      ...prev,
      [position]: prev[position].filter(p => p.id !== panelId)
    }))
    onPanelClose?.(panelId)
  }

  // Render single panel
  const renderPanel = (panel, position, index) => (
    <motion.div
      key={panel.id}
      initial={{ opacity: 0, x: position === 'left' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: position === 'left' ? -20 : 20 }}
      className="mb-2 last:mb-0"
    >
      <div 
        className="rounded-lg border overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Panel Header */}
        <div 
          className="flex items-center justify-between px-3 py-2 border-b cursor-grab active:cursor-grabbing"
          style={{
            backgroundColor: 'var(--color-bg-muted)',
            borderColor: 'var(--color-border)',
          }}
          draggable
          onDragStart={(e) => handleDragStart(e, panel, position)}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-[var(--color-text-muted)]" />
            <h3 className="font-medium text-sm text-[var(--color-text)]">{panel.title}</h3>
          </div>
          <button
            onClick={() => handleClose(panel.id, position)}
            className="p-1 rounded transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Panel Content */}
        <div className="p-3 max-h-80 overflow-y-auto">
          {panel.content}
        </div>
      </div>
    </motion.div>
  )

  // Render dock area
  const renderDockArea = (position) => {
    const panels = dockedPanels[position]
    if (!allowedDockPositions.includes(position) || panels.length === 0) return null

    return (
      <div
        className={`fixed top-20 ${position === 'left' ? 'left-4' : 'right-4'} w-80 max-h-[calc(100vh-6rem)] z-40`}
        onDragOver={(e) => handleDragOver(e, position)}
        onDrop={(e) => handleDrop(e, position)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`space-y-2 ${
            dragState.isDragging && dragState.currentPosition === position 
              ? 'ring-2 ring-blue-400 ring-opacity-50 rounded-lg p-2' 
              : ''
          }`}
        >
          <AnimatePresence>
            {panels.map((panel, index) => renderPanel(panel, position, index))}
          </AnimatePresence>
        </motion.div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <>
      <style jsx global>{`
        /* Drag feedback styles */
        .dragging-panel {
          opacity: 0.5 !important;
          transform: rotate(2deg) !important;
        }
        
        .drag-over {
          background: rgba(59, 130, 246, 0.1) !important;
          border: 2px dashed rgba(59, 130, 246, 0.3) !important;
        }
      `}</style>
      
      {/* Left dock area */}
      {renderDockArea('left')}
      
      {/* Right dock area */}
      {renderDockArea('right')}
    </>
  )
}