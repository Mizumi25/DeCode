// @/Components/Header/WorkspaceDropdown.jsx
import React, { useState, useEffect } from 'react'
import { ChevronDown, Plus, Settings, Users, Globe, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { router, usePage } from '@inertiajs/react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import CreateWorkspaceModal from '@/Components/Workspaces/CreateWorkspaceModal'

const WorkspaceDropdown = ({ 
  dropdownOpen,
  setDropdownOpen,
  onInviteClick
}) => {
  const { auth } = usePage().props // Get current user from Inertia
  const currentUser = auth.user

  const {
    currentWorkspace,
    workspaces,
    setCurrentWorkspace,
    initializeWorkspaces,
    isLoading,
    getUserWorkspaces,
    error,
    clearError
  } = useWorkspaceStore()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [switchingWorkspace, setSwitchingWorkspace] = useState(false)

  // Get only workspaces the current user has access to
  const userWorkspaces = getUserWorkspaces(currentUser?.id)

  // Initialize workspaces on mount
  useEffect(() => {
    if (workspaces.length === 0) {
      initializeWorkspaces()
    }
  }, [initializeWorkspaces, workspaces.length])

  // Listen for workspace conversion events and handle invite modal auto-opening
  useEffect(() => {
    const handleWorkspaceConverted = async (event) => {
      const { convertedWorkspaceId, convertedWorkspaceUuid, newType, shouldOpenInviteModal } = event.detail
      console.log('WorkspaceDropdown: Workspace converted event received:', event.detail)
      
      // Clear any existing errors first
      clearError()
      
      try {
        // Refresh workspaces to get latest data
        await initializeWorkspaces()
        
        // Find and set the converted workspace as current using ID
        const convertedWorkspace = getUserWorkspaces(currentUser?.id).find(w => w.id === convertedWorkspaceId)
        if (convertedWorkspace) {
          console.log('WorkspaceDropdown: Setting converted workspace as current:', convertedWorkspace.id)
          setCurrentWorkspace(convertedWorkspace)
          
          // Navigate to projects with the converted workspace using UUID
          await router.visit(`/projects?workspace=${convertedWorkspace.uuid}`, {
            preserveState: false,
            replace: true
          })
          
          // Auto-open invite modal after conversion
          if (shouldOpenInviteModal && onInviteClick) {
            console.log('WorkspaceDropdown: Auto-opening invite modal for converted workspace')
            setTimeout(() => {
              onInviteClick(convertedWorkspace.id, true) // Pass ID for internal tracking
            }, 1000)
          }
        } else {
          console.error('Could not find converted workspace with ID:', convertedWorkspaceId)
        }
      } catch (error) {
        console.error('Failed to refresh workspaces after conversion:', error)
      }
    }
  
    window.addEventListener('workspace-converted', handleWorkspaceConverted)
    return () => {
      window.removeEventListener('workspace-converted', handleWorkspaceConverted)
    }
  }, [initializeWorkspaces, getUserWorkspaces, currentUser?.id, setCurrentWorkspace, onInviteClick, clearError])

  const handleWorkspaceSwitch = async (workspace) => {
    if (!workspace || !workspace.id) {
      console.error('Invalid workspace selected:', workspace)
      return
    }
    
    // Double-check user has access to this workspace
    const hasAccess = workspace.owner?.id === currentUser?.id || 
                     workspace.users?.some(user => user.id === currentUser?.id)
    
    if (!hasAccess) {
      console.error('User does not have access to workspace:', workspace.id)
      return
    }
    
    // If already current workspace, just close dropdown
    if (currentWorkspace?.id === workspace.id) {
      setDropdownOpen(false)
      return
    }
    
    setSwitchingWorkspace(true)
    clearError()
    
    try {
      // Update current workspace in store first
      setCurrentWorkspace(workspace)
      setDropdownOpen(false)
      
    // Navigate to projects page with workspace parameter
    // Use UUID for the workspace parameter to match backend routing
    await router.visit(`/projects?workspace=${workspace.uuid}`, {
      preserveState: false, // Force refresh to load workspace-specific projects
      replace: true,
      onStart: () => {
        console.log('Starting workspace switch navigation...')
      },
      onSuccess: () => {
        console.log('Workspace switch successful')
        setSwitchingWorkspace(false)
      },
      onError: (errors) => {
        console.error('Workspace switch failed:', errors)
        setSwitchingWorkspace(false)
        // Don't revert workspace change as the error might be temporary
      },
      onFinish: () => {
        setSwitchingWorkspace(false)
      }
    })
    } catch (error) {
      console.error('Failed to switch workspace:', error)
      setSwitchingWorkspace(false)
    }
  }

  const handleCreateWorkspace = () => {
    setDropdownOpen(false)
    setShowCreateModal(true)
  }

  const handleWorkspaceSettings = () => {
    setDropdownOpen(false)
    if (currentWorkspace && currentWorkspace.uuid) {
      router.visit(`/workspaces/${currentWorkspace.uuid}/settings`)
    }
  }

  const handleInviteMembers = () => {
    setDropdownOpen(false)
    if (onInviteClick && currentWorkspace && currentWorkspace.id) {
      onInviteClick(currentWorkspace.id, false) // forceInviteMode = false for normal invite
    } else {
      console.error('Cannot invite members: missing workspace ID or invite handler')
    }
  }

  const handleRefreshWorkspaces = async () => {
    clearError()
    try {
      await initializeWorkspaces()
    } catch (error) {
      console.error('Failed to refresh workspaces:', error)
    }
  }

  // Get workspace privacy icon
  const getPrivacyIcon = (workspace) => {
    if (!workspace || !workspace.settings) {
      return <Lock className="w-3 h-3" />
    }
    const isPrivate = workspace.settings.privacy === 'private' || !workspace.settings.privacy
    return isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />
  }

  // Get workspace member count
  const getMemberCount = (workspace) => {
    if (!workspace) return 0
    return workspace.member_count || (workspace.users?.length || 0) + 1 // +1 for owner
  }

  // Check if user has access to current workspace
  const hasCurrentWorkspaceAccess = currentWorkspace && (
    currentWorkspace.owner?.id === currentUser?.id || 
    currentWorkspace.users?.some(user => user.id === currentUser?.id)
  )

  // If current workspace is not accessible, switch to a workspace the user has access to
  useEffect(() => {
    if (currentWorkspace && !hasCurrentWorkspaceAccess && userWorkspaces.length > 0) {
      const personalWorkspace = userWorkspaces.find(w => w.type === 'personal')
      const fallbackWorkspace = personalWorkspace || userWorkspaces[0]
      
      console.log('Current workspace not accessible, switching to fallback:', fallbackWorkspace.name)
      handleWorkspaceSwitch(fallbackWorkspace)
    }
  }, [currentWorkspace, hasCurrentWorkspaceAccess, userWorkspaces])

  const currentWorkspaceName = (hasCurrentWorkspaceAccess ? currentWorkspace?.name : null) || 'Select Workspace'
  const isPersonalWorkspace = currentWorkspace?.type === 'personal'
  const hasCurrentWorkspace = currentWorkspace && currentWorkspace.id && hasCurrentWorkspaceAccess

  // Show loading state when switching workspaces
  if (switchingWorkspace) {
    return (
      <div className="hidden md:flex items-center gap-2 cursor-not-allowed relative bg-[var(--color-bg-muted)] rounded-lg px-3 py-2">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"></div>
          <span className="text-sm">Switching...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className="flex items-center gap-2 cursor-pointer relative bg-[var(--color-bg)] hover:bg-[var(--color-bg-hover)] rounded-lg px-3 py-2 transition-colors"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {hasCurrentWorkspace && (
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              {getPrivacyIcon(currentWorkspace)}
            </div>
          )}
          <span className="text-[var(--color-text)] font-medium text-sm truncate max-w-[50px] md:max-w-[120px]">
            {isLoading ? 'Loading...' : currentWorkspaceName}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-full mt-2 right-0 w-72 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl z-50"
            >
              <div className="p-3">
                {/* Error Display */}
                {error && (
                  <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                      <button
                        onClick={clearError}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Current Workspace Header */}
                {hasCurrentWorkspace && (
                  <div className="border-b border-[var(--color-border)] pb-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPrivacyIcon(currentWorkspace)}
                        <span className="font-medium text-[var(--color-text)]">
                          {currentWorkspace.name}
                        </span>
                        {isPersonalWorkspace && (
                          <span className="text-xs bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] px-2 py-0.5 rounded">
                            Personal
                          </span>
                        )}
                        {currentWorkspace.type === 'team' && (
                          <span className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-0.5 rounded border border-[var(--color-primary)]/20">
                            Team
                          </span>
                        )}
                        {currentWorkspace.type === 'company' && (
                          <span className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                            Company
                          </span>
                        )}
                      </div>
                      {!isPersonalWorkspace && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-[var(--color-text-muted)]" />
                          <span className="text-xs text-[var(--color-text-muted)]">
                            {getMemberCount(currentWorkspace)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Current workspace actions */}
                    <div className="flex gap-1 mt-2">
                      {!isPersonalWorkspace && (
                        <button
                          onClick={handleInviteMembers}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
                        >
                          <Users className="w-3 h-3" />
                          Invite
                        </button>
                      )}
                      <button
                        onClick={handleWorkspaceSettings}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-[var(--color-bg-muted)] text-[var(--color-text)] rounded-md hover:bg-[var(--color-bg-hover)] transition-colors"
                      >
                        <Settings className="w-3 h-3" />
                        Settings
                      </button>
                    </div>
                  </div>
                )}

                {/* Workspace List - Only show workspaces user has access to */}
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-xs text-[var(--color-text-muted)] font-medium">
                      Switch Workspace ({userWorkspaces.length})
                    </span>
                    <button
                      onClick={handleRefreshWorkspaces}
                      className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors disabled:opacity-50"
                      title="Refresh workspaces"
                      disabled={isLoading}
                    >
                      {isLoading ? '...' : '↻'}
                    </button>
                  </div>
                  
                  {userWorkspaces.filter(workspace => workspace && workspace.id).map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => handleWorkspaceSwitch(workspace)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                        currentWorkspace?.id === workspace.id
                          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] cursor-default'
                          : 'hover:bg-[var(--color-bg-muted)] text-[var(--color-text)]'
                      }`}
                      disabled={currentWorkspace?.id === workspace.id}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getPrivacyIcon(workspace)}
                        <span className="font-medium text-sm truncate">
                          {workspace.name}
                        </span>
                        {workspace.type === 'personal' && (
                          <span className="text-xs bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] px-1.5 py-0.5 rounded">
                            Personal
                          </span>
                        )}
                        {workspace.type === 'team' && (
                          <span className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-1.5 py-0.5 rounded">
                            Team
                          </span>
                        )}
                        {workspace.type === 'company' && (
                          <span className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded">
                            Company
                          </span>
                        )}
                        {currentWorkspace?.id === workspace.id && (
                          <span className="text-xs text-[var(--color-primary)]">✓</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                        {workspace.type !== 'personal' && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span className="text-xs">{getMemberCount(workspace)}</span>
                          </div>
                        )}
                        <span className="text-xs">{workspace.project_count || 0} proj</span>
                      </div>
                    </button>
                  ))}
                  
                  {userWorkspaces.length === 0 && !isLoading && (
                    <div className="text-center py-4 text-[var(--color-text-muted)]">
                      <p className="text-sm">No workspaces found</p>
                      <button
                        onClick={handleRefreshWorkspaces}
                        className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] mt-1"
                      >
                        Try refreshing
                      </button>
                    </div>
                  )}
                  
                  {isLoading && userWorkspaces.length === 0 && (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 mx-auto animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent"></div>
                      <p className="text-xs text-[var(--color-text-muted)] mt-2">Loading workspaces...</p>
                    </div>
                  )}
                </div>

                {/* Create New Workspace */}
                <div className="border-t border-[var(--color-border)] pt-3 mt-3">
                  <button
                    onClick={handleCreateWorkspace}
                    className="w-full flex items-center gap-2 p-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span>Create New Workspace</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal 
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  )
}

export default WorkspaceDropdown