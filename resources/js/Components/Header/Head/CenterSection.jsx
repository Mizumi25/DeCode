import React from 'react';
import { motion } from 'framer-motion';
import { Settings, EyeOff, Eye, Sparkles } from 'lucide-react';
import SearchBar from './SearchBar';
import VoidUndoRedo from './VoidUndoRedo';
import VoidZoomControls from './VoidZoomControls';
import BinaryToggle from './BinaryToggle';
import MiddlePanelControls from './MiddlePanelControls';
import { MousePointer, Hand } from 'lucide-react';
import { useHeaderStore } from '@/stores/useHeaderStore';
import { useIconStore } from '@/stores/useIconStore';

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
};

const CenterSection = ({ 
  currentRoute,
  zoomLevel,
  setZoomLevel,
  interactionMode,
  setInteractionMode,
  onPanelToggle,
  panelStates
}) => {
  const { toggleStyleModal } = useHeaderStore();
  const { toggleIconPanel, isIconPanelOpen } = useIconStore();
  
  const onProjectsPage = currentRoute === '/projects' || currentRoute.includes('/projects');
  const onForgePage = currentRoute.includes('/modeForge');
  const onSourcePage = currentRoute.includes('/modeSource');
  
  // Pure void page (must have /void but not forge or source)
  const onVoidPage = 
    currentRoute.startsWith('/void') &&
    !onForgePage &&
    !onSourcePage;

  const interactionOptions = [
    { key: 'cursor', icon: MousePointer },
    { key: 'hand', icon: Hand }
  ];

  // Desktop Searchbar - Only on Projects Page
  if (onProjectsPage) {
    return (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        custom={2}
        className="hidden md:block flex-grow px-6" // Reduced padding
      >
        <SearchBar />
      </motion.div>
    );
  }

  // Void Page Center Controls
  if (onVoidPage) {
    return (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        custom={2}
        className="flex items-center gap-2 flex-shrink-0" // Reduced gap
      >
        {/* Undo/Redo */}
        <VoidUndoRedo size="small" /> {/* Made smaller */}
        
        {/* Vertical Divider */}
        <div className="w-px h-3 bg-[var(--color-border)]"></div>

        {/* FIXED: Pass zoomLevel and setZoomLevel props */}
        <VoidZoomControls 
          className="px-0.5" // Reduced padding
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
        />
        
        {/* Vertical Divider */}
        <div className="w-px h-3 bg-[var(--color-border)]"></div>
        
        {/* Interaction Mode Toggle */}
        <BinaryToggle 
          activeMode={interactionMode} 
          setActiveMode={setInteractionMode}
          options={interactionOptions}
          size="small" // Added size prop
        />
      </motion.div>
    );
  }

  // Forge and Source Page Middle Icons
  if (onForgePage || onSourcePage) {
    return (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        custom={2}
        className="flex items-center gap-1 flex-shrink-0" // Reduced gap
      >
        <MiddlePanelControls 
          currentRoute={currentRoute}
          onPanelToggle={onPanelToggle}
          panelStates={panelStates}
        />
        
        {/* Icon Panel Button */}
        <button
          onClick={toggleIconPanel}
          className={`p-1 rounded transition-colors ${
            isIconPanelOpen 
              ? 'bg-[var(--color-primary)] text-white' 
              : 'hover:bg-[var(--color-bg-muted)] text-[var(--color-text)]'
          }`}
          title="Icon Browser"
        >
          <Sparkles className="w-3 h-3" />
        </button>
        
        {/* Vertical Divider */}
        <div className="w-px h-2.5 bg-[var(--color-border)]"></div>
      </motion.div>
    );
  }

  return null;
};

export default CenterSection;