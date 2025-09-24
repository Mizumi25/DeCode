// @/Components/Void/TeamCollaborationPanel.jsx
import React, { useState, useEffect } from 'react'
import { Users, MessageCircle, Share2, Clock, User, Plus, Settings, Crown, Eye, Edit, X, Check, AlertCircle, UserPlus, Mail } from 'lucide-react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { useInviteStore } from '@/stores/useInviteStore'
import { router, usePage } from '@inertiajs/react'
import Modal from '@/Components/Modal'
import InviteModal from '@/Components/Workspaces/InviteModal'

export default function TeamCollaborationPanel() {
  const { auth } = usePage().props
  const user = auth?.user
  
  const { 
    currentWorkspace, 
    workspaces,
    updateWorkspace,
    getUserWorkspaces 
  } = useWorkspaceStore()
  
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)
  const [workspaceUsers, setWorkspaceUsers] = useState([])
  const [activeMembers, setActiveMembers] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  // Check if current user is owner or can manage users
  const canManageUsers = currentWorkspace && (
    currentWorkspace.owner?.id === user?.id ||
    currentWorkspace.user_role === 'editor' // Assuming editors can manage some aspects
  )

  const isOwner = currentWorkspace?.owner?.id === user?.id

  // Load workspace users
  useEffect(() => {
    if (currentWorkspace?.users) {
      const users = [
        // Add owner to the list
        {
          id: currentWorkspace.owner.id,
          name: currentWorkspace.owner.name,
          email: currentWorkspace.owner.email,
          avatar: currentWorkspace.owner.avatar,
          role: 'owner',
          joined_at: currentWorkspace.created_at,
          isOwner: true
        },
        // Add regular users
        ...currentWorkspace.users.map(user => ({
          ...user,
          isOwner: false
        }))
      ]
      
      setWorkspaceUsers(users)
      
      // Simulate active members (in real app, this would come from presence system)
      setActiveMembers(users.slice(0, 3).map(user => ({
        ...user,
        status: Math.random() > 0.5 ? 'editing' : 'viewing',
        file: ['HomePage.jsx', 'Dashboard.jsx', 'LoginForm.jsx'][Math.floor(Math.random() * 3)]
      })))
      
      // Simulate recent activity
      setRecentActivity([
        { action: 'commented on', file: 'Button.jsx', user: users[0]?.name || 'User', time: '2m ago', type: 'comment' },
        { action: 'edited', file: 'HomePage.jsx', user: users[1]?.name || 'User', time: '5m ago', type: 'edit' },
        { action: 'shared', file: 'Project Link', user: users[0]?.name || 'User', time: '10m ago', type: 'share' },
        { action: 'created', file: 'NewComponent.jsx', user: users[0]?.name || 'User', time: '15m ago', type: 'create' }
      ])
    }
  }, [currentWorkspace])

  const handleRoleChange = async (userId, role) => {
    if (!canManageUsers || userId === user?.id) return
    
    setIsUpdatingRole(true)
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.uuid}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        },
        body: JSON.stringify({ role })
      })

      if (response.ok) {
        // Update local state
        setWorkspaceUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, role } : u
        ))
        
        // Refresh workspace data
        await getUserWorkspaces()
        
        setSelectedUser(null)
        setNewRole('')
      } else {
        console.error('Failed to update user role')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    } finally {
      setIsUpdatingRole(false)
    }
  }

  const handleRemoveUser = async (userId) => {
    if (!canManageUsers || userId === user?.id) return
    
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.uuid}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        }
      })

      if (response.ok) {
        setWorkspaceUsers(prev => prev.filter(u => u.id !== userId))
        await getUserWorkspaces()
      } else {
        console.error('Failed to remove user')
      }
    } catch (error) {
      console.error('Error removing user:', error)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return Crown
      case 'editor': return Edit
      case 'viewer': return Eye
      default: return User
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'editor': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
      case 'viewer': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  if (!currentWorkspace) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-2" />
          <p className="text-[var(--color-text-muted)] text-sm">No workspace selected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-[var(--color-text)]">Team Collaboration</h4>
          <div className="flex items-center gap-2">
            {canManageUsers && (
              <button 
                onClick={() => setShowInviteModal(true)}
                className="p-1.5 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-primary)]"
                title="Invite members"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={() => setShowUserManagement(true)}
              className="p-1.5 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]"
              title="Manage team"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="text-xs text-[var(--color-text-muted)]">
          {activeMembers.length} members online • {workspaceUsers.length} total members
        </div>
      </div>

      <div className="overflow-y-auto flex-1 pb-4">
        {/* Active Members */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h5 className="font-medium text-sm text-[var(--color-text)] mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Active Members
          </h5>
          
          <div className="space-y-2">
            {activeMembers.map((member) => {
              const RoleIcon = getRoleIcon(member.role)
              return (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded hover:bg-[var(--color-bg-hover)]">
                  <div className="relative">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                      {member.name?.charAt(0) || 'U'}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[var(--color-surface)]"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-[var(--color-text)] truncate">
                        {member.name}
                      </div>
                      <RoleIcon className="w-3 h-3 text-[var(--color-text-muted)]" />
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {member.status} • {member.file}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h5 className="font-medium text-sm text-[var(--color-text)] mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Activity
          </h5>
          
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  activity.type === 'comment' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                  activity.type === 'edit' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                  activity.type === 'share' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                  'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                }`}>
                  {activity.type === 'comment' ? <MessageCircle className="w-3 h-3" /> :
                   activity.type === 'edit' ? <Edit className="w-3 h-3" /> :
                   activity.type === 'share' ? <Share2 className="w-3 h-3" /> :
                   <Plus className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[var(--color-text)]">
                    <span className="font-medium">{activity.user}</span>{' '}
                    {activity.action}{' '}
                    <span className="font-mono text-xs bg-[var(--color-bg-muted)] px-1 py-0.5 rounded">
                      {activity.file}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-1">
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center gap-2 p-2 rounded bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] transition-colors">
              <MessageCircle className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-sm text-[var(--color-text)]">Comments</span>
            </button>
            <button className="flex items-center gap-2 p-2 rounded bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] transition-colors">
              <Share2 className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-sm text-[var(--color-text)]">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Management Modal */}
      <Modal
        show={showUserManagement}
        onClose={() => {
          setShowUserManagement(false)
          setSelectedUser(null)
          setNewRole('')
        }}
        title="Manage Team Members"
        maxWidth="lg"
      >
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              {currentWorkspace.name} Members
            </h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Manage roles and permissions for workspace members
            </p>
          </div>

          <div className="space-y-3">
            {workspaceUsers.map((member) => {
              const RoleIcon = getRoleIcon(member.role)
              const canEditThisMember = canManageUsers && member.id !== user?.id && !member.isOwner
              
              return (
                <div key={member.id} className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                      {member.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-medium text-[var(--color-text)]">
                        {member.name}
                        {member.id === user?.id && (
                          <span className="text-xs text-[var(--color-text-muted)] ml-2">(You)</span>
                        )}
                      </div>
                      <div className="text-sm text-[var(--color-text-muted)]">{member.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRoleColor(member.role)}`}>
                      <RoleIcon className="w-3 h-3" />
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </div>

                    {canEditThisMember && (
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedUser?.id === member.id ? newRole : member.role}
                          onChange={(e) => {
                            if (e.target.value !== member.role) {
                              setSelectedUser(member)
                              setNewRole(e.target.value)
                            }
                          }}
                          className="text-xs border border-[var(--color-border)] rounded px-2 py-1 bg-[var(--color-surface)] text-[var(--color-text)]"
                          disabled={isUpdatingRole}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                        </select>

                        {selectedUser?.id === member.id && newRole !== member.role && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleRoleChange(member.id, newRole)}
                              disabled={isUpdatingRole}
                              className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(null)
                                setNewRole('')
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {isOwner && (
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${member.name} from the workspace?`)) {
                                handleRemoveUser(member.id)
                              }
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Remove user"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {canManageUsers && (
            <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
              <button
                onClick={() => {
                  setShowUserManagement(false)
                  setShowInviteModal(true)
                }}
                className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-[var(--color-border)] rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)] transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">Invite new members</span>
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Invite Modal */}
      <InviteModal
        show={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        workspaceId={currentWorkspace?.uuid}
        forceInviteMode={true}
      />
    </div>
  )
}