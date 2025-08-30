// stores/useEditorStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useEditorStore = create(
  persist(
    (set, get) => ({
      // Void and Forge page states
      responsiveMode: 'desktop',
      zoomLevel: 80,
      interactionMode: 'cursor',
      editMode: 'edit',
      inspectMode: false,
      
      // Navigation state for Forge/Source
      activeNav: 'Forge',
      
      // Panel states - now with default states for the 4 panels
      panelStates: {
        'frames-panel': false,        // Button 2 - Frames Panel
        'files-panel': false,         // Button 3 - Project Files Panel  
        'code-panel': false,          // Button 4 - Code Handler Panel
        'team-panel': false           // Button 5 - Team Collaboration Panel
      },
      
      // Actions
      setResponsiveMode: (mode) => set({ responsiveMode: mode }),
      
      setZoomLevel: (level) => set({ zoomLevel: level }),
      
      setInteractionMode: (mode) => set({ interactionMode: mode }),
      
      setEditMode: (mode) => set({ editMode: mode }),
      
      setInspectMode: (mode) => set({ inspectMode: mode }),
      
      setActiveNav: (nav) => set({ activeNav: nav }),
      
      // Enhanced panel actions
      togglePanel: (panelId) => {
        set((state) => {
          const newPanelStates = {
            ...state.panelStates,
            [panelId]: !state.panelStates[panelId]
          }
          
          // Log for debugging
          console.log(`Toggling panel ${panelId}: ${state.panelStates[panelId]} -> ${newPanelStates[panelId]}`)
          
          return { panelStates: newPanelStates }
        })
      },
      
      setPanelState: (panelId, isOpen) => set((state) => ({
        panelStates: {
          ...state.panelStates,
          [panelId]: isOpen
        }
      })),
      
      // Close all panels
      closeAllPanels: () => set((state) => ({
        panelStates: Object.keys(state.panelStates).reduce((acc, key) => {
          acc[key] = false
          return acc
        }, {})
      })),
      
      // Open specific panel and close others (exclusive mode)
      openPanelExclusive: (panelId) => set((state) => ({
        panelStates: Object.keys(state.panelStates).reduce((acc, key) => {
          acc[key] = key === panelId
          return acc
        }, {})
      })),
      
      // Get panel state helper
      isPanelOpen: (panelId) => {
        return get().panelStates[panelId] || false
      },
      
      // Get count of open panels
      getOpenPanelsCount: () => {
        const { panelStates } = get()
        return Object.values(panelStates).filter(Boolean).length
      },
      
      // Initialize navigation state from URL
      initializeNavFromUrl: (url) => {
        if (url.includes('/modeForge')) {
          set({ activeNav: 'Forge' })
        } else if (url.includes('/modeSource')) {
          set({ activeNav: 'Source' })
        }
      },
      
      // Reset states for page transitions
      resetForPage: (pageName) => {
        if (pageName === 'forge') {
          set({ 
            activeNav: 'Forge',
            inspectMode: false,
            editMode: 'edit'
          })
        } else if (pageName === 'source') {
          set({ 
            activeNav: 'Source',
            inspectMode: false,
            editMode: 'edit'
          })
        } else if (pageName === 'void') {
          set({
            responsiveMode: 'desktop',
            zoomLevel: 80,
            interactionMode: 'cursor'
          })
        }
      }
    }),
    {
      name: 'decode-editor-storage', // localStorage key (Note: This won't work in Claude artifacts)
      partialize: (state) => ({
        // Only persist panel states and some UI preferences
        panelStates: state.panelStates,
        responsiveMode: state.responsiveMode,
        zoomLevel: state.zoomLevel
      })
    }
  )
)

export { useEditorStore }