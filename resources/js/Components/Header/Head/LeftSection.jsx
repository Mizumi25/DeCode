import React from 'react'
import { Menu, X, Lock, MousePointer2, Hand } from 'lucide-react'
import { motion } from 'framer-motion'
import ThemeToggle from './ThemeToggle'
import ThemeSelector from './ThemeSelector'
import NavigationDropdown from './NavigationDropdown'
import ResponsiveToggle from './ResponsiveToggle'
import UndoRedoControls from './UndoRedoControls'
import ZoomControls from './ZoomControls'
import BinaryToggle from './BinaryToggle'
import AnimatedBlackHoleLogo from '@/Components/AnimatedBlackHoleLogo'

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

const LeftSection = ({ 
  currentRoute,
  sidebarOpen,
  setSidebarOpen,
  isDark,
  onThemeToggle,
  currentTheme,
  onThemeColorChange,
  activeNav,
  setActiveNav,
  onModeSwitch,
  responsiveMode,
  setResponsiveMode,
  inspectMode,
  setInspectMode,
  zoomLevel,
  setZoomLevel,
  interactionMode,
  setInteractionMode
}) => {
  const onProjectsPage = currentRoute === '/projects'
  const onVoidPage = currentRoute === '/void'
  const onForgePage = currentRoute === '/forge' || currentRoute.includes('/forge')
  const onSourcePage = currentRoute === '/source' || currentRoute.includes('/source')

  const interactionOptions = [
    { key: 'cursor', icon: MousePointer2 },
    { key: 'hand', icon: Hand }
  ]

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      custom={1}
      className="flex items-center gap-1.5 flex-shrink-0"
    >
      {/* Menu Button - Only on Projects Page */}
      {onProjectsPage && (
        <button
          onClick={() => setSidebarOpen(prev => !prev)}
          className="p-1 rounded-lg bg-[var(--color-bg-muted)] shadow-md"
        >
          {sidebarOpen ? (
            <X className="text-[var(--color-text-muted)] w-3.5 h-3.5" />
          ) : (
            <Menu className="text-[var(--color-text-muted)] w-3.5 h-3.5" />
          )}
        </button>
      )}
      
      {/* Animated Logo with Glow Wrapper */}
      <div 
        className="relative"
        style={{
          filter: `
            drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))
            drop-shadow(0 0 16px rgba(139, 92, 246, 0.4))
            drop-shadow(0 0 24px rgba(147, 51, 234, 0.3))
          `
        }}
      >
        <AnimatedBlackHoleLogo size={20} />
      </div>

      {/* Logo Label */}
      <span className="text-[var(--color-text)] text-sm font-semibold">DeCode</span>

      {/* Theme Toggle */}
      <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />

      {/* Theme Color Selector */}
      <ThemeSelector 
        currentTheme={currentTheme}
        onThemeChange={onThemeColorChange}
      />

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
            <Lock className="w-3 h-3 text-[var(--color-text)]" />
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
              <MousePointer2 className="w-3 h-3" />
            </button>
          )}

          {/* Undo/Redo */}
          <UndoRedoControls size="small" />

          {/* Vertical Divider */}
          <div className="w-px h-3 bg-[var(--color-border)]"></div>

          {/* Zoom Controls */}
          <ZoomControls zoomLevel={zoomLevel} onZoomChange={setZoomLevel} />

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
  )
}

export default LeftSection