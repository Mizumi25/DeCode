import React from 'react'
import {
  Component,
  Code,
  Puzzle,
  Layers,
  Grid3X3,
  Settings,
  EyeOff,
  Eye
} from 'lucide-react'
import { useHeaderStore } from '@/stores/useHeaderStore'
import { useForgeStore } from '@/stores/useForgeStore'

const MiddlePanelControls = ({ currentRoute, onPanelToggle, panelStates = {} }) => {
  const onForgePage = currentRoute.includes('/modeForge')
  const onSourcePage = currentRoute.includes('/modeSource')
  
  const { toggleStyleModal } = useHeaderStore()
  
  // Use ForgeStore for Forge page panels
  const { 
    toggleForgePanel, 
    isForgePanelOpen, 
    toggleAllForgePanels, 
    allPanelsHidden 
  } = useForgeStore()

  // Handle panel toggle based on page type
  const handlePanelToggle = (panelId) => {
    if (onForgePage) {
      // Map button positions to panel IDs for Forge page
      const forgePanelMap = {
        'components': 'components-panel',
        'code': 'code-panel', 
        'layers': 'layers-panel'
      }
      
      const actualPanelId = forgePanelMap[panelId]
      if (actualPanelId) {
        toggleForgePanel(actualPanelId)
      }
    } else {
      // Use original onPanelToggle for other pages
      onPanelToggle && onPanelToggle(panelId)
    }
  }

  // Handle hide all panels
  const handleHideAllPanels = () => {
    if (onForgePage) {
      toggleAllForgePanels()
    } else {
      onPanelToggle && onPanelToggle('hideAll')
    }
  }

  // Check if panel is active based on page type
  const isPanelActive = (panelId) => {
    if (onForgePage) {
      const forgePanelMap = {
        'components': 'components-panel',
        'code': 'code-panel',
        'layers': 'layers-panel'
      }
      const actualPanelId = forgePanelMap[panelId]
      return actualPanelId ? isForgePanelOpen(actualPanelId) : false
    } else {
      return panelStates[panelId] || false
    }
  }

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {/* Components Panel Toggle - First Icon */}
      <button 
        onClick={() => handlePanelToggle('components')}
        className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
        title="Toggle Components Panel"
      >
        <Component className={`w-3 h-3 ${
          isPanelActive('components') ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
        }`} />
      </button>

      {/* Code Panel Toggle - Second Icon */}
      <button 
        onClick={() => handlePanelToggle('code')}
        className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
        title="Toggle Code Panel"
      >
        <Code className={`w-3 h-3 ${
          isPanelActive('code') ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
        }`} />
      </button>

      {/* Puzzle - Third Icon (placeholder) */}
      <button className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
        title="Coming Soon">
        <Puzzle className="w-3 h-3 text-[var(--color-text)]" />
      </button>

      {/* Layers Panel Toggle - Fourth Icon */}
      <button 
        onClick={() => handlePanelToggle('layers')}
        className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
        title="Toggle Layers Panel"
      >
        <Layers className={`w-3 h-3 ${
          isPanelActive('layers') ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
        }`} />
      </button>

      {/* Grid3X3 - Fifth Icon (placeholder) */}
      <button className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
        title="Coming Soon">
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

      {/* Hide/Show All Panels Button */}
      <button
        onClick={handleHideAllPanels}
        className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
        title={onForgePage && allPanelsHidden ? "Show All Panels" : "Hide All Panels"}
      >
        {onForgePage && allPanelsHidden ? (
          <Eye className="w-3 h-3 text-[var(--color-text)]" />
        ) : (
          <EyeOff className="w-3 h-3 text-[var(--color-text)]" />
        )}
      </button>
    </div>
  )
}

export default MiddlePanelControls