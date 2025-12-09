import React from 'react';
import { motion } from 'framer-motion';
import { Settings, EyeOff, Eye, Sparkles } from 'lucide-react';
import SearchBar from './SearchBar';
import VoidUndoRedo from './VoidUndoRedo';
import VoidZoomControls from './VoidZoomControls';
import ForgeZoomControls from '@/Components/Header/Head/ForgeZoomControls';
import BinaryToggle from './BinaryToggle';
import MiddlePanelControls from './MiddlePanelControls';
import { MousePointer, Hand } from 'lucide-react';
import { useHeaderStore } from '@/stores/useHeaderStore';
import { useIconStore } from '@/stores/useIconStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';


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
  panelStates,
  onLinkedComponentsClick // 🔥 NEW: Add callback for linked components
}) => {
  const { 
    toggleStyleModal 
  } = useHeaderStore();
  
  const { 
    toggleIconPanel, 
    isIconPanelOpen 
  } = useIconStore();
  
  // 🔥 NEW: Get editor store values
  const { 
    interactiveMode,
    setInteractiveMode: setEditorInteractiveMode,
    canvasZoom,
    setCanvasZoom,
    clipCanvas,
    setClipCanvas
  } = useEditorStore();
  
  const { currentWorkspace } = useWorkspaceStore();
  const [myRole, setMyRole] = React.useState(null);
  
  // Fetch user's role
  React.useEffect(() => {
    const fetchMyRole = async () => {
      if (!currentWorkspace?.uuid) return;
      
      try {
        const response = await fetch(`/api/workspaces/${currentWorkspace.uuid}/roles/my-role`, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setMyRole(data.data.role);
          }
        }
      } catch (error) {
        console.error('Failed to fetch role:', error);
      }
    };
    
    if (currentWorkspace?.uuid) {
      fetchMyRole();
    }
  }, [currentWorkspace?.uuid]);
  
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
        className="hidden md:block flex-1 max-w-md lg:max-w-lg px-2" // Limited max width and reduced padding
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
        {/* Undo/Redo - Hide for Viewer */}
        {myRole !== 'viewer' && (
          <>
            <VoidUndoRedo size="small" /> {/* Made smaller */}
            
            {/* Vertical Divider */}
            <div className="w-px h-3 bg-[var(--color-border)]"></div>
          </>
        )}

        {/* FIXED: Pass zoomLevel and setZoomLevel props */}
        <VoidZoomControls 
          className="px-0.5" // Reduced padding
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
        />
        
        {/* Vertical Divider */}
        <div className="w-px h-3 bg-[var(--color-border)]"></div>
        
        {/* Interaction Mode Toggle - Keep for Viewer */}
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
      <>
        {/* Desktop: Show in header */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={2}
          className="hidden md:flex items-center gap-1 flex-shrink-0" // Hide on mobile
        >
          <MiddlePanelControls 
            currentRoute={currentRoute}
            onPanelToggle={onPanelToggle}
            panelStates={panelStates}
            onLinkedComponentsClick={onLinkedComponentsClick}
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

        {/* Mobile: Floating bottom toolbar */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="md:hidden fixed bottom-4 left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full shadow-lg px-4 py-2 pointer-events-auto">
            <div className="flex items-center gap-2">
              <MiddlePanelControls 
                currentRoute={currentRoute}
                onPanelToggle={onPanelToggle}
                panelStates={panelStates}
                onLinkedComponentsClick={onLinkedComponentsClick}
              />
              
              {/* Icon Panel Button */}
              <button
                onClick={toggleIconPanel}
                className={`p-1.5 rounded-full transition-colors ${
                  isIconPanelOpen 
                    ? 'bg-[var(--color-primary)] text-white' 
                    : 'hover:bg-[var(--color-bg-muted)] text-[var(--color-text)]'
                }`}
                title="Icon Browser"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </>
    );
  }

  return null;
};

export default CenterSection;