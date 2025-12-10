// stores/useCodeSyncStore.js - NEW FILE for code synchronization
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

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
      
      // Current frame UUID for saving
      currentFrameUuid: null,
      
      // Set current frame
      setCurrentFrame: (frameUuid) => {
        set({ currentFrameUuid: frameUuid });
      },
      
      // Update synced code (and save to database)
      updateSyncedCode: async (code) => {
        const { currentFrameUuid } = get();
        
        // Update local state immediately
        set({
          syncedCode: code,
          lastUpdated: Date.now()
        });
        
        // Save to database in background
        if (currentFrameUuid) {
          try {
            await axios.put(`/api/frames/${currentFrameUuid}/generated-code`, {
              generated_code: code
            });
            console.log('✅ Generated code saved to database');
          } catch (error) {
            console.error('❌ Failed to save generated code to database:', error);
          }
        } else {
          console.warn('⚠️ No frame UUID set, code not saved to database');
        }
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