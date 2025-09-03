// stores/useSourceStore.js - Source Page Panel Management
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSourceStore = create(
  persist(
    (set, get) => ({
      // Panel states specific to Source page  
      sourcePanelStates: {
        'explorer-panel': true,         // Left dock - open by default (THIS IS the layers panel)
        'preview-panel': true,          // Right dock - open by default
        'terminal-panel': true,         // Bottom dock - open by default
        'output-panel': false,          // Bottom dock - toggleable
        'problems-panel': false,        // Bottom dock - toggleable
        'debug-panel': false           // Right dock - toggleable
      },
      
      // Panel visibility state (for hide all functionality)
      allSourcePanelsHidden: false,
      
      // Force re-render trigger
      _sourceTriggerUpdate: 0,
      
      // Toggle individual panel
      toggleSourcePanel: (panelId) => set((state) => {
        console.log(`SourceStore: Toggling panel ${panelId} from ${state.sourcePanelStates[panelId]} to ${!state.sourcePanelStates[panelId]}`);
        
        // Allow toggling of all panels except explorer and preview (which are always open)
        if (panelId === 'explorer-panel' || panelId === 'preview-panel') {
          console.log(`SourceStore: Cannot toggle ${panelId} - it's always open`);
          return state; // Return unchanged state
        }
        
        const newState = {
          sourcePanelStates: {
            ...state.sourcePanelStates,
            [panelId]: !state.sourcePanelStates[panelId]
          },
          // If we're showing a panel, unhide all panels
          allSourcePanelsHidden: state.sourcePanelStates[panelId] ? state.allSourcePanelsHidden : false,
          // Increment trigger to force re-render
          _sourceTriggerUpdate: state._sourceTriggerUpdate + 1
        };
        
        console.log('SourceStore: New panel states:', newState.sourcePanelStates);
        console.log(`SourceStore: Panel ${panelId} is now ${newState.sourcePanelStates[panelId] ? 'OPEN' : 'CLOSED'}`);
        return newState;
      }),
      
      // Check if panel is open
      isSourcePanelOpen: (panelId) => {
        const state = get()
        
        // Explorer and preview panels are always considered open (unless all hidden)
        if (panelId === 'explorer-panel' || panelId === 'preview-panel') {
          return !state.allSourcePanelsHidden;
        }
        
        // All other panels use their toggle state
        const isOpen = state.sourcePanelStates[panelId] && !state.allSourcePanelsHidden;
        
        // Debug logging for explorer panel specifically (which serves as layers)
        if (panelId === 'explorer-panel') {
          console.log(`SourceStore: Explorer panel (layers) check - toggle state: ${state.sourcePanelStates[panelId]}, all hidden: ${state.allSourcePanelsHidden}, result: ${isOpen}`);
        }
        
        return isOpen;
      },
      
      // Get count of open panels
      getOpenSourcePanelsCount: () => {
        const state = get()
        if (state.allSourcePanelsHidden) return 0
        
        let count = 0;
        Object.entries(state.sourcePanelStates).forEach(([panelId, isOpen]) => {
          // Always count explorer and preview as open
          if (panelId === 'explorer-panel' || panelId === 'preview-panel') {
            count++;
          } else if (isOpen) {
            count++;
          }
        });
        
        console.log(`SourceStore: Open panels count: ${count}`);
        return count;
      },
      
      // Hide all panels (doesn't close them, just hides)
      hideAllSourcePanels: () => set((state) => {
        console.log('SourceStore: Hiding all panels');
        return {
          allSourcePanelsHidden: true,
          _sourceTriggerUpdate: state._sourceTriggerUpdate + 1
        };
      }),
      
      // Show all panels (restore visibility)
      showAllSourcePanels: () => set((state) => {
        console.log('SourceStore: Showing all panels');
        return {
          allSourcePanelsHidden: false,
          _sourceTriggerUpdate: state._sourceTriggerUpdate + 1
        };
      }),
      
      // Toggle hide/show all panels
      toggleAllSourcePanels: () => set((state) => {
        const newHiddenState = !state.allSourcePanelsHidden;
        console.log(`SourceStore: Toggle all panels - new hidden state: ${newHiddenState}`);
        
        return {
          allSourcePanelsHidden: newHiddenState,
          _sourceTriggerUpdate: state._sourceTriggerUpdate + 1
        };
      }),
      
      // Reset all panel states with defaults
      resetSourcePanelStates: () => set((state) => {
        console.log('SourceStore: Resetting all panel states to defaults');
        
        return {
          sourcePanelStates: {
            'explorer-panel': true,       // Left dock - open by default (serves as layers panel)
            'preview-panel': true,        // Right dock - open by default
            'terminal-panel': true,       // Bottom dock - open by default
            'output-panel': false,        // Bottom dock - closed by default
            'problems-panel': false,      // Bottom dock - closed by default
            'debug-panel': false         // Right dock - closed by default
          },
          allSourcePanelsHidden: false,
          _sourceTriggerUpdate: state._sourceTriggerUpdate + 1
        };
      }),
      
      // Helper to check if any toggleable panels are open (excludes always-open panels)
      hasToggleableSourcePanelsOpen: () => {
        const state = get()
        if (state.allSourcePanelsHidden) return false
        
        // Check only toggleable panels (explorer is always-open, serves as layers)
        const toggleablePanels = ['terminal-panel', 'output-panel', 'problems-panel', 'debug-panel'];
        return toggleablePanels.some(panelId => state.sourcePanelStates[panelId]);
      },
      
      // Helper to get panel dock position preference
      getSourcePanelDockPreference: (panelId) => {
        const dockPreferences = {
          'explorer-panel': 'left',       // Left dock (serves as both explorer AND layers panel)
          'preview-panel': 'right',       // Right dock
          'debug-panel': 'right',         // Right dock
          'terminal-panel': 'bottom',     // Bottom dock
          'output-panel': 'bottom',       // Bottom dock
          'problems-panel': 'bottom'      // Bottom dock
        };
        
        return dockPreferences[panelId] || 'left';
      },
      
      // Get ordered panels for a specific dock
      getOrderedSourcePanelsForDock: (dockPosition) => {
        const state = get()
        
        if (dockPosition === 'left') {
          const leftPanels = [];
          
          if (state.isSourcePanelOpen('explorer-panel')) {
            leftPanels.push('explorer-panel');
          }
          
          return leftPanels;
        }
        
        if (dockPosition === 'right') {
          const rightPanels = [];
          
          if (state.isSourcePanelOpen('preview-panel')) {
            rightPanels.push('preview-panel');
          }
          
          if (state.isSourcePanelOpen('debug-panel')) {
            rightPanels.push('debug-panel');
          }
          
          return rightPanels;
        }
        
        if (dockPosition === 'bottom') {
          const bottomPanels = [];
          
          if (state.isSourcePanelOpen('terminal-panel')) {
            bottomPanels.push('terminal-panel');
          }
          
          if (state.isSourcePanelOpen('output-panel')) {
            bottomPanels.push('output-panel');
          }
          
          if (state.isSourcePanelOpen('problems-panel')) {
            bottomPanels.push('problems-panel');
          }
          
          return bottomPanels;
        }
        
        return [];
      },
      
      // Debug helper to log current state
      debugSourceCurrentState: () => {
        const state = get()
        console.log('=== SOURCE STORE DEBUG ===');
        console.log('Panel States:', state.sourcePanelStates);
        console.log('All Panels Hidden:', state.allSourcePanelsHidden);
        console.log('Trigger Update:', state._sourceTriggerUpdate);
        console.log('Open Panels Count:', state.getOpenSourcePanelsCount());
        
        // Check each panel's computed open state
        Object.keys(state.sourcePanelStates).forEach(panelId => {
          console.log(`${panelId}: ${state.isSourcePanelOpen(panelId) ? 'OPEN' : 'CLOSED'}`);
        });
        console.log('==========================');
      }
    }),
    {
      name: 'source-store',
      version: 1,
      partialize: (state) => ({
        sourcePanelStates: state.sourcePanelStates,
        allSourcePanelsHidden: state.allSourcePanelsHidden
        // Don't persist _sourceTriggerUpdate
      })
    }
  )
)