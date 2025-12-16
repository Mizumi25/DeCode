// @/Components/Forge/CanvasComponent.jsx - Enhanced for True Responsive Canvas Sizing
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Square, Sparkles, Monitor, Edit3, Tablet, Smartphone, Move, RotateCcw, Layers, GripVertical } from 'lucide-react';
import { usePage } from '@inertiajs/react';

import SectionDropZone from './SectionDropZone';
import EmptyCanvasState from './EmptyCanvasState';
import SelectionOverlay from './SelectionOverlay';
import DragSnapLines from './DragSnapLines';
import SectionHoverAddLine from './SectionHoverAddLine';
import DropAnimation from './DropAnimation';

import { useEditorStore } from '@/stores/useEditorStore';
import { useForgeStore } from '@/stores/useForgeStore';
import { useForgeUndoRedoStore } from '@/stores/useForgeUndoRedoStore';
import { useCanvasOverlayStore } from '@/stores/useCanvasOverlayStore';

// 🔥 REMOVED: @dnd-kit imports - using custom drag system instead
import { useCustomDrag } from '@/hooks/useCustomDrag';
import { 
  findDropTargetAtPosition, 
  wouldCreateCircularRef,
  canAcceptChildren 
} from '@/utils/dropZoneDetection';
import { createMoveComponentAction } from '@/utils/undoRedoActions'; // 🔥 NEW: Import move action creator






// 🔥 HELPER: Remove component from tree recursively
const removeComponentFromTree = (components, componentId) => {
  return components.reduce((acc, comp) => {
    if (comp.id === componentId) {
      return acc; // Skip this component
    }
    
    if (comp.children?.length > 0) {
      return [...acc, {
        ...comp,
        children: removeComponentFromTree(comp.children, componentId)
      }];
    }
    
    return [...acc, comp];
  }, []);
};

// 🔥 HELPER: Add component to container recursively
const addComponentToContainer = (components, containerId, childToAdd) => {
  return components.map(comp => {
    if (comp.id === containerId) {
      return {
        ...comp,
        children: [
          ...(comp.children || []),
          {
            ...childToAdd,
            parentId: comp.id
          }
        ]
      };
    }
    
    if (comp.children?.length > 0) {
      return {
        ...comp,
        children: addComponentToContainer(comp.children, containerId, childToAdd)
      };
    }
    
    return comp;
  });
};

// 🔥 HELPER: Array move utility
const arrayMove = (array, from, to) => {
  const newArray = [...array];
  const [movedItem] = newArray.splice(from, 1);
  newArray.splice(to, 0, movedItem);
  return newArray;
};

