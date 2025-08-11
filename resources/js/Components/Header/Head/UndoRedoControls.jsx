import React from 'react'
import { Undo2, Redo2 } from 'lucide-react'

const UndoRedoControls = ({ onUndo, onRedo, size = 'small' }) => {
  const iconSize = size === 'small' ? 'w-2.5 h-2.5' : 'w-3 h-3'
  const padding = size === 'small' ? 'p-0.5' : 'p-1'

  return (
    <div className="flex items-center gap-0.5">
      <button 
        onClick={onUndo}
        className={`${padding} hover:bg-[var(--color-bg-muted)] rounded transition-colors`}
      >
        <Undo2 className={`${iconSize} text-[var(--color-text-muted)] hover:text-[var(--color-text)]`} />
      </button>
      <button 
        onClick={onRedo}
        className={`${padding} hover:bg-[var(--color-bg-muted)] rounded transition-colors`}
      >
        <Redo2 className={`${iconSize} text-[var(--color-text-muted)] hover:text-[var(--color-text)]`} />
      </button>
    </div>
  )
}

export default UndoRedoControls