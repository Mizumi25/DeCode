import React from 'react'
import {
  Component,
  Code,
  Puzzle,
  Layers,
  Grid3X3
} from 'lucide-react'

const MiddlePanelControls = ({ currentRoute, onPanelToggle, panelStates = {} }) => {
  const onForgePage = currentRoute === '/forge'
  const onSourcePage = currentRoute === '/source'

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {/* Forge/Components Panel Toggle - First Icon */}
      <button 
        onClick={() => onPanelToggle && onPanelToggle('forge')}
        className={`p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors ${
          panelStates.forge ? 'bg-[var(--color-primary)] text-white' : ''
        }`}
        title="Toggle Forge Panel"
      >
        <Component className={`w-3 h-3 ${onForgePage || panelStates.forge ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`} />
      </button>

      {/* Source Panel Toggle - Second Icon */}
      <button 
        onClick={() => onPanelToggle && onPanelToggle('source')}
        className={`p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors ${
          panelStates.source ? 'bg-[var(--color-primary)] text-white' : ''
        }`}
        title="Toggle Source Panel"
      >
        <Code className={`w-3 h-3 ${onSourcePage || panelStates.source ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`} />
      </button>

      <button className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
        <Puzzle className="w-3 h-3 text-[var(--color-text)]" />
      </button>

      {/* Layers - Inactive */}
      <button className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
        <Layers className="w-3 h-3 text-[var(--color-text)]" />
      </button>

      {/* Paneling - Inactive */}
      <button className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
        <Grid3X3 className="w-3 h-3 text-[var(--color-text)]" />
      </button>
    </div>
  )
}

export default MiddlePanelControls