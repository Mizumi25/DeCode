// Enhanced ForgePage.jsx with improved UI and bidirectional code editing
import React, { useState, useRef, useCallback, useEffect } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Panel from '@/Components/Panel';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Eye, Palette, Move, X, GripVertical } from 'lucide-react';

export default function ForgePage({ projectId, frameId }) {
  // Panel states
  const [panelStates, setPanelStates] = useState({
    forge: false,
    source: false
  })

  // Canvas state for dropped components
  const [canvasComponents, setCanvasComponents] = useState([])
  const [selectedComponent, setSelectedComponent] = useState(null)
  const [generatedCode, setGeneratedCode] = useState({ html: '', css: '', react: '' })
  const [showCodePanel, setShowCodePanel] = useState(false)
  const [codePanelPosition, setCodePanelPosition] = useState('bottom') // 'bottom' or 'right'
  const [activeCodeTab, setActiveCodeTab] = useState('react')

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

  // Enhanced component library with Tailwind
  const componentLibrary = {
    button: {
      id: 'button',
      name: 'Button',
      description: 'Interactive button component',
      icon: '🔘',
      defaultProps: {
        text: 'Click me',
        variant: 'primary',
        size: 'md',
        className: ''
      },
      render: (props, id) => (
        <button
          key={id}
          className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            props.variant === 'primary' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:ring-purple-500 shadow-lg hover:shadow-xl'
              : props.variant === 'secondary'
              ? 'bg-white text-gray-900 border-2 border-gray-200 hover:bg-gray-50 focus:ring-gray-500 shadow-sm hover:shadow-md'
              : props.variant === 'success'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-500 shadow-lg hover:shadow-xl'
              : props.variant === 'warning'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 focus:ring-amber-500 shadow-lg hover:shadow-xl'
              : props.variant === 'danger'
              ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 focus:ring-red-500 shadow-lg hover:shadow-xl'
              : 'bg-transparent text-purple-600 hover:bg-purple-50 focus:ring-purple-500 border border-transparent hover:border-purple-200'
          } ${
            props.size === 'sm' ? 'px-3 py-1.5 text-sm' :
            props.size === 'lg' ? 'px-8 py-4 text-lg' : 'px-6 py-2.5 text-base'
          } ${props.className}`}
        >
          {props.text}
        </button>
      ),
      generateCode: (props, allComponents) => {
        const htmlComponents = allComponents.map(comp => {
          const lib = componentLibrary[comp.type]
          if (!lib) return ''
          return `    <div style="position: absolute; left: ${comp.position.x}px; top: ${comp.position.y}px;">
      <button class="btn btn-${comp.props.variant} btn-${comp.props.size}">${comp.props.text}</button>
    </div>`
        }).join('\n')

        const reactComponents = allComponents.map(comp => {
          const lib = componentLibrary[comp.type]
          if (!lib) return ''
          return `        <div style={{ position: 'absolute', left: '${comp.position.x}px', top: '${comp.position.y}px' }}>
          <button className="${getButtonTailwindClasses(comp.props)}">
            ${comp.props.text}
          </button>
        </div>`
        }).join('\n')

        return {
          html: `<div class="canvas-container">
${htmlComponents}
</div>`,
          css: `.canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.875rem;
}

.btn-md {
  padding: 10px 24px;
  font-size: 1rem;
}

.btn-lg {
  padding: 16px 32px;
  font-size: 1.125rem;
}`,
          react: `import React from 'react';

const GeneratedComponent = () => {
  return (
    <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
${reactComponents}
    </div>
  );
};

export default GeneratedComponent;`
        }
      }
    }
  }

  // Helper function to get Tailwind classes for button
  const getButtonTailwindClasses = (props) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
    
    const variantClasses = {
      primary: "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:ring-purple-500 shadow-lg hover:shadow-xl",
      secondary: "bg-white text-gray-900 border-2 border-gray-200 hover:bg-gray-50 focus:ring-gray-500 shadow-sm hover:shadow-md",
      success: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-500 shadow-lg hover:shadow-xl",
      warning: "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 focus:ring-amber-500 shadow-lg hover:shadow-xl",
      danger: "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 focus:ring-red-500 shadow-lg hover:shadow-xl",
      ghost: "bg-transparent text-purple-600 hover:bg-purple-50 focus:ring-purple-500 border border-transparent hover:border-purple-200"
    }
    
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-6 py-2.5 text-base",
      lg: "px-8 py-4 text-lg"
    }
    
    return `${baseClasses} ${variantClasses[props.variant] || variantClasses.primary} ${sizeClasses[props.size] || sizeClasses.md} ${props.className || ''}`
  }

  // Parse code to update components (bidirectional editing)
  const parseCodeAndUpdateComponents = useCallback((code, type) => {
    if (type === 'react') {
      try {
        // Simple regex to extract button components and their positions
        const buttonRegex = /<div[^>]*style={{[^}]*left:\s*'(\d+)px'[^}]*top:\s*'(\d+)px'[^}]*}}>\s*<button[^>]*>\s*([^<]+)\s*<\/button>/g
        const matches = []
        let match
        
        while ((match = buttonRegex.exec(code)) !== null) {
          matches.push({
            x: parseInt(match[1]),
            y: parseInt(match[2]),
            text: match[3].trim()
          })
        }
        
        // Update components based on parsed data
        const newComponents = matches.map((match, index) => ({
          id: `button_${Date.now()}_${index}`,
          type: 'button',
          props: {
            text: match.text,
            variant: 'primary',
            size: 'md',
            className: ''
          },
          position: { x: match.x, y: match.y },
          name: 'Button'
        }))
        
        setCanvasComponents(newComponents)
      } catch (error) {
        console.error('Error parsing React code:', error)
      }
    }
  }, [])

  // Handle panel functions
  const handlePanelClose = (panelId) => {
    console.log(`Panel ${panelId} closed`)
  }

  const handlePanelStateChange = (hasRightPanels) => {
    console.log(`Right panels active: ${hasRightPanels}`)
  }

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

  // Component drag handlers
  const handleComponentDragStart = useCallback((e, componentType) => {
    const component = componentLibrary[componentType]
    if (!component) return

    setDragState({
      isDragging: true,
      draggedComponent: {
        ...component,
        type: componentType
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      pointer-events: none;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      transform: rotate(2deg);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `
    preview.innerHTML = `${component.icon} ${component.name}`
    document.body.appendChild(preview)
    setDragState(prev => ({ ...prev, dragPreview: preview }))

    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/plain', componentType)
  }, [])

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

  // Canvas drop handlers
  const handleCanvasDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleCanvasDrop = useCallback((e) => {
    e.preventDefault()
    
    if (!canvasRef.current || !dragState.isDragging) return

    const componentType = e.dataTransfer.getData('text/plain')
    const component = componentLibrary[componentType]
    
    if (!component) return

    // Calculate drop position relative to canvas
    const canvasRect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(0, e.clientX - canvasRect.left - 50) // Offset for better positioning
    const y = Math.max(0, e.clientY - canvasRect.top - 20)

    // Create new component instance
    const newComponent = {
      id: `${componentType}_${Date.now()}`,
      type: componentType,
      props: { ...component.defaultProps },
      position: { x, y },
      name: component.name
    }

    setCanvasComponents(prev => [...prev, newComponent])
    setSelectedComponent(newComponent.id)
    handleComponentDragEnd()

    // Generate code for all components
    generateCode([...canvasComponents, newComponent])
  }, [dragState.isDragging, canvasComponents])

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

    // Determine if dragging to right panel (more horizontal movement to right)
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
        // Visual feedback during drag
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
    const updatedComponents = canvasComponents.map(c => 
      c.id === componentId 
        ? { ...c, props: { ...c.props, [propName]: value } }
        : c
    )
    setCanvasComponents(updatedComponents)
    generateCode(updatedComponents)
  }, [canvasComponents])

  // Code generation
  const generateCode = useCallback((components) => {
    if (components.length === 0) {
      setGeneratedCode({ html: '', css: '', react: '' })
      setShowCodePanel(false)
      return
    }

    const lib = componentLibrary.button // Using button as the main component
    if (lib && lib.generateCode) {
      const code = lib.generateCode({}, components)
      setGeneratedCode(code)
      setShowCodePanel(true)
    }
  }, [])

  // Handle code editing
  const handleCodeEdit = useCallback((newCode, codeType) => {
    setGeneratedCode(prev => ({
      ...prev,
      [codeType]: newCode
    }))
    
    // Parse code and update components if editing React code
    if (codeType === 'react') {
      parseCodeAndUpdateComponents(newCode, codeType)
    }
  }, [parseCodeAndUpdateComponents])

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

  // Enhanced default panels with better aesthetics
  const defaultPanels = [
    {
      id: 'components',
      title: 'Components',
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">UI Components</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Drag to canvas to build</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm font-medium text-[var(--color-text)] mb-2">Buttons</div>
            <div 
              className="group p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-grab hover:border-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300 active:cursor-grabbing"
              draggable
              onDragStart={(e) => handleComponentDragStart(e, 'button')}
              onDragEnd={handleComponentDragEnd}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  🔘
                </div>
                <div>
                  <div className="font-semibold text-[var(--color-text)] group-hover:text-purple-600 transition-colors">Button</div>
                  <div className="text-xs text-[var(--color-text-muted)]">Interactive button with variants</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">Primary</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">Secondary</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Success</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-xl opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-300 flex items-center justify-center text-gray-500 font-bold text-lg">
                  📝
                </div>
                <div>
                  <div className="font-semibold text-gray-500">Input Field</div>
                  <div className="text-xs text-gray-400">Coming soon</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-xl opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-300 flex items-center justify-center text-gray-500 font-bold text-lg">
                  🃏
                </div>
                <div>
                  <div className="font-semibold text-gray-500">Card</div>
                  <div className="text-xs text-gray-400">Coming soon</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'layers',
      title: 'Layers',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">Layer Tree</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Page hierarchy</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-blue-500"></div>
              <span className="text-sm font-medium text-[var(--color-text)]">Canvas Container</span>
            </div>
            
            {canvasComponents.map((component, index) => (
              <div 
                key={component.id}
                className={`flex items-center gap-3 p-3 ml-4 rounded-lg transition-all cursor-pointer ${
                  selectedComponent === component.id 
                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-l-4 border-purple-500' 
                    : 'hover:bg-[var(--color-bg-hover)]'
                }`}
                onClick={() => setSelectedComponent(component.id)}
              >
                <div className="w-4 h-4 rounded bg-gradient-to-r from-orange-400 to-pink-400"></div>
                <span className="text-sm font-medium">{component.name} {index + 1}</span>
                <div className="ml-auto text-xs text-[var(--color-text-muted)]">
                  {component.position.x}, {component.position.y}
                </div>
              </div>
            ))}
            
            {canvasComponents.length === 0 && (
              <div className="text-sm text-[var(--color-text-muted)] italic p-4 text-center border-2 border-dashed border-gray-200 rounded-lg">
                <div className="mb-2">🌱</div>
                No components yet
                <br />
                <span className="text-xs">Drag from Components panel</span>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'properties',
      title: 'Properties',
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500">
              <Move className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">Properties</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Customize elements</p>
            </div>
          </div>
          
          {selectedComponent ? (() => {
            const component = canvasComponents.find(c => c.id === selectedComponent)
            if (!component) return <div className="text-sm text-[var(--color-text-muted)]">Component not found</div>
            
            return (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                      🔘
                    </div>
                    <h4 className="font-semibold text-[var(--color-text)]">{component.name}</h4>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] font-mono bg-white px-2 py-1 rounded">
                    #{component.id.split('_').pop()}
                  </p>
                </div>
                
                {component.type === 'button' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-[var(--color-text)]">Button Text</label>
                      <input 
                        type="text" 
                        value={component.props.text}
                        onChange={(e) => handlePropertyUpdate(component.id, 'text', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                        placeholder="Enter button text..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-3 text-[var(--color-text)]">Style Variant</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['primary', 'secondary', 'success', 'warning', 'danger', 'ghost'].map(variant => (
                          <button
                            key={variant}
                            onClick={() => handlePropertyUpdate(component.id, 'variant', variant)}
                            className={`p-2 rounded-lg text-xs font-medium transition-all ${
                              component.props.variant === variant
                                ? 'bg-purple-500 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {variant.charAt(0).toUpperCase() + variant.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-3 text-[var(--color-text)]">Size</label>
                      <div className="flex gap-2">
                        {['sm', 'md', 'lg'].map(size => (
                          <button
                            key={size}
                            onClick={() => handlePropertyUpdate(component.id, 'size', size)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 ${
                              component.props.size === size
                                ? 'bg-purple-500 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {size.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-[var(--color-text)]">Position</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-[var(--color-text-muted)]">X</label>
                          <input
                            type="number"
                            value={component.position.x}
                            onChange={(e) => {
                              const newComponents = canvasComponents.map(c =>
                                c.id === component.id
                                  ? { ...c, position: { ...c.position, x: parseInt(e.target.value) || 0 } }
                                  : c
                              )
                              setCanvasComponents(newComponents)
                              generateCode(newComponents)
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--color-text-muted)]">Y</label>
                          <input
                            type="number"
                            value={component.position.y}
                            onChange={(e) => {
                              const newComponents = canvasComponents.map(c =>
                                c.id === component.id
                                  ? { ...c, position: { ...c.position, y: parseInt(e.target.value) || 0 } }
                                  : c
                              )
                              setCanvasComponents(newComponents)
                              generateCode(newComponents)
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => handleComponentDelete(component.id)}
                  className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 rounded-xl text-sm font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
                >
                  🗑️ Delete Component
                </button>
              </div>
            )
          })() : (
            <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl">
              <div className="text-4xl mb-4">🎨</div>
              <div className="text-sm text-[var(--color-text-muted)]">
                Select a component from the canvas or layers panel to edit its properties
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'assets',
      title: 'Assets',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">Media Assets</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Images, icons & files</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl border-2 border-dashed border-purple-200 flex items-center justify-center cursor-pointer hover:from-purple-200 hover:to-blue-200 transition-all group">
                <div className="text-center">
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🖼️</div>
                  <span className="text-xs text-purple-600 font-medium">Asset {i}</span>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full py-4 px-4 border-2 border-dashed border-purple-300 rounded-xl text-sm text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-all font-semibold flex items-center justify-center gap-2">
            <span className="text-xl">📁</span>
            Upload New Assets
          </button>
        </div>
      )
    }
  ]

  // Code panel content
  const codePanel = {
    id: 'code',
    title: 'Generated Code',
    content: (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">Live Code</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Edit to update components</p>
            </div>
          </div>
          <button
            onClick={() => setShowCodePanel(false)}
            className="p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Code tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {['html', 'css', 'react'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveCodeTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 ${
                activeCodeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
        
        {/* Code editor */}
        <div className="flex-1 min-h-0">
          <textarea
            value={generatedCode[activeCodeTab]}
            onChange={(e) => handleCodeEdit(e.target.value, activeCodeTab)}
            className="w-full h-full p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-xl border-0 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder={`// ${activeCodeTab.toUpperCase()} code will appear here...`}
            spellCheck={false}
            style={{ 
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              lineHeight: '1.5'
            }}
          />
        </div>
        
        <div className="text-xs text-[var(--color-text-muted)] bg-blue-50 p-3 rounded-lg border border-blue-200">
          💡 <strong>Tip:</strong> Edit the React code to update components in real-time. Changes will reflect on the canvas automatically.
        </div>
      </div>
    )
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
      
      {/* Main content area - Enhanced Canvas */}
      <div className="h-[calc(100vh-60px)] flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className={`flex-1 flex items-center justify-center p-8 ${codePanelPosition === 'bottom' ? 'pb-4' : ''}`}>
          <div className="w-full max-w-6xl">
            <div className="text-center space-y-6 mb-8">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  Visual Builder
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto"></div>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Drag components from the sidebar to build your interface. 
                <span className="font-semibold text-purple-600"> Select and customize</span> elements in real-time.
              </p>
            </div>
            
            {/* Canvas Area */}
            <div 
              ref={canvasRef}
              className={`relative w-full h-[500px] border-2 border-dashed rounded-2xl transition-all duration-300 shadow-xl ${
                dragState.isDragging 
                  ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-blue-50 scale-105' 
                  : 'border-gray-300 bg-gradient-to-br from-white to-gray-50 hover:border-gray-400'
              }`}
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(155, 155, 155, 0.15) 1px, transparent 0)',
                backgroundSize: '20px 20px'
              }}
              onDragOver={handleCanvasDragOver}
              onDrop={handleCanvasDrop}
              onClick={handleCanvasClick}
            >
              {canvasComponents.length === 0 && !dragState.isDragging && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🎨</div>
                    <div className="text-gray-500 text-lg font-medium">Drop components here to start building</div>
                    <div className="text-sm text-gray-400">Your canvas awaits your creativity</div>
                  </div>
                </div>
              )}
              
              {dragState.isDragging && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="text-center space-y-3">
                    <div className="text-5xl animate-bounce">✨</div>
                    <div className="text-purple-600 font-bold text-xl">
                      Drop {dragState.draggedComponent?.name} here
                    </div>
                    <div className="text-purple-500 text-sm">Release to add to your design</div>
                  </div>
                </div>
              )}
              
              {/* Render dropped components */}
              <AnimatePresence>
                {canvasComponents.map(component => {
                  const lib = componentLibrary[component.type]
                  if (!lib) return null
                  
                  return (
                    <motion.div
                      key={component.id}
                      initial={{ scale: 0, opacity: 0, rotate: -10 }}
                      animate={{ 
                        scale: selectedComponent === component.id ? 1.1 : 1, 
                        opacity: 1, 
                        rotate: 0 
                      }}
                      exit={{ scale: 0, opacity: 0, rotate: 10 }}
                      whileHover={{ scale: 1.05 }}
                      className={`absolute cursor-pointer transition-all duration-300 ${
                        selectedComponent === component.id 
                          ? 'ring-4 ring-purple-500 ring-offset-2 shadow-2xl' 
                          : 'hover:shadow-lg'
                      }`}
                      style={{
                        left: component.position.x,
                        top: component.position.y,
                      }}
                      onClick={(e) => handleComponentClick(component.id, e)}
                    >
                      {lib.render(component.props, component.id)}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Stats bar */}
            {canvasComponents.length > 0 && (
              <div className="mt-6 flex justify-center">
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-6 py-3 shadow-lg">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                      <span className="text-gray-600">{canvasComponents.length} Component{canvasComponents.length !== 1 ? 's' : ''}</span>
                    </div>
                    {selectedComponent && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                        <span className="text-gray-600">Selected: {canvasComponents.find(c => c.id === selectedComponent)?.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Code Generation Panel - Bottom (when not in right sidebar) */}
        {showCodePanel && codePanelPosition === 'bottom' && (
          <motion.div
            ref={codePanelRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: '300px', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="absolute bottom-0 left-80 right-80 bg-white border-t-2 border-purple-200 shadow-2xl rounded-t-2xl z-30"
            style={{
              maxHeight: '50vh'
            }}
          >
            <div 
              className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-2xl cursor-move"
              onMouseDown={handleCodePanelDragStart}
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-gray-400" />
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                    <Code2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Generated Code</h3>
                    <p className="text-xs text-gray-500">Drag to move to sidebar →</p>
                  </div>
                </div>
              </div>
              <button
                onClick={moveCodePanelToRightSidebar}
                className="px-3 py-1 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors"
              >
                Move to Sidebar →
              </button>
            </div>
            
            <div className="h-full overflow-hidden">
              <div className="p-4 h-full">
                {codePanel.content}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Enhanced Panel System */}
      <Panel
        isOpen={true}
        initialPanels={codePanelPosition === 'right' && showCodePanel ? [...defaultPanels, codePanel] : defaultPanels}
        allowedDockPositions={['left', 'right']}
        onPanelClose={handlePanelClose}
        onPanelStateChange={handlePanelStateChange}
        snapToEdge={false}
        mergePanels={true}
        mergePosition="right"
      />
      
      {/* Enhanced drag styles */}
      <style jsx global>{`
        .drag-preview {
          animation: dragBounce 0.3s ease-out;
          backdrop-filter: blur(20px);
        }
        
        @keyframes dragBounce {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(2deg); }
          100% { transform: scale(1) rotate(2deg); }
        }
        
        .canvas-container {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 400px;
        }

        /* Custom scrollbar for code editor */
        textarea::-webkit-scrollbar {
          width: 8px;
        }
        
        textarea::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }
        
        textarea::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 4px;
        }
        
        textarea::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }

        /* Smooth transitions for all interactive elements */
        .group:hover .group-hover\\:scale-110 {
          transform: scale(1.1);
        }
      `}</style>
    </AuthenticatedLayout>
  );
}