// stores/useForgeStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useForgeStore = create(
  persist(
    (set, get) => ({
      // Panel states specific to Forge page - Set properties and assets to true by default
      forgePanelStates: {
        'components-panel': false,
        'code-panel': false,
        'layers-panel': false,
        'properties-panel': true,  // Open by default
        'assets-panel': true       // Open by default
      },
      
      // Panel visibility state (for hide all functionality)
      allPanelsHidden: false,
      
      // Toggle individual panel
      toggleForgePanel: (panelId) => set((state) => {
        // Don't allow toggling of always-open panels
        if (panelId === 'properties-panel' || panelId === 'assets-panel') {
          return state; // Return unchanged state
        }
        
        return {
          forgePanelStates: {
            ...state.forgePanelStates,
            [panelId]: !state.forgePanelStates[panelId]
          },
          // If we're showing a panel, unhide all panels
          allPanelsHidden: state.forgePanelStates[panelId] ? state.allPanelsHidden : false
        };
      }),
      
      // Check if panel is open
      isForgePanelOpen: (panelId) => {
        const state = get()
        // Properties and assets panels are always considered open (unless all hidden)
        if (panelId === 'properties-panel' || panelId === 'assets-panel') {
          return !state.allPanelsHidden;
        }
        return state.forgePanelStates[panelId] && !state.allPanelsHidden
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
      hideAllForgePanels: () => set(() => ({
        allPanelsHidden: true
      })),
      
      // Show all panels (restore visibility)
      showAllForgePanels: () => set(() => ({
        allPanelsHidden: false
      })),
      
      // Toggle hide/show all panels
      toggleAllForgePanels: () => set((state) => ({
        allPanelsHidden: !state.allPanelsHidden
      })),
      
      // Reset all panel states
      resetForgePanelStates: () => set(() => ({
        forgePanelStates: {
          'components-panel': false,
          'code-panel': false,
          'layers-panel': false,
          'properties-panel': true,  // Keep these open by default
          'assets-panel': true       // Keep these open by default
        },
        allPanelsHidden: false
      }))
    }),
    {
      name: 'forge-store',
      partialize: (state) => ({
        forgePanelStates: state.forgePanelStates,
        allPanelsHidden: state.allPanelsHidden
      })
    }
  )
)