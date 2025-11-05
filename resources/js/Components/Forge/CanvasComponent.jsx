// @/Components/Forge/CanvasComponent.jsx - Enhanced for True Responsive Canvas Sizing
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Square, Sparkles, Monitor, Tablet, Smartphone, Move, RotateCcw, GripVertical } from 'lucide-react';

import SectionDropZone from './SectionDropZone';
import EmptyCanvasState from './EmptyCanvasState';
import SelectionOverlay from './SelectionOverlay';
import DragSnapLines from './DragSnapLines';

import { useEditorStore } from '@/stores/useEditorStore';
import { useForgeStore } from '@/stores/useForgeStore';
import { useForgeUndoRedoStore } from '@/stores/useForgeUndoRedoStore';
import { useCanvasOverlayStore } from '@/stores/useCanvasOverlayStore';

import { 
  DndContext, 
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const CanvasComponent = ({
  canvasRef,
  canvasComponents,
  selectedComponent,
  dragState,
  dragPosition,
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
  frame,  // 🔥 ADD THIS
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
  

  // 🔥 ADD this after the store hooks
  const isPreviewMode = interactionMode === 'preview';
  
  const { overlays, isOverlayEnabled } = useCanvasOverlayStore();
  
  // Get undo/redo functionality
  const { pushHistory, actionTypes } = useForgeUndoRedoStore();

  // Local state for canvas interactions
  const [isDraggingComponent, setIsDraggingComponent] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingComponent, setResizingComponent] = useState(null);
  
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [draggedComponent, setDraggedComponent] = useState(null);

  // Get responsive device info and dimensions
  const deviceInfo = getResponsiveDeviceInfo();
  const scaleFactor = getResponsiveScaleFactor();
  const canvasClasses = getResponsiveCanvasClasses();
  const canvasDimensions = getCurrentCanvasDimensions();

   const getCanvasSize = () => {
    // 🔥 FIXED: Responsive sizes that fit in viewport
    switch (responsiveMode) {
      case 'mobile':
        return {
          width: 375,
          height: 667,
          maxWidth: '375px',
          deviceName: 'iPhone SE'
        };
      case 'tablet':
        return {
          width: 768,
          height: 1024,
          maxWidth: '768px',
          deviceName: 'iPad'
        };
      case 'desktop':
      default:
        return {
          width: 1440,
          height: 900,
          maxWidth: '100%', // 🔥 CRITICAL: Fit container
          deviceName: 'Desktop'
        };
    }
  };

  const canvasSize = getCanvasSize();
  



const getCanvasRootStyles = () => {
  const canvasStyle = frame?.canvas_style || {};
  
  const baseDimensions = {
    mobile: {
      width: '375px',
      height: canvasExpansionEnabled ? 'auto' : '667px',
      minHeight: '667px',
      maxHeight: 'none',
    },
    tablet: {
      width: '768px',
      height: canvasExpansionEnabled ? 'auto' : '1024px',
      minHeight: '1024px',
      maxHeight: 'none',
    },
    desktop: {
      width: '100%', // 🔥 CHANGED from '1440px'
      maxWidth: '1440px', // 🔥 ADD constraint
      height: canvasExpansionEnabled ? 'auto' : '900px',
      minHeight: '600px', // 🔥 REDUCED from 900px
      maxHeight: 'none',
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
    overflow: 'visible', // 🔥 CHANGED: Always visible
    position: 'relative',
    boxSizing: 'border-box',
    padding: canvasStyle.padding || '0px',
    paddingBottom: canvasExpansionEnabled ? '80px' : '0px', // 🔥 ADD: Extra padding at bottom
    margin: '0px',
    display: 'block',
    transformOrigin: 'top center',
    transform: `scale(${forgeCanvasZoom / 100})`,
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


  
  // Configure dnd-kit sensors with better touch response
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced from 5 for faster response
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,        // Reduced delay for faster touch response
        tolerance: 12,     // Increased tolerance for finger movement
      },
    })
  );

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
  
  // Handle component direct manipulation (drag, resize)
  const handleComponentMouseDown = useCallback((e, componentId) => {
    e.stopPropagation();
    
    const component = canvasComponents.find(c => c.id === componentId);
    if (!component) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    setIsDraggingComponent(componentId);
    setDragOffset({
      x: e.clientX - (component.position.x + canvasRect.left),
      y: e.clientY - (component.position.y + canvasRect.top)
    });

    // Select component
    onComponentClick(componentId, e);

    let hasMoved = false;
    const initialPosition = { ...component.position };
    
    const handleMouseMove = (moveEvent) => {
      const newX = moveEvent.clientX - canvasRect.left - dragOffset.x;
      const newY = moveEvent.clientY - canvasRect.top - dragOffset.y;
      
      // Constrain to canvas bounds - use actual canvas size for responsive modes
      const maxWidth = responsiveMode === 'desktop' ? canvasRect.width - 100 : canvasSize.width - 100;
      const maxHeight = responsiveMode === 'desktop' ? canvasRect.height - 50 : 600; // Reasonable constraint for mobile/tablet
      
      const constrainedX = Math.max(0, Math.min(newX, maxWidth));
      const constrainedY = Math.max(0, Math.min(newY, maxHeight));
      
      // Check if actually moved significantly
      const deltaX = Math.abs(constrainedX - initialPosition.x);
      const deltaY = Math.abs(constrainedY - initialPosition.y);
      
      if (deltaX > 1 || deltaY > 1) {
        hasMoved = true;
      }
      
      onPropertyUpdate(componentId, 'position', { x: constrainedX, y: constrainedY });
    };
    
    const handleMouseUp = () => {
      setIsDraggingComponent(false);
      
      if (hasMoved && currentFrame && pushHistory && actionTypes) {
        const finalPosition = canvasComponents.find(c => c.id === componentId)?.position;
        if (finalPosition) {
          pushHistory(currentFrame, canvasComponents, actionTypes.MOVE, {
            componentName: component.name || component.type,
            componentId,
            initialPosition,
            finalPosition
          });
        }
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [canvasComponents, dragOffset, onPropertyUpdate, onComponentClick, responsiveMode, canvasSize, currentFrame, pushHistory, actionTypes]);
  
  
  
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





const handleDndDragStart = useCallback((event) => {
  if (isPreviewMode) return; 
  const { active } = event;
  setActiveId(active.id);
  
  const component = flatComponents.find(c => c.id === active.id);
  setDraggedComponent(component);
  
  if (!active.data.current) {
    active.data.current = {};
  }
  active.data.current.activatorEvent = event.activatorEvent;
  
  // 🔥 ENHANCED: Completely hide element and overlays during drag
  const element = document.querySelector(`[data-component-id="${active.id}"]`);
  if (element) {
    element.style.visibility = 'hidden';
    element.style.pointerEvents = 'none';
    element.style.opacity = '0';
    
    const childElements = element.querySelectorAll('[data-component-id]');
    childElements.forEach(child => {
      child.style.visibility = 'hidden';
      child.style.opacity = '0';
    });
  }
  
  // 🔥 NEW: Hide selection overlay
  window.dispatchEvent(new CustomEvent('element-drag-start', { 
    detail: { componentId: active.id } 
  }));
  
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
  
  canvasComponents.forEach(comp => {
    if (comp.id !== active.id) {
      const el = document.querySelector(`[data-component-id="${comp.id}"]`);
      if (el) {
        el.style.opacity = '0.6';
        el.style.transition = 'opacity 0.2s';
      }
    }
  });
}, [isPreviewMode, flatComponents, canvasComponents]);





const handleDndDragOver = useCallback((event) => {
  const { active, over } = event;
  
  // 🔥 CRITICAL: Clear ALL previous feedback first
  document.querySelectorAll('.drag-over-layout, .drop-zone-active, [data-drop-intent]').forEach(el => {
    el.classList.remove('drag-over-layout', 'drop-zone-active');
    el.style.backgroundColor = '';
    el.style.border = '';
    el.style.borderTop = '';
    el.style.borderBottom = '';
    el.style.boxShadow = '';
    el.removeAttribute('data-drop-intent');
  });
  
  if (over) {
    const targetElement = document.querySelector(`[data-component-id="${over.id}"]`);
    const isTargetLayout = targetElement?.getAttribute('data-is-layout') === 'true';
    
    // 🔥 SMART DROP DETECTION: Check mouse position relative to element
    if (isTargetLayout && targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const mouseX = event.activatorEvent?.clientX || event.active.rect.current.translated?.left || rect.left;
      const mouseY = event.activatorEvent?.clientY || event.active.rect.current.translated?.top || rect.top;
      
      // Calculate relative position within target
      const relativeX = mouseX - rect.left;
      const relativeY = mouseY - rect.top;
      
      // Calculate drop zones (30% top/bottom for before/after, 40% middle for inside)
      const topZone = rect.height * 0.3;
      const bottomStart = rect.height * 0.7;
      
      setOverId(over.id);
      targetElement.classList.add('drag-over-layout');
      
      // Determine drop intent
      if (relativeY < topZone) {
        // DROP BEFORE
        targetElement.style.borderTop = '3px solid #3b82f6';
        targetElement.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
        targetElement.setAttribute('data-drop-intent', 'before');
        console.log('🎯 Drop intent: BEFORE', over.id);
      } else if (relativeY > bottomStart) {
        // DROP AFTER
        targetElement.style.borderBottom = '3px solid #3b82f6';
        targetElement.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
        targetElement.setAttribute('data-drop-intent', 'after');
        console.log('🎯 Drop intent: AFTER', over.id);
      } else {
        // DROP INSIDE (middle zone)
        targetElement.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
        targetElement.style.border = '3px solid #10b981';
        targetElement.style.boxShadow = 'inset 0 0 20px rgba(16, 185, 129, 0.2)';
        targetElement.setAttribute('data-drop-intent', 'inside');
        console.log('🎯 Drop intent: INSIDE', over.id);
      }
      
      // 🔥 CRITICAL: Ensure pointer events work
      targetElement.style.pointerEvents = 'auto';
      
      return; // Exit early for layout elements
    }
  }
  
  setOverId(null);
}, []);





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




  
const handleDndDragEnd = useCallback((event) => {

  
  const { active, over } = event;
  
  // 🔥 ENHANCED: Immediately restore visibility
const restoreElements = () => {
  if (activeId) {
    const element = document.querySelector(`[data-component-id="${activeId}"]`);
    if (element) {
      element.style.opacity = '1';
      element.style.pointerEvents = '';
      element.style.visibility = 'visible';
      element.style.transform = '';
      
      const childElements = element.querySelectorAll('[data-component-id]');
      childElements.forEach(child => {
        child.style.visibility = 'visible';
        child.style.opacity = '1';
      });
    }
  }
  
  canvasComponents.forEach(comp => {
    const el = document.querySelector(`[data-component-id="${comp.id}"]`);
    if (el) {
      el.style.opacity = '';
      el.style.transition = '';
      el.style.transform = '';
    }
  });
  
  // 🔥 NEW: Notify overlays to show again
  window.dispatchEvent(new CustomEvent('element-drag-end', { 
    detail: { componentId: activeId } 
  }));
};

restoreElements(); // Call immediately at start of function
  
  
  setActiveId(null);
  setOverId(null);
  setDraggedComponent(null);

  if (!over) {
    console.log('❌ No drop target - dropping at root level');
    
    // 🔥 NEW: Allow dropping at root when no target
    const draggedComp = flatComponents.find(c => c.id === active.id);
    if (draggedComp) {
      // Remove from current position and add to root
      const removeFromTree = (components, idToRemove) => {
        return components.reduce((acc, comp) => {
          if (comp.id === idToRemove) {
            return acc; // Skip this component (will be added to root)
          }
          
          if (comp.children?.length > 0) {
            return [...acc, {
              ...comp,
              children: removeFromTree(comp.children, idToRemove)
            }];
          }
          
          return [...acc, comp];
        }, []);
      };
      
      let updatedTree = removeFromTree(canvasComponents, active.id);
      
      // Add to root with default position
      const rootPosition = {
        x: dragPosition?.x || 100,
        y: dragPosition?.y || 100
      };
      
      updatedTree = [
        ...updatedTree,
        {
          ...draggedComp,
          parentId: null,
          position: rootPosition
        }
      ];
      
      setFrameCanvasComponents(prev => ({
        ...prev,
        [currentFrame]: updatedTree
      }));
      
      if (pushHistory && actionTypes) {
        pushHistory(currentFrame, updatedTree, actionTypes.MOVE, {
          componentId: active.id,
          action: 'moved_to_root',
          position: rootPosition
        });
      }
      
      setTimeout(() => {
        if (componentLibraryService?.saveProjectComponents) {
          componentLibraryService.saveProjectComponents(projectId, currentFrame, updatedTree);
        }
      }, 500);
    }
    
    document.body.classList.remove('dragging');
    return;
  }
  
  
  
  const draggedComp = flatComponents.find(c => c.id === active.id);
  const targetComp = flatComponents.find(c => c.id === over.id);
  
  console.log('🎯 Drag end:', {
    dragged: draggedComp?.name,
    target: targetComp?.name,
    targetIsLayout: targetComp?.isLayoutContainer,
    draggedParent: draggedComp?.parentId,
    targetParent: targetComp?.parentId
  });

 

  // 🔥 CRITICAL: Read drop intent from target element
  const targetElement = document.querySelector(`[data-component-id="${over.id}"]`);
  const dropIntent = targetElement?.getAttribute('data-drop-intent') || 'auto';
  
  console.log('🎯 Drop intent:', dropIntent);
  
  // Clean up visual feedback
  document.querySelectorAll('.drag-over-layout').forEach(el => {
    el.classList.remove('drag-over-layout');
    el.style.backgroundColor = '';
    el.style.border = '';
    el.style.borderTop = '';
    el.style.borderBottom = '';
    el.style.boxShadow = '';
    el.removeAttribute('data-drop-intent');
  });

  // 🔥 SMART NESTING: Use drop intent
  const shouldNest = (() => {
    if (!targetComp || draggedComp?.id === targetComp?.id) return false;
    
    const isTargetLayout = targetElement?.getAttribute('data-is-layout') === 'true';
    
    // 🔥 EXPLICIT INTENT: Only nest if intent is "inside"
    if (dropIntent === 'inside' && isTargetLayout) {
      const isDifferentParent = draggedComp?.parentId !== targetComp?.id;
      const isCircular = isDescendant(targetComp.id, draggedComp.id, canvasComponents);
      
      console.log('🔍 Nest check (intent-based):', {
        target: targetComp.name,
        isLayout: isTargetLayout,
        isDifferentParent,
        isCircular,
        shouldNest: isDifferentParent && !isCircular
      });
      
      return isDifferentParent && !isCircular;
    }
    
    return false;
  })();

  if (shouldNest) {
    console.log('📦 Nesting into container:', targetComp.name);
    
    // Remove from current position
    const removeFromTree = (components, idToRemove) => {
      return components.reduce((acc, comp) => {
        if (comp.id === idToRemove) {
          return acc;
        }
        
        if (comp.children?.length > 0) {
          return [...acc, {
            ...comp,
            children: removeFromTree(comp.children, idToRemove)
          }];
        }
        
        return [...acc, comp];
      }, []);
    };
    
    // Add to target container
    const addToContainer = (components, containerId, childToAdd) => {
      return components.map(comp => {
        if (comp.id === containerId) {
          return {
            ...comp,
            children: [
              {
                ...childToAdd,
                parentId: comp.id,
                position: { x: 20, y: 20 }
              },
              ...(comp.children || [])
            ]
          };
        }
        
        if (comp.children?.length > 0) {
          return {
            ...comp,
            children: addToContainer(comp.children, containerId, childToAdd)
          };
        }
        
        return comp;
      });
    };
    
    let updatedTree = removeFromTree(canvasComponents, active.id);
    updatedTree = addToContainer(updatedTree, over.id, draggedComp);
    
    setFrameCanvasComponents(prev => ({
      ...prev,
      [currentFrame]: updatedTree
    }));
    
    if (pushHistory && actionTypes) {
      pushHistory(currentFrame, updatedTree, actionTypes.MOVE, {
        componentId: active.id,
        action: 'nested_into_container',
        containerId: over.id
      });
    }
    
    setTimeout(() => {
      if (componentLibraryService?.saveProjectComponents) {
        componentLibraryService.saveProjectComponents(projectId, currentFrame, updatedTree);
      }
    }, 500);
    
    document.body.classList.remove('dragging');
    
    // 🔥 Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]); // Success pattern
    }
    
    return;
  }

  // 🔥 SIBLING PLACEMENT: Handle "before" and "after" intents
  if (dropIntent === 'before' || dropIntent === 'after') {
    console.log(`↔️ Placing ${dropIntent === 'before' ? 'BEFORE' : 'AFTER'} sibling:`, targetComp.name);
    
    const oldIndex = flatComponents.findIndex(c => c.id === active.id);
    let targetIndex = flatComponents.findIndex(c => c.id === over.id);
    
    // Adjust index based on intent
    if (dropIntent === 'after') {
      targetIndex += 1;
    }
    
    if (oldIndex === -1 || targetIndex === -1) {
      document.body.classList.remove('dragging');
      return;
    }
    
    const arrayMove = (array, from, to) => {
      const newArray = [...array];
      const [movedItem] = newArray.splice(from, 1);
      newArray.splice(to, 0, movedItem);
      return newArray;
    };
    
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

    const reorderedFlat = arrayMove(flatComponents, oldIndex, targetIndex);
    const reorderedTree = rebuildTree(reorderedFlat);

    setFrameCanvasComponents(prev => ({
      ...prev,
      [currentFrame]: reorderedTree
    }));

    if (pushHistory && actionTypes) {
      pushHistory(currentFrame, reorderedTree, actionTypes.MOVE, {
        componentId: active.id,
        fromIndex: oldIndex,
        toIndex: targetIndex,
        intent: dropIntent
      });
    }

    setTimeout(() => {
      if (componentLibraryService?.saveProjectComponents) {
        componentLibraryService.saveProjectComponents(projectId, currentFrame, reorderedTree);
      }
    }, 500);
    
    document.body.classList.remove('dragging');
    
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
    
    return;
  }

  // 🔥 DEFAULT: Standard sibling reordering (existing logic)
  const oldIndex = flatComponents.findIndex(c => c.id === active.id);
  const newIndex = flatComponents.findIndex(c => c.id === over.id);

  if (oldIndex === -1 || newIndex === -1) {
    document.body.classList.remove('dragging');
    return;
  }

  console.log('↔️ Default reordering:', active.id, 'from', oldIndex, 'to', newIndex);

  const arrayMove = (array, from, to) => {
    const newArray = [...array];
    const [movedItem] = newArray.splice(from, 1);
    newArray.splice(to, 0, movedItem);
    return newArray;
  };

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

  const reorderedFlat = arrayMove(flatComponents, oldIndex, newIndex);
  const reorderedTree = rebuildTree(reorderedFlat);

  setFrameCanvasComponents(prev => ({
    ...prev,
    [currentFrame]: reorderedTree
  }));

  if (pushHistory && actionTypes) {
    pushHistory(currentFrame, reorderedTree, actionTypes.MOVE, {
      componentId: active.id,
      fromIndex: oldIndex,
      toIndex: newIndex
    });
  }

  setTimeout(() => {
    if (componentLibraryService?.saveProjectComponents) {
      componentLibraryService.saveProjectComponents(projectId, currentFrame, reorderedTree);
    }
  }, 500);
  
  document.body.classList.remove('dragging');

  if ('vibrate' in navigator) {
    navigator.vibrate(30);
  }
  
}, [flatComponents, currentFrame, projectId, componentLibraryService, pushHistory, actionTypes, setFrameCanvasComponents, activeId, canvasComponents, dragPosition, isDescendant]);


 const handleDndDragCancel = useCallback(() => {
  if (activeId) {
    const element = document.querySelector(`[data-component-id="${activeId}"]`);
    if (element) {
      element.style.opacity = '1';
      element.style.pointerEvents = '';
      element.style.visibility = 'visible';
      
      const childElements = element.querySelectorAll('[data-component-id]');
      childElements.forEach(child => {
        child.style.visibility = 'visible';
        child.style.opacity = '1';
      });
    }
  }
  
  canvasComponents.forEach(comp => {
    const el = document.querySelector(`[data-component-id="${comp.id}"]`);
    if (el) {
      el.style.opacity = '';
      el.style.transition = '';
    }
  });
  
  // 🔥 NEW: Notify overlays
  window.dispatchEvent(new CustomEvent('element-drag-end', { 
    detail: { componentId: activeId } 
  }));
  
  setActiveId(null);
  setOverId(null);
  setDraggedComponent(null);
  document.body.classList.remove('dragging');
}, [activeId, canvasComponents]);
  
  
  
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
  
  
  
  
  
// 🔥 ENHANCED: Smart click handler that prioritizes deepest child
const handleSmartClick = useCallback((e) => {
  e.stopPropagation();
  
  console.log('🎯 Smart click initiated:', {
    target: e.target,
    path: e.nativeEvent.composedPath().map(el => el.getAttribute?.('data-component-id')).filter(Boolean)
  });
  
  // Get all component elements under the click
  const clickPath = e.nativeEvent.composedPath();
  
  // 🔥 PRIORITY 1: Check for text node clicks (ENHANCED)
  const textNode = clickPath.find(el => 
    el.nodeType === 1 && 
    el.hasAttribute && 
    (el.getAttribute('data-is-pseudo') === 'true' ||
     el.getAttribute('data-component-type') === 'text-node')
  );
  
  if (textNode) {
    const textNodeId = textNode.getAttribute('data-component-id');
    console.log('✅ Text node clicked:', textNodeId);
    onComponentClick(textNodeId, e);
    return;
  }
  
  // 🔥 PRIORITY 2: Regular component selection
  const componentElements = clickPath.filter(el => 
    el.nodeType === 1 && el.hasAttribute && el.hasAttribute('data-component-id')
  );
  if (componentElements.length === 0) {
    console.log('🎯 Canvas click - selecting canvas root');
    onComponentClick('__canvas_root__', e);
    setIsCanvasSelected(true);
    return;
  }
  
  // Select the FIRST (deepest/innermost) component
  const targetElement = componentElements[0];
  const componentId = targetElement.getAttribute('data-component-id');
  
  console.log('✅ Component selected:', componentId);
  onComponentClick(componentId, e);
}, [onComponentClick]);
  
  
  

// FIXED SortableComponent - Replace the entire function
// @/Components/Forge/CanvasComponent.jsx - ENHANCE SortableComponent

const SortableComponent = ({ 
  component, 
  depth, 
  parentId, 
  index, 
  parentStyle, 
  responsiveMode // 🔥 ADD responsive mode prop
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isSelected = selectedComponent === component.id;
  const isLayout = component.isLayoutContainer || 
                   ['section', 'container', 'div', 'flex', 'grid'].includes(component.type);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: component.id,
    data: { component, depth, parentId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 9999 : component.zIndex || depth,
  };

    const getDeviceAwareStyles = () => {
      // 🔥 Pass parent context to service
      const parentContext = {
        isLayoutContainer: isLayout,
        responsiveMode: responsiveMode
      };
      
      const serviceStyles = componentLibraryService?.calculateResponsiveStyles 
        ? componentLibraryService.calculateResponsiveStyles(
            component, 
            responsiveMode, 
            canvasDimensions,
            parentContext // 🔥 Pass parent info
          )
        : component.style;
      
      const baseStyles = {
        display: isLayout ? 'block' : 'inline-block',
        width: isLayout ? '100%' : 'auto',
        minHeight: isLayout ? '100px' : 'auto',
        padding: isLayout ? '24px' : '0',
        backgroundColor: 'transparent',
        ...serviceStyles, // 🔥 Service handles scaling
        ...style, // Sortable transform
      };
    
      return baseStyles;
    };

  const componentStyles = getDeviceAwareStyles();

  // Rest of the SortableComponent implementation remains the same...
  if (isLayout) {
    return (
      <div
        key={component.id}
        ref={setNodeRef}
        style={componentStyles}
        data-component-id={component.id}
        data-depth={depth}
        data-is-layout="true"
        data-parent-id={parentId || 'root'}
        data-responsive-mode={responsiveMode} // 🔥 ADD responsive mode data attribute
        className={`
          relative group layout-container 
          ${isSelected ? 'ring-2 ring-blue-500' : ''}
          ${isDragging ? 'opacity-40' : ''}
          ${overId === component.id ? 'ring-2 ring-green-400' : ''}
          transition-opacity duration-150
          responsive-${responsiveMode} // 🔥 ADD responsive class
        `}
        onClick={handleSmartClick}
        onDoubleClick={(e) => handleDoubleClickText(e, component.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Drag overlay and content remains the same */}
        <div 
          className={`
            absolute inset-0 cursor-grab active:cursor-grabbing
            ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            transition-opacity duration-200
          `}
          style={{
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            zIndex: 1,
            pointerEvents: (isHovered || isDragging) ? 'auto' : 'none'
          }}
          {...attributes}
          {...listeners}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        />
        
    
        
        
        {/* Nested components */}
        {component.children && component.children.length > 0 ? (
         <SortableContext 
          items={component.children.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {component.children.map((child, childIndex) => (
            <SortableComponent
              key={child.id}
              component={child}
              depth={depth + 1}
              parentId={component.id}
              index={childIndex}
              parentStyle={componentStyles}
              responsiveMode={responsiveMode}
            />
          ))}
        </SortableContext>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
            <div className="text-xs text-gray-400 border-2 border-dashed border-gray-300 rounded p-2">
              Drop here • {component.type} • {responsiveMode}
              {componentStyles._responsiveScale && ` • Scale: ${componentStyles._responsiveScale.toFixed(2)}`}
            </div>
          </div>
        )}
        
        {isSelected && (
          <div className="absolute -top-6 left-0 px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white z-50">
            {component.name} • {component.children?.length || 0} children • {responsiveMode}
          </div>
        )}
      </div>
    );
  }

  // Non-layout component rendering with responsive styles
  const componentRenderer = componentLibraryService?.getComponent(component.type);
  let renderedContent = null;

  if (componentRenderer?.render) {
    try {
      const mergedProps = {
        ...component.props,
        style: componentStyles // 🔥 Use responsive styles
      };
      renderedContent = componentRenderer.render(mergedProps, component.id);
    } catch (error) {
      console.warn('Render error:', error);
      renderedContent = <div className="p-2 border rounded">{component.name}</div>;
    }
  }

  const wrapperStyles = {
  position: 'relative',
  display: componentStyles.display === 'inline-flex' || 
           componentStyles.display === 'inline-block' || 
           componentStyles.display === 'inline' 
           ? 'inline-block'
           : 'block',
  zIndex: component.zIndex || depth,
  // 🔥 CRITICAL: NO padding on wrapper
  padding: '0',
  margin: '0',
};

return (
  <div
    key={component.id}
    ref={setNodeRef}
    style={wrapperStyles} // 🔥 Wrapper has NO padding
    data-component-id={component.id}
    data-depth={depth}
    data-is-layout="false"
    data-parent-id={parentId || 'root'}
    data-responsive-mode={responsiveMode}
      className={`
        group
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        ${isDragging ? 'opacity-40' : ''}
        transition-opacity duration-150
        responsive-${responsiveMode} // 🔥 ADD responsive class
      `}
      onClick={handleSmartClick}
      onDoubleClick={(e) => handleDoubleClickText(e, component.id)}
   >
   
   
      {/* Drag overlay */}
      <div 
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          zIndex: 1,
          pointerEvents: 'auto',
          opacity: isDragging ? 0.3 : 0.1,
          backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)',
          borderRadius: '4px',
          transition: 'all 0.2s ease',
        }}
        {...attributes}
        {...listeners}
        onMouseDown={(e) => {
          e.stopPropagation();
          console.log('Non-layout drag started:', component.id);
        }}
      />
      
      {/* Component content wrapper */}
      <div 
        style={{ 
          position: 'relative', 
          zIndex: 2,
          pointerEvents: 'none',
          display: 'inline-block',
          padding: '0', // 🔥 NO wrapper padding
        }}
      >
        {renderedContent}
      </div>
      
      {/* Selection label */}
      {isSelected && (
        <div className="absolute -top-6 left-0 px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white z-50 pointer-events-none">
          {component.name} • {responsiveMode}
        </div>
      )}
    </div>
  );
};



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
    <SortableComponent
      key={component.id}
      component={responsiveComponent}
      depth={depth}
      parentId={parentId}
      index={index}
      parentStyle={responsiveStyles}
      responsiveMode={responsiveMode}
    />
  );
}, [componentLibraryService, selectedComponent, responsiveMode, canvasDimensions]);



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
    className="relative w-full h-full flex items-center justify-center"
    style={{ 
      backgroundColor: 'transparent',
      position: 'relative',
      zIndex: 1,
      overflow: 'auto', // 🔥 CRITICAL: Allow scrolling
      minHeight: '100%',
      padding: responsiveMode === 'mobile' ? '40px 20px' : 
               responsiveMode === 'tablet' ? '60px 40px' : '80px 120px',
    }}
  >
    {/* 🔥 NEW: Scaled container that constrains canvas */}
    <div 
      className="relative"
      style={{
        transform: `scale(${forgeCanvasZoom / 100})`,
        transformOrigin: 'center center',
        transition: 'transform 0.2s ease-out',
      }}
    >
      {/* Responsive Canvas Container - EXPANDS with content */}

