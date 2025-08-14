import React, { useState, useEffect } from 'react'
import { MousePointer, Hand, Edit3, Eye } from 'lucide-react'
import { router, usePage } from '@inertiajs/react'
import { AnimatePresence } from 'framer-motion'
import Sidebar from '@/Components/Header/Sidebar'

// Import all separated components
import LeftSection from './Head/LeftSection'
import CenterSection from './Head/CenterSection'
import RightSection from './Head/RightSection'
import MobileSearch from './Head/MobileSearch'
import { themeColors } from './Head/ThemeSelector'

export default function Header({ 
  isAuthenticated = true, 
  currentRoute = '/projects', 
  onThemeChange, 
  onPanelToggle, 
  panelStates = {}, 
  onModeSwitch  
}) {
  const { props } = usePage()
  const user = props.auth?.user
  const onProjectsPage = isAuthenticated && currentRoute === '/projects'
  const onVoidPage = isAuthenticated && currentRoute === '/void'
  const onForgePage = isAuthenticated && (currentRoute === '/forge' || currentRoute.includes('/forge'))
  const onSourcePage = isAuthenticated && (currentRoute === '/source' || currentRoute.includes('/source'))

  const [isDark, setIsDark] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Dropdown states
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  // Theme state
  const [currentTheme, setCurrentTheme] = useState(themeColors[themeColors.length - 1]) // Default theme

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

    // Load saved theme color
    const savedThemeColor = localStorage.getItem('themeColor')
    if (savedThemeColor) {
      const savedThemeObj = JSON.parse(savedThemeColor)
      setCurrentTheme(savedThemeObj)
      applyThemeColor(savedThemeObj)
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

  const applyThemeColor = (theme) => {
    const root = document.documentElement
    root.style.setProperty('--color-primary', theme.color)
    root.style.setProperty('--color-primary-hover', theme.color + 'dd') // Add opacity
  }

  const handleThemeColorChange = (theme) => {
    setCurrentTheme(theme)
    applyThemeColor(theme)
    localStorage.setItem('themeColor', JSON.stringify(theme))
  }

  const toggleMobileSearch = () => {
    setMobileSearchOpen(prev => !prev)
  }

  // Dropdown handlers that close the other dropdown when one opens
  const handleWorkspaceDropdownToggle = (isOpen) => {
    if (isOpen) {
      setProfileDropdownOpen(false)
    }
    setWorkspaceDropdownOpen(isOpen)
  }

  const handleProfileDropdownToggle = (isOpen) => {
    if (isOpen) {
      setWorkspaceDropdownOpen(false)
    }
    setProfileDropdownOpen(isOpen)
  }

  return (
    <>
      <header className="w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm px-3 py-2 z-50 fixed top-0 left-0">
        <div className={`flex items-center relative ${(onVoidPage || onForgePage || onSourcePage) ? 'justify-between gap-3' : 'justify-between flex-wrap gap-2'}`}>
          
          {/* Left Section */}
          {(onProjectsPage || onVoidPage || onForgePage || onSourcePage) && (
            <LeftSection 
              currentRoute={currentRoute}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              isDark={isDark}
              onThemeToggle={toggleTheme}
              currentTheme={currentTheme}
              onThemeColorChange={handleThemeColorChange}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              onModeSwitch={onModeSwitch}
              responsiveMode={responsiveMode}
              setResponsiveMode={setResponsiveMode}
              inspectMode={inspectMode}
              setInspectMode={setInspectMode}
              zoomLevel={zoomLevel}
              setZoomLevel={setZoomLevel}
              interactionMode={interactionMode}
              setInteractionMode={setInteractionMode}
            />
          )}

          {/* Center Section */}
          <CenterSection 
            currentRoute={currentRoute}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            interactionMode={interactionMode}
            setInteractionMode={setInteractionMode}
            onPanelToggle={onPanelToggle}
            panelStates={panelStates}
          />

          {/* Right Section */}
          <RightSection 
            currentRoute={currentRoute}
            user={user}
            editMode={editMode}
            setEditMode={setEditMode}
            onMobileSearchToggle={toggleMobileSearch}
            workspaceDropdownOpen={workspaceDropdownOpen}
            setWorkspaceDropdownOpen={handleWorkspaceDropdownToggle}
            profileDropdownOpen={profileDropdownOpen}
            setProfileDropdownOpen={handleProfileDropdownToggle}
          />
        </div>

        {/* Mobile Search Dropdown */}
        <MobileSearch 
          isOpen={mobileSearchOpen} 
          onProjectsPage={onProjectsPage} 
        />
      </header>
      
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      </AnimatePresence>
    </>
  )
}