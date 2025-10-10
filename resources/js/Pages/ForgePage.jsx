// Enhanced ForgePage.jsx - Frame Switching with Smooth Transitions
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Panel from '@/Components/Panel';
import { 
  Square, Code, Layers, User, Settings, ChevronUp, ChevronDown, Copy, RefreshCw, 
  Monitor, PictureInPicture, Loader2, ChevronRight  // ADD ChevronRight
} from 'lucide-react';
import { useForgeStore } from '@/stores/useForgeStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { useForgeUndoRedoStore } from '@/stores/useForgeUndoRedoStore';
import { useCodeSyncStore } from '@/stores/useCodeSyncStore';
import { useThumbnail } from '@/hooks/useThumbnail';

// Import separated forge components
import ComponentsPanel from '@/Components/Forge/ComponentsPanel';
import LayersPanel from '@/Components/Forge/LayersPanel';
import PropertiesPanel from '@/Components/Forge/PropertiesPanel';
import AssetsPanel from '@/Components/Forge/AssetsPanel';
import CanvasComponent from '@/Components/Forge/CanvasComponent';
import BottomCodePanel from '@/Components/Forge/BottomCodePanel';
import SidebarCodePanel from '@/Components/Forge/SidebarCodePanel';
import ModalCodePanel from '@/Components/Forge/ModalCodePanel';

import CodeTooltip from '@/Components/Forge/CodeTooltip';
import FloatingFrameSwitcher from '@/Components/Forge/FloatingFrameSwitcher';
import WindowPanel from '@/Components/WindowPanel';
import LayoutPresets from '@/Components/Forge/LayoutPresets';
import EmptyCanvasState from '@/Components/Forge/EmptyCanvasState';
import SectionDropZone from '@/Components/Forge/SectionDropZone';
import IconWindowPanel from '@/Components/Forge/IconWindowPanel';



import ErrorBoundary from '@/Components/ErrorBoundary';

// Import dynamic component service
import { componentLibraryService } from '@/Services/ComponentLibraryService';
import { tooltipDatabase } from '@/Components/Forge/TooltipDatabase';
import { formatCode, highlightCode, parseCodeAndUpdateComponents } from '@/Components/Forge/CodeUtils';






// ADD THIS HELPER FUNCTION BEFORE export default function ForgePage:
const safeLeaveChannel = (channelName) => {
  if (!window.Echo) {
    console.warn('Echo not available');
    return;
  }

  try {
    // Get the channel from Echo's connector
    const channels = window.Echo.connector?.channels || {};
    const channel = channels[channelName];

    if (channel && typeof channel.leave === 'function') {
      console.log('Leaving channel:', channelName);
      channel.leave();
    } else if (window.Echo.leave) {
      console.log('Using Echo.leave for:', channelName);
      window.Echo.leave(channelName);
    } else {
      console.warn('Cannot leave channel (not joined):', channelName);
    }
  } catch (error) {
    console.error('Error leaving channel:', channelName, error);
    // Don't throw - just log and continue
  }
};







export default function ForgePage({ 
  projectId, 
  frameId, 
  project, 
  frame, 
  projectFrames = []
}) {
  // Zustand stores with proper subscriptions
  const {
    toggleForgePanel,
    isForgePanelOpen,
    getOpenForgePanelsCount,
    allPanelsHidden,
    forgePanelStates,
    _triggerUpdate
  } = useForgeStore()
  
  const {
    responsiveMode,
    getCurrentCanvasDimensions,
    getResponsiveDeviceInfo,
    getResponsiveScaleFactor,
    getResponsiveCanvasClasses,
    getResponsiveGridBackground,
    gridVisible,
    zoomLevel
  } = useEditorStore();
  
  const {
    initializeFrame: initUndoRedoFrame,
    pushHistory,
    scheduleAutoSave,
    actionTypes,
    undo,
    redo,
    canUndo,
    canRedo
  } = useForgeUndoRedoStore();
  
  const { 
    syncedCode,         
    codeStyle,            
    setCodeStyle: setSyncedCodeStyle,
    updateSyncedCode 
  } = useCodeSyncStore();

  // Frame switching state
  const [isFrameSwitching, setIsFrameSwitching] = useState(false)
  const [switchingToFrame, setSwitchingToFrame] = useState(null)
  const [frameTransitionPhase, setFrameTransitionPhase] = useState('idle') // 'idle', 'fadeOut', 'loading', 'fadeIn'

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })
  
  
  // Add these states near your other useState declarations
  const [dragPosition, setDragPosition] = useState(null);
  const [isCanvasSelected, setIsCanvasSelected] = useState(false);

  // Canvas state for dropped components - Now frame-specific
  const [frameCanvasComponents, setFrameCanvasComponents] = useState(() => {
      const initialFrameData = {};
      const currentFrameId = frameId || frame?.uuid;
      
      console.log('ForgePage: Initializing frame data for:', currentFrameId);
      console.log('ForgePage: Frame prop data:', frame?.canvas_data);
      
      if (currentFrameId) {
          // Check if we have backend data in frame.canvas_data.components
          if (frame?.canvas_data?.components && Array.isArray(frame.canvas_data.components)) {
              console.log('ForgePage: Loading', frame.canvas_data.components.length, 'components from backend');
              initialFrameData[currentFrameId] = frame.canvas_data.components;
          } else {
              // Initialize empty array for this frame
              console.log('ForgePage: No backend components, initializing empty array');
              initialFrameData[currentFrameId] = [];
          }
      }
      
      return initialFrameData;
  });
  const [selectedComponent, setSelectedComponent] = useState(null)
  const [generatedCode, setGeneratedCode] = useState({ html: '', css: '', react: '', tailwind: '' })
  
  const showCodePanel = isForgePanelOpen('code-panel');
  
  const [codePanelPosition, setCodePanelPosition] = useState('bottom')
  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const [showTooltips, setShowTooltips] = useState(true)
  const [hoveredToken, setHoveredToken] = useState(null)
  
  // Mobile-optimized code panel settings
  const [codePanelHeight, setCodePanelHeight] = useState(400)
  const [codePanelMinimized, setCodePanelMinimized] = useState(false)
  const [componentsLoaded, setComponentsLoaded] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Initializing components...')

  // Component panel tab state
  const [activeComponentTab, setActiveComponentTab] = useState('elements')
  const [componentSearchTerm, setComponentSearchTerm] = useState('')
  
  const [undoRedoInProgress, setUndoRedoInProgress] = useState(false);
  
  // ADD these state variables for drag reordering
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [dragOverContainer, setDragOverContainer] = useState(null);

  // Enhanced drag state with variant support
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedComponent: null,
    dragPreview: null,
    variant: null
  })

  // WindowPanel state
  const [windowPanelState, setWindowPanelState] = useState({
    isOpen: false,
    mode: 'modal',
    title: 'Forge Window',
    position: { x: 100, y: 100 },
    size: { width: 600, height: 400 }
  })
  
  const {
    scheduleCanvasUpdate: scheduleThumbnailUpdate,
    isGenerating: thumbnailGenerating,
    thumbnailUrl,
    generateFromCanvas: generateThumbnailFromCanvas
  } = useThumbnail(frame?.uuid, frame?.type || 'page', {
    enableRealTimeUpdates: true,
    debounceMs: 2000 // 2 second debounce for canvas updates
  });

  const canvasRef = useRef(null)
  const codePanelRef = useRef(null)
  
  const [currentFrame, setCurrentFrame] = useState(() => {
      const frameIdToUse = frameId || frame?.uuid;
      console.log('ForgePage: Initial frame ID:', frameIdToUse);
      return frameIdToUse;
  });
  
  
  
  
  // In ForgePage.jsx - REPLACE your existing useEffect for Echo cleanup

useEffect(() => {
  const currentFrameRef = frameId || frame?.uuid;
  
  return () => {
    console.log('ForgePage: Component unmounting');
    
    // The store will handle cleanup via navigation listeners
    // But we still cleanup on unmount as a safety measure
    if (currentFrameRef) {
      useFramePresenceStore.getState().cleanupFrame(currentFrameRef);
    }
  };
}, [frameId, frame?.uuid]);
  
  
  
  
  
  
  const getCanvasPadding = () => {
    // Now responsiveMode is accessible from useEditorStore
    const basePadding = responsiveMode === 'desktop' ? 'p-8' : 'p-4';
    
    if (codePanelPosition === 'bottom' && showCodePanel) {
      if (codePanelMinimized) {
        return isMobile ? 'pb-16' : 'pb-20';
      }
      
      const panelHeight = Math.min(codePanelHeight, windowDimensions.height * 0.7);
      return isMobile ? `pb-[${panelHeight + 60}px]` : `pb-[${panelHeight + 80}px]`;
    }
    
    return basePadding;
  };
  
  
  // ADD these at the TOP of ForgePage.jsx, after imports and before the component

