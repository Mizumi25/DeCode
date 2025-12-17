import { create } from 'zustand';

const useCodePanelStore = create((set) => ({
  // Code style tabs visibility
  showCodeStyleTabs: true,
  
  // Actions
  setShowCodeStyleTabs: (show) => set({ showCodeStyleTabs: show }),
  toggleCodeStyleTabs: () => set((state) => ({ showCodeStyleTabs: !state.showCodeStyleTabs })),
}));

export default useCodePanelStore;