// 🔥 HELPER: Rebuild tree from flat array
const rebuildTree = (flatArray) => {
  const map = new Map();
  const roots = [];

  flatArray.forEach(item => {
    map.set(item.id, { ...item, children: [] });
  });

  flatArray.forEach(item => {
    const node = map.get(item.id);
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};







const CanvasComponent = ({
  canvasRef,
  canvasComponents,
  selectedComponent,
  setSelectedComponent,        // 🔥 ADD THIS
  setIsCanvasSelected,         // 🔥 ADD THIS
  dragState,
  isCanvasSelected,
  componentLibraryService,
  onCanvasDragOver,
  onCanvasDrop,
  onCanvasClick,
  onComponentClick,
  onPropertyUpdate,
  isMobile,
  currentFrame,
  isFrameSwitching,
  frameType = 'page',
  responsiveMode,
  zoomLevel,
  gridVisible,
  projectId,
  setFrameCanvasComponents,
  frame,
  broadcastDragMove, 
  broadcastStateChanged, // 🔥 ADD THIS
  updateCursor,      
  componentsLoaded,
  broadcastRealtimeUpdate, // 🔥 ADD THIS LINE
}) => {
  // Get responsive state from EditorStore
  const {
    getCurrentCanvasDimensions,
    getResponsiveDeviceInfo,
    getResponsiveScaleFactor,
    getResponsiveCanvasClasses,
    getResponsiveGridBackground,
    interactiveMode, // 🔥 NEW
    canvasZoom, // 🔥 NEW
    clipCanvas // 🔥 NEW
  } = useEditorStore();
  
  
  // 🔥 ADD: Get Forge Store states
const { 
  canvasExpansionEnabled, 
  canvasZoom: forgeCanvasZoom,
  interactionMode 
} = useForgeStore();

  // 🔥 Get project CSS variables
  const { project } = usePage().props;
  const projectStyleVariables = project?.settings?.style_variables || {};
  
  // 🔥 Create ref for content wrapper (not canvas - we don't want UI controls affected)
  const contentWrapperRef = useRef(null);
  
  // 🔥 Build project CSS variables inline style object
  const getProjectCSSVariables = useCallback(() => {
    // Default variables (same as StyleModal)
    const defaultVariables = {
      '--color-primary': '#3b82f6',
      '--color-surface': '#ffffff',
      '--color-text': '#1f2937',
      '--color-border': '#e5e7eb',
      '--color-bg-muted': '#f9fafb',
      '--color-text-muted': '#6b7280',
      '--font-size-base': '14px',
      '--font-weight-normal': '400',
      '--line-height-base': '1.5',
      '--letter-spacing': '0',
      '--radius-md': '6px',
      '--radius-lg': '8px',
      '--container-width': '1200px',
      '--shadow-sm': '0 1px 2px rgba(0,0,0,0.05)',
      '--shadow-md': '0 4px 6px rgba(0,0,0,0.07)',
      '--shadow-lg': '0 10px 15px rgba(0,0,0,0.1)',
      '--spacing-xs': '4px',
      '--spacing-sm': '8px',
      '--spacing-md': '16px',
      '--spacing-lg': '24px',
      '--transition-duration': '200ms',
      '--transition-easing': 'cubic-bezier(0.4, 0, 0.2, 1)',
      '--z-modal': '1000',
    };
    
    // Merge project variables with defaults
    return { ...defaultVariables, ...projectStyleVariables };
  }, [projectStyleVariables]);

const isRemoteUpdateRef = useRef(false);
  

  // 🔥 ADD this after the store hooks
  const isPreviewMode = interactionMode === 'preview';
  
  const { overlays, isOverlayEnabled } = useCanvasOverlayStore();
  
  // Get undo/redo functionality
  const { pushHistory, actionTypes, executeAction } = useForgeUndoRedoStore(); // 🔥 ADD: executeAction

  // Local state for canvas interactions
  const [isDraggingComponent, setIsDraggingComponent] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingComponent, setResizingComponent] = useState(null);
  
  // 🔥 NEW: Custom drag state (replaces dnd-kit state)
  const [activeDragId, setActiveDragId] = useState(null);
  const [dragPosition, setDragPosition] = useState(null);

  // Get responsive device info and dimensions
  const deviceInfo = getResponsiveDeviceInfo();
  const scaleFactor = getResponsiveScaleFactor();
  const canvasClasses = getResponsiveCanvasClasses();
  const canvasDimensions = getCurrentCanvasDimensions();



const getCanvasSize = () => {
  // 🔥 FIXED: Properly scaled sizes that fit viewport
  switch (responsiveMode) {
    case 'mobile':
      return {
        width: 375,
        height: 667,
        maxWidth: '375px',
        deviceName: 'iPhone SE',
        scale: 0.8 // 🔥 NEW: Scale down mobile preview
      };
    case 'tablet':
      return {
        width: 768,
        height: 1024,
        maxWidth: '768px',
        deviceName: 'iPad',
        scale: 0.7 // 🔥 NEW: Scale down tablet preview
      };
    case 'desktop':
    default:
      return {
        width: 1440,
        height: 900,
        maxWidth: '1440px',
        deviceName: 'Desktop',
        scale: 0.6 // 🔥 NEW: Scale down desktop to 60%
      };
  }
};

const canvasSize = getCanvasSize();
  




const getCanvasRootStyles = () => {
  const canvasStyle = frame?.canvas_style || {};
  
  // 🔥 FIXED: Proper dimensions per mode
  const baseDimensions = {
    mobile: {
      width: '375px',
      height: canvasExpansionEnabled ? 'auto' : '667px',
      minHeight: '667px',
      maxHeight: canvasExpansionEnabled ? 'none' : '667px',
    },
    tablet: {
      width: '768px',
      height: canvasExpansionEnabled ? 'auto' : '1024px',
      minHeight: '1024px',
      maxHeight: canvasExpansionEnabled ? 'none' : '1024px',
    },
    desktop: {
      width: '1440px', // 🔥 EXPLICIT width
      maxWidth: '1440px',
      height: canvasExpansionEnabled ? 'auto' : '900px',
      minHeight: '900px',
      maxHeight: canvasExpansionEnabled ? 'none' : '900px',
    }
  };
  
  return {
    ...baseDimensions[responsiveMode],
    width: canvasStyle.width || baseDimensions[responsiveMode].width,
    backgroundColor: canvasStyle.backgroundColor || '#ffffff',
    color: canvasStyle.color || '#1f2937',
    fontFamily: canvasStyle.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: canvasStyle.fontSize || '16px',
    lineHeight: canvasStyle.lineHeight || '1.6',
    overflow: 'visible',
    position: 'relative',
    boxSizing: 'border-box',
    padding: canvasStyle.padding || '0px',
    paddingBottom: canvasExpansionEnabled ? '80px' : (canvasStyle.padding || '0px'),
    margin: '0px',
    display: 'block',
    transformOrigin: 'top center',
    // 🔥 NO extra transform here - handled by parent wrapper
  };
};




const ViewportBoundaryIndicator = ({ responsiveMode, canvasRef }) => {
  const baseHeights = {
    mobile: 667,
    tablet: 1024,
    desktop: null, // Desktop doesn't need indicator
  };
  
  const baseHeight = baseHeights[responsiveMode];
  
  if (!baseHeight || !canvasRef?.current) return null;
  
  return (
    <div
      className="fixed left-0 right-0 pointer-events-none z-[999]"
      style={{
        top: '50%', // 🔥 Centered vertically in viewport
        transform: 'translateY(-50%)',
      }}
    >
      {/* Centered container that matches canvas width */}
      <div
        className="mx-auto relative"
        style={{
          width: responsiveMode === 'mobile' ? '375px' : '768px',
        }}
      >
      {/* Pink viewport line - positioned at 100vh mark */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: `${baseHeight}px`,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(236, 72, 153, 0.4) 20%, rgba(236, 72, 153, 0.4) 80%, transparent)',
            boxShadow: '0 0 4px rgba(236, 72, 153, 0.2)',
          }}
        >
          {/* Subtle label */}
          <div
            className="absolute right-4 -top-6 px-2 py-0.5 rounded text-xs font-mono bg-pink-500/80 text-white shadow-sm"
            style={{
              fontSize: '9px',
            }}
          >
            100vh
          </div>
        </div>
      </div>
    </div>
  );
};


  
  // 🔥 REMOVED: dnd-kit sensors - using custom pointer events instead

  // Flatten components for reordering
  const flattenForReorder = useCallback((components, parentId = null) => {
    let result = [];
    components.forEach(comp => {
      result.push({ ...comp, parentId });
      if (comp.children?.length > 0) {
        result = result.concat(flattenForReorder(comp.children, comp.id));
      }
    });
    return result;
  }, []);

  const flatComponents = useMemo(() => 
    flattenForReorder(canvasComponents), 
    [canvasComponents, flattenForReorder]
  );
  
  // Document flow components (those that should flow naturally)
  const flowComponents = ['div', 'section', 'header', 'main', 'footer', 'nav', 'article', 'aside', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'];
  
  // Absolute positioned components (those that need precise positioning)
  const absoluteComponents = ['button', 'badge', 'avatar', 'input', 'searchbar'];
  
 
  
  
  
  // 🔥 Global function for child text to select parent
useEffect(() => {
  window.forgeSelectComponent = (componentId) => {
    setSelectedComponent(componentId);
  };
  
  return () => {
    delete window.forgeSelectComponent;
  };
}, []);
  
  
  
  
  useEffect(() => {
  const handleOverlayChange = (e) => {
    console.log('Canvas received overlay change:', e.detail);
    // Force component update by touching a state
    setSelectedComponent(prev => prev);
  };

  window.addEventListener('canvas-overlay-changed', handleOverlayChange);
  return () => window.removeEventListener('canvas-overlay-changed', handleOverlayChange);
}, []);
  
  
  
  // 🔥 NEW: Apply canvas styles whenever they change
useEffect(() => {
  if (canvasRef.current && frame?.canvas_style) {
    componentLibraryService?.applyCanvasStyles?.(canvasRef, frame);
  }
}, [frame?.canvas_style, canvasRef, componentLibraryService]);
  
  
  
  
  
  // Handle drag-to-reorder
  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    if (sourceIndex === destIndex) return;
    
    const items = Array.from(canvasComponents);
    const [reorderedItem] = items.splice(sourceIndex, 1);
    items.splice(destIndex, 0, reorderedItem);
    
    // Update z-index and sort_order based on new positions
    const updatedItems = items.map((item, index) => ({
        ...item,
        zIndex: index,
        sortOrder: index
    }));
    
    setFrameCanvasComponents(prev => ({
        ...prev,
        [currentFrame]: updatedItems
    }));
    
    // Push to history
    if (pushHistory && actionTypes) {
        pushHistory(currentFrame, updatedItems, actionTypes.MOVE, {
            componentName: reorderedItem.name || reorderedItem.type,
            componentId: reorderedItem.id,
            action: 'reorder',
            fromIndex: sourceIndex,
            toIndex: destIndex
        });
    }
    
    // Auto-save after reorder
    setTimeout(() => {
        if (componentLibraryService?.saveProjectComponents) {
            componentLibraryService.saveProjectComponents(projectId, currentFrame, updatedItems);
        }
    }, 500);
    
  }, [canvasComponents, currentFrame, pushHistory, actionTypes, setFrameCanvasComponents, componentLibraryService, projectId]);

  // FIXED: handleNestedDragEnd function
  const handleNestedDragEnd = useCallback((result, containerId = 'root') => {
    console.log('Nested drag end:', result, 'in container:', containerId);
    
    if (!result.destination) {
      console.log('No destination, drag cancelled');
      return;
    }
    
    const { source, destination, draggableId } = result;
    
    // Extract container IDs
    const sourceContainerId = source.droppableId === 'canvas-root' 
      ? null 
      : source.droppableId.replace('container-', '');
      
    const destContainerId = destination.droppableId === 'canvas-root' 
      ? null 
      : destination.droppableId.replace('container-', '');
    
    console.log('Source container:', sourceContainerId, 'Dest container:', destContainerId);
    
    // Deep clone components
    let updatedComponents = JSON.parse(JSON.stringify(canvasComponents));
    
    // Same container reorder
    if (sourceContainerId === destContainerId) {
      console.log('Reordering within same container');
      
      if (sourceContainerId === null) {
        // Root level reorder
        const [moved] = updatedComponents.splice(source.index, 1);
        updatedComponents.splice(destination.index, 0, moved);
      } else {
        // Nested reorder
        updatedComponents = reorderWithinContainer(
          updatedComponents, 
          sourceContainerId, 
          source.index, 
          destination.index
        );
      }
    } 
    // Move between containers
    else {
      console.log('Moving between containers');
      updatedComponents = moveBetweenContainers(
        updatedComponents,
        draggableId,
        sourceContainerId,
        destContainerId,
        source.index,
        destination.index
      );
    }
    
    // Update sortOrder
    const updateSortOrders = (comps) => {
      comps.forEach((comp, index) => {
        comp.sortOrder = index;
        comp.zIndex = index;
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
    
    // Push to history
    if (pushHistory && actionTypes) {
      pushHistory(currentFrame, updatedComponents, actionTypes.MOVE, {
        componentId: draggableId,
        action: sourceContainerId === destContainerId ? 'reorder' : 'move_container',
        fromContainer: sourceContainerId || 'root',
        toContainer: destContainerId || 'root',
        fromIndex: source.index,
        toIndex: destination.index
      });
    }
    
    // Auto-save
    setTimeout(() => {
      if (componentLibraryService?.saveProjectComponents) {
        componentLibraryService.saveProjectComponents(projectId, currentFrame, updatedComponents);
      }
    }, 500);
    
    console.log('Drag end completed, updated components:', updatedComponents.length);
    
  }, [canvasComponents, currentFrame, pushHistory, actionTypes, componentLibraryService, projectId, setFrameCanvasComponents]);







// 🔥 REMOVED: Old dnd-kit handlers - using custom drag system instead






// 🔥 REMOVED: Old dnd-kit drag over handler - using custom drag system instead




// Helper to check if a component is a descendant of another (prevent circular refs)
const isDescendant = (parentId, childId, components) => {
  const checkChildren = (comp, targetId) => {
    if (comp.id === targetId) return true;
    if (comp.children) {
      return comp.children.some(child => checkChildren(child, targetId));
    }
    return false;
  };
  
  const parentComp = components.find(c => c.id === parentId);
  return parentComp ? checkChildren(parentComp, childId) : false;
};




  

// 🔥 REMOVED: Old dnd-kit drag end handler - completely replaced by handleComponentDragEnd
// The old handler is no longer needed since we're using the custom drag system


// 🔥 REMOVED: Old dnd-kit drag cancel handler - using custom drag system instead
  
  
  
  // 🔥 NEW: Handle double-click to edit text inline
const handleDoubleClickText = useCallback((e, componentId) => {
  e.stopPropagation();
  
  const component = canvasComponents.find(c => c.id === componentId);
  if (!component) return;
  
  // Check if it's a text element
  const isTextElement = component.type === 'text-node' || 
                       component.isPseudoElement ||
                       ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 'small', 'label', 'blockquote', 'button', 'link'].includes(component.type);
  
  if (!isTextElement) return;
  
  const element = e.currentTarget;
  const originalContent = component.props?.content || component.props?.text || '';
  
  // Make element editable
  element.contentEditable = true;
  element.focus();
  
  // Select all text
  const range = document.createRange();
  range.selectNodeContents(element);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  
  // Style for editing mode
  element.style.outline = '2px solid #3b82f6';
  element.style.outlineOffset = '2px';
  
  // Handle blur (save changes)
  const handleBlur = () => {
    element.contentEditable = false;
    element.style.outline = '';
    
    const newContent = element.textContent || '';
    
    if (newContent !== originalContent) {
      onPropertyUpdate(componentId, 'content', newContent, 'props');
      onPropertyUpdate(componentId, 'text', newContent, 'props');
    }
    
    element.removeEventListener('blur', handleBlur);
    element.removeEventListener('keydown', handleKeyDown);
  };
  
  // Handle Enter/Escape keys
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      element.blur();
    } else if (e.key === 'Escape') {
      element.textContent = originalContent;
      element.blur();
    }
  };
  
  element.addEventListener('blur', handleBlur);
  element.addEventListener('keydown', handleKeyDown);
}, [canvasComponents, onPropertyUpdate]);
  
  
  
  
  