<div
  className={`relative transition-all duration-500 ease-in-out
    ${isFrameSwitching ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
    ${responsiveMode !== 'desktop' ? 'shadow-2xl' : ''}
  `}
  style={{ 
    width: responsiveMode === 'desktop' ? '100%' : `${canvasSize.width}px`,
    maxWidth: responsiveMode === 'desktop' ? '1440px' : canvasSize.maxWidth,
    height: 'auto',
    minHeight: responsiveMode === 'desktop' ? '600px' : 
               responsiveMode === 'tablet' ? '800px' : '500px', // 🔥 Reduced heights
    overflow: 'visible', 
    transform: 'none',
    transformOrigin: 'center top',
    zIndex: 10,
    margin: '0 auto', // 🔥 Center horizontally
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
        
     {/* Main Canvas - Acts as Document Body */}
<div 
  ref={canvasRef}
  className={`
    relative transition-all duration-500
    ${canvasClasses}
    ${isFrameSwitching ? 'opacity-50 pointer-events-none' : ''}
    ${dragState.isDragging ? 'overflow-visible' : ''}
  `}
  style={{
    ...getCanvasRootStyles(),
    
    width: responsiveMode === 'desktop' ? '1440px' : 
           responsiveMode === 'tablet' ? '768px' : '375px',
    
    height: useForgeStore.getState().canvasExpansionEnabled 
      ? 'auto' 
      : (responsiveMode === 'desktop' ? '900px' : 
         responsiveMode === 'tablet' ? '1024px' : '667px'),
    
    minHeight: responsiveMode === 'desktop' ? '900px' : 
               responsiveMode === 'tablet' ? '1024px' : '667px',
    
    maxHeight: useForgeStore.getState().canvasExpansionEnabled ? 'none' : (
      responsiveMode === 'desktop' ? '900px' : 
      responsiveMode === 'tablet' ? '1024px' : '667px'
    ),
    
    // 🔥 SMART OVERFLOW: Only visible during drag, otherwise auto for scrolling
    overflow: dragState.isDragging || activeId ? 'visible' : 'auto',
    overflowY: dragState.isDragging || activeId ? 'visible' : 'auto',
    
    cursor: dragState.isDragging ? 'copy' : 'default',
    borderRadius: responsiveMode !== 'desktop' ? '1rem' : '0',
    isolation: 'isolate',
  }}
  onDragOver={onCanvasDragOver}
  onDrop={onCanvasDrop}
  onClick={(e) => {
  if (isPreviewMode) return; // 🔥 Disable selection in preview
  if (e.target === e.currentTarget) {
    onCanvasClick(null, e);
    onComponentClick('__canvas_root__', e);
  } else {
    onCanvasClick(e);
  }
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
            isDragging={isDraggingComponent || dragState.isDragging || !!activeId} // 🔥 ADD: activeId check
            draggedComponentId={activeId || selectedComponent} // 🔥 ADD: Pass dragged ID
            ghostBounds={dragState.draggedComponent?.ghostBounds} // 🔥 ADD: Pass ghost bounds
          />
        )}
          



          {SelectionOverlay && selectedComponent === '__canvas_root__' && !activeId && (
            <SelectionOverlay
              componentId="__canvas_root__"
              canvasRef={canvasRef}
              isCanvasSelection={true}
              showSpacing={isOverlayEnabled('showSpacingIndicators')}
              // 🔥 ADD THIS:
              onComponentClick={onComponentClick}
            />
          )}
          
         {SelectionOverlay && selectedComponent && selectedComponent !== '__canvas_root__' && !activeId && (
            <SelectionOverlay
              componentId={selectedComponent}
              canvasRef={canvasRef}
              canvasComponents={canvasComponents}
              selectedComponent={canvasComponents.find(c => c.id === selectedComponent)}
              showSpacing={isOverlayEnabled('showSpacingIndicators')}
              showSelectionBorders={isOverlayEnabled('showSelectionBorders')}
              onComponentClick={onComponentClick}
                            // 🔥 CRITICAL: Pass active drag state
              isDragging={!!activeId && selectedComponent === activeId}
              draggedComponent={activeId === selectedComponent ? draggedComponent : null}
              dragTransform={activeId === selectedComponent ? { x: 0, y: 0 } : null}
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
              />
            ) : (
              <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDndDragStart}
                onDragOver={handleDndDragOver}
                onDragEnd={handleDndDragEnd}
                onDragCancel={handleDndDragCancel}
              >
                {/* In your main render section - REMOVE AnimatePresence */}
                <SortableContext 
                  items={canvasComponents.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {/* REMOVE AnimatePresence - it causes glitching */}
                  <div>
                    {canvasComponents.map((component, index) => 
                      renderComponent(component, index, {}, 0)
                    )}
                  </div>
                </SortableContext>
              
                 {/* PROFESSIONAL DRAG GHOST - Dynamic positioning based on actual element position */}
                  <DragOverlay
                      dropAnimation={{
                        duration: 200,
                        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                      }}
                      style={{ 
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        zIndex: 99999, // 🔥 CHANGED: Much higher to be above everything
                        cursor: 'grabbing',
                        touchAction: 'none',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        pointerEvents: 'none',
                        // 🔥 CRITICAL FIX: Remove background
                        backgroundColor: 'transparent', // Was missing
                      }}
                    >
                      {activeId && draggedComponent ? (
                        <div
                          className="drag-ghost-wrapper"
                          style={{
                            transform: `scale(1.05)`,
                            filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.4))',
                            border: '2px solid rgba(59, 130, 246, 0.5)',
                            borderRadius: '8px',
                            overflow: 'visible',
                            // 🔥 CRITICAL FIX: Explicit transparent background
                            backgroundColor: 'transparent',
                            pointerEvents: 'none',
                            minWidth: draggedComponent.isLayoutContainer ? '200px' : 'auto',
                            minHeight: draggedComponent.isLayoutContainer ? '100px' : 'auto',
                            padding: draggedComponent.isLayoutContainer ? '16px' : '8px',
                          }}
                        >
                          {/* Content wrapper with white background ONLY */}
                          <div style={{
                            backgroundColor: '#ffffff', // 🔥 Only here, not parent
                            width: '100%',
                            height: '100%',
                            borderRadius: '6px',
                            overflow: 'hidden',
                          }}>
                            {(() => {
                              const originalElement = document.querySelector(`[data-component-id="${activeId}"]`);
                              
                              if (!originalElement) {
                                return (
                                  <div className="p-4 bg-white rounded border-2 border-blue-500 min-w-[120px]">
                                    <div className="font-semibold text-sm">{draggedComponent.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">{draggedComponent.type}</div>
                                  </div>
                                );
                              }
                              
                              const clonedElement = originalElement.cloneNode(true);
                              
                              clonedElement.removeAttribute('data-dnd-kit-draggable-context-id');
                              clonedElement.removeAttribute('draggable');
                              
                              const computedStyles = window.getComputedStyle(originalElement);
                              const criticalStyles = [
                                'display', 'width', 'height', 'padding', 'margin',
                                'backgroundColor', 'color', 'fontSize', 'fontWeight',
                                'border', 'borderRadius', 'boxShadow'
                              ];
                              
                              criticalStyles.forEach(prop => {
                                clonedElement.style[prop] = computedStyles[prop];
                              });
                              
                              clonedElement.style.backgroundColor = '#ffffff';
                              clonedElement.style.visibility = 'visible';
                              clonedElement.style.opacity = '1';
                              clonedElement.style.position = 'relative';
                              clonedElement.style.pointerEvents = 'none';
                              clonedElement.style.transform = 'none';
                              clonedElement.style.minWidth = '60px';
                              clonedElement.style.minHeight = '30px';
                              
                              const clonedChildren = clonedElement.querySelectorAll('*');
                              clonedChildren.forEach(child => {
                                child.style.visibility = 'visible';
                                child.style.opacity = '1';
                                child.style.pointerEvents = 'none';
                              });
                              
                              return <div 
                                dangerouslySetInnerHTML={{ __html: clonedElement.outerHTML }}
                                style={{ 
                                  pointerEvents: 'none',
                                  backgroundColor: 'transparent', // 🔥 Transparent wrapper
                                  width: '100%',
                                  height: '100%',
                                  minWidth: '60px',
                                  minHeight: '30px',
                                }}
                              />;
                            })()}
                          </div>
                          
             
                      
                      {/* Drag indicator */}
                      <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                        <Move className="w-3 h-3 text-white" />
                      </div>
                      
                      {/* Child count for layouts */}
                      {draggedComponent.children?.length > 0 && (
                        <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-center">
                          <div className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-lg">
                            {draggedComponent.children.length} nested
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
              
              {/* 🔥 NEW: Quick Add Section at Bottom */}
      <div className="flex justify-center py-8">
        <button
          onClick={() => {
            const sectionComponent = componentLibraryService?.createLayoutElement('section');
            if (sectionComponent) {
              const updatedComponents = [...canvasComponents, sectionComponent];
              setFrameCanvasComponents(prev => ({
                ...prev,
                [currentFrame]: updatedComponents
              }));
              setSelectedComponent(sectionComponent.id);
              
              // Scroll to bottom to show new section
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
          Add Section
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