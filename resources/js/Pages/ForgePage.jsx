// Enhanced ForgePage.jsx - Frame Switching with Smooth Transitions
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Panel from '@/Components/Panel';
import { Square, Code, Layers, User, Settings, ChevronUp, ChevronDown, Copy, RefreshCw, Monitor, PictureInPicture, Loader2 } from 'lucide-react';
import { useForgeStore } from '@/stores/useForgeStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { useForgeUndoRedoStore } from '@/stores/useForgeUndoRedoStore';
import { useThumbnail } from '@/hooks/useThumbnail';

// Import separated forge components
import ComponentsPanel from '@/Components/Forge/ComponentsPanel';
import LayersPanel from '@/Components/Forge/LayersPanel';
import PropertiesPanel from '@/Components/Forge/PropertiesPanel';
import AssetsPanel from '@/Components/Forge/AssetsPanel';
import CanvasComponent from '@/Components/Forge/CanvasComponent';
import BottomCodePanel from '@/Components/Forge/BottomCodePanel';
import SidebarCodePanel from '@/Components/Forge/SidebarCodePanel';
import CodeTooltip from '@/Components/Forge/CodeTooltip';
import FloatingFrameSwitcher from '@/Components/Forge/FloatingFrameSwitcher';
import WindowPanel from '@/Components/WindowPanel';
import LayoutPresets from '@/Components/Forge/LayoutPresets';
import EmptyCanvasState from '@/Components/Forge/EmptyCanvasState';
import SectionDropZone from '@/Components/Forge/SectionDropZone';


// Import dynamic component service
import { componentLibraryService } from '@/Services/ComponentLibraryService';
import { tooltipDatabase } from '@/Components/Forge/TooltipDatabase';
import { formatCode, highlightCode, parseCodeAndUpdateComponents } from '@/Components/Forge/CodeUtils';

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

  // Frame switching state
  const [isFrameSwitching, setIsFrameSwitching] = useState(false)
  const [switchingToFrame, setSwitchingToFrame] = useState(null)
  const [frameTransitionPhase, setFrameTransitionPhase] = useState('idle') // 'idle', 'fadeOut', 'loading', 'fadeIn'

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })

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
  const [codeStyle, setCodeStyle] = useState('react-tailwind')
  const [componentsLoaded, setComponentsLoaded] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Initializing components...')

  // Component panel tab state
  const [activeComponentTab, setActiveComponentTab] = useState('elements')
  const [componentSearchTerm, setComponentSearchTerm] = useState('')
  
  const [undoRedoInProgress, setUndoRedoInProgress] = useState(false);

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
  
    // ADD: Detect if project is GitHub import
  const [isGitHubProject, setIsGitHubProject] = useState(false);
  const [gitHubRepo, setGitHubRepo] = useState(null);
  
  useEffect(() => {
    if (project?.settings?.imported_from_github) {
      setIsGitHubProject(true);
      setGitHubRepo(project.settings.original_repo);
    }
  }, [project]);
  
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
  
  // Code generation
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
        return;
      }

      const code = await componentLibraryService.clientSideCodeGeneration(components, codeStyle);
      setGeneratedCode(code);
      
      console.log('Code generated successfully for frame:', currentFrame, Object.keys(code));
    } catch (error) {
      console.error('Failed to generate code:', error);
      const mockCode = {
        react: `// Error generating code\nfunction App() {\n  return <div>Error</div>;\n}`,
        html: `<!-- Error generating code -->`,
        css: `/* Error generating code */`,
        tailwind: `<!-- Error generating code -->`
      };
      setGeneratedCode(mockCode);
    }
  }, [codeStyle, currentFrame])
  
  useEffect(() => {
      console.log('ForgePage: Frame props changed:', { 
          frameId, 
          frameUuid: frame?.uuid, 
          hasCanvasData: !!frame?.canvas_data,
          componentCount: frame?.canvas_data?.components?.length || 0
      });
      
      const currentFrameId = frameId || frame?.uuid;
      
      if (currentFrameId && currentFrameId !== currentFrame) {
          console.log('ForgePage: Updating current frame from', currentFrame, 'to', currentFrameId);
          setCurrentFrame(currentFrameId);
          
          // Clear previous selection
          setSelectedComponent(null);
          
          // Load frame data if available from backend
          if (frame?.canvas_data?.components && Array.isArray(frame.canvas_data.components)) {
              console.log('ForgePage: Loading frame components from backend:', frame.canvas_data.components);
              setFrameCanvasComponents(prev => ({
                  ...prev,
                  [currentFrameId]: frame.canvas_data.components
              }));
              
              // Generate code for loaded components
              if (frame.canvas_data.components.length > 0) {
                  generateCode(frame.canvas_data.components);
              }
          } else if (!frameCanvasComponents[currentFrameId]) {
              // Only initialize empty if we don't already have data for this frame
              console.log('ForgePage: No backend data and no cached data, initializing empty');
              setFrameCanvasComponents(prev => ({
                  ...prev,
                  [currentFrameId]: []
              }));
          }
      }
  }, [frameId, frame?.uuid, frame?.canvas_data?.components, currentFrame]);
  
  // Get current frame's canvas components
  const canvasComponents = frameCanvasComponents[currentFrame] || []

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
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

    // REPLACE the handleCanvasDrop method in ForgePage.jsx (around line 400)
    // ENHANCED: Modified handleCanvasDrop to trigger thumbnail updates