// REPLACE the entire handleSmartClick function with:
const handleSmartClick = useCallback((e) => {
  e.stopPropagation();
  
  console.log('🎯 Smart click initiated:', {
    target: e.target,
    path: e.nativeEvent.composedPath().map(el => el.getAttribute?.('data-component-id')).filter(Boolean)
  });
  
  // Get all component elements under the click
  const clickPath = e.nativeEvent.composedPath();
  
  // 🔥 PRIORITY 1: Check for text node clicks
  const textNode = clickPath.find(el => 
    el.nodeType === 1 && 
    el.hasAttribute && 
    (el.getAttribute('data-is-pseudo') === 'true' ||
     el.getAttribute('data-component-type') === 'text-node')
  );
  
  if (textNode) {
    const textNodeId = textNode.getAttribute('data-component-id');
    console.log('✅ Text node clicked:', textNodeId);
    
    // 🔥 FIX: Call both handlers with correct component ID
    setSelectedComponent(textNodeId);
    setIsCanvasSelected(false);
    onComponentClick(textNodeId, e);
    
    window.dispatchEvent(new CustomEvent('component-selected', {
      detail: { componentId: textNodeId }
    }));
    return;
  }
  
  // 🔥 PRIORITY 2: Regular component selection
  const componentElements = clickPath.filter(el => 
    el.nodeType === 1 && el.hasAttribute && el.hasAttribute('data-component-id')
  );
  
  if (componentElements.length === 0) {
    console.log('🎯 Canvas click - checking frame type');
    
    // ✅ Components don't have canvas root - just deselect
    if (frame?.type === 'component') {
      console.log('🎯 Component frame - no canvas root, deselecting');
      setSelectedComponent(null);
      setIsCanvasSelected(false);
      onComponentClick(null, e);
      return;
    }
    
    // ✅ Pages have canvas root - select it
    console.log('🎯 Page frame - selecting canvas root');
    setSelectedComponent('__canvas_root__');
    setIsCanvasSelected(true);
    onComponentClick('__canvas_root__', e);
    
    window.dispatchEvent(new CustomEvent('component-selected', {
      detail: { componentId: '__canvas_root__' }
    }));
    return;
  }
  
  // Select the FIRST (deepest/innermost) component
  const targetElement = componentElements[0];
  const componentId = targetElement.getAttribute('data-component-id');
  
  console.log('✅ Component selected:', componentId);

// 🔥 CRITICAL: Force immediate update with both mechanisms
const updateSelection = () => {
  setSelectedComponent(componentId);
  setIsCanvasSelected(false);
  
  // Ensure parent handler is called
  if (onComponentClick) {
    onComponentClick(componentId, e);
  }
  
  // Force re-render trigger
  window.dispatchEvent(new CustomEvent('component-selected', {
    detail: { componentId }
  }));
};

// Execute immediately
updateSelection();

// 🔥 NEW: Force PropertiesPanel to re-check
setTimeout(() => {
  window.dispatchEvent(new CustomEvent('force-properties-update', {
    detail: { componentId }
  }));
}, 0);
  
  window.dispatchEvent(new CustomEvent('component-selected', {
    detail: { componentId }
  }));
}, [onComponentClick, setSelectedComponent, setIsCanvasSelected]);
  
  
  

// 🔥 NEW: Custom DraggableComponent - Replaces SortableComponent
// @/Components/Forge/CanvasComponent.jsx - Premium custom drag system

const DraggableComponent = ({ 
  component, 
  depth, 
  parentId, 
  index, 
  parentStyle, 
  responsiveMode,
  onDragEnd: handleComponentDragEnd,
  setSelectedComponent,        // 🔥 ADD THIS
  setIsCanvasSelected,         // 🔥 ADD THIS
  currentFrame,
  canvasComponents,
  flattenForReorder,
  onDragStateChange, // 🔥 NEW: Callback to update parent drag state
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dropAnimationKey, setDropAnimationKey] = useState(0);
  const isSelected = selectedComponent === component.id;
  const isLayout = component.isLayoutContainer || 
                   ['section', 'container', 'div', 'flex', 'grid'].includes(component.type);

  // 🔥 NEW: Use custom drag hook
const {
  isDragging,
  dragState,
  dropTarget,
  dropIntent,
  dragHandlers,
} = useCustomDrag({
  componentId: component.id,
  component,
  canvasRef,
  enabled: !isPreviewMode,
  onDragStart: ({ componentId, component: comp }) => {
    onDragStateChange?.({ activeId: componentId, position: { x: 0, y: 0 } });
    console.log('🎬 Custom drag started:', componentId);
    
    window.dispatchEvent(new CustomEvent('element-drag-start', { 
      detail: { componentId } 
    }));
    
    // Vibrate only if supported (silent fail if blocked by browser)
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(50);
      } catch (err) {
        // Vibration blocked - ignore silently
      }
    }
  },
 onDragMove: ({ position, dropTarget: target, dropIntent: intent, componentId }) => {
  onDragStateChange?.({ activeId: component.id, position });
  
  if (target) {
    console.log('📍 Drag over:', target.id, intent);
  }
  
  // 🔥 FIXED: Use realtime update instead of drag move
  if (canvasRef.current && broadcastRealtimeUpdate) {
    broadcastRealtimeUpdate(componentId, 'drag_move', {
      x: position.x,
      y: position.y,
    });
  }
},
  onDragEnd: ({ componentId, dropTarget: target, dropIntent: intent }) => {
  console.log('🎯 Custom drag end:', componentId, 'to', target?.id, intent);
  
  // 🔥 FIX: Always call handleComponentDragEnd, even if no specific target (use canvas root)
  if (handleComponentDragEnd) {
    if (target) {
      handleComponentDragEnd({
        componentId,
        targetId: target.id,
        intent,
      });
    } else {
      // No specific target detected, save to canvas root
      console.warn('⚠️ No specific drop target, saving position to canvas root');
      handleComponentDragEnd({
        componentId,
        targetId: '__canvas_root__',
        intent: 'inside',
      });
    }
    
    // 🔥 NEW: Trigger drop animation
    setDropAnimationKey(prev => prev + 1);
  }
  
  onDragStateChange?.({ activeId: null, position: null });
  
  // 🔥 NEW: Broadcast final state change
  if (broadcastStateChanged) {
    const component = canvasComponents.find(c => c.id === componentId);
    if (component) {
      broadcastStateChanged(componentId, 'moved', {
        position: component.position,
        parentId: component.parentId || null,
      });
    }
  }
  
  window.dispatchEvent(new CustomEvent('element-drag-end', { 
    detail: { componentId } 
  }));
},
  onDragCancel: () => {
    onDragStateChange?.({ activeId: null, position: null });
    
    window.dispatchEvent(new CustomEvent('element-drag-end', { 
      detail: { componentId: null } 
    }));
  },
  validateDrop: ({ componentId, dropTarget: target, dropIntent: intent }) => {
    if (!target) return false;
    
    const currentComponents = canvasComponents;
    const flatArray = flattenForReorder ? flattenForReorder(currentComponents) : [];
    
    if (wouldCreateCircularRef(componentId, target.id, currentComponents)) {
      console.warn('⚠️ Cannot drop: circular reference');
      return false;
    }
    
    const targetComp = flatArray.find(c => c.id === target.id);
    if (intent === 'inside' && targetComp && !canAcceptChildren(targetComp)) {
      console.warn('⚠️ Cannot nest: target does not accept children');
      return false;
    }
    
    return true;
  },
});

  // 🔥 FIXED: Wrapper mimics component's layout behavior
  const componentStyles = componentLibraryService?.calculateResponsiveStyles(
    component, 
    responsiveMode, 
    canvasDimensions,
    {}
  ) || component.style;
  
  // Wrapper should match component's display mode to avoid layout issues
  const componentDisplay = componentStyles?.display;
  const isBlockLike = componentDisplay === 'block' || componentDisplay === 'flex' || componentDisplay === 'grid';
  
  const wrapperStyle = {
    // Match component's positioning (or relative for layout containers)
    position: componentStyles?.position || (isLayout ? 'relative' : 'static'),
    // Match component's display
    display: componentDisplay || (isLayout ? 'block' : 'inline-block'),
    // 🔥 FIX: Preserve width for block, flex, grid, or layout containers
    width: (isBlockLike || isLayout) ? (componentStyles?.width || '100%') : 'auto',
    // Match component's height if specified
    height: componentStyles?.height || 'auto',
    // Ensure wrapper has minimum dimensions for hover detection on empty containers
    minHeight: (isLayout && !component.children?.length) ? '80px' : 'auto',
    // Drag states
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 9999 : (component.zIndex || depth),
    // Event handling
    pointerEvents: 'auto',
    cursor: isDragging ? 'grabbing' : 'grab',
  };
  
  // If wrapper is handling positioning, remove from component to avoid double positioning
  const finalComponentStyles = { ...componentStyles };
  if (wrapperStyle.position === 'absolute' || wrapperStyle.position === 'fixed') {
    wrapperStyle.top = componentStyles?.top;
    wrapperStyle.left = componentStyles?.left;
    wrapperStyle.right = componentStyles?.right;
    wrapperStyle.bottom = componentStyles?.bottom;
    delete finalComponentStyles.position;
    delete finalComponentStyles.top;
    delete finalComponentStyles.left;
    delete finalComponentStyles.right;
    delete finalComponentStyles.bottom;
  }
  
  // 🔥 CRITICAL FIX: DON'T remove width from flex/grid containers!
  // Wrapper handles width for positioning, but component ALSO needs width for flex/grid to work
  // Only remove width for regular inline/block components
  if (wrapperStyle.width !== 'auto' && !isBlockLike) {
    delete finalComponentStyles.width;
  }
  // For flex/grid containers, KEEP width on component so flexbox/grid layout works correctly
  
  

