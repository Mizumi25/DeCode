import { create } from 'zustand'

export const useHeaderStore = create((set, get) => ({
  isHeaderVisible: true,
  isStyleModalOpen: false,
  
  // Initialize header visibility from localStorage
  initializeHeader: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('header-visible')
      if (stored !== null) {
        set({ isHeaderVisible: JSON.parse(stored) })
      }
    }
  },
  
  // Toggle header visibility and save to localStorage
  toggleHeaderVisibility: () => {
    const newState = !get().isHeaderVisible
    set({ isHeaderVisible: newState })
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('header-visible', JSON.stringify(newState))
    }
  },
  
  // Show header
  showHeader: () => {
    set({ isHeaderVisible: true })
    if (typeof window !== 'undefined') {
      localStorage.setItem('header-visible', 'true')
    }
  },
  
  // Hide header
  hideHeader: () => {
    set({ isHeaderVisible: false })
    if (typeof window !== 'undefined') {
      localStorage.setItem('header-visible', 'false')
    }
  },
  
  // Style modal controls
  openStyleModal: () => set({ isStyleModalOpen: true }),
  closeStyleModal: () => set({ isStyleModalOpen: false }),
  toggleStyleModal: () => set((state) => ({ isStyleModalOpen: !state.isStyleModalOpen })),

  // Export Modal
  isExportModalOpen: false,
  openExportModal: () => set({ isExportModalOpen: true }),
  closeExportModal: () => set({ isExportModalOpen: false }),
  toggleExportModal: () => set((state) => ({ isExportModalOpen: !state.isExportModalOpen })),
}))