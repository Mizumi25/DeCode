// Enhanced ForgePage.jsx with syntax highlighting and improved aesthetics
import React, { useState, useRef, useCallback, useEffect } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Panel from '@/Components/Panel';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, 
  Eye, 
  Layers, 
  Settings, 
  X, 
  GripVertical, 
  HelpCircle,
  Sparkles,
  Square,
  FileImage,
  Trash2,
  Move
} from 'lucide-react';

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
  const [showTooltips, setShowTooltips] = useState(true)
  const [hoveredToken, setHoveredToken] = useState(null)

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

  // Tooltip definitions for code elements
  const tooltipDatabase = {
    // React/JSX
    'import': { type: 'keyword', description: 'Imports modules, components, or functions from other files' },
    'export': { type: 'keyword', description: 'Makes components or functions available to other files' },
    'const': { type: 'keyword', description: 'Declares a constant variable that cannot be reassigned' },
    'return': { type: 'keyword', description: 'Returns JSX or values from a function/component' },
    'useState': { type: 'hook', description: 'React hook for managing component state' },
    'useEffect': { type: 'hook', description: 'React hook for side effects and lifecycle events' },
    'className': { type: 'prop', description: 'JSX attribute for applying CSS classes (equivalent to HTML class)' },
    'style': { type: 'prop', description: 'JSX attribute for inline styles as JavaScript objects' },
    'onClick': { type: 'event', description: 'Event handler that fires when element is clicked' },
    'div': { type: 'element', description: 'Generic container element for grouping content' },
    'button': { type: 'element', description: 'Interactive button element for user actions' },
    'span': { type: 'element', description: 'Inline text element for styling portions of text' },
    
    // Tailwind classes
    'flex': { type: 'layout', description: 'Display: flex - Creates a flexible box layout container' },
    'items-center': { type: 'layout', description: 'Align-items: center - Centers items vertically in flex container' },
    'justify-center': { type: 'layout', description: 'Justify-content: center - Centers items horizontally in flex container' },
    'justify-between': { type: 'layout', description: 'Justify-content: space-between - Distributes items with equal space between' },
    'gap-2': { type: 'spacing', description: 'Gap: 0.5rem - Adds space between flex/grid items' },
    'gap-3': { type: 'spacing', description: 'Gap: 0.75rem - Adds space between flex/grid items' },
    'gap-4': { type: 'spacing', description: 'Gap: 1rem - Adds space between flex/grid items' },
    'p-2': { type: 'spacing', description: 'Padding: 0.5rem - Adds inner spacing on all sides' },
    'p-3': { type: 'spacing', description: 'Padding: 0.75rem - Adds inner spacing on all sides' },
    'p-4': { type: 'spacing', description: 'Padding: 1rem - Adds inner spacing on all sides' },
    'px-3': { type: 'spacing', description: 'Padding-x: 0.75rem - Adds horizontal padding' },
    'py-2': { type: 'spacing', description: 'Padding-y: 0.5rem - Adds vertical padding' },
    'm-2': { type: 'spacing', description: 'Margin: 0.5rem - Adds outer spacing on all sides' },
    'mb-2': { type: 'spacing', description: 'Margin-bottom: 0.5rem - Adds bottom margin' },
    'ml-4': { type: 'spacing', description: 'Margin-left: 1rem - Adds left margin' },
    'w-full': { type: 'sizing', description: 'Width: 100% - Sets element to full width of container' },
    'h-full': { type: 'sizing', description: 'Height: 100% - Sets element to full height of container' },
    'w-4': { type: 'sizing', description: 'Width: 1rem - Sets fixed width' },
    'h-4': { type: 'sizing', description: 'Height: 1rem - Sets fixed height' },
    'rounded': { type: 'decoration', description: 'Border-radius: 0.25rem - Adds rounded corners' },
    'rounded-lg': { type: 'decoration', description: 'Border-radius: 0.5rem - Adds larger rounded corners' },
    'rounded-xl': { type: 'decoration', description: 'Border-radius: 0.75rem - Adds extra large rounded corners' },
    'bg-white': { type: 'color', description: 'Background-color: white - Sets white background' },
    'text-white': { type: 'color', description: 'Color: white - Sets white text color' },
    'text-gray-600': { type: 'color', description: 'Color: gray-600 - Sets medium gray text color' },
    'border': { type: 'border', description: 'Border: 1px solid - Adds default border' },
    'border-2': { type: 'border', description: 'Border: 2px solid - Adds thicker border' },
    'shadow-lg': { type: 'effects', description: 'Box-shadow: large - Adds drop shadow effect' },
    'hover:bg-gray-50': { type: 'interaction', description: 'Changes background to gray-50 on hover' },
    'transition-all': { type: 'animation', description: 'Transition: all properties - Animates all property changes' },
    'cursor-pointer': { type: 'interaction', description: 'Cursor: pointer - Shows pointer cursor on hover' }
  }

  // Syntax highlighting function
  const highlightCode = (code, language) => {
    if (!code) return ''
    
    let highlighted = code
    
    if (language === 'react' || language === 'jsx') {
      // Keywords
      highlighted = highlighted.replace(
        /\b(import|export|from|const|let|var|function|return|if|else|for|while|class|extends|useState|useEffect|useCallback|React)\b/g,
        '<span class="code-keyword">$1</span>'
      )
      
      // Strings
      highlighted = highlighted.replace(
        /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
        '<span class="code-string">$1$2$1</span>'
      )
      
      // Comments
      highlighted = highlighted.replace(
        /\/\*[\s\S]*?\*\/|\/\/.*$/gm,
        '<span class="code-comment">$&</span>'
      )
      
      // JSX tags
      highlighted = highlighted.replace(
        /(<\/?)([\w.-]+)/g,
        '$1<span class="code-tag">$2</span>'
      )
      
      // JSX attributes
      highlighted = highlighted.replace(
        /\s([\w-]+)(=)/g,
        ' <span class="code-attr">$1</span>$2'
      )
      
      // Numbers
      highlighted = highlighted.replace(
        /\b(\d+(?:\.\d+)?)\b/g,
        '<span class="code-number">$1</span>'
      )
      
      // Functions
      highlighted = highlighted.replace(
        /\b(\w+)(?=\s*\()/g,
        '<span class="code-function">$1</span>'
      )
    } else if (language === 'css') {
      // Properties
      highlighted = highlighted.replace(
        /([a-zA-Z-]+)(\s*:)/g,
        '<span class="code-property">$1</span>$2'
      )
      
      // Values
      highlighted = highlighted.replace(
        /(:\s*)([^;]+)(;?)/g,
        '$1<span class="code-value">$2</span>$3'
      )
      
      // Selectors
      highlighted = highlighted.replace(
        /^([.#]?[\w-]+)(?=\s*{)/gm,
        '<span class="code-selector">$1</span>'
      )
      
      // Comments
      highlighted = highlighted.replace(
        /\/\*[\s\S]*?\*\//g,
        '<span class="code-comment">$&</span>'
      )
    } else if (language === 'html') {
      // Tags
      highlighted = highlighted.replace(
        /(<\/?)([\w.-]+)/g,
        '$1<span class="code-tag">$2</span>'
      )
      
      // Attributes
      highlighted = highlighted.replace(
        /\s([\w-]+)(=)/g,
        ' <span class="code-attr">$1</span>$2'
      )
      
      // Attribute values
      highlighted = highlighted.replace(
        /(=)(["'])((?:\\.|(?!\2)[^\\])*?)\2/g,
        '$1$2<span class="code-string">$3</span>$2'
      )
    }
    
    return highlighted
  }

  // Handle token hover for tooltips
  const handleTokenHover = (e, token) => {
    if (!showTooltips) return
    
    const tooltip = tooltipDatabase[token]
    if (tooltip) {
      setHoveredToken({
        token,
        tooltip,
        x: e.clientX,
        y: e.clientY
      })
    }
  }

  const handleTokenLeave = () => {
    setHoveredToken(null)
  }

  // Enhanced component library with Tailwind
  const componentLibrary = {
    button: {
      id: 'button',
      name: 'Button',
      description: 'Interactive button component',
      icon: Square,
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

  // Enhanced default panels with professional aesthetics
  const defaultPanels = [
    {
      id: 'components',
      title: 'Components',
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
              <Square className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>UI Components</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Drag to canvas to build</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Buttons</div>
            <div 
              className="group p-4 border-2 border-dashed rounded-xl cursor-grab hover:border-opacity-60 transition-all duration-300 active:cursor-grabbing"
              style={{ 
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-bg)'
              }}
              draggable
              onDragStart={(e) => handleComponentDragStart(e, 'button')}
              onDragEnd={handleComponentDragEnd}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: 'var(--color-primary)' }}>
                  <Square className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold group-hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text)' }}>Button</div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Interactive button with variants</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2 py-1 text-xs rounded-full font-medium" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>Primary</span>
                <span className="px-2 py-1 text-xs rounded-full font-medium" style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-muted)' }}>Secondary</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Success</span>
              </div>
            </div>
            
            <div className="p-4 border rounded-xl opacity-60 cursor-not-allowed" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-muted)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-border)' }}>
                  <Code className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div>
                  <div className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>Input Field</div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Coming soon</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-xl opacity-60 cursor-not-allowed" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-muted)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-border)' }}>
                  <Layers className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div>
                  <div className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>Card</div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Coming soon</div>
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
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
              <Eye className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Layer Tree</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Page hierarchy</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-lg transition-colors" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--color-primary)' }}></div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Canvas Container</span>
            </div>
            
            {canvasComponents.map((component, index) => (
              <div 
                key={component.id}
                className={`flex items-center gap-3 p-3 ml-4 rounded-lg transition-all cursor-pointer ${
                  selectedComponent === component.id 
                    ? 'border-l-4' 
                    : ''
                }`}
                style={{
                  backgroundColor: selectedComponent === component.id ? 'var(--color-primary-soft)' : 'var(--color-bg)',
                  borderLeftColor: selectedComponent === component.id ? 'var(--color-primary)' : 'transparent',
                  color: selectedComponent === component.id ? 'var(--color-primary)' : 'var(--color-text)'
                }}
                onClick={() => setSelectedComponent(component.id)}
              >
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--color-accent)' }}></div>
                <span className="text-sm font-medium">{component.name} {index + 1}</span>
                <div className="ml-auto text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {component.position.x}, {component.position.y}
                </div>
              </div>
            ))}
            
            {canvasComponents.length === 0 && (
              <div className="text-sm italic p-4 text-center border-2 border-dashed rounded-lg" style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>
                <div className="mb-2">
                  <Layers className="w-6 h-6 mx-auto opacity-50" />
                </div>
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
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
              <Settings className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Properties</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Customize elements</p>
            </div>
          </div>
          
          {selectedComponent ? (() => {
            const component = canvasComponents.find(c => c.id === selectedComponent)
            if (!component) return <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Component not found</div>
            
            return (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-muted)', borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: 'var(--color-primary)' }}>
                      <Square className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold" style={{ color: 'var(--color-text)' }}>{component.name}</h4>
                  </div>
                  <p className="text-xs font-mono px-2 py-1 rounded" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)' }}>
                    #{component.id.split('_').pop()}
                  </p>
                </div>
                
                {component.type === 'button' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Button Text</label>
                      <input 
                        type="text" 
                        value={component.props.text}
                        onChange={(e) => handlePropertyUpdate(component.id, 'text', e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-all"
                        style={{ 
                          borderColor: 'var(--color-border)', 
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text)'
                        }}
                        placeholder="Enter button text..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Style Variant</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['primary', 'secondary', 'success', 'warning', 'danger', 'ghost'].map(variant => (
                          <button
                            key={variant}
                            onClick={() => handlePropertyUpdate(component.id, 'variant', variant)}
                            className="p-2 rounded-lg text-xs font-medium transition-all"
                            style={{
                              backgroundColor: component.props.variant === variant ? 'var(--color-primary)' : 'var(--color-bg-muted)',
                              color: component.props.variant === variant ? 'white' : 'var(--color-text)'
                            }}
                          >
                            {variant.charAt(0).toUpperCase() + variant.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Size</label>
                      <div className="flex gap-2">
                        {['sm', 'md', 'lg'].map(size => (
                          <button
                            key={size}
                            onClick={() => handlePropertyUpdate(component.id, 'size', size)}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1"
                            style={{
                              backgroundColor: component.props.size === size ? 'var(--color-primary)' : 'var(--color-bg-muted)',
                              color: component.props.size === size ? 'white' : 'var(--color-text)'
                            }}
                          >
                            {size.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Position</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>X</label>
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
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                            style={{ 
                              borderColor: 'var(--color-border)', 
                              backgroundColor: 'var(--color-surface)',
                              color: 'var(--color-text)'
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Y</label>
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
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                            style={{ 
                              borderColor: 'var(--color-border)', 
                              backgroundColor: 'var(--color-surface)',
                              color: 'var(--color-text)'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => handleComponentDelete(component.id)}
                  className="w-full mt-6 px-4 py-3 text-white border-0 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Component
                </button>
              </div>
            )
          })() : (
            <div className="text-center p-8 border-2 border-dashed rounded-xl" style={{ borderColor: 'var(--color-border)' }}>
              <div className="mb-4">
                <Settings className="w-12 h-12 mx-auto opacity-50" style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
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
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
              <FileImage className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Media Assets</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Images, icons & files</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all group" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-muted)' }}>
                <div className="text-center">
                  <div className="mb-1 group-hover:scale-110 transition-transform">
                    <FileImage className="w-8 h-8 mx-auto" style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Asset {i}</span>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full py-4 px-4 border-2 border-dashed rounded-xl text-sm transition-all font-semibold flex items-center justify-center gap-2" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', backgroundColor: 'var(--color-bg)' }}>
            <FileImage className="w-5 h-5" />
            Upload New Assets
          </button>
        </div>
      )
    }
  ]

  // Code panel content with syntax highlighting
  const codePanel = {
    id: 'code',
    title: 'Generated Code',
    content: (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
              <Code className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Live Code</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Edit to update components</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Pro Tips</label>
              <button
                onClick={() => setShowTooltips(!showTooltips)}
                className={`relative w-10 h-6 rounded-full transition-colors ${showTooltips ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${showTooltips ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
            <button
              onClick={() => setShowCodePanel(false)}
              className="p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Code tabs */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
          {['html', 'css', 'react'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveCodeTab(tab)}
              className="px-4 py-2 rounded-md text-sm font-medium transition-all flex-1"
              style={{
                backgroundColor: activeCodeTab === tab ? 'var(--color-surface)' : 'transparent',
                color: activeCodeTab === tab ? 'var(--color-text)' : 'var(--color-text-muted)',
                boxShadow: activeCodeTab === tab ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
        
        {/* Code editor with syntax highlighting */}
        <div className="flex-1 min-h-0 relative">
          <div
            className="w-full h-full p-4 rounded-xl border-0 resize-none overflow-auto font-mono text-sm"
            style={{
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              lineHeight: '1.5'
            }}
          >
            <pre
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: highlightCode(generatedCode[activeCodeTab], activeCodeTab)
              }}
              onMouseOver={(e) => {
                if (showTooltips && e.target.tagName === 'SPAN') {
                  const text = e.target.textContent
                  handleTokenHover(e, text)
                }
              }}
              onMouseOut={handleTokenLeave}
            />
            <textarea
              value={generatedCode[activeCodeTab]}
              onChange={(e) => handleCodeEdit(e.target.value, activeCodeTab)}
              className="absolute inset-4 w-full h-full bg-transparent text-transparent caret-white resize-none outline-none font-mono text-sm"
              style={{
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                lineHeight: '1.5'
              }}
              placeholder={`// ${activeCodeTab.toUpperCase()} code will appear here...`}
              spellCheck={false}
            />
          </div>
        </div>
        
        <div className="text-xs p-3 rounded-lg border flex items-center gap-2" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-primary-soft)', borderColor: 'var(--color-primary)' }}>
          <Sparkles className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          <span><strong>Tip:</strong> Edit the React code to update components in real-time. Changes will reflect on the canvas automatically.</span>
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
      
      {/* Tooltip */}
      {hoveredToken && showTooltips && (
        <div
          className="fixed z-50 px-3 py-2 text-xs rounded-lg shadow-lg pointer-events-none"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            left: hoveredToken.x + 10,
            top: hoveredToken.y - 40
          }}
        >
          <div className="font-semibold mb-1">
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
              hoveredToken.tooltip.type === 'keyword' ? 'bg-blue-500' :
              hoveredToken.tooltip.type === 'string' ? 'bg-green-500' :
              hoveredToken.tooltip.type === 'element' ? 'bg-purple-500' :
              hoveredToken.tooltip.type === 'layout' ? 'bg-orange-500' :
              hoveredToken.tooltip.type === 'spacing' ? 'bg-pink-500' :
              'bg-gray-500'
            }`}></span>
            {hoveredToken.token} 
            <span className="text-xs opacity-60 ml-1">({hoveredToken.tooltip.type})</span>
          </div>
          <div className="text-xs opacity-80">{hoveredToken.tooltip.description}</div>
        </div>
      )}
      
      {/* Main content area - Enhanced Canvas */}
      <div className="h-[calc(100vh-60px)] flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className={`flex-1 flex items-center justify-center p-8 ${codePanelPosition === 'bottom' ? 'pb-4' : ''}`}>
          <div className="w-full max-w-6xl">
            <div className="text-center space-y-6 mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2" style={{ background: 'linear-gradient(to right, var(--color-primary), #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Visual Builder
                </h1>
                <div className="w-24 h-1 rounded-full mx-auto" style={{ background: 'linear-gradient(to right, var(--color-primary), #7c3aed)' }}></div>
              </div>
              <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Drag components from the sidebar to build your interface. 
                <span className="font-semibold" style={{ color: 'var(--color-primary)' }}> Select and customize</span> elements in real-time.
              </p>
            </div>
            
            {/* Canvas Area */}
            <div 
              ref={canvasRef}
              className={`relative w-full h-[500px] border-2 border-dashed rounded-2xl transition-all duration-300 ${
                dragState.isDragging 
                  ? 'scale-105' 
                  : ''
              }`}
              style={{
                borderColor: dragState.isDragging ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor: dragState.isDragging ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(155, 155, 155, 0.15) 1px, transparent 0)',
                backgroundSize: '20px 20px',
                boxShadow: 'var(--shadow-lg)'
              }}
              onDragOver={handleCanvasDragOver}
              onDrop={handleCanvasDrop}
              onClick={handleCanvasClick}
            >
              {canvasComponents.length === 0 && !dragState.isDragging && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="mb-4">
                      <Square className="w-16 h-16 mx-auto opacity-50" style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                    <div className="text-lg font-medium" style={{ color: 'var(--color-text-muted)' }}>Drop components here to start building</div>
                    <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Your canvas awaits your creativity</div>
                  </div>
                </div>
              )}
              
              {dragState.isDragging && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="text-center space-y-3">
                    <div className="animate-bounce">
                      <Sparkles className="w-12 h-12 mx-auto" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div className="font-bold text-xl" style={{ color: 'var(--color-primary)' }}>
                      Drop {dragState.draggedComponent?.name} here
                    </div>
                    <div className="text-sm" style={{ color: 'var(--color-primary)' }}>Release to add to your design</div>
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
                          ? 'ring-4 ring-offset-2' 
                          : ''
                      }`}
                      style={{
                        left: component.position.x,
                        top: component.position.y,
                        ringColor: selectedComponent === component.id ? 'var(--color-primary)' : 'transparent',
                        boxShadow: selectedComponent === component.id ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
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
                <div className="border rounded-full px-6 py-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                      <span style={{ color: 'var(--color-text-muted)' }}>{canvasComponents.length} Component{canvasComponents.length !== 1 ? 's' : ''}</span>
                    </div>
                    {selectedComponent && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }}></div>
                        <span style={{ color: 'var(--color-text-muted)' }}>Selected: {canvasComponents.find(c => c.id === selectedComponent)?.name}</span>
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
            className="absolute bottom-0 left-80 right-80 border-t-2 rounded-t-2xl z-30"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '50vh'
            }}
          >
            <div 
              className="flex items-center justify-between p-4 border-b rounded-t-2xl cursor-move"
              style={{ backgroundColor: 'var(--color-bg-muted)', borderColor: 'var(--color-border)' }}
              onMouseDown={handleCodePanelDragStart}
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
                    <Code className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Generated Code</h3>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Drag to move to sidebar →</p>
                  </div>
                </div>
              </div>
              <button
                onClick={moveCodePanelToRightSidebar}
                className="px-3 py-1 text-xs rounded-lg transition-colors text-white"
                style={{ backgroundColor: 'var(--color-primary)' }}
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
      
      {/* Enhanced drag styles with CSS variables */}
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

        /* Code syntax highlighting styles */
        .code-keyword {
          color: #569cd6;
          font-weight: 600;
        }
        
        .code-string {
          color: #ce9178;
        }
        
        .code-comment {
          color: #6a9955;
          font-style: italic;
        }
        
        .code-tag {
          color: #4ec9b0;
        }
        
        .code-attr {
          color: #9cdcfe;
        }
        
        .code-number {
          color: #b5cea8;
        }
        
        .code-function {
          color: #dcdcaa;
        }
        
        .code-property {
          color: #9cdcfe;
        }
        
        .code-value {
          color: #ce9178;
        }
        
        .code-selector {
          color: #d7ba7d;
        }

        /* Custom scrollbar for code editor */
        .code-editor::-webkit-scrollbar {
          width: 8px;
        }
        
        .code-editor::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }
        
        .code-editor::-webkit-scrollbar-thumb {
          background: var(--color-primary);
          border-radius: 4px;
        }
        
        .code-editor::-webkit-scrollbar-thumb:hover {
          background: var(--color-primary-hover);
        }

        /* Smooth transitions for all interactive elements */
        .group:hover .group-hover\\:scale-110 {
          transform: scale(1.1);
        }
        
        /* Focus styles using CSS variables */
        input:focus, textarea:focus, button:focus {
          box-shadow: 0 0 0 3px rgba(160, 82, 255, 0.1);
          border-color: var(--color-primary) !important;
        }
        
        /* Hover effects */
        [style*="cursor-pointer"]:hover {
          transform: translateY(-1px);
          transition: var(--transition);
        }
        
        /* Selection styles */
        ::selection {
          background-color: var(--color-primary-soft);
          color: var(--color-primary);
        }
        
        /* Code highlighting hover effects */
        .code-keyword:hover,
        .code-string:hover,
        .code-tag:hover,
        .code-attr:hover,
        .code-function:hover {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          padding: 1px 2px;
          margin: -1px -2px;
          cursor: help;
        }
        
        /* Professional button styles */
        button {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 500;
          letter-spacing: -0.025em;
        }
        
        /* Enhanced input styles */
        input, textarea {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          transition: var(--transition);
        }
        
        input:hover, textarea:hover {
          border-color: var(--color-primary-hover);
        }
        
        /* Professional panel styling */
        [class*="panel"] {
          backdrop-filter: blur(20px);
          border: 1px solid var(--color-border);
        }
        
        /* Loading states */
        .loading {
          position: relative;
          overflow: hidden;
        }
        
        .loading::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        /* Toast notification styles */
        .toast {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          backdrop-filter: blur(20px);
        }
        
        /* Tooltip arrow */
        .tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: var(--color-surface) transparent transparent transparent;
        }
        
        /* Professional animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out;
        }
        
        .animate-fadeInScale {
          animation: fadeInScale 0.2s ease-out;
        }
      `}</style>
    </AuthenticatedLayout>
  );
}