// Auto-save components when they change
useEffect(() => {
  const saveComponents = async () => {
    // 🔥 CRITICAL: Skip save if this was triggered by remote update
    if (isRemoteUpdateRef.current) {
      console.log('⏭️ Skipping auto-save (remote update)');
      isRemoteUpdateRef.current = false;
      return;
    }

    if (projectId && currentFrame && canvasComponents.length > 0 && componentsLoaded && !isFrameSwitching) {
      try {
        if (componentLibraryService?.saveProjectComponents) {
          console.log('💾 Auto-saving', canvasComponents.length, 'components');
          await componentLibraryService.saveProjectComponents(
            projectId, 
            currentFrame, 
            canvasComponents,
            { silent: true } // 🔥 NEW: Don't broadcast this save
          );
        }
      } catch (error) {
        console.error('Failed to auto-save:', error);
      }
    }
  };

  const timeoutId = setTimeout(saveComponents, 2000);
  return () => clearTimeout(timeoutId);
}, [canvasComponents, projectId, currentFrame, componentsLoaded, isFrameSwitching]);

  // 🔥 UNIFIED RENDERING - One path for ALL components (layout or not)
  // The wrapper is ONLY for drag/drop interaction, the unified renderer handles ALL styling
  return (
    <div
      key={component.id}
      style={wrapperStyle}
      data-component-id={component.id}
      data-component-type={component.type}
      data-depth={depth}
      data-parent-id={parentId || 'root'}
      data-responsive-mode={responsiveMode}
      data-is-layout={isLayout}
      className={`
        draggable-component
        ${isLayout ? 'layout-container' : 'content-component'}
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        ${isDragging ? 'opacity-40' : ''}
        ${dropTarget?.id === component.id ? 'ring-2 ring-green-400' : ''}
        transition-opacity duration-150
        responsive-${responsiveMode}
      `}
      {...dragHandlers}
      onClick={handleSmartClick}
      onDoubleClick={(e) => handleDoubleClickText(e, component.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drop animation */}
      <DropAnimation componentId={component.id} triggerKey={dropAnimationKey} />
      
      {/* Framer-style hover add lines for layout containers */}
      {isLayout && !isDragging && !activeDragId && (
        <>
          <SectionHoverAddLine 
            position="top" 
            componentId={component.id}
            onAdd={handleAddSection}
          />
          <SectionHoverAddLine 
            position="bottom" 
            componentId={component.id}
            onAdd={handleAddSection}
          />
        </>
      )}
      
      {/* 🔥 DROP ZONES: Show when this component can accept drops */}
      {dropTarget?.id === component.id && activeDragId && (
        <>
          {/* Before drop zone */}
          {dropIntent === 'before' && (
            <SectionDropZone 
              position="top"
              componentId={component.id}
              isDragOver={true}
              isVisible={true}
            />
          )}
          
          {/* Inside drop zone (for containers) */}
          {dropIntent === 'inside' && canAcceptChildren(component) && (
            <div className="absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-50/20 rounded-lg pointer-events-none z-10 flex items-center justify-center">
              <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium">
                Drop Inside
              </div>
            </div>
          )}
          
          {/* After drop zone */}
          {dropIntent === 'after' && (
            <SectionDropZone 
              position="bottom"
              componentId={component.id}
              isDragOver={true}
              isVisible={true}
            />
          )}
        </>
      )}
      
      {/* 🔥 UNIFIED: Render the actual component with children INSIDE */}
      {componentLibraryService?.renderUnified 
        ? componentLibraryService.renderUnified(
            {
              ...component,
              style: finalComponentStyles  // Apply responsive styles (without duplicated wrapper props)
            }, 
            component.id,
            // 🔥 CRITICAL: Pass rendered children to be placed INSIDE the component element
            component.children && component.children.length > 0 ? (
              component.children.map((child, childIndex) => (
                <DraggableComponent
                  key={child.id}
                  component={child}
                  depth={depth + 1}
                  parentId={component.id}
                  index={childIndex}
                  parentStyle={componentStyles}
                  responsiveMode={responsiveMode}
                  onDragEnd={handleComponentDragEnd}
                  setSelectedComponent={setSelectedComponent}
                  setIsCanvasSelected={setIsCanvasSelected}
                  currentFrame={currentFrame}
                  canvasComponents={canvasComponents}
                  flattenForReorder={flattenForReorder}
                  onDragStateChange={({ activeId, position }) => {
                    setActiveDragId(activeId);
                    setDragPosition(position);
                  }}
                />
              ))
            ) : isLayout && !activeDragId ? (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
                <div className="text-xs text-gray-400 border-2 border-dashed border-gray-300 rounded p-2">
                  Drop here • {component.type} • {responsiveMode}
                  {componentStyles._responsiveScale && ` • Scale: ${componentStyles._responsiveScale.toFixed(2)}`}
                </div>
              </div>
            ) : null
          )
        : null
      }
      
      {/* Selection label */}
      {isSelected && !activeDragId && (
        <div className="absolute -top-6 left-0 px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white z-50">
          {component.name} • {component.children?.length || 0} items • {responsiveMode}
        </div>
      )}
    </div>
  );
};



// 🔥 NEW: Handle adding section via hover line
const handleAddSection = useCallback((targetComponentId, position) => {
  console.log('➕ Adding section:', position, 'of', targetComponentId);
  
  // Create new section
  const newSection = {
    id: `section_${Date.now()}`,
    type: 'section',
    name: 'Section',
    isLayoutContainer: true,
    children: [],
    style: {
      width: '100%',
      minHeight: '200px',
      padding: '48px 24px',
      backgroundColor: '#f9fafb',
      display: 'block',
    },
    props: {},
    sortOrder: 0,
    zIndex: 0,
  };
  
  const currentComponents = canvasComponents;
  const flatArray = flattenForReorder(currentComponents);
  
  // Find target component index
  const targetIndex = flatArray.findIndex(c => c.id === targetComponentId);
  
  if (targetIndex === -1) {
    console.error('Target component not found');
    return;
  }
  
  // Insert new section before or after target
  const insertIndex = position === 'top' ? targetIndex : targetIndex + 1;
  const newFlatArray = [...flatArray];
  newFlatArray.splice(insertIndex, 0, newSection);
  
  // Rebuild tree
  const newTree = rebuildTree(newFlatArray);
  
  // Update state
  setFrameCanvasComponents(prev => ({
    ...prev,
    [currentFrame]: newTree
  }));
  
  // Push to history
  if (pushHistory && actionTypes) {
    pushHistory(currentFrame, newTree, actionTypes.ADD, {
      componentId: newSection.id,
      action: 'add_section_via_hover',
      position,
      targetId: targetComponentId
    });
  }
  
  // Auto-save
  setTimeout(() => {
    if (componentLibraryService?.saveProjectComponents) {
      componentLibraryService.saveProjectComponents(projectId, currentFrame, newTree);
    }
  }, 500);
  
  // Select the new section
  setSelectedComponent(newSection.id);
  
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(30);
    } catch (err) {
      // Vibration blocked - ignore
    }
  }
}, [canvasComponents, currentFrame, flattenForReorder, setFrameCanvasComponents, pushHistory, actionTypes, componentLibraryService, projectId, setSelectedComponent]);

