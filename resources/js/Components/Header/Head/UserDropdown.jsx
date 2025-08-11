import React from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { router } from '@inertiajs/react'

const UserDropdown = ({ 
  user, 
  onLogout, 
  type = 'workspace',
  dropdownOpen,
  setDropdownOpen
}) => {
  const handleLogout = () => {
    setDropdownOpen(false)
    if (onLogout) {
      onLogout()
    } else {
      router.post('/logout')
    }
  }

  const handleProfileClick = () => {
    setDropdownOpen(false)
    router.visit('/profile')
  }

  if (type === 'workspace') {
    return (
      <div
        className="hidden md:flex items-center gap-1 cursor-pointer relative"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span className="text-[var(--color-text)] font-medium text-sm">My Workspace</span>
        <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="absolute top-full mt-2 right-0 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-lg z-50"
            >
              <ul className="text-sm text-[var(--color-text)] divide-y divide-[var(--color-border)]">
                <li className="px-4 py-2 hover:bg-[var(--color-bg-muted)] cursor-pointer">
                  Workspace Settings
                </li>
                <li className="px-4 py-2 hover:bg-[var(--color-bg-muted)] cursor-pointer" onClick={handleLogout}>
                  Logout
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Profile dropdown
  const avatar = user?.avatar
  const avatarInitial = user?.name?.charAt(0)?.toUpperCase()

  return (
    <div className="relative hidden md:block">
      <div
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs cursor-pointer overflow-hidden"
      >
        {avatar ? (
          <img src={avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
        ) : (
          avatarInitial || 'U'
        )}
      </div>
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="absolute right-0 mt-2 w-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-lg z-50"
          >
            <ul className="text-sm text-[var(--color-text)] divide-y divide-[var(--color-border)]">
              <li
                className="px-4 py-2 hover:bg-[var(--color-bg-muted)] cursor-pointer"
                onClick={handleProfileClick}
              >
                Profile
              </li>
              <li
                className="px-4 py-2 hover:bg-[var(--color-bg-muted)] cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserDropdown