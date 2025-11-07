// @/Components/Forge/SelectionOverlay.jsx - PROFESSIONAL SELECTION SYSTEM
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Unlock, Eye, EyeOff, Copy, Trash2, 
  CornerDownRight, Maximize2, Move, RotateCw 
} from 'lucide-react';

import { useEditorStore } from '@/stores/useEditorStore';
import { useForgeStore } from '@/stores/useForgeStore';
import { useCanvasOverlayStore } from '@/stores/useCanvasOverlayStore';

/**
 * Professional selection overlay system
 * Features:
 * - Blue selection border with corner handles
 * - Hover-activated resize handles
 * - Component info label
 * - Size measurements
 * - Nested component highlighting
 * - Quick actions toolbar
 * - Margin/padding visualization
 * - Responsive to canvas scaling
 */
const SelectionOverlay = ({ 
  componentId, 
  canvasRef, 
  onResize,
  onDelete,
  onDuplicate,
  onLock,
  onToggleVisibility,
  selectedComponent,
  canvasComponents = [],
  showSpacing = false, 
  isCanvasSelection = false,
  // 🔥 NEW PROPS FOR DRAGGING
  isDragging = false,
  draggedComponent = null,
  dragTransform = null,
  // 🔥 ADD THIS PROP:
  onComponentClick = null
}) => {
  const [bounds, setBounds] = useState(null);
  const [computedStyles, setComputedStyles] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [nestedComponents, setNestedComponents] = useState([]);
  const [parentComponent, setParentComponent] = useState(null);
  const [hoveredComponent, setHoveredComponent] = useState(null);
  const [ancestorHighlights, setAncestorHighlights] = useState([]);
  const [childrenHighlights, setChildrenHighlights] = useState([]);

  
  const { 
    responsiveMode, 
    getResponsiveScaleFactor,
    gridVisible 
  } = useEditorStore();
  
  const { overlays, isOverlayEnabled } = useCanvasOverlayStore();
  

  const resizeStartPos = useRef(null);
  const initialBounds = useRef(null);
  const rafId = useRef(null);
  


  // Configuration
  const CONFIG = useMemo(() => ({
    HANDLE_SIZE: 8,
    HANDLE_HOVER_SIZE: 12,
    MIN_WIDTH: 20,
    MIN_HEIGHT: 20,
    SELECTION_BORDER_WIDTH: 2,
    LABEL_HEIGHT: 24,
    ACTIONS_HEIGHT: 36,
    SPACING_COLOR: {
      margin: '#f97316', // Orange
      padding: '#10b981', // Green
      content: '#3b82f6', // Blue
    },
    RESIZE_CURSORS: {
      n: 'ns-resize',
      s: 'ns-resize',
      e: 'ew-resize',
      w: 'ew-resize',
      ne: 'nesw-resize',
      nw: 'nwse-resize',
      se: 'nwse-resize',
      sw: 'nesw-resize',
    },
  }), []);
  
  


  /**
   * Get component hierarchy
   */
  const getComponentHierarchy = useCallback(() => {
    if (!componentId || !canvasComponents.length) return;

    // Find nested children
    const findChildren = (compId, components) => {
      const children = [];
      components.forEach(comp => {
        if (comp.parentId === compId) {
          children.push(comp);
          if (comp.children?.length > 0) {
            children.push(...findChildren(comp.id, comp.children));
          }
        }
      });
      return children;
    };

    // Find parent
    const findParent = (compId, components) => {
      for (const comp of components) {
        if (comp.children?.some(child => child.id === compId)) {
          return comp;
        }
        if (comp.children?.length > 0) {
          const parent = findParent(compId, comp.children);
          if (parent) return parent;
        }
      }
      return null;
    };

    setNestedComponents(findChildren(componentId, canvasComponents));
    setParentComponent(findParent(componentId, canvasComponents));
  }, [componentId, canvasComponents]);
  
  
  
  
 // ENHANCE this useEffect (around line 145)
useEffect(() => {
  if (!hoveredComponent || !canvasComponents.length) {
    setAncestorHighlights([]);
    setChildrenHighlights([]);
    return;
  }
  
  // 🔥 FIXED: Recursive search through entire tree
  const findComponentInTree = (components, targetId) => {
    for (const comp of components) {
      if (comp.id === targetId) return comp;
      if (comp.children?.length > 0) {
        const found = findComponentInTree(comp.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };
  
  const current = findComponentInTree(canvasComponents, hoveredComponent);
  if (!current) return;
  
  // Find ancestors (up to 2 levels)
  const ancestors = [];
  const findAncestors = (targetId, maxDepth = 2) => {
    if (maxDepth === 0) return;
    
    for (const comp of canvasComponents) {
      if (comp.children?.some(child => child.id === targetId)) {
        ancestors.push(comp);
        findAncestors(comp.id, maxDepth - 1);
        return;
      }
      if (comp.children?.length > 0) {
        const searchNested = (children) => {
          for (const child of children) {
            if (child.children?.some(c => c.id === targetId)) {
              ancestors.push(child);
              findAncestors(child.id, maxDepth - 1);
              return true;
            }
            if (child.children?.length > 0) {
              if (searchNested(child.children)) return true;
            }
          }
          return false;
        };
        searchNested(comp.children);
      }
    }
  };
  
  if (current.parentId) {
    findAncestors(hoveredComponent);
  }
  
  // Find all descendants
  const findAllDescendants = (comp) => {
    const descendants = [];
    const recurse = (c) => {
      if (c.children?.length > 0) {
        descendants.push(...c.children);
        c.children.forEach(recurse);
      }
    };
    recurse(comp);
    return descendants;
  };
  
  setAncestorHighlights(ancestors);
  setChildrenHighlights(findAllDescendants(current));
}, [hoveredComponent, canvasComponents]);



// REPLACE the useEffect for hoveredComponent (around line 120)
useEffect(() => {
  const handleGlobalHover = (e) => {
    // 🔥 CRITICAL: Work on both touch and mouse
    const isTouchEvent = e.type.startsWith('touch');
    const clientX = isTouchEvent ? e.touches?.[0]?.clientX : e.clientX;
    const clientY = isTouchEvent ? e.touches?.[0]?.clientY : e.clientY;
    
    if (!clientX || !clientY) {
      setHoveredComponent(null);
      return;
    }
    
    // Get element at touch/mouse position
    const elementAtPoint = document.elementFromPoint(clientX, clientY);
    const target = elementAtPoint?.closest('[data-component-id]');
    
    if (target) {
      const id = target.getAttribute('data-component-id');
      console.log('🎯 Hovered component:', id);
      setHoveredComponent(id);
    } else {
      setHoveredComponent(null);
    }
  };
  
  const canvas = canvasRef.current;
  if (canvas) {
    // 🔥 Listen to both mouse and touch events
    canvas.addEventListener('mousemove', handleGlobalHover);
    canvas.addEventListener('touchmove', handleGlobalHover, { passive: true });
    canvas.addEventListener('touchstart', handleGlobalHover, { passive: true });
    
    return () => {
      canvas.removeEventListener('mousemove', handleGlobalHover);
      canvas.removeEventListener('touchmove', handleGlobalHover);
      canvas.removeEventListener('touchstart', handleGlobalHover);
    };
  }
}, [canvasRef]);



  /**
   * Update bounds and styles with high precision - FIXED FOR SCALING
   */
const updateBounds = useCallback(() => {
  if (!componentId || !canvasRef.current) {
    setBounds(null);
    setComputedStyles(null);
    return;
  }
  
  if (isCanvasSelection) {
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const canvasComputedStyle = window.getComputedStyle(canvasRef.current);
    
    setBounds({
      top: 0,
      left: 0,
      width: parseFloat(canvasComputedStyle.width),
      height: parseFloat(canvasComputedStyle.height),
    });
    
    setComputedStyles({
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
    });
    return;
  }

  const element = document.querySelector(`[data-component-id="${componentId}"]`);
  if (!element) {
    setBounds(null);
    setComputedStyles(null);
    return;
  }

  // 🔥 FIXED: Since overlay is rendered INSIDE the canvas (which is inside scaled wrapper),
  // we use offsetLeft/offsetTop directly - they're already in the correct coordinate space
  // The canvas scaling is applied at the wrapper level, so elements inside are already scaled
  
  const elementOffsetLeft = element.offsetLeft || 0;
  const elementOffsetTop = element.offsetTop || 0;
  
  const newBounds = {
    top: elementOffsetTop,
    left: elementOffsetLeft,
    width: element.offsetWidth,
    height: element.offsetHeight,
    right: elementOffsetLeft + element.offsetWidth,
    bottom: elementOffsetTop + element.offsetHeight,
  };

  const styles = window.getComputedStyle(element);
  const newStyles = {
    marginTop: parseFloat(styles.marginTop) || 0,
    marginRight: parseFloat(styles.marginRight) || 0,
    marginBottom: parseFloat(styles.marginBottom) || 0,
    marginLeft: parseFloat(styles.marginLeft) || 0,
    paddingTop: parseFloat(styles.paddingTop) || 0,
    paddingRight: parseFloat(styles.paddingRight) || 0,
    paddingBottom: parseFloat(styles.paddingBottom) || 0,
    paddingLeft: parseFloat(styles.paddingLeft) || 0,
    display: styles.display,
    position: styles.position,
    zIndex: styles.zIndex,
  };

  setBounds(newBounds);
  setComputedStyles(newStyles);
}, [componentId, canvasRef, isCanvasSelection]);
  
  
  
  
  
  
// ✅ FORCE re-calculation when overlay settings change
useEffect(() => {
  const handleOverlayChange = () => {
    console.log('Overlay changed, updating bounds');
    updateBounds();
  };
  
  window.addEventListener('canvas-overlay-changed', handleOverlayChange);
  return () => window.removeEventListener('canvas-overlay-changed', handleOverlayChange);
}, [updateBounds]);

  /**
   * Handle resize start
   */
  const handleResizeStart = useCallback((handle, e) => {
    e.stopPropagation();
    e.preventDefault();

    setIsResizing(true);
    setResizeHandle(handle);
    
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
    };
    
    initialBounds.current = { ...bounds };

    // Change cursor
    document.body.style.cursor = CONFIG.RESIZE_CURSORS[handle];
    document.body.style.userSelect = 'none';

    // Add global mouse event listeners
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [bounds, CONFIG.RESIZE_CURSORS]);

  /**
   * Handle resize move
   */
  const handleResizeMove = useCallback((e) => {
    if (!isResizing || !resizeStartPos.current || !initialBounds.current) return;

    // Cancel any pending animation frame
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    // Use RAF for smooth updates
    rafId.current = requestAnimationFrame(() => {
      const deltaX = e.clientX - resizeStartPos.current.x;
      const deltaY = e.clientY - resizeStartPos.current.y;

      const scale = responsiveMode !== 'desktop' ? getResponsiveScaleFactor() : 1;
      const scaledDeltaX = deltaX / scale;
      const scaledDeltaY = deltaY / scale;

      let newBounds = { ...initialBounds.current };

      // Calculate new bounds based on handle
      switch (resizeHandle) {
        case 'n':
          newBounds.top += scaledDeltaY;
          newBounds.height -= scaledDeltaY;
          break;
        case 's':
          newBounds.height += scaledDeltaY;
          break;
        case 'e':
          newBounds.width += scaledDeltaX;
          break;
        case 'w':
          newBounds.left += scaledDeltaX;
          newBounds.width -= scaledDeltaX;
          break;
        case 'ne':
          newBounds.top += scaledDeltaY;
          newBounds.height -= scaledDeltaY;
          newBounds.width += scaledDeltaX;
          break;
        case 'nw':
          newBounds.top += scaledDeltaY;
          newBounds.height -= scaledDeltaY;
          newBounds.left += scaledDeltaX;
          newBounds.width -= scaledDeltaX;
          break;
        case 'se':
          newBounds.height += scaledDeltaY;
          newBounds.width += scaledDeltaX;
          break;
        case 'sw':
          newBounds.height += scaledDeltaY;
          newBounds.left += scaledDeltaX;
          newBounds.width -= scaledDeltaX;
          break;
      }

      // Enforce minimum size
      if (newBounds.width < CONFIG.MIN_WIDTH) {
        newBounds.width = CONFIG.MIN_WIDTH;
        if (resizeHandle.includes('w')) {
          newBounds.left = initialBounds.current.left + initialBounds.current.width - CONFIG.MIN_WIDTH;
        }
      }

      if (newBounds.height < CONFIG.MIN_HEIGHT) {
        newBounds.height = CONFIG.MIN_HEIGHT;
        if (resizeHandle.includes('n')) {
          newBounds.top = initialBounds.current.top + initialBounds.current.height - CONFIG.MIN_HEIGHT;
        }
      }

      // Update bounds
      setBounds(newBounds);

      // Trigger resize callback
      if (onResize) {
        onResize(componentId, {
          width: Math.round(newBounds.width),
          height: Math.round(newBounds.height),
          top: Math.round(newBounds.top),
          left: Math.round(newBounds.left),
        });
      }
    });
  }, [
    isResizing, 
    resizeHandle, 
    componentId, 
    onResize, 
    responsiveMode, 
    getResponsiveScaleFactor,
    CONFIG.MIN_WIDTH,
    CONFIG.MIN_HEIGHT
  ]);

  /**
   * Handle resize end
   */
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizeHandle(null);
    resizeStartPos.current = null;
    initialBounds.current = null;

    // Reset cursor
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    // Remove global listeners
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);

    // Cancel any pending RAF
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    // Final update
    updateBounds();
  }, [handleResizeMove, updateBounds]);

  /**
   * Setup observers and listeners
   */
  useEffect(() => {
    if (!componentId || !canvasRef.current) return;

    // Initial update
    updateBounds();

    const element = document.querySelector(`[data-component-id="${componentId}"]`);
    if (!element) return;

    // Watch for size changes
    const resizeObserver = new ResizeObserver(() => {
      if (!isResizing) {
        requestAnimationFrame(updateBounds);
      }
    });
    resizeObserver.observe(element);

    // Watch for attribute/style changes
    const mutationObserver = new MutationObserver((mutations) => {
      const hasStyleChange = mutations.some(m => 
        m.type === 'attributes' && (m.attributeName === 'style' || m.attributeName === 'class')
      );
      if (hasStyleChange && !isResizing) {
        requestAnimationFrame(updateBounds);
      }
    });

    mutationObserver.observe(element, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Listen for responsive mode changes
    const handleModeChange = () => {
      setBounds(null);
      setComputedStyles(null);
      setTimeout(updateBounds, 150);
    };

    window.addEventListener('responsive-mode-changed', handleModeChange);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('responsive-mode-changed', handleModeChange);
      
      // Cleanup resize if component unmounts during resize
      if (isResizing) {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, [
    componentId, 
    canvasRef, 
    responsiveMode, 
    updateBounds, 
    isResizing,
    handleResizeMove,
    handleResizeEnd
  ]);

  /**
   * Update hierarchy when component changes
   */
  useEffect(() => {
    getComponentHierarchy();
  }, [componentId, canvasComponents, getComponentHierarchy]);

  /**
   * Keyboard shortcuts
   */
    useEffect(() => {
    if (!componentId) return;
  
    const handleKeyDown = (e) => {
      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && !e.target.matches('input, textarea')) {
        e.preventDefault();
        onDelete?.(componentId);
      }
  
      // Duplicate (Cmd/Ctrl + D)
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        onDuplicate?.(componentId);
      }
  
      // ✅ Spacing toggle now handled globally via CanvasSettingsDropdown
      // (No local Shift+S handler needed)
  
      // Toggle actions (Shift + A)
      if (e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowActions(prev => !prev);
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [componentId, onDelete, onDuplicate]);




// 🔥 NEW: Real-time tracking of drag overlay position
useEffect(() => {
  if (!isDragging || !componentId) return;
  
  let rafId = null;
  
  const trackDragOverlay = () => {
    const dragOverlay = document.querySelector('[data-dnd-kit-drag-overlay]');
    const canvas = canvasRef.current;
    
    if (dragOverlay && canvas) {
      const overlayRect = dragOverlay.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const scale = responsiveMode !== 'desktop' ? getResponsiveScaleFactor() : 1;
      
      setBounds({
        top: (overlayRect.top - canvasRect.top) / scale,
        left: (overlayRect.left - canvasRect.left) / scale,
        width: overlayRect.width / scale,
        height: overlayRect.height / scale,
        right: (overlayRect.right - canvasRect.left) / scale,
        bottom: (overlayRect.bottom - canvasRect.top) / scale,
      });
    }
    
    rafId = requestAnimationFrame(trackDragOverlay);
  };
  
  rafId = requestAnimationFrame(trackDragOverlay);
  
  return () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  };
}, [isDragging, componentId, canvasRef, responsiveMode, getResponsiveScaleFactor]);



  // Don't render if no bounds
  if (!bounds || !computedStyles) return null;
  
  
// 🔥 FIX: Canvas selection rendering - make it more obvious when selected
if (isCanvasSelection) {
  const canvasExpansionEnabled = useForgeStore.getState().canvasExpansionEnabled;
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* CANVAS SELECTION OVERLAY - Hide when expansion enabled */}
      {!canvasExpansionEnabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="canvas-selection-overlay absolute border-2 border-dashed"
          style={{
            top: bounds.top,
            left: bounds.left,
            width: bounds.width,
            height: bounds.height,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: '#3b82f6',
          }}
        >
          {/* Canvas dimensions label */}
          <motion.div
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute px-2 py-1 rounded text-xs font-mono bg-blue-500 text-white shadow-lg"
            style={{
              top: 8,
              left: 8,
            }}
          >
            Canvas • {Math.round(bounds.width)} × {Math.round(bounds.height)}
          </motion.div>

          {/* Center crosshair */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-blue-400 opacity-60"
              style={{ left: '50%', transform: 'translateX(-50%)' }}
            />
            <div
              className="absolute left-0 right-0 h-0.5 bg-blue-400 opacity-60"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            />
          </motion.div>
        </motion.div>
      )}

      {/* 🔥 NEW: CANVAS PADDING/MARGIN VISUALIZATION - Only when spacing enabled and expansion disabled */}
      <AnimatePresence>
        {showSpacing && !canvasExpansionEnabled && isOverlayEnabled('showSpacingIndicators') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
          >
            {/* Canvas Padding Visualization */}
            {computedStyles.paddingTop > 0 && (
              <div
                className="absolute pointer-events-none"
                style={{
                  top: bounds.top,
                  left: bounds.left,
                  width: bounds.width,
                  height: computedStyles.paddingTop,
                  backgroundColor: `${CONFIG.SPACING_COLOR.padding}20`,
                  borderTop: `1px dashed ${CONFIG.SPACING_COLOR.padding}`,
                  borderBottom: `1px dashed ${CONFIG.SPACING_COLOR.padding}`,
                  zIndex: 200,
                }}
              >
                <span 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm"
                  style={{ backgroundColor: CONFIG.SPACING_COLOR.padding, color: 'white', zIndex: 201 }}
                >
                  {Math.round(computedStyles.paddingTop)}
                </span>
              </div>
            )}
            
            {/* Add similar blocks for paddingRight, paddingBottom, paddingLeft, marginTop, etc. */}
            {/* ... (repeat pattern for all 8 sides) ... */}
          </motion.div>
        )}
      </AnimatePresence>


      {/* CANVAS SPACING GUIDES - ONLY WHEN SHOW_SPACING IS TRUE */}
      <AnimatePresence>
        {showSpacing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
          >
            {/* Safe area guides (common margins) */}
            {[20, 40, 60].map(margin => (
              <React.Fragment key={margin}>
                {/* Top safe area */}
                <div
                  className="absolute border-t border-dashed border-orange-400 pointer-events-none"
                  style={{
                    top: margin,
                    left: 0,
                    right: 0,
                  }}
                />
                
                {/* Left safe area */}
                <div
                  className="absolute border-l border-dashed border-orange-400 pointer-events-none"
                  style={{
                    left: margin,
                    top: 0,
                    bottom: 0,
                  }}
                />
                
                {/* Right safe area */}
                <div
                  className="absolute border-r border-dashed border-orange-400 pointer-events-none"
                  style={{
                    right: margin,
                    top: 0,
                    bottom: 0,
                  }}
                />
                
                {/* Bottom safe area */}
                <div
                  className="absolute border-b border-dashed border-orange-400 pointer-events-none"
                  style={{
                    bottom: margin,
                    left: 0,
                    right: 0,
                  }}
                />
              </React.Fragment>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


  // 🔥 SIMPLIFIED RENDERING FOR DRAGGING STATE
  if (isDragging) {
    return (
      <div 
        className="absolute pointer-events-none z-50"
        style={{
          top: bounds.top,
          left: bounds.left,
          width: bounds.width,
          height: bounds.height,
          // 🔥 FOLLOW GHOST STYLING
          border: '2px solid #3b82f6',
          borderRadius: '2px',
          boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.2), 0 4px 12px rgba(59, 130, 246, 0.15), 0 0 20px rgba(59, 130, 246, 0.1)',
          opacity: 0.8,
          // Add pulsing animation for dragging state
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      >
        {/* Dimensions label */}
        <div 
          className="absolute px-2 py-1 rounded text-xs font-mono shadow-lg"
          style={{
            bottom: '100%',
            right: 0,
            marginBottom: 4,
            backgroundColor: '#3b82f6',
            color: 'white',
          }}
        >
          {Math.round(bounds.width)} × {Math.round(bounds.height)}
        </div>

        {/* Drag indicator */}
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
          <Move className="w-2 h-2 text-white" />
        </div>
      </div>
    );
  }




  // Calculate content area (after padding)
  const contentArea = {
    top: bounds.top + computedStyles.paddingTop,
    left: bounds.left + computedStyles.paddingLeft,
    width: bounds.width - computedStyles.paddingLeft - computedStyles.paddingRight,
    height: bounds.height - computedStyles.paddingTop - computedStyles.paddingBottom,
  };

  // Resize handles configuration
  const resizeHandles = [
    { id: 'n', position: { top: -4, left: '50%', transform: 'translateX(-50%)' } },
    { id: 's', position: { bottom: -4, left: '50%', transform: 'translateX(-50%)' } },
    { id: 'e', position: { top: '50%', right: -4, transform: 'translateY(-50%)' } },
    { id: 'w', position: { top: '50%', left: -4, transform: 'translateY(-50%)' } },
    { id: 'ne', position: { top: -4, right: -4 } },
    { id: 'nw', position: { top: -4, left: -4 } },
    { id: 'se', position: { bottom: -4, right: -4 } },
    { id: 'sw', position: { bottom: -4, left: -4 } },
  ];

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-40" 
      style={{ overflow: 'visible' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Selection Border - Blue */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="absolute"
        style={{
          top: bounds.top - CONFIG.SELECTION_BORDER_WIDTH,
          left: bounds.left - CONFIG.SELECTION_BORDER_WIDTH,
          width: bounds.width + CONFIG.SELECTION_BORDER_WIDTH * 2,
          height: bounds.height + CONFIG.SELECTION_BORDER_WIDTH * 2,
          border: `${CONFIG.SELECTION_BORDER_WIDTH}px solid #3b82f6`,
          borderRadius: '2px',
          boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.2), 0 4px 12px rgba(59, 130, 246, 0.15)',
          // 🔥 CRITICAL FIX: Allow pointer events to pass through
          pointerEvents: 'none', // Change from 'auto' to 'none'
        }}
      >
        {/* Component Info Label - Top Left - SINGLE LABEL ONLY */}
        {isOverlayEnabled('showLabel') && 
        <motion.div
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute px-2 py-1 rounded text-xs font-semibold shadow-lg flex items-center gap-2"
          style={{
            top: -CONFIG.LABEL_HEIGHT - 4,
            left: -CONFIG.SELECTION_BORDER_WIDTH,
            backgroundColor: '#3b82f6',
            color: 'white',
            whiteSpace: 'nowrap',
            pointerEvents: 'auto',
            zIndex: 100,
          }}
        >
          {/* Component type icon */}
          {selectedComponent?.isLayoutContainer && (
            <div className="w-3 h-3 border border-white rounded-sm opacity-70" />
          )}
          
          {/* Lock indicator */}
          {selectedComponent?.locked && <Lock className="w-3 h-3" />}
          
          {/* Visibility indicator */}
          {selectedComponent?.visible === false && <EyeOff className="w-3 h-3" />}
        </motion.div>
        }
        
        {/* Size Label - Bottom Right - ONLY */}
        {isOverlayEnabled('showCoordinates') &&
        <motion.div
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute px-2 py-1 rounded text-xs font-mono shadow-lg"
          style={{
            bottom: -CONFIG.LABEL_HEIGHT - 4,
            right: -CONFIG.SELECTION_BORDER_WIDTH,
            backgroundColor: '#1f2937',
            color: 'white',
            whiteSpace: 'nowrap',
            zIndex: 100,
          }}
        >
          {Math.round(bounds.width)} × {Math.round(bounds.height)}
        </motion.div>
        }


        {/* Position Label - ONLY for absolute/fixed/relative positioned elements */}
        {computedStyles.position && ['absolute', 'fixed', 'relative'].includes(computedStyles.position) && (
          <motion.div
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute px-2 py-1 rounded text-xs font-mono shadow-lg"
            style={{
              bottom: -CONFIG.LABEL_HEIGHT - 4,
              left: -CONFIG.SELECTION_BORDER_WIDTH,
              backgroundColor: '#6b7280',
              color: 'white',
              whiteSpace: 'nowrap',
              zIndex: 100,
            }}
          >
            {computedStyles.position} • x:{Math.round(bounds.left)} y:{Math.round(bounds.top)}
          </motion.div>
        )}

        {/* Resize Handles - Show on hover */}
        <AnimatePresence>
          {(isHovered || isResizing) && !selectedComponent?.locked && (
            <>
              {resizeHandles.map(handle => (
                <motion.div
                  key={handle.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: isResizing && resizeHandle === handle.id ? 1.5 : 1, 
                    opacity: 1 
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bg-white border-2 border-blue-500 rounded-full pointer-events-auto cursor-pointer hover:scale-150 transition-transform"
                  style={{
                    ...handle.position,
                    width: CONFIG.HANDLE_SIZE,
                    height: CONFIG.HANDLE_SIZE,
                    cursor: CONFIG.RESIZE_CURSORS[handle.id],
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    // 🔥 Keep pointer events ONLY for resize handles
                    pointerEvents: 'auto', // This should remain 'auto'
                  }}
                  onMouseDown={(e) => handleResizeStart(handle.id, e)}
                />
              ))}
            </>
          )}
        </AnimatePresence>

       {/* Quick Actions Toolbar - Show on hover or when actions toggled */}
        <AnimatePresence>
          {(isHovered || showActions || true) && ( // 🔥 ADD: || true to always show when selected
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute flex items-center gap-1 px-2 py-1 rounded-lg shadow-xl border pointer-events-auto"
              style={{
                top: -CONFIG.ACTIONS_HEIGHT - CONFIG.LABEL_HEIGHT - 8,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'white',
                borderColor: '#e5e7eb',
                // 🔥 Keep pointer events for the toolbar itself
                pointerEvents: 'auto', // This should remain 'auto'
              }}
            >
              {/* Lock/Unlock */}
              <button
                onClick={() => onLock?.(componentId)}
                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                title={selectedComponent?.locked ? 'Unlock' : 'Lock'}
              >
                {selectedComponent?.locked ? (
                  <Lock className="w-4 h-4 text-gray-600" />
                ) : (
                  <Unlock className="w-4 h-4 text-gray-600" />
                )}
              </button>

              {/* Show/Hide */}
              <button
                onClick={() => onToggleVisibility?.(componentId)}
                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                title={selectedComponent?.visible === false ? 'Show' : 'Hide'}
              >
                {selectedComponent?.visible === false ? (
                  <EyeOff className="w-4 h-4 text-gray-600" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-600" />
                )}
              </button>

              {/* Divider */}
              <div className="w-px h-4 bg-gray-300" />

              {/* Duplicate */}
              <button
                onClick={() => onDuplicate?.(componentId)}
                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                title="Duplicate (Cmd+D)"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>

              {/* Delete */}
              <button
                onClick={() => onDelete?.(componentId)}
                className="p-1.5 rounded hover:bg-red-50 transition-colors"
                title="Delete (Del)"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>

              {/* Divider */}
              <div className="w-px h-4 bg-gray-300" />
              
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      
      {/* Margin Visualization - FOR ALL COMPONENTS (no layout check) */}
      <AnimatePresence>
        {isOverlayEnabled('showSpacingIndicators') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Top Margin */}
            {computedStyles.marginTop > 0 && (
              <div
                className="absolute"
                style={{
                  top: bounds.top - computedStyles.marginTop,
                  left: bounds.left,
                  width: bounds.width,
                  height: computedStyles.marginTop,
                  backgroundColor: `${CONFIG.SPACING_COLOR.margin}20`,
                  borderTop: `1px dashed ${CONFIG.SPACING_COLOR.margin}`,
                  borderBottom: `1px dashed ${CONFIG.SPACING_COLOR.margin}`,
                  pointerEvents: 'none',
                  zIndex: 100,
                }}
              >
                <span 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm"
                  style={{ backgroundColor: CONFIG.SPACING_COLOR.margin, color: 'white' }}
                >
                  {Math.round(computedStyles.marginTop)}
                </span>
              </div>
            )}
            
            {/* Right Margin */}
            {computedStyles.marginRight > 0 && (
              <div
                className="absolute"
                style={{
                  top: bounds.top,
                  left: bounds.left + bounds.width,
                  width: computedStyles.marginRight,
                  height: bounds.height,
                  backgroundColor: `${CONFIG.SPACING_COLOR.margin}20`,
                  borderLeft: `1px dashed ${CONFIG.SPACING_COLOR.margin}`,
                  borderRight: `1px dashed ${CONFIG.SPACING_COLOR.margin}`,
                  pointerEvents: 'none',
                  zIndex: 100,
                }}
              >
                <span 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm"
                  style={{ backgroundColor: CONFIG.SPACING_COLOR.margin, color: 'white' }}
                >
                  {Math.round(computedStyles.marginRight)}
                </span>
              </div>
            )}
            
            {/* Bottom Margin */}
            {computedStyles.marginBottom > 0 && (
              <div
                className="absolute"
                style={{
                  top: bounds.top + bounds.height,
                  left: bounds.left,
                  width: bounds.width,
                  height: computedStyles.marginBottom,
                  backgroundColor: `${CONFIG.SPACING_COLOR.margin}20`,
                  borderTop: `1px dashed ${CONFIG.SPACING_COLOR.margin}`,
                  borderBottom: `1px dashed ${CONFIG.SPACING_COLOR.margin}`,
                  pointerEvents: 'none',
                  zIndex: 100,
                }}
              >
                <span 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm"
                  style={{ backgroundColor: CONFIG.SPACING_COLOR.margin, color: 'white' }}
                >
                  {Math.round(computedStyles.marginBottom)}
                </span>
              </div>
            )}
            
            {/* Left Margin */}
            {computedStyles.marginLeft > 0 && (
              <div
                className="absolute"
                style={{
                  top: bounds.top,
                  left: bounds.left - computedStyles.marginLeft,
                  width: computedStyles.marginLeft,
                  height: bounds.height,
                  backgroundColor: `${CONFIG.SPACING_COLOR.margin}20`,
                  borderLeft: `1px dashed ${CONFIG.SPACING_COLOR.margin}`,
                  borderRight: `1px dashed ${CONFIG.SPACING_COLOR.margin}`,
                  pointerEvents: 'none',
                  zIndex: 100,
                }}
              >
                <span 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm"
                  style={{ backgroundColor: CONFIG.SPACING_COLOR.margin, color: 'white' }}
                >
                  {Math.round(computedStyles.marginLeft)}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      

        {/* Padding Visualization - FOR ALL COMPONENTS */}
        <AnimatePresence>
          {isOverlayEnabled('showSpacingIndicators') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ zIndex: 200 }}
            >
              {/* 🔥 CRITICAL: Padding applies to ACTUAL element bounds, not wrapper */}
              {computedStyles.paddingTop > 0 && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: bounds.top, // 🔥 FIXED: Use element bounds directly
                    left: bounds.left,
                    width: bounds.width,
                    height: computedStyles.paddingTop,
                    backgroundColor: `${CONFIG.SPACING_COLOR.padding}20`,
                    borderTop: `1px dashed ${CONFIG.SPACING_COLOR.padding}`,
                    borderBottom: `1px dashed ${CONFIG.SPACING_COLOR.padding}`,
                    zIndex: 200,
                  }}
                >
                  <span 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm"
                    style={{ 
                      backgroundColor: CONFIG.SPACING_COLOR.padding, 
                      color: 'white',
                      zIndex: 201
                    }}
                  >
                    {Math.round(computedStyles.paddingTop)}
                  </span>
                </div>
              )}
              
              {/* Right Padding */}
              {computedStyles.paddingRight > 0 && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: bounds.top,
                    left: bounds.left + bounds.width - computedStyles.paddingRight, // 🔥 FIXED
                    width: computedStyles.paddingRight,
                    height: bounds.height,
                    backgroundColor: `${CONFIG.SPACING_COLOR.padding}20`,
                    borderLeft: `1px dashed ${CONFIG.SPACING_COLOR.padding}`,
                    borderRight: `1px dashed ${CONFIG.SPACING_COLOR.padding}`,
                    zIndex: 200,
                  }}
                >
                  <span 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm"
                    style={{ backgroundColor: CONFIG.SPACING_COLOR.padding, color: 'white', zIndex: 201 }}
                  >
                    {Math.round(computedStyles.paddingRight)}
                  </span>
                </div>
              )}
              
              {/* Bottom Padding */}
              {computedStyles.paddingBottom > 0 && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: bounds.top + bounds.height - computedStyles.paddingBottom, // 🔥 FIXED
                    left: bounds.left,
                    width: bounds.width,
                    height: computedStyles.paddingBottom,
                    backgroundColor: `${CONFIG.SPACING_COLOR.padding}20`,
                    borderTop: `1px dashed ${CONFIG.SPACING_COLOR.padding}`,
                    borderBottom: `1px dashed ${CONFIG.SPACING_COLOR.padding}`,
                    zIndex: 200,
                  }}
                >
                  <span 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm"
                    style={{ backgroundColor: CONFIG.SPACING_COLOR.padding, color: 'white', zIndex: 201 }}
                  >
                    {Math.round(computedStyles.paddingBottom)}
                  </span>
                </div>
              )}
              
              {/* Left Padding */}
              {computedStyles.paddingLeft > 0 && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: bounds.top,
                    left: bounds.left, // 🔥 FIXED
                    width: computedStyles.paddingLeft,
                    height: bounds.height,
                    backgroundColor: `${CONFIG.SPACING_COLOR.padding}20`,
                    borderLeft: `1px dashed ${CONFIG.SPACING_COLOR.padding}`,
                    borderRight: `1px dashed ${CONFIG.SPACING_COLOR.padding}`,
                    zIndex: 200,
                  }}
                >
                  <span 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm"
                    style={{ backgroundColor: CONFIG.SPACING_COLOR.padding, color: 'white', zIndex: 201 }}
                  >
                    {Math.round(computedStyles.paddingLeft)}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      {/* Nested Components Highlight - Lighter blue borders */}
      <AnimatePresence>
        {nestedComponents.length > 0 && (
          <>
            {nestedComponents.slice(0, 5).map((child, idx) => {
              const childElement = document.querySelector(`[data-component-id="${child.id}"]`);
              if (!childElement || !canvasRef.current) return null;

              const childRect = childElement.getBoundingClientRect();
              const canvasRect = canvasRef.current.getBoundingClientRect();
              const scale = responsiveMode !== 'desktop' ? getResponsiveScaleFactor() : 1;

              const childBounds = {
                top: (childRect.top - canvasRect.top) / scale,
                left: (childRect.left - canvasRect.left) / scale,
                width: childRect.width / scale,
                height: childRect.height / scale,
              };

              return (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  className="absolute border border-dashed pointer-events-none"
                  style={{
                    top: childBounds.top,
                    left: childBounds.left,
                    width: childBounds.width,
                    height: childBounds.height,
                    borderColor: '#93c5fd',
                    borderRadius: '2px',
                  }}
                >
                  <span 
                    className="absolute -top-4 left-0 text-[9px] font-mono px-1 py-0.5 rounded text-blue-600 bg-blue-50"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    ↳ {child.name}
                  </span>
                </motion.div>
              );
            })}

            {nestedComponents.length > 5 && (
              <div
                className="absolute px-2 py-1 rounded text-xs bg-blue-50 text-blue-600 font-semibold shadow-sm"
                style={{
                  bottom: bounds.bottom + 4,
                  right: bounds.right,
                }}
              >
                +{nestedComponents.length - 5} more nested
              </div>
            )}
          </>
        )}
      </AnimatePresence>

       {/* Parent Component Indicator */}
      <AnimatePresence>
        {parentComponent && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute flex items-center gap-1 px-2 py-1 rounded text-xs bg-purple-50 text-purple-600 font-semibold shadow-sm border border-purple-200 pointer-events-auto cursor-pointer hover:bg-purple-100 transition-colors"
            style={{
              bottom: bounds.bottom + 4,
              left: bounds.left,
            }}
            onClick={(e) => {
              e.stopPropagation();
              // 🔥 FIXED: Use onComponentClick if available, otherwise fallback to DOM click
              if (onComponentClick) {
                onComponentClick(parentComponent.id, e);
              } else {
                // Fallback to DOM click
                const parentElement = document.querySelector(`[data-component-id="${parentComponent.id}"]`);
                if (parentElement) {
                  parentElement.click();
                }
              }
            }}
            title="Click to select parent"
          >
            <CornerDownRight className="w-3 h-3" />
            <span>Parent: {parentComponent.name}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transform Indicator - Show if component has transforms */}
      {computedStyles.transform && computedStyles.transform !== 'none' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute flex items-center gap-1 px-2 py-1 rounded text-xs bg-yellow-50 text-yellow-700 font-semibold shadow-sm border border-yellow-200"
          style={{
            top: bounds.top - CONFIG.LABEL_HEIGHT - CONFIG.ACTIONS_HEIGHT - 12,
            right: bounds.right,
          }}
        >
          <RotateCw className="w-3 h-3" />
          <span>Transformed</span>
        </motion.div>
      )}

      {/* Opacity Indicator - Show if component has reduced opacity */}
      {computedStyles.opacity < 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 font-mono font-semibold shadow-sm border border-gray-300"
          style={{
            bottom: bounds.bottom + CONFIG.LABEL_HEIGHT + 8,
            left: bounds.left + bounds.width / 2,
            transform: 'translateX(-50%)',
          }}
        >
          {Math.round(computedStyles.opacity * 100)}% opacity
        </motion.div>
      )}

      {/* Grid Alignment Indicators - Show when grid is visible */}
      {gridVisible && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.3 }}
        >
          {/* Vertical alignment to grid */}
          {Math.round(bounds.left) % 20 === 0 && (
            <line
              x1={bounds.left}
              y1={0}
              x2={bounds.left}
              y2="100%"
              stroke="#8b5cf6"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}
          
          {/* Horizontal alignment to grid */}
          {Math.round(bounds.top) % 20 === 0 && (
            <line
              x1={0}
              y1={bounds.top}
              x2="100%"
              y2={bounds.top}
              stroke="#8b5cf6"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}
        </svg>
      )}

      {/* Resize Feedback Overlay - Show during resize */}
      <AnimatePresence>
        {isResizing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
          >
            <div className="bg-black/80 text-white px-4 py-2 rounded-lg shadow-2xl backdrop-blur-sm">
              <div className="text-sm font-mono font-bold">
                {Math.round(bounds.width)} × {Math.round(bounds.height)}
              </div>
              <div className="text-xs text-gray-300 text-center mt-1">
                Resizing {resizeHandle?.toUpperCase()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
{/*

      <AnimatePresence>
        {(isHovered || true) && !isResizing && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ delay: 0.5 }}
            className="absolute bg-white rounded-lg shadow-2xl border p-3 pointer-events-none"
            style={{
              // 🔥 FIX: Position outside canvas boundaries
              right: bounds.left - 212, // Position to left of element
              top: bounds.top,
              minWidth: '200px',
              borderColor: '#e5e7eb',
              pointerEvents: 'none',
              // 🔥 ADD: Fallback if not enough space on left
              ...(bounds.left < 220 ? {
                left: bounds.right + 12, // Show on right if not enough space on left
                right: 'auto'
              } : {})
            }}
          >
            <div className="text-xs space-y-2">
              <div>
                <div className="text-gray-500 font-semibold mb-1">Component Info</div>
                <div className="font-mono text-gray-900">{selectedComponent?.type || 'unknown'}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-gray-500">Width</div>
                  <div className="font-mono text-gray-900">{Math.round(bounds.width)}px</div>
                </div>
                <div>
                  <div className="text-gray-500">Height</div>
                  <div className="font-mono text-gray-900">{Math.round(bounds.height)}px</div>
                </div>
              </div>

              {(computedStyles.paddingTop > 0 || computedStyles.paddingLeft > 0) && (
                <div>
                  <div className="text-gray-500">Padding</div>
                  <div className="font-mono text-gray-900 text-[10px]">
                    {Math.round(computedStyles.paddingTop)} {Math.round(computedStyles.paddingRight)} {Math.round(computedStyles.paddingBottom)} {Math.round(computedStyles.paddingLeft)}
                  </div>
                </div>
              )}

              {(computedStyles.marginTop > 0 || computedStyles.marginLeft > 0) && (
                <div>
                  <div className="text-gray-500">Margin</div>
                  <div className="font-mono text-gray-900 text-[10px]">
                    {Math.round(computedStyles.marginTop)} {Math.round(computedStyles.marginRight)} {Math.round(computedStyles.marginBottom)} {Math.round(computedStyles.marginLeft)}
                  </div>
                </div>
              )}

              {nestedComponents.length > 0 && (
                <div>
                  <div className="text-gray-500">Children</div>
                  <div className="font-mono text-gray-900">{nestedComponents.length}</div>
                </div>
              )}

              {parentComponent && (
                <div>
                  <div className="text-gray-500">Parent</div>
                  <div className="font-mono text-gray-900 truncate">{parentComponent.name}</div>
                </div>
              )}

              <div>
                <div className="text-gray-500">Z-Index</div>
                <div className="font-mono text-gray-900">{computedStyles.zIndex}</div>
              </div>

              {computedStyles.position !== 'static' && (
                <div>
                  <div className="text-gray-500">Position</div>
                  <div className="font-mono text-gray-900">{computedStyles.position}</div>
                </div>
              )}
            </div>


            <div
              className="absolute w-2 h-2 bg-white border-l border-t transform rotate-45"
              style={{
                left: -5,
                top: 20,
                borderColor: '#e5e7eb',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      */}

      {/* Keyboard Shortcuts Hint - Show on first hover */}
      <AnimatePresence>
        {isHovered && !isResizing && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ delay: 1 }}
            className="absolute bg-black/90 text-white text-xs px-3 py-2 rounded-lg shadow-xl pointer-events-none"
            style={{
              bottom: bounds.bottom + 40,
              left: bounds.left + bounds.width / 2,
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
            }}
          >
            <div className="space-y-1">
              <div><kbd className="bg-white/20 px-1 rounded">⌘D</kbd> Duplicate</div>
              <div><kbd className="bg-white/20 px-1 rounded">Del</kbd> Delete</div>
              <div><kbd className="bg-white/20 px-1 rounded">⇧S</kbd> Toggle Spacing</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      
      {/* 🔥 NEW: Ancestor/Children Hover Overlays */}
    <AnimatePresence>
      {(ancestorHighlights.length > 0 || childrenHighlights.length > 0) && (
        <>
          {/* Ancestor overlays (purple tint) */}
          {ancestorHighlights.map((ancestor) => {
            const element = document.querySelector(`[data-component-id="${ancestor.id}"]`);
            if (!element || !canvasRef.current) return null;
            
            const rect = element.getBoundingClientRect();
            const canvasRect = canvasRef.current.getBoundingClientRect();
            
            const ancestorBounds = {
              top: (rect.top - canvasRect.top),
              left: (rect.left - canvasRect.left),
              width: rect.width,
              height: rect.height,
            };
            
            return (
              <motion.div
                key={`ancestor-${ancestor.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.05 }}
                exit={{ opacity: 0 }}
                className="absolute pointer-events-none"
                style={{
                  top: ancestorBounds.top,
                  left: ancestorBounds.left,
                  width: ancestorBounds.width,
                  height: ancestorBounds.height,
                  backgroundColor: '#8b5cf6',
                  borderRadius: '4px',
                }}
              />
            );
          })}
      
      {/* Children overlays (green tint) */}
      {childrenHighlights.map((child) => {
        const element = document.querySelector(`[data-component-id="${child.id}"]`);
        if (!element || !canvasRef.current) return null;
        
        const rect = element.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        const childBounds = {
          top: (rect.top - canvasRect.top),
          left: (rect.left - canvasRect.left),
          width: rect.width,
          height: rect.height,
        };
        
        return (
          <motion.div
            key={`child-${child.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            exit={{ opacity: 0 }}
            className="absolute pointer-events-none"
            style={{
              top: childBounds.top,
              left: childBounds.left,
              width: childBounds.width,
              height: childBounds.height,
              backgroundColor: '#10b981',
              borderRadius: '4px',
            }}
          />
        );
      })}
    </>
      )}
   </AnimatePresence>
    </div>
  );
};

export default SelectionOverlay;