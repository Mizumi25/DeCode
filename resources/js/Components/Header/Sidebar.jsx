


import React from 'react'
import {
  User,
  Settings,
  Mail,
  FolderKanban,
  Archive,
  FolderPlus,
  LogOut,
  Menu,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { router, usePage } from '@inertiajs/react'

const sidebarItemsTop = [
  { label: 'Account', icon: <User />, link: '/profile' },
  { label: 'Settings', icon: <Settings />, link: '/settings' },
  { label: 'Contact', icon: <Mail />, link: '/contact' },
]

const sidebarItemsBottom = [
  { label: 'All', icon: <FolderKanban />, link: '/projects' },
  { label: 'Archive', icon: <Archive />, link: '/projects/archive' },
  { label: 'New Folder', icon: <FolderPlus />, link: '/projects/create-folder' },
]

const Sidebar = ({ isOpen, onClose }) => {
  const { props } = usePage()
  const user = props.auth?.user
  const avatar = user?.avatar
  const avatarInitial = user?.name?.charAt(0)?.toUpperCase()

  const logout = () => router.post('/logout')

  return (
    <motion.aside
      initial={{ x: '-100%' }}
      animate={{ x: isOpen ? 0 : '-100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-[64px] md:top-0 left-0 z-40 md:z-auto h-[calc(100vh-64px)] md:h-full w-full md:w-64 bg-[var(--color-surface)] shadow-xl md:rounded-xl p-6 flex flex-col justify-between space-y-6 md:ml-4 md:my-4"
    >
      <div className="space-y-6">
        {sidebarItemsTop.map((item, i) => (
          <a
            href={item.link}
            key={i}
            className="flex items-center gap-3 text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
          >
            {item.icon}
            <span>{item.label}</span>
          </a>
        ))}

        <div className="h-6" /> {/* Spacer */}

        {sidebarItemsBottom.map((item, i) => (
          <a
            href={item.link}
            key={i}
            className="flex items-center gap-3 text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
          >
            {item.icon}
            <span>{item.label}</span>
          </a>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[var(--color-text-muted)] text-sm">My Workspace</div>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm overflow-hidden"
          >
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
    </motion.aside>
  )
}

export default Sidebar
