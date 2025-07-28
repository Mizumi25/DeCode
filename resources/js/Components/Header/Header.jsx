import React, { useState, useEffect } from 'react'
import {
  Sun,
  Search,
  ChevronDown,
  Play,
  Menu,
  Moon,
  X,
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Minus,
  Plus,
  MousePointer,
  Hand,
  MessageCircle,
  Share2,
  Download,
  Edit3,
  Eye,
  Lock,
  Component,
  Code,
  Puzzle,
  Layers,
  Grid3X3,
  MousePointer2
} from 'lucide-react'
import { router, usePage } from '@inertiajs/react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/Components/Header/Sidebar'

const MiddlePanelControls = ({ currentRoute, onPanelToggle, panelStates = {} }) => {
  const onForgePage = currentRoute === '/forge'
  const onSourcePage = currentRoute === '/source'

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      {/* Forge/Components Panel Toggle - First Icon */}
      <button 
        onClick={() => onPanelToggle && onPanelToggle('forge')}
        className={`p-1.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors ${
          panelStates.forge ? 'bg-[var(--color-primary)] text-white' : ''
        }`}
        title="Toggle Forge Panel"
      >
        <Component className={`w-3.5 h-3.5 ${onForgePage || panelStates.forge ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`} />
      </button>

      {/* Source Panel Toggle - Second Icon */}
      <button 
        onClick={() => onPanelToggle && onPanelToggle('source')}
        className={`p-1.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors ${
          panelStates.source ? 'bg-[var(--color-primary)] text-white' : ''
        }`}
        title="Toggle Source Panel"
      >
        <Code className={`w-3.5 h-3.5 ${onSourcePage || panelStates.source ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`} />
      </button>

      <button className="p-1.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
       <Puzzle className="w-3.5 h-3.5 text-[var(--color-text)]" />
     </button>

      {/* Layers - Inactive */}
     <button className="p-1.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
        <Layers className="w-3.5 h-3.5 text-[var(--color-text)]" />
      </button>

            {/* Paneling - Inactive */}
       <button className="p-1.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
         <Grid3X3 className="w-3.5 h-3.5 text-[var(--color-text)]" />
      </button>
    </div>
  )
}

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

// Responsive Toggle Component for Desktop/Tablet/Mobile
const ResponsiveToggle = ({ activeMode, setActiveMode }) => {
  const modes = [
    { key: 'desktop', icon: Monitor, label: 'Desktop' },
    { key: 'tablet', icon: Tablet, label: 'Tablet' },
    { key: 'mobile', icon: Smartphone, label: 'Mobile' }
  ]

  return (
    <div className="flex items-center bg-[var(--color-bg-muted)] rounded-md p-0.5">
      {modes.map((mode) => {
        const Icon = mode.icon
        return (
          <button
            key={mode.key}
            onClick={() => setActiveMode(mode.key)}
            className={`relative px-2 py-1 rounded transition-all duration-200 ${
              activeMode === mode.key
                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Icon className="w-3 h-3" />
          </button>
        )
      })}
    </div>
  )
}

// Binary Toggle Component for Cursor/Hand and Edit/View toggles
const BinaryToggle = ({ activeMode, setActiveMode, options }) => {
  return (
    <div className="flex items-center bg-[var(--color-bg-muted)] rounded-md p-0.5">
      {options.map((option) => {
        const Icon = option.icon
        return (
          <button
            key={option.key}
            onClick={() => setActiveMode(option.key)}
            className={`relative px-2 py-1 rounded transition-all duration-200 ${
              activeMode === option.key
                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Icon className="w-3 h-3" />
          </button>
        )
      })}
    </div>
  )
}

// Navigation Dropdown Component for Forge page
const NavigationDropdown = ({ activeNav, setActiveNav, onModeSwitch }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navOptions = ['Forge', 'Source']

  const handleNavChange = (option) => {
    setActiveNav(option)
    setDropdownOpen(false)
    
    // Call the mode switch function
    if (onModeSwitch) {
      onModeSwitch(option.toLowerCase())
    }
  }

  return (
    <div className="relative">
      <div
        className="flex items-center gap-1 cursor-pointer"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span className="text-[var(--color-text)] font-medium text-sm">{activeNav}</span>
        <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
      </div>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="absolute top-full mt-2 left-0 w-32 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-lg z-50"
          >
          <ul className="text-sm text-[var(--color-text)]">
              {navOptions.map((option) => (
                <li
                  key={option}
                  className="px-4 py-2 hover:bg-[var(--color-bg-muted)] cursor-pointer"
                  onClick={() => handleNavChange(option)}
                >
                  {option}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Stacking Avatars Component for Forge page
const StackingAvatars = () => {
  const collaborators = [
    { id: 1, color: 'bg-blue-500', initial: 'A' },
    { id: 2, color: 'bg-green-500', initial: 'B' },
    { id: 3, color: 'bg-purple-500', initial: 'C' }
  ]

  return (
    <div className="flex items-center -space-x-1.5">
      {collaborators.map((collaborator, index) => (
        <div
          key={collaborator.id}
          className={`w-5 h-5 rounded-full ${collaborator.color} text-white flex items-center justify-center font-bold text-xs border-2 border-[var(--color-surface)] z-${10 - index}`}
          style={{ zIndex: 10 - index }}
        >
          {collaborator.initial}
        </div>
      ))}
    </div>
  )
}

export default function Header({ isAuthenticated = true, currentRoute = '/projects', onThemeChange, onPanelToggle, panelStates = {}, onModeSwitch  }) {
  const { props } = usePage()
  const user = props.auth?.user
  const onProjectsPage = isAuthenticated && currentRoute === '/projects'
  const onVoidPage = isAuthenticated && currentRoute === '/void'
  const onForgePage = isAuthenticated && (currentRoute === '/forge' || currentRoute.includes('/forge'))
  const onSourcePage = isAuthenticated && (currentRoute === '/source' || currentRoute.includes('/source'))


  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Void and Forge page specific states
  const [responsiveMode, setResponsiveMode] = useState('desktop')
  const [zoomLevel, setZoomLevel] = useState(80)
  const [interactionMode, setInteractionMode] = useState('cursor')
  const [editMode, setEditMode] = useState('edit')

  // Forge and Source page specific states
  const [activeNav, setActiveNav] = useState(() => {
    if (onForgePage) return 'Forge'
    if (onSourcePage) return 'Source'
    return 'Forge'
  })
  const [inspectMode, setInspectMode] = useState(false)
  
  useEffect(() => {
    if (onForgePage) setActiveNav('Forge')
    else if (onSourcePage) setActiveNav('Source')
  }, [onForgePage, onSourcePage])

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

  // Notify parent component about theme changes
  useEffect(() => {
    if (onThemeChange) {
      onThemeChange(isDark)
    }
  }, [isDark, onThemeChange])

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

  const interactionOptions = [
    { key: 'cursor', icon: MousePointer },
    { key: 'hand', icon: Hand }
  ]

  const editOptions = [
    { key: 'edit', icon: Edit3 },
    { key: 'view', icon: Eye }
  ]

  return (
    <>
    <header className="w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm px-3 py-2 z-50 relative">
      <div className={`flex items-center relative ${(onVoidPage || onForgePage || onSourcePage) ? 'justify-between gap-4' : 'justify-between flex-wrap gap-2'}`}>
        {/* === Left Section === */}
        {(onProjectsPage || onVoidPage || onForgePage || onSourcePage) && (
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={1}
            className="flex items-center gap-2 flex-shrink-0"
          >
            {/* Menu Button - Only on Projects Page */}
            {onProjectsPage && (
              <button
                onClick={() => setSidebarOpen(prev => !prev)}
                className="p-1.5 rounded-lg bg-[var(--color-bg-muted)] shadow-md"
              >
                {sidebarOpen ? (
                  <X className="text-[var(--color-text-muted)] w-4 h-4" />
                ) : (
                  <Menu className="text-[var(--color-text-muted)] w-4 h-4" />
                )}
              </button>
            )}
            
            {/* Logo */}
            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold">
              ⬤
            </div>

            {/* Logo Label */}
            <span className="text-[var(--color-text)] text-sm font-semibold">DeCode</span>

            {/* Theme Toggle */}
            <div onClick={toggleTheme} className="ml-1.5 cursor-pointer">
              <div className="w-10 h-5 bg-[var(--color-bg-muted)] rounded-full flex items-center px-0.5 relative">
                <motion.div
                  className="absolute w-3.5 h-3.5 rounded-full flex items-center justify-center shadow bg-white"
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{ left: isDark ? 'calc(100% - 0.875rem)' : '0.125rem' }}
                >
                  {isDark ? (
                    <Moon className="text-[var(--color-primary)] w-2.5 h-2.5" />
                  ) : (
                    <Sun className="text-[var(--color-primary)] w-2.5 h-2.5" />
                  )}
                </motion.div>
              </div>
            </div>

            {/* Forge and Source Page Specific Elements */}
            {(onForgePage || onSourcePage) && (
              <>
                {/* Navigation Dropdown */}
                <NavigationDropdown 
                  activeNav={activeNav} 
                  setActiveNav={setActiveNav} 
                  onModeSwitch={onModeSwitch}
                />

                {/* Lock Icon */}
                <button className="p-0.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
                  <Lock className="w-3.5 h-3.5 text-[var(--color-text)]" />
                </button>

                {/* Responsive Mode Toggle - Only on Forge Page */}
                {onForgePage && (
                  <ResponsiveToggle 
                    activeMode={responsiveMode} 
                    setActiveMode={setResponsiveMode} 
                  />
                )}

                {/* Inspect Mode Toggle - Only on Source Page */}
                {onSourcePage && (
                  <button 
                    onClick={() => setInspectMode(!inspectMode)}
                    className={`p-1 rounded transition-colors ${
                      inspectMode 
                        ? 'bg-[var(--color-primary)] text-white' 
                        : 'hover:bg-[var(--color-bg-muted)] text-[var(--color-text)]'
                    }`}
                    title="Inspect Element"
                  >
                    <MousePointer2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Undo/Redo */}
                <div className="flex items-center gap-0.5">
                  <button className="p-0.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
                    <Undo2 className="w-3 h-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
                  </button>
                  <button className="p-0.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
                    <Redo2 className="w-3 h-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
                  </button>
                </div>

                {/* Vertical Divider */}
                <div className="w-px h-3 bg-[var(--color-border)]"></div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-0.5">
                  <button className="p-0.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
                    <Minus className="w-3 h-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
                  </button>
                  <span className="text-xs text-[var(--color-text)] px-0.5 min-w-[1.5rem] text-center">
                    {zoomLevel}%
                  </span>
                  <button className="p-0.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
                    <Plus className="w-3 h-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
                  </button>
                </div>

                {/* Vertical Divider */}
                <div className="w-px h-3 bg-[var(--color-border)]"></div>

                {/* Interaction Mode Toggle */}
                <BinaryToggle 
                  activeMode={interactionMode} 
                  setActiveMode={setInteractionMode}
                  options={interactionOptions}
                />
              </>
            )}

            {/* Responsive Mode Toggle - Only on Void Page */}
            {onVoidPage && (
              <ResponsiveToggle 
                activeMode={responsiveMode} 
                setActiveMode={setResponsiveMode} 
              />
            )}
          </motion.div>
        )}

        {/* === Center Section === */}
        {onVoidPage && (
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={2}
            className="flex items-center gap-2 flex-shrink-0"
          >
            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <button className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
                <Undo2 className="w-3 h-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
              </button>
              <button className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
                <Redo2 className="w-3 h-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
              </button>
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-4 bg-[var(--color-border)]"></div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
                <Minus className="w-3 h-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
              </button>
              <span className="text-xs text-[var(--color-text)] px-1 min-w-[2rem] text-center">
                {zoomLevel}%
              </span>
              <button className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
                <Plus className="w-3 h-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
              </button>
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-4 bg-[var(--color-border)]"></div>

            {/* Interaction Mode Toggle */}
            <BinaryToggle 
              activeMode={interactionMode} 
              setActiveMode={setInteractionMode}
              options={interactionOptions}
            />
          </motion.div>
        )}

        {/* Center Section - Forge and Source Page Middle Icons */}
       {(onForgePage || onSourcePage) && (
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={2}
            className="flex items-center gap-1.5 flex-shrink-0"
          >
            {/* USE THE NEW MIDDLE PANEL CONTROLS */}
            <MiddlePanelControls 
              currentRoute={currentRoute}
              onPanelToggle={onPanelToggle}
              panelStates={panelStates}
            />
          </motion.div>
        )}

        {/* === Desktop Searchbar - Only on Projects Page === */}
        {onProjectsPage && (
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={2}
            className="hidden md:block flex-grow px-10"
          >
            <div className="relative w-full max-w-xl mx-auto">
              <div className="relative bg-[var(--color-bg-muted)] rounded-full shadow-sm">
                <input
                  type="text"
                  className="bg-transparent focus:outline-none outline-none border-none text-sm text-[var(--color-text)] text-center w-full px-4 py-2 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex items-center gap-1">
                    <Search className="text-[var(--color-text-muted)] w-4 h-4" />
                    <span className="text-sm text-[var(--color-text-muted)]">Search Project</span>
                  </div>
                </div>
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
          className={`flex items-center relative flex-shrink-0 ${(onVoidPage || onForgePage || onSourcePage) ? 'gap-1.5' : 'gap-3'}`}
        >
          {/* === Void, Forge, and Source Page Right Elements === */}
          {(onVoidPage || onForgePage || onSourcePage) && (
            <>
              {/* Stacking Avatars - Only on Forge and Source Pages */}
              {(onForgePage || onSourcePage) && <StackingAvatars />}

              {/* Saved Indicator */}
              <div className="px-1.5 py-0.5 bg-[var(--color-bg-muted)] rounded">
                <span className="text-[9px] text-green-500 font-medium">Saved</span>
              </div>

              {/* Comments - Only on Void Page */}
              {onVoidPage && (
                <div className="flex flex-col items-center gap-0.5">
                  <button className="p-0.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
                    <MessageCircle className="w-3 h-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
                  </button>
                  <span className="text-[8px] text-[var(--color-text-muted)]">Comments</span>
                </div>
              )}

              {/* Share - Only on Void Page */}
              {onVoidPage && (
                <div className="flex flex-col items-center gap-0.5">
                  <button className="p-0.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors">
                    <Share2 className="w-3 h-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" />
                  </button>
                  <span className="text-[8px] text-[var(--color-text-muted)]">Share</span>
                </div>
              )}

              {/* Export */}
              <div className="flex flex-col items-center gap-0.5">
                <button className="p-0.5 bg-pink-100 dark:bg-pink-900/30 hover:bg-pink-200 dark:hover:bg-pink-900/50 rounded transition-colors">
                  <Download className="w-3 h-3 text-pink-600 dark:text-pink-400" />
                </button>
                <span className="text-[8px] text-[var(--color-text-muted)]">Export</span>
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

              {/* === Mobile Search Button === */}
              <button
                onClick={toggleMobileSearch}
                className="md:hidden p-1.5 rounded-full bg-[var(--color-bg-muted)]"
              >
                <Search className="text-[var(--color-text-muted)] w-4 h-4" />
              </button>
            </>
          )}

          {/* === Avatar (always present) === */}
          <div className="relative hidden md:block">
            <div
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen)
                setDropdownOpen(false)
              }}
              className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs cursor-pointer overflow-hidden"
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

          {/* === Preview Button (always present) === */}
          <button className="bg-[var(--color-primary)] text-white px-2.5 py-1.5 rounded-lg flex items-center justify-center shadow-md">
            <Play className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>

      {/* === Mobile Search Dropdown - Only on Projects Page === */}
      <AnimatePresence>
        {mobileSearchOpen && onProjectsPage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 w-full z-40 bg-[var(--color-surface)] border-t border-[var(--color-border)] px-4 py-3"
          >
            <div className="relative bg-[var(--color-bg-muted)] rounded-full shadow-sm">
              <input
                type="text"
                className="bg-transparent outline-none border-none text-sm text-[var(--color-text)] text-center w-full px-4 py-2 rounded-full"
                autoFocus
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-1">
                  <Search className="text-[var(--color-text-muted)] w-4 h-4" />
                  <span className="text-sm text-[var(--color-text-muted)]">Search Project</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    
    <AnimatePresence>{sidebarOpen && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}</AnimatePresence>
    </>
  )
}