import React, { useMemo, useRef, useState } from 'react'
import WindowPanel from '@/Components/WindowPanel'
import { PackageOpen, Component as ComponentIcon } from 'lucide-react'
import { motion } from 'framer-motion'

// Mini Canvas Preview Component - Renders ProjectComponents exactly like Forge canvas
function ComponentThumbnailPreview({ projectComponents, frameName }) {
  if (!projectComponents || projectComponents.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
        <ComponentIcon className="w-8 h-8 text-white" />
      </div>
    )
  }

  // Build component tree from flat array (same as Forge)
  const buildTree = (components) => {
    const map = new Map()
    const roots = []

    components.forEach(comp => {
      map.set(comp.id, { ...comp, children: [] })
    })

    components.forEach(comp => {
      const node = map.get(comp.id)
      if (comp.parent_id && map.has(comp.parent_id)) {
        map.get(comp.parent_id).children.push(node)
      } else {
        roots.push(node)
      }
    })

    return roots
  }

  const componentTree = buildTree(projectComponents)

  // 🔥 UNIFIED: Render component using unified renderer
  const renderComponent = (comp) => {
    const style = comp.style || {}
    const props = comp.props || {}
    
    // Parse style if it's a string
    const parsedStyle = typeof style === 'string' ? JSON.parse(style) : style
    
    // Import componentLibraryService dynamically
    const componentLibraryService = window.componentLibraryService || 
      require('@/Services/ComponentLibraryService').default;
    
    // Build component object for unified renderer
    const component = {
      id: comp.id,
      type: comp.component_type || comp.type || 'div',
      props: {
        ...props,
        text: comp.text_content || props.content || props.text
      },
      style: parsedStyle,
      children: comp.children || []
    };

    return (
      <div key={comp.id} style={{ position: 'relative' }}>
        {componentLibraryService?.renderUnified 
          ? componentLibraryService.renderUnified(component, comp.id)
          : <div style={parsedStyle}>{component.props.text}</div>
        }
        {comp.children && comp.children.map(child => renderComponent(child))}
      </div>
    )
  }

  return (
    <div 
      className="w-full h-full relative overflow-hidden" 
      style={{ 
        transform: 'scale(0.35)', 
        transformOrigin: 'top left', 
        width: '286%', 
        height: '286%',
        backgroundColor: '#ffffff',
      }}
    >
      <div style={{ position: 'relative', width: '768px', minHeight: '480px' }}>
        {componentTree.map(comp => renderComponent(comp))}
      </div>
    </div>
  )
}

// Draggable component item with thumbnail
function DraggableLinkedComponent({ component, onDragStart, onDragEnd }) {
  const [isHovered, setIsHovered] = useState(false)
  const dragImageRef = useRef(null)

  const handleDragStart = (e) => {
    // Prepare drag data - same format as ComponentsPanel
    const dragData = {
      componentType: 'frame-component-instance',
      isLinkedComponent: true,
      sourceFrame: component,
      component: {
        id: component.id,
        uuid: component.uuid,
        name: component.name,
        type: 'frame-component-instance',
        description: `Instance of ${component.name}`,
      }
    }

    try {
      e.dataTransfer.effectAllowed = 'copy'
      e.dataTransfer.setData('text/plain', JSON.stringify(dragData))
    } catch {}

    // Create drag image
    try {
      const dragImg = document.createElement('div')
      dragImg.style.cssText = `
        position: absolute;
        top: -10000px;
        left: -10000px;
        width: 120px;
        height: 80px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        pointer-events: none;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
      `
      dragImg.textContent = component.name

      document.body.appendChild(dragImg)
      dragImageRef.current = dragImg

      requestAnimationFrame(() => {
        try {
          e.dataTransfer.setDragImage(dragImg, 60, 40)
        } catch {}
      })
    } catch {}

    onDragStart?.(component)
  }

  const handleDragEnd = (e) => {
    try {
      if (dragImageRef.current?.parentNode) {
        dragImageRef.current.parentNode.removeChild(dragImageRef.current)
      }
      dragImageRef.current = null
    } catch {}
    onDragEnd?.(e)
  }

  const projectComponents = component.project_components || component.projectComponents || []

  return (
    <motion.div
      className="group relative p-3 rounded-xl border-2 transition-all"
      style={{
        borderColor: isHovered ? 'var(--color-primary)' : 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)'
      }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Thumbnail preview - Only this is draggable */}
      <div 
        className="w-full mb-3 rounded-lg overflow-hidden border cursor-grab active:cursor-grabbing"
        style={{ 
          aspectRatio: '16/9',
          borderColor: 'var(--color-border)',
          background: '#ffffff'
        }}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <ComponentThumbnailPreview projectComponents={projectComponents} frameName={component.name} />
        
        {/* Drag hint overlay */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <span className="text-white text-xs font-semibold">Drag to canvas</span>
        </motion.div>
      </div>

      {/* Component info - Not draggable */}
      <div className="space-y-1">
        <h3 className="font-medium text-sm text-[var(--color-text)] truncate">
          {component.name}
        </h3>
        <p className="text-xs text-[var(--color-text-muted)]">
          {projectComponents.length} element{projectComponents.length !== 1 ? 's' : ''}
        </p>
      </div>
    </motion.div>
  )
}

