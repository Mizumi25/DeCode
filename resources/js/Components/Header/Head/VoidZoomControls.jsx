import React, { useState, useEffect, useCallback } from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { useEditorStore } from '@/stores/useEditorStore'

const VoidZoomControls = ({ 
  className = "",
  zoomLevel: propZoomLevel, // Accept props
  setZoomLevel: propSetZoomLevel // Accept props
}) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayZoom, setDisplayZoom] = useState(100)
  
  // Use props if provided, otherwise use store
  const storeZoomLevel = useEditorStore(state => state.zoomLevel)
  const storeSetZoomLevel = useEditorStore(state => state.setZoomLevel)
  
  const zoomLevel = propZoomLevel !== undefined ? propZoomLevel : storeZoomLevel
  const setZoomLevel = propSetZoomLevel !== undefined ? propSetZoomLevel : storeSetZoomLevel

  // Smooth zoom level display updates
  useEffect(() => {
    setDisplayZoom(zoomLevel)
    
    if (Math.abs(displayZoom - zoomLevel) > 1) {
      setIsAnimating(true)
      const animationTimer = setTimeout(() => setIsAnimating(false), 200)
      return () => clearTimeout(animationTimer)
    }
  }, [zoomLevel, displayZoom])

  // Zoom increment/decrement with bounds checking
  const handleZoomChange = useCallback((delta) => {
    const newZoomLevel = Math.max(25, Math.min(300, zoomLevel + delta))
    console.log('Zoom changing from', zoomLevel, 'to', newZoomLevel) // Debug log
    setZoomLevel(newZoomLevel)
  }, [zoomLevel, setZoomLevel])

  // Reset to 100% zoom
  const handleResetZoom = useCallback(() => {
    console.log('Resetting zoom to 100%') // Debug log
    setZoomLevel(100)
  }, [setZoomLevel])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e) => {
      if (document.activeElement && 
          (document.activeElement.tagName === 'INPUT' ||
           document.activeElement.tagName === 'TEXTAREA' ||
           document.activeElement.isContentEditable)) {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        handleResetZoom()
      } else if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault()
        handleZoomChange(10)
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        handleZoomChange(-10)
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [handleResetZoom, handleZoomChange])

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Zoom Out Button */}
      <button 
        onClick={() => handleZoomChange(-10)}
        disabled={zoomLevel <= 25}
        className={`
          p-1 rounded transition-all duration-150
          ${zoomLevel <= 25 
            ? 'opacity-30 cursor-not-allowed' 
            : 'hover:bg-[var(--color-bg-muted)] active:scale-95'
          }
        `}
        title="Zoom Out (Ctrl/Cmd + -)"
      >
        <Minus className="w-3 h-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
      </button>

      {/* Zoom Level Display */}
      <div className="relative">
        <button
          onClick={handleResetZoom}
          className={`
            text-xs text-[var(--color-text)] px-2 py-0.5 rounded
            min-w-[2.5rem] text-center font-mono
            hover:bg-[var(--color-bg-muted)] transition-all duration-150
            ${isAnimating ? 'scale-110' : 'scale-100'}
          `}
          title="Reset Zoom (Ctrl/Cmd + 0)"
        >
          <span className={isAnimating ? 'animate-pulse' : ''}>
            {Math.round(displayZoom)}%
          </span>
        </button>
        
        {/* Reset icon indicator */}
        {zoomLevel !== 100 && (
          <div className="absolute -top-1 -right-1 opacity-60">
            <RotateCcw className="w-2 h-2 text-[var(--color-primary)]" />
          </div>
        )}
      </div>

      {/* Zoom In Button */}
      <button 
        onClick={() => handleZoomChange(10)}
        disabled={zoomLevel >= 300}
        className={`
          p-1 rounded transition-all duration-150
          ${zoomLevel >= 300 
            ? 'opacity-30 cursor-not-allowed' 
            : 'hover:bg-[var(--color-bg-muted)] active:scale-95'
          }
        `}
        title="Zoom In (Ctrl/Cmd + +)"
      >
        <Plus className="w-3 h-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
      </button>
    </div>
  )
}

export default VoidZoomControls