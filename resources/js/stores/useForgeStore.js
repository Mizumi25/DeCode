// stores/useForgeStore.js - UPDATED for Code Panel Toggle + Default Panel Layout
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useForgeStore = create(
  persist(
    (set, get) => ({
      // Panel states specific to Forge page - UPDATED for better defaults
      forgePanelStates: {
        'components-panel': false,      // Left dock - toggleable
        'code-panel': false,            // Right dock or bottom - MADE toggleable
        'code-modal-panel': false,
        'layers-panel': false,          // Left dock - toggleable
        'properties-panel': true,       // Right dock - open by default (top)
        'assets-panel': true            // Right dock - open by default (bottom)
      },
      
      codePanelMode: 'bottom', 
      
    // ADD action to change code panel mode
    setCodePanelMode: (mode) => set({ codePanelMode: mode }),
      
      // Panel visibility state (for hide all functionality)
      allPanelsHidden: false,
      
      // Force re-render trigger (increment this to force components to update)
      _triggerUpdate: 0,
      
      // UPDATED: Toggle individual panel - now allows code-panel toggling
      toggleForgePanel: (panelId) => set((state) => {
        console.log(`ForgeStore: Toggling panel ${panelId} from ${state.forgePanelStates[panelId]} to ${!state.forgePanelStates[panelId]}`);
        
        // Allow toggling of all panels except properties and assets (which are always open)
        if (panelId === 'properties-panel' || panelId === 'assets-panel') {
          console.log(`ForgeStore: Cannot toggle ${panelId} - it's always open`);
          return state; // Return unchanged state
        }
        
        const newState = {
          forgePanelStates: {
            ...state.forgePanelStates,
            [panelId]: !state.forgePanelStates[panelId]
          },
          // If we're showing a panel, unhide all panels
          allPanelsHidden: state.forgePanelStates[panelId] ? state.allPanelsHidden : false,
          // Increment trigger to force re-render
          _triggerUpdate: state._triggerUpdate + 1
        };
        
        console.log('ForgeStore: New panel states:', newState.forgePanelStates);
        console.log(`ForgeStore: Panel ${panelId} is now ${newState.forgePanelStates[panelId] ? 'OPEN' : 'CLOSED'}`);
        return newState;
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
          console.log(`ForgeStore: Code panel check - toggle state: ${state.forgePanelStates[panelId]}, all hidden: ${state.allPanelsHidden}, result: ${isOpen}`);
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
        
        console.log(`ForgeStore: Open panels count: ${count}`);
        return count;
      },
      
      // Hide all panels (doesn't close them, just hides)
      hideAllForgePanels: () => set((state) => {
        console.log('ForgeStore: Hiding all panels');
        return {
          allPanelsHidden: true,
          _triggerUpdate: state._triggerUpdate + 1
        };
      }),
      
      // Show all panels (restore visibility)
      showAllForgePanels: () => set((state) => {
        console.log('ForgeStore: Showing all panels');
        return {
          allPanelsHidden: false,
          _triggerUpdate: state._triggerUpdate + 1
        };
      }),
      
      // Toggle hide/show all panels
      toggleAllForgePanels: () => set((state) => {
        const newHiddenState = !state.allPanelsHidden;
        console.log(`ForgeStore: Toggle all panels - new hidden state: ${newHiddenState}`);
        
        return {
          allPanelsHidden: newHiddenState,
          _triggerUpdate: state._triggerUpdate + 1
        };
      }),
      
      // UPDATED: Reset all panel states with better defaults
      resetForgePanelStates: () => set((state) => {
        console.log('ForgeStore: Resetting all panel states to defaults');
        
        return {
          forgePanelStates: {
            'components-panel': false,    // Left dock - closed by default
            'code-panel': false,          // Bottom/right - closed by default, but toggleable
            'layers-panel': false,        // Left dock - closed by default  
            'properties-panel': true,     // Right dock - open by default (top position)
            'assets-panel': true          // Right dock - open by default (bottom position)
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
        console.log('=== FORGE STORE DEBUG ===');
        console.log('Panel States:', state.forgePanelStates);
        console.log('All Panels Hidden:', state.allPanelsHidden);
        console.log('Trigger Update:', state._triggerUpdate);
        console.log('Open Panels Count:', state.getOpenForgePanelsCount());
        
        // Check each panel's computed open state
        Object.keys(state.forgePanelStates).forEach(panelId => {
          console.log(`${panelId}: ${state.isForgePanelOpen(panelId) ? 'OPEN' : 'CLOSED'}`);
        });
        console.log('========================');
      }
    }),
    {
      name: 'forge-store',
      version: 2, // Increment version to handle schema changes
      partialize: (state) => ({
        forgePanelStates: state.forgePanelStates,
        allPanelsHidden: state.allPanelsHidden
        // Don't persist _triggerUpdate
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