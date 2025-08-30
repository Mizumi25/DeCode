import React from 'react'
import {
  Component,
  Code,
  Puzzle,
  Layers,
  Grid3X3,
  Settings,
  EyeOff
} from 'lucide-react'
import { useHeaderStore } from '@/stores/useHeaderStore'

const MiddlePanelControls = ({ currentRoute, onPanelToggle, panelStates = {} }) => {
  const onForgePage = currentRoute.includes('/modeForge')
  const onSourcePage = currentRoute.includes('/modeSource')
  const { toggleStyleModal } = useHeaderStore()

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

      {/* Puzzle - Third Icon */}
      <button className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
        <Puzzle className="w-3 h-3 text-[var(--color-text)]" />
      </button>

      {/* Layers - Fourth Icon */}
      <button className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
        <Layers className="w-3 h-3 text-[var(--color-text)]" />
      </button>

      {/* Paneling - Fifth Icon */}
      <button className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
        <Grid3X3 className="w-3 h-3 text-[var(--color-text)]" />
      </button>

      {/* Vertical Divider */}
      <div className="w-px h-3 bg-[var(--color-border)]"></div>

      {/* Style Modal Button */}
      <button
        onClick={toggleStyleModal}
        className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
        title="Style Variables"
      >
        <Settings className="w-3 h-3 text-[var(--color-text)]" />
      </button>

      {/* Hide All Panels Button */}
      <button
        onClick={() => onPanelToggle && onPanelToggle('hideAll')}
        className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
        title="Hide All Panels"
      >
        <EyeOff className="w-3 h-3 text-[var(--color-text)]" />
      </button>
    </div>
  )
}

export default MiddlePanelControls