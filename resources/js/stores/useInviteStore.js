// @/stores/useInviteStore.js
import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

export const useInviteStore = create((set, get) => ({
  // State
  invites: [],
  isLoading: false,
  error: null,
  
  // Modal states
  showInviteModal: false,
  inviteType: 'email', // 'email' or 'link'
  selectedRole: 'viewer', // 'editor', 'viewer'
  currentWorkspaceId: null,

  // Actions
  setShowInviteModal: (show, workspaceId = null) => {
    set({ 
      showInviteModal: show, 
      currentWorkspaceId: workspaceId,
      error: null 
    })
  },

  setInviteType: (type) => set({ inviteType: type }),
  setSelectedRole: (role) => set({ selectedRole: role }),

  // Generate invite link
  generateInviteLink: async (workspaceId, role = 'viewer') => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await fetch('/api/workspaces/invite-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          workspace_id: workspaceId,
          role: role,
          token: uuidv4() // Generate UUID for invite token
        })
      })
      
      if (!response.ok) throw new Error('Failed to generate invite link')
      
      const data = await response.json()
      const inviteUrl = `${window.location.origin}/invite/${data.token}`
      
      return { success: true, link: inviteUrl, token: data.token }
      
    } catch (error) {
      console.error('Failed to generate invite link:', error)
      set({ error: error.message })
      return { success: false, error: error.message }
    } finally {
      set({ isLoading: false })
    }
  },

  // Send email invite
  sendEmailInvite: async (workspaceId, email, role = 'viewer') => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await fetch('/api/workspaces/invite-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          workspace_id: workspaceId,
          email: email,
          role: role,
          token: uuidv4()
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to send invite')
      }
      
      const data = await response.json()
      return { success: true, message: data.message }
      
    } catch (error) {
      console.error('Failed to send email invite:', error)
      set({ error: error.message })
      return { success: false, error: error.message }
    } finally {
      set({ isLoading: false })
    }
  },

  // Get workspace invites
  getWorkspaceInvites: async (workspaceId) => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await fetch(`/api/workspaces/${workspaceId}/invites`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch invites')
      
      const invites = await response.json()
      set({ invites })
      
      return invites
    } catch (error) {
      console.error('Failed to fetch invites:', error)
      set({ error: error.message })
      return []
    } finally {
      set({ isLoading: false })
    }
  },

  // Revoke invite
  revokeInvite: async (inviteId) => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await fetch(`/api/workspaces/invites/${inviteId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      
      if (!response.ok) throw new Error('Failed to revoke invite')
      
      // Remove from local state
      set((state) => ({
        invites: state.invites.filter(invite => invite.id !== inviteId)
      }))
      
      return { success: true }
    } catch (error) {
      console.error('Failed to revoke invite:', error)
      set({ error: error.message })
      return { success: false, error: error.message }
    } finally {
      set({ isLoading: false })
    }
  },

  // Accept invite (for users clicking invite links)
  acceptInvite: async (token) => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await fetch(`/api/workspaces/accept-invite/${token}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to accept invite')
      }
      
      const data = await response.json()
      return { success: true, workspace: data.workspace }
      
    } catch (error) {
      console.error('Failed to accept invite:', error)
      set({ error: error.message })
      return { success: false, error: error.message }
    } finally {
      set({ isLoading: false })
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}))

// Utility functions
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    return false
  }
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Role options for dropdowns
export const WORKSPACE_ROLES = [
  {
    value: 'editor',
    label: 'Editor',
    description: 'Can create, edit, and delete projects'
  },
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Can view and comment on projects'
  }
]