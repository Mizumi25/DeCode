// stores/useCodeSyncStore.js - NEW FILE for code synchronization
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCodeSyncStore = create(
  persist(
    (set, get) => ({
      // Synced code state
      syncedCode: {
        react: '',
        html: '',
        css: '',
        tailwind: ''
      },
      
      // Code style preference
      codeStyle: 'react-tailwind',
      
      // Active tab
      activeCodeTab: 'react',
      
      // Last update timestamp
      lastUpdated: null,
      
      // Update synced code
      updateSyncedCode: (code) => {
        set({
          syncedCode: code,
          lastUpdated: Date.now()
        });
      },
      
      // Update code style
      setCodeStyle: (style) => {
        set({ codeStyle: style });
      },
      
      // Update active tab
      setActiveCodeTab: (tab) => {
        set({ activeCodeTab: tab });
      },
      
      // Get current code for active tab
      getCurrentCode: () => {
        const { syncedCode, activeCodeTab } = get();
        return syncedCode[activeCodeTab] || '';
      },
      
      // Clear synced code
      clearSyncedCode: () => {
        set({
          syncedCode: {
            react: '',
            html: '',
            css: '',
            tailwind: ''
          },
          lastUpdated: null
        });
      }
    }),
    {
      name: 'code-sync-storage',
      version: 1
    }
  )
);