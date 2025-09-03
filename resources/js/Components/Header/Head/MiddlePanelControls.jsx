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
import { useSourceStore } from '@/stores/useSourceStore'

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

  // Use SourceStore for Source page panels with reactive state
  const {
    toggleSourcePanel,
    isSourcePanelOpen,
    toggleAllSourcePanels,
    allSourcePanelsHidden,
    sourcePanelStates,
    _sourceTriggerUpdate
  } = useSourceStore()

  // Handle panel toggle based on page type with enhanced logging
  const handlePanelToggle = (panelId) => {
    console.log(`MiddlePanelControls: Toggle requested for ${panelId} on ${onForgePage ? 'Forge' : onSourcePage ? 'Source' : 'Other'} page`);
    
    if (onForgePage) {
      // Map button positions to panel IDs for Forge page
      const forgePanelMap = {
        'components': 'components-panel',
        'code': 'code-panel', 
        'layers': 'layers-panel'
      }
      
      const actualPanelId = forgePanelMap[panelId]
      console.log(`MiddlePanelControls: Mapped ${panelId} to ${actualPanelId} for Forge`);
      
      if (actualPanelId) {
        console.log(`MiddlePanelControls: Calling toggleForgePanel for ${actualPanelId}`);
        console.log(`MiddlePanelControls: Current Forge state before toggle: ${isForgePanelOpen(actualPanelId)}`);
        
        toggleForgePanel(actualPanelId)
        
        // Log state after toggle (use setTimeout to see the updated state)
        setTimeout(() => {
          console.log(`MiddlePanelControls: Forge state after toggle: ${isForgePanelOpen(actualPanelId)}`);
        }, 0);
      }
    } else if (onSourcePage) {
      // Map button positions to panel IDs for Source page
      const sourcePanelMap = {
        'components': 'explorer-panel',  // Maps to explorer (which IS the layers panel)
        'code': 'terminal-panel',        // Maps to terminal/output
        'layers': 'explorer-panel'       // Maps to explorer panel (SAME as components)
      }
      
      const actualPanelId = sourcePanelMap[panelId]
      console.log(`MiddlePanelControls: Mapped ${panelId} to ${actualPanelId} for Source`);
      
      if (actualPanelId) {
        console.log(`MiddlePanelControls: Calling toggleSourcePanel for ${actualPanelId}`);
        console.log(`MiddlePanelControls: Current Source state before toggle: ${isSourcePanelOpen(actualPanelId)}`);
        
        toggleSourcePanel(actualPanelId)
        
        // Log state after toggle (use setTimeout to see the updated state)
        setTimeout(() => {
          console.log(`MiddlePanelControls: Source state after toggle: ${isSourcePanelOpen(actualPanelId)}`);
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
      console.log(`MiddlePanelControls: Current Forge allPanelsHidden state: ${allPanelsHidden}`);
      toggleAllForgePanels()
      
      setTimeout(() => {
        console.log(`MiddlePanelControls: New Forge allPanelsHidden state: ${allPanelsHidden}`);
      }, 0);
    } else if (onSourcePage) {
      console.log(`MiddlePanelControls: Current Source allSourcePanelsHidden state: ${allSourcePanelsHidden}`);
      toggleAllSourcePanels()
      
      setTimeout(() => {
        console.log(`MiddlePanelControls: New Source allSourcePanelsHidden state: ${allSourcePanelsHidden}`);
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
        console.log(`MiddlePanelControls: Forge panel ${panelId} (${actualPanelId}) is ${isActive ? 'active' : 'inactive'}`);
      }
      
      return isActive;
    } else if (onSourcePage) {
      const sourcePanelMap = {
        'components': 'explorer-panel',
        'code': 'terminal-panel',
        'layers': 'layers-panel'
      }
      const actualPanelId = sourcePanelMap[panelId]
      const isActive = actualPanelId ? isSourcePanelOpen(actualPanelId) : false;
      
      // Debug log for active state
      if (actualPanelId) {
        console.log(`MiddlePanelControls: Source panel ${panelId} (${actualPanelId}) is ${isActive ? 'active' : 'inactive'}`);
      }
      
      return isActive;
    } else {
      return panelStates[panelId] || false
    }
  }

  // Get the appropriate hidden state based on page
  const getHiddenState = () => {
    if (onForgePage) return allPanelsHidden;
    if (onSourcePage) return allSourcePanelsHidden;
    return false; // Default for other pages
  }

  // Log current state when component renders
  console.log('MiddlePanelControls: Rendering with states:', {
    onForgePage,
    onSourcePage,
    forgePanelStates: onForgePage ? forgePanelStates : 'N/A',
    sourcePanelStates: onSourcePage ? sourcePanelStates : 'N/A',
    allPanelsHidden: onForgePage ? allPanelsHidden : 'N/A',
    allSourcePanelsHidden: onSourcePage ? allSourcePanelsHidden : 'N/A',
    triggerUpdate: onForgePage ? _triggerUpdate : onSourcePage ? _sourceTriggerUpdate : 'N/A'
  });

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {/* Components Panel Toggle - First Icon */}
      <button 
        onClick={() => handlePanelToggle('components')}
        className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
        title={onSourcePage ? "Toggle Explorer Panel" : "Toggle Components Panel"}
      >
        <Component className={`w-3 h-3 ${
          isPanelActive('components') ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
        }`} />
      </button>

      {/* Code Panel Toggle - Second Icon */}
      <button 
        onClick={() => handlePanelToggle('code')}
        className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
        title={onSourcePage ? "Toggle Terminal Panel" : "Toggle Code Panel"}
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

      {/* Layers Panel Toggle - Fourth Icon - UPDATED for Source page support */}
      <button 
        onClick={() => handlePanelToggle('layers')}
        className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
        title={onSourcePage ? "Toggle Layers Panel (Source)" : "Toggle Layers Panel (Forge)"}
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

      {/* Hide/Show All Panels Button - UPDATED for Source page support */}
      <button
        onClick={handleHideAllPanels}
        className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
        title={
          onForgePage 
            ? (allPanelsHidden ? "Show All Panels" : "Hide All Panels")
            : onSourcePage 
            ? (allSourcePanelsHidden ? "Show All Panels" : "Hide All Panels")
            : "Hide/Show All Panels"
        }
      >
        {getHiddenState() ? (
          <Eye className="w-3 h-3 text-[var(--color-text)]" />
        ) : (
          <EyeOff className="w-3 h-3 text-[var(--color-text)]" />
        )}
      </button>
    </div>
  )
}

export default MiddlePanelControls