// Enhanced ForgePage.jsx - MOBILE RESPONSIVE FIXES for code panel visibility and drag functionality
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Panel from '@/Components/Panel';
import { Square, Code, Layers, User, Settings, ChevronUp, ChevronDown, Copy, RefreshCw } from 'lucide-react';

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

// Import dynamic component service
import { componentLibraryService } from '@/Services/ComponentLibraryService';
import { tooltipDatabase } from '@/Components/Forge/TooltipDatabase';
import { formatCode, highlightCode, parseCodeAndUpdateComponents } from '@/Components/Forge/CodeUtils';

export default function ForgePage({ projectId, frameId }) {
  // Panel states
  const [panelStates, setPanelStates] = useState({
    forge: false,
    source: false
  })

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

  const canvasRef = useRef(null)
  const codePanelRef = useRef(null)
  
  const [currentFrame, setCurrentFrame] = useState(frameId || 'frame-1');

  // Add this handler function
  const handleFrameSwitch = useCallback((frameId) => {
    setCurrentFrame(frameId);
    // Add your frame switching logic here
    // For example: router.visit(`/forge/${projectId}/${frameId}`, { preserveState: true });
    console.log('Switching to frame:', frameId);
  }, [projectId]);

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

  // Initialize component library on mount
  useEffect(() => {
    const initializeComponents = async () => {
      try {
        setLoadingMessage('Loading components from database...');
        await componentLibraryService.loadComponents();
        setComponentsLoaded(true);
        setLoadingMessage('Components loaded successfully!');
        
        // Load existing project components if projectId and frameId are provided
        if (projectId && frameId) {
          setLoadingMessage('Loading existing project components...');
          const existingComponents = await componentLibraryService.loadProjectComponents(projectId, frameId);
          setCanvasComponents(existingComponents);
          if (existingComponents.length > 0) {
            generateCode(existingComponents);
          }
        }
        
        setTimeout(() => setLoadingMessage(''), 2000);
      } catch (error) {
        console.error('Failed to initialize components:', error);
        setLoadingMessage('Failed to load components. Please refresh the page.');
      }
    };

    initializeComponents();
  }, [projectId, frameId]);

  // Auto-save project components when they change
  useEffect(() => {
    const saveComponents = async () => {
      if (projectId && frameId && canvasComponents.length > 0 && componentsLoaded) {
        try {
          await componentLibraryService.saveProjectComponents(projectId, frameId, canvasComponents);
        } catch (error) {
          console.error('Failed to auto-save components:', error);
        }
      }
    };

    const timeoutId = setTimeout(saveComponents, 1000);
    return () => clearTimeout(timeoutId);
  }, [canvasComponents, projectId, frameId, componentsLoaded]);

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
    if (token && tooltipDatabase[token]) {
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

  // Handle panel functions
  const handlePanelClose = (panelId) => {
    console.log(`Panel ${panelId} closed`)
  }

  const handlePanelStateChange = useCallback((hasRightPanels) => {
    console.log(`Right panels active: ${hasRightPanels}`)
  }, [])

  const handlePanelToggle = (panelType) => {
    setPanelStates(prev => ({
      ...prev,
      [panelType]: !prev[panelType]
    }))
  }

  const handlePanelMaximize = (panelType) => {
    if (panelType === 'source') {
      router.visit('/source', { preserveState: true })
    }
    setPanelStates(prev => ({
      ...prev,
      [panelType]: false
    }))
  }

  const handleModeSwitch = (mode) => {
    if (mode === 'source') {
      router.visit('/source', { preserveState: true })
    }
  }

  // Component tab handlers
  const handleComponentTabChange = useCallback((tab) => {
    setActiveComponentTab(tab)
  }, [])

  const handleComponentSearch = useCallback((searchTerm) => {
    setComponentSearchTerm(searchTerm)
  }, [])

  // Enhanced component drag handlers with proper preview sizing
  const handleComponentDragStart = useCallback((e, componentType, variant = null, dragData = null) => {
    if (!componentsLoaded) {
      console.warn('Components not loaded yet');
      return;
    }

    const componentDef = componentLibraryService.getComponentDefinition(componentType)
    const component = componentLibraryService.getComponent(componentType)
    
    if (!component || !componentDef) {
      console.error(`Component "${componentType}" not found in library`);
      return;
    }

    console.log('Drag started:', componentType, variant ? `with variant: ${variant.name}` : 'without variant');

    setDragState({
      isDragging: true,
      draggedComponent: {
        ...component,
        type: componentType,
        definition: componentDef,
        name: componentDef.name
      },
      variant: variant,
      dragPreview: null
    })

    // Create mobile-optimized drag preview
    if (!dragData) {
      const preview = document.createElement('div')
      preview.className = 'drag-preview'
      preview.style.cssText = `
        position: absolute;
        top: -1000px;
        left: -1000px;
        z-index: 9999;
        padding: ${isMobile ? '8px 12px' : '12px 16px'};
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: ${isMobile ? '6px' : '8px'};
        font-size: ${isMobile ? '11px' : '12px'};
        font-weight: 600;
        pointer-events: none;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        transform: rotate(1deg) scale(${isMobile ? '0.9' : '1.02'});
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        gap: 6px;
        max-width: ${isMobile ? '150px' : '200px'};
        white-space: nowrap;
      `
      
      const icon = variant ? '✨' : '📦';
      const name = variant ? variant.name : component.name;
      const subtitle = variant ? `from ${component.name}` : componentDef.description;
      
      preview.innerHTML = `
        <span style="font-size: ${isMobile ? '14px' : '16px'};">${icon}</span>
        <div style="overflow: hidden;">
          <div style="font-weight: 700; font-size: ${isMobile ? '11px' : '13px'}; line-height: 1.2;">${name}</div>
          <div style="font-size: ${isMobile ? '9px' : '10px'}; opacity: 0.8; margin-top: 2px; overflow: hidden; text-overflow: ellipsis;">${subtitle}</div>
        </div>
      `;
      
      document.body.appendChild(preview)
      setDragState(prev => ({ ...prev, dragPreview: preview }))

      e.dataTransfer.effectAllowed = 'copy'
      
      const enhancedDragData = {
        componentType,
        variant,
        component: {
          name: componentDef.name,
          type: componentType,
          description: componentDef.description,
          default_props: componentDef.default_props,
          prop_definitions: componentDef.prop_definitions
        }
      };
      
      e.dataTransfer.setData('text/plain', JSON.stringify(enhancedDragData))
    }
  }, [componentsLoaded, isMobile])

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

  // Enhanced canvas drop handlers with variant support
  const handleCanvasDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleCanvasDrop = useCallback((e) => {
    e.preventDefault()
    
    if (!canvasRef.current || !componentsLoaded) return

    try {
      const dragDataStr = e.dataTransfer.getData('text/plain')
      let dragData;
      
      try {
        dragData = JSON.parse(dragDataStr);
      } catch {
        dragData = { componentType: dragDataStr, variant: null };
      }

      const { componentType, variant } = dragData;
      const componentDef = componentLibraryService.getComponentDefinition(componentType)
      const component = componentLibraryService.getComponent(componentType)
      
      if (!component || !componentDef) {
        console.error(`Cannot drop: Component "${componentType}" not found in library`);
        return;
      }

      const canvasRect = canvasRef.current.getBoundingClientRect()
      const x = Math.max(0, e.clientX - canvasRect.left - 50)
      const y = Math.max(0, e.clientY - canvasRect.top - 20)

      const newComponent = {
        id: `${componentType}_${Date.now()}`,
        type: componentType,
        props: { ...componentDef.default_props },
        position: { x, y },
        name: variant ? `${componentDef.name} (${variant.name})` : componentDef.name,
        variant: variant || null,
        style: {},
        animation: {}
      }

      if (variant) {
        if (variant.default_props) {
          newComponent.props = { ...newComponent.props, ...variant.default_props };
        }
        if (variant.classes) {
          newComponent.className = variant.classes;
        }
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
  }, [canvasComponents, componentsLoaded])

  // Global drag handlers with mobile optimizations
  useEffect(() => {
    if (!dragState.isDragging || !dragState.dragPreview) return

    const handleDragMove = (e) => {
      if (dragState.dragPreview) {
        const offset = isMobile ? { x: 5, y: -5 } : { x: 10, y: -10 };
        dragState.dragPreview.style.left = (e.clientX + offset.x) + 'px'
        dragState.dragPreview.style.top = (e.clientY + offset.y) + 'px'
      }
    }

    document.addEventListener('dragover', handleDragMove)
    
    return () => {
      document.removeEventListener('dragover', handleDragMove)
    }
  }, [dragState.isDragging, dragState.dragPreview, isMobile])

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

  // Enhanced property update handler with style and animation support
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
            props: { ...componentLibraryService.getComponentDefinition(c.type)?.default_props || {} }
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

  // Enhanced code generation with styles and animations
  const generateCode = useCallback(async (components) => {
    if (!componentsLoaded) {
      console.warn('Cannot generate code: Components not loaded yet');
      return;
    }

    if (components.length === 0) {
      setGeneratedCode({ html: '', css: '', react: '', tailwind: '' })
      setShowCodePanel(false)
      return
    }

    try {
      const code = await componentLibraryService.clientSideCodeGeneration(components, codeStyle);
      setGeneratedCode(code);
      setShowCodePanel(true);
      
      console.log('Enhanced code generated successfully:', Object.keys(code));
    } catch (error) {
      console.error('Failed to generate code:', error);
    }
  }, [codeStyle, componentsLoaded])

  // Handle code editing
  const handleCodeEdit = useCallback((newCode, codeType) => {
    setGeneratedCode(prev => ({
      ...prev,
      [codeType]: newCode
    }))
    
    if (codeType === 'react') {
      parseCodeAndUpdateComponents(newCode, codeType, setCanvasComponents)
    }
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

  // Memoize default panels to prevent recreation on every render
  const defaultPanels = useMemo(() => [
    {
      id: 'components',
      title: 'Components',
      content: (
        <ComponentsPanel
          activeTab={activeComponentTab}
          searchTerm={componentSearchTerm}
          onComponentDragStart={handleComponentDragStart}
          onComponentDragEnd={handleComponentDragEnd}
        />
      )
    },
    {
      id: 'layers',
      title: 'Layers',
      content: (
        <LayersPanel
          canvasComponents={canvasComponents}
          selectedComponent={selectedComponent}
          onComponentSelect={setSelectedComponent}
        />
      )
    },
    {
      id: 'properties',
      title: 'Properties',
      content: (
        <PropertiesPanel
          canvasComponents={canvasComponents}
          selectedComponent={selectedComponent}
          onPropertyUpdate={handlePropertyUpdate}
          onComponentDelete={handleComponentDelete}
          onGenerateCode={generateCode}
          componentLibraryService={componentLibraryService}
        />
      )
    },
    {
      id: 'assets',
      title: 'Assets',
      content: <AssetsPanel />
    }
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
    id: 'code',
    title: 'Generated Code',
    content: (
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

  // Memoize the final panels array
  const finalPanels = useMemo(() => {
    const panels = [...defaultPanels]
    
    // Add code panel if showing on right and not mobile
    if (codePanelPosition === 'right' && showCodePanel && !isMobile) {
      panels.push(sidebarCodePanel)
    }
    
    return panels
  }, [defaultPanels, sidebarCodePanel, codePanelPosition, showCodePanel, isMobile])

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
          panelStates: panelStates,
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
        panelStates: panelStates,
        onModeSwitch: handleModeSwitch
      }}
    >
      <Head title="Forge - Visual Builder" />
      
      {/* Enhanced Tooltip with mobile detection */}
      <CodeTooltip hoveredToken={hoveredToken} showTooltips={showTooltips && !isMobile} />
      
      {/* Main content area - Enhanced Canvas with responsive padding */}
      <div className="h-[calc(100vh-60px)] flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className={`flex-1 flex items-center justify-center ${isMobile ? 'p-4' : 'p-8'} ${getCanvasPadding()}`}>
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
        </div>
        
        {/* Fixed Code Generation Panel - Bottom (Mobile Optimized) */}
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
      </div>

      {/* Enhanced Panel System - Mobile responsive with 3 panels per dock limit */}
      <Panel
        isOpen={true}
        initialPanels={finalPanels}
        allowedDockPositions={isMobile ? ['left'] : ['left', 'right']}
        maxPanelsPerDock={3} // NEW: Limit Forge page to 3 panels per dock
        onPanelClose={handlePanelClose}
        onPanelStateChange={handlePanelStateChange}
        snapToEdge={false}
        mergePanels={true}
        mergePosition={isMobile ? "left" : "right"}
        showTabs={true}
        showSearch={!isMobile} // Hide search on mobile to save space
        tabConfig={componentTabConfig}
        onTabChange={handleComponentTabChange}
        onSearch={handleComponentSearch}
        searchPlaceholder={`Search ${activeComponentTab}...`}
        isMobile={isMobile}
        defaultWidth={isMobile ? 280 : 320}
        minWidth={isMobile ? 250 : 280}
        maxWidth={isMobile ? 300 : 400}
      />
      
      <FloatingFrameSwitcher
        currentFrame={currentFrame}
        onFrameSwitch={handleFrameSwitch}
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
          </div>
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