// @/stores/useCanvasOverlayStore.js - NEW FILE
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCanvasOverlayStore = create(
  persist(
    (set, get) => ({
      // Overlay visibility settings
      overlays: {
        showSelectionBorders: true,
        showSnapGuides: true,
        showSpacingIndicators: true,
        showComponentFrames: true,
        showGridLines: false,
        showDistanceMeasurements: true,
        showDropZones: true,
        showNestedHighlight: true,
        // NEW: Component collision/reflow toggle
        enableComponentReflow: true, // When OFF, components won't move when hovering
      },

      // Toggle individual overlay
      toggleOverlay: (key) => {
        set((state) => ({
          overlays: {
            ...state.overlays,
            [key]: !state.overlays[key]
          }
        }));
        
        console.log(`Overlay ${key} toggled to:`, !get().overlays[key]);
        
        // Dispatch event for components to react
        window.dispatchEvent(new CustomEvent('canvas-overlay-changed', {
          detail: {
            setting: key,
            value: !get().overlays[key],
            allSettings: { ...get().overlays, [key]: !get().overlays[key] }
          }
        }));
      },

      // Set specific overlay value
      setOverlay: (key, value) => {
        set((state) => ({
          overlays: {
            ...state.overlays,
            [key]: value
          }
        }));
        
        window.dispatchEvent(new CustomEvent('canvas-overlay-changed', {
          detail: {
            setting: key,
            value: value,
            allSettings: { ...get().overlays, [key]: value }
          }
        }));
      },

      // Reset all to defaults
      resetOverlays: () => {
        const defaults = {
          showSelectionBorders: true,
          showSnapGuides: true,
          showSpacingIndicators: true,
          showComponentFrames: true,
          showGridLines: false,
          showDistanceMeasurements: true,
          showDropZones: true,
          showNestedHighlight: true,
          enableComponentReflow: true,
        };
        
        set({ overlays: defaults });
        
        window.dispatchEvent(new CustomEvent('canvas-overlay-changed', {
          detail: {
            reset: true,
            allSettings: defaults
          }
        }));
        
        console.log('Canvas overlays reset to defaults');
      },

      // Check if overlay is enabled
      isOverlayEnabled: (key) => {
        return get().overlays[key] || false;
      },

      // Get all overlay settings
      getAllOverlays: () => {
        return get().overlays;
      },

      // Count active overlays
      getActiveCount: () => {
        return Object.values(get().overlays).filter(Boolean).length;
      },
    }),
    {
      name: 'canvas-overlay-settings',
      version: 1,
    }
  )
);