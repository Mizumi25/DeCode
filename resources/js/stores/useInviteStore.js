// @/stores/useInviteStore.js
import { create } from 'zustand'
import axios from 'axios'

// Constants
export const WORKSPACE_ROLES = [
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Can view projects and workspaces'
  },
  {
    value: 'editor', 
    label: 'Editor',
    description: 'Can create, edit, and manage projects'
  }
]

// Helper functions
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const success = document.execCommand('copy')
      textArea.remove()
      return success
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    return false
  }
}

const useInviteStore = create((set, get) => ({
  // State
  isLoading: false,
  error: null,
  invites: {}, // Keyed by workspace ID

  // Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Generate invite link
  generateInviteLink: async (workspaceId, role) => {
    if (!workspaceId) {
      const errorMessage = 'Workspace ID is required to generate invite link'
      set({ error: errorMessage })
      return {
        success: false,
        error: errorMessage
      }
    }

    if (!role || !WORKSPACE_ROLES.some(r => r.value === role)) {
      const errorMessage = 'Valid role is required'
      set({ error: errorMessage })
      return {
        success: false,
        error: errorMessage
      }
    }

    set({ isLoading: true, error: null })
    
    try {
      const response = await axios.post('/api/invites/generate-link', {
        workspace_id: workspaceId,
        role
      })

      if (response.data.success) {
        const { link, token, expires_at } = response.data.data
        
        set({ isLoading: false })
        return {
          success: true,
          link,
          token,
          expires_at
        }
      } else {
        throw new Error(response.data.message || 'Failed to generate invite link')
      }
    } catch (error) {
      console.error('Invite link generation error:', error)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to generate invite link'
      set({ error: errorMessage, isLoading: false })
      return {
        success: false,
        error: errorMessage
      }
    }
  },

  // Send email invite
  sendEmailInvite: async (workspaceId, email, role) => {
    if (!workspaceId) {
      const errorMessage = 'Workspace ID is required to send invite'
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    }

    if (!validateEmail(email)) {
      const errorMessage = 'Please enter a valid email address'
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    }

    if (!role || !WORKSPACE_ROLES.some(r => r.value === role)) {
      const errorMessage = 'Valid role is required'
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    }

    set({ isLoading: true, error: null })
    
    try {
      const response = await axios.post('/api/invites/send-email', {
        workspace_id: workspaceId,
        email,
        role
      })

      if (response.data.success) {
        // Refresh invites for this workspace
        await get().getWorkspaceInvites(workspaceId)
        
        set({ isLoading: false })
        return {
          success: true,
          invite: response.data.data
        }
      } else {
        throw new Error(response.data.message || 'Failed to send invitation')
      }
    } catch (error) {
      console.error('Email invite error:', error)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Failed to send invitation'
      set({ error: errorMessage, isLoading: false })
      return {
        success: false,
        error: errorMessage
      }
    }
  },

  // Accept invite
  acceptInvite: async (token) => {
    if (!token) {
      const errorMessage = 'Invite token is required'
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    }

    set({ isLoading: true, error: null })
    
    try {
      const response = await axios.post(`/api/invites/accept/${token}`)

      if (response.data.success) {
        set({ isLoading: false })
        return {
          success: true,
          workspace: response.data.data.workspace,
          role: response.data.data.role,
          redirectUrl: response.data.redirect_url
        }
      } else {
        throw new Error(response.data.message || 'Failed to accept invitation')
      }
    } catch (error) {
      console.error('Accept invite error:', error)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Failed to accept invitation'
      set({ error: errorMessage, isLoading: false })
      return {
        success: false,
        error: errorMessage
      }
    }
  },

  // Get workspace invites
  getWorkspaceInvites: async (workspaceId) => {
    if (!workspaceId) {
      const errorMessage = 'Workspace ID is required to fetch invites'
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    }

    try {
      const response = await axios.get(`/api/workspaces/${workspaceId}/invites`)

      if (response.data.success) {
        const invites = response.data.data
        
        set(state => ({
          invites: {
            ...state.invites,
            [workspaceId]: invites
          }
        }))
        
        return { success: true, invites }
      } else {
        throw new Error(response.data.message || 'Failed to fetch invites')
      }
    } catch (error) {
      console.error('Get invites error:', error)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Failed to fetch invites'
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  // Revoke invite
  revokeInvite: async (inviteId, workspaceId) => {
    if (!inviteId || !workspaceId) {
      const errorMessage = 'Invite ID and Workspace ID are required'
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    }

    set({ error: null })
    
    try {
      const response = await axios.delete(`/api/invites/${inviteId}`)

      if (response.data.success) {
        // Refresh invites for this workspace
        await get().getWorkspaceInvites(workspaceId)
        return { success: true }
      } else {
        throw new Error(response.data.message || 'Failed to revoke invitation')
      }
    } catch (error) {
      console.error('Revoke invite error:', error)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Failed to revoke invitation'
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  // Resend invite
  resendInvite: async (inviteId, workspaceId) => {
    if (!inviteId || !workspaceId) {
      const errorMessage = 'Invite ID and Workspace ID are required'
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    }

    set({ isLoading: true, error: null })
    
    try {
      const response = await axios.post(`/api/invites/${inviteId}/resend`)

      if (response.data.success) {
        // Refresh invites for this workspace
        await get().getWorkspaceInvites(workspaceId)
        
        set({ isLoading: false })
        return { success: true }
      } else {
        throw new Error(response.data.message || 'Failed to resend invitation')
      }
    } catch (error) {
      console.error('Resend invite error:', error)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Failed to resend invitation'
      set({ error: errorMessage, isLoading: false })
      return { success: false, error: errorMessage }
    }
  },

  // Helper methods
  getInvitesForWorkspace: (workspaceId) => {
    const { invites } = get()
    return invites[workspaceId] || []
  },

  getPendingInvites: (workspaceId) => {
    const invites = get().getInvitesForWorkspace(workspaceId)
    return invites.filter(invite => invite.status === 'pending')
  },

  getEmailInvites: (workspaceId) => {
    const invites = get().getInvitesForWorkspace(workspaceId)
    return invites.filter(invite => invite.email && !invite.is_link_invite)
  },

  getLinkInvites: (workspaceId) => {
    const invites = get().getInvitesForWorkspace(workspaceId)
    return invites.filter(invite => invite.is_link_invite)
  },

  // Clean up expired invites (admin function)
  cleanupExpiredInvites: async () => {
    try {
      const response = await axios.post('/api/invites/cleanup-expired')
      return response.data
    } catch (error) {
      console.error('Failed to cleanup expired invites:', error)
      return { success: false, error: error.message }
    }
  },

  // Reset store
  reset: () => {
    set({
      isLoading: false,
      error: null,
      invites: {}
    })
  }
}))

export { useInviteStore }