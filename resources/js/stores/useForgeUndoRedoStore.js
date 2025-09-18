// @/stores/useForgeUndoRedoStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

// Create the main store with persistence - Figma/Framer style
export const useForgeUndoRedoStore = create(
  persist(
    (set, get) => ({
      // History stacks per frame - ONLY serializable data
      frameHistories: {},
      
      // Current frame being tracked
      currentFrame: null,
      
      // Settings
      maxHistorySize: 100, // Increased for better UX like Figma
      autoSaveInterval: 3000, // 3 seconds
      
      // Action types for better tracking
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
      
      // Initialize frame history
      initializeFrame: (frameId) => {
        if (!frameId) return;
        
        const state = get()
        if (!state.frameHistories[frameId]) {
          set((state) => ({
            frameHistories: {
              ...state.frameHistories,
              [frameId]: {
                undoStack: [],
                redoStack: [],
                currentIndex: -1,
                lastSavedIndex: -1
              }
            },
            currentFrame: frameId
          }))
          console.log('ForgeUndoRedo: Initialized frame history for:', frameId)
        } else {
          set({ currentFrame: frameId })
        }
      },
      
      // Push state to history - Enhanced for all actions
      pushHistory: (frameId, components, actionType = 'update', actionData = null) => {
        if (!frameId || !Array.isArray(components)) return
        
        const state = get()
        const frameHistory = state.frameHistories[frameId] || { 
          undoStack: [], 
          redoStack: [], 
          currentIndex: -1,
          lastSavedIndex: -1
        }
        
        // Create serializable history entry with more detail
        const historyEntry = {
          components: JSON.parse(JSON.stringify(components)),
          action: actionType,
          timestamp: Date.now(),
          id: `${actionType}_${Date.now()}`,
          actionData: actionData ? JSON.parse(JSON.stringify(actionData)) : null,
          description: get().getActionDescription(actionType, actionData)
        }
        
        // Remove any entries after current index (when we're in middle of undo stack)
        const newUndoStack = [
          ...frameHistory.undoStack.slice(0, frameHistory.currentIndex + 1),
          historyEntry
        ].slice(-state.maxHistorySize) // Keep size limit
        
        const newCurrentIndex = newUndoStack.length - 1
        
        set((state) => ({
          frameHistories: {
            ...state.frameHistories,
            [frameId]: {
              undoStack: newUndoStack,
              redoStack: [], // Clear redo stack on new action
              currentIndex: newCurrentIndex,
              lastSavedIndex: frameHistory.lastSavedIndex
            }
          }
        }))
        
        console.log(`ForgeUndoRedo: Pushed ${actionType} to history. Stack size: ${newUndoStack.length}`)
      },
      
      // Undo operation - Enhanced
      undo: (frameId) => {
        const state = get()
        const frameHistory = state.frameHistories[frameId]
        
        if (!frameHistory || frameHistory.currentIndex <= 0) {
          console.log('ForgeUndoRedo: Cannot undo - at beginning of history')
          return null
        }
        
        const newCurrentIndex = frameHistory.currentIndex - 1
        const targetEntry = frameHistory.undoStack[newCurrentIndex]
        
        console.log(`ForgeUndoRedo: Undoing to: ${targetEntry.description}`)
        
        set((state) => ({
          frameHistories: {
            ...state.frameHistories,
            [frameId]: {
              ...frameHistory,
              currentIndex: newCurrentIndex
            }
          }
        }))
        
        return targetEntry.components
      },
      
      // Redo operation - Enhanced
      redo: (frameId) => {
        const state = get()
        const frameHistory = state.frameHistories[frameId]
        
        if (!frameHistory || frameHistory.currentIndex >= frameHistory.undoStack.length - 1) {
          console.log('ForgeUndoRedo: Cannot redo - at end of history')
          return null
        }
        
        const newCurrentIndex = frameHistory.currentIndex + 1
        const targetEntry = frameHistory.undoStack[newCurrentIndex]
        
        console.log(`ForgeUndoRedo: Redoing to: ${targetEntry.description}`)
        
        set((state) => ({
          frameHistories: {
            ...state.frameHistories,
            [frameId]: {
              ...frameHistory,
              currentIndex: newCurrentIndex
            }
          }
        }))
        
        return targetEntry.components
      },
      
      // Check if undo is available
      canUndo: (frameId) => {
        const state = get()
        const frameHistory = state.frameHistories[frameId]
        return frameHistory && frameHistory.currentIndex > 0
      },
      
      // Check if redo is available
      canRedo: (frameId) => {
        const state = get()
        const frameHistory = state.frameHistories[frameId]
        return frameHistory && frameHistory.currentIndex < frameHistory.undoStack.length - 1
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
      
      // Get history info with more details
      getHistoryInfo: (frameId) => {
        const state = get()
        const frameHistory = state.frameHistories[frameId]
        
        if (!frameHistory) {
          return { 
            undoCount: 0, 
            redoCount: 0, 
            canUndo: false, 
            canRedo: false,
            hasUnsavedChanges: false,
            currentAction: null
          }
        }
        
        const currentEntry = frameHistory.undoStack[frameHistory.currentIndex]
        
        return {
          undoCount: frameHistory.currentIndex + 1,
          redoCount: frameHistory.undoStack.length - frameHistory.currentIndex - 1,
          canUndo: frameHistory.currentIndex > 0,
          canRedo: frameHistory.currentIndex < frameHistory.undoStack.length - 1,
          hasUnsavedChanges: frameHistory.currentIndex !== frameHistory.lastSavedIndex,
          currentAction: currentEntry ? currentEntry.description : null,
          totalActions: frameHistory.undoStack.length
        }
      },
      
      // Get action description for better UX
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
            lastSavedIndex: -1
          }
        }
      }))
    }),
    {
      name: 'forge-undo-redo-store',
      version: 2,
      // Only persist serializable data
      partialize: (state) => ({
        frameHistories: state.frameHistories,
        currentFrame: state.currentFrame,
        maxHistorySize: state.maxHistorySize,
        autoSaveInterval: state.autoSaveInterval
      })
    }
  )
)

