// stores/useEditorStore.js - Enhanced with proper responsive mode persistence
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
      gridVisible: false,
      
      // Navigation state for Forge/Source
      activeNav: 'Forge',
      
      // Panel states - now with default states for the 4 panels
      panelStates: {
        'frames-panel': false,        // Button 2 - Frames Panel
        'files-panel': false,         // Button 3 - Project Files Panel  
        'code-panel': false,          // Button 4 - Code Handler Panel
        'team-panel': false           // Button 5 - Team Collaboration Panel
      },
      
      // Canvas dimensions based on responsive mode (for persistence)
      canvasDimensions: {
        desktop: { width: '100%', maxWidth: '100%', height: '100%', minHeight: '400px' },
        tablet: { width: '768px', maxWidth: '768px', height: '1024px', minHeight: '1024px' },
        mobile: { width: '375px', maxWidth: '375px', height: '667px', minHeight: '667px' }
      },
      
      // Actions
      setResponsiveMode: (mode) => {
        console.log(`EditorStore: Setting responsive mode to ${mode}`);
        set({ responsiveMode: mode });
        
        // Trigger canvas update event for components that need to respond
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('responsive-mode-changed', { 
            detail: { mode, timestamp: Date.now() } 
          }));
        }
      },
      
      // Get current canvas dimensions based on responsive mode
      getCurrentCanvasDimensions: () => {
        const { responsiveMode, canvasDimensions } = get();
        return canvasDimensions[responsiveMode] || canvasDimensions.desktop;
      },
      
      // Get responsive scale factor for components
      getResponsiveScaleFactor: () => {
        const { responsiveMode } = get();
        switch (responsiveMode) {
          case 'mobile':
            return 0.8;
          case 'tablet':
            return 0.9;
          case 'desktop':
          default:
            return 1;
        }
      },
      
      // Get responsive device info
      getResponsiveDeviceInfo: () => {
        const { responsiveMode } = get();
        
        const deviceInfo = {
          mobile: { 
            width: 375, 
            height: 667, 
            maxWidth: 375, 
            deviceName: 'iPhone SE',
            icon: 'Smartphone',
            breakpoint: 'max-width: 767px'
          },
          tablet: { 
            width: 768, 
            height: 1024, 
            maxWidth: 768, 
            deviceName: 'iPad',
            icon: 'Tablet',
            breakpoint: 'min-width: 768px and max-width: 1023px'
          },
          desktop: { 
            width: 1200, 
            height: 800, 
            maxWidth: '100%', 
            deviceName: 'Desktop',
            icon: 'Monitor',
            breakpoint: 'min-width: 1024px'
          }
        };
        
        return deviceInfo[responsiveMode] || deviceInfo.desktop;
      },
      
      // Toggle between responsive modes (cycle through them)
      cycleResponsiveMode: () => {
        const { responsiveMode } = get();
        const modes = ['desktop', 'tablet', 'mobile'];
        const currentIndex = modes.indexOf(responsiveMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        const nextMode = modes[nextIndex];
        
        console.log(`EditorStore: Cycling responsive mode from ${responsiveMode} to ${nextMode}`);
        get().setResponsiveMode(nextMode);
      },
      
      // Check if current mode is mobile
      isMobileMode: () => {
        return get().responsiveMode === 'mobile';
      },
      
      // Check if current mode is tablet
      isTabletMode: () => {
        return get().responsiveMode === 'tablet';
      },
      
      // Check if current mode is desktop
      isDesktopMode: () => {
        return get().responsiveMode === 'desktop';
      },
      
      // Get responsive CSS classes for canvas
      getResponsiveCanvasClasses: () => {
        const { responsiveMode } = get();
        
        const baseClasses = 'transition-all duration-500 ease-in-out mx-auto';
        
        switch (responsiveMode) {
          case 'mobile':
            return `${baseClasses} border-purple-400 shadow-lg rounded-lg`;
          case 'tablet':
            return `${baseClasses} border-blue-400 shadow-lg rounded-lg`;
          case 'desktop':
          default:
            return `${baseClasses} border-gray-300 border-dashed`;
        }
      },
      
      // Get responsive grid background
      getResponsiveGridBackground: () => {
        const { responsiveMode, gridVisible } = get();
        
        if (!gridVisible || responsiveMode === 'desktop') {
          return {};
        }
        
        const gridSize = responsiveMode === 'mobile' ? '20px' : '24px';
        const gridColor = responsiveMode === 'mobile' ? '#A052FF' : '#3B82F6';
        
        return {
          backgroundImage: `
            linear-gradient(to right, ${gridColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize} ${gridSize}`,
          opacity: 0.1
        };
      },
      
      setZoomLevel: (level) => {
        const clampedLevel = Math.max(25, Math.min(200, level));
        console.log(`EditorStore: Setting zoom level to ${clampedLevel}%`);
        set({ zoomLevel: clampedLevel });
      },
      
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
          console.log(`EditorStore: Toggling panel ${panelId}: ${state.panelStates[panelId]} -> ${newPanelStates[panelId]}`)
          
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
      
      setGridVisible: (visible) => {
        console.log(`EditorStore: Setting grid visibility to ${visible}`);
        set({ gridVisible: visible });
      },
      
      toggleGridVisible: () => set((state) => { 
        const newVisible = !state.gridVisible;
        console.log(`EditorStore: Toggling grid visibility to ${newVisible}`);
        return { gridVisible: newVisible };
      }),
      
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
      
      // Initialize responsive mode from localStorage or default
      initializeResponsiveMode: () => {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('decode-editor-storage');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              const mode = parsed?.state?.responsiveMode || 'desktop';
              console.log(`EditorStore: Initializing responsive mode from storage: ${mode}`);
              set({ responsiveMode: mode });
            } catch (error) {
              console.warn('EditorStore: Failed to parse stored responsive mode, using desktop');
              set({ responsiveMode: 'desktop' });
            }
          }
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
            responsiveMode: get().responsiveMode, // Keep current responsive mode
            zoomLevel: 80,
            interactionMode: 'cursor'
          })
        }
      },
      
      // Debug helper
      debugCurrentState: () => {
        const state = get();
        console.log('=== EDITOR STORE DEBUG ===');
        console.log('Responsive Mode:', state.responsiveMode);
        console.log('Canvas Dimensions:', state.getCurrentCanvasDimensions());
        console.log('Device Info:', state.getResponsiveDeviceInfo());
        console.log('Scale Factor:', state.getResponsiveScaleFactor());
        console.log('Zoom Level:', state.zoomLevel);
        console.log('Grid Visible:', state.gridVisible);
        console.log('Panel States:', state.panelStates);
        console.log('==========================');
      }
    }),
    {
      name: 'decode-editor-storage', // localStorage key
      version: 2, // Increment for schema changes
      partialize: (state) => ({
        // Persist all UI preferences including responsive mode
        panelStates: state.panelStates,
        responsiveMode: state.responsiveMode,
        zoomLevel: state.zoomLevel,
        gridVisible: state.gridVisible,
        interactionMode: state.interactionMode,
        canvasDimensions: state.canvasDimensions
      }),
      // Handle version migration
      migrate: (persistedState, version) => {
        if (version === 0 || version === 1) {
          // Ensure we have all required fields
          return {
            ...persistedState,
            responsiveMode: persistedState.responsiveMode || 'desktop',
            canvasDimensions: persistedState.canvasDimensions || {
              desktop: { width: '100%', maxWidth: '100%', height: '100%', minHeight: '400px' },
              tablet: { width: '768px', maxWidth: '768px', height: '1024px', minHeight: '1024px' },
              mobile: { width: '375px', maxWidth: '375px', height: '667px', minHeight: '667px' }
            }
          };
        }
        return persistedState;
      }
    }
  )
)

export { useEditorStore }