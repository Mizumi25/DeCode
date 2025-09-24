import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useIconStore = create(
  persist(
    (set, get) => ({
      // Panel state
      isIconPanelOpen: false,
      activeTab: 'heroicons',
      searchTerm: '',
      
      // Custom SVGs
      customSvgs: [],
      
      // SVG Editor
      svgEditor: {
        isOpen: false,
        svgCode: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="12" cy="12" r="10"/>
  <polyline points="12,6 12,12 16,14"/>
</svg>`,
        name: 'Custom Icon'
      },
      
      // Actions
      toggleIconPanel: () => set((state) => ({
        isIconPanelOpen: !state.isIconPanelOpen
      })),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSearchTerm: (term) => set({ searchTerm: term }),
      
      addCustomSvg: (svg) => set((state) => ({
        customSvgs: [...state.customSvgs, { ...svg, id: Date.now() }]
      })),
      
      removeCustomSvg: (id) => set((state) => ({
        customSvgs: state.customSvgs.filter(svg => svg.id !== id)
      })),
      
      setSvgEditor: (editor) => set({ svgEditor: editor }),
      
      closeIconPanel: () => set({ isIconPanelOpen: false }),
      
      // Reset state
      resetIconState: () => set({
        activeTab: 'heroicons',
        searchTerm: '',
        svgEditor: {
          isOpen: false,
          svgCode: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="12" cy="12" r="10"/>
  <polyline points="12,6 12,12 16,14"/>
</svg>`,
          name: 'Custom Icon'
        }
      })
    }),
    {
      name: 'icon-store',
      partialize: (state) => ({
        customSvgs: state.customSvgs,
        activeTab: state.activeTab
      })
    }
  )
)