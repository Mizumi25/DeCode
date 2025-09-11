// Enhanced ForgePage.jsx - Frame Switching with Smooth Transitions
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Panel from '@/Components/Panel';
import { Square, Code, Layers, User, Settings, ChevronUp, ChevronDown, Copy, RefreshCw, Monitor, PictureInPicture, Loader2 } from 'lucide-react';
import { useForgeStore } from '@/stores/useForgeStore';

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

// Import dynamic component service
import { componentLibraryService } from '@/Services/ComponentLibraryService';
import { tooltipDatabase } from '@/Components/Forge/TooltipDatabase';
import { formatCode, highlightCode, parseCodeAndUpdateComponents } from '@/Components/Forge/CodeUtils';

export default function ForgePage({ projectId, frameId, project, frame }) {
  // Zustand stores with proper subscriptions
  const {
    toggleForgePanel,
    isForgePanelOpen,
    getOpenForgePanelsCount,
    allPanelsHidden,
    forgePanelStates,
    _triggerUpdate
  } = useForgeStore()

  // Frame switching state
  const [isFrameSwitching, setIsFrameSwitching] = useState(false)
  const [switchingToFrame, setSwitchingToFrame] = useState(null)
  const [frameTransitionPhase, setFrameTransitionPhase] = useState('idle') // 'idle', 'fadeOut', 'loading', 'fadeIn'

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })

  // Canvas state for dropped components - Now frame-specific
  const [frameCanvasComponents, setFrameCanvasComponents] = useState({})
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

  const canvasRef = useRef(null)
  const codePanelRef = useRef(null)
  
  const [currentFrame, setCurrentFrame] = useState(frameId || frame?.uuid || 'frame-1');

  // Get current frame's canvas components
  const canvasComponents = frameCanvasComponents[currentFrame] || []

  // Mock project frames data - This should come from your backend
  const projectFrames = [
    {
      id: frameId || frame?.uuid || 'frame-1',
      name: frame?.name || 'Landing Page',
      type: 'desktop',
      thumbnail: '/api/placeholder/200/120',
      lastModified: '2m ago',
      components: canvasComponents.length,
      isActive: true
    },
    {
      id: 'frame-2',
      name: 'Mobile View',
      type: 'mobile', 
      thumbnail: '/api/placeholder/200/120',
      lastModified: '5m ago',
      components: 8,
      isActive: false
    },
    {
      id: 'frame-3',
      name: 'Dashboard',
      type: 'desktop',
      thumbnail: '/api/placeholder/200/120', 
      lastModified: '1h ago',
      components: 24,
      isActive: false
    }
  ]

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
          setLoadingMessage('Components loaded successfully!');
          setTimeout(() => setLoadingMessage(''), 2000);
          return;
        }
        
        await componentLibraryService.loadComponents();
        setComponentsLoaded(true);
        setLoadingMessage('Components loaded successfully!');
        
        // Load frame-specific components
        if (projectId && currentFrame) {
          setLoadingMessage('Loading frame components...');
          const existingComponents = await componentLibraryService.loadProjectComponents(projectId, currentFrame);
          if (existingComponents && existingComponents.length > 0) {
            setFrameCanvasComponents(prev => ({
              ...prev,
              [currentFrame]: existingComponents
            }));
            generateCode(existingComponents);
          }
        }
        
        setTimeout(() => setLoadingMessage(''), 2000);
      } catch (error) {
        console.error('Failed to initialize components:', error);
        setComponentsLoaded(true);
        setLoadingMessage('Failed to load components. Using fallback mode.');
        setTimeout(() => setLoadingMessage(''), 3000);
      }
    };

    initializeComponents();
  }, [projectId, currentFrame]);

  // Auto-save frame components when they change
  useEffect(() => {
    const saveComponents = async () => {
      if (projectId && currentFrame && canvasComponents.length > 0 && componentsLoaded && !isFrameSwitching) {
        try {
          if (componentLibraryService && componentLibraryService.saveProjectComponents) {
            await componentLibraryService.saveProjectComponents(projectId, currentFrame, canvasComponents);
          }
        } catch (error) {
          console.error('Failed to auto-save components:', error);
        }
      }
    };

    const timeoutId = setTimeout(saveComponents, 1000);
    return () => clearTimeout(timeoutId);
  }, [canvasComponents, projectId, currentFrame, componentsLoaded, isFrameSwitching]);

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

  const handleCanvasDrop = useCallback((e) => {
    e.preventDefault()
    
    if (!canvasRef.current) return

    try {
      const dragDataStr = e.dataTransfer.getData('text/plain')
      let dragData;
      
      try {
        dragData = JSON.parse(dragDataStr);
      } catch {
        dragData = { componentType: dragDataStr, variant: null };
      }

      const { componentType, variant } = dragData;
      
      const canvasRect = canvasRef.current.getBoundingClientRect()
      const x = Math.max(0, e.clientX - canvasRect.left - 50)
      const y = Math.max(0, e.clientY - canvasRect.top - 20)

      const newComponent = {
        id: `${componentType}_${Date.now()}`,
        type: componentType,
        props: {},
        position: { x, y },
        name: variant ? `${componentType} (${variant.name})` : componentType,
        variant: variant || null,
        style: {},
        animation: {}
      }

      const updatedComponents = [...canvasComponents, newComponent];
      
      // Update frame-specific components
      setFrameCanvasComponents(prev => ({
        ...prev,
        [currentFrame]: updatedComponents
      }));
      
      setSelectedComponent(newComponent.id)
      handleComponentDragEnd()

      console.log('Component dropped to frame:', currentFrame, newComponent);
      generateCode(updatedComponents)
    } catch (error) {
      console.error('Error handling component drop:', error);
      handleComponentDragEnd();
    }
  }, [canvasComponents, currentFrame])

  // Component selection handler
  const handleComponentClick = useCallback((componentId, e) => {
    e.stopPropagation()
    setSelectedComponent(componentId)
  }, [])

  // Component deletion handler - Updated for frame-specific components
  const handleComponentDelete = useCallback((componentId) => {
    const newComponents = canvasComponents.filter(c => c.id !== componentId)
    
    setFrameCanvasComponents(prev => ({
      ...prev,
      [currentFrame]: newComponents
    }));
    
    if (selectedComponent === componentId) {
      setSelectedComponent(null)
    }
    generateCode(newComponents)
  }, [selectedComponent, canvasComponents, currentFrame])

  // Property update handler - Updated for frame-specific components
  const handlePropertyUpdate = useCallback((componentId, propName, value) => {
    const updatedComponents = canvasComponents.map(c => {
      if (c.id === componentId) {
        if (propName === 'position') {
          return { ...c, position: value }
        } else if (propName === 'style') {
          return { ...c, style: value }
        } else if (propName === 'animation') {
          return { ...c, animation: value }
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
    
    setFrameCanvasComponents(prev => ({
      ...prev,
      [currentFrame]: updatedComponents
    }));
    
    generateCode(updatedComponents)
  }, [canvasComponents, currentFrame])

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

  // Calculate responsive canvas padding for code panel
  const getCanvasPadding = () => {
    if (codePanelPosition === 'bottom' && showCodePanel) {
      if (codePanelMinimized) {
        return isMobile ? 'pb-16' : 'pb-20';
      }
      
      const panelHeight = Math.min(codePanelHeight, windowDimensions.height * 0.7);
      return isMobile ? `pb-[${panelHeight + 60}px]` : `pb-[${panelHeight + 80}px]`;
    }
    return isMobile ? 'pb-4' : 'pb-8';
  };

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
          onModeSwitch: () => {}
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
          `}
        >
          {CanvasComponent ? (
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
              isMobile={isMobile}
              currentFrame={currentFrame}
              isFrameSwitching={isFrameSwitching}
            />
          ) : (
            <div 
              ref={canvasRef}
              className={`
                w-full h-full bg-white border-2 border-dashed border-gray-300 rounded-lg 
                flex items-center justify-center transition-all duration-300
                ${isFrameSwitching ? 'opacity-50 pointer-events-none' : ''}
              `}
              onDragOver={handleCanvasDragOver}
              onDrop={handleCanvasDrop}
              onClick={handleCanvasClick}
            >
              <div className="text-center text-gray-500">
                <div className="text-lg font-semibold mb-2">Frame: {currentFrame}</div>
                <div className="text-sm">Drop components here</div>
                <div className="text-xs mt-2">Components: {canvasComponents.length}</div>
                <div className="text-xs">Panels visible: {hasVisiblePanels ? 'Yes' : 'No'}</div>
                <div className="text-xs">Switching: {isFrameSwitching ? 'Yes' : 'No'}</div>
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
          projectFrames={projectFrames}
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