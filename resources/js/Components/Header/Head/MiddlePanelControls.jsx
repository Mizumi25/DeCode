import React from 'react'
import {
  Component,
  Code,
  Puzzle,
  Layers,
  Info,
  Settings,
  EyeOff,
  Eye,
  PackageOpen,
  Image
} from 'lucide-react'
import { useHeaderStore } from '@/stores/useHeaderStore'
import { useForgeStore } from '@/stores/useForgeStore'
import { useSourceStore } from '@/stores/useSourceStore'

const MiddlePanelControls = ({ currentRoute, onPanelToggle, panelStates = {}, onLinkedComponentsClick }) => {
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
    console.log('🔵 handlePanelToggle called with:', panelId)
    
    if (onForgePage) {
      // Map button positions to panel IDs for Forge page
      const forgePanelMap = {
        'components': 'components-panel',
        'code': 'code-panel', 
        'layers': 'layers-panel',
        'assets': 'assets-panel',
        'properties': 'properties-panel'
      }
      
      const actualPanelId = forgePanelMap[panelId]
      console.log('🔵 Mapped to actualPanelId:', actualPanelId)
      
      if (actualPanelId) {
        console.log('🔵 Calling toggleForgePanel for:', actualPanelId)
        toggleForgePanel(actualPanelId)
        
        // Log state after toggle (use setTimeout to see the updated state)
        setTimeout(() => {
          console.log('🔵 Panel states after toggle:', forgePanelStates)
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
      
      
      if (actualPanelId) {
        
        
        toggleSourcePanel(actualPanelId)
        
        // Log state after toggle (use setTimeout to see the updated state)
        setTimeout(() => {
          
        }, 0);
      }
    } else {
      // Use original onPanelToggle for other pages
      
      onPanelToggle && onPanelToggle(panelId)
    }
  }

  // Handle hide all panels with logging
  const handleHideAllPanels = () => {
    
    
    if (onForgePage) {
      
      toggleAllForgePanels()
      
      setTimeout(() => {
        
      }, 0);
    } else if (onSourcePage) {
      
      toggleAllSourcePanels()
      
      setTimeout(() => {
        
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
        'layers': 'layers-panel',
        'assets': 'assets-panel',
        'properties': 'properties-panel'
      }
      const actualPanelId = forgePanelMap[panelId]
      const isActive = actualPanelId ? isForgePanelOpen(actualPanelId) : false;
      
      // Debug log for active state
      if (actualPanelId) {
        
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

  

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {/* Components Panel Toggle - First Icon */}
      <button 
        onClick={() => handlePanelToggle('components')}
        className="p-1 md:p-1 hover:bg-[var(--color-bg-muted)] rounded md:rounded transition-colors"
        title={onSourcePage ? "Toggle Explorer Panel" : "Toggle Components Panel"}
      >
        <Component className={`w-4 h-4 md:w-3 md:h-3 ${
          isPanelActive('components') ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
        }`} />
      </button>

      {/* Code Panel Toggle - Second Icon */}
      <button 
        onClick={() => handlePanelToggle('code')}
        className="p-1 md:p-1 hover:bg-[var(--color-bg-muted)] rounded md:rounded transition-colors"
        title={onSourcePage ? "Toggle Terminal Panel" : "Toggle Code Panel"}
      >
        <Code className={`w-4 h-4 md:w-3 md:h-3 ${
          isPanelActive('code') ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
        }`} />
      </button>

      {/* Linked Components - Third Icon (only on Forge page) */}
      {onForgePage ? (
        <button 
          onClick={onLinkedComponentsClick}
          className={`p-1 md:p-1 rounded md:rounded transition-colors ${
            isForgePanelOpen('linked-components-modal')
              ? 'bg-[var(--color-primary)] text-white' 
              : 'hover:bg-[var(--color-bg-muted)] text-[var(--color-text)]'
          }`}
          title="Linked Components (imported to this page)"
        >
          <PackageOpen className="w-4 h-4 md:w-3 md:h-3" />
        </button>
      ) : (
        <button className="p-1 md:p-1 hover:bg-[var(--color-bg-muted)] rounded md:rounded transition-colors"
          title="Coming Soon">
          <Puzzle className="w-4 h-4 md:w-3 md:h-3 text-[var(--color-text)]" />
        </button>
      )}

      {/* Layers Panel Toggle - Fourth Icon - UPDATED for Source page support */}
      <button 
        onClick={() => handlePanelToggle('layers')}
        className="p-1 md:p-1 hover:bg-[var(--color-bg-muted)] rounded md:rounded transition-colors"
        title={onSourcePage ? "Toggle Layers Panel (Source)" : "Toggle Layers Panel (Forge)"}
      >
        <Layers className={`w-4 h-4 md:w-3 md:h-3 ${
          isPanelActive('layers') ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
        }`} />
      </button>

     {/* Assets Panel - Fifth Icon - NEW! */}
      {onForgePage && (
        <button 
          onClick={() => handlePanelToggle('assets')}
          className="p-1 md:p-1 hover:bg-[var(--color-bg-muted)] rounded md:rounded transition-colors"
          title="Toggle Assets Panel"
        >
          <Image className={`w-4 h-4 md:w-3 md:h-3 ${
            isPanelActive('assets') ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
          }`} />
        </button>
      )}

      {/* Properties Panel - Sixth Icon (Info) */}
      {onForgePage && (
        <button 
          onClick={() => handlePanelToggle('properties')}
          className="p-1 md:p-1 hover:bg-[var(--color-bg-muted)] rounded md:rounded transition-colors"
          title="Toggle Properties Panel"
        >
          <Info className={`w-4 h-4 md:w-3 md:h-3 ${
            isPanelActive('properties') ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
          }`} />
        </button>
      )}
    
    
      {/* Vertical Divider */}
      <div className="w-px h-4 md:h-3 bg-[var(--color-border)]"></div>

      {/* Style Modal Button */}
      <button
        onClick={toggleStyleModal}
        className="p-1 md:p-1 hover:bg-[var(--color-bg-muted)] rounded md:rounded transition-colors"
        title="Style Variables"
      >
        <Settings className="w-4 h-4 md:w-3 md:h-3 text-[var(--color-text)]" />
      </button>

      {/* Hide/Show All Panels Button - UPDATED for Source page support */}
      <button
        onClick={handleHideAllPanels}
        className="p-1 md:p-1 hover:bg-[var(--color-bg-muted)] rounded md:rounded transition-colors"
        title={
          onForgePage 
            ? (allPanelsHidden ? "Show All Panels" : "Hide All Panels")
            : onSourcePage 
            ? (allSourcePanelsHidden ? "Show All Panels" : "Hide All Panels")
            : "Hide/Show All Panels"
        }
      >
        {getHiddenState() ? (
          <Eye className="w-4 h-4 md:w-3 md:h-3 text-[var(--color-text)]" />
        ) : (
          <EyeOff className="w-4 h-4 md:w-3 md:h-3 text-[var(--color-text)]" />
        )}
      </button>
    </div>
  )
}

export default MiddlePanelControls