// useForgeUndoRedoStore.js - Framer/Figma-style Undo/Redo with Reversible Actions
// This system uses action objects with do/undo functions, NOT state snapshots

import { create } from 'zustand'

export const useForgeUndoRedoStore = create((set, get) => ({
  // History stacks per frame (in-memory only, NOT persisted to database)
  frameHistories: {},
  
  // Current frame being tracked
  currentFrame: null,
  
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
  
  // Initialize frame history
  initializeFrame: (frameId) => {
    if (!frameId) {
      console.warn('UndoRedo: No frameId provided');
      return;
    }
    
    const state = get()
    if (!state.frameHistories[frameId]) {
      set((state) => ({
        frameHistories: {
          ...state.frameHistories,
          [frameId]: {
            undoStack: [],
            redoStack: [],
          }
        },
        currentFrame: frameId,
        operationInProgress: {
          ...state.operationInProgress,
          [frameId]: false
        }
      }))
    } else {
      set({ currentFrame: frameId })
    }
  },
  
  // Execute an action (adds to undo stack and executes it)
  executeAction: (frameId, action) => {
    if (!frameId || !action) {
      console.warn('UndoRedo: Invalid action');
      return;
    }
    
    const state = get()
    
    // Prevent pushing during undo/redo operations
    if (state.operationInProgress[frameId]) {
      console.log('UndoRedo: Operation in progress, skipping');
      return;
    }
    
    const frameHistory = state.frameHistories[frameId] || { 
      undoStack: [], 
      redoStack: []
    }
    
    // Execute the action's do function
    if (typeof action.do === 'function') {
      action.do();
    }
    
    // Add to undo stack
    const newUndoStack = [...frameHistory.undoStack, action].slice(-state.maxHistorySize)
    
    console.log(`✅ Action executed: ${action.type}`, { undoStack: newUndoStack.length });
    
    set((state) => ({
      frameHistories: {
        ...state.frameHistories,
        [frameId]: {
          undoStack: newUndoStack,
          redoStack: [], // Clear redo stack on new action
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
    const frameHistory = state.frameHistories[frameId]
    
    if (!frameHistory || frameHistory.undoStack.length === 0) {
      console.log('UndoRedo: Nothing to undo');
      return null;
    }
    
    // Mark operation in progress
    set((state) => ({
      operationInProgress: {
        ...state.operationInProgress,
        [frameId]: true
      }
    }));
    
    // Pop from undo stack
    const lastAction = frameHistory.undoStack[frameHistory.undoStack.length - 1];
    const newUndoStack = frameHistory.undoStack.slice(0, -1);
    
    console.log(`⏪ Undoing: ${lastAction.type}`);
    
    // Call the action's undo function
    if (typeof lastAction.undo === 'function') {
      lastAction.undo();
    }
    
    // Move action to redo stack
    const newRedoStack = [...frameHistory.redoStack, lastAction];
    
    set((state) => ({
      frameHistories: {
        ...state.frameHistories,
        [frameId]: {
          undoStack: newUndoStack,
          redoStack: newRedoStack,
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
    const frameHistory = state.frameHistories[frameId]
    
    if (!frameHistory || frameHistory.redoStack.length === 0) {
      console.log('UndoRedo: Nothing to redo');
      return null;
    }
    
    // Mark operation in progress
    set((state) => ({
      operationInProgress: {
        ...state.operationInProgress,
        [frameId]: true
      }
    }));
    
    // Pop from redo stack
    const actionToRedo = frameHistory.redoStack[frameHistory.redoStack.length - 1];
    const newRedoStack = frameHistory.redoStack.slice(0, -1);
    
    console.log(`⏩ Redoing: ${actionToRedo.type}`);
    
    // Call the action's do function again
    if (typeof actionToRedo.do === 'function') {
      actionToRedo.do();
    }
    
    // Move action back to undo stack
    const newUndoStack = [...frameHistory.undoStack, actionToRedo];
    
    set((state) => ({
      frameHistories: {
        ...state.frameHistories,
        [frameId]: {
          undoStack: newUndoStack,
          redoStack: newRedoStack,
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
    const frameHistory = state.frameHistories[frameId]
    
    if (!frameHistory) return false;
    
    return frameHistory.undoStack.length > 0 && !state.operationInProgress[frameId];
  },
  
  // Can redo check
  canRedo: (frameId) => {
    if (!frameId) return false;
    
    const state = get()
    const frameHistory = state.frameHistories[frameId]
    
    if (!frameHistory) return false;
    
    return frameHistory.redoStack.length > 0 && !state.operationInProgress[frameId];
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
      }
    }
    
    const state = get()
    const frameHistory = state.frameHistories[frameId]
    
    if (!frameHistory) {
      return { 
        undoCount: 0, 
        redoCount: 0, 
        canUndo: false, 
        canRedo: false,
        hasUnsavedChanges: false,
      }
    }
    
    return {
      undoCount: frameHistory.undoStack.length,
      redoCount: frameHistory.redoStack.length,
      canUndo: state.canUndo(frameId),
      canRedo: state.canRedo(frameId),
      hasUnsavedChanges: frameHistory.undoStack.length > 0, // Has changes if there's anything in undo stack
      operationInProgress: state.operationInProgress[frameId] || false
    };
  },
  
  // Check if there are unsaved changes
  hasUnsavedChanges: (frameId) => {
    const state = get()
    const frameHistory = state.frameHistories[frameId]
    if (!frameHistory) return false
    
    // Has unsaved changes if there's anything in the undo stack
    return frameHistory.undoStack.length > 0
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
  
  // Clear history for a frame
  clearHistory: (frameId) => {
    if (!frameId) return
    
    set((state) => ({
      frameHistories: {
        ...state.frameHistories,
        [frameId]: {
          undoStack: [],
          redoStack: [],
        }
      }
    }))
  },
  
  // Legacy compatibility: pushHistory (deprecated but still functional)
  pushHistory: (frameId, components, actionType, actionData) => {
    // Silently ignore for now - this is legacy code that will be migrated later
    // The actual saving happens via componentLibraryService in the components
    // console.warn('⚠️ pushHistory is deprecated. Use executeAction with proper action objects.');
  },
  
  // Legacy compatibility stubs
  scheduleAutoSave: () => {},
}))

export default useForgeUndoRedoStore;
