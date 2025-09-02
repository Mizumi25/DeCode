// @/stores/useWorkspaceStore.js
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { router } from '@inertiajs/react'

export const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      // State
      currentWorkspace: null,
      workspaces: [],
      isLoading: false,
      error: null,

      // Actions
      setCurrentWorkspace: (workspace) => {
        set({ currentWorkspace: workspace })
        // Update URL if needed
        if (workspace && window.location.pathname === '/projects') {
          // You might want to update the URL to include workspace context
          // router.visit(`/workspaces/${workspace.id}/projects`, { preserveState: true })
        }
      },

      setWorkspaces: (workspaces) => {
        set({ workspaces })
        // If no current workspace is set, set the first one as current
        const { currentWorkspace } = get()
        if (!currentWorkspace && workspaces.length > 0) {
          get().setCurrentWorkspace(workspaces[0])
        }
      },

      addWorkspace: (workspace) => {
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
          currentWorkspace: workspace // Automatically switch to newly created workspace
        }))
      },

      updateWorkspace: (workspaceId, updates) => {
        set((state) => ({
          workspaces: state.workspaces.map(w => 
            w.id === workspaceId ? { ...w, ...updates } : w
          ),
          currentWorkspace: state.currentWorkspace?.id === workspaceId 
            ? { ...state.currentWorkspace, ...updates }
            : state.currentWorkspace
        }))
      },

      removeWorkspace: (workspaceId) => {
        set((state) => {
          const updatedWorkspaces = state.workspaces.filter(w => w.id !== workspaceId)
          const isCurrentWorkspace = state.currentWorkspace?.id === workspaceId
          
          return {
            workspaces: updatedWorkspaces,
            currentWorkspace: isCurrentWorkspace 
              ? (updatedWorkspaces.length > 0 ? updatedWorkspaces[0] : null)
              : state.currentWorkspace
          }
        })
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Initialize workspaces (call this on app load)
      initializeWorkspaces: async () => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await fetch('/api/workspaces', {
            headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          })
          
          if (!response.ok) throw new Error('Failed to fetch workspaces')
          
          const workspaces = await response.json()
          get().setWorkspaces(workspaces)
          
        } catch (error) {
          console.error('Failed to initialize workspaces:', error)
          set({ error: error.message })
        } finally {
          set({ isLoading: false })
        }
      },

      // Create new workspace
      createWorkspace: async (workspaceData) => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await fetch('/api/workspaces', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(workspaceData)
          })
          
          if (!response.ok) throw new Error('Failed to create workspace')
          
          const newWorkspace = await response.json()
          get().addWorkspace(newWorkspace)
          
          return newWorkspace
        } catch (error) {
          console.error('Failed to create workspace:', error)
          set({ error: error.message })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      // Get workspace by ID
      getWorkspaceById: (workspaceId) => {
        const { workspaces } = get()
        return workspaces.find(w => w.id === workspaceId) || null
      },

      // Check if user has access to workspace
      hasWorkspaceAccess: (workspaceId, userId) => {
        const workspace = get().getWorkspaceById(workspaceId)
        if (!workspace) return false
        
        return workspace.owner_id === userId || 
               workspace.users?.some(user => user.id === userId)
      }
    }),
    {
      name: 'workspace-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data
      partialize: (state) => ({
        currentWorkspace: state.currentWorkspace,
        workspaces: state.workspaces
      })
    }
  )
)