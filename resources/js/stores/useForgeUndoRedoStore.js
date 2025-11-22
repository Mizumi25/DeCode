// FIXED: useForgeUndoRedoStore.js - Enhanced State Management for Reliable Undo/Redo

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

export const useForgeUndoRedoStore = create(
  persist(
    (set, get) => ({
      // History stacks per frame
      frameHistories: {},
      
      // Current frame being tracked
      currentFrame: null,
      
      // Settings
      maxHistorySize: 50, // Reduced for better performance
      autoSaveInterval: 3000,
      
      // CRITICAL: Operation tracking to prevent conflicts
      operationInProgress: {},
      
      // Action types
      actionTypes: {
        DROP: 'component_dropped',
        MOVE: 'component_moved',
        RESIZE: 'component_resized',
        STYLE_UPDATE: 'style_updated',
        PROP_UPDATE: 'prop_updated',
        DELETE: 'component_deleted',
        DUPLICATE: 'component_duplicated',
        INITIAL: 'initial_state'
      },
      
      // ENHANCED: Initialize frame history with better logging
      initializeFrame: (frameId) => {
        if (!frameId) {
          console.warn('ForgeUndoRedoStore: Cannot initialize frame - no frameId provided');
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
                currentIndex: -1,
                lastSavedIndex: -1,
                initialized: true
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
      
      // ENHANCED: Push history with conflict prevention
      pushHistory: (frameId, components, actionType = 'update', actionData = null) => {
        if (!frameId || !Array.isArray(components)) {
          
          return;
        }
        
        const state = get()
        
        // Prevent pushing during undo/redo operations
        if (state.operationInProgress[frameId]) {
          
          return;
        }
        
        const frameHistory = state.frameHistories[frameId] || { 
          undoStack: [], 
          redoStack: [], 
          currentIndex: -1,
          lastSavedIndex: -1,
          initialized: true
        }
        
        // CRITICAL: Deep clone components to prevent reference issues
        let clonedComponents;
        try {
          clonedComponents = JSON.parse(JSON.stringify(components));
        } catch (error) {
          console.error('ForgeUndoRedoStore: Failed to clone components:', error);
          return;
        }
        
        const historyEntry = {
          components: clonedComponents,
          action: actionType,
          timestamp: Date.now(),
          id: `${actionType}_${Date.now()}`,
          actionData: actionData ? JSON.parse(JSON.stringify(actionData)) : null,
          description: get().getActionDescription(actionType, actionData)
        }
        
        // Remove any entries after current index (when branching from middle of stack)
        const newUndoStack = [
          ...frameHistory.undoStack.slice(0, frameHistory.currentIndex + 1),
          historyEntry
        ].slice(-state.maxHistorySize)
        
        const newCurrentIndex = newUndoStack.length - 1
        
        
        
        set((state) => ({
          frameHistories: {
            ...state.frameHistories,
            [frameId]: {
              undoStack: newUndoStack,
              redoStack: [], // Clear redo stack on new action
              currentIndex: newCurrentIndex,
              lastSavedIndex: frameHistory.lastSavedIndex,
              initialized: true
            }
          }
        }))
      },
      
      // ENHANCED: Undo with operation tracking
      undo: (frameId) => {
        if (!frameId) {
          
          return null;
        }
        
        const state = get()
        const frameHistory = state.frameHistories[frameId]
        
        if (!frameHistory || frameHistory.currentIndex <= 0) {
          
          return null;
        }
        
        // Mark operation in progress
        set((state) => ({
          operationInProgress: {
            ...state.operationInProgress,
            [frameId]: true
          }
        }));
        
        const newCurrentIndex = frameHistory.currentIndex - 1
        const targetEntry = frameHistory.undoStack[newCurrentIndex]
        
        
        
        set((state) => ({
          frameHistories: {
            ...state.frameHistories,
            [frameId]: {
              ...frameHistory,
              currentIndex: newCurrentIndex
            }
          }
        }))
        
        // Clear operation flag after delay
        setTimeout(() => {
          set((state) => ({
            operationInProgress: {
              ...state.operationInProgress,
              [frameId]: false
            }
          }));
        }, 1000);
        
        // Return deep cloned components
        return JSON.parse(JSON.stringify(targetEntry.components));
      },
      
      // ENHANCED: Redo with operation tracking
      redo: (frameId) => {
        if (!frameId) {
          
          return null;
        }
        
        const state = get()
        const frameHistory = state.frameHistories[frameId]
        
        if (!frameHistory || frameHistory.currentIndex >= frameHistory.undoStack.length - 1) {
          
          return null;
        }
        
        // Mark operation in progress
        set((state) => ({
          operationInProgress: {
            ...state.operationInProgress,
            [frameId]: true
          }
        }));
        
        const newCurrentIndex = frameHistory.currentIndex + 1
        const targetEntry = frameHistory.undoStack[newCurrentIndex]
        
        
        
        set((state) => ({
          frameHistories: {
            ...state.frameHistories,
            [frameId]: {
              ...frameHistory,
              currentIndex: newCurrentIndex
            }
          }
        }))
        
        // Clear operation flag after delay
        setTimeout(() => {
          set((state) => ({
            operationInProgress: {
              ...state.operationInProgress,
              [frameId]: false
            }
          }));
        }, 1000);
        
        // Return deep cloned components
        return JSON.parse(JSON.stringify(targetEntry.components));
      },
      
      // ENHANCED: Can undo check with better validation
      canUndo: (frameId) => {
        if (!frameId) return false;
        
        const state = get()
        const frameHistory = state.frameHistories[frameId]
        
        if (!frameHistory || !frameHistory.initialized) {
          return false;
        }
        
        const canUndo = frameHistory.currentIndex > 0 && !state.operationInProgress[frameId];
        
        
        
        return canUndo;
      },
      
      // ENHANCED: Can redo check with better validation
      canRedo: (frameId) => {
        if (!frameId) return false;
        
        const state = get()
        const frameHistory = state.frameHistories[frameId]
        
        if (!frameHistory || !frameHistory.initialized) {
          return false;
        }
        
        const canRedo = frameHistory.currentIndex < frameHistory.undoStack.length - 1 && !state.operationInProgress[frameId];
        
        
        
        return canRedo;
      },
      
      // Check if there are unsaved changes
      hasUnsavedChanges: (frameId) => {
        const state = get()
        const frameHistory = state.frameHistories[frameId]
        if (!frameHistory) return false
        
        return frameHistory.currentIndex !== frameHistory.lastSavedIndex
      },
      
      // Mark current state as saved
      markAsSaved: (frameId) => {
        const state = get()
        const frameHistory = state.frameHistories[frameId]
        if (!frameHistory) return
        
        set((state) => ({
          frameHistories: {
            ...state.frameHistories,
            [frameId]: {
              ...frameHistory,
              lastSavedIndex: frameHistory.currentIndex
            }
          }
        }))
      },
      
      // ENHANCED: Get history info with comprehensive details
      getHistoryInfo: (frameId) => {
        if (!frameId) {
          return { 
            undoCount: 0, 
            redoCount: 0, 
            canUndo: false, 
            canRedo: false,
            hasUnsavedChanges: false,
            currentAction: null,
            totalActions: 0
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
            currentAction: null,
            totalActions: 0
          }
        }
        
        const currentEntry = frameHistory.undoStack[frameHistory.currentIndex]
        const canUndo = state.canUndo(frameId)
        const canRedo = state.canRedo(frameId)
        
        const info = {
          undoCount: frameHistory.currentIndex + 1,
          redoCount: frameHistory.undoStack.length - frameHistory.currentIndex - 1,
          canUndo,
          canRedo,
          hasUnsavedChanges: frameHistory.currentIndex !== frameHistory.lastSavedIndex,
          currentAction: currentEntry ? currentEntry.description : null,
          totalActions: frameHistory.undoStack.length,
          currentIndex: frameHistory.currentIndex,
          operationInProgress: state.operationInProgress[frameId] || false
        }
        
        
        
        return info;
      },
      
      // Get action description
      getActionDescription: (actionType, actionData) => {
        const descriptions = {
          component_dropped: `Drop ${actionData?.componentName || 'component'}`,
          component_moved: `Move ${actionData?.componentName || 'component'}`,
          component_resized: `Resize ${actionData?.componentName || 'component'}`,
          style_updated: `Update style of ${actionData?.componentName || 'component'}`,
          prop_updated: `Update ${actionData?.propName || 'property'} of ${actionData?.componentName || 'component'}`,
          component_deleted: `Delete ${actionData?.componentName || 'component'}`,
          component_duplicated: `Duplicate ${actionData?.componentName || 'component'}`,
          initial_state: 'Initial state'
        }
        
        return descriptions[actionType] || actionType
      },
      
      // Clear history for frame
      clearHistory: (frameId) => set((state) => ({
        frameHistories: {
          ...state.frameHistories,
          [frameId]: {
            undoStack: [],
            redoStack: [],
            currentIndex: -1,
            lastSavedIndex: -1,
            initialized: true
          }
        },
        operationInProgress: {
          ...state.operationInProgress,
          [frameId]: false
        }
      })),
      
      // ENHANCED: Debug helper
      debugFrameHistory: (frameId) => {
        const state = get()
        const frameHistory = state.frameHistories[frameId]
        
        if (!frameHistory) {
          
          return;
        }
        
   
      }
    }),
    {
      name: 'forge-undo-redo-store',
      version: 3, // Increment version for schema changes
      partialize: (state) => ({
        frameHistories: state.frameHistories,
        currentFrame: state.currentFrame,
        maxHistorySize: state.maxHistorySize,
        autoSaveInterval: state.autoSaveInterval
      })
    }
  )
)