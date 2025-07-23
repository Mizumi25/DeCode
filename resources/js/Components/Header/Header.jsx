


import React, { useState, useEffect } from 'react'
import {
  Sun,
  Search,
  ChevronDown,
  Play,
  Menu,
  Moon,
  X
} from 'lucide-react'
import { router, usePage } from '@inertiajs/react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/Components/Header/Sidebar'

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

export default function Header({ isAuthenticated = true, currentRoute = '/projects' }) {
  const { props } = usePage()
  const user = props.auth?.user
  const onProjectsPage = isAuthenticated && currentRoute === '/projects'

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', systemDark)
      setIsDark(systemDark)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', !isDark)
    setIsDark(!isDark)
  }

  const logout = () => router.post('/logout')

  const avatar = user?.avatar
  const avatarInitial = user?.name?.charAt(0)?.toUpperCase()

  const toggleMobileSearch = () => {
    setMobileSearchOpen(prev => !prev)
  }

  return (
    <>
    <header className="w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm px-4 py-2 z-50 relative">
      <div className="flex items-center justify-between relative flex-wrap gap-2">
        {/* === Left Section === */}
        {onProjectsPage && (
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={1}
            className="flex items-center gap-3"
          >
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="p-2 rounded-lg bg-[var(--color-bg-muted)] shadow-md"
            >
              {sidebarOpen ? (
                <X className="text-[var(--color-text-muted)] w-5 h-5" />
              ) : (
                <Menu className="text-[var(--color-text-muted)] w-5 h-5" />
              )}
            </button>
            
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm font-bold">
              ⬤
            </div>

            <span className="text-[var(--color-text)] text-lg font-semibold">DeCode</span>

            <div onClick={toggleTheme} className="ml-4 cursor-pointer">
              <div className="w-14 h-7 bg-[var(--color-bg-muted)] rounded-full flex items-center px-1 relative">
                <motion.div
                  className="absolute w-5 h-5 rounded-full flex items-center justify-center shadow bg-white"
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{ left: isDark ? 'calc(100% - 1.25rem)' : '0.25rem' }}
                >
                  {isDark ? (
                    <Moon className="text-[var(--color-primary)] w-4 h-4" />
                  ) : (
                    <Sun className="text-[var(--color-primary)] w-4 h-4" />
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* === Desktop Searchbar === */}
        {onProjectsPage && (
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={2}
            className="hidden md:block flex-grow px-10"
          >
            <div className="relative w-full max-w-xl mx-auto">
              <div className="flex items-center gap-2 bg-[var(--color-bg-muted)] px-4 py-2 rounded-full shadow-sm w-full">
                <Search className="text-[var(--color-text-muted)] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search Project"
                  className="bg-transparent focus:outline-none outline-none border-none text-sm text-[var(--color-text)] flex-1"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* === Right Section === */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={3}
          className="flex items-center gap-4 relative"
        >
          {/* === Workspace Dropdown (hidden on mobile) === */}
          <div
            className="hidden md:flex items-center gap-1 cursor-pointer relative"
            onClick={() => {
              setDropdownOpen(!dropdownOpen)
              setProfileDropdownOpen(false)
            }}
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
                    <li className="px-4 py-2 hover:bg-[var(--color-bg-muted)] cursor-pointer">Workspace Settings</li>
                    <li className="px-4 py-2 hover:bg-[var(--color-bg-muted)] cursor-pointer" onClick={logout}>
                      Logout
                    </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* === Avatar (hidden on mobile) === */}
          <div className="relative hidden md:block">
            <div
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen)
                setDropdownOpen(false)
              }}
              className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm cursor-pointer overflow-hidden"
            >
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                avatarInitial || 'U'
              )}
            </div>

            <AnimatePresence>
              {profileDropdownOpen && (
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
                      onClick={() => router.visit('/profile')}
                    >
                      Profile
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-[var(--color-bg-muted)] cursor-pointer"
                      onClick={logout}
                    >
                      Logout
                    </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* === Mobile Search Button === */}
          {onProjectsPage && (
            <button
              onClick={toggleMobileSearch}
              className="md:hidden p-2 rounded-full bg-[var(--color-bg-muted)]"
            >
              <Search className="text-[var(--color-text-muted)] w-5 h-5" />
            </button>
          )}

          {/* === Play Button === */}
          <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md">
            <Play className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* === Mobile Search Dropdown === */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 w-full z-40 bg-[var(--color-surface)] border-t border-[var(--color-border)] px-4 py-3"
          >
            <div className="flex items-center gap-2 bg-[var(--color-bg-muted)] px-4 py-2 rounded-full shadow-sm">
              <Search className="text-[var(--color-text-muted)] w-5 h-5" />
              <input
                type="text"
                placeholder="Search Project"
                className="bg-transparent outline-none border-none text-sm text-[var(--color-text)] flex-1"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    
    <AnimatePresence>{sidebarOpen && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}</AnimatePresence>
    </>
  )
}
