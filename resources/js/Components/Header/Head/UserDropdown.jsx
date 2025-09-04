import React, { useState } from 'react'
import { 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Crown,
  Shield,
  Bell,
  HelpCircle,
  Moon,
  Sun,
  Mail,
  Building,
  CreditCard,
  Activity
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { router } from '@inertiajs/react'
import { useThemeStore } from '@/stores/useThemeStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import Modal from '@/Components/Modal'
import Edit from '@/Pages/Profile/Edit'

const UserDropdown = ({ 
  user, 
  onLogout, 
  type = 'workspace',
  dropdownOpen,
  setDropdownOpen
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const { isDark, toggleTheme } = useThemeStore()
  const { currentWorkspace } = useWorkspaceStore()

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
    setShowProfileModal(true)
  }

  const handleThemeToggle = () => {
    toggleTheme()
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
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ 
                type: "spring",
                damping: 20,
                stiffness: 300,
                duration: 0.2 
              }}
              className="absolute top-full mt-3 right-0 w-52 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden backdrop-blur-sm"
            >
              <div className="p-2 space-y-1">
                <motion.button
                  whileHover={{ backgroundColor: 'var(--color-bg-muted)', x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left px-3 py-2.5 text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] rounded-lg transition-colors flex items-center gap-3"
                >
                  <Settings className="w-4 h-4" />
                  Workspace Settings
                </motion.button>
                <div className="border-t border-[var(--color-border)] my-1"></div>
                <motion.button
                  whileHover={{ backgroundColor: 'var(--color-bg-muted)', x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Enhanced Profile dropdown
  const avatar = user?.avatar
  const avatarInitial = user?.name?.charAt(0)?.toUpperCase()
  const userName = user?.name || 'User'
  const userEmail = user?.email || ''
  const isAdmin = user?.is_admin
  const isPremium = user?.subscription_type === 'premium' // Assuming this field exists

  return (
    <>
      <div className="relative hidden md:block">
        <motion.div
          onClick={() => setDropdownOpen(!dropdownOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-semibold text-sm cursor-pointer overflow-hidden shadow-md ring-2 ring-white/20 transition-all duration-200"
        >
          {avatar ? (
            <img 
              src={avatar} 
              alt={userName}
              className="w-full h-full object-cover rounded-full" 
            />
          ) : (
            avatarInitial || 'U'
          )}
        </motion.div>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ 
                type: "spring",
                damping: 20,
                stiffness: 300,
                duration: 0.2 
              }}
              className="absolute right-0 mt-3 w-80 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden backdrop-blur-sm"
            >
              {/* User Info Header */}
              <div className="p-4 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-semibold text-lg overflow-hidden shadow-lg">
                      {avatar ? (
                        <img 
                          src={avatar} 
                          alt={userName}
                          className="w-full h-full object-cover rounded-full" 
                        />
                      ) : (
                        avatarInitial || 'U'
                      )}
                    </div>
                    {/* Status indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[var(--color-text)] truncate">
                        {userName}
                      </h3>
                      {isAdmin && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                          <Shield className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Admin</span>
                        </div>
                      )}
                      {isPremium && (
                        <Crown className="w-4 h-4 text-yellow-500" title="Premium Member" />
                      )}
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)] truncate">
                      {userEmail}
                    </p>
                    {currentWorkspace && (
                      <div className="flex items-center gap-1 mt-1">
                        <Building className="w-3 h-3 text-[var(--color-text-muted)]" />
                        <span className="text-xs text-[var(--color-text-muted)] truncate">
                          {currentWorkspace.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2 space-y-1">
                <motion.button
                  whileHover={{ backgroundColor: 'var(--color-bg-muted)', x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProfileClick}
                  className="w-full text-left px-3 py-2.5 text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] rounded-lg transition-colors flex items-center gap-3"
                >
                  <User className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="font-medium">Profile Settings</div>
                    <div className="text-xs text-[var(--color-text-muted)]">Manage your account</div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ backgroundColor: 'var(--color-bg-muted)', x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left px-3 py-2.5 text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] rounded-lg transition-colors flex items-center gap-3"
                >
                  <Bell className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="font-medium">Notifications</div>
                    <div className="text-xs text-[var(--color-text-muted)]">Alerts & updates</div>
                  </div>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </motion.button>

                <motion.button
                  whileHover={{ backgroundColor: 'var(--color-bg-muted)', x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left px-3 py-2.5 text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] rounded-lg transition-colors flex items-center gap-3"
                >
                  <CreditCard className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="font-medium">Billing</div>
                    <div className="text-xs text-[var(--color-text-muted)]">Subscription & payments</div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ backgroundColor: 'var(--color-bg-muted)', x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left px-3 py-2.5 text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] rounded-lg transition-colors flex items-center gap-3"
                >
                  <Activity className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="font-medium">Activity Log</div>
                    <div className="text-xs text-[var(--color-text-muted)]">Recent actions</div>
                  </div>
                </motion.button>

                <div className="border-t border-[var(--color-border)] my-2"></div>

                <motion.button
                  whileHover={{ backgroundColor: 'var(--color-bg-muted)', x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleThemeToggle}
                  className="w-full text-left px-3 py-2.5 text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] rounded-lg transition-colors flex items-center gap-3"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <div className="flex-1">
                    <div className="font-medium">
                      Switch to {isDark ? 'Light' : 'Dark'} Mode
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      Current: {isDark ? 'Dark' : 'Light'} theme
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ backgroundColor: 'var(--color-bg-muted)', x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left px-3 py-2.5 text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] rounded-lg transition-colors flex items-center gap-3"
                >
                  <HelpCircle className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="font-medium">Help & Support</div>
                    <div className="text-xs text-[var(--color-text-muted)]">Get assistance</div>
                  </div>
                </motion.button>

                <div className="border-t border-[var(--color-border)] my-2"></div>

                <motion.button
                  whileHover={{ backgroundColor: 'var(--color-bg-muted)', x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="font-medium">Sign Out</div>
                    <div className="text-xs text-red-400">End current session</div>
                  </div>
                </motion.button>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-[var(--color-bg-muted)] border-t border-[var(--color-border)]">
                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                  <div>DeCode v1.0.0</div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span>Support</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile Modal */}
      <Modal 
        show={showProfileModal} 
        title="Profile Settings" 
        onClose={() => setShowProfileModal(false)}
        maxWidth="4xl"
      >
        <Edit />
      </Modal>
    </>
  )
}

export default UserDropdown