// 🔥 FIXED: Handle component drag end with proper parent context
const handleComponentDragEnd = useCallback(({ componentId, targetId, intent }) => {
  console.log('🎯 Component drag end:', { componentId, targetId, intent });
  
  const currentComponents = canvasComponents;
  const flatArray = flattenForReorder(currentComponents);
  
  const draggedComp = flatArray.find(c => c.id === componentId);
  const targetComp = flatArray.find(c => c.id === targetId);
  
  if (!draggedComp || !targetComp) {
    console.error('❌ Could not find dragged or target component');
    return;
  }
  
  const draggedParentId = draggedComp.parentId || null;
  const targetParentId = targetComp.parentId || null;
  
  console.log('📍 Parent context:', {
    draggedParentId,
    targetParentId,
    intent,
    sameParent: draggedParentId === targetParentId
  });
  
  // CASE 1: Nesting into a container (or moving to canvas root)
  if (intent === 'inside') {
    console.log('📦 Nesting into container:', targetId);
    
    // 🔥 SPECIAL CASE: Dropping on canvas root - move to root level
    if (targetId === '__canvas_root__') {
      console.log('🎯 Moving to canvas root');
      
      const oldState = { ...draggedComp };
      let updatedTree = removeComponentFromTree(currentComponents, componentId);
      // Add to root level (no parent)
      const movedComp = {
        ...draggedComp,
        parentId: null,
      };
      updatedTree.push(movedComp);
      
      // 🔥 NEW: Create proper undo action
      const action = createMoveComponentAction(
        (updater) => {
          setFrameCanvasComponents(prev => {
            const currentComponents = prev[currentFrame] || [];
            const updatedComponents = typeof updater === 'function' 
              ? updater(currentComponents) 
              : updater;
            
            return {
              ...prev,
              [currentFrame]: updatedComponents
            };
          });
        },
        componentId,
        oldState,
        movedComp
      );
      
      // Apply the move immediately
      setFrameCanvasComponents(prev => ({
        ...prev,
        [currentFrame]: updatedTree
      }));
      
      // Add to undo/redo history
      executeAction(currentFrame, action);
      console.log('✅ Move to canvas root undo action created');
      
      setTimeout(() => {
        if (componentLibraryService?.saveProjectComponents) {
          componentLibraryService.saveProjectComponents(projectId, currentFrame, updatedTree);
        }
      }, 500);
      
      if ('vibrate' in navigator) { try { navigator.vibrate(30); } catch(e) {} }
      return;
    }
    
    // Regular container nesting
    const oldState = { ...draggedComp };
    let updatedTree = removeComponentFromTree(currentComponents, componentId);
    const movedComp = {
      ...draggedComp,
      parentId: targetId,
    };
    updatedTree = addComponentToContainer(updatedTree, targetId, movedComp);
    
    // 🔥 NEW: Create proper undo action
    const action = createMoveComponentAction(
      (updater) => {
        setFrameCanvasComponents(prev => {
          const currentComponents = prev[currentFrame] || [];
          const updatedComponents = typeof updater === 'function' 
            ? updater(currentComponents) 
            : updater;
          
          return {
            ...prev,
            [currentFrame]: updatedComponents
          };
        });
      },
      componentId,
      oldState,
      movedComp
    );
    
    // Apply the move immediately
    setFrameCanvasComponents(prev => ({
      ...prev,
      [currentFrame]: updatedTree
    }));
    
    // Add to undo/redo history
    executeAction(currentFrame, action);
    console.log('✅ Nest into container undo action created');
    
    setTimeout(() => {
      if (componentLibraryService?.saveProjectComponents) {
        componentLibraryService.saveProjectComponents(projectId, currentFrame, updatedTree);
      }
    }, 500);
    
    if ('vibrate' in navigator) { try { navigator.vibrate(30); } catch(e) {} }
    return;
  }
  
  // CASE 2: Reordering within same parent (siblings)
  if (draggedParentId === targetParentId) {
    console.log('↔️ Reordering siblings in same parent:', draggedParentId || 'root');
    
    // 🔥 SPECIAL HANDLING: Canvas root reordering
    if (draggedParentId === null) {
      console.log('🎯 Reordering at canvas root level');
      
      const rootComponents = currentComponents; // These are root-level components
      const draggedRootIndex = rootComponents.findIndex(c => c.id === componentId);
      const targetRootIndex = rootComponents.findIndex(c => c.id === targetId);
      
      if (draggedRootIndex === -1 || targetRootIndex === -1) {
        console.error('❌ Could not find root indices');
        return;
      }
      
      let newRootIndex = targetRootIndex;
      if (intent === 'after') {
        newRootIndex += 1;
      }
      
      // Adjust for removing from array
      if (draggedRootIndex < newRootIndex) {
        newRootIndex -= 1;
      }
      
      console.log('📊 Root reorder:', {
        from: draggedRootIndex,
        to: newRootIndex,
        totalRoot: rootComponents.length
      });
      
      // Reorder root components
      const oldState = { ...draggedComp, sortOrder: draggedRootIndex };
      const reorderedRoot = arrayMove(rootComponents, draggedRootIndex, newRootIndex);
      const movedComp = { ...reorderedRoot.find(c => c.id === componentId), sortOrder: newRootIndex };
      
      // 🔥 NEW: Create proper undo action
      const action = createMoveComponentAction(
        (updater) => {
          setFrameCanvasComponents(prev => {
            const currentComponents = prev[currentFrame] || [];
            const updatedComponents = typeof updater === 'function' 
              ? updater(currentComponents) 
              : updater;
            
            return {
              ...prev,
              [currentFrame]: updatedComponents
            };
          });
        },
        componentId,
        oldState,
        movedComp
      );
      
      // Apply the reorder immediately
      setFrameCanvasComponents(prev => ({
        ...prev,
        [currentFrame]: reorderedRoot
      }));
      
      // Add to undo/redo history
      executeAction(currentFrame, action);
      console.log('✅ Reorder root undo action created');
      
      setTimeout(() => {
        if (componentLibraryService?.saveProjectComponents) {
          componentLibraryService.saveProjectComponents(projectId, currentFrame, reorderedRoot);
        }
      }, 500);
      
      if ('vibrate' in navigator) { try { navigator.vibrate(30); } catch(e) {} }
      return;
    }
    
    // Regular sibling reordering (nested components)
    // Get siblings only (children of same parent)
    const siblings = flatArray.filter(c => (c.parentId || null) === draggedParentId);
    const draggedSiblingIndex = siblings.findIndex(c => c.id === componentId);
    const targetSiblingIndex = siblings.findIndex(c => c.id === targetId);
    
    if (draggedSiblingIndex === -1 || targetSiblingIndex === -1) {
      console.error('❌ Could not find sibling indices');
      return;
    }
    
    let newSiblingIndex = targetSiblingIndex;
    if (intent === 'after') {
      newSiblingIndex += 1;
    }
    
    // Adjust for removing from array
    if (draggedSiblingIndex < newSiblingIndex) {
      newSiblingIndex -= 1;
    }
    
    console.log('📊 Sibling reorder:', {
      from: draggedSiblingIndex,
      to: newSiblingIndex,
      totalSiblings: siblings.length
    });
    
    // Reorder just the siblings
    const reorderedSiblings = arrayMove(siblings, draggedSiblingIndex, newSiblingIndex);
    
    // Update the flat array with new sibling order
    const updatedFlat = flatArray.map(c => {
      if ((c.parentId || null) === draggedParentId) {
        const siblingIndex = reorderedSiblings.findIndex(s => s.id === c.id);
        return siblingIndex !== -1 ? reorderedSiblings[siblingIndex] : c;
      }
      return c;
    });
    
    const updatedTree = rebuildTree(updatedFlat);
    
    setFrameCanvasComponents(prev => ({
      ...prev,
      [currentFrame]: updatedTree
    }));
    
    if (pushHistory && actionTypes) {
      pushHistory(currentFrame, updatedTree, actionTypes.MOVE, {
        componentId,
        action: 'reorder_siblings',
        fromIndex: draggedSiblingIndex,
        toIndex: newSiblingIndex
      });
    }
    
    setTimeout(() => {
      if (componentLibraryService?.saveProjectComponents) {
        componentLibraryService.saveProjectComponents(projectId, currentFrame, updatedTree);
      }
    }, 500);
    
    if ('vibrate' in navigator) { try { navigator.vibrate(30); } catch(e) {} }
    return;
  }
  
  // CASE 3: Moving to different parent (reparenting)
  console.log('🔀 Moving to different parent');
  
  // Determine new parent based on intent and target
  let newParentId;
  if (intent === 'before' || intent === 'after') {
    // Insert as sibling of target (same parent as target)
    newParentId = targetParentId;
  } else {
    newParentId = targetId; // This shouldn't happen (handled in CASE 1)
  }
  
  console.log('🎯 New parent will be:', newParentId || 'root');
  
  // Remove from old location
  let updatedTree = removeComponentFromTree(currentComponents, componentId);
  
  // Update parentId
  const movedComp = {
    ...draggedComp,
    parentId: newParentId,
  };
  
  // Find insertion point in new parent
  if (newParentId === null) {
    // Adding to root
    const rootComponents = updatedTree;
    const targetRootIndex = rootComponents.findIndex(c => c.id === targetId);
    
    if (targetRootIndex !== -1) {
      let insertIndex = targetRootIndex;
      if (intent === 'after') {
        insertIndex += 1;
      }
      rootComponents.splice(insertIndex, 0, movedComp);
      updatedTree = rootComponents;
    } else {
      updatedTree.push(movedComp);
    }
  } else {
    // Adding to a container
    updatedTree = addComponentToContainer(updatedTree, newParentId, movedComp);
    
    // Now reorder within that container to get the right position
    const reorderInContainer = (components) => {
      return components.map(comp => {
        if (comp.id === newParentId && comp.children) {
          const targetChildIndex = comp.children.findIndex(c => c.id === targetId);
          const movedChildIndex = comp.children.findIndex(c => c.id === componentId);
          
          if (targetChildIndex !== -1 && movedChildIndex !== -1) {
            let insertIndex = targetChildIndex;
            if (intent === 'after') {
              insertIndex += 1;
            }
            if (movedChildIndex < insertIndex) {
              insertIndex -= 1;
            }
            
            const reorderedChildren = arrayMove(comp.children, movedChildIndex, insertIndex);
            return {
              ...comp,
              children: reorderedChildren
            };
          }
        }
        
        if (comp.children?.length > 0) {
          return {
            ...comp,
            children: reorderInContainer(comp.children)
          };
        }
        
        return comp;
      });
    };
    
    updatedTree = reorderInContainer(updatedTree);
  }
  
  setFrameCanvasComponents(prev => ({
    ...prev,
    [currentFrame]: updatedTree
  }));
  
  if (pushHistory && actionTypes) {
    pushHistory(currentFrame, updatedTree, actionTypes.MOVE, {
      componentId,
      action: 'reparent',
      fromParent: draggedParentId || 'root',
      toParent: newParentId || 'root'
    });
  }
  
  setTimeout(() => {
    if (componentLibraryService?.saveProjectComponents) {
      componentLibraryService.saveProjectComponents(projectId, currentFrame, updatedTree);
    }
  }, 500);
  
  if ('vibrate' in navigator) { try { navigator.vibrate(30); } catch(e) {} }
}, [currentFrame, canvasComponents, pushHistory, actionTypes, setFrameCanvasComponents, componentLibraryService, projectId, flattenForReorder]);