const handleCanvasDrop = useCallback((e) => {
  e.preventDefault();
  
  if (!canvasRef.current) return;

  try {
    const dragDataStr = e.dataTransfer.getData('text/plain');
    let dragData;
    
    try {
      dragData = JSON.parse(dragDataStr);
    } catch {
      dragData = { componentType: dragDataStr, variant: null };
    }

    const { componentType, variant } = dragData;
    
    if (frame?.type === 'page' && canvasComponents.length === 0) {
      const layoutElements = ['div', 'section', 'container', 'flex', 'grid'];
      if (!layoutElements.includes(componentType)) {
        alert('Pages must start with a Layout element (Section, Container, Div, etc.)');
        return;
      }
    }

    let componentDef = null;
    if (componentLibraryService?.getComponentDefinition) {
      componentDef = componentLibraryService.getComponentDefinition(componentType);
    }
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - canvasRect.left - 50);
    const y = Math.max(0, e.clientY - canvasRect.top - 20);

    const newComponent = componentLibraryService?.createLayoutElement 
      ? componentLibraryService.createLayoutElement(componentType, variant?.props || {})
      : {
          id: `${componentType}_${Date.now()}`,
          type: componentType,
          props: {
            ...(componentDef?.default_props || {}),
            ...(variant?.props || {})
          },
          position: { x, y },
          name: variant ? `${componentType} (${variant.name})` : (componentDef?.name || componentType),
          variant: variant || null,
          style: {},
          animation: {},
          children: []
        };

    if (newComponent.style?.position !== 'static') {
      newComponent.position = { x, y };
    }

    console.log('ForgePage: Dropping component:', newComponent);

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
    handleComponentDragEnd();
    
    // ENHANCED: Schedule thumbnail update for new component
    if (updatedComponents.length > 0) {
      const canvasSettings = {
        viewport: getCurrentCanvasDimensions(),
        background_color: frame?.settings?.background_color || '#ffffff',
        responsive_mode: responsiveMode,
        zoom_level: zoomLevel,
        grid_visible: gridVisible
      };
      
      // Schedule immediate thumbnail update for new components (shorter debounce)
      setTimeout(() => {
        scheduleThumbnailUpdate(updatedComponents, canvasSettings);
      }, 500); // 500ms delay for new components
    }
    
    // Auto-save
    setTimeout(() => {
      if (componentLibraryService?.saveProjectComponents) {
        componentLibraryService.saveProjectComponents(projectId, currentFrame, updatedComponents);
      }
    }, 200);
    
    generateCode(updatedComponents);
    
  } catch (error) {
    console.error('Error handling component drop:', error);
    handleComponentDragEnd();
  }
}, [canvasComponents, currentFrame, frame?.type, componentLibraryService, pushHistory, actionTypes, projectId, 
    handleComponentDragEnd, generateCode, scheduleThumbnailUpdate, getCurrentCanvasDimensions, 
    responsiveMode, zoomLevel, gridVisible, frame?.settings]);


  
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

  // Canvas click handler to deselect components
  const handleCanvasClick = useCallback((e) => {
    if (e.target === canvasRef.current) {
      setSelectedComponent(null)
    }
  }, [])

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
      AssetsPanel ? <AssetsPanel /> : null
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
    generateCode
  ])

  // Memoize the sidebar code panel
  const sidebarCodePanel = useMemo(() => ({
    id: 'code-panel',
    title: 'Generated Code',
    content: SidebarCodePanel ? (
      <SidebarCodePanel
        showTooltips={showTooltips && !isMobile}
        setShowTooltips={setShowTooltips}
        codeStyle={codeStyle}
        setCodeStyle={setCodeStyle}
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
    );
  }

  return (
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
            setCodeStyle={setCodeStyle}
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
          mergePosition={isMobile ? "left" : "right"}
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

      {/* Desktop quick action for window panel */}
      {!isMobile && (
        <div className="fixed bottom-6 right-6 z-30">
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
  );
}