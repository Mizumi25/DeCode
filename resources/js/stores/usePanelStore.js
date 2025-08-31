
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const usePanelStore = create(
  persist(
    (set, get) => ({
      // Panel states by page/context
      panelStates: {},
      
      // Save panel state for a specific page/context
      savePanelState: (pageId, panelState) => {
        set((state) => ({
          panelStates: {
            ...state.panelStates,
            [pageId]: {
              dockedPanels: panelState.dockedPanels,
              mergedStates: panelState.mergedStates,
              activeTab: panelState.activeTab,
              timestamp: Date.now()
            }
          }
        }))
      },
      
      // Get panel state for a specific page/context
      getPanelState: (pageId) => {
        return get().panelStates[pageId] || null
      },
      
      // Clear panel state for a specific page
      clearPanelState: (pageId) => {
        set((state) => {
          const newStates = { ...state.panelStates }
          delete newStates[pageId]
          return { panelStates: newStates }
        })
      }
    }),
    {
      name: 'decode-panel-storage',
      version: 1,
    }
  )
)