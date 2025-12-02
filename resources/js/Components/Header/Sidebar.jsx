// @/Components/Header/Sidebar.jsx
import React, { useState, useEffect } from 'react'
import {
  User,
  Settings,
  Mail,
  FolderKanban,
  FolderPlus,
  LogOut,
  Users,
  Database,
  MessageSquare,
  Eye,
  Building
} from 'lucide-react'
import { motion } from 'framer-motion'
import { router, usePage } from '@inertiajs/react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import HoverUnderline from '@/Components/HoverUnderline'
import Modal from '@/Components/Modal'
import Edit from '@/Pages/Profile/Edit'
import FeedbackReportPage from '@/Pages/Admin/FeedbackReportPage'
import AssetManagerPage from '@/Pages/Admin/AssetManagerPage'
import UserManagementPage from '@/Pages/Admin/UserManagementPage'
import ProjectOversightPage from '@/Pages/Admin/ProjectOversightPage'
import CreateWorkspaceModal from '@/Components/Workspaces/CreateWorkspaceModal'

const sidebarItemsTop = [
  { label: 'Account', icon: <User /> },
  { label: 'Settings', icon: <Settings /> },
  { label: 'Contact', icon: <Mail /> },
]

const sidebarItemsBottom = [
  { label: 'All', icon: <FolderKanban /> },
  { label: 'New Workspace', icon: <FolderPlus /> },
]

const adminNavItems = [
  { 
    label: 'User Management', 
    icon: <Users />, 
    route: 'admin.user' 
  },
  { 
    label: 'Asset Management', 
    icon: <Database />, 
    route: 'admin.asset' 
  },
  { 
    label: 'Feedback Report', 
    icon: <MessageSquare />, 
    route: 'admin.feedback' 
  },
  { 
    label: 'Project Oversight', 
    icon: <Eye />, 
    route: 'admin.oversight' 
  },
]

const Sidebar = ({ isOpen, onClose }) => {
  const { props } = usePage()
  const user = props.auth?.user
  const avatar = user?.avatar
  const avatarInitial = user?.name?.charAt(0)?.toUpperCase()
  // Now using is_admin (Laravel's snake_case convention)
  const isAdmin = user?.is_admin
  
  const [showModal, setShowModal] = useState(false)
  const [modalText, setModalText] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false)

  const { currentWorkspace } = useWorkspaceStore()

  const logout = () => router.post('/logout')

  // Get current user's role in workspace
  const getCurrentUserRole = () => {
    if (!currentWorkspace || !user) return null
    if (currentWorkspace.owner?.id === user.id) return 'owner'
    const userInWorkspace = currentWorkspace.users?.find(u => u.id === user.id)
    return userInWorkspace?.role || null
  }

  const handleItemClick = (label) => {
    if (label === 'New Workspace') {
      onClose()
      setShowCreateWorkspaceModal(true)
      return
    }

    setModalText(label)
    setShowModal(true)
    setLoading(true)

    // Simulate loading delay (replace this later with actual async fetch if needed)
    setTimeout(() => setLoading(false), 400)
  }

  const handleAdminNavClick = (route, label) => {
    // Open all admin items in modal
    setModalText(label)
    setShowModal(true)
    setLoading(true)
    // Simulate loading delay for consistency
    setTimeout(() => setLoading(false), 400)
  }

  const handleWorkspaceSettings = () => {
    onClose()
    if (currentWorkspace) {
      router.visit(`/workspaces/${currentWorkspace.id}/settings`)
    }
  }

  const renderModalContent = () => {
    if (loading) return (
      <div className="flex justify-center items-center h-40">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <svg
            className="w-6 h-6 animate-spin text-[color:var(--color-primary)]"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </motion.div>
      </div>
    )
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {modalText === 'Account' && <Edit />}
        {modalText === 'Settings' && (
          <p className="text-sm text-center mt-4">Settings modal content goes here.</p>
        )}
        {modalText === 'Contact' && (
          <p className="text-sm text-center mt-4">Contact modal content goes here.</p>
        )}
        {modalText === 'Feedback Report' && <FeedbackReportPage />}
        {modalText === 'User Management' && <UserManagementPage />}
        {modalText === 'Asset Management' && <AssetManagerPage />}
        {modalText === 'Project Oversight' && <ProjectOversightPage />}
      </motion.div>
    )
  }

  return (
    <>
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        exit={{ x: '-110%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-[56px] md:top-[56px] left-0 z-40 h-[calc(100vh-56px)] md:h-full w-full md:w-64 bg-[var(--color-surface)] shadow-xl md:rounded-xl flex flex-col md:ml-4 md:my-4 overflow-hidden"
      >
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-4">
          <div className="space-y-6">
            {/* Current Workspace Info */}
            {currentWorkspace && (
              <div className="border-b border-[var(--color-border)] pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <HoverUnderline className="font-medium text-[var(--color-text)] truncate">
                    {currentWorkspace.name}
                  </HoverUnderline>
                  {currentWorkspace.type === 'personal' && (
                    <span className="text-xs bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] px-2 py-0.5 rounded">
                      Personal
                    </span>
                  )}
                </div>
                <button
                  onClick={handleWorkspaceSettings}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  Workspace Settings
                </button>
              </div>
            )}

            {/* User Navigation Section */}
            <div className="space-y-4">
              <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                User
              </div>
              {sidebarItemsTop.map((item, i) => (
                <button
                  onClick={() => handleItemClick(item.label)}
                  key={i}
                  className="flex items-center gap-3 text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {item.icon}
                  <HoverUnderline>{item.label}</HoverUnderline>
                </button>
              ))}
            </div>

            {/* Workspace Navigation Section */}
            <div className="space-y-4">
              <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                Workspace
              </div>
              {sidebarItemsBottom.map((item, i) => (
                <button
                  onClick={() => handleItemClick(item.label)}
                  key={i}
                  className="flex items-center gap-3 text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {item.icon}
                  <HoverUnderline>{item.label}</HoverUnderline>
                </button>
              ))}
            </div>

            {/* Admin Navigation Section */}
            {isAdmin && (
              <div className="space-y-4">
                <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                  Admin
                </div>
                {adminNavItems.map((item, i) => (
                  <button
                    onClick={() => handleAdminNavClick(item.route, item.label)}
                    key={i}
                    className="flex items-center gap-3 text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {item.icon}
                    <HoverUnderline>{item.label}</HoverUnderline>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fixed bottom section */}
        <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200/20">
          <div className="flex items-center justify-between">
            <div className="text-[var(--color-text-muted)] text-sm">
              {currentWorkspace ? currentWorkspace.name : 'My Workspace'}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  avatarInitial || 'U'
                )}
              </div>
              <LogOut
                onClick={logout}
                className="w-5 h-5 text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-danger)] transition-colors"
              />
            </div>
          </div>
        </div>
      </motion.aside>

      <Modal show={showModal} title={modalText} onClose={() => setShowModal(false)}>
        {renderModalContent()}
      </Modal>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal 
        show={showCreateWorkspaceModal}
        onClose={() => setShowCreateWorkspaceModal(false)}
      />
    </>
  )
}

export default Sidebar