// @/Components/Header/Head/RightSection.jsx
import React, { useState } from 'react'
import { Search, Play, MessageCircle, Share2, Download, Edit3, Eye, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePage } from '@inertiajs/react'
import UserDropdown from './UserDropdown'
import WorkspaceDropdown from './WorkspaceDropdown'
import InviteModal from '@/Components/Workspaces/InviteModal'
import RealTimeStackingAvatars from './RealTimeStackingAvatars'
import BinaryToggle from './BinaryToggle'

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
  setProfileDropdownOpen
}) => {
  const { props, url } = usePage()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteWorkspaceId, setInviteWorkspaceId] = useState(null)
  const [forceInviteMode, setForceInviteMode] = useState(false)

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

  return (
    <>
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

            {/* Connection Status Indicator */}
            {(onForgePage || onSourcePage) && currentFrame && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Connected"></div>
                <span className="text-[8px] text-green-500 font-medium">Live</span>
              </div>
            )}

            {/* Saved Indicator */}
            <div className="px-1.5 py-0.5 bg-[var(--color-bg-muted)] rounded">
              <span className="text-[8px] text-green-500 font-medium">Saved</span>
            </div>

            {/* Comments - Only on Void Page */}
            {onVoidPage && (
              <div className="flex flex-col items-center gap-0.5">
                <button className="p-0.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
                  <MessageCircle className="w-2.5 h-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
                </button>
                <span className="text-[7px] text-[var(--color-text-muted)]">Comments</span>
              </div>
            )}

            {/* Share - Only on Void Page */}
            {onVoidPage && (
              <div className="flex flex-col items-center gap-0.5">
                <button className="p-0.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
                  <Share2 className="w-2.5 h-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
                </button>
                <span className="text-[7px] text-[var(--color-text-muted)]">Share</span>
              </div>
            )}

            {/* Export */}
            <div className="flex flex-col items-center gap-0.5">
              <button className="p-0.5 bg-pink-100 dark:bg-pink-900/30 hover:bg-pink-200 dark:hover:bg-pink-900/50 rounded transition-colors">
                <Download className="w-2.5 h-2.5 text-pink-600 dark:text-pink-400" />
              </button>
              <span className="text-[7px] text-[var(--color-text-muted)]">Export</span>
            </div>

            {/* Edit/View Toggle */}
            <BinaryToggle 
              activeMode={editMode} 
              setActiveMode={setEditMode}
              options={editOptions}
            />
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

            {/* === Invite Button === */}
            <button
              onClick={() => handleInviteClick(null)} // null will use current workspace
              className="hidden md:flex items-center gap-2 px-3 py-2 bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] transition-colors"
              title="Invite team members"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Invite</span>
            </button>

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

        {/* === Preview Button (always present) === */}
        <button className="bg-[var(--color-primary)] text-white px-2 py-1 rounded-lg flex items-center justify-center shadow-md hover:bg-[var(--color-primary-hover)] transition-colors">
          <Play className="w-3 h-3" />
        </button>
      </motion.div>

      {/* Invite Modal */}
      <InviteModal
        show={showInviteModal}
        onClose={handleCloseInviteModal}
        workspaceId={inviteWorkspaceId}
        forceInviteMode={forceInviteMode}
      />
    </>
  )
}

export default RightSection