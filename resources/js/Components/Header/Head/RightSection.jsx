// @/Components/Header/Head/RightSection.jsx
import React, { useState } from 'react'
import { Search, Upload, MessageCircle, Share2, Download, Edit3, Eye, Users, Save, ChevronDown, History, Circle } from 'lucide-react'
import ExportDropdown from './ExportDropdown'
import { motion } from 'framer-motion'
import { usePage } from '@inertiajs/react'
import UserDropdown from './UserDropdown'
import WorkspaceDropdown from './WorkspaceDropdown'
import InviteModal from '@/Components/Workspaces/InviteModal'
import ShareModal from '@/Components/Projects/ShareModal'
import RealTimeStackingAvatars from './RealTimeStackingAvatars'
import BinaryToggle from './BinaryToggle'

import { useForgeUndoRedoStore } from '@/stores/useForgeUndoRedoStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { usePublishStore } from '@/stores/usePublishStore'

const fadeIn = {
  hidden: { opacity: 0, y: -10 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.4,
      ease: 'easeOut',
    },
  }),
}

const RightSection = ({ 
  currentRoute,
  user,
  editMode,
  setEditMode,
  onMobileSearchToggle,
  workspaceDropdownOpen,
  setWorkspaceDropdownOpen,
  profileDropdownOpen,
  setProfileDropdownOpen,
  toggleForgePanel,
  isMobile
}) => {
  const { props, url } = usePage()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [inviteWorkspaceId, setInviteWorkspaceId] = useState(null)
  const [forceInviteMode, setForceInviteMode] = useState(false)
  const [myRole, setMyRole] = useState(null)
  const [isPublished, setIsPublished] = useState(!!props.project?.published_url)
  
  // Permission: Only owner and editors can invite
  const currentWorkspace = props.currentWorkspace
  const isOwner = currentWorkspace?.owner?.id === user?.id
  const canInvite = isOwner || myRole === 'editor' || myRole === 'admin'

  // Get current frame and project from page props
  const currentFrame = props.frame
  const currentProject = props.project

  const onProjectsPage = currentRoute === '/projects' || currentRoute.includes('/projects')
  const onForgePage = currentRoute.includes('/modeForge')
  const onSourcePage = currentRoute.includes('/modeSource')
  
  // Pure void page (must have /void but not forge or source)
  const onVoidPage = 
    currentRoute.startsWith('/void') &&
    !onForgePage &&
    !onSourcePage

  // Determine current mode for avatar component
  const getCurrentMode = () => {
    if (onForgePage) return 'forge'
    if (onSourcePage) return 'source'
    return 'forge' // default
  }

  const editOptions = [
    { key: 'edit', icon: Edit3 },
    { key: 'view', icon: Eye }
  ]
  
  // Add these after the existing state declarations
  const [showSaveDropdown, setShowSaveDropdown] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Get revision functionality from Forge Undo/Redo store
  const { manualSave, hasUnsavedChanges, getHistoryInfo } = useForgeUndoRedoStore()
  

  
  // Check if there are unsaved changes
  const frameHasUnsavedChanges = currentFrame ? hasUnsavedChanges(currentFrame.uuid) : false
  const historyInfo = currentFrame ? getHistoryInfo(currentFrame.uuid) : null
  
  // Handle manual save with revision
  const handleManualSave = async (createRevision = false, revisionTitle = null) => {
    if (!currentProject || !currentFrame || isSaving) return
    
    setIsSaving(true)
    try {
      const title = revisionTitle || `Save ${new Date().toLocaleString()}`
      
      if (createRevision) {
        await manualSave(currentProject.uuid, currentFrame.uuid, [], title)
        console.log('Revision created successfully')
      } else {
        // Just save without revision
        await manualSave(currentProject.uuid, currentFrame.uuid, [])
        console.log('Saved successfully')
      }
      
      setShowSaveDropdown(false)
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }
  
  // Handle save dropdown options
  const handleSaveOption = (option) => {
    switch (option) {
      case 'save':
        handleManualSave(false)
        break
      case 'revision':
        const title = prompt('Enter revision name:')
        if (title) {
          handleManualSave(true, title)
        }
        break
      case 'auto-revision':
        handleManualSave(true, `Auto-save ${new Date().toLocaleString()}`)
        break
    }
  }

  const handleInviteClick = (workspaceId, forceMode = false) => {
    console.log('Header: Opening invite modal for workspace:', workspaceId, 'forceMode:', forceMode)
    setInviteWorkspaceId(workspaceId)
    setForceInviteMode(forceMode)
    setShowInviteModal(true)
  }

  const handleCloseInviteModal = () => {
    setShowInviteModal(false)
    setInviteWorkspaceId(null)
    setForceInviteMode(false)
  }

  // Handle Publish - Open Modal
  const { openPublishModal, openUnpublishModal } = usePublishStore()
  
  const handlePublishClick = () => {
    // Always open publish modal - the modal itself will show correct content based on published state
    openPublishModal()
  }

  // Comment mode from global editor store (use separate selectors to avoid new object each render)
  const commentMode = useEditorStore((s) => s.commentMode)
  const toggleCommentMode = useEditorStore((s) => s.toggleCommentMode)
  
  // Fetch current user's role
  React.useEffect(() => {
    const fetchMyRole = async () => {
      if (!currentWorkspace?.uuid) return
      
      try {
        const response = await fetch(`/api/workspaces/${currentWorkspace.uuid}/roles/my-role`, {
          headers: { 'Accept': 'application/json' }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setMyRole(data.data.role)
            console.log('RightSection: User role loaded:', data.data.role)
          }
        }
      } catch (error) {
        console.error('Failed to fetch role:', error)
      }
    }
    
    if (currentWorkspace?.uuid) {
      fetchMyRole()
    }
  }, [currentWorkspace?.uuid])
  
  // Check published status periodically
  React.useEffect(() => {
    const checkPublishStatus = async () => {
      if (!props.project?.uuid) return
      
      try {
        const response = await fetch(`/api/projects/${props.project.uuid}/status`, {
          headers: { 'Accept': 'application/json' }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.project) {
            setIsPublished(!!data.project.published_url)
            console.log('Publish status checked:', !!data.project.published_url)
          }
        }
      } catch (error) {
        console.error('Failed to check publish status:', error)
      }
    }
    
    if (props.project?.uuid) {
      // Check immediately
      checkPublishStatus()
      
      // Check every 3 seconds
      const interval = setInterval(checkPublishStatus, 3000)
      return () => clearInterval(interval)
    }
  }, [props.project?.uuid])

  // Enhanced Save Button Component
  const SaveButton = () => {
  if (!(onForgePage || onSourcePage) || !currentFrame) return null

  return (
    <div className="relative">
      <div className="flex items-center">
        {/* Main Save Button */}
        <button
          onClick={() => handleSaveOption('save')}
          disabled={isSaving || !frameHasUnsavedChanges}
          className={`px-[4px] py-[2px] rounded-l border transition-colors flex items-center gap-[2px] ${
            frameHasUnsavedChanges
              ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white border-[var(--color-primary)] cursor-pointer'
              : 'bg-[var(--color-bg-muted)] border-[var(--color-border)] text-[var(--color-text-muted)] cursor-default'
          }`}
          title={frameHasUnsavedChanges ? 'Save changes' : 'All changes saved'}
        >
          {isSaving ? (
            <div className="w-[8px] h-[8px] border border-white border-t-transparent rounded-full animate-spin" />
          ) : frameHasUnsavedChanges ? (
            <Save className="w-[10px] h-[10px]" />
          ) : (
            <div className="w-[6px] h-[6px] bg-green-400 rounded-full" />
          )}
          <span className="text-[8px] font-medium">
            {isSaving ? '...' : frameHasUnsavedChanges ? 'Save' : '✓'}
          </span>
        </button>
        
        {/* Dropdown Chevron */}
        <button
          onClick={() => frameHasUnsavedChanges && setShowSaveDropdown(!showSaveDropdown)}
          disabled={isSaving || !frameHasUnsavedChanges}
          className={`px-[3px] py-[2px] rounded-r border border-l-0 transition-colors ${
            frameHasUnsavedChanges
              ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white border-[var(--color-primary)] cursor-pointer'
              : 'bg-[var(--color-bg-muted)] border-[var(--color-border)] text-[var(--color-text-muted)] cursor-default'
          }`}
          title="Save options"
        >
          <ChevronDown className={`w-[10px] h-[10px] transition-transform ${
            showSaveDropdown ? 'rotate-180' : ''
          }`} />
        </button>
      </div>
      
      {/* Save Options Dropdown */}
      {showSaveDropdown && frameHasUnsavedChanges && (
        <div className="absolute top-full left-0 mt-[2px] w-32 bg-[var(--color-surface)] border border-[var(--color-border)] rounded shadow-lg z-50">
          <div className="p-[2px]">
            <button
              onClick={() => handleSaveOption('save')}
              disabled={isSaving}
              className="w-full px-2 py-1 text-left hover:bg-[var(--color-bg-muted)] rounded text-[10px] transition-colors flex items-center gap-1"
            >
              <Save className="w-3 h-3" />
              <div className="font-medium">Quick Save</div>
            </button>
            
            <button
              onClick={() => handleSaveOption('revision')}
              disabled={isSaving}
              className="w-full px-2 py-1 text-left hover:bg-[var(--color-bg-muted)] rounded text-[10px] transition-colors flex items-center gap-1"
            >
              <History className="w-3 h-3" />
              <div className="font-medium">Create Revision</div>
            </button>
            
            <button
              onClick={() => handleSaveOption('auto-revision')}
              disabled={isSaving}
              className="w-full px-2 py-1 text-left hover:bg-[var(--color-bg-muted)] rounded text-[10px] transition-colors flex items-center gap-1"
            >
              <Circle className="w-3 h-3" />
              <div className="font-medium">Auto Revision</div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

  return (
    <>
      {/* Desktop & Tablet Header Right Section */}
      {(!isMobile || !onVoidPage) && (
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={3}
          className={`flex items-center relative flex-shrink-0 ${(onVoidPage || onForgePage || onSourcePage) ? 'gap-2' : 'gap-2.5'}`}
        >
        {/* === Void, Forge, and Source Page Right Elements === */}
        {(onVoidPage || onForgePage || onSourcePage) && (
          <>
            {/* Real-time Stacking Avatars - Only on Forge and Source Pages */}
            {(onForgePage || onSourcePage) && currentFrame && (
              <div className="flex items-center">
                <RealTimeStackingAvatars 
                  frameId={currentFrame.uuid}
                  currentMode={getCurrentMode()}
                />
              </div>
            )}

            {/* Connection Status Indicator - Forge/Source pages only */}
            {(onForgePage || onSourcePage) && currentFrame && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Connected"></div>
                <span className="text-[8px] text-green-500 font-medium">Live</span>
              </div>
            )}
            
            {/* Published Status Indicator - Void page only */}
            {onVoidPage && isPublished && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" title="Site is live"></div>
                <span className="text-[8px] text-green-500 font-medium">Published</span>
              </div>
            )}

            {/* Unified Save Button */}
            <SaveButton />

            {/* Comments - Void and Forge Pages - Hide for Viewer */}
            {(onVoidPage || onForgePage) && myRole !== 'viewer' && (
              <div className="flex flex-col items-center gap-0.5">
                <button
                  onClick={toggleCommentMode}
                  className={`p-0.5 rounded transition-colors ${
                    commentMode
                      ? 'bg-[var(--color-primary)]/20'
                      : 'hover:bg-[var(--color-bg-muted)]'
                  }`}
                  title={commentMode ? 'Exit comment mode' : 'Enter comment mode'}
                >
                  <MessageCircle className={`w-2.5 h-2.5 ${
                    commentMode
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`} />
                </button>
                <span className={`text-[7px] ${commentMode ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>Comments</span>
              </div>
            )}

            {/* Preview - Only on Forge Page */}
            {onForgePage && toggleForgePanel && (
              <div className="flex flex-col items-center gap-0.5">
                <button 
                  onClick={() => toggleForgePanel('preview-panel')}
                  className="p-0.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
                  title="Open interactive preview"
                >
                  <Eye className="w-2.5 h-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
                </button>
                <span className="text-[7px] text-[var(--color-text-muted)]">Preview</span>
              </div>
            )}

            {/* Share - Only on Void Page - Hide for Viewer */}
            {onVoidPage && myRole !== 'viewer' && (
              <div className="flex flex-col items-center gap-0.5">
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="p-0.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
                  title="Share project"
                >
                  <Share2 className="w-2.5 h-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
                </button>
                <span className="text-[7px] text-[var(--color-text-muted)]">Share</span>
              </div>
            )}

            {/* Export - Only visible in Void page */}
            {onVoidPage && myRole !== 'viewer' && currentProject && (
              <ExportDropdown 
                projectUuid={currentProject.uuid}
                projectName={currentProject.name}
                onExportStart={(type) => console.log('Export started:', type)}
                onExportComplete={(type, success) => console.log('Export completed:', type, success)}
              />
            )}

            {/* Edit/View Toggle - Hide for Viewer */}
            {myRole !== 'viewer' && (
              <BinaryToggle 
                activeMode={editMode} 
                setActiveMode={setEditMode}
                options={editOptions}
              />
            )}
          </>
        )}

        {/* === Projects Page Right Elements === */}
        {onProjectsPage && (
          <>
            {/* === Workspace Dropdown === */}
            <WorkspaceDropdown
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              onInviteClick={handleInviteClick}
            />

            {/* === Invite Button (Only for Owner/Editor) === */}
            {canInvite && (
              <button
                onClick={() => handleInviteClick(null)} // null will use current workspace
                className="flex items-center gap-2 px-3 py-2 bg-[var(--color-bg)] hover:bg-[var(--color-bg-hover)] rounded-lg text-[var(--color-text)] transition-colors shadow-sm shadow-[var(--color-primary)]"
                title="Invite team members"
              >
                <Users className="w-4 h-4" />
                <span className="hidden md:flex text-sm font-medium">Invite</span>
              </button>
            )}

            {/* === Mobile Search Button === */}
            <button
              onClick={onMobileSearchToggle}
              className="md:hidden p-1 rounded-full bg-[var(--color-bg-muted)]"
            >
              <Search className="text-[var(--color-text-muted)] w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* === Avatar (always present) === */}
        <UserDropdown 
          user={user} 
          type="profile" 
          dropdownOpen={profileDropdownOpen}
          setDropdownOpen={setProfileDropdownOpen}
        />

        {/* Publish Button - Only visible in Void page */}
        {onVoidPage && myRole !== 'viewer' && (
          <button 
            onClick={handlePublishClick}
            className="bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            <Upload className="w-3 h-3" />
            <span className="text-xs font-medium">
              {isPublished ? 'Update' : 'Publish'}
            </span>
          </button>
        )}
        </motion.div>
      )}


      {/* Mobile Floating Toolbar - Bottom Left (VOID PAGE ONLY) */}
      {onVoidPage && isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="fixed bottom-6 left-6 z-50"
        >
          {/* Single Horizontal Hotdog Container */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-bg)]/90 backdrop-blur-lg rounded-full shadow-2xl">
            
            {/* Void Page Controls */}
            {onVoidPage && (
            <>
              {/* Published Status Indicator */}
              {isPublished && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Site is live"></div>
                    <span className="text-xs text-green-500 font-medium">Live</span>
                  </div>
                  <div className="w-px h-6 bg-[var(--color-border)]" />
                </>
              )}

              {/* Comments Button */}
              {myRole !== 'viewer' && (
                <button
                  onClick={toggleCommentMode}
                  className={`p-2 rounded-full transition-all hover:scale-110 ${
                    commentMode
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                  title={commentMode ? 'Exit comment mode' : 'Enter comment mode'}
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              )}

              {/* Share Button */}
              {myRole !== 'viewer' && (
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:scale-110 transition-all"
                  title="Share project"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              )}

              {/* Export Button */}
              {myRole !== 'viewer' && currentProject && (
                <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:scale-110 transition-all">
                  <Download className="w-5 h-5" />
                </button>
              )}

              {/* Divider */}
              {myRole !== 'viewer' && (
                <div className="w-px h-6 bg-[var(--color-border)]" />
              )}

              {/* Edit/View Toggle */}
              {myRole !== 'viewer' && (
                <>
                  <button
                    onClick={() => setEditMode('edit')}
                    className={`p-2 rounded-full transition-all hover:scale-110 ${
                      editMode === 'edit'
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                    title="Edit mode"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setEditMode('view')}
                    className={`p-2 rounded-full transition-all hover:scale-110 ${
                      editMode === 'view'
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                    title="View mode"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Divider */}
              {myRole !== 'viewer' && (
                <div className="w-px h-6 bg-[var(--color-border)]" />
              )}

              {/* Publish Button */}
              {myRole !== 'viewer' && (
                <button 
                  onClick={handlePublishClick}
                  className="bg-[var(--color-primary)] text-white px-3 py-2 rounded-full flex items-center gap-2 hover:scale-110 transition-transform"
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {isPublished ? 'Update' : 'Publish'}
                  </span>
                </button>
              )}

              {myRole !== 'viewer' && (
                <div className="w-px h-6 bg-[var(--color-border)]" />
              )}
            </>
          )}

            {/* Avatar - Always present */}
            <div className="flex items-center">
              <UserDropdown 
                user={user} 
                type="profile" 
                dropdownOpen={profileDropdownOpen}
                setDropdownOpen={setProfileDropdownOpen}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Invite Modal */}
      <InviteModal
        show={showInviteModal}
        onClose={handleCloseInviteModal}
        workspaceId={inviteWorkspaceId}
        forceInviteMode={forceInviteMode}
      />

      {/* Share Modal */}
      <ShareModal
        show={showShareModal}
        onClose={() => setShowShareModal(false)}
        project={currentProject}
      />
    </>
  )
}

export default RightSection