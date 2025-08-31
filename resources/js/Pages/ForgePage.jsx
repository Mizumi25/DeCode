// Enhanced ForgePage.jsx - MOBILE RESPONSIVE FIXES for code panel visibility and drag functionality + WindowPanel Integration + ForgeStore Panel Toggles
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Panel from '@/Components/Panel';
import { Square, Code, Layers, User, Settings, ChevronUp, ChevronDown, Copy, RefreshCw, Monitor, PictureInPicture } from 'lucide-react';
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

export default function ForgePage({ projectId, frameId }) {
  // Zustand stores
  const {
    toggleForgePanel,
    isForgePanelOpen,
    getOpenForgePanelsCount,
    allPanelsHidden
  } = useForgeStore()

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })

  // Canvas state for dropped components
  const [canvasComponents, setCanvasComponents] = useState([])
  const [selectedComponent, setSelectedComponent] = useState(null)
  const [generatedCode, setGeneratedCode] = useState({ html: '', css: '', react: '', tailwind: '' })
  const [showCodePanel, setShowCodePanel] = useState(false)
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
    variant: null // Track variant being dragged
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
  
  const [currentFrame, setCurrentFrame] = useState(frameId || 'frame-1');

  // Add this handler function
  const handleFrameSwitch = useCallback((frameId) => {
    setCurrentFrame(frameId);
    console.log('Switching to frame:', frameId);
  }, [projectId]);

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

  const handleWindowPanelModeChange = useCallback((newMode) => {
    setWindowPanelState(prev => ({
      ...prev,
      mode: newMode
    }));
  }, []);

  // Handle window resize and mobile detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowDimensions({ width, height });
      setIsMobile(width < 768);
      
      // Adjust code panel height for mobile
      if (width < 768) {
        setCodePanelHeight(Math.min(400, height * 0.6));
      }
    };

    // Initial detection
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize component library on mount - Mock version for testing
  useEffect(() => {
    const initializeComponents = async () => {
      try {
        setLoadingMessage('Loading components from database...');
        
        // Mock the component library service if it doesn't exist
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
        
        // Load existing project components if projectId and frameId are provided
        if (projectId && frameId) {
          setLoadingMessage('Loading existing project components...');
          const existingComponents = await componentLibraryService.loadProjectComponents(projectId, frameId);
          setCanvasComponents(existingComponents || []);
          if (existingComponents && existingComponents.length > 0) {
            generateCode(existingComponents);
          }
        }
        
        setTimeout(() => setLoadingMessage(''), 2000);
      } catch (error) {
        console.error('Failed to initialize components:', error);
        setComponentsLoaded(true); // Allow app to continue
        setLoadingMessage('Failed to load components. Using fallback mode.');
        setTimeout(() => setLoadingMessage(''), 3000);
      }
    };

    initializeComponents();
  }, [projectId, frameId]);

  // Auto-save project components when they change
  useEffect(() => {
    const saveComponents = async () => {
      if (projectId && frameId && canvasComponents.length > 0 && componentsLoaded) {
        try {
          if (componentLibraryService && componentLibraryService.saveProjectComponents) {
            await componentLibraryService.saveProjectComponents(projectId, frameId, canvasComponents);
          }
        } catch (error) {
          console.error('Failed to auto-save components:', error);
        }
      }
    };

    const timeoutId = setTimeout(saveComponents, 1000);
    return () => clearTimeout(timeoutId);
  }, [canvasComponents, projectId, frameId, componentsLoaded]);


  // Add this useEffect to ForgePage.jsx to ensure proper initialization
  useEffect(() => {
    // Force re-render when store is hydrated from persistence
    // This ensures the UI is in sync with the persisted state
    const unsubscribe = useForgeStore.subscribe(
      (state) => state.forgePanelStates,
      () => {
        // Force a re-render when panel states change
        setSelectedComponent(prev => prev); // Trigger re-render without changing value
      }
    );

    return () => unsubscribe();
  }, []);
  // Mobile-specific: Force code panel to bottom on mobile
  useEffect(() => {
    if (isMobile && codePanelPosition === 'right') {
      setCodePanelPosition('bottom');
    }
  }, [isMobile, codePanelPosition]);

  // Handle token hover for tooltips
  const handleTokenHover = (e) => {
    if (!showTooltips || isMobile) return // Disable tooltips on mobile
    
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

  // Panel handlers - Updated to use ForgeStore
  const handlePanelClose = (panelId) => {
    toggleForgePanel(panelId)
  }

  const handlePanelStateChange = useCallback((hasRightPanels) => {
    console.log(`Right panels active: ${hasRightPanels}`)
  }, [])

  const handlePanelToggle = useCallback((panelType) => {
    // Handle panel toggles from header
    const panelMap = {
      'components': 'components-panel',
      'code': 'code-panel',
      'layers': 'layers-panel'
    }
    
    const actualPanelId = panelMap[panelType]
    if (actualPanelId) {
      toggleForgePanel(actualPanelId)
    }
  }, [toggleForgePanel])

  const handlePanelMaximize = (panelType) => {
    
  }

  const handleModeSwitch = (mode) => {
  
  
  }

  // Component tab handlers
  const handleComponentTabChange = useCallback((tab) => {
    setActiveComponentTab(tab)
  }, [])

  const handleComponentSearch = useCallback((searchTerm) => {
    setComponentSearchTerm(searchTerm)
  }, [])

  // Mock component drag handlers for when service is not available
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

  // Canvas drop handlers
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
      setCanvasComponents(updatedComponents)
      setSelectedComponent(newComponent.id)
      handleComponentDragEnd()

      console.log('Component dropped:', newComponent);
      generateCode(updatedComponents)
    } catch (error) {
      console.error('Error handling component drop:', error);
      handleComponentDragEnd();
    }
  }, [canvasComponents])

  // Component selection handler
  const handleComponentClick = useCallback((componentId, e) => {
    e.stopPropagation()
    setSelectedComponent(componentId)
  }, [])

  // Component deletion handler
  const handleComponentDelete = useCallback((componentId) => {
    const newComponents = canvasComponents.filter(c => c.id !== componentId)
    setCanvasComponents(newComponents)
    if (selectedComponent === componentId) {
      setSelectedComponent(null)
    }
    generateCode(newComponents)
  }, [selectedComponent, canvasComponents])

  // Property update handler
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
    setCanvasComponents(updatedComponents)
    generateCode(updatedComponents)
  }, [canvasComponents])

  // Code generation with fallback
  const generateCode = useCallback(async (components) => {
    if (components.length === 0) {
      setGeneratedCode({ html: '', css: '', react: '', tailwind: '' })
      setShowCodePanel(false)
      return
    }

    try {
      // Mock code generation if service is not available
      if (!componentLibraryService || !componentLibraryService.clientSideCodeGeneration) {
        const mockCode = {
          react: `// Generated React Code\nfunction App() {\n  return (\n    <div>\n      {/* ${components.length} components */}\n    </div>\n  );\n}`,
          html: `<!-- Generated HTML -->\n<div>\n  <!-- ${components.length} components -->\n</div>`,
          css: `/* Generated CSS */\n.container {\n  /* Styles for ${components.length} components */\n}`,
          tailwind: `<!-- Generated Tailwind -->\n<div class="container">\n  <!-- ${components.length} components -->\n</div>`
        };
        setGeneratedCode(mockCode);
        setShowCodePanel(true);
        return;
      }

      const code = await componentLibraryService.clientSideCodeGeneration(components, codeStyle);
      setGeneratedCode(code);
      setShowCodePanel(true);
      
      console.log('Code generated successfully:', Object.keys(code));
    } catch (error) {
      console.error('Failed to generate code:', error);
      // Fallback to mock code
      const mockCode = {
        react: `// Error generating code\nfunction App() {\n  return <div>Error</div>;\n}`,
        html: `<!-- Error generating code -->`,
        css: `/* Error generating code */`,
        tailwind: `<!-- Error generating code -->`
      };
      setGeneratedCode(mockCode);
      setShowCodePanel(true);
    }
  }, [codeStyle])

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

  // Move code panel to right sidebar (disabled on mobile)
  const moveCodePanelToRightSidebar = useCallback(() => {
    if (!isMobile) {
      setCodePanelPosition('right')
    }
  }, [isMobile])

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

  // WindowPanel dummy content
  const windowPanelContent = (
    <div className="p-6 space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Forge Window Panel
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          This is a demo window panel integrated into the Forge visual builder
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
          </div>
        </div>
        
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Code Panel
          </h3>
          <div className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
            <div>Visible: {showCodePanel ? 'Yes' : 'No'}</div>
            <div>Position: {codePanelPosition}</div>
            <div>Style: {codeStyle}</div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleOpenWindowPanel}
            className="px-3 py-1 text-xs rounded"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              color: 'white'
            }}
          >
            New Window
          </button>
          <button
            onClick={() => generateCode(canvasComponents)}
            className="px-3 py-1 text-xs rounded"
            style={{ 
              backgroundColor: 'var(--color-accent)',
              color: 'white'
            }}
          >
            Generate Code
          </button>
          <button
            onClick={() => setSelectedComponent(null)}
            className="px-3 py-1 text-xs rounded"
            style={{ 
              backgroundColor: 'var(--color-warning)',
              color: 'white'
            }}
          >
            Clear Selection
          </button>
        </div>
      </div>
      
      <div className="mt-6 p-4 rounded-lg border-2 border-dashed" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
        <div className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <Monitor className="w-8 h-8 mx-auto mb-2" />
          This is a demonstration of the WindowPanel component in your Forge builder.
          You can drag, resize, and switch between modal, window, and fullscreen modes.
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
          <div>Components loaded: {componentsLoaded ? 'Yes' : 'No'}</div>
          <div>Canvas components: {canvasComponents.length}</div>
        </div>
      </div>
    )
  });

  // Memoize default panels with fallbacks - Updated to use ForgeStore visibility
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

  // Memoize the sidebar code panel (only for non-mobile)
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
    if (allPanelsHidden) return []
    
    const panels = []
    
    // Add default panels if they're open
    defaultPanels.forEach(panel => {
      // Always include properties and assets panels
      if (panel.id === 'properties-panel' || panel.id === 'assets-panel') {
        panels.push(panel);
      } else if (isForgePanelOpen(panel.id)) {
        panels.push(panel);
      }
    });
    
    // Add code panel if showing on right and not mobile and panel is open
    if (codePanelPosition === 'right' && !isMobile && isForgePanelOpen('code-panel')) {
      panels.push(sidebarCodePanel)
    }
    
    return panels
  }, [defaultPanels, sidebarCodePanel, codePanelPosition, isMobile, isForgePanelOpen, allPanelsHidden])


  // Check if any panels are visible
  // Update hasVisiblePanels to account for always-open panels
  const hasVisiblePanels = useMemo(() => {
    if (allPanelsHidden) return false;
    
    // Always show panels if properties or assets should be visible
    const alwaysOpenCount = 2; // properties-panel and assets-panel
    const toggleablePanelsCount = getOpenForgePanelsCount() - alwaysOpenCount;
    
    return alwaysOpenCount > 0 || toggleablePanelsCount > 0;
  }, [allPanelsHidden, getOpenForgePanelsCount])

  // Tab configuration for components panel ONLY
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
          panelStates: { /* Legacy compatibility - not used for Forge */ },
          onModeSwitch: handleModeSwitch
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
        panelStates: { /* Legacy compatibility - not used for Forge */ },
        onModeSwitch: handleModeSwitch
      }}
    >
      <Head title="Forge - Visual Builder" />
      
      {/* Enhanced Tooltip with mobile detection */}
      {CodeTooltip && <CodeTooltip hoveredToken={hoveredToken} showTooltips={showTooltips && !isMobile} />}
      
      {/* Main content area - Enhanced Canvas with responsive padding */}
      <div className="h-[calc(100vh-60px)] flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className={`flex-1 flex items-center justify-center ${isMobile ? 'p-4' : 'p-8'} ${getCanvasPadding()}`}>
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
            />
          ) : (
            <div 
              ref={canvasRef}
              className="w-full h-full bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
              onDragOver={handleCanvasDragOver}
              onDrop={handleCanvasDrop}
              onClick={handleCanvasClick}
            >
              <div className="text-center text-gray-500">
                <div className="text-lg font-semibold mb-2">Mock Canvas</div>
                <div className="text-sm">Drop components here</div>
                <div className="text-xs mt-2">Components: {canvasComponents.length}</div>
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
            setShowCodePanel={setShowCodePanel}
            // CodePanel props
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
          />
        )}
      </div>

      {/* Enhanced Panel System - Mobile responsive with 3 panels per dock limit - Updated to use ForgeStore */}
      {Panel && hasVisiblePanels && (
        <Panel
          isOpen={true}
          initialPanels={visiblePanels}
          allowedDockPositions={isMobile ? ['left'] : ['left', 'right']}
          maxPanelsPerDock={3}
          onPanelClose={handlePanelClose}
          onPanelStateChange={handlePanelStateChange}
          snapToEdge={false}
          mergePanels={true}
          mergePosition={isMobile ? "left" : "right"}
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
        />
      )}
      
      {FloatingFrameSwitcher && (
        <FloatingFrameSwitcher
          currentFrame={currentFrame}
          onFrameSwitch={handleFrameSwitch}
          isMobile={isMobile}
        />
      )}

      {/* WindowPanel Integration */}
      <WindowPanel
        isOpen={windowPanelState.isOpen}
        title={windowPanelState.title}
        content={windowPanelContent}
        onClose={handleCloseWindowPanel}
        onModeChange={handleWindowPanelModeChange}
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

      {/* Mobile-specific: Bottom navigation or quick actions */}
      {isMobile && showCodePanel && (
        <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md rounded-full px-4 py-2">
            <button
              onClick={() => setCodePanelMinimized(!codePanelMinimized)}
              className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
              title={codePanelMinimized ? 'Expand Code Panel' : 'Minimize Code Panel'}
            >
              {codePanelMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={() => copyCodeToClipboard(generatedCode[activeCodeTab])}
              className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
              title="Copy Code"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => generateCode(canvasComponents)}
              className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
              title="Regenerate Code"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenWindowPanel}
              className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
              title="Open Window Panel"
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
            className="p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              boxShadow: 'var(--shadow-lg)'
            }}
            title="Open Window Panel"
          >
            <Monitor className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Mobile performance optimization styles */}
      {isMobile && (
        <style>{`
          /* Mobile-specific optimizations */
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          /* Reduce animations on mobile */
          @media (max-width: 768px) {
            .motion-reduce {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
            
            /* Optimize scrolling */
            .overflow-scroll {
              -webkit-overflow-scrolling: touch;
              scroll-behavior: smooth;
            }
            
            /* Reduce shadows for better performance */
            .shadow-lg, .shadow-xl, .shadow-2xl {
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24) !important;
            }
          }
        `}</style>
      )}
    </AuthenticatedLayout>
  );
}