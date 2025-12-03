import React, { useEffect } from 'react';
import { Menu, X, MousePointer2, Hand, ChevronLeft, Container } from 'lucide-react';
import useContainerStore from '@/stores/useContainerStore';
import { motion } from 'framer-motion';
import { router, usePage } from '@inertiajs/react';
import ThemeToggle from './ThemeToggle';
import ThemeSelector from './ThemeSelector';
import NavigationDropdown from './NavigationDropdown';
import ResponsiveToggle from './ResponsiveToggle';
import ForgeUndoRedo from './ForgeUndoRedo';
import ForgeZoomControls from './ForgeZoomControls';
import BinaryToggle from './BinaryToggle';
import AnimatedBlackHoleLogo from '@/Components/AnimatedBlackHoleLogo';
import { useForgeStore } from '@/stores/useForgeStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import FrameLockButton from './FrameLockButton';


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
  setInteractionMode,
  gridVisible,
  projectId,
  currentFrame,
  canvasComponents,
  handleUndo,
  handleRedo
}) => {
  
  const { canvasZoom, setCanvasZoom } = useForgeStore();
  const { currentWorkspace } = useWorkspaceStore();
  const [myDiscipline, setMyDiscipline] = React.useState(null);

  
  const { url, props } = usePage(); 
  const { project } = props;
  const onProjectsPage = currentRoute === '/projects' || currentRoute.includes('/projects');
  const onForgePage = currentRoute.includes('/modeForge');
  const onSourcePage = currentRoute.includes('/modeSource');
  
  const onVoidPage = 
    currentRoute.startsWith('/void') &&
    !onForgePage &&
    !onSourcePage;

  // Fetch user's discipline
  useEffect(() => {
    const fetchMyDiscipline = async () => {
      if (!currentWorkspace?.uuid) return;
      
      try {
        const response = await fetch(`/api/workspaces/${currentWorkspace.uuid}/roles/my-role`, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setMyDiscipline(data.data.discipline);
          }
        }
      } catch (error) {
        console.error('Failed to fetch discipline:', error);
      }
    };
    
    if (currentWorkspace?.uuid) {
      fetchMyDiscipline();
    }
  }, [currentWorkspace?.uuid]);

  useEffect(() => {
    if (url.includes('/modeForge') && activeNav !== 'Forge') {
      setActiveNav('Forge');
    } else if (url.includes('/modeSource') && activeNav !== 'Source') {
      setActiveNav('Source');
    }
  }, [url, activeNav, setActiveNav]);

  const interactionOptions = [
    { key: 'cursor', icon: MousePointer2 },
    { key: 'hand', icon: Hand }
  ];

  const handleBackToVoid = () => {
    if (project) {
      router.visit(`/void/${project.uuid}`);
    } else {
      router.visit('/void');
    }
  };

  const handleLogoClick = () => {
    // Use currentWorkspace from store as primary source
    // This ensures we go to the workspace the user was recently in
    if (currentWorkspace) {
      router.visit(`/workspaces/${currentWorkspace.id}/projects`);
    } else if (project?.workspace_id) {
      // Fallback to project's workspace if available
      router.visit(`/workspaces/${project.workspace_id}/projects`);
    } else {
      // Final fallback to personal workspace
      router.visit('/projects');
    }
  };

  // Use Zustand store for container mode
  const { containerMode, toggleContainerMode } = useContainerStore();
  
  const handleContainerModeToggle = () => {
    toggleContainerMode();
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      custom={1}
      className="flex items-center gap-1 flex-shrink-0" // Reduced gap
    >
      {/* Back Button - Only on Forge and Source Pages */}
      {(onForgePage || onSourcePage) && (
        <button
          onClick={handleBackToVoid}
          className="p-1 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors relative z-50"
          title="Back to Void"
          style={{ pointerEvents: 'auto' }}
        >
          <ChevronLeft className="w-3.5 h-3.5 text-[var(--color-primary)]" />
        </button>
      )}

      {/* Menu Button - Only on Projects Page */}
      {onProjectsPage && (
        <button
          onClick={() => setSidebarOpen(prev => !prev)}
          className="p-1 rounded-lg bg-[var(--color-bg-muted)] shadow-sm" // Reduced shadow
        >
          {sidebarOpen ? (
            <X className="text-[var(--color-text-muted)] w-3 h-3" />
          ) : (
            <Menu className="text-[var(--color-text-muted)] w-3 h-3" />
          )}
        </button>
      )}
      
      {/* Logo and Name - Smaller */}
      <button 
        onClick={handleLogoClick}
        className="flex items-center gap-1 hover:opacity-80 transition-opacity"
        title="Go to Projects"
      >
        <div 
          className="relative flex items-center justify-center"
          style={{
            filter: `
              drop-shadow(0 0 6px rgba(255, 255, 255, 0.2))
              drop-shadow(0 0 12px rgba(139, 92, 246, 0.3))
              drop-shadow(0 0 18px rgba(147, 51, 234, 0.2))
            `
          }}
        >
          <AnimatedBlackHoleLogo size={30} /> {/* Reduced size */}
        </div>
        <span className="text-[var(--color-text)] text-xs font-semibold leading-none">DeCode</span> {/* Smaller text */}
      </button>

      {/* Theme Toggle - Smaller */}
      <ThemeToggle isDark={isDark} onToggle={onThemeToggle} size="small" />

      {/* Theme Color Selector - Smaller */}
      <ThemeSelector 
        currentTheme={currentTheme}
        onThemeChange={onThemeColorChange}
        size="small"
      />

      {/* Forge and Source Page Specific Elements */}
      {(onForgePage || onSourcePage) && (
        <>
          {/* Navigation Dropdown - Only for Developer discipline */}
          {myDiscipline === 'Developer' && (
            <NavigationDropdown 
              activeNav={activeNav} 
              setActiveNav={setActiveNav} 
              onModeSwitch={onModeSwitch}
              size="small"
            />
          )}

          {/* Frame Lock Button - Owner and Editor can lock/unlock */}
          {currentFrame && (
            <FrameLockButton 
              frameUuid={currentFrame} 
              currentMode={onForgePage ? 'forge' : 'source'} 
            />
          )}

          {/* Responsive Mode Toggle - Only on Forge Page */}
          {onForgePage && (
            <ResponsiveToggle 
              activeMode={responsiveMode} 
              setActiveMode={setResponsiveMode}
              size="small"
            />
          )}

          {/* Inspect Mode Toggle - Only on Source Page */}
          {onSourcePage && (
            <button 
              onClick={() => setInspectMode(!inspectMode)}
              className={`p-0.5 rounded transition-colors ${
                inspectMode 
                  ? 'bg-[var(--color-primary)] text-white' 
                  : 'hover:bg-[var(--color-bg-muted)] text-[var(--color-text)]'
              }`}
              title="Inspect Element"
            >
              <MousePointer2 className="w-2.5 h-2.5" />
            </button>
          )}

          {/* Undo/Redo */}
          {(onForgePage || onSourcePage) && (
            <ForgeUndoRedo 
              projectId={projectId}
              frameId={currentFrame}
              canvasComponents={canvasComponents || []}
              onUndo={handleUndo}
              onRedo={handleRedo}
              size="small"
              onHistoryChange={(info) => {
                
              }}
            />
          )}

          {/* Vertical Divider */}
          <div className="w-px h-2.5 bg-[var(--color-border)]"></div>

          {/* Zoom Controls */}
          <ForgeZoomControls 
            zoomLevel={canvasZoom} 
            onZoomChange={setCanvasZoom} 
            size="small" 
          />

          {/* Vertical Divider */}
          <div className="w-px h-2.5 bg-[var(--color-border)]"></div>

            {/* Interaction Mode Toggle */}
            <BinaryToggle 
              activeMode={interactionMode} 
              setActiveMode={(mode) => {
                setInteractionMode(mode);
                // If switching to preview, disable selection
                if (mode === 'preview') {
                  setSelectedComponent(null);
                }
              }}
              options={interactionOptions}
              size="small"
            />
        </>
      )}

      {/* Void Page Specific Elements */}
      {onVoidPage && (
        <>
          {/* Responsive Mode Toggle - Only on Void Page */}
          <ResponsiveToggle 
            activeMode={responsiveMode} 
            setActiveMode={setResponsiveMode}
            size="small"
          />

          {/* Container Mode Toggle - Only on Void Page */}
          <button
            onClick={handleContainerModeToggle}
            className={`p-0.5 rounded transition-colors ${
              containerMode 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'hover:bg-[var(--color-bg-muted)] text-[var(--color-text)]'
            }`}
            title={containerMode ? "Exit Container Mode" : "Add Container"}
          >
            <Container className="w-2.5 h-2.5" />
          </button>
        </>
      )}
    </motion.div>
  );
};

export default LeftSection;