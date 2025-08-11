import React from 'react'
import { motion } from 'framer-motion'
import SearchBar from './SearchBar'
import UndoRedoControls from './UndoRedoControls'
import ZoomControls from './ZoomControls'
import BinaryToggle from './BinaryToggle'
import MiddlePanelControls from './MiddlePanelControls'
import { MousePointer, Hand } from 'lucide-react'

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
  const onProjectsPage = currentRoute === '/projects'
  const onVoidPage = currentRoute === '/void'
  const onForgePage = currentRoute === '/forge' || currentRoute.includes('/forge')
  const onSourcePage = currentRoute === '/source' || currentRoute.includes('/source')

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

  // Void Page Center Controls
  if (onVoidPage) {
    return (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        custom={2}
        className="flex items-center gap-2 flex-shrink-0"
      >
        {/* Undo/Redo */}
        <UndoRedoControls size="normal" />

        {/* Vertical Divider */}
        <div className="w-px h-4 bg-[var(--color-border)]"></div>

        {/* Zoom Controls */}
        <ZoomControls zoomLevel={zoomLevel} onZoomChange={setZoomLevel} />

        {/* Vertical Divider */}
        <div className="w-px h-4 bg-[var(--color-border)]"></div>

        {/* Interaction Mode Toggle */}
        <BinaryToggle 
          activeMode={interactionMode} 
          setActiveMode={setInteractionMode}
          options={interactionOptions}
        />
      </motion.div>
    )
  }

  // Forge and Source Page Middle Icons
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
      </motion.div>
    )
  }

  return null
}

export default CenterSection