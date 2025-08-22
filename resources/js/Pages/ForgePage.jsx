// Enhanced ForgePage.jsx - Updated with fixed panel system
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Panel from '@/Components/Panel';
import { Square, Code, Layers, User, Settings } from 'lucide-react';

// Import separated forge components
import ComponentsPanel from '@/Components/Forge/ComponentsPanel';
import LayersPanel from '@/Components/Forge/LayersPanel';
import PropertiesPanel from '@/Components/Forge/PropertiesPanel';
import AssetsPanel from '@/Components/Forge/AssetsPanel';
import CanvasComponent from '@/Components/Forge/CanvasComponent';
import BottomCodePanel from '@/Components/Forge/BottomCodePanel';
import SidebarCodePanel from '@/Components/Forge/SidebarCodePanel';
import CodeTooltip from '@/Components/Forge/CodeTooltip';

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

  // Canvas state for dropped components
  const [canvasComponents, setCanvasComponents] = useState([])
  const [selectedComponent, setSelectedComponent] = useState(null)
  const [generatedCode, setGeneratedCode] = useState({ html: '', css: '', react: '', tailwind: '' })
  const [showCodePanel, setShowCodePanel] = useState(false)
  const [codePanelPosition, setCodePanelPosition] = useState('bottom')
  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const [showTooltips, setShowTooltips] = useState(true)
  const [hoveredToken, setHoveredToken] = useState(null)
  const [codePanelHeight, setCodePanelHeight] = useState(400)
  const [codePanelMinimized, setCodePanelMinimized] = useState(false)
  const [codeStyle, setCodeStyle] = useState('react-tailwind')
  const [componentsLoaded, setComponentsLoaded] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Initializing components...')

  // Component panel tab state
  const [activeComponentTab, setActiveComponentTab] = useState('elements')
  const [componentSearchTerm, setComponentSearchTerm] = useState('')

  // Drag state
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedComponent: null,
    dragPreview: null
  })

  // Code panel drag state
  const [codePanelDragState, setCodePanelDragState] = useState({
    isDragging: false,
    startX: 0,
    startY: 0
  })

  const canvasRef = useRef(null)
  const codePanelRef = useRef(null)

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

  // Handle token hover for tooltips
  const handleTokenHover = (e) => {
    if (!showTooltips) return
    
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

  // Component drag handlers - Updated for dynamic system
  const handleComponentDragStart = useCallback((e, componentType) => {
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

    setDragState({
      isDragging: true,
      draggedComponent: {
        ...component,
        type: componentType,
        definition: componentDef
      },
      dragPreview: null
    })

    // Create enhanced drag preview
    const preview = document.createElement('div')
    preview.className = 'drag-preview'
    preview.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      z-index: 9999;
      padding: 12px 20px;
      background: var(--color-primary);
      color: white;
      border-radius: var(--radius-lg);
      font-size: var(--fs-sm);
      font-weight: 600;
      pointer-events: none;
      box-shadow: var(--shadow-lg);
      transform: rotate(2deg);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `
    preview.innerHTML = `${component.name}`
    document.body.appendChild(preview)
    setDragState(prev => ({ ...prev, dragPreview: preview }))

    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/plain', componentType)
  }, [componentsLoaded])

  const handleComponentDragEnd = useCallback(() => {
    if (dragState.dragPreview) {
      document.body.removeChild(dragState.dragPreview)
    }
    setDragState({
      isDragging: false,
      draggedComponent: null,
      dragPreview: null
    })
  }, [dragState.dragPreview])

  // Canvas drop handlers - Updated for dynamic system
  const handleCanvasDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleCanvasDrop = useCallback((e) => {
    e.preventDefault()
    
    if (!canvasRef.current || !dragState.isDragging || !componentsLoaded) return

    const componentType = e.dataTransfer.getData('text/plain')
    const componentDef = componentLibraryService.getComponentDefinition(componentType)
    const component = componentLibraryService.getComponent(componentType)
    
    if (!component || !componentDef) {
      console.error(`Cannot drop: Component "${componentType}" not found in library`);
      return;
    }

    // Calculate drop position relative to canvas
    const canvasRect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(0, e.clientX - canvasRect.left - 50)
    const y = Math.max(0, e.clientY - canvasRect.top - 20)

    // Create new component instance
    const newComponent = {
      id: `${componentType}_${Date.now()}`,
      type: componentType,
      props: { ...componentDef.default_props },
      position: { x, y },
      name: componentDef.name
    }

    const updatedComponents = [...canvasComponents, newComponent];
    setCanvasComponents(updatedComponents)
    setSelectedComponent(newComponent.id)
    handleComponentDragEnd()

    // Generate code for all components
    generateCode(updatedComponents)
  }, [dragState.isDragging, canvasComponents, componentsLoaded])

  // Code panel drag handlers
  const handleCodePanelDragStart = useCallback((e) => {
    setCodePanelDragState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY
    })
  }, [])

  const handleCodePanelDragEnd = useCallback((e) => {
    if (!codePanelDragState.isDragging) return

    const deltaX = e.clientX - codePanelDragState.startX
    const deltaY = e.clientY - codePanelDragState.startY

    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 100) {
      setCodePanelPosition('right')
    } else if (deltaY > 50) {
      setCodePanelPosition('bottom')
    }

    setCodePanelDragState({ isDragging: false, startX: 0, startY: 0 })
  }, [codePanelDragState])

  // Global drag handlers for drag preview positioning
  useEffect(() => {
    if (!dragState.isDragging || !dragState.dragPreview) return

    const handleDragMove = (e) => {
      if (dragState.dragPreview) {
        dragState.dragPreview.style.left = (e.clientX + 15) + 'px'
        dragState.dragPreview.style.top = (e.clientY - 15) + 'px'
      }
    }

    const handleMouseMove = (e) => {
      if (codePanelDragState.isDragging) {
        const deltaX = e.clientX - codePanelDragState.startX
        if (codePanelRef.current) {
          codePanelRef.current.style.transform = `translateX(${Math.max(-50, Math.min(50, deltaX * 0.1))}px)`
        }
      }
    }

    const handleMouseUp = (e) => {
      if (codePanelDragState.isDragging) {
        handleCodePanelDragEnd(e)
        if (codePanelRef.current) {
          codePanelRef.current.style.transform = 'translateX(0px)'
        }
      }
    }

    document.addEventListener('dragover', handleDragMove)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('dragover', handleDragMove)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState.isDragging, dragState.dragPreview, codePanelDragState, handleCodePanelDragEnd])

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
        } else {
          return { ...c, props: { ...c.props, [propName]: value } }
        }
      }
      return c
    })
    setCanvasComponents(updatedComponents)
    generateCode(updatedComponents)
  }, [canvasComponents])

  // Code generation with dynamic system
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
      
      console.log('Code generated successfully:', Object.keys(code));
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

  // Move code panel to right sidebar
  const moveCodePanelToRightSidebar = useCallback(() => {
    setCodePanelPosition('right')
  }, [])

  // Copy code to clipboard
  const copyCodeToClipboard = useCallback(async (code) => {
    try {
      await navigator.clipboard.writeText(code)
    } catch (err) {
      console.error('Failed to copy code:', err)
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

  // Memoize the sidebar code panel
  const sidebarCodePanel = useMemo(() => ({
    id: 'code',
    title: 'Generated Code',
    content: (
      <SidebarCodePanel
        showTooltips={showTooltips}
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
    generateCode
  ])

  // Memoize the final panels array
  const finalPanels = useMemo(() => {
    const panels = [...defaultPanels]
    
    // Add code panel if showing on right
    if (codePanelPosition === 'right' && showCodePanel) {
      panels.push(sidebarCodePanel)
    }
    
    return panels
  }, [defaultPanels, sidebarCodePanel, codePanelPosition, showCodePanel])

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
      
      {/* Enhanced Tooltip with better positioning */}
      <CodeTooltip hoveredToken={hoveredToken} showTooltips={showTooltips} />
      
      {/* Main content area - Enhanced Canvas */}
      <div className="h-[calc(100vh-60px)] flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className={`flex-1 flex items-center justify-center p-8 ${
          codePanelPosition === 'bottom' && showCodePanel 
            ? codePanelMinimized 
              ? 'pb-20' 
              : `pb-[${codePanelHeight + 80}px]`
            : 'pb-8'
        }`}>
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
          />
        </div>
        
        {/* Fixed Code Generation Panel - Bottom */}
        <BottomCodePanel
          showCodePanel={showCodePanel && codePanelPosition === 'bottom'}
          codePanelMinimized={codePanelMinimized}
          codePanelHeight={codePanelHeight}
          codePanelRef={codePanelRef}
          setCodePanelMinimized={setCodePanelMinimized}
          setCodePanelHeight={setCodePanelHeight}
          moveCodePanelToRightSidebar={moveCodePanelToRightSidebar}
          setShowCodePanel={setShowCodePanel}
          handleCodePanelDragStart={handleCodePanelDragStart}
          // CodePanel props
          showTooltips={showTooltips}
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
        />
      </div>

      {/* Enhanced Panel System - ONLY Components Panel has Tabs and Search */}
      <Panel
        isOpen={true}
        initialPanels={finalPanels}
        allowedDockPositions={['left', 'right']}
        onPanelClose={handlePanelClose}
        onPanelStateChange={handlePanelStateChange}
        snapToEdge={false}
        mergePanels={true}
        mergePosition="right"
        showTabs={true}
        showSearch={true}
        tabConfig={componentTabConfig}
        onTabChange={handleComponentTabChange}
        onSearch={handleComponentSearch}
        searchPlaceholder={`Search ${activeComponentTab}...`}
      />
    </AuthenticatedLayout>
  );
}