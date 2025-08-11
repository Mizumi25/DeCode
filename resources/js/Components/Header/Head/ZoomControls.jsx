import React from 'react'
import { Minus, Plus } from 'lucide-react'

const ZoomControls = ({ zoomLevel, onZoomChange }) => {
  return (
    <div className="flex items-center gap-0.5">
      <button 
        onClick={() => onZoomChange && onZoomChange(Math.max(10, zoomLevel - 10))}
        className="p-0.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
      >
        <Minus className="w-2.5 h-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
      </button>
      <span className="text-xs text-[var(--color-text)] px-0.5 min-w-[1.25rem] text-center">
        {zoomLevel}%
      </span>
      <button 
        onClick={() => onZoomChange && onZoomChange(Math.min(200, zoomLevel + 10))}
        className="p-0.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
      >
        <Plus className="w-2.5 h-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
      </button>
    </div>
  )
}

export default ZoomControls