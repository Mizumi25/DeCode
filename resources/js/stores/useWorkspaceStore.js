// @/stores/useWorkspaceStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      // State
      workspaces: [],
      currentWorkspace: null,
      isLoading: false,
      error: null,

      // Actions
      setWorkspaces: (workspaces) => set({ workspaces }),
      
      setCurrentWorkspace: (workspace) => {
        set({ currentWorkspace: workspace })
        // Store in localStorage for persistence
        if (workspace) {
          localStorage.setItem('currentWorkspaceId', workspace.id.toString())
        }
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Initialize workspaces on app start
      initializeWorkspaces: async () => {
        const { isLoading } = get()
        if (isLoading) return // Prevent multiple concurrent calls

        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.get('/api/workspaces')
          
          if (response.data.success) {
            const workspaces = response.data.data
            set({ workspaces })

            // Set current workspace
            const storedWorkspaceId = localStorage.getItem('currentWorkspaceId')
            let currentWorkspace = null

            if (storedWorkspaceId) {
              currentWorkspace = workspaces.find(w => w.id.toString() === storedWorkspaceId)
            }

            // If no stored workspace or workspace not found, use personal workspace
            if (!currentWorkspace) {
              currentWorkspace = workspaces.find(w => w.type === 'personal') || workspaces[0]
            }

            set({ currentWorkspace })
          } else {
            throw new Error(response.data.message || 'Failed to fetch workspaces')
          }
        } catch (error) {
          console.error('Failed to fetch workspaces:', error)
          set({ error: error.response?.data?.message || error.message || 'Failed to fetch workspaces' })
        } finally {
          set({ isLoading: false })
        }
      },

      // Create new workspace
      createWorkspace: async (workspaceData) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.post('/api/workspaces', workspaceData)
          
          if (response.data.success) {
            const newWorkspace = response.data.data
            const { workspaces } = get()
            const updatedWorkspaces = [...workspaces, newWorkspace]
            
            set({ 
              workspaces: updatedWorkspaces,
              currentWorkspace: newWorkspace,
              isLoading: false
            })

            // Store as current workspace
            localStorage.setItem('currentWorkspaceId', newWorkspace.id.toString())
            
            return newWorkspace
          } else {
            throw new Error(response.data.message || 'Failed to create workspace')
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to create workspace'
          set({ error: errorMessage, isLoading: false })
          throw new Error(errorMessage)
        }
      },

      // Update workspace
      updateWorkspace: async (workspaceId, updateData) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.put(`/api/workspaces/${workspaceId}`, updateData)
          
          if (response.data.success) {
            const updatedWorkspace = response.data.data
            const { workspaces, currentWorkspace } = get()
            
            const updatedWorkspaces = workspaces.map(w => 
              w.id === workspaceId ? updatedWorkspace : w
            )
            
            const newCurrentWorkspace = currentWorkspace?.id === workspaceId 
              ? updatedWorkspace 
              : currentWorkspace
            
            set({ 
              workspaces: updatedWorkspaces,
              currentWorkspace: newCurrentWorkspace,
              isLoading: false
            })
            
            return updatedWorkspace
          } else {
            throw new Error(response.data.message || 'Failed to update workspace')
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to update workspace'
          set({ error: errorMessage, isLoading: false })
          throw new Error(errorMessage)
        }
      },

      // Delete workspace
      deleteWorkspace: async (workspaceId) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.delete(`/api/workspaces/${workspaceId}`)
          
          if (response.data.success) {
            const { workspaces, currentWorkspace } = get()
            const updatedWorkspaces = workspaces.filter(w => w.id !== workspaceId)
            
            // If deleting current workspace, switch to personal workspace
            let newCurrentWorkspace = currentWorkspace
            if (currentWorkspace?.id === workspaceId) {
              newCurrentWorkspace = updatedWorkspaces.find(w => w.type === 'personal') || updatedWorkspaces[0]
              if (newCurrentWorkspace) {
                localStorage.setItem('currentWorkspaceId', newCurrentWorkspace.id.toString())
              } else {
                localStorage.removeItem('currentWorkspaceId')
              }
            }
            
            set({ 
              workspaces: updatedWorkspaces,
              currentWorkspace: newCurrentWorkspace,
              isLoading: false
            })
            
            return true
          } else {
            throw new Error(response.data.message || 'Failed to delete workspace')
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to delete workspace'
          set({ error: errorMessage, isLoading: false })
          throw new Error(errorMessage)
        }
      },

      // Get workspace details
      getWorkspaceDetails: async (workspaceId) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.get(`/api/workspaces/${workspaceId}`)
          
          if (response.data.success) {
            const workspace = response.data.data
            const { workspaces } = get()
            
            // Update the workspace in the list
            const updatedWorkspaces = workspaces.map(w => 
              w.id === workspaceId ? { ...w, ...workspace } : w
            )
            
            set({ workspaces: updatedWorkspaces, isLoading: false })
            return workspace
          } else {
            throw new Error(response.data.message || 'Failed to fetch workspace details')
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch workspace details'
          set({ error: errorMessage, isLoading: false })
          throw new Error(errorMessage)
        }
      },

      // Update user role in workspace
      updateUserRole: async (workspaceId, userId, role) => {
        set({ error: null })
        
        try {
          const response = await axios.put(`/api/workspaces/${workspaceId}/users/${userId}/role`, { role })
          
          if (response.data.success) {
            // Refresh workspace details
            await get().getWorkspaceDetails(workspaceId)
            return true
          } else {
            throw new Error(response.data.message || 'Failed to update user role')
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to update user role'
          set({ error: errorMessage })
          throw new Error(errorMessage)
        }
      },

      // Remove user from workspace
      removeUser: async (workspaceId, userId) => {
        set({ error: null })
        
        try {
          const response = await axios.delete(`/api/workspaces/${workspaceId}/users/${userId}`)
          
          if (response.data.success) {
            // Refresh workspace details
            await get().getWorkspaceDetails(workspaceId)
            return true
          } else {
            throw new Error(response.data.message || 'Failed to remove user')
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to remove user'
          set({ error: errorMessage })
          throw new Error(errorMessage)
        }
      },

      // Helper methods
      getWorkspaceById: (id) => {
        const { workspaces } = get()
        return workspaces.find(w => w.id === id)
      },

      getPersonalWorkspace: () => {
        const { workspaces } = get()
        return workspaces.find(w => w.type === 'personal')
      },

      canUserInvite: (workspaceId, userId) => {
        const workspace = get().getWorkspaceById(workspaceId)
        if (!workspace) return false
        
        const user = workspace.users?.find(u => u.id === userId)
        const userRole = user?.role || (workspace.owner?.id === userId ? 'owner' : null)
        
        return ['owner', 'editor'].includes(userRole)
      },

      canUserEdit: (workspaceId, userId) => {
        const workspace = get().getWorkspaceById(workspaceId)
        if (!workspace) return false
        
        const user = workspace.users?.find(u => u.id === userId)
        const userRole = user?.role || (workspace.owner?.id === userId ? 'owner' : null)
        
        return ['owner', 'editor'].includes(userRole)
      },

      isWorkspaceOwner: (workspaceId, userId) => {
        const workspace = get().getWorkspaceById(workspaceId)
        return workspace?.owner?.id === userId
      },

      // Reset store (for logout)
      reset: () => {
        localStorage.removeItem('currentWorkspaceId')
        set({
          workspaces: [],
          currentWorkspace: null,
          isLoading: false,
          error: null
        })
      }
    }),
    {
      name: 'workspace-store',
      partialize: (state) => ({
        // Only persist workspaces and currentWorkspace ID
        workspaces: state.workspaces,
        currentWorkspaceId: state.currentWorkspace?.id
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Restore currentWorkspace from ID
          if (state.currentWorkspaceId && state.workspaces) {
            const currentWorkspace = state.workspaces.find(w => w.id === state.currentWorkspaceId)
            if (currentWorkspace) {
              state.currentWorkspace = currentWorkspace
            }
          }
        }
      }
    }
  )
)

export { useWorkspaceStore }