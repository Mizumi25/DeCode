import { useEffect, useState } from 'react'
import {
  User,
  Settings,
  Mail,
  FolderKanban,
  Archive,
  FolderPlus,
  LogOut,
  Users,
  Database,
  MessageSquare,
  Eye
} from 'lucide-react'
import { motion } from 'framer-motion'
import { router, usePage } from '@inertiajs/react'
import Modal from '@/Components/Modal'
import Edit from '@/Pages/Profile/Edit'
import FeedbackReportPage from '@/Pages/Admin/FeedbackReportPage'

const sidebarItemsTop = [
  { label: 'Account', icon: <User /> },
  { label: 'Settings', icon: <Settings /> },
  { label: 'Contact', icon: <Mail /> },
]

const sidebarItemsBottom = [
  { label: 'All', icon: <FolderKanban /> },
  { label: 'Archive', icon: <Archive /> },
  { label: 'New Folder', icon: <FolderPlus /> },
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
  const isAdmin = user?.isAdmin
  const [showModal, setShowModal] = useState(false)
  const [modalText, setModalText] = useState('')
  const [loading, setLoading] = useState(false)

  const logout = () => router.post('/logout')

  const handleItemClick = (label) => {
    setModalText(label)
    setShowModal(true)
    setLoading(true)

    // Simulate loading delay (replace this later with actual async fetch if needed)
    setTimeout(() => setLoading(false), 400)
  }

  const handleAdminNavClick = (route, label) => {
    if (label === 'Feedback Report') {
      setModalText(label)
      setShowModal(true)
      setLoading(true)
      // Simulate loading delay for consistency
      setTimeout(() => setLoading(false), 400)
    } else {
      router.get(route)
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
        </motion.div>
      )
    }


  return (
    <motion.aside
      initial={{ x: '-100%' }}
      animate={{ x: isOpen ? 0 : '-100%' }}
      exit={{ x: '-110%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-[64px] md:top-[64px] left-0 z-40 h-[calc(100vh-64px)] md:h-full w-full md:w-64 bg-[var(--color-surface)] shadow-xl md:rounded-xl p-6 flex flex-col justify-between space-y-6 md:ml-4 md:my-4"
    >
      <div className="space-y-6">
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
              <span>{item.label}</span>
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
              <span>{item.label}</span>
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
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[var(--color-text-muted)] text-sm">My Workspace</div>
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
            className="w-5 h-5 text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-danger)]"
          />
        </div>
      </div>

      <Modal show={showModal} title={modalText} onClose={() => setShowModal(false)}>
        {renderModalContent()}
      </Modal>
    </motion.aside>
  )
}

export default Sidebar