const LAYOUT_TYPES = ['section', 'container', 'div', 'flex', 'grid'];
const isLayoutElement = (type) => LAYOUT_TYPES.includes(type);

  // Get current frame's canvas components
  const canvasComponents = frameCanvasComponents[currentFrame] || []



    // MODIFY existing generateCode callback
  const generateCode = useCallback(async (components) => {
    try {
      if (!componentLibraryService || !componentLibraryService.clientSideCodeGeneration) {
        const mockCode = {
          react: `// Generated React Code for Frame: ${currentFrame}\nfunction App() {\n  return (\n    <div>\n      {/* ${components.length} components */}\n    </div>\n  );\n}`,
          html: `<!-- Generated HTML for Frame: ${currentFrame} -->\n<div>\n  <!-- ${components.length} components -->\n</div>`,
          css: `/* Generated CSS for Frame: ${currentFrame} */\n.container {\n  /* Styles for ${components.length} components */\n}`,
          tailwind: `<!-- Generated Tailwind for Frame: ${currentFrame} -->\n<div class="container">\n  <!-- ${components.length} components -->\n</div>`
        };
        setGeneratedCode(mockCode);
        updateSyncedCode(mockCode); // ADD THIS LINE
        return;
      }
  
      const code = await componentLibraryService.clientSideCodeGeneration(components, codeStyle);
      setGeneratedCode(code);
      updateSyncedCode(code); // ADD THIS LINE
      
      console.log('Code generated and synced successfully for frame:', currentFrame, Object.keys(code));
    } catch (error) {
      console.error('Failed to generate code:', error);
      const mockCode = {
        react: `// Error generating code\nfunction App() {\n  return <div>Error</div>;\n}`,
        html: `<!-- Error generating code -->`,
        css: `/* Error generating code */`,
        tailwind: `<!-- Error generating code -->`
      };
      setGeneratedCode(mockCode);
      updateSyncedCode(mockCode); // ADD THIS LINE
    }
  }, [codeStyle, currentFrame, updateSyncedCode]);

 // REPLACE existing setCodeStyle with: 
  const handleCodeStyleChange = useCallback((newStyle) => {
    setSyncedCodeStyle(newStyle);         // ✅ Just use the synced setter
    generateCode(canvasComponents);       // Will use updated codeStyle from store
  }, [canvasComponents, generateCode, setSyncedCodeStyle]);


  
  
  
  
    // Handler: Start dragging an existing component to reorder it
  const handleReorderDragStart = useCallback((e, componentId, parentId = null) => {
    e.stopPropagation();
    
    const component = canvasComponents.find(c => c.id === componentId);
    if (!component) return;
    
    setDraggedItem({ id: componentId, parentId });
    setSelectedComponent(componentId);
    
    // Visual feedback
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
    
    // Add dragging class for styling
    e.currentTarget.classList.add('dragging');
    
    console.log('Started reordering component:', componentId, 'from parent:', parentId);
  }, [canvasComponents]);
  
  // Handler: Dragging over another component (for reorder positioning)
  const handleReorderDragOver = useCallback((e, componentId, parentId = null) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem || draggedItem.id === componentId) return;
    
    setDragOverItem({ id: componentId, parentId });
    setDragOverContainer(parentId);
    
    // Change cursor to indicate drop is allowed
    e.dataTransfer.dropEffect = 'move';
  }, [draggedItem]);
  
  // Handler: Drop component to reorder
  const handleReorderDrop = useCallback((e, targetComponentId, targetParentId = null) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem || draggedItem.id === targetComponentId) {
      setDraggedItem(null);
      setDragOverItem(null);
      setDragOverContainer(null);
      return;
    }
    
    console.log('Reordering:', draggedItem.id, 'relative to:', targetComponentId);
    
    // Deep clone components
    let updatedComponents = JSON.parse(JSON.stringify(canvasComponents));
    
    // Find and remove the dragged component
    let draggedComponent = null;
    
    const removeComponent = (comps, id, parentId) => {
      if (parentId === null) {
        // Root level
        const index = comps.findIndex(c => c.id === id);
        if (index !== -1) {
          draggedComponent = comps.splice(index, 1)[0];
          return true;
        }
      } else {
        // Nested in parent
        for (let comp of comps) {
          if (comp.id === parentId && comp.children) {
            const index = comp.children.findIndex(c => c.id === id);
            if (index !== -1) {
              draggedComponent = comp.children.splice(index, 1)[0];
              return true;
            }
          }
          if (comp.children && removeComponent(comp.children, id, parentId)) {
            return true;
          }
        }
      }
      return false;
    };
    
    removeComponent(updatedComponents, draggedItem.id, draggedItem.parentId);
    
    if (!draggedComponent) {
      console.error('Could not find dragged component');
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }
    
    // Insert at new position
    const insertComponent = (comps, targetId, targetParent, draggedComp) => {
      if (targetParent === null) {
        // Root level insertion
        const targetIndex = comps.findIndex(c => c.id === targetId);
        if (targetIndex !== -1) {
          comps.splice(targetIndex, 0, draggedComp);
          return true;
        }
      } else {
        // Nested insertion
        for (let comp of comps) {
          if (comp.id === targetParent && comp.children) {
            const targetIndex = comp.children.findIndex(c => c.id === targetId);
            if (targetIndex !== -1) {
              comp.children.splice(targetIndex, 0, draggedComp);
              return true;
            }
          }
          if (comp.children && insertComponent(comp.children, targetId, targetParent, draggedComp)) {
            return true;
          }
        }
      }
      return false;
    };
    
    const inserted = insertComponent(updatedComponents, targetComponentId, targetParentId, draggedComponent);
    
    if (!inserted) {
      console.error('Could not insert component at target position');
      // Revert - add back to original position
      if (draggedItem.parentId === null) {
        updatedComponents.push(draggedComponent);
      }
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }
    
    // Update sortOrder for all siblings
    const updateSortOrders = (comps) => {
      comps.forEach((comp, index) => {
        comp.sortOrder = index;
        if (comp.children) {
          updateSortOrders(comp.children);
        }
      });
    };
    updateSortOrders(updatedComponents);
    
    // Update state
    setFrameCanvasComponents(prev => ({
      ...prev,
      [currentFrame]: updatedComponents
    }));
    
    pushHistory(currentFrame, updatedComponents, actionTypes.MOVE, {
      componentName: draggedComponent.name,
      componentId: draggedComponent.id,
      fromParent: draggedItem.parentId || 'root',
      toParent: targetParentId || 'root',
      targetComponent: targetComponentId
    });
    
    generateCode(updatedComponents);
    
    // Cleanup
    setDraggedItem(null);
    setDragOverItem(null);
    setDragOverContainer(null);
    
    console.log('Reorder completed successfully');
    
  }, [draggedItem, canvasComponents, currentFrame, pushHistory, actionTypes, generateCode]);
  
  // Handler: Drag end (cleanup)
  const handleReorderDragEnd = useCallback((e) => {
    e.target.classList.remove('dragging');
    setDraggedItem(null);
    setDragOverItem(null);
    setDragOverContainer(null);
  }, []);
  
  
  
  
  

  
  
    // ADD: Detect if project is GitHub import
  const [isGitHubProject, setIsGitHubProject] = useState(false);
  const [gitHubRepo, setGitHubRepo] = useState(null);
  
  useEffect(() => {
    if (project?.settings?.imported_from_github) {
      setIsGitHubProject(true);
      setGitHubRepo(project.settings.original_repo);
    }
  }, [project]);
  
  
  
  // Load components lazily after mount
