// COMPLETE REPLACEMENT for useUndoRedoStore.js

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

// Create the main store with persistence
export const useUndoRedoStore = create(
  persist(
    (set, get) => ({
      // History stacks per frame - ONLY serializable data
      frameHistories: {},
      
      // Current frame being tracked
      currentFrame: null,
      
      // Settings
      maxHistorySize: 50,
      autoSaveInterval: 5000,
      
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
                redoStack: []
              }
            },
            currentFrame: frameId
          }))
          console.log('Initialized frame history for:', frameId)
        } else {
          set({ currentFrame: frameId })
        }
      },
      
      // Push state to history
      pushHistory: (frameId, components, action = 'update') => {
        if (!frameId || !Array.isArray(components)) return
        
        set((state) => {
          const frameHistory = state.frameHistories[frameId] || { undoStack: [], redoStack: [] }
          
          // Create serializable history entry
          const historyEntry = {
            components: JSON.parse(JSON.stringify(components)),
            action,
            timestamp: Date.now(),
            id: `${action}_${Date.now()}`
          }
          
          // Add to undo stack with size limit
          const newUndoStack = [...frameHistory.undoStack, historyEntry]
            .slice(-state.maxHistorySize)
          
          return {
            frameHistories: {
              ...state.frameHistories,
              [frameId]: {
                undoStack: newUndoStack,
                redoStack: [] // Clear redo stack on new action
              }
            }
          }
        })
      },
      
      // Undo operation
      undo: (frameId) => {
        const state = get()
        const frameHistory = state.frameHistories[frameId]
        
        if (!frameHistory || frameHistory.undoStack.length <= 1) {
          return null
        }
        
        const currentState = frameHistory.undoStack[frameHistory.undoStack.length - 1]
        const previousState = frameHistory.undoStack[frameHistory.undoStack.length - 2]
        
        set((state) => ({
          frameHistories: {
            ...state.frameHistories,
            [frameId]: {
              undoStack: frameHistory.undoStack.slice(0, -1),
              redoStack: [...frameHistory.redoStack, currentState]
            }
          }
        }))
        
        return previousState.components
      },
      
      // Redo operation
      redo: (frameId) => {
        const state = get()
        const frameHistory = state.frameHistories[frameId]
        
        if (!frameHistory || frameHistory.redoStack.length === 0) {
          return null
        }
        
        const stateToRestore = frameHistory.redoStack[frameHistory.redoStack.length - 1]
        
        set((state) => ({
          frameHistories: {
            ...state.frameHistories,
            [frameId]: {
              undoStack: [...frameHistory.undoStack, stateToRestore],
              redoStack: frameHistory.redoStack.slice(0, -1)
            }
          }
        }))
        
        return stateToRestore.components
      },
      
      // Check if undo is available
      canUndo: (frameId) => {
        const state = get()
        const frameHistory = state.frameHistories[frameId]
        return frameHistory && frameHistory.undoStack.length > 1
      },
      
      // Check if redo is available
      canRedo: (frameId) => {
        const state = get()
        const frameHistory = state.frameHistories[frameId]
        return frameHistory && frameHistory.redoStack.length > 0
      },
      
      // Get history info
      getHistoryInfo: (frameId) => {
        const state = get()
        const frameHistory = state.frameHistories[frameId]
        
        if (!frameHistory) {
          return { undoCount: 0, redoCount: 0, canUndo: false, canRedo: false }
        }
        
        return {
          undoCount: frameHistory.undoStack.length,
          redoCount: frameHistory.redoStack.length,
          canUndo: frameHistory.undoStack.length > 1,
          canRedo: frameHistory.redoStack.length > 0,
          lastAction: frameHistory.undoStack[frameHistory.undoStack.length - 1]?.action
        }
      },
      
      // Clear history for frame
      clearHistory: (frameId) => set((state) => ({
        frameHistories: {
          ...state.frameHistories,
          [frameId]: {
            undoStack: [],
            redoStack: []
          }
        }
      }))
    }),
    {
      name: 'undo-redo-store',
      version: 1,
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
const originalStore = useUndoRedoStore.getState()

useUndoRedoStore.setState({
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
        const { saveToDatabase } = useUndoRedoStore.getState()
        await saveToDatabase(projectId, frameId, components)
        console.log(`Auto-saved frame ${frameId} to database`)
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, saveDelay)
  },
  
  // Manual save with revision
  manualSave: async (projectId, frameId, components, title = null) => {
    try {
      const { saveToDatabase } = useUndoRedoStore.getState()
      await saveToDatabase(projectId, frameId, components, true)
      
      if (title) {
        await axios.post('/api/project-components/create-revision', {
          project_id: projectId,
          frame_id: frameId,
          title: title,
          description: `Manual save: ${title}`
        })
      }
      
      return true
    } catch (error) {
      console.error('Manual save failed:', error)
      throw error
    }
  }
})

export default useUndoRedoStore