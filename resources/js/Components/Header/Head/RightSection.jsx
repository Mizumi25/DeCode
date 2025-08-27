import React from 'react'
import { Search, Play, MessageCircle, Share2, Download, Edit3, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import UserDropdown from './UserDropdown'
import StackingAvatars from './StackingAvatars'
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
  const onProjectsPage = currentRoute === '/projects' || currentRoute.includes('/projects')
  const onVoidPage = currentRoute === '/void' || currentRoute.includes('/void')
  const onForgePage = currentRoute === '/forge' || currentRoute.includes('/forge')
  const onSourcePage = currentRoute === '/source' || currentRoute.includes('/source')

  const editOptions = [
    { key: 'edit', icon: Edit3 },
    { key: 'view', icon: Eye }
  ]

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      custom={3}
      className={`flex items-center relative flex-shrink-0 ${(onVoidPage || onForgePage || onSourcePage) ? 'gap-1' : 'gap-2.5'}`}
    >
      {/* === Void, Forge, and Source Page Right Elements === */}
      {(onVoidPage || onForgePage || onSourcePage) && (
        <>
          {/* Stacking Avatars - Only on Forge and Source Pages */}
          {(onForgePage || onSourcePage) && <StackingAvatars />}

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
          {/* === Workspace Dropdown (hidden on mobile) === */}
          <UserDropdown 
            user={user} 
            type="workspace" 
            dropdownOpen={workspaceDropdownOpen}
            setDropdownOpen={setWorkspaceDropdownOpen}
          />

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
      <button className="bg-[var(--color-primary)] text-white px-2 py-1 rounded-lg flex items-center justify-center shadow-md">
        <Play className="w-3 h-3" />
      </button>
    </motion.div>
  )
}

export default RightSection