useEffect(() => {
  const loadFrameComponents = async () => {
    if (!currentFrame || !projectId) return;
    
    try {
      const response = await axios.get(`/api/frames/${currentFrame}/components`);
      if (response.data.success) {
        setFrameCanvasComponents(prev => ({
          ...prev,
          [currentFrame]: response.data.data
        }));
        
        if (response.data.data.length > 0) {
          generateCode(response.data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load frame components:', error);
    }
  };
  
  // Delay loading slightly to allow page to render first
  const timeoutId = setTimeout(loadFrameComponents, 100);
  return () => clearTimeout(timeoutId);
}, [currentFrame, projectId]);
  
  
  
  
  // ADD: GitHub sync handler
  const handleGitHubSync = useCallback(async () => {
    if (!isGitHubProject || !projectId) return;
    
    try {
      const response = await axios.post(`/api/github/projects/${projectId}/sync`);
      if (response.data.success) {
        // Refresh frame data after sync
        router.reload({ only: ['frame', 'project'] });
      }
    } catch (error) {
      console.error('GitHub sync failed:', error);
    }
  }, [isGitHubProject, projectId]);
  
 
  
   // MODIFY your frame data initialization to be more robust
  useEffect(() => {
    console.log('ForgePage: Frame props changed:', { 
      frameId, 
      frameUuid: frame?.uuid, 
      hasCanvasData: !!frame?.canvas_data,
      componentCount: frame?.canvas_data?.components?.length || 0
    });
    
    const currentFrameId = frameId || frame?.uuid;
    
    if (!currentFrameId) {
      console.warn('ForgePage: No frame ID available');
      return;
    }
    
    if (currentFrameId !== currentFrame) {
      console.log('ForgePage: Updating current frame from', currentFrame, 'to', currentFrameId);
      setCurrentFrame(currentFrameId);
      setSelectedComponent(null);
      
      // CRITICAL: Always initialize frame data to prevent blank state
      if (frame?.canvas_data?.components && Array.isArray(frame.canvas_data.components)) {
        console.log('ForgePage: Loading frame components from backend:', frame.canvas_data.components.length);
        setFrameCanvasComponents(prev => ({
          ...prev,
          [currentFrameId]: frame.canvas_data.components
        }));
        
        if (frame.canvas_data.components.length > 0) {
          generateCode(frame.canvas_data.components);
        }
      } else {
        // Initialize empty array to prevent undefined errors
        console.log('ForgePage: Initializing empty frame data');
        setFrameCanvasComponents(prev => ({
          ...prev,
          [currentFrameId]: []
        }));
        generateCode([]);
      }
    }
  }, [frameId, frame?.uuid, frame?.canvas_data, currentFrame]);
  


  // Mock project frames data - This should come from your backend
  const processedProjectFrames = useMemo(() => {
    return (projectFrames || []).map(frame => ({
      ...frame,
      isActive: frame.id === currentFrame || frame.uuid === currentFrame
    }));
  }, [projectFrames, currentFrame]);

  // Enhanced frame switching handler with smooth transitions
  const handleFrameSwitch = useCallback(async (newFrameId) => {
    if (newFrameId === currentFrame || isFrameSwitching) return;

    console.log('Switching from frame:', currentFrame, 'to frame:', newFrameId);
    
    setIsFrameSwitching(true);
    setSwitchingToFrame(newFrameId);
    
    try {
      // Phase 1: Fade out current content
      setFrameTransitionPhase('fadeOut');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Phase 2: Show loading state
      setFrameTransitionPhase('loading');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Save current frame state before switching
      if (canvasComponents.length > 0) {
        setFrameCanvasComponents(prev => ({
          ...prev,
          [currentFrame]: canvasComponents
        }));
      }
      
      // Switch to new frame - In real app, this would navigate via Inertia
      setCurrentFrame(newFrameId);
      
      // Clear current selection when switching frames
      setSelectedComponent(null);
      
      // Load new frame's components (mock data for now)
      const newFrameComponents = frameCanvasComponents[newFrameId] || [];
      if (newFrameComponents.length > 0) {
        generateCode(newFrameComponents);
      }
      
      // Phase 3: Fade in new content
      setFrameTransitionPhase('fadeIn');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Phase 4: Complete transition
      setFrameTransitionPhase('idle');
      
      console.log('Frame switch completed to:', newFrameId);
      
    } catch (error) {
      console.error('Error during frame switch:', error);
      setFrameTransitionPhase('idle');
    } finally {
      setIsFrameSwitching(false);
      setSwitchingToFrame(null);
    }
  }, [currentFrame, isFrameSwitching, canvasComponents, frameCanvasComponents]);

  // WindowPanel handlers
  const handleOpenWindowPanel = useCallback(() => {
    setWindowPanelState(prev => ({
      ...prev,
      isOpen: true,
      position: { 
        x: Math.max(50, (windowDimensions.width - prev.size.width) / 2), 
        y: Math.max(50, (windowDimensions.height - prev.size.height) / 2)
      }
    }));
  }, [windowDimensions]);

  const handleCloseWindowPanel = useCallback(() => {
    setWindowPanelState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  // Handle window resize and mobile detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowDimensions({ width, height });
      setIsMobile(width < 768);
      
      if (width < 768) {
        setCodePanelHeight(Math.min(400, height * 0.6));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize component library and load frame-specific data
  useEffect(() => {
    const initializeComponents = async () => {
      try {
        setLoadingMessage('Loading components from database...');
        
        if (typeof componentLibraryService === 'undefined' || !componentLibraryService) {
          console.warn('componentLibraryService not available, using mock data');
          setComponentsLoaded(true);
          setLoadingMessage('');
          return;
        }
        
        await componentLibraryService.loadComponents();
        setComponentsLoaded(true);
        
        // FIXED: Load frame components from backend data first, then try service
        if (frame && frame.canvas_data && frame.canvas_data.components) {
          console.log('Using frame components from backend props');
          const backendComponents = frame.canvas_data.components;
          
          setFrameCanvasComponents(prev => ({
            ...prev,
            [currentFrame]: backendComponents
          }));
          
          if (backendComponents.length > 0) {
            generateCode(backendComponents);
          }
        } else if (projectId && currentFrame && componentLibraryService.loadProjectComponents) {
          // Fallback to service-based loading
          setLoadingMessage('Loading frame components from service...');
          const serviceComponents = await componentLibraryService.loadProjectComponents(projectId, currentFrame);
          if (serviceComponents && serviceComponents.length > 0) {
            setFrameCanvasComponents(prev => ({
              ...prev,
              [currentFrame]: serviceComponents
            }));
            generateCode(serviceComponents);
          }
        }
        
        setLoadingMessage('');
      } catch (error) {
        console.error('Failed to initialize components:', error);
        setComponentsLoaded(true);
        setLoadingMessage('');
      }
    };

    // Only initialize if we have a current frame
    if (currentFrame) {
      initializeComponents();
    }
  }, [currentFrame, projectId]);
  
  if (isForgePanelOpen('layout-presets-panel')) {
  panels.push({
    id: 'layout-presets-panel',
    title: 'Layout Presets',
    content: (
      <LayoutPresets
        onApplyPreset={handlePropertyUpdate}
        selectedComponent={selectedComponent}
        componentLibraryService={componentLibraryService}
      />
    )
  });
}

  // Auto-save frame components when they change
  useEffect(() => {
    const saveComponents = async () => {
        // Only save if we're not in the middle of undo/redo operations
        if (projectId && currentFrame && canvasComponents.length > 0 && componentsLoaded && !isFrameSwitching) {
            try {
                if (componentLibraryService && componentLibraryService.saveProjectComponents) {
                    console.log('Auto-saving', canvasComponents.length, 'components');
                    await componentLibraryService.saveProjectComponents(projectId, currentFrame, canvasComponents);
                }
            } catch (error) {
                console.error('Failed to auto-save components:', error);
            }
        }
    };

    // INCREASED delay for auto-save to reduce conflicts with undo/redo
    const timeoutId = setTimeout(saveComponents, 2000); // 2 seconds instead of 1
    return () => clearTimeout(timeoutId);
}, [canvasComponents, projectId, currentFrame, componentsLoaded, isFrameSwitching]);






// ADD: Asset drop handler
const handleAssetDrop = useCallback((e) => {
  e.preventDefault();
  
  if (!canvasRef.current) return;

  try {
    const dragDataStr = e.dataTransfer.getData('application/json');
    let dragData;
    
    try {
      dragData = JSON.parse(dragDataStr);
    } catch {
      return; // Not an asset drop
    }

    // Check if it's an asset drop
    if (dragData.type !== 'asset') return;

    const { asset, assetType } = dragData;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - canvasRect.left - 50);
    const y = Math.max(0, e.clientY - canvasRect.top - 20);

    // Create appropriate component based on asset type
    let componentType;
    let defaultProps = {};

    switch (assetType) {
      case 'image':
        componentType = 'image';
        defaultProps = {
          src: asset.url,
          alt: asset.name,
          width: asset.dimensions?.width || 'auto',
          height: asset.dimensions?.height || 'auto'
        };
        break;
      case 'video':
        componentType = 'video';
        defaultProps = {
          src: asset.url,
          controls: true,
          width: asset.dimensions?.width || 640,
          height: asset.dimensions?.height || 360
        };
        break;
      case 'audio':
        componentType = 'audio-player';
        defaultProps = {
          src: asset.url,
          title: asset.name,
          duration: asset.duration
        };
        break;
      default:
        // For documents, create a download link component
        componentType = 'link';
        defaultProps = {
          href: asset.url,
          text: asset.name,
          target: '_blank'
        };
        break;
    }

    const newComponent = componentLibraryService?.createLayoutElement 
      ? componentLibraryService.createLayoutElement(componentType, defaultProps)
      : {
          id: `${componentType}_${Date.now()}`,
          type: componentType,
          props: defaultProps,
          position: { x, y },
          name: `${asset.name} (${assetType})`,
          style: {},
          animation: {},
          children: []
        };

    console.log('ForgePage: Dropping asset as component:', newComponent);

    const updatedComponents = [...canvasComponents, newComponent];
    
    setFrameCanvasComponents(prev => ({
      ...prev,
      [currentFrame]: updatedComponents
    }));
    
    pushHistory(currentFrame, updatedComponents, actionTypes.DROP, {
      componentName: newComponent.name,
      componentType: newComponent.type,
      position: { x, y },
      componentId: newComponent.id
    });
    
    setSelectedComponent(newComponent.id);
    generateCode(updatedComponents);
    
  } catch (error) {
    console.error('Error handling asset drop:', error);
  }
}, [canvasComponents, currentFrame, componentLibraryService, pushHistory, actionTypes, generateCode]);







  // Initialize undo/redo when frame and components are ready
  useEffect(() => {
    if (currentFrame && componentsLoaded) {
      console.log('ForgePage: Initializing undo/redo for frame:', currentFrame);
      initUndoRedoFrame(currentFrame);
      
      // Push initial state if we have components
      if (canvasComponents.length > 0) {
        console.log('ForgePage: Pushing initial state with', canvasComponents.length, 'components');
        pushHistory(currentFrame, canvasComponents, actionTypes.INITIAL);
      }
    }
  }, [currentFrame, componentsLoaded, canvasComponents.length, initUndoRedoFrame, pushHistory, actionTypes]);
    
  // Force re-render when ForgeStore state changes
  useEffect(() => {
    console.log('ForgePage: ForgeStore state changed, triggering re-render');
  }, [forgePanelStates, allPanelsHidden, _triggerUpdate, showCodePanel]);

  // Mobile-specific: Force code panel to bottom on mobile
  useEffect(() => {
    if (isMobile && codePanelPosition === 'right') {
      setCodePanelPosition('bottom');
    }
  }, [isMobile, codePanelPosition]);

  // Handle token hover for tooltips
  const handleTokenHover = (e) => {
    if (!showTooltips || isMobile) return
    
    const token = e.target.getAttribute('data-token')
    if (token && tooltipDatabase && tooltipDatabase[token]) {
      const rect = e.target.getBoundingClientRect()
      setHoveredToken({
        token,
        tooltip: tooltipDatabase[token],
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      })
    }
  }

  const handleTokenLeave = () => {
    setHoveredToken(null)
  }

  // Panel handlers
  const handlePanelClose = (panelId) => {
    console.log('ForgePage: Panel close requested for:', panelId);
    toggleForgePanel(panelId)
  }

  const handlePanelStateChange = useCallback((hasRightPanels) => {
    console.log(`Right panels active: ${hasRightPanels}`)
  }, [])

  const handlePanelToggle = useCallback((panelType) => {
    const panelMap = {
      'components': 'components-panel',
      'code': 'code-panel',
      'layers': 'layers-panel'
    }
    
    const actualPanelId = panelMap[panelType]
    console.log('ForgePage: Header panel toggle requested:', panelType, '-> Panel ID:', actualPanelId);
    
    if (actualPanelId) {
      toggleForgePanel(actualPanelId)
    }
  }, [toggleForgePanel])

  const handleComponentTabChange = useCallback((tab) => {
    setActiveComponentTab(tab)
  }, [])

  const handleComponentSearch = useCallback((searchTerm) => {
    setComponentSearchTerm(searchTerm)
  }, [])

  // Component drag handlers
  const handleComponentDragStart = useCallback((e, componentType, variant = null, dragData = null) => {
    console.log('Drag started:', componentType, variant ? `with variant: ${variant.name}` : 'without variant');

    setDragState({
      isDragging: true,
      draggedComponent: {
        type: componentType,
        name: componentType
      },
      variant: variant,
      dragPreview: null
    })

    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/plain', JSON.stringify({ componentType, variant }))
  }, [])

  const handleComponentDragEnd = useCallback(() => {
    if (dragState.dragPreview) {
      document.body.removeChild(dragState.dragPreview)
    }
    setDragState({
      isDragging: false,
      draggedComponent: null,
      variant: null,
      dragPreview: null
    })
  }, [dragState.dragPreview])

  // Canvas drop handlers - Updated to work with frame-specific components
  const handleCanvasDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    // Track drag position for snap lines
    if (canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      setDragPosition({
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top
      });
    }
  }, []);


    // MODIFY your handleCanvasDrop to use the fixed version with error handling:
  const handleCanvasDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragPosition(null);
    
    if (!canvasRef.current) return;
  
    try {
      const componentDataStr = e.dataTransfer.getData('text/plain');
      let dragData;
      
      try {
        dragData = JSON.parse(componentDataStr);
      } catch (err) {
        console.error('Failed to parse drop data:', err);
        return;
      }
  
      const { componentType, variant } = dragData;
      const isLayout = ['section', 'container', 'div', 'flex', 'grid'].includes(componentType);
      
      // Find target container by walking up the DOM
      let targetId = null;
      let element = e.target;
      let searchDepth = 0;
      const MAX_SEARCH_DEPTH = 20;
      
      while (element && element !== canvasRef.current && searchDepth < MAX_SEARCH_DEPTH) {
        const compId = element.getAttribute('data-component-id');
        const isLayoutAttr = element.getAttribute('data-is-layout');
        
        if (compId && isLayoutAttr === 'true') {
          targetId = compId;
          console.log(`Found target container: ${targetId} at depth ${searchDepth}`);
          break;
        }
        
        element = element.parentElement;
        searchDepth++;
      }
  
      let componentDef = componentLibraryService?.getComponentDefinition(componentType);
  
      const newComponent = {
        id: `${componentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: componentType,
        props: {
          ...(componentDef?.default_props || {}),
          ...(variant?.props || {})
        },
        name: variant ? `${componentType} (${variant.name})` : (componentDef?.name || componentType),
        variant: variant || null,
        style: variant?.style || {},
        animation: {},
        children: [],
        isLayoutContainer: isLayout,
        zIndex: 0,
        sortOrder: 0
      };
  
      let updatedComponents;
      
      if (targetId) {
        // Deep clone to prevent mutation issues
        updatedComponents = JSON.parse(JSON.stringify(canvasComponents));
        
        // Use fixed addChildToContainer with depth tracking
        updatedComponents = addChildToContainer(updatedComponents, targetId, newComponent, 0);
        
        // Verify the update worked
        const verifyComponent = (comps, id) => {
          for (const comp of comps) {
            if (comp.children?.some(child => child.id === id)) return true;
            if (comp.children && verifyComponent(comp.children, id)) return true;
          }
          return false;
        };
        
        const wasAdded = verifyComponent(updatedComponents, newComponent.id);
        
        if (!wasAdded) {
          console.error('Failed to add component to container, adding to root instead');
          updatedComponents = [...canvasComponents, newComponent];
        }
        
      } else if (canvasComponents.length === 0 && !isLayout) {
        // Wrap non-layout in section
        const baseSection = componentLibraryService?.createLayoutElement('section') || {
          id: `section_${Date.now()}`,
          type: 'section',
          props: {},
          children: [],
          isLayoutContainer: true
        };
        baseSection.children = [newComponent];
        updatedComponents = [baseSection];
      } else {
        updatedComponents = [...canvasComponents, newComponent];
      }
      
      // CRITICAL: Validate updated components before setting state
      if (!Array.isArray(updatedComponents)) {
        console.error('Invalid components array, reverting');
        return;
      }
      
      // Force new state reference
      setFrameCanvasComponents(() => ({
        [currentFrame]: updatedComponents
      }));
      
      pushHistory(currentFrame, updatedComponents, actionTypes.DROP, {
        componentName: newComponent.name,
        componentType: newComponent.type,
        targetContainer: targetId || 'root',
        componentId: newComponent.id
      });
      
      setSelectedComponent(newComponent.id);
      handleComponentDragEnd();
      generateCode(updatedComponents);
      
    } catch (error) {
      console.error('❌ CRITICAL Drop error:', error);
      console.error('Error stack:', error.stack);
      
      // Don't let the error crash the page
      handleComponentDragEnd();
      
      // Show user-friendly error
      alert('Failed to drop component. Please try again or check console for details.');
    }
  }, [canvasComponents, currentFrame, componentLibraryService, pushHistory, actionTypes, generateCode]);
  
  // ADD this helper function
const findDropTarget = (components, dropX, dropY, canvasRect) => {
  const sorted = [...components].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
  
  for (const comp of sorted) {
    if (comp.isLayoutContainer) {
      const element = document.querySelector(`[data-component-id="${comp.id}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        const relativeX = dropX + canvasRect.left;
        const relativeY = dropY + canvasRect.top;
        
        if (relativeX >= rect.left && relativeX <= rect.right &&
            relativeY >= rect.top && relativeY <= rect.bottom) {
          
          if (comp.children?.length > 0) {
            const childTarget = findDropTarget(comp.children, dropX, dropY, canvasRect);
            if (childTarget) return childTarget;
          }
          
          return comp;
        }
      }
    }
  }
  
  return null;
};
  
  const getComponentBounds = (comp) => {
      return {
          x: comp.position?.x || 0,
          y: comp.position?.y || 0,
          width: parseInt(comp.style?.width) || 100,
          height: parseInt(comp.style?.minHeight) || 50
      };
  };
  
  const isPointInBounds = (point, bounds) => {
      return point.x >= bounds.x && point.x <= bounds.x + bounds.width &&
             point.y >= bounds.y && point.y <= bounds.y + bounds.height;
  };
  
// REPLACE your existing addChildToContainer with this fixed version:
const addChildToContainer = (components, containerId, newChild, depth = 0) => {
  // Prevent infinite recursion
  const MAX_DEPTH = 10;
  if (depth > MAX_DEPTH) {
    console.error('❌ Maximum nesting depth exceeded:', depth);
    return components;
  }
  
  console.log(`addChildToContainer (depth ${depth}):`, { 
    containerId, 
    newChildId: newChild.id,
    componentsCount: components.length 
  });
  
  let found = false;
  
  const recursiveAdd = (comps, currentDepth) => {
    if (currentDepth > MAX_DEPTH) {
      console.error('Recursion depth exceeded in recursiveAdd');
      return comps;
    }
    
    return comps.map(comp => {
      // Prevent circular references
      if (comp.id === newChild.id) {
        console.warn('⚠️ Attempted to add component as its own child, skipping');
        return comp;
      }
      
      // Direct match
      if (comp.id === containerId) {
        console.log('✅ FOUND direct match:', comp.id);
        found = true;
        
        // Ensure children array exists
        const existingChildren = Array.isArray(comp.children) ? comp.children : [];
        
        // Prevent duplicate children
        if (existingChildren.some(child => child.id === newChild.id)) {
          console.warn('⚠️ Child already exists in container, skipping');
          return comp;
        }
        
        return {
          ...comp,
          children: [...existingChildren, {
            ...newChild,
            sortOrder: existingChildren.length,
            // Add parent reference for easier traversal
            parentId: comp.id
          }]
        };
      }
      
      // Recursive check in children
      if (comp.children && Array.isArray(comp.children) && comp.children.length > 0) {
        const updatedChildren = recursiveAdd(comp.children, currentDepth + 1);
        
        // Only update if children were actually modified
        if (found) {
          console.log(`✅ Found in children of: ${comp.id} (depth ${currentDepth})`);
          return {
            ...comp,
            children: updatedChildren
          };
        }
      }
      
      return comp;
    });
  };
  
  const result = recursiveAdd(components, depth);
  
  if (!found) {
    console.error('❌ Target container not found:', containerId);
    console.error('Available containers:', components.map(c => ({
      id: c.id,
      name: c.name,
      hasChildren: !!c.children?.length,
      childrenIds: c.children?.map(ch => ch.id)
    })));
  }
  
  return result;
};


  
  // ALSO ADD this debug method to check component definitions after loading:
  const debugComponentDefinitions = useCallback(() => {
      if (componentLibraryService) {
          console.log('=== COMPONENT DEFINITIONS DEBUG ===');
          const allDefs = componentLibraryService.getAllComponentDefinitions();
          console.log('Total definitions loaded:', Object.keys(allDefs).length);
          
          Object.entries(allDefs).forEach(([type, def]) => {
              console.log(`${type}:`, {
                  name: def.name,
                  hasDefaults: !!def.default_props,
                  defaults: def.default_props,
                  variants: def.variants?.length || 0
              });
          });
          
          // Check specific components
          ['button', 'card', 'badge'].forEach(type => {
              const def = componentLibraryService.getComponentDefinition(type);
              console.log(`${type} definition:`, def);
          });
      }
  }, [componentLibraryService]);
  
  // ADD this useEffect to debug after components load:
  useEffect(() => {
      if (componentsLoaded && componentLibraryService) {
          // Add a small delay to ensure everything is loaded
          setTimeout(debugComponentDefinitions, 1000);
      }
  }, [componentsLoaded, componentLibraryService, debugComponentDefinitions]);

  // Component selection handler
  const handleComponentClick = useCallback((componentId, e) => {
    e.stopPropagation()
    setSelectedComponent(componentId)
  }, [])

  // ENHANCED: Modified handleComponentDelete to trigger thumbnail updates
const handleComponentDelete = useCallback((componentId) => {
  const componentToDelete = canvasComponents.find(c => c.id === componentId);
  const newComponents = canvasComponents.filter(c => c.id !== componentId)
  
  setFrameCanvasComponents(prev => ({
    ...prev,
    [currentFrame]: newComponents
  }));
  
  pushHistory(currentFrame, newComponents, actionTypes.DELETE, {
    componentName: componentToDelete?.name || componentToDelete?.type || 'component',
    componentId,
    deletedComponent: componentToDelete
  });
  
  if (selectedComponent === componentId) {
    setSelectedComponent(null)
  }
  
  // ENHANCED: Schedule thumbnail update after deletion
  if (currentFrame) {
    const canvasSettings = {
      viewport: getCurrentCanvasDimensions(),
      background_color: frame?.settings?.background_color || '#ffffff',
      responsive_mode: responsiveMode,
      zoom_level: zoomLevel,
      grid_visible: gridVisible
    };
    
    // Schedule thumbnail update (with slight delay)
    setTimeout(() => {
      scheduleThumbnailUpdate(newComponents, canvasSettings);
    }, 300);
  }
  setTimeout(() => {
    if (componentLibraryService?.saveProjectComponents) {
      componentLibraryService.saveProjectComponents(projectId, currentFrame, newComponents);
    }
  }, 200);
  
  generateCode(newComponents)
}, [selectedComponent, canvasComponents, currentFrame, pushHistory, actionTypes, projectId, 
    componentLibraryService, generateCode, scheduleThumbnailUpdate, getCurrentCanvasDimensions, 
    responsiveMode, zoomLevel, gridVisible, frame?.settings]);


const handleIconSelect = useCallback((icon) => {
    console.log('Icon selected in Forge:', icon);
    
    // Create icon component based on selected icon
    const iconComponent = componentLibraryService?.createLayoutElement 
      ? componentLibraryService.createLayoutElement('icon', {
          iconType: icon.type,
          iconName: icon.name,
          size: 24,
          color: 'var(--color-text)',
          svgData: icon.data || null
        })
      : {
          id: `icon_${Date.now()}`,
          type: 'icon',
          props: {
            iconType: icon.type,
            iconName: icon.name,
            size: 24,
            color: 'var(--color-text)',
            svgData: icon.data || null
          },
          position: { x: 100, y: 100 },
          name: `${icon.name} Icon`,
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px'
          },
          animation: {},
          children: []
        };

    // Add to canvas components
    const updatedComponents = [...canvasComponents, iconComponent];
    
    setFrameCanvasComponents(prev => ({
      ...prev,
      [currentFrame]: updatedComponents
    }));
    
    // Push to undo/redo history
    pushHistory(currentFrame, updatedComponents, actionTypes.DROP, {
      componentName: iconComponent.name,
      componentType: iconComponent.type,
      position: iconComponent.position,
      componentId: iconComponent.id
    });
    
    setSelectedComponent(iconComponent.id);
    generateCode(updatedComponents);
    
    // Auto-save
    setTimeout(() => {
      if (componentLibraryService?.saveProjectComponents) {
        componentLibraryService.saveProjectComponents(projectId, currentFrame, updatedComponents);
      }
    }, 200);
    
  }, [canvasComponents, currentFrame, projectId, pushHistory, actionTypes, componentLibraryService, generateCode]);

  
  // MODIFY: Enhanced property update handler with undo/redo
   // ENHANCED: Modified handlePropertyUpdate to trigger thumbnail updates
const handlePropertyUpdate = useCallback((componentId, propName, value) => {
  const updatedComponents = canvasComponents.map(c => {
    if (c.id === componentId) {
      if (propName === 'position') {
        return { ...c, position: value }
      } else if (propName === 'style') {
        return { ...c, style: { ...c.style, ...value } }
      } else if (propName === 'animation') {
        return { ...c, animation: { ...c.animation, ...value } }
      } else if (propName === 'name') {
        return { ...c, name: value }
      } else if (propName === 'reset') {
        return { 
          ...c, 
          style: {}, 
          animation: {},
          props: {}
        }
      } else {
        return { ...c, props: { ...c.props, [propName]: value } }
      }
    }
    return c
  })
  
  // Update local state immediately
  setFrameCanvasComponents(prev => ({
    ...prev,
    [currentFrame]: updatedComponents
  }));
  
  // Push to history for undo/redo
  const component = canvasComponents.find(c => c.id === componentId);
  const componentName = component?.name || component?.type || 'component';
  
  let actionType = actionTypes.PROP_UPDATE;
  if (propName === 'position') actionType = actionTypes.MOVE;
  else if (propName === 'style') actionType = actionTypes.STYLE_UPDATE;
  
  if (propName === 'position') {
    const oldPos = component?.position || { x: 0, y: 0 };
    const deltaX = Math.abs(value.x - oldPos.x);
    const deltaY = Math.abs(value.y - oldPos.y);
    
    if (deltaX > 5 || deltaY > 5) {
      pushHistory(currentFrame, updatedComponents, actionType, {
        componentName,
        componentId,
        propName,
        value,
        previousValue: oldPos
      });
    }
  } else {
    pushHistory(currentFrame, updatedComponents, actionType, {
      componentName,
      componentId,
      propName,
      value,
      previousValue: propName === 'style' ? component?.style : component?.props?.[propName]
    });
  }
  
  // ENHANCED: Schedule thumbnail update for visual changes
  const shouldUpdateThumbnail = propName !== 'name' && // Skip thumbnail update for name changes
                               (propName === 'style' || propName === 'position' || 
                                propName === 'props' || propName === 'animation');
                                
  if (shouldUpdateThumbnail && updatedComponents.length > 0) {
    const canvasSettings = {
      viewport: getCurrentCanvasDimensions(),
      background_color: frame?.settings?.background_color || '#ffffff',
      responsive_mode: responsiveMode,
      zoom_level: zoomLevel,
      grid_visible: gridVisible
    };
    
    // Schedule debounced thumbnail update
    scheduleThumbnailUpdate(updatedComponents, canvasSettings);
  }
  
  // Auto-save with longer delay to prevent conflicts
  setTimeout(() => {
    if (componentLibraryService?.saveProjectComponents) {
      componentLibraryService.saveProjectComponents(projectId, currentFrame, updatedComponents);
    }
  }, propName === 'position' ? 2000 : 1000);
  
  generateCode(updatedComponents);
}, [canvasComponents, currentFrame, projectId, pushHistory, actionTypes, componentLibraryService, generateCode, 
    scheduleThumbnailUpdate, getCurrentCanvasDimensions, responsiveMode, zoomLevel, gridVisible, frame?.settings]);

  

  
  
  
  
  // ENHANCED: Modified undo/redo handlers to update thumbnails
const handleUndo = useCallback(async () => {
  if (!currentFrame || !canUndo(currentFrame)) {
    console.log('ForgePage: Undo blocked - no frame or cannot undo');
    return;
  }

  console.log('ForgePage: Starting undo operation');
  
  try {
    if (componentLibraryService?.clearSaveQueue) {
      componentLibraryService.clearSaveQueue(currentFrame);
    }
    
    const previousComponents = undo(currentFrame);
    if (previousComponents) {
      console.log('ForgePage: Executing undo - restoring', previousComponents.length, 'components');
      
      setFrameCanvasComponents(prev => ({
        ...prev,
        [currentFrame]: previousComponents
      }));
      
      if (selectedComponent && !previousComponents.find(c => c.id === selectedComponent)) {
        setSelectedComponent(null);
      }
      
      generateCode(previousComponents);
      
      // ENHANCED: Update thumbnail after undo
      const canvasSettings = {
        viewport: getCurrentCanvasDimensions(),
        background_color: frame?.settings?.background_color || '#ffffff',
        responsive_mode: responsiveMode,
        zoom_level: zoomLevel,
        grid_visible: gridVisible
      };
      
      setTimeout(() => {
        scheduleThumbnailUpdate(previousComponents, canvasSettings);
      }, 200);
      
      setTimeout(async () => {
        try {
          if (componentLibraryService?.forceSave) {
            await componentLibraryService.forceSave(projectId, currentFrame, previousComponents);
            console.log('ForgePage: Undo state saved to database');
          }
        } catch (error) {
          console.error('Failed to save undo state:', error);
        }
      }, 100);
      
      console.log('ForgePage: Undo completed successfully');
    }
  } catch (error) {
    console.error('ForgePage: Undo failed:', error);
  }
}, [currentFrame, undo, canUndo, selectedComponent, generateCode, projectId, componentLibraryService, 
    scheduleThumbnailUpdate, getCurrentCanvasDimensions, responsiveMode, zoomLevel, gridVisible, frame?.settings]);



  
  const handleRedo = useCallback(async () => {
  if (!currentFrame || !canRedo(currentFrame)) {
    console.log('ForgePage: Redo blocked - no frame or cannot redo');
    return;
  }

  console.log('ForgePage: Starting redo operation');
  
  try {
    if (componentLibraryService?.clearSaveQueue) {
      componentLibraryService.clearSaveQueue(currentFrame);
    }
    
    const nextComponents = redo(currentFrame);
    if (nextComponents) {
      console.log('ForgePage: Executing redo - restoring', nextComponents.length, 'components');
      
      setFrameCanvasComponents(prev => ({
        ...prev,
        [currentFrame]: nextComponents
      }));
      
      generateCode(nextComponents);
      
      // ENHANCED: Update thumbnail after redo
      const canvasSettings = {
        viewport: getCurrentCanvasDimensions(),
        background_color: frame?.settings?.background_color || '#ffffff',
        responsive_mode: responsiveMode,
        zoom_level: zoomLevel,
        grid_visible: gridVisible
      };
      
      setTimeout(() => {
        scheduleThumbnailUpdate(nextComponents, canvasSettings);
      }, 200);
      
      setTimeout(async () => {
        try {
          if (componentLibraryService?.forceSave) {
            await componentLibraryService.forceSave(projectId, currentFrame, nextComponents);
            console.log('ForgePage: Redo state saved to database');
          }
        } catch (error) {
          console.error('Failed to save redo state:', error);
        }
      }, 100);
      
      console.log('ForgePage: Redo completed successfully');
    }
  } catch (error) {
    console.error('ForgePage: Redo failed:', error);
  }
}, [currentFrame, redo, canRedo, generateCode, projectId, componentLibraryService, 
    scheduleThumbnailUpdate, getCurrentCanvasDimensions, responsiveMode, zoomLevel, gridVisible, frame?.settings]);
    
   // ENHANCED: Add thumbnail status indicator to the UI (optional)
  const renderThumbnailStatus = () => {
    if (!thumbnailGenerating && !thumbnailUrl) return null;
    
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm border transition-all duration-200 ${
          thumbnailGenerating 
            ? 'bg-blue-50/90 border-blue-200 text-blue-700' 
            : 'bg-green-50/90 border-green-200 text-green-700'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            thumbnailGenerating ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
          }`}></div>
          <span className="text-sm font-medium">
            {thumbnailGenerating ? 'Updating preview...' : 'Preview updated'}
          </span>
        </div>
      </div>
    );
  };


  // FIXED: Auto-save with conflict prevention
  useEffect(() => {
    const saveComponents = async () => {
      // CRITICAL: Don't auto-save if undo/redo operations are happening
      if (projectId && currentFrame && canvasComponents.length > 0 && componentsLoaded && !isFrameSwitching) {
        try {
          // Check if we have pending undo/redo operations
          if (componentLibraryService?.hasPendingSave && componentLibraryService.hasPendingSave(currentFrame)) {
            console.log('ForgePage: Skipping auto-save due to pending undo/redo operation');
            return;
          }
          
          if (componentLibraryService?.saveProjectComponents) {
            console.log('ForgePage: Auto-saving', canvasComponents.length, 'components');
            await componentLibraryService.saveProjectComponents(projectId, currentFrame, canvasComponents);
          }
        } catch (error) {
          console.error('Failed to auto-save components:', error);
        }
      }
    };

    // INCREASED delay to prevent conflicts with undo/redo
    const timeoutId = setTimeout(saveComponents, 3000); // 3 seconds
    return () => clearTimeout(timeoutId);
  }, [canvasComponents, projectId, currentFrame, componentsLoaded, isFrameSwitching, componentLibraryService]);

  

  // Handle code editing
  const handleCodeEdit = useCallback((newCode, codeType) => {
    setGeneratedCode(prev => ({
      ...prev,
      [codeType]: newCode
    }))
  }, [])
  
  
  
  
  // ADD cleanup effect when unmounting or changing frames
useEffect(() => {
  return () => {
    // Cleanup function when component unmounts
    console.log('ForgePage: Cleaning up before unmount/navigation');
    
    // Don't clear critical state, but ensure saves are complete
    if (componentLibraryService?.flushPendingSaves) {
      componentLibraryService.flushPendingSaves();
    }
  };
}, []);


// REPLACE WITH THIS (adds Echo cleanup):
useEffect(() => {
  const handleInertiaStart = () => {
    console.log('ForgePage: Navigation starting, preparing to unmount...');
    setIsFrameSwitching(true);
    
    // ✅ ADD THIS: Cleanup Echo channels before navigation
    if (currentFrame) {
      safeLeaveChannel(`presence-frame.${currentFrame}`);
      safeLeaveChannel(`frame-lock.${currentFrame}`);
    }
  };
  
  const handleInertiaFinish = () => {
    console.log('ForgePage: Navigation finished');
    setIsFrameSwitching(false);
  };
  
  router.on('start', handleInertiaStart);
  router.on('finish', handleInertiaFinish);
  
  return () => {
    console.log('ForgePage: Removing Inertia listeners');
    router.off('start', handleInertiaStart);
    router.off('finish', handleInertiaFinish);
    
    // ✅ ADD THIS: Final cleanup
    if (currentFrame) {
      safeLeaveChannel(`presence-frame.${currentFrame}`);
      safeLeaveChannel(`frame-lock.${currentFrame}`);
    }
  };
}, [currentFrame]);  // ✅ ADD currentFrame to dependencies





  
  
  
  
  
  

  const handleCanvasClick = useCallback((e) => {
  // Check if we clicked directly on the canvas (not a component)
  const clickedOnCanvas = e.target === canvasRef.current || 
                         e.target.classList.contains('canvas-root') ||
                         !e.target.closest('[data-component-id]');
  
  if (clickedOnCanvas) {
    console.log('Canvas root clicked, deselecting component');
    setSelectedComponent(null);
    setIsCanvasSelected(false);
  }
}, []);

  // Move code panel to right sidebar
  const moveCodePanelToRightSidebar = useCallback(() => {
    if (!isMobile) {
      setCodePanelPosition('right')
    }
  }, [isMobile])

  // Close code panel handler
  const handleCloseCodePanel = useCallback(() => {
    console.log('ForgePage: Closing code panel via toggle');
    toggleForgePanel('code-panel');
  }, [toggleForgePanel]);

  // Copy code to clipboard
  const copyCodeToClipboard = useCallback(async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      return true;
    } catch (err) {
      console.error('Failed to copy code:', err)
      return false;
    }
  }, [])

  // Download code as file
  const downloadCode = useCallback((code, filename, type) => {
    const element = document.createElement('a')
    const file = new Blob([code], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${filename}.${type}`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }, [])

  // Get available tabs based on code style
  const getAvailableTabs = () => {
    switch (codeStyle) {
      case 'react-tailwind':
        return ['react', 'tailwind']
      case 'react-css':
        return ['react', 'css']
      case 'html-css':
        return ['html', 'css']
      case 'html-tailwind':
        return ['html', 'tailwind']
      default:
        return ['react', 'tailwind']
    }
  }

  

  // Get transition classes based on current phase
  const getTransitionClasses = () => {
    switch (frameTransitionPhase) {
      case 'fadeOut':
        return 'opacity-0 scale-95 blur-sm';
      case 'loading':
        return 'opacity-0 scale-95';
      case 'fadeIn':
        return 'opacity-100 scale-100';
      case 'idle':
      default:
        return 'opacity-100 scale-100';
    }
  };

  // WindowPanel dummy content
  const windowPanelContent = (
    <div className="p-6 space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Forge Window Panel
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Current Frame: {currentFrame}
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Canvas Stats
          </h3>
          <div className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
            <div>Components: {canvasComponents.length}</div>
            <div>Selected: {selectedComponent ? 'Yes' : 'None'}</div>
            <div>Frame: {currentFrame}</div>
            <div>Switching: {isFrameSwitching ? 'Yes' : 'No'}</div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Frame Info
          </h3>
          <div className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
            <div>Total Frames: {projectFrames.length}</div>
            <div>Transition: {frameTransitionPhase}</div>
            <div>Code Panel: {showCodePanel ? 'Open' : 'Closed'}</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Create mock panels for testing
  const createMockPanel = (id, title, content) => ({
    id,
    title,
    content: content || (
      <div className="p-4 space-y-2">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">Mock {title} panel content</p>
        <div className="space-y-1 text-xs text-gray-500">
          <div>This is a placeholder for the {title} panel</div>
          <div>Frame: {currentFrame}</div>
          <div>Components: {canvasComponents.length}</div>
          <div>Switching: {isFrameSwitching ? 'Yes' : 'No'}</div>
        </div>
      </div>
    )
  });

  // Memoize default panels
  const defaultPanels = useMemo(() => [
    createMockPanel('components-panel', 'Components', 
      ComponentsPanel ? (
        <ComponentsPanel
          activeTab={activeComponentTab}
          searchTerm={componentSearchTerm}
          onComponentDragStart={handleComponentDragStart}
          onComponentDragEnd={handleComponentDragEnd}
        />
      ) : null
    ),
    createMockPanel('layers-panel', 'Layers',
      LayersPanel ? (
        <LayersPanel
          canvasComponents={canvasComponents}
          selectedComponent={selectedComponent}
          onComponentSelect={setSelectedComponent}
          onComponentDelete={handleComponentDelete}  // ADD THIS IF MISSING
          searchTerm={componentSearchTerm}  // ADD: Pass search term from Panel
        />
      ) : null
    ),
    createMockPanel('properties-panel', 'Properties',
      PropertiesPanel ? (
        <PropertiesPanel
          canvasComponents={canvasComponents}
          selectedComponent={selectedComponent}
          onPropertyUpdate={handlePropertyUpdate}
          onComponentDelete={handleComponentDelete}
          onGenerateCode={generateCode}
          componentLibraryService={componentLibraryService}
        />
      ) : null
    ),
    createMockPanel('assets-panel', 'Assets',
      AssetsPanel ? (
        <AssetsPanel
          onAssetDrop={handleAssetDrop}
          onAssetSelect={(asset) => console.log('Asset selected:', asset)}
        />
      ) : null
    )
  ], [
    activeComponentTab,
    componentSearchTerm,
    handleComponentDragStart,
    handleComponentDragEnd,
    canvasComponents,
    selectedComponent,
    handlePropertyUpdate,
    handleComponentDelete,
    generateCode,
    handleAssetDrop
  ]);

  // Memoize the sidebar code panel
  const sidebarCodePanel = useMemo(() => ({
    id: 'code-panel',
    title: 'Generated Code',
    content: SidebarCodePanel ? (
      <SidebarCodePanel
        showTooltips={showTooltips && !isMobile}
        setShowTooltips={setShowTooltips}
        codeStyle={codeStyle}
        setCodeStyle={setSyncedCodeStyle}
        activeCodeTab={activeCodeTab}
        setActiveCodeTab={setActiveCodeTab}
        generatedCode={generatedCode}
        getAvailableTabs={getAvailableTabs}
        highlightCode={highlightCode}
        handleTokenHover={handleTokenHover}
        handleTokenLeave={handleTokenLeave}
        handleCodeEdit={handleCodeEdit}
        copyCodeToClipboard={copyCodeToClipboard}
        downloadCode={downloadCode}
        setCodePanelPosition={setCodePanelPosition}
        canvasComponents={canvasComponents}
        generateCode={generateCode}
        isMobile={isMobile}
      />
    ) : (
      <div className="p-4">
        <h3 className="font-semibold mb-2">Generated Code</h3>
        <div className="text-xs text-gray-600">
          Code panel component not available
        </div>
      </div>
    )
  }), [
    showTooltips,
    codeStyle,
    activeCodeTab,
    generatedCode,
    handleCodeEdit,
    copyCodeToClipboard,
    downloadCode,
    canvasComponents,
    generateCode,
    isMobile
  ])

  // Filter visible panels based on ForgeStore state
  const visiblePanels = useMemo(() => {
    console.log('ForgePage: Computing visible panels...');
    
    if (allPanelsHidden) {
      return []
    }
    
    const panels = []
    
    defaultPanels.forEach(panel => {
      const isOpen = isForgePanelOpen(panel.id);
      
      if (panel.id === 'properties-panel' || panel.id === 'assets-panel') {
        panels.push(panel);
      } else if (isOpen) {
        panels.push(panel);
      }
    });
    
    if (codePanelPosition === 'right' && !isMobile && isForgePanelOpen('code-panel')) {
      panels.push(sidebarCodePanel)
    }
    
    return panels
  }, [
    defaultPanels, 
    sidebarCodePanel, 
    codePanelPosition, 
    isMobile, 
    isForgePanelOpen, 
    allPanelsHidden,
    forgePanelStates,
    _triggerUpdate
  ])

  // Check if any panels are visible
  const hasVisiblePanels = useMemo(() => {
    const result = !allPanelsHidden && visiblePanels.length > 0;
    return result;
  }, [allPanelsHidden, visiblePanels])

  // Tab configuration for components panel
  const componentTabConfig = useMemo(() => ({
    defaultTab: 'elements',
    tabs: [
      {
        id: 'elements',
        label: 'Elements',
        icon: Square
      },
      {
        id: 'components',
        label: 'Components',
        icon: Code
      }
    ]
  }), [])

  // Show loading state while components are loading
  if (!componentsLoaded && loadingMessage) {
    return (
      <ErrorBoundary>
      <AuthenticatedLayout
        headerProps={{
          onPanelToggle: handlePanelToggle,
          panelStates: {},
          onModeSwitch: () => {},
          // CRITICAL: Pass the undo/redo handlers to header
          project: project,
          frame: frame,
          canvasComponents: canvasComponents,
          onUndo: handleUndo,          // THIS IS CRITICAL
          onRedo: handleRedo,          // THIS IS CRITICAL
          projectId: projectId,
          currentFrame: currentFrame
        }}
      >
        <Head title="Forge - Visual Builder" />
        
        <div className="h-[calc(100vh-60px)] flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
            <div className="text-lg font-medium" style={{ color: 'var(--color-text)' }}>{loadingMessage}</div>
          </div>
        </div>
      </AuthenticatedLayout>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
    <AuthenticatedLayout
      headerProps={{
        onPanelToggle: handlePanelToggle,
        panelStates: {},
        onModeSwitch: () => {}
      }}
    >
      <Head title={`Forge - ${frame?.name || 'Visual Builder'}`} />
      
      {/* Enhanced Tooltip with mobile detection */}
      {CodeTooltip && <CodeTooltip hoveredToken={hoveredToken} showTooltips={showTooltips && !isMobile} />}
      
      {/* Frame Transition Overlay */}
      {isFrameSwitching && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        >
          <div 
            className="bg-white rounded-2xl p-8 shadow-2xl border max-w-md w-full mx-4"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="text-center space-y-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 mx-auto animate-spin" style={{ color: 'var(--color-primary)' }} />
                <div className="absolute inset-0 rounded-full border-2 border-dashed animate-pulse" style={{ borderColor: 'var(--color-primary-soft)' }}></div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                  Switching Frames
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Loading {switchingToFrame}...
                </p>
              </div>
              
              <div className="bg-gray-100 rounded-full h-1 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                <div 
                  className="h-full rounded-full transition-all duration-300 animate-pulse"
                  style={{ 
                    backgroundColor: 'var(--color-primary)',
                    width: frameTransitionPhase === 'fadeOut' ? '25%' : 
                           frameTransitionPhase === 'loading' ? '75%' : 
                           frameTransitionPhase === 'fadeIn' ? '100%' : '0%'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content area with transition effects */}
      <div className="h-[calc(100vh-60px)] flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div 
            className={`
                flex-1 flex items-center justify-center transition-all duration-300 ease-in-out
                ${isMobile ? 'p-4' : 'p-8'} ${getCanvasPadding()}
                ${getTransitionClasses()}
                relative
            `}
            style={{
                // Add Huion-style dotted background
                backgroundColor: 'var(--color-bg)',
                backgroundImage: `
                    radial-gradient(circle at 1px 1px, #d1d5db 1px, transparent 0)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0'
            }}
        >
            {/* Canvas Component with Enhanced Responsive Sizing */}
            {CanvasComponent ? (
                <div className="relative w-full flex justify-center">
                    {/* Empty Canvas State for Pages */}
                    {frame?.type === 'page' && canvasComponents.length === 0 && (
                        <EmptyCanvasState
                            frameType={frame.type}
                            onAddSection={() => {
                                // Auto-add a section
                                const sectionComponent = componentLibraryService?.createLayoutElement('section');
                                if (sectionComponent) {
                                    const updatedComponents = [sectionComponent];
                                    setFrameCanvasComponents(prev => ({
                                        ...prev,
                                        [currentFrame]: updatedComponents
                                    }));
                                    setSelectedComponent(sectionComponent.id);
                                }
                            }}
                            onDragOver={handleCanvasDragOver}
                            onDrop={handleCanvasDrop}
                            isDragOver={dragState.isDragging}
                        />
                    )}
                    
                    {/* Regular Canvas - only show if we have components or frame is component type */}
                    {(canvasComponents.length > 0 || frame?.type === 'component') && (
                        <CanvasComponent
                          canvasRef={canvasRef}
                          canvasComponents={canvasComponents}
                          selectedComponent={selectedComponent}
                          dragState={dragState}
                          dragPosition={dragPosition}
                          isCanvasSelected={isCanvasSelected}
                          componentLibraryService={componentLibraryService}
                          onCanvasDragOver={handleCanvasDragOver}
                          onCanvasDrop={handleCanvasDrop}
                          onCanvasClick={handleCanvasClick}
                          onComponentClick={handleComponentClick}
                          onPropertyUpdate={handlePropertyUpdate}
                          isMobile={isMobile}
                          currentFrame={currentFrame}
                          isFrameSwitching={isFrameSwitching}
                          frameType={frame?.type || 'page'}
                          responsiveMode={responsiveMode}
                          zoomLevel={zoomLevel}
                          gridVisible={gridVisible}
                          projectId={projectId}  // ADD
                          setFrameCanvasComponents={setFrameCanvasComponents}  // ADD
                          onReorderDragStart={handleReorderDragStart}
                          onReorderDragOver={handleReorderDragOver}
                          onReorderDrop={handleReorderDrop}
                          onReorderDragEnd={handleReorderDragEnd}
                          draggedItem={draggedItem}
                          dragOverItem={dragOverItem}
                      />
                    )}
                </div>
            ) : (
                <div 
                    ref={canvasRef}
                    className="w-full h-full bg-white border-2 border-dashed border-gray-300 rounded-lg 
                               flex items-center justify-center transition-all duration-300"
                    onDragOver={handleCanvasDragOver}
                    onDrop={handleCanvasDrop}
                    onClick={handleCanvasClick}
                >
                    <div className="text-center text-gray-500">
                        <div className="text-lg font-semibold mb-2">Frame: {currentFrame}</div>
                        <div className="text-sm">Drop components here</div>
                    </div>
                </div>
            )}
        </div>
        
        {/* Fixed Code Generation Panel - Bottom (Mobile Optimized) */}
        {BottomCodePanel && (
          <BottomCodePanel
            showCodePanel={showCodePanel && (codePanelPosition === 'bottom' || isMobile)}
            codePanelMinimized={codePanelMinimized}
            codePanelHeight={codePanelHeight}
            codePanelRef={codePanelRef}
            setCodePanelMinimized={setCodePanelMinimized}
            setCodePanelHeight={setCodePanelHeight}
            moveCodePanelToRightSidebar={moveCodePanelToRightSidebar}
            setShowCodePanel={handleCloseCodePanel}
            showTooltips={showTooltips && !isMobile}
            setShowTooltips={setShowTooltips}
            codeStyle={codeStyle}
            setCodeStyle={setSyncedCodeStyle}
            activeCodeTab={activeCodeTab}
            setActiveCodeTab={setActiveCodeTab}
            generatedCode={generatedCode}
            getAvailableTabs={getAvailableTabs}
            highlightCode={highlightCode}
            handleTokenHover={handleTokenHover}
            handleTokenLeave={handleTokenLeave}
            handleCodeEdit={handleCodeEdit}
            copyCodeToClipboard={copyCodeToClipboard}
            downloadCode={downloadCode}
            generateCode={generateCode}
            canvasComponents={canvasComponents}
            setCodePanelPosition={setCodePanelPosition}
            isMobile={isMobile}
            windowDimensions={windowDimensions}
            currentFrame={currentFrame}
            isFrameSwitching={isFrameSwitching}
          />
        )}
      </div>

      {/* Enhanced Panel System with transition support */}
      {Panel && hasVisiblePanels && (
        <Panel
          key={`panel-system-${_triggerUpdate}`}
          isOpen={true}
          initialPanels={visiblePanels}
          allowedDockPositions={isMobile ? ['left'] : ['left', 'right']}
          maxPanelsPerDock={3}
          onPanelClose={handlePanelClose}
          onPanelStateChange={handlePanelStateChange}
          snapToEdge={false}
          mergePanels={true}
          mergePosition="right" // Default merge position for properties + assets
          defaultDockPosition={{
            'properties-panel': 'right',
            'assets-panel': 'right',
            'components-panel': 'left',
            'layers-panel': 'left',
            'code-panel': 'right'
          }}
          showTabs={true}
          showSearch={!isMobile}
          tabConfig={componentTabConfig}
          onTabChange={handleComponentTabChange}
          onSearch={handleComponentSearch}
          searchPlaceholder={`Search ${activeComponentTab}...`}
          isMobile={isMobile}
          defaultWidth={isMobile ? 280 : 320}
          minWidth={isMobile ? 250 : 280}
          maxWidth={isMobile ? 300 : 400}
          isFrameSwitching={isFrameSwitching}
        />
      )}
      
      {/* Enhanced FloatingFrameSwitcher with project frames data */}
      {FloatingFrameSwitcher && (
        <FloatingFrameSwitcher
          currentFrame={currentFrame}
          onFrameSwitch={handleFrameSwitch}
          isMobile={isMobile}
          projectFrames={processedProjectFrames}
          projectId={projectId}
          isFrameSwitching={isFrameSwitching}
          frameTransitionPhase={frameTransitionPhase}
        />
      )}

      {/* WindowPanel Integration */}
      <WindowPanel
        isOpen={windowPanelState.isOpen}
        title={windowPanelState.title}
        content={windowPanelContent}
        onClose={handleCloseWindowPanel}
        onModeChange={() => {}}
        initialMode={windowPanelState.mode}
        initialPosition={windowPanelState.position}
        initialSize={windowPanelState.size}
        minSize={{ width: 400, height: 300 }}
        maxSize={{ width: 1000, height: 700 }}
        isDraggable={true}
        isResizable={true}
        className="forge-window-panel"
        zIndexBase={2000}
        panelCollisionOffset={isMobile ? 280 : 320}
        isMobile={isMobile}
      />

      {/* Mobile-specific: Bottom navigation with enhanced frame switching */}
      {isMobile && (
        <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md rounded-full px-4 py-2">
            <button
              onClick={() => toggleForgePanel('code-panel')}
              className={`p-2 rounded-full transition-colors ${
                showCodePanel 
                  ? 'bg-white/30 text-white' 
                  : 'text-white/70 hover:bg-white/20'
              }`}
              title="Toggle Code Panel"
              disabled={isFrameSwitching}
            >
              <Code className="w-4 h-4" />
            </button>
            
            {showCodePanel && (
              <>
                <button
                  onClick={() => setCodePanelMinimized(!codePanelMinimized)}
                  className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
                  title={codePanelMinimized ? 'Expand Code Panel' : 'Minimize Code Panel'}
                  disabled={isFrameSwitching}
                >
                  {codePanelMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyCodeToClipboard(generatedCode[activeCodeTab])}
                  className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
                  title="Copy Code"
                  disabled={isFrameSwitching}
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => generateCode(canvasComponents)}
                  className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
                  title="Regenerate Code"
                  disabled={isFrameSwitching}
                >
                  <RefreshCw className={`w-4 h-4 ${isFrameSwitching ? 'animate-spin' : ''}`} />
                </button>
              </>
            )}
            
            <button
              onClick={handleOpenWindowPanel}
              className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
              title="Open Window Panel"
              disabled={isFrameSwitching}
            >
              <PictureInPicture className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop quick actions - MODIFIED */}
      {!isMobile && (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2">
          {/* ADD Code Panel Mode Switcher */}
          <div className="flex flex-col gap-1 p-2 rounded-lg shadow-lg" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <button
              onClick={() => {
                setCodePanelPosition('bottom');
                toggleForgePanel('code-panel');
              }}
              className={`p-2 rounded transition-all ${codePanelPosition === 'bottom' ? 'bg-blue-100' : ''}`}
              title="Bottom Code Panel"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCodePanelPosition('right');
                toggleForgePanel('code-panel');
              }}
              className={`p-2 rounded transition-all ${codePanelPosition === 'right' ? 'bg-blue-100' : ''}`}
              title="Side Code Panel"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCodePanelPosition('modal');
                toggleForgePanel('code-modal-panel');
              }}
              className={`p-2 rounded transition-all ${codePanelPosition === 'modal' ? 'bg-blue-100' : ''}`}
              title="Modal Code Panel"
            >
              <PictureInPicture className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={handleOpenWindowPanel}
            className={`p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
              isFrameSwitching ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ 
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              boxShadow: 'var(--shadow-lg)'
            }}
            title="Open Window Panel"
            disabled={isFrameSwitching}
          >
              <Monitor className="w-5 h-5" />
        </button>
      </div>
    )}
      
      {renderThumbnailStatus()}
      
      <IconWindowPanel onIconSelect={handleIconSelect} />
      
      
      {/* Modal Code Panel */}
      {isForgePanelOpen('code-modal-panel') && (
        <ModalCodePanel
          showCodePanel={true}
          setShowCodePanel={() => toggleForgePanel('code-modal-panel')}
          showTooltips={showTooltips}
          setShowTooltips={setShowTooltips}
          codeStyle={codeStyle}
          setCodeStyle={handleCodeStyleChange}
          activeCodeTab={activeCodeTab}
          setActiveCodeTab={setActiveCodeTab}
          generatedCode={generatedCode}
          getAvailableTabs={getAvailableTabs}
          copyCodeToClipboard={copyCodeToClipboard}
          downloadCode={downloadCode}
          generateCode={generateCode}
          canvasComponents={canvasComponents}
          handleCodeEdit={handleCodeEdit}
          isMobile={isMobile}
        />
      )}

      {/* Enhanced mobile performance optimization styles */}
      {isMobile && (
        <style>{`
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          @media (max-width: 768px) {
            .motion-reduce {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
            
            .overflow-scroll {
              -webkit-overflow-scrolling: touch;
              scroll-behavior: smooth;
            }
            
            .shadow-lg, .shadow-xl, .shadow-2xl {
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24) !important;
            }
          }

          /* Frame transition animations */
          .frame-transition-enter {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          
          .frame-transition-enter-active {
            opacity: 1;
            transform: scale(1) translateY(0);
            transition: all 300ms ease-out;
          }
          
          .frame-transition-exit {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          
          .frame-transition-exit-active {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
            transition: all 200ms ease-in;
          }

          /* Smooth blur animation for frame switching */
          .frame-blur-enter {
            filter: blur(0px);
          }
          
          .frame-blur-active {
            filter: blur(2px);
            transition: filter 200ms ease-in-out;
          }
          
          .frame-blur-exit {
            filter: blur(0px);
            transition: filter 200ms ease-in-out;
          }
        `}</style>
      )}
    </AuthenticatedLayout>
    </ErrorBoundary>
  );
}