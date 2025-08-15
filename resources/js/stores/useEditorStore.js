// stores/useEditorStore.js
import { create } from 'zustand'

const useEditorStore = create((set, get) => ({
  // Void and Forge page states
  responsiveMode: 'desktop',
  zoomLevel: 80,
  interactionMode: 'cursor',
  editMode: 'edit',
  inspectMode: false,
  
  // Navigation state for Forge/Source
  activeNav: 'Forge',
  
  // Panel states
  panelStates: {},
  
  // Actions
  setResponsiveMode: (mode) => set({ responsiveMode: mode }),
  
  setZoomLevel: (level) => set({ zoomLevel: level }),
  
  setInteractionMode: (mode) => set({ interactionMode: mode }),
  
  setEditMode: (mode) => set({ editMode: mode }),
  
  setInspectMode: (mode) => set({ inspectMode: mode }),
  
  setActiveNav: (nav) => set({ activeNav: nav }),
  
  // Panel actions
  togglePanel: (panelId) => set((state) => ({
    panelStates: {
      ...state.panelStates,
      [panelId]: !state.panelStates[panelId]
    }
  })),
  
  setPanelState: (panelId, isOpen) => set((state) => ({
    panelStates: {
      ...state.panelStates,
      [panelId]: isOpen
    }
  })),
  
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
}))

export { useEditorStore }