const renderComponent = useCallback((component, index, parentStyle = {}, depth = 0, parentId = null) => {
  // 🔥 CRITICAL: Use component.style directly WITHOUT modification
  const responsiveStyles = componentLibraryService?.calculateResponsiveStyles 
    ? componentLibraryService.calculateResponsiveStyles(
        component, 
        responsiveMode, 
        canvasDimensions,
        parentStyle
      )
    : component.style;

  const isSelected = selectedComponent === component.id;

  // 🔥 CRITICAL: Pass component with its EXACT styles
  const responsiveComponent = {
    ...component,
    style: responsiveStyles // This already contains flexDirection from parent
  };

  console.log('🎨 renderComponent:', {
    id: component.id,
    type: component.type,
    flexDirection: responsiveComponent.style?.flexDirection,
    allStyleKeys: Object.keys(responsiveComponent.style || {})
  });

  return (
  <DraggableComponent
    key={component.id}
    component={responsiveComponent}
    depth={depth}
    parentId={parentId}
    index={index}
    parentStyle={responsiveStyles}
    responsiveMode={responsiveMode}
    onDragEnd={handleComponentDragEnd}
    setSelectedComponent={setSelectedComponent}  // 🔥 ADD THIS
    setIsCanvasSelected={setIsCanvasSelected}    // 🔥 ADD THIS
      currentFrame={currentFrame}
      canvasComponents={canvasComponents}
      flattenForReorder={flattenForReorder}
      onDragStateChange={({ activeId, position }) => {
        setActiveDragId(activeId);
        setDragPosition(position);
      }}
    />
  );
}, [componentLibraryService, selectedComponent, responsiveMode, canvasDimensions, handleComponentDragEnd, currentFrame, canvasComponents, flattenForReorder]);



  // FIXED reorderWithinContainer helper
  const reorderWithinContainer = (components, containerId, sourceIndex, destIndex) => {
    console.log('Reordering in container:', containerId, 'from', sourceIndex, 'to', destIndex);
    
    const reorder = (comps) => {
      return comps.map(comp => {
        if (comp.id === containerId) {
          const children = Array.from(comp.children || []);
          const [moved] = children.splice(sourceIndex, 1);
          children.splice(destIndex, 0, moved);
          
          console.log('Reordered children:', children.map(c => c.id));
          
          return {
            ...comp,
            children: children.map((child, idx) => ({
              ...child,
              sortOrder: idx,
              zIndex: idx
            }))
          };
        }
        
        if (comp.children?.length > 0) {
          return {
            ...comp,
            children: reorder(comp.children)
          };
        }
        
        return comp;
      });
    };
    
    return reorder(components);
  };
  
  const moveBetweenContainers = (components, componentId, sourceContainerId, destContainerId, sourceIndex, destIndex) => {
    console.log('Moving between containers:', { componentId, sourceContainerId, destContainerId });
    
    let movedComponent = null;
    
    // Remove from source
    const removeFromSource = (comps) => {
      if (sourceContainerId === null) {
        // Remove from root
        [movedComponent] = comps.splice(sourceIndex, 1);
        return comps;
      }
      
      return comps.map(comp => {
        if (comp.id === sourceContainerId) {
          const children = Array.from(comp.children || []);
          [movedComponent] = children.splice(sourceIndex, 1);
          return { ...comp, children };
        }
        
        if (comp.children?.length > 0) {
          return { ...comp, children: removeFromSource(comp.children) };
        }
        
        return comp;
      });
    };
    
    let withoutMoved = removeFromSource(components);
    
    if (!movedComponent) {
      console.error('Could not find component to move:', componentId);
      return components;
    }
    
    console.log('Moved component:', movedComponent.id);
    
    // Add to destination
    const addToDestination = (comps) => {
      if (destContainerId === null) {
        // Add to root
        comps.splice(destIndex, 0, movedComponent);
        return comps;
      }
      
      return comps.map(comp => {
        if (comp.id === destContainerId) {
          const children = Array.from(comp.children || []);
          children.splice(destIndex, 0, movedComponent);
          return { ...comp, children };
        }
        
        if (comp.children?.length > 0) {
          return { ...comp, children: addToDestination(comp.children) };
        }
        
        return comp;
      });
    };
    
    return addToDestination(withoutMoved);
  };

  // Helper functions for default styling (keep these as they are)
  const getDefaultDisplay = (componentType) => {
    const displayMap = {
      'nav': 'flex',
      'header': 'block',
      'main': 'block',
      'section': 'block',
      'footer': 'block',
      'div': 'block',
      'article': 'block',
      'aside': 'block',
      'h1': 'block',
      'h2': 'block',
      'h3': 'block',
      'h4': 'block',
      'h5': 'block',
      'h6': 'block',
      'p': 'block',
      'span': 'inline',
      'a': 'inline',
      'button': 'inline-flex',
      'input': 'block',
      'textarea': 'block',
      'img': 'block',
      'video': 'block',
      'iframe': 'block'
    };
    return displayMap[componentType] || 'block';
  };

  const getDefaultWidth = (componentType) => {
    const widthMap = {
      'section': '100%',
      'header': '100%',
      'main': '100%',
      'footer': '100%',
      'nav': '100%',
      'div': '100%',
      'article': '100%',
      'aside': '300px',
      'button': 'fit-content',
      'input': '100%',
      'textarea': '100%'
    };
    return widthMap[componentType] || 'auto';
  };

  const getDefaultMinHeight = (componentType) => {
    const minHeightMap = {
      'section': '200px',
      'header': '80px',
      'main': '400px',
      'footer': '120px',
      'nav': '60px',
      'div': '50px',
      'article': '200px',
      'aside': '200px',
      'button': '40px',
      'input': '40px',
      'textarea': '80px'
    };
    return minHeightMap[componentType] || 'auto';
  };

  const getDefaultMaxWidth = (componentType) => {
    const maxWidthMap = {
      'button': '300px',
      'input': '500px',
      'textarea': '600px',
      'badge': '200px',
      'avatar': '200px'
    };
    return maxWidthMap[componentType] || 'none';
  };

  const getDefaultPadding = (componentType) => {
    const paddingMap = {
      'section': '48px 24px',
      'header': '24px',
      'main': '48px 24px',
      'footer': '32px 24px',
      'nav': '0 24px',
      'div': '24px',
      'article': '32px',
      'aside': '24px',
      'button': '12px 24px',
      'input': '12px 16px',
      'textarea': '12px 16px'
    };
    return paddingMap[componentType] || '0';
  };

  // Quick action buttons for selected component
  const renderComponentActions = useCallback((component) => {
    if (selectedComponent !== component.id) return null;

    return (
      <div className="absolute -top-8 right-0 flex gap-1 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPropertyUpdate(component.id, 'reset');
          }}
          className="w-6 h-6 rounded flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)'
          }}
          title="Reset styles"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            const newComponent = {
              ...component,
              id: `${component.type}_${Date.now()}`,
              position: { x: component.position.x + 20, y: component.position.y + 20 }
            };
            // Handle duplication
          }}
          className="w-6 h-6 rounded flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)'
          }}
          title="Duplicate"
        >
          <Square className="w-3 h-3" />
        </button>
      </div>
    );
  }, [selectedComponent, onPropertyUpdate]);



  return (
    <div 
      className="relative w-full h-full flex items-start justify-center"
      style={{ 
        backgroundColor: 'transparent',
        position: 'relative',
        zIndex: 1,
    overflow: 'auto',
    overflowX: 'hidden',
        minHeight: '100%',
        padding: '40px 20px', // 🔥 REDUCED padding
      }}
    >
      {/* 🔥 SCALED container - respects viewport */}
      <div 
        className="relative"
        style={{
          transform: `scale(${canvasSize.scale * (forgeCanvasZoom / 100)})`, // 🔥 COMBINED scales
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease-out',
        }}
      >
        {/* Responsive Canvas Container */}
        <div
          className={`relative transition-all duration-500 ease-in-out
            ${isFrameSwitching ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
            ${responsiveMode !== 'desktop' ? 'shadow-2xl' : ''}
          `}
          style={{ 
            width: `${canvasSize.width}px`, // 🔥 EXPLICIT width
            maxWidth: canvasSize.maxWidth,
            height: 'auto',
            minHeight: responsiveMode === 'desktop' ? '600px' : 
                       responsiveMode === 'tablet' ? '700px' : '500px',
            overflow: 'visible', 
            zIndex: 10,
            margin: '0 auto',
          }}
        >
      

{/* Expansion Toggle */}
<div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-40"> 
  <div 
    className="flex items-center gap-3 px-4 py-2 rounded-full shadow-md"
    style={{ 
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
    }}
  >
    <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
      Canvas Expansion
    </span>
    
      <button
        onClick={() => {
          const { toggleCanvasExpansion } = useForgeStore.getState();
          toggleCanvasExpansion();
        }}
        className="relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none"
        style={{
          backgroundColor: canvasExpansionEnabled // 🔥 Now uses the hook value
            ? 'var(--color-primary)' 
            : '#d1d5db'
        }}
      >
        <span
          className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200"
          style={{
            transform: canvasExpansionEnabled // 🔥 Now uses the hook value
              ? 'translateX(24px)' 
              : 'translateX(4px)'
          }}
        />
      </button>
      
      <span className="text-xs font-medium" style={{ 
        color: canvasExpansionEnabled // 🔥 Now uses the hook value
          ? 'var(--color-primary)' 
          : 'var(--color-text-muted)' 
      }}>
        {canvasExpansionEnabled ? 'Enabled' : 'Disabled'} {/* 🔥 Now uses the hook value */}
      </span>
  </div>
</div>



      
      
      
        {/* Device Info Label */}
        <div className="absolute -top-15 left-1/2 transform -translate-x-1/2 z-40">
          <div 
            className="px-3 py-1 rounded-full text-xs flex items-center gap-2 font-medium"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {responsiveMode === 'mobile' ? <Smartphone className="w-6 h-1" /> : 
             responsiveMode === 'tablet' ? <Tablet className="w-5 h-2" /> : 
             <Monitor className="w-3 h-3" />}
            {canvasSize.deviceName} ({canvasSize.width}×{canvasSize.height})
            {zoomLevel !== 100 && <span> {zoomLevel}%</span>}
            <span className="text-green-500"> {responsiveMode}</span>
          </div>
        </div>
      
      
        {/* Device-Specific Browser Frame */}
        {responsiveMode === 'desktop' && (
          /* MacBook-Style Browser Tab Frame */
          <div 
            className="relative mt-44 mb-0 rounded-t-xl overflow-hidden pointer-events-none"
            style={{
              backgroundColor: '#f5f5f7',
              border: '1px solid #d1d5db',
              borderBottom: 'none'
            }}
          >
            {/* Tab Bar */}
            <div 
              className="flex items-center px-4 py-2 border-b"
              style={{ 
                backgroundColor: '#e5e7eb',
                borderBottomColor: '#d1d5db'
              }}
            >
              {/* Traffic Light Buttons */}
              <div className="flex items-center gap-2 mr-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              
              {/* Active Tab */}
              <div 
                className="flex items-center gap-2 px-4 py-1 rounded-t-lg relative"
                style={{ 
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid #d1d5db',
                  borderBottom: 'none',
                  minWidth: '200px'
                }}
              >
                {/* Tab Favicon */}
                <div className="w-4 h-4 rounded-sm flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                  D
                </div>
                
                {/* Tab Title */}
                <span className="text-sm font-medium flex-1 truncate" style={{ color: 'var(--color-text)' }}>
                  DeCode - {currentFrame} ({responsiveMode})
                </span>
                
                {/* Tab Close Button */}
                <div className="w-4 h-4 rounded-sm flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              
              {/* New Tab Button */}
              <div className="ml-2 w-8 h-8 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              
              {/* Browser Controls */}
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <div className="w-6 h-6 rounded flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="w-6 h-6 rounded flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Address Bar */}
            <div className="flex items-center px-4 py-2 gap-3">
              {/* Security Icon */}
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* Address Bar Input */}
              <div 
                className="flex-1 px-3 py-1 rounded-md text-sm flex items-center gap-2"
                style={{ 
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  color: '#6b7280'
                }}
              >
                <span>https://</span>
                <span style={{ color: 'var(--color-text)' }}>decode.app/forge/{currentFrame}</span>
                <div className="ml-auto flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
              
              {/* Profile Avatar */}
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
                  U
                </div>
              </div>
            </div>
          </div>
        )}

        {responsiveMode === 'tablet' && (
          /* iPad-Style Safari Frame */
          <div 
            className="relative mb-0 rounded-t-2xl overflow-hidden pointer-events-none"
            style={{
              backgroundColor: '#f2f2f7',
              border: '1px solid #d1d5db',
              borderBottom: 'none'
            }}
          >
            {/* Safari Address Bar */}
            <div 
              className="flex items-center px-4 py-3 gap-3"
              style={{ 
                backgroundColor: '#ffffff',
                borderBottomColor: '#d1d5db'
              }}
            >
              {/* Navigation Buttons */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              {/* Address Bar */}
              <div 
                className="flex-1 mx-4 px-4 py-2 rounded-full text-sm flex items-center gap-2"
                style={{ 
                  backgroundColor: '#f2f2f7',
                  border: '1px solid #e5e5ea'
                }}
              >
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span style={{ color: 'var(--color-text)' }}>decode.app/forge/{currentFrame}</span>
                <div className="ml-auto">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
              
              {/* Share Button */}
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
            </div>
          </div>
        )}
        
        {responsiveMode === 'mobile' && (
          /* iPhone-Style Safari Frame */
          <div 
            className="relative mb-0 overflow-hidden pointer-events-none"
            style={{
              backgroundColor: '#f2f2f7',
              borderTopLeftRadius: '1rem',
              borderTopRightRadius: '1rem',
              border: '1px solid #d1d5db',
              borderBottom: 'none'
            }}
          >
            {/* Safari Address Bar */}
            <div 
              className="flex items-center px-3 py-2 gap-2"
              style={{ 
                backgroundColor: '#ffffff'
              }}
            >
              {/* Address Bar Input */}
              <div 
                className="flex-1 px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                style={{ 
                  backgroundColor: '#f2f2f7',
                  border: '1px solid #e5e5ea'
                }}
              >
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-xs truncate" style={{ color: 'var(--color-text)' }}>decode.app</span>
                <div className="ml-auto">
                  <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
              
              {/* Menu Button */}
              <div className="w-6 h-6 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </div>
            </div>
          </div>
        )}
        
        {/* Device Frame for Mobile/Tablet */}
        {responsiveMode !== 'desktop' && (
          <div 
            className="absolute -inset-4 rounded-[2rem] shadow-2xl border-8 pointer-events-none"
            style={{ 
              borderColor: '#1f2937',
              backgroundColor: '#111827'
            }}
          >
            {/* Device notch for mobile */}
            {responsiveMode === 'mobile' && (
              <div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 rounded-b-xl"
                style={{ backgroundColor: '#111827' }}
              />
            )}
     
                  
            {/* Mobile/Tablet Browser Tabs at top of device frame */}
            {responsiveMode === 'tablet' && (
              <div 
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-1"
                style={{ width: 'calc(100% - 32px)' }}
              >
         
                
              </div>
            )}
        
            {responsiveMode === 'mobile' && (
              <div 
                className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex items-center gap-0.5"
                style={{ width: 'calc(100% - 24px)' }}
              >
                
              </div>
            )}
          </div>
        )}
        
     {/* Main Canvas - Page: Document Body / Component: Simple Container */}