export default function LinkedComponentsModal({ 
  isOpen, 
  onClose, 
  currentFrame,
  allFrames = [],
  frameAssignments = [],
  onDragStart,
  onDragEnd
}) {
  // Get components linked to current frame (page)
  const linkedComponents = useMemo(() => {
    if (!currentFrame || !frameAssignments || frameAssignments.length === 0) return [];
    
    // Get assignments where current frame is the page
    const assignments = frameAssignments.filter(assignment => {
      const pageFrameUuid = assignment.pageFrame?.uuid || assignment.page_frame?.uuid;
      return pageFrameUuid === currentFrame.uuid;
    });

    // Extract component frames
    const components = assignments.map(assignment => {
      const componentFrame = assignment.componentFrame || assignment.component_frame;
      return componentFrame;
    }).filter(Boolean); // Remove any null/undefined

    console.log('📦 Linked components for', currentFrame.name, ':', components.length, 'components')
    return components;

  }, [currentFrame, frameAssignments]);

  if (!currentFrame) return null;

  return (
    <WindowPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Linked Components"
      initialSize={{ width: 700, height: 600 }}
      minSize={{ width: 500, height: 400 }}
      maxSize={{ width: 1200, height: 900 }}
      content={
      <div className="h-full flex flex-col">
        {/* Info Banner */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            💡 <strong>How it works:</strong> Linking in Void = Import statement. Dragging here = Creating instance.
          </p>
        </div>

        {/* Components grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {linkedComponents.length === 0 ? (
            <div className="text-center py-16">
              <PackageOpen className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: 'var(--color-text-muted)' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                No Components Linked Yet
              </h3>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                Link components to this page in Void view to import them. Once linked, you can drag them here to add instances to your canvas.
              </p>
              <div className="mt-6 p-4 rounded-lg max-w-md mx-auto" style={{ backgroundColor: 'var(--color-primary-soft)', borderLeft: '3px solid var(--color-primary)' }}>
                <p className="text-xs" style={{ color: 'var(--color-primary)' }}>
                  <strong>Tip:</strong> Go to Void view → Enable link mode → Connect component frames to this page
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)', borderLeft: '3px solid var(--color-primary)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                  {linkedComponents.length} component{linkedComponents.length !== 1 ? 's' : ''} imported
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Drag any component to the canvas to create an instance. You can use each component multiple times.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {linkedComponents.map((component) => (
                  <DraggableLinkedComponent
                    key={component.uuid}
                    component={component}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <div className="flex justify-between items-center">
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Manage links in <strong>Void page</strong> using link mode
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
      }
    />
  )
}
