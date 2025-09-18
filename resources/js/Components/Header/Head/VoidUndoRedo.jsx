// @/Components/Header/Head/VoidUndoRedo.jsx
import React from 'react'
import { Undo2, Redo2, History, Circle } from 'lucide-react'

const VoidUndoRedo = ({ 
  size = 'small',
  showUnsavedIndicator = false,
  canUndo = false,
  canRedo = false,
  undoCount = 0,
  redoCount = 0,
  totalActions = 0
}) => {
  const iconSize = size === 'small' ? 'w-2.5 h-2.5' : 'w-3 h-3'
  const padding = size === 'small' ? 'p-0.5' : 'p-1'

  // Static handlers - no actual functionality
  const handleUndo = () => {
    console.log('VoidUndoRedo: Undo clicked (dummy)')
  }

  const handleRedo = () => {
    console.log('VoidUndoRedo: Redo clicked (dummy)')
  }

  // Static tooltips
  const getUndoTooltip = () => {
    if (!canUndo) return 'Nothing to undo'
    return `Undo (${undoCount} actions)`
  }

  const getRedoTooltip = () => {
    if (!canRedo) return 'Nothing to redo'
    return `Redo (${redoCount} actions)`
  }

  return (
    <div className="flex items-center gap-0.5">
      {/* Unsaved changes indicator */}
      {showUnsavedIndicator && (
        <div className="flex items-center gap-1 pr-1">
          <Circle className="w-1.5 h-1.5 fill-orange-400 text-orange-400" />
          {size !== 'small' && (
            <span className="text-xs text-orange-600 font-medium">
              Unsaved
            </span>
          )}
        </div>
      )}
      
      {/* Undo Button */}
      <button 
        onClick={handleUndo}
        disabled={!canUndo}
        className={`${padding} hover:bg-[var(--color-bg-muted)] rounded transition-colors ${
          !canUndo ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={getUndoTooltip()}
      >
        <Undo2 className={`${iconSize} ${
          canUndo
            ? 'text-[var(--color-text)] hover:text-[var(--color-primary)]' 
            : 'text-[var(--color-text-muted)]'
        }`} />
      </button>

      {/* Redo Button */}
      <button 
        onClick={handleRedo}
        disabled={!canRedo}
        className={`${padding} hover:bg-[var(--color-bg-muted)] rounded transition-colors ${
          !canRedo ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={getRedoTooltip()}
      >
        <Redo2 className={`${iconSize} ${
          canRedo
            ? 'text-[var(--color-text)] hover:text-[var(--color-primary)]' 
            : 'text-[var(--color-text-muted)]'
        }`} />
      </button>

      {/* History Info (only show if not small) */}
      {size !== 'small' && totalActions > 0 && (
        <div className="flex items-center gap-1 px-2 text-xs text-[var(--color-text-muted)]">
          <History className="w-3 h-3" />
          <span>{totalActions}</span>
        </div>
      )}
    </div>
  )
}

export default VoidUndoRedo