<div 
  ref={canvasRef}
  data-component-id={frame?.type === 'component' ? null : "__canvas_root__"}
  data-component-type={frame?.type === 'component' ? 'component-canvas' : 'canvas'}
  className={`
    relative transition-all duration-500
    ${canvasClasses}
    ${isFrameSwitching ? 'opacity-50 pointer-events-none' : ''}
    ${dragState.isDragging ? 'overflow-visible' : ''}
    ${frame?.type === 'page' && selectedComponent === '__canvas_root__' ? 'ring-2 ring-blue-500' : ''}
  `}
  style={{
    // ✅ Components: Flexible size with transparent grid
    // ✅ Pages: Fixed responsive sizes with body styles
    ...(frame?.type === 'component' ? {
      width: '100%',
      minHeight: '400px',
      backgroundColor: 'transparent',
      backgroundImage: `
        linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
        linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
        linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)
      `,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      padding: '20px',
      overflow: 'visible',
    } : {
      ...getCanvasRootStyles(),
      width: responsiveMode === 'desktop' ? '1440px' : 
             responsiveMode === 'tablet' ? '768px' : '375px',
      height: canvasExpansionEnabled 
        ? 'auto' 
        : (responsiveMode === 'desktop' ? '900px' : 
           responsiveMode === 'tablet' ? '1024px' : '667px'),
      minHeight: responsiveMode === 'desktop' ? '900px' : 
                 responsiveMode === 'tablet' ? '1024px' : '667px',
      maxHeight: canvasExpansionEnabled ? 'none' : (
        responsiveMode === 'desktop' ? '900px' : 
        responsiveMode === 'tablet' ? '1024px' : '667px'
      ),
      overflow: canvasExpansionEnabled ? 'visible' : 'auto',
      overflowX: 'hidden',
      borderRadius: responsiveMode !== 'desktop' ? '1rem' : '0',
    }),
    
    cursor: dragState.isDragging ? 'copy' : 'default',
    isolation: 'isolate',
  }}
  
  onDragOver={onCanvasDragOver}
  onDrop={onCanvasDrop}
  onClick={(e) => {
  if (isPreviewMode) return;
  
  // Let handleSmartClick handle ALL clicks
  handleSmartClick(e);
}}
  // 🔥 NEW: Track cursor movement for real-time collaboration
  onMouseMove={(e) => {
    if (isPreviewMode || !updateCursor) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    updateCursor(x, y, responsiveMode, { isTouch: false });
  }}
  onTouchMove={(e) => {
    if (isPreviewMode || !updateCursor || e.touches.length === 0) return;
    
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    updateCursor(x, y, responsiveMode, { isTouch: true });
  }}
  onMouseLeave={() => {
    // Optional: Remove cursor when leaving canvas
    // Could call a removeCursor function here if implemented
  }}
  onTouchEnd={() => {
    // Optional: Remove cursor when touch ends
  }}
