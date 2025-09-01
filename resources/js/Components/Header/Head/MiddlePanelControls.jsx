import React from 'react'
import {
  Component,
  Code,
  Puzzle,
  Layers,
  Info,
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
  
  // Use ForgeStore for Forge page panels with reactive state
  const { 
    toggleForgePanel, 
    isForgePanelOpen, 
    toggleAllForgePanels, 
    allPanelsHidden,
    forgePanelStates,
    _triggerUpdate // Include for reactive updates
  } = useForgeStore()

  // Handle panel toggle based on page type with enhanced logging
  const handlePanelToggle = (panelId) => {
    console.log(`MiddlePanelControls: Toggle requested for ${panelId} on ${onForgePage ? 'Forge' : 'Other'} page`);
    
    if (onForgePage) {
      // Map button positions to panel IDs for Forge page
      const forgePanelMap = {
        'components': 'components-panel',
        'code': 'code-panel', 
        'layers': 'layers-panel'
      }
      
      const actualPanelId = forgePanelMap[panelId]
      console.log(`MiddlePanelControls: Mapped ${panelId} to ${actualPanelId}`);
      
      if (actualPanelId) {
        console.log(`MiddlePanelControls: Calling toggleForgePanel for ${actualPanelId}`);
        console.log(`MiddlePanelControls: Current state before toggle: ${isForgePanelOpen(actualPanelId)}`);
        
        toggleForgePanel(actualPanelId)
        
        // Log state after toggle (use setTimeout to see the updated state)
        setTimeout(() => {
          console.log(`MiddlePanelControls: State after toggle: ${isForgePanelOpen(actualPanelId)}`);
        }, 0);
      }
    } else {
      // Use original onPanelToggle for other pages
      console.log(`MiddlePanelControls: Using original onPanelToggle for ${panelId}`);
      onPanelToggle && onPanelToggle(panelId)
    }
  }

  // Handle hide all panels with logging
  const handleHideAllPanels = () => {
    console.log('MiddlePanelControls: Hide all panels requested');
    
    if (onForgePage) {
      console.log(`MiddlePanelControls: Current allPanelsHidden state: ${allPanelsHidden}`);
      toggleAllForgePanels()
      
      setTimeout(() => {
        console.log(`MiddlePanelControls: New allPanelsHidden state: ${allPanelsHidden}`);
      }, 0);
    } else {
      onPanelToggle && onPanelToggle('hideAll')
    }
  }

  // Check if panel is active based on page type with reactive updates
  const isPanelActive = (panelId) => {
    if (onForgePage) {
      const forgePanelMap = {
        'components': 'components-panel',
        'code': 'code-panel',
        'layers': 'layers-panel'
      }
      const actualPanelId = forgePanelMap[panelId]
      const isActive = actualPanelId ? isForgePanelOpen(actualPanelId) : false;
      
      // Debug log for active state
      if (actualPanelId) {
        console.log(`MiddlePanelControls: Panel ${panelId} (${actualPanelId}) is ${isActive ? 'active' : 'inactive'}`);
      }
      
      return isActive;
    } else {
      return panelStates[panelId] || false
    }
  }

  // Log current state when component renders
  console.log('MiddlePanelControls: Rendering with states:', {
    onForgePage,
    allPanelsHidden,
    forgePanelStates,
    triggerUpdate: _triggerUpdate
  });

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

      {/* Info - Fifth Icon (replaced Grid3X3) */}
      <button className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
        title="Information">
        <Info className="w-3 h-3 text-[var(--color-text)]" />
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