// useForgeUndoRedoStore.js - Framer/Figma-style Undo/Redo with Reversible Actions
// This system uses action objects with do/undo functions, NOT state snapshots

import { create } from 'zustand'

export const useForgeUndoRedoStore = create((set, get) => ({
  // History stacks per frame AND responsive mode (in-memory only, NOT persisted to database)
  // Structure: frameHistories[frameId][responsiveMode] = { undoStack: [], redoStack: [] }
  frameHistories: {},
  
  // Current frame being tracked
  currentFrame: null,
  
  // Current responsive mode being tracked
  currentResponsiveMode: 'desktop',
  
  // Settings
  maxHistorySize: 50,
  
  // CRITICAL: Operation tracking to prevent conflicts
  operationInProgress: {},
  
  // Action types
  actionTypes: {
    CREATE: 'component_created',
    MOVE: 'component_moved',
    UPDATE_PROPS: 'props_updated',
    UPDATE_STYLE: 'style_updated',
    DELETE: 'component_deleted',
    REORDER: 'component_reordered',
  },
  
  // Initialize frame history with responsive modes
  initializeFrame: (frameId, responsiveMode = 'desktop') => {
    if (!frameId) {
      console.warn('UndoRedo: No frameId provided');
      return;
    }
    
    const state = get()
    if (!state.frameHistories[frameId]) {
      // 🔥 NEW: Create separate stacks for each responsive mode
      set((state) => ({
        frameHistories: {
          ...state.frameHistories,
          [frameId]: {
            desktop: { undoStack: [], redoStack: [] },
            tablet: { undoStack: [], redoStack: [] },
            mobile: { undoStack: [], redoStack: [] },
          }
        },
        currentFrame: frameId,
        currentResponsiveMode: responsiveMode,
        operationInProgress: {
          ...state.operationInProgress,
          [frameId]: false
        }
      }))
    } else {
      set({ currentFrame: frameId, currentResponsiveMode: responsiveMode })
    }
  },
  
  // 🔥 NEW: Set current responsive mode
  setResponsiveMode: (responsiveMode) => {
    set({ currentResponsiveMode: responsiveMode })
  },
  
  // Execute an action (adds to undo stack and executes it)
  executeAction: (frameId, action) => {
    if (!frameId || !action) {
      console.warn('UndoRedo: Invalid action');
      return;
    }
    
    const state = get()
    const responsiveMode = state.currentResponsiveMode || 'desktop'
    
    // Prevent pushing during undo/redo operations
    if (state.operationInProgress[frameId]) {
      console.log('UndoRedo: Operation in progress, skipping');
      return;
    }
    
    // 🔥 Get history for current responsive mode
    const frameHistory = state.frameHistories[frameId]
    if (!frameHistory || !frameHistory[responsiveMode]) {
      console.warn(`UndoRedo: Frame ${frameId} or mode ${responsiveMode} not initialized`);
      return;
    }
    
    const modeHistory = frameHistory[responsiveMode]
    
    // Execute the action's do function
    if (typeof action.do === 'function') {
      action.do();
    }
    
    // 🔥 Add to undo stack for CURRENT responsive mode
    const newUndoStack = [...modeHistory.undoStack, action].slice(-state.maxHistorySize)
    
    console.log(`✅ Action executed [${responsiveMode}]: ${action.type}`, { undoStack: newUndoStack.length });
    
    set((state) => ({
      frameHistories: {
        ...state.frameHistories,
        [frameId]: {
          ...state.frameHistories[frameId],
          [responsiveMode]: {
            undoStack: newUndoStack,
            redoStack: [], // Clear redo stack on new action
          }
        }
      }
    }))
    
    // Broadcast the action via WebSocket (if serialize exists)
    if (typeof action.serialize === 'function') {
      const serialized = action.serialize();
      // The caller should handle broadcasting
      return serialized;
    }
  },
  
  // Undo
  undo: (frameId) => {
    if (!frameId) {
      console.warn('UndoRedo: No frameId for undo');
      return null;
    }
    
    const state = get()
    const responsiveMode = state.currentResponsiveMode || 'desktop'
    const frameHistory = state.frameHistories[frameId]
    
    // 🔥 Check history for current responsive mode
    if (!frameHistory || !frameHistory[responsiveMode]) {
      console.log('UndoRedo: Frame or mode not initialized');
      return null;
    }
    
    const modeHistory = frameHistory[responsiveMode]
    
    if (modeHistory.undoStack.length === 0) {
      console.log(`UndoRedo: Nothing to undo in ${responsiveMode} mode`);
      return null;
    }
    
    // Mark operation in progress
    set((state) => ({
      operationInProgress: {
        ...state.operationInProgress,
        [frameId]: true
      }
    }));
    
    // 🔥 Pop from undo stack of current responsive mode
    const lastAction = modeHistory.undoStack[modeHistory.undoStack.length - 1];
    const newUndoStack = modeHistory.undoStack.slice(0, -1);
    
    console.log(`⏪ Undoing [${responsiveMode}]: ${lastAction.type}`);
    
    // Call the action's undo function
    if (typeof lastAction.undo === 'function') {
      lastAction.undo();
    }
    
    // Move action to redo stack
    const newRedoStack = [...modeHistory.redoStack, lastAction];
    
    set((state) => ({
      frameHistories: {
        ...state.frameHistories,
        [frameId]: {
          ...state.frameHistories[frameId],
          [responsiveMode]: {
            undoStack: newUndoStack,
            redoStack: newRedoStack,
          }
        }
      }
    }))
    
    // Clear operation flag
    setTimeout(() => {
      set((state) => ({
        operationInProgress: {
          ...state.operationInProgress,
          [frameId]: false
        }
      }));
    }, 100);
    
    // Return serialized undo action for broadcasting
    if (typeof lastAction.serializeUndo === 'function') {
      return lastAction.serializeUndo();
    }
    
    return null;
  },
  
  // Redo
  redo: (frameId) => {
    if (!frameId) {
      console.warn('UndoRedo: No frameId for redo');
      return null;
    }
    
    const state = get()
    const responsiveMode = state.currentResponsiveMode || 'desktop'
    const frameHistory = state.frameHistories[frameId]
    
    // 🔥 FIX: Check history for current responsive mode
    if (!frameHistory || !frameHistory[responsiveMode]) {
      console.log('UndoRedo: Frame or mode not initialized');
      return null;
    }
    
    const modeHistory = frameHistory[responsiveMode]
    
    if (modeHistory.redoStack.length === 0) {
      console.log(`UndoRedo: Nothing to redo in ${responsiveMode} mode`);
      return null;
    }
    
    // Mark operation in progress
    set((state) => ({
      operationInProgress: {
        ...state.operationInProgress,
        [frameId]: true
      }
    }));
    
    // 🔥 Pop from redo stack of current responsive mode
    const actionToRedo = modeHistory.redoStack[modeHistory.redoStack.length - 1];
    const newRedoStack = modeHistory.redoStack.slice(0, -1);
    
    console.log(`⏩ Redoing [${responsiveMode}]: ${actionToRedo.type}`);
    
    // Call the action's do function again
    if (typeof actionToRedo.do === 'function') {
      actionToRedo.do();
    }
    
    // Move action back to undo stack
    const newUndoStack = [...modeHistory.undoStack, actionToRedo];
    
    set((state) => ({
      frameHistories: {
        ...state.frameHistories,
        [frameId]: {
          ...state.frameHistories[frameId],
          [responsiveMode]: {
            undoStack: newUndoStack,
            redoStack: newRedoStack,
          }
        }
      }
    }))
    
    // Clear operation flag
    setTimeout(() => {
      set((state) => ({
        operationInProgress: {
          ...state.operationInProgress,
          [frameId]: false
        }
      }));
    }, 100);
    
    // Return serialized action for broadcasting
    if (typeof actionToRedo.serialize === 'function') {
      return actionToRedo.serialize();
    }
    
    return null;
  },
  
  // Can undo check
  canUndo: (frameId) => {
    if (!frameId) return false;
    
    const state = get()
    const responsiveMode = state.currentResponsiveMode || 'desktop'
    const frameHistory = state.frameHistories[frameId]
    
    // 🔥 FIX: Check current responsive mode's stack
    if (!frameHistory || !frameHistory[responsiveMode]) return false;
    
    return frameHistory[responsiveMode].undoStack.length > 0 && !state.operationInProgress[frameId];
  },
  
  // Can redo check
  canRedo: (frameId) => {
    if (!frameId) return false;
    
    const state = get()
    const responsiveMode = state.currentResponsiveMode || 'desktop'
    const frameHistory = state.frameHistories[frameId]
    
    // 🔥 FIX: Check current responsive mode's stack
    if (!frameHistory || !frameHistory[responsiveMode]) return false;
    
    return frameHistory[responsiveMode].redoStack.length > 0 && !state.operationInProgress[frameId];
  },
  
  // Get history info
  getHistoryInfo: (frameId) => {
    if (!frameId) {
      return { 
        undoCount: 0, 
        redoCount: 0, 
        canUndo: false, 
        canRedo: false,
        hasUnsavedChanges: false,
        responsiveMode: 'desktop',
      }
    }
    
    const state = get()
    const responsiveMode = state.currentResponsiveMode || 'desktop'
    const frameHistory = state.frameHistories[frameId]
    
    if (!frameHistory || !frameHistory[responsiveMode]) {
      return { 
        undoCount: 0, 
        redoCount: 0, 
        canUndo: false, 
        canRedo: false,
        hasUnsavedChanges: false,
        responsiveMode,
      }
    }
    
    const modeHistory = frameHistory[responsiveMode]
    
    return {
      undoCount: modeHistory.undoStack.length,
      redoCount: modeHistory.redoStack.length,
      canUndo: state.canUndo(frameId),
      canRedo: state.canRedo(frameId),
      hasUnsavedChanges: modeHistory.undoStack.length > 0, // Has changes if there's anything in undo stack
      operationInProgress: state.operationInProgress[frameId] || false,
      responsiveMode,
    };
  },
  
  // Check if there are unsaved changes
  hasUnsavedChanges: (frameId) => {
    const state = get()
    const responsiveMode = state.currentResponsiveMode || 'desktop'
    const frameHistory = state.frameHistories[frameId]
    
    // 🔥 FIX: Check current responsive mode's stack
    if (!frameHistory || !frameHistory[responsiveMode]) return false
    
    // Has unsaved changes if there's anything in the undo stack
    return frameHistory[responsiveMode].undoStack.length > 0
  },
  
  // Mark as saved (clears the "unsaved" state)
  markAsSaved: (frameId) => {
    // In the new system, "saved" means we can optionally clear the stack
    // or just acknowledge that current state is persisted
    // For now, we don't clear the stack because users still want undo history
    // This is mainly for UI indicators
    console.log('markAsSaved called for frame:', frameId);
  },
  
  // Manual save function (for compatibility)
  manualSave: async (projectId, frameId, components, title = null) => {
    console.log('manualSave called:', { projectId, frameId, componentsCount: components?.length, title });
    
    // This should trigger the actual save logic in your component
    // For now, it's a stub that the components can override or handle
    // The actual save happens in ForgePage via componentLibraryService
    
    try {
      // Import dynamically to avoid circular dependency
      const { default: componentLibraryService } = await import('@/Services/ComponentLibraryService');
      
      if (title) {
        // Save with title update
        await componentLibraryService.saveProjectWithTitle(projectId, frameId, components, title);
      } else {
        // Regular save
        await componentLibraryService.saveProjectComponents(projectId, frameId, components);
      }
      
      return true;
    } catch (error) {
      console.error('Manual save failed:', error);
      return false;
    }
  },
  
  // Clear history for a frame (clears all responsive modes)
  clearHistory: (frameId) => {
    if (!frameId) return
    
    set((state) => ({
      frameHistories: {
        ...state.frameHistories,
        [frameId]: {
          desktop: { undoStack: [], redoStack: [] },
          tablet: { undoStack: [], redoStack: [] },
          mobile: { undoStack: [], redoStack: [] },
        }
      }
    }))
  },
  
  // Legacy compatibility: pushHistory (deprecated but still functional)
  pushHistory: (frameId, components, actionType, actionData) => {
    if (!frameId || !actionType) {
      console.warn('UndoRedo pushHistory: Invalid parameters');
      return;
    }
    
    const state = get()
    const responsiveMode = state.currentResponsiveMode || 'desktop'
    
    // 🔥 FIX: Create a simple snapshot-based action for legacy calls
    // This allows old pushHistory calls to work with new per-mode system
    const action = {
      type: actionType,
      do: () => {
        // Already applied, no-op
        console.log(`📦 Legacy pushHistory [${responsiveMode}]: ${actionType}`);
      },
      undo: () => {
        // For legacy, we don't have undo capability (this is why it's deprecated)
        console.warn(`⚠️ Legacy pushHistory undo not implemented for: ${actionType}`);
      },
      serialize: () => ({ type: actionType, ...actionData }),
      serializeUndo: () => ({ type: actionType, ...actionData }),
    };
    
    // Use executeAction to add to the appropriate mode's stack
    // But skip the do() call since the change was already applied
    const frameHistory = state.frameHistories[frameId]
    if (!frameHistory || !frameHistory[responsiveMode]) {
      console.warn(`UndoRedo: Frame ${frameId} or mode ${responsiveMode} not initialized`);
      return;
    }
    
    const modeHistory = frameHistory[responsiveMode]
    const newUndoStack = [...modeHistory.undoStack, action].slice(-state.maxHistorySize)
    
    console.log(`✅ Legacy pushHistory added [${responsiveMode}]: ${actionType}`, { undoStack: newUndoStack.length });
    
    set((state) => ({
      frameHistories: {
        ...state.frameHistories,
        [frameId]: {
          ...state.frameHistories[frameId],
          [responsiveMode]: {
            undoStack: newUndoStack,
            redoStack: [], // Clear redo stack on new action
          }
        }
      }
    }))
  },
  
  // Legacy compatibility stubs
  scheduleAutoSave: () => {},
}))

export default useForgeUndoRedoStore;
