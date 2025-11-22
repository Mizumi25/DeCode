// stores/useForgeStore.js - UPDATED for Code Panel Toggle + Default Panel Layout
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useForgeStore = create(
  persist(
    (set, get) => ({
      // Panel states specific to Forge page - FIXED: All panels start CLOSED
      forgePanelStates: {
        'components-panel': false,
        'code-panel': false,  
        'code-modal-panel': false,
        'layers-panel': false,
        'properties-panel': false,  // Changed from true to false
        'assets-panel': false       // Changed from true to false
      },
            
      // ADD THESE LINES (after codePanelMode: 'bottom',)
codePanelMode: 'bottom', 
      
// 🔥 NEW: Canvas expansion control
canvasExpansionEnabled: false, // Default: scroll inside canvas

// Action to toggle canvas expansion
toggleCanvasExpansion: () => set((state) => ({
  canvasExpansionEnabled: !state.canvasExpansionEnabled,
  _triggerUpdate: state._triggerUpdate + 1
})),
      
      
      // ADD after canvasExpansionEnabled
canvasZoom: 100, // Default 100%
interactionMode: 'edit', // 'edit' or 'preview'
previewPanelOpen: false,
previewPanelResponsiveMode: 'desktop', // Independent from main canvas

// Actions
setCanvasZoom: (zoom) => set({ 
  canvasZoom: Math.max(10, Math.min(200, zoom)),
  _triggerUpdate: get()._triggerUpdate + 1 
}),

setInteractionMode: (mode) => set({ 
  interactionMode: mode,
  _triggerUpdate: get()._triggerUpdate + 1 
}),

togglePreviewPanel: () => set((state) => ({ 
  previewPanelOpen: !state.previewPanelOpen,
  _triggerUpdate: state._triggerUpdate + 1 
})),

setPreviewPanelResponsiveMode: (mode) => set({ 
  previewPanelResponsiveMode: mode,
  _triggerUpdate: get()._triggerUpdate + 1 
}),
      
      
      
    // ADD action to change code panel mode
    setCodePanelMode: (mode) => set({ codePanelMode: mode }),
      
      // Panel visibility state (for hide all functionality)
      allPanelsHidden: false,
      
      // Force re-render trigger (increment this to force components to update)
      _triggerUpdate: 0,
      
      // UPDATED: Toggle individual panel - now allows ALL panels to be toggled
      toggleForgePanel: (panelId) => set((state) => {
        const newPanelStates = {
          ...state.forgePanelStates,
          [panelId]: !state.forgePanelStates[panelId]
        };
        
        // 🔥 FIX: If closing a panel, ensure it's fully removed
        if (state.forgePanelStates[panelId]) {
          // Was open, now closing - trigger cleanup
          setTimeout(() => {
            const panels = document.querySelectorAll(`[data-panel-id="${panelId}"]`);
            panels.forEach(p => p.remove());
          }, 300);
        }
        
        return {
          forgePanelStates: newPanelStates,
          allPanelsHidden: false,
          _triggerUpdate: state._triggerUpdate + 1
        };
      }),
      
      // UPDATED: Check if panel is open - includes code-panel logic
      isForgePanelOpen: (panelId) => {
        const state = get()
        
        // Properties and assets panels are always considered open (unless all hidden)
        if (panelId === 'properties-panel' || panelId === 'assets-panel') {
          return !state.allPanelsHidden;
        }
        
        // All other panels (including code-panel) use their toggle state
        const isOpen = state.forgePanelStates[panelId] && !state.allPanelsHidden;
        
        // Debug logging for code panel specifically
        if (panelId === 'code-panel') {
          
        }
        
        return isOpen;
      },
      
      // Get count of open panels
      getOpenForgePanelsCount: () => {
        const state = get()
        if (state.allPanelsHidden) return 0
        
        let count = 0;
        Object.entries(state.forgePanelStates).forEach(([panelId, isOpen]) => {
          // Always count properties and assets as open
          if (panelId === 'properties-panel' || panelId === 'assets-panel') {
            count++;
          } else if (isOpen) {
            count++;
          }
        });
        
        
        return count;
      },
      
      // Hide all panels (doesn't close them, just hides)
      hideAllForgePanels: () => set((state) => {
        
        return {
          allPanelsHidden: true,
          _triggerUpdate: state._triggerUpdate + 1
        };
      }),
      
      // Show all panels (restore visibility)
      showAllForgePanels: () => set((state) => {
        
        return {
          allPanelsHidden: false,
          _triggerUpdate: state._triggerUpdate + 1
        };
      }),
      
      // Toggle hide/show all panels
      toggleAllForgePanels: () => set((state) => {
        const newHiddenState = !state.allPanelsHidden;
        
        
        return {
          allPanelsHidden: newHiddenState,
          _triggerUpdate: state._triggerUpdate + 1
        };
      }),
      

     // UPDATED: Reset all panel states with proper defaults
    resetForgePanelStates: () => set((state) => {
      
      
      return {
        forgePanelStates: {
          'components-panel': false,
          'code-panel': false,
          'layers-panel': false,  
          'properties-panel': false,  // Changed from true to false
          'assets-panel': false       // Changed from true to false
        },
        allPanelsHidden: false,
        _triggerUpdate: state._triggerUpdate + 1
      };
    }),
      
      // NEW: Helper to check if any toggleable panels are open (excludes always-open panels)
      hasToggleablePanelsOpen: () => {
        const state = get()
        if (state.allPanelsHidden) return false
        
        // Check only toggleable panels
        const toggleablePanels = ['components-panel', 'code-panel', 'layers-panel'];
        return toggleablePanels.some(panelId => state.forgePanelStates[panelId]);
      },
      
      // NEW: Helper to get panel dock position preference
      getPanelDockPreference: (panelId) => {
        const dockPreferences = {
          'properties-panel': 'right',    // Top of right dock
          'assets-panel': 'right',        // Bottom of right dock  
          'code-panel': 'right',          // Right dock (or bottom on mobile)
          'components-panel': 'left',     // Left dock
          'layers-panel': 'left'          // Left dock
        };
        
        return dockPreferences[panelId] || 'left';
      },
      
      // NEW: Get ordered panels for a specific dock
      getOrderedPanelsForDock: (dockPosition) => {
        const state = get()
        
        if (dockPosition === 'right') {
          // Properties panel should be on top, assets on bottom, code in middle if open
          const rightPanels = [];
          
          if (state.isForgePanelOpen('properties-panel')) {
            rightPanels.push('properties-panel');
          }
          
          if (state.isForgePanelOpen('code-panel')) {
            rightPanels.push('code-panel');
          }
          
          if (state.isForgePanelOpen('assets-panel')) {
            rightPanels.push('assets-panel');
          }
          
          return rightPanels;
        }
        
        if (dockPosition === 'left') {
          const leftPanels = [];
          
          if (state.isForgePanelOpen('components-panel')) {
            leftPanels.push('components-panel');
          }
          
          if (state.isForgePanelOpen('layers-panel')) {
            leftPanels.push('layers-panel');
          }
          
          return leftPanels;
        }
        
        return [];
      },
      
      // NEW: Debug helper to log current state
      debugCurrentState: () => {
        const state = get()
        
        
        // Check each panel's computed open state
        Object.keys(state.forgePanelStates).forEach(panelId => {
          
        });
        
      }
    }),
    {
      name: 'forge-store',
      version: 2, // Increment version to handle schema changes
     partialize: (state) => ({
  forgePanelStates: state.forgePanelStates,
  allPanelsHidden: state.allPanelsHidden,
  canvasExpansionEnabled: state.canvasExpansionEnabled,
  canvasZoom: state.canvasZoom, // 🔥 ADD
  interactionMode: state.interactionMode, // 🔥 ADD
}),
      // Handle version migration
      migrate: (persistedState, version) => {
        if (version === 0) {
          // Migrate from version 0 to current
          return {
            ...persistedState,
            forgePanelStates: {
              'components-panel': true,
              'code-panel': false,        // Make sure code-panel is toggleable
              'layers-panel': false,
              'properties-panel': true,   // Default open
              'assets-panel': true        // Default open
            }
          };
        }
        return persistedState;
      }
    }
  )
)