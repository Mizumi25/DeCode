// @/Components/Header/WorkspaceDropdown.jsx
import React, { useState, useEffect } from 'react'
import { ChevronDown, Plus, Settings, Users, Globe, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { router } from '@inertiajs/react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import CreateWorkspaceModal from '@/Components/Workspaces/CreateWorkspaceModal'

const WorkspaceDropdown = ({ 
  dropdownOpen,
  setDropdownOpen,
  onInviteClick
}) => {
  const {
    currentWorkspace,
    workspaces,
    setCurrentWorkspace,
    initializeWorkspaces,
    isLoading
  } = useWorkspaceStore()

  const [showCreateModal, setShowCreateModal] = useState(false)

  // Initialize workspaces on mount
  useEffect(() => {
    if (workspaces.length === 0) {
      initializeWorkspaces()
    }
  }, [initializeWorkspaces, workspaces.length])

  const handleWorkspaceSwitch = (workspace) => {
    if (!workspace || !workspace.id) {
      console.error('Invalid workspace selected:', workspace)
      return
    }
    
    setCurrentWorkspace(workspace)
    setDropdownOpen(false)
    
    // Refresh the projects page for the new workspace
    router.visit(`/projects?workspace=${workspace.id}`, {
      preserveState: false, // Force refresh to load workspace-specific projects
      replace: true
    })
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
      onInviteClick(currentWorkspace.id)
    } else {
      console.error('Cannot invite members: missing workspace ID or invite handler')
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

  const currentWorkspaceName = currentWorkspace?.name || 'Select Workspace'
  const isPersonalWorkspace = currentWorkspace?.type === 'personal'
  const hasCurrentWorkspace = currentWorkspace && currentWorkspace.id

  return (
    <>
      <div
        className="hidden md:flex items-center gap-2 cursor-pointer relative bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] rounded-lg px-3 py-2 transition-colors"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {hasCurrentWorkspace && (
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              {getPrivacyIcon(currentWorkspace)}
            </div>
          )}
          <span className="text-[var(--color-text)] font-medium text-sm truncate max-w-[120px]">
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

                {/* Workspace List */}
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <div className="text-xs text-[var(--color-text-muted)] font-medium px-2 py-1">
                    Switch Workspace
                  </div>
                  
                  {workspaces.filter(workspace => workspace && workspace.id).map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => handleWorkspaceSwitch(workspace)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                        currentWorkspace?.id === workspace.id
                          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
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
                      </div>
                      
                      {workspace.type !== 'personal' && (
                        <div className="flex items-center gap-1 text-[var(--color-text-muted)]">
                          <Users className="w-3 h-3" />
                          <span className="text-xs">{getMemberCount(workspace)}</span>
                        </div>
                      )}
                    </button>
                  ))}
                  
                  {workspaces.length === 0 && !isLoading && (
                    <div className="text-center py-4 text-[var(--color-text-muted)]">
                      <p className="text-sm">No workspaces found</p>
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