>
    {/* 🔥 Viewport Boundary Indicator */}
  {/*  <ViewportBoundaryIndicator 
          responsiveMode={responsiveMode} 
          canvasRef={canvasRef}
        /> */}
  
  
         {/* Grid Lines - Only show if enabled */}
          {isOverlayEnabled('showGridLines') && gridVisible && (
              <div 
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{
                      backgroundImage: `
                          linear-gradient(to right, var(--color-border) 1px, transparent 1px),
                          linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px'
                  }}
              />
          )}
          
         {/* Drag Snap Lines - Only show if enabled */}
        {DragSnapLines && dragPosition && isOverlayEnabled('showSnapGuides') && (
          <DragSnapLines
            dragPosition={dragPosition}
            canvasComponents={canvasComponents}
            canvasRef={canvasRef}
            isDragging={isDraggingComponent || dragState.isDragging || !!activeDragId} // 🔥 Use activeDragId
            draggedComponentId={activeDragId || selectedComponent} // 🔥 Pass dragged ID
            ghostBounds={dragState.draggedComponent?.ghostBounds} // 🔥 ADD: Pass ghost bounds
          />
        )}
          



          {SelectionOverlay && selectedComponent === '__canvas_root__' && !activeDragId && (
            <SelectionOverlay
              componentId="__canvas_root__"
              canvasRef={canvasRef}
              isCanvasSelection={true}
              showSpacing={isOverlayEnabled('showSpacingIndicators')}
              // 🔥 ADD THIS:
              onComponentClick={onComponentClick}
            />
          )}
          
         {SelectionOverlay && selectedComponent && selectedComponent !== '__canvas_root__' && !activeDragId && (
            <SelectionOverlay
              componentId={selectedComponent}
              canvasRef={canvasRef}
              canvasComponents={canvasComponents}
              selectedComponent={canvasComponents.find(c => c.id === selectedComponent)}
              showSpacing={isOverlayEnabled('showSpacingIndicators')}
              showSelectionBorders={isOverlayEnabled('showSelectionBorders')}
              onComponentClick={onComponentClick}
                            // 🔥 CRITICAL: Pass active drag state
              isDragging={!!activeDragId && selectedComponent === activeDragId}
              draggedComponent={activeDragId === selectedComponent ? canvasComponents.find(c => c.id === activeDragId) : null}
              dragTransform={activeDragId === selectedComponent ? { x: 0, y: 0 } : null}
            />
          )}
                    
          {/* Drop Zone Indicator */}
          {dragState.isDragging && canvasComponents.length === 0 && (
            <div 
              className="absolute inset-0 border-4 border-dashed flex items-center justify-center z-50"
              style={{ 
                borderColor: 'var(--color-primary)',
                backgroundColor: 'rgba(160, 82, 255, 0.05)',
                backdropFilter: 'blur(2px)',
                borderRadius: responsiveMode !== 'desktop' ? '1rem' : '0'
              }}
            >
              <div 
                className="font-medium text-lg px-6 py-3 rounded-xl"
                style={{ 
                  color: 'var(--color-primary)',
                  backgroundColor: 'var(--color-surface)',
                  border: '4px solid var(--color-primary)',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                Drop {dragState.draggedComponent?.name || 'component'} here
              </div>
            </div>
          )}

          {/* Render Components with Drag-to-Reorder */}
          <div className="relative z-10" style={{ minHeight: '100%' }}>
            {canvasComponents.length === 0 && !dragState.isDragging ? (
              <EmptyCanvasState
                frameType={frameType}
                onAddSection={() => {
                  const sectionComponent = componentLibraryService?.createLayoutElement('section');
                  if (sectionComponent && onPropertyUpdate) {
                    onPropertyUpdate('canvas', [...canvasComponents, sectionComponent]);
                  }
                }}
                onDragOver={onCanvasDragOver}
                onDrop={onCanvasDrop}
                isDragOver={dragState.isDragging}
                responsiveMode={responsiveMode}
                frame={frame}
              />
            ) : (
              <>
              {/* 🔥 NEW: Custom drag system - no DndContext wrapper needed */}
              {/* 🔥 Project CSS Variables Wrapper - isolates project theme from UI controls */}
              <div 
                ref={contentWrapperRef}
                style={getProjectCSSVariables()}
              >
                {canvasComponents.map((component, index) => 
                  renderComponent(component, index, {}, 0)
                )}
              </div>
              
              {/* 🔥 NEW: Quick Add Section/Element at Bottom */}
      <div className="flex justify-center py-8">
        <button
          onClick={() => {
            // ✅ Add section for pages, div for components
            const elementType = frame?.type === 'component' ? 'div' : 'section';
            const newComponent = componentLibraryService?.createLayoutElement(elementType);
            if (newComponent) {
              const updatedComponents = [...canvasComponents, newComponent];
              setFrameCanvasComponents(prev => ({
                ...prev,
                [currentFrame]: updatedComponents
              }));
              setSelectedComponent(newComponent.id);
              
              // Scroll to bottom to show new element
              setTimeout(() => {
                canvasRef.current?.scrollTo({
                  top: canvasRef.current.scrollHeight,
                  behavior: 'smooth'
                });
              }, 100);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 shadow-md"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-primary)',
            border: '2px dashed var(--color-primary)',
          }}
        >
          <Square className="w-4 h-4" />
          {frame?.type === 'component' ? 'Add Element' : 'Add Section'}
        </button>
      </div>
      
      </>
            )}
          </div>

    
        </div>
              {/* Status Bar */}
          {canvasComponents.length > 0 && (
            <div className="absolute -bottom-32 left-1/2 transform -translate-x-1/2">
              <div 
                className="inline-flex items-center gap-4 text-sm px-4 py-2 rounded-full shadow-lg backdrop-blur-sm"
                style={{ 
                  color: 'var(--color-text-muted)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <span>{canvasComponents.length} components</span>
                {selectedComponent && (
                  <span style={{ color: 'var(--color-primary)' }}>
                    {canvasComponents.find(c => c.id === selectedComponent)?.name || 'Selected'} 
                    • {canvasComponents.find(c => c.id === selectedComponent)?.style?.display || 'block'}
                  </span>
                )}
                
              </div>
            </div>
          )}
      </div>
      </div>
    </div>
  );
};

export default CanvasComponent;