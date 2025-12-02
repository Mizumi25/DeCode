// @/Components/Void/TeamCollaborationPanel.jsx - REPLACE WITH THIS VERSION

import React, { useState, useEffect } from 'react'
import { Users, MessageCircle, Share2, Clock, User, Plus, Settings, Crown, Eye, Edit, X, Check, AlertCircle, UserPlus, Mail, Trash2, UserMinus, Code, Palette, Target, Bug, Briefcase, TrendingUp, DollarSign, HeadphonesIcon, GripVertical } from 'lucide-react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { router, usePage } from '@inertiajs/react'
import Modal from '@/Components/Modal'
import InviteModal from '@/Components/Workspaces/InviteModal'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

export default function TeamCollaborationPanel() {
  const { auth } = usePage().props
  const user = auth?.user
  
  const { 
    currentWorkspace, 
    workspaces,
    getUserWorkspaces 
  } = useWorkspaceStore()
  
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [selectedDisciplineUser, setSelectedDisciplineUser] = useState(null)
  const [newDiscipline, setNewDiscipline] = useState('')
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)
  const [isUpdatingDiscipline, setIsUpdatingDiscipline] = useState(false)
  const [isRemovingUser, setIsRemovingUser] = useState(false)
  const [workspaceUsers, setWorkspaceUsers] = useState([])
  const [workspaceInvites, setWorkspaceInvites] = useState([])
  const [activeMembers, setActiveMembers] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Check permissions
  const canManageUsers = currentWorkspace && (
    currentWorkspace.owner?.id === user?.id ||
    currentWorkspace.user_role === 'editor'
  )
  const isOwner = currentWorkspace?.owner?.id === user?.id
  const [myRole, setMyRole] = useState(null)
  const canInvite = isOwner || myRole === 'editor' || myRole === 'admin'

  // Available disciplines
  const disciplines = [
    { value: 'Developer', label: 'Developer', icon: Code, color: 'blue' },
    { value: 'Designer', label: 'Designer', icon: Palette, color: 'purple' },
    { value: 'Product Manager', label: 'Product Manager', icon: Target, color: 'indigo' },
    { value: 'QA Tester', label: 'QA Tester', icon: Bug, color: 'red' },
    { value: 'Project Manager', label: 'Project Manager', icon: Briefcase, color: 'orange' },
    { value: 'Marketing', label: 'Marketing', icon: TrendingUp, color: 'pink' },
    { value: 'Sales', label: 'Sales', icon: DollarSign, color: 'green' },
    { value: 'Support', label: 'Support', icon: HeadphonesIcon, color: 'cyan' },
    { value: 'Member', label: 'Member', icon: User, color: 'gray' }
  ]

  // Load workspace data
  useEffect(() => {
    if (currentWorkspace?.uuid) {
      loadWorkspaceData()
    }
  }, [currentWorkspace?.uuid])

  const loadWorkspaceData = async () => {
    if (!currentWorkspace?.uuid) return
    
    setIsLoading(true)
    try {
      const workspaceResponse = await fetch(`/api/workspaces/${currentWorkspace.uuid}`, {
        headers: {
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        }
      })

          
                  if (workspaceResponse.ok) {
          const workspaceData = await workspaceResponse.json()
          const workspace = workspaceData.data
          
          // Build users array with owner first, including discipline
          const ownerInPivot = workspace.users.find(u => u.id === workspace.owner.id)
          
          const users = [
            {
              id: workspace.owner.id,
              name: workspace.owner.name,
              email: workspace.owner.email,
              avatar: workspace.owner.avatar,
              role: 'owner',
              discipline: ownerInPivot?.discipline || 'Member',
              discipline_order: ownerInPivot?.discipline_order || 0,
              joined_at: workspace.created_at,
              isOwner: true,
              isOnline: true // ✅ OWNER IS ALWAYS ONLINE
            },
            ...workspace.users.filter(u => u.id !== workspace.owner.id).map(u => ({
              id: u.id,
              name: u.name,
              email: u.email,
              avatar: u.avatar,
              role: u.role,
              discipline: u.discipline || 'Member',
              discipline_order: u.discipline_order || 999,
              joined_at: u.joined_at,
              isOwner: false,
              isOnline: Math.random() > 0.3 // Other users randomly online
            }))
          ]
          
                  // Sort by discipline_order, then Developer first, then alphabetically
          users.sort((a, b) => {
            if (a.discipline_order !== b.discipline_order) {
              return a.discipline_order - b.discipline_order
            }
            if (a.discipline === 'Developer' && b.discipline !== 'Developer') return -1
            if (a.discipline !== 'Developer' && b.discipline === 'Developer') return 1
            return a.name.localeCompare(b.name)
          })
          
          setWorkspaceUsers(users)
          
          // ✅ SET ACTIVE MEMBERS - Owner is always first
          const onlineUsers = users.filter(u => u.isOnline).slice(0, 5)
          setActiveMembers(onlineUsers.map(member => ({
            ...member,
            status: member.id === user?.id ? 'editing' : (Math.random() > 0.5 ? 'editing' : 'viewing'),
            file: member.id === user?.id ? 'Current Frame' : ['HomePage.jsx', 'Dashboard.jsx', 'LoginForm.jsx', 'Button.jsx', 'Card.jsx'][Math.floor(Math.random() * 5)]
          })))
        
        if (users.length > 0) {
          const activities = [
            { action: 'commented on', type: 'comment', files: ['Button.jsx', 'Card.jsx', 'Modal.jsx'] },
            { action: 'edited', type: 'edit', files: ['HomePage.jsx', 'Dashboard.jsx', 'Profile.jsx'] },
            { action: 'shared', type: 'share', files: ['Project Link', 'Component Library'] },
            { action: 'created', type: 'create', files: ['NewComponent.jsx', 'Layout.jsx', 'Header.jsx'] }
          ]
          
          const recentActivities = activities.map((activity, index) => ({
            ...activity,
            file: activity.files[Math.floor(Math.random() * activity.files.length)],
            user: users[Math.floor(Math.random() * users.length)].name,
            time: ['2m ago', '5m ago', '10m ago', '15m ago', '30m ago'][index] || `${index + 1}h ago`
          }))
          
          setRecentActivity(recentActivities)
        }
      }

      if (canManageUsers) {
        loadWorkspaceInvites()
      }

    } catch (error) {
      console.error('Error loading workspace data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadWorkspaceInvites = async () => {
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.uuid}/invites`, {
        headers: {
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        }
      })

      if (response.ok) {
        const data = await response.json()
        setWorkspaceInvites(data.data || [])
      }
    } catch (error) {
      console.error('Error loading invites:', error)
    }
  }

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
        setWorkspaceUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, role } : u
        ))
        
        await getUserWorkspaces()
        await loadWorkspaceData()
        
        setSelectedUser(null)
        setNewRole('')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    } finally {
      setIsUpdatingRole(false)
    }
  }

const handleDisciplineChange = async (userId, discipline) => {
  if (!isOwner) return
  
  setIsUpdatingDiscipline(true)
  try {
    const response = await fetch(`/api/workspaces/${currentWorkspace.uuid}/users/${userId}/discipline`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
      },
      body: JSON.stringify({ discipline })
    })

    if (response.ok) {
      // Force reload from server to get fresh data
      await loadWorkspaceData()
      await getUserWorkspaces()
      
      setSelectedDisciplineUser(null)
      setNewDiscipline('')
      
      console.log(`✅ Discipline updated to ${discipline} for user ${userId}`)
    } else {
      const error = await response.json()
      console.error('Failed to update discipline:', error)
    }
  } catch (error) {
    console.error('Error updating user discipline:', error)
  } finally {
    setIsUpdatingDiscipline(false)
  }
}

  const handleDragEnd = async (result) => {
    if (!result.destination || !isOwner) return
    
    const items = Array.from(workspaceUsers)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    // Update local state immediately for smooth UX
    setWorkspaceUsers(items)
    
    // Send new order to backend
    try {
      const orders = items.map((user, index) => ({
        user_id: user.id,
        order: index
      }))
      
      await fetch(`/api/workspaces/${currentWorkspace.uuid}/discipline-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        },
        body: JSON.stringify({ orders })
      })
    } catch (error) {
      console.error('Error updating discipline order:', error)
      // Revert on error
      await loadWorkspaceData()
    }
  }

  const handleRemoveUser = async (userId) => {
    if (!canManageUsers || userId === user?.id) return
    
    const userToRemove = workspaceUsers.find(u => u.id === userId)
    if (!userToRemove) return

    if (!confirm(`Remove ${userToRemove.name} from the workspace?`)) {
      return
    }
    
    setIsRemovingUser(true)
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.uuid}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        }
      })

      if (response.ok) {
        setWorkspaceUsers(prev => prev.filter(u => u.id !== userId))
        setActiveMembers(prev => prev.filter(m => m.id !== userId))
        await getUserWorkspaces()
      }
    } catch (error) {
      console.error('Error removing user:', error)
    } finally {
      setIsRemovingUser(false)
    }
  }

  const handleRevokeInvite = async (inviteId) => {
    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        }
      })

      if (response.ok) {
        setWorkspaceInvites(prev => prev.filter(i => i.id !== inviteId))
      }
    } catch (error) {
      console.error('Error revoking invite:', error)
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

  const getDisciplineInfo = (disciplineValue) => {
    return disciplines.find(d => d.value === disciplineValue) || disciplines[disciplines.length - 1]
  }

  const getDisciplineColor = (color) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
      red: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
      orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      pink: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400 border-pink-200 dark:border-pink-800',
      green: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
      cyan: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
      gray: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800',
    }
    return colors[color] || colors.gray
  }

  const getAvatarContent = (member) => {
    if (member.avatar) {
      return <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
    }
    
    const initials = member.name?.split(' ').map(n => n.charAt(0)).join('').slice(0, 2) || 'U'
    const colors = [
      'from-blue-500 to-blue-600',
      'from-emerald-500 to-emerald-600', 
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-red-500 to-red-600',
      'from-cyan-500 to-cyan-600',
    ]
    const colorClass = colors[member.id % colors.length]
    
    return (
      <div className={`w-full h-full bg-gradient-to-r ${colorClass} flex items-center justify-center text-white text-xs font-medium`}>
        {initials}
      </div>
    )
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

  if (currentWorkspace.type === 'personal') {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <Users className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-2" />
          <p className="text-[var(--color-text)] font-medium mb-1">Personal Workspace</p>
          <p className="text-[var(--color-text-muted)] text-sm">This is your personal workspace.</p>
          <p className="text-[var(--color-text-muted)] text-sm">Create a team workspace to collaborate.</p>
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
            {canInvite && (
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
              className={`relative p-2.5 rounded-lg transition-all duration-200 ${
                showUserManagement
                  ? 'bg-[var(--color-primary)] text-white shadow-lg scale-110'
                  : 'hover:bg-[var(--color-bg-hover)] text-[var(--color-text)] hover:scale-105'
              }`}
              title="⚙️ Workspace Settings & Roles"
            >
              <Settings className="w-5 h-5" />
              {isOwner && (
                <span 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2" 
                  style={{ borderColor: 'var(--color-bg)' }}
                  title="Owner Controls"
                />
              )}
            </button>
          </div>
        </div>
        <div className="text-xs text-[var(--color-text-muted)]">
          {activeMembers.length} members online • {workspaceUsers.length} total members
        </div>
      </div>

      <div className="overflow-y-auto flex-1 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Active Members */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h5 className="font-medium text-sm text-[var(--color-text)] mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Members
              </h5>
              
              {activeMembers.length > 0 ? (
                <div className="space-y-2">
                  {activeMembers.map((member) => {
                    const RoleIcon = getRoleIcon(member.role)
                    const disciplineInfo = getDisciplineInfo(member.discipline)
                    const DisciplineIcon = disciplineInfo.icon
                    
                    return (
                      <div key={member.id} className="flex items-center gap-3 p-2 rounded hover:bg-[var(--color-bg-hover)]">
                        <div className="relative">
                          <div className="w-6 h-6 rounded-full overflow-hidden">
                            {getAvatarContent(member)}
                          </div>
                          {member.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[var(--color-surface)]"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-[var(--color-text)] truncate">
                              {member.name}
                              {member.id === user?.id && (
                                <span className="text-xs text-[var(--color-text-muted)] ml-1">(You)</span>
                              )}
                            </div>
                            <RoleIcon className="w-3 h-3 text-[var(--color-text-muted)]" />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                            <DisciplineIcon className="w-3 h-3 text-[var(--color-primary)]" />
                            <span>{disciplineInfo.label}</span>
                            <span>•</span>
                            <span>{member.status} • {member.file}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)]">No members currently active</p>
              )}
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
          </>
        )}
      </div>

      {/* User Management Modal */}
      <Modal
        show={showUserManagement}
        onClose={() => {
          setShowUserManagement(false)
          setSelectedUser(null)
          setNewRole('')
          setSelectedDisciplineUser(null)
          setNewDiscipline('')
        }}
        title="Manage Team Members"
        maxWidth="2xl"
      >
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              {currentWorkspace.name} Members
            </h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Manage roles, disciplines, and permissions for workspace members
              {isOwner && <span className="block mt-1 text-xs">💡 Drag members to reorder them</span>}
            </p>
          </div>

          {/* Current Members with Drag and Drop */}
          <div className="space-y-3 mb-6">
            <h4 className="font-medium text-[var(--color-text)]">Current Members</h4>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="workspace-members">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {workspaceUsers.map((member, index) => {
                      const RoleIcon = getRoleIcon(member.role)
                      const disciplineInfo = getDisciplineInfo(member.discipline)
                      const DisciplineIcon = disciplineInfo.icon
                      const canEditThisMember = canManageUsers && member.id !== user?.id && !member.isOwner
                      const canEditDiscipline = isOwner
                      
                      return (
                        <Draggable 
                          key={member.id} 
                          draggableId={member.id.toString()} 
                          index={index}
                          isDragDisabled={!isOwner}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center justify-between p-3 border border-[var(--color-border)] rounded-lg transition-all ${
                                snapshot.isDragging ? 'shadow-lg bg-[var(--color-bg-hover)]' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {isOwner && (
                                  <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-4 h-4 text-[var(--color-text-muted)]" />
                                  </div>
                                )}
                                
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                  {getAvatarContent(member)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-[var(--color-text)] truncate">
                                    {member.name}
                                    {member.id === user?.id && (
                                      <span className="text-xs text-[var(--color-text-muted)] ml-2">(You)</span>
                                    )}
                                  </div>
                                  <div className="text-sm text-[var(--color-text-muted)] truncate">{member.email}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    {/* Discipline Badge */}
                                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 border ${getDisciplineColor(disciplineInfo.color)}`}>
                                      <DisciplineIcon className="w-3 h-3" />
                                      {disciplineInfo.label}
                                    </div>
                                    <span className="text-xs text-[var(--color-text-muted)]">
                                      Joined {new Date(member.joined_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                                {/* Role Badge */}
                                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRoleColor(member.role)}`}>
                                  <RoleIcon className="w-3 h-3" />
                                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                </div>

                                {/* Role Selector */}
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
                                          className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded disabled:opacity-50"
                                          title="Save role"
                                        >
                                          {isUpdatingRole ? (
                                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                          ) : (
                                            <Check className="w-4 h-4" />
                                          )}
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSelectedUser(null)
                                            setNewRole('')
                                          }}
                                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                          title="Cancel"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}

                                  {/* Discipline Selector - Owner Only */}
                                  {canEditDiscipline && (
                                    <div className="flex items-center gap-2">
                                      <select
                                        value={selectedDisciplineUser?.id === member.id && newDiscipline ? newDiscipline : member.discipline}
                                        onChange={(e) => {
                                          // Set both the user and new discipline immediately
                                          setSelectedDisciplineUser(member)
                                          setNewDiscipline(e.target.value)
                                        }}
                                        className="text-xs border border-[var(--color-border)] rounded px-2 py-1 bg-[var(--color-surface)] text-[var(--color-text)] min-w-[140px]"
                                        disabled={isUpdatingDiscipline}
                                      >
                                        {disciplines.map((disc) => (
                                          <option key={disc.value} value={disc.value}>
                                            {disc.label}
                                          </option>
                                        ))}
                                      </select>
                                  
                                      {/* Show buttons when user is selected AND discipline is different */}
                                      {selectedDisciplineUser?.id === member.id && newDiscipline && newDiscipline !== member.discipline && (
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => handleDisciplineChange(member.id, newDiscipline)}
                                            disabled={isUpdatingDiscipline}
                                            className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded disabled:opacity-50 transition-colors"
                                            title="Save discipline"
                                          >
                                            {isUpdatingDiscipline ? (
                                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                              <Check className="w-4 h-4" />
                                            )}
                                          </button>
                                          <button
                                            onClick={() => {
                                              setSelectedDisciplineUser(null)
                                              setNewDiscipline('')
                                            }}
                                            disabled={isUpdatingDiscipline}
                                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                            title="Cancel"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                {/* Remove User Button */}
                                {isOwner && !member.isOwner && (
                                  <button
                                    onClick={() => handleRemoveUser(member.id)}
                                    disabled={isRemovingUser}
                                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                                    title="Remove user"
                                  >
                                    {isRemovingUser ? (
                                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <UserMinus className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      )
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Pending Invites */}
          {canManageUsers && workspaceInvites.length > 0 && (
            <div className="space-y-3 mb-6">
              <h4 className="font-medium text-[var(--color-text)]">Pending Invites</h4>
              {workspaceInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 bg-[var(--color-bg-muted)] rounded-lg">
                  <div>
                    <div className="font-medium text-[var(--color-text)]">
                      {invite.email || 'Link invitation'}
                    </div>
                    <div className="text-sm text-[var(--color-text-muted)]">
                      {invite.role} • Expires {new Date(invite.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokeInvite(invite.id)}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    title="Revoke invite"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Invite New Members */}
          {canManageUsers && (
            <div className="pt-4 border-t border-[var(--color-border)]">
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
        onClose={() => {
          setShowInviteModal(false)
          loadWorkspaceData()
        }}
        workspaceId={currentWorkspace?.uuid}
        forceInviteMode={true}
      />
    </div>
  )
}