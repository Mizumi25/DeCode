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
      
      // Helper methods
      getWorkspaceById: (id) => {
        const { workspaces } = get()
        return workspaces.find(w => w.id === id)
      },
      
      getWorkspaceByUuid: (uuid) => {
        const { workspaces } = get()
        return workspaces.find(w => w.uuid === uuid)
      },
      
      // Update existing helper method
      getUserWorkspaces: (userId) => {
        const { workspaces } = get()
        return workspaces.filter(workspace => {
          if (workspace.owner?.id === userId) {
            return true
          }
          if (workspace.users?.some(user => user.id === userId)) {
            return true
          }
          return false
        })
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
            
            return { workspaces, currentWorkspace }
          } else {
            throw new Error(response.data.message || 'Failed to fetch workspaces')
          }
        } catch (error) {
          console.error('Failed to fetch workspaces:', error)
          set({ error: error.response?.data?.message || error.message || 'Failed to fetch workspaces' })
          return { workspaces: [], currentWorkspace: null }
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
            
            // Navigate to projects page with the new workspace to load its projects
            // Use setTimeout to ensure state updates are processed first
            setTimeout(() => {
              window.location.href = `/projects?workspace=${newWorkspace.uuid}`
            }, 100)
            
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

      // Update workspace with better handling for conversion
      updateWorkspace: async (workspaceUuid, updateData) => { // Changed parameter name for clarity
        set({ isLoading: true, error: null })
        
        try {
          console.log('Updating workspace:', workspaceUuid, updateData)
          
          // Use UUID in the API call
          const response = await axios.put(`/api/workspaces/${workspaceUuid}`, updateData)
          
          if (response.data.success) {
            const updatedWorkspace = response.data.data
            const { workspaces, currentWorkspace } = get()
            const wasConverted = response.data.converted
            const newPersonalWorkspace = response.data.new_personal_workspace
            
            console.log('Workspace updated successfully:', updatedWorkspace)
            console.log('Was converted:', wasConverted, 'New personal workspace:', newPersonalWorkspace)
            
            // Update the workspace in the workspaces array - match by UUID now
            let updatedWorkspaces = workspaces.map(w => 
              w.uuid === updatedWorkspace.uuid ? updatedWorkspace : w
            )
            
            // If backend created a new personal workspace during conversion, add it to the list
            if (newPersonalWorkspace) {
              console.log('Adding new personal workspace to list:', newPersonalWorkspace)
              updatedWorkspaces.push(newPersonalWorkspace)
            }
            
            // For workspace conversion, set the converted workspace as current
            let newCurrentWorkspace = currentWorkspace
            if (wasConverted && updatedWorkspace) {
              newCurrentWorkspace = updatedWorkspace
              // Store the ID for internal tracking, but use UUID for API calls
              localStorage.setItem('currentWorkspaceId', updatedWorkspace.id.toString())
              console.log('Set converted workspace as current:', updatedWorkspace.id)
            } else if (currentWorkspace?.uuid === updatedWorkspace.uuid) {
              newCurrentWorkspace = updatedWorkspace
            }
            
            set({ 
              workspaces: updatedWorkspaces,
              currentWorkspace: newCurrentWorkspace,
              isLoading: false
            })
            
            // Dispatch custom event for conversion to trigger invite modal
            if (wasConverted) {
              console.log('Dispatching workspace-converted event')
              window.dispatchEvent(new CustomEvent('workspace-converted', { 
                detail: { 
                  convertedWorkspaceId: updatedWorkspace.id,
                  convertedWorkspaceUuid: updatedWorkspace.uuid,
                  newType: updatedWorkspace.type,
                  shouldOpenInviteModal: true
                }
              }))
            }
            
            return {
              workspace: updatedWorkspace,
              converted: wasConverted,
              newPersonalWorkspace
            }
          } else {
            throw new Error(response.data.message || 'Failed to update workspace')
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to update workspace'
          console.error('Update workspace error:', errorMessage, error)
          set({ error: errorMessage, isLoading: false })
          throw new Error(errorMessage)
        }
      },
      
      // Also update these methods to use UUID:
      deleteWorkspace: async (workspaceUuid) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.delete(`/api/workspaces/${workspaceUuid}`)
          
          if (response.data.success) {
            const { workspaces, currentWorkspace } = get()
            const updatedWorkspaces = workspaces.filter(w => w.uuid !== workspaceUuid)
            
            // If deleting current workspace, switch to personal workspace
            let newCurrentWorkspace = currentWorkspace
            if (currentWorkspace?.uuid === workspaceUuid) {
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
      
      getWorkspaceDetails: async (workspaceUuid, forceRefresh = false) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.get(`/api/workspaces/${workspaceUuid}`)
          
          if (response.data.success) {
            const workspace = response.data.data
            const { workspaces, currentWorkspace } = get()
            
            // Update the workspace in the list
            const updatedWorkspaces = workspaces.map(w => 
              w.uuid === workspaceUuid ? { ...w, ...workspace } : w
            )
            
            // Update current workspace if it's the one being fetched
            const newCurrentWorkspace = currentWorkspace?.uuid === workspaceUuid 
              ? { ...currentWorkspace, ...workspace }
              : currentWorkspace
            
            set({ 
              workspaces: updatedWorkspaces,
              currentWorkspace: newCurrentWorkspace,
              isLoading: false 
            })
            
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
            await get().getWorkspaceDetails(workspaceId, true)
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
            await get().getWorkspaceDetails(workspaceId, true)
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

      // Helper method to refresh all workspace data
      refreshWorkspaces: async () => {
        try {
          const result = await get().initializeWorkspaces()
          return result
        } catch (error) {
          console.error('Failed to refresh workspaces:', error)
          return { workspaces: [], currentWorkspace: null }
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

      // Get workspaces where user has access (owner or member)
      getUserWorkspaces: (userId) => {
        const { workspaces } = get()
        return workspaces.filter(workspace => {
          // User is owner
          if (workspace.owner?.id === userId) {
            return true
          }
          // User is a member
          if (workspace.users?.some(user => user.id === userId)) {
            return true
          }
          return false
        })
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

      // Toggle workspace active status
      toggleWorkspaceActive: async (workspaceId, isActive) => {
        set({ error: null })
        try {
          await axios.patch(`/api/workspaces/${workspaceId}/toggle-active`, {
            is_active: isActive
          })
          await get().initializeWorkspaces()
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to toggle workspace'
          set({ error: errorMessage })
          throw new Error(errorMessage)
        }
      },

      // Update workspace details
      updateWorkspace: async (workspaceId, data) => {
        set({ error: null })
        try {
          await axios.put(`/api/workspaces/${workspaceId}`, data)
          await get().initializeWorkspaces()
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to update workspace'
          set({ error: errorMessage })
          throw new Error(errorMessage)
        }
      },

      // Delete workspace
      deleteWorkspace: async (workspaceId) => {
        set({ error: null })
        try {
          await axios.delete(`/api/workspaces/${workspaceId}`)
          await get().initializeWorkspaces()
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to delete workspace'
          set({ error: errorMessage })
          throw new Error(errorMessage)
        }
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