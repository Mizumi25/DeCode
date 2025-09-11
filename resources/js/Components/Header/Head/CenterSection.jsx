import React from 'react'
import { motion } from 'framer-motion'
import { Settings, EyeOff, Eye } from 'lucide-react'
import SearchBar from './SearchBar'
import UndoRedoControls from './UndoRedoControls'
import ZoomControls from './ZoomControls'
import VoidZoomControls from './VoidZoomControls' // Import the new component
import BinaryToggle from './BinaryToggle'
import MiddlePanelControls from './MiddlePanelControls'
import { MousePointer, Hand } from 'lucide-react'
import { useHeaderStore } from '@/stores/useHeaderStore'

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

const CenterSection = ({ 
  currentRoute,
  zoomLevel,
  setZoomLevel,
  interactionMode,
  setInteractionMode,
  onPanelToggle,
  panelStates
}) => {
  const { toggleStyleModal } = useHeaderStore()
  
  const onProjectsPage = currentRoute === '/projects' || currentRoute.includes('/projects')
  const onForgePage    = currentRoute.includes('/modeForge')
  const onSourcePage   = currentRoute.includes('/modeSource')
  
  // Pure void page (must have /void but not forge or source)
  const onVoidPage = 
    currentRoute.startsWith('/void') &&
    !onForgePage &&
    !onSourcePage

  const interactionOptions = [
    { key: 'cursor', icon: MousePointer },
    { key: 'hand', icon: Hand }
  ]

  // Desktop Searchbar - Only on Projects Page
  if (onProjectsPage) {
    return (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        custom={2}
        className="hidden md:block flex-grow px-10"
      >
        <SearchBar />
      </motion.div>
    )
  }

  // Void Page Center Controls - Enhanced with better zoom controls
  if (onVoidPage) {
    return (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        custom={2}
        className="flex items-center gap-3 flex-shrink-0"
      >
        {/* Undo/Redo */}
        <UndoRedoControls size="normal" />

        {/* Vertical Divider */}
        <div className="w-px h-4 bg-[var(--color-border)]"></div>
        
        {/* Enhanced Zoom Controls - Specific for Void Page */}
        <VoidZoomControls 
          zoomLevel={zoomLevel} 
          onZoomChange={setZoomLevel}
          className="px-1"
        />

        {/* Vertical Divider */}
        <div className="w-px h-4 bg-[var(--color-border)]"></div>

        {/* Interaction Mode Toggle */}
        <BinaryToggle 
          activeMode={interactionMode} 
          setActiveMode={setInteractionMode}
          options={interactionOptions}
        />

        {/* Visual indicator for enhanced functionality */}
        <div className="flex items-center gap-1 px-2 py-1 bg-[var(--color-bg-muted)] rounded-md opacity-60">
          <div className="w-1 h-1 bg-[var(--color-primary)] rounded-full animate-pulse"></div>
          <span className="text-xs text-[var(--color-text-muted)] font-mono">VOID</span>
        </div>
      </motion.div>
    )
  }

  // Forge and Source Page Middle Icons - Use standard zoom controls
  if (onForgePage || onSourcePage) {
    return (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        custom={2}
        className="flex items-center gap-1.5 flex-shrink-0"
      >
        <MiddlePanelControls 
          currentRoute={currentRoute}
          onPanelToggle={onPanelToggle}
          panelStates={panelStates}
        />

        {/* Vertical Divider */}
        <div className="w-px h-3 bg-[var(--color-border)]"></div>
      </motion.div>
    )
  }

  return null
}

export default CenterSection