import React, { useState, useEffect } from 'react'
import { MousePointer, Hand, Edit3, Eye } from 'lucide-react'
import { router, usePage } from '@inertiajs/react'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from '@/Components/Header/Sidebar'

// Import all separated components
import LeftSection from './Head/LeftSection'
import CenterSection from './Head/CenterSection'
import RightSection from './Head/RightSection'
import MobileSearch from './Head/MobileSearch'
import HeaderToggleButton from './Head/HeaderToggleButton'
import StyleModal from './Head/StyleModal'

// Import Zustand stores
import { useThemeStore } from '@/stores/useThemeStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useHeaderStore } from '@/stores/useHeaderStore'

export default function Header({ 
  isAuthenticated = true, 
  currentRoute = '/projects', 
  onThemeChange, 
  onPanelToggle, 
  onModeSwitch  
}) {
  const { props } = usePage()
  const user = props.auth?.user
  const onProjectsPage = isAuthenticated && currentRoute === '/projects'
  const onVoidPage = isAuthenticated && currentRoute === '/void'
  const onForgePage = isAuthenticated && (currentRoute === '/forge' || currentRoute.includes('/forge'))
  const onSourcePage = isAuthenticated && (currentRoute === '/source' || currentRoute.includes('/source'))

  // Zustand stores
  const { 
    isDark, 
    currentTheme, 
    toggleTheme, 
    setThemeColor, 
    initializeTheme 
  } = useThemeStore()
  
  const {
    responsiveMode,
    zoomLevel,
    interactionMode,
    editMode,
    inspectMode,
    activeNav,
    panelStates,
    setResponsiveMode,
    setZoomLevel,
    setInteractionMode,
    setEditMode,
    setInspectMode,
    setActiveNav,
    togglePanel,
    resetForPage
  } = useEditorStore()

  const {
    isHeaderVisible,
    initializeHeader
  } = useHeaderStore()

  // Local component states (keep these as they are)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  // Initialize stores on mount
  useEffect(() => {
    initializeTheme()
    initializeHeader()
  }, [initializeTheme, initializeHeader])

  // Reset editor states when page changes
  useEffect(() => {
    if (onForgePage) resetForPage('forge')
    else if (onSourcePage) resetForPage('source')
    else if (onVoidPage) resetForPage('void')
  }, [onForgePage, onSourcePage, onVoidPage, resetForPage])

  // Notify parent component about theme changes
  useEffect(() => {
    if (onThemeChange) {
      onThemeChange(isDark)
    }
  }, [isDark, onThemeChange])

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
      {/* Header Toggle Button - Always visible */}
      <HeaderToggleButton />

      {/* Header with animation */}
      <motion.header 
        className="w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm px-3 py-2 z-50 fixed top-0 left-0"
        initial={false}
        animate={{ 
          y: isHeaderVisible ? 0 : -100,
          opacity: isHeaderVisible ? 1 : 0
        }}
        transition={{ 
          type: "spring", 
          damping: 25, 
          stiffness: 300,
          duration: 0.3
        }}
      >
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
              onThemeColorChange={setThemeColor}
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
            onPanelToggle={onPanelToggle || togglePanel}
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
      </motion.header>
      
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      </AnimatePresence>

      {/* Style Modal */}
      <StyleModal />
    </>
  )
}