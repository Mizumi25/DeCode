// =============================================================================
// SOLUTION 1: Add Drag-to-REORDER Functionality (For Layout-Based System)
// =============================================================================

// Your system uses FLEX/GRID layouts with SORTABLE components, not absolute positioning!
// We need to implement REORDERING within containers, not free positioning.

// ADD these state variables for drag reordering
const [draggedItem, setDraggedItem] = useState(null);
const [dragOverItem, setDragOverItem] = useState(null);
const [dragOverContainer, setDragOverContainer] = useState(null);

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

// MODIFY your CanvasComponent to add reorder handlers
<CanvasComponent
  // ... existing props ...
  onReorderDragStart={handleReorderDragStart}
  onReorderDragOver={handleReorderDragOver}
  onReorderDrop={handleReorderDrop}
  onReorderDragEnd={handleReorderDragEnd}
  draggedItem={draggedItem}
  dragOverItem={dragOverItem}
/>

// ADD CSS for drag feedback (in your styles or Tailwind config)
/*
.dragging {
  opacity: 0.5;
  border: 2px dashed var(--color-primary);
}

.drag-over {
  border-top: 3px solid var(--color-primary);
}
*/

// =============================================================================
// SOLUTION 2: Fix Blank Page Navigation Issue
// =============================================================================

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

// ADD effect to handle Inertia navigation properly
useEffect(() => {
  const handleInertiaStart = () => {
    console.log('ForgePage: Navigation starting, preparing to unmount...');
    setIsFrameSwitching(true);
  };
  
  const handleInertiaFinish = () => {
    console.log('ForgePage: Navigation finished');
    setIsFrameSwitching(false);
  };
  
  // Listen to Inertia events
  router.on('start', handleInertiaStart);
  router.on('finish', handleInertiaFinish);
  
  return () => {
    router.off('start', handleInertiaStart);
    router.off('finish', handleInertiaFinish);
  };
}, []);

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

// =============================================================================
// SOLUTION 3: Fix Grandchild Nesting Issue (Blank Page Bug)
// =============================================================================

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

// =============================================================================
// ADDITIONAL FIX: Add Error Boundary for Component Rendering
// =============================================================================

// CREATE a new file: Components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            {this.state.error?.message || 'Unknown error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// WRAP your ForgePage content with ErrorBoundary:
// In ForgePage.jsx, add at the top:
import ErrorBoundary from '@/Components/ErrorBoundary';

// Then wrap the return content:
return (
  <ErrorBoundary>
    <AuthenticatedLayout>
      {/* ... rest of your code ... */}
    </AuthenticatedLayout>
  </ErrorBoundary>
);