// Add non-persisted functions after store creation
let autoSaveTimeouts = {}

// Extend the store with non-persistent methods
const originalStore = useForgeUndoRedoStore.getState()

useForgeUndoRedoStore.setState({
  // Database save functionality
  saveToDatabase: async (projectId, frameId, components, createRevision = false) => {
    try {
      const response = await axios.post('/api/project-components/bulk-update', {
        project_id: projectId,
        frame_id: frameId,
        components: components.map(comp => ({
          component_instance_id: comp.id,
          component_type: comp.type,
          props: comp.props || {},
          position: comp.position,
          name: comp.name,
          z_index: comp.zIndex || 0,
          variant: comp.variant || null,
          style: comp.style || {},
          animation: comp.animation || {}
        })),
        create_revision: createRevision
      })
      
      if (response.data.success) {
        // Mark as saved in local history
        const { markAsSaved } = useForgeUndoRedoStore.getState()
        markAsSaved(frameId)
      }
      
      return response.data.success
    } catch (error) {
      console.error('Failed to save to database:', error)
      throw error
    }
  },
  
  // Auto-save with throttling
  scheduleAutoSave: (projectId, frameId, components, delay = null) => {
    const saveDelay = delay || originalStore.autoSaveInterval
    
    // Clear existing timeout
    if (autoSaveTimeouts[frameId]) {
      clearTimeout(autoSaveTimeouts[frameId])
    }
    
    // Schedule new save
    autoSaveTimeouts[frameId] = setTimeout(async () => {
      try {
        const { saveToDatabase } = useForgeUndoRedoStore.getState()
        await saveToDatabase(projectId, frameId, components)
        console.log(`ForgeUndoRedo: Auto-saved frame ${frameId} to database`)
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, saveDelay)
  },
  
  // Manual save with revision - for the "Saved" button
  manualSave: async (projectId, frameId, components, title = null) => {
    try {
      const { saveToDatabase } = useForgeUndoRedoStore.getState()
      await saveToDatabase(projectId, frameId, components, true)
      
      if (title) {
        await axios.post('/api/project-components/create-revision', {
          project_id: projectId,
          frame_id: frameId,
          title: title,
          description: `Manual save: ${title}`
        })
      }
      
      console.log('ForgeUndoRedo: Manual save with revision completed')
      return true
    } catch (error) {
      console.error('Manual save failed:', error)
      throw error
    }
  }
})

export default useForgeUndoRedoStore