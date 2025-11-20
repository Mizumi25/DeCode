// @/hooks/useCustomDrag.js - Premium Framer/Webflow-style drag system
import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Premium custom drag system with:
 * - Smooth ghost clone following cursor (requestAnimationFrame)
 * - Placeholder for layout spacing
 * - Bounding box hit detection
 * - Nesting validation
 * - GPU-accelerated transforms
 */
// Find this at the top of the hook (around line 10-20)
export const useCustomDrag = ({
  componentId,
  component,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
  enabled = true,
  canvasRef,
  getDropTarget,
  validateDrop,
  threshold = 3, // 🔥 ADD THIS LINE
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragState, setDragState] = useState(null);
  const [ghostPosition, setGhostPosition] = useState({ x: 0, y: 0 });
  const [placeholderPosition, setPlaceholderPosition] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [dropIntent, setDropIntent] = useState(null); // 'before', 'after', 'inside'

  const dragStartPos = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const originalElementRef = useRef(null);
  const ghostElementRef = useRef(null);
  const placeholderElementRef = useRef(null);
  const rafId = useRef(null);
  const lastPointerPos = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false); // 🔥 Use ref to avoid stale closures
  const interactionStateRef = useRef({
    isWatching: false,
    startX: 0,
    startY: 0,
    hasCrossedThreshold: false,
  });

  /**
   * Create ghost clone element
   */
  const createGhostClone = useCallback((element) => {
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    const ghost = element.cloneNode(true);
    
    // Clean up cloned element
    ghost.removeAttribute('data-dnd-kit-draggable-context-id');
    ghost.removeAttribute('draggable');
    
    // Style ghost for smooth dragging - FIXED size and positioning
    ghost.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      max-width: ${rect.width}px;
      max-height: ${rect.height}px;
      pointer-events: none;
      opacity: 0.85;
      transform: translate(0, 0);
      z-index: 99999;
      filter: drop-shadow(0 12px 24px rgba(0,0,0,0.25));
      border: 2px solid rgba(59, 130, 246, 0.6);
      border-radius: 8px;
      background: white;
      will-change: left, top;
      transition: none;
      box-sizing: border-box;
      overflow: hidden;
    `;

    // Make all children non-interactive
    ghost.querySelectorAll('*').forEach(child => {
      child.style.pointerEvents = 'none';
    });

    document.body.appendChild(ghost);
    return ghost;
  }, []);

  /**
   * Create placeholder element - works with normal DOM flow (not absolute)
   */
  const createPlaceholder = useCallback((element) => {
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    const placeholder = document.createElement('div');
    
    // 🔥 CRITICAL: Use the same display type as the original element for proper flow
    const display = computedStyle.display || 'block';
    const width = computedStyle.width || `${rect.width}px`;
    const height = computedStyle.height || `${rect.height}px`;
    
    placeholder.style.cssText = `
      display: ${display};
      width: ${width};
      height: ${height};
      min-height: ${Math.max(40, rect.height)}px;
      border: 2px dashed rgba(59, 130, 246, 0.7);
      border-radius: 4px;
      background: rgba(59, 130, 246, 0.15);
      pointer-events: none;
      transition: all 0.2s ease;
      opacity: 0.9;
      margin: ${computedStyle.margin || '0'};
      padding: ${computedStyle.padding || '0'};
      box-sizing: ${computedStyle.boxSizing || 'border-box'};
      position: relative;
    `;
    
    // 🔥 ADD: Visual indicator inside placeholder
    const indicator = document.createElement('div');
    indicator.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 8px 12px;
      background: rgba(59, 130, 246, 0.9);
      color: white;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      pointer-events: none;
      z-index: 1;
    `;
    indicator.textContent = 'Drop here';
    placeholder.appendChild(indicator);

    placeholder.setAttribute('data-placeholder-id', componentId);
    placeholder.setAttribute('data-component-id', componentId);
    placeholder.className = 'drag-placeholder';
    
    // 🔥 Insert placeholder where original element was (DOM flow, not absolute)
    if (element.parentNode) {
      element.parentNode.insertBefore(placeholder, element);
    }
    
    return placeholder;
  }, [componentId]);

  /**
   * Update ghost position using requestAnimationFrame - FIXED offset calculation
   */
  const updateGhostPosition = useCallback((x, y) => {
    if (!ghostElementRef.current) return;

    cancelAnimationFrame(rafId.current);
    
    rafId.current = requestAnimationFrame(() => {
      if (ghostElementRef.current) {
        // 🔥 FIX: Position ghost at cursor minus offset (top-left corner positioning)
        const adjustedX = x - dragOffset.current.x;
        const adjustedY = y - dragOffset.current.y;
        
        // Use left/top instead of transform for more accurate positioning
        ghostElementRef.current.style.left = `${adjustedX}px`;
        ghostElementRef.current.style.top = `${adjustedY}px`;
        ghostElementRef.current.style.transform = 'translate(0, 0)'; // Reset transform
        setGhostPosition({ x: adjustedX, y: adjustedY });
      }
    });
  }, []);

  /**
   * Detect drop target and intent using bounding boxes
   */
  /**
 * Detect drop target and intent using bounding boxes
 * 🔥 ENHANCED: Better nested container detection
 */
const detectDropTarget = useCallback((pointerX, pointerY) => {
  if (!canvasRef?.current) return null;

  const canvasRect = canvasRef.current.getBoundingClientRect();
  const relativeX = pointerX - canvasRect.left;
  const relativeY = pointerY - canvasRect.top;

  // 🔥 NEW: Get all potential drop targets, prioritize deepest (most nested)
  const allElements = Array.from(
    canvasRef.current.querySelectorAll('[data-component-id]')
  ).filter(el => el.getAttribute('data-component-id') !== componentId);
  
  // Sort by nesting depth (deepest first) and then by size (smallest first)
  const sortedElements = allElements
    .map(element => {
      const depth = parseInt(element.getAttribute('data-depth') || '0');
      const rect = element.getBoundingClientRect();
      return { element, depth, rect, area: rect.width * rect.height };
    })
    .sort((a, b) => {
      // Prioritize depth first
      if (b.depth !== a.depth) return b.depth - a.depth;
      // Then prioritize smaller elements (more specific targets)
      return a.area - b.area;
    });

  let bestTarget = null;
  let bestIntent = null;

  for (const { element, depth, rect } of sortedElements) {
    const targetId = element.getAttribute('data-component-id');
    
    const elementRect = {
      left: rect.left - canvasRect.left,
      right: rect.right - canvasRect.left,
      top: rect.top - canvasRect.top,
      bottom: rect.bottom - canvasRect.top,
      width: rect.width,
      height: rect.height,
    };

    // Check if pointer is inside element bounds
    const isInside = 
      relativeX >= elementRect.left &&
      relativeX <= elementRect.right &&
      relativeY >= elementRect.top &&
      relativeY <= elementRect.bottom;

    if (isInside) {
      const isLayout = element.getAttribute('data-is-layout') === 'true';

      // Determine drop intent
      let intent = null;
      
      if (isLayout) {
        // 🔥 ENHANCED: Layout containers with better zone detection
        const edgeThreshold = Math.min(30, elementRect.height * 0.15); // 15% or 30px max
        
        const topZone = elementRect.top + edgeThreshold;
        const bottomZone = elementRect.bottom - edgeThreshold;

        if (relativeY < topZone) {
          intent = 'before';
        } else if (relativeY > bottomZone) {
          intent = 'after';
        } else {
          // Check if there are children - if yes, prefer nesting deeper
          const hasChildren = element.children.length > 0;
          intent = 'inside'; // Always allow nesting in the middle zone
        }
      } else {
        // Non-layout: only before/after
        const centerY = elementRect.top + elementRect.height / 2;
        intent = relativeY < centerY ? 'before' : 'after';
      }

      // Found the deepest matching target
      bestTarget = {
        id: targetId,
        element,
        bounds: elementRect,
        isLayout,
        depth,
      };
      bestIntent = intent;
      break; // Stop at first (deepest) match
    }
  }

  return bestTarget ? { target: bestTarget, intent: bestIntent } : null;
}, [componentId, canvasRef]);

  /**
   * Cleanup drag state - Defined early so it can be referenced by other handlers
   */
  const cleanup = useCallback(() => {
    // Remove ghost
    if (ghostElementRef.current) {
      ghostElementRef.current.style.transition = 'opacity 0.15s ease';
      ghostElementRef.current.style.opacity = '0';
      setTimeout(() => {
        if (ghostElementRef.current?.parentNode) {
          ghostElementRef.current.parentNode.removeChild(ghostElementRef.current);
        }
        ghostElementRef.current = null;
      }, 150);
    }

    // Remove placeholder
    if (placeholderElementRef.current?.parentNode) {
      placeholderElementRef.current.parentNode.removeChild(placeholderElementRef.current);
      placeholderElementRef.current = null;
    }

    // Restore original element
    if (originalElementRef.current) {
      originalElementRef.current.style.opacity = '';
      originalElementRef.current.style.pointerEvents = '';
      originalElementRef.current = null;
    }

    // Cancel RAF
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    // Remove global listeners - use stored handlers
    if (dragStartPos.current?.moveHandler) {
      document.removeEventListener('pointermove', dragStartPos.current.moveHandler);
      document.removeEventListener('touchmove', dragStartPos.current.moveHandler);
    }
    if (dragStartPos.current?.upHandler) {
      document.removeEventListener('pointerup', dragStartPos.current.upHandler);
      document.removeEventListener('touchend', dragStartPos.current.upHandler);
    }

    // Restore body styles
    document.body.style.overflow = '';
    document.body.style.userSelect = '';

    // Reset state
    isDraggingRef.current = false; // 🔥 Reset ref
    setIsDragging(false);
    setDragState(null);
    setGhostPosition({ x: 0, y: 0 });
    setPlaceholderPosition(null);
    setDropTarget(null);
    setDropIntent(null);
    dragStartPos.current = null;
    dragOffset.current = { x: 0, y: 0 };
    interactionStateRef.current = {
      isWatching: false,
      startX: 0,
      startY: 0,
      hasCrossedThreshold: false,
    };
  }, []);

  /**
   * Handle pointer move (during drag) - Fixed closure issues
   */
  const handlePointerMove = useCallback((e) => {
  if (!interactionStateRef.current.isWatching) return;

  e.preventDefault();
  e.stopPropagation();

  const pointerX = e.touches?.[0]?.clientX ?? e.clientX;
  const pointerY = e.touches?.[0]?.clientY ?? e.clientY;

  lastPointerPos.current = { x: pointerX, y: pointerY };

  // 🔥 THRESHOLD CHECK
  if (!interactionStateRef.current.hasCrossedThreshold) {
    const deltaX = Math.abs(pointerX - interactionStateRef.current.startX);
    const deltaY = Math.abs(pointerY - interactionStateRef.current.startY);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < threshold) {
      return;
    }

    console.log('🎯 Threshold crossed, starting drag...');
    interactionStateRef.current.hasCrossedThreshold = true;
    
    if (originalElementRef.current) {
      const ghost = createGhostClone(originalElementRef.current);
      ghostElementRef.current = ghost;

      const placeholder = createPlaceholder(originalElementRef.current);
      placeholderElementRef.current = placeholder;

      originalElementRef.current.style.opacity = '0.3';
      originalElementRef.current.style.pointerEvents = 'none';

      isDraggingRef.current = true;
      setIsDragging(true);
      setDragState({
        componentId,
        component,
        startPosition: { x: pointerX, y: pointerY },
      });

      onDragStart?.({
        componentId,
        component,
        position: { x: pointerX, y: pointerY },
      });
    }
  }

  // 🔥 ADD THIS: Broadcast drag movement in real-time
  if (isDraggingRef.current && ghostElementRef.current) {
    updateGhostPosition(pointerX, pointerY);

    const dropInfo = detectDropTarget(pointerX, pointerY);
    if (dropInfo) {
      setDropTarget(dropInfo.target);
      setDropIntent(dropInfo.intent);

      if (placeholderElementRef.current) {
        const targetElement = dropInfo.target.element;
        const placeholder = placeholderElementRef.current;
        
        if (dropInfo.intent === 'before') {
          if (targetElement.parentNode && placeholder.parentNode !== targetElement.parentNode) {
            targetElement.parentNode.insertBefore(placeholder, targetElement);
          } else if (placeholder.nextSibling !== targetElement) {
            targetElement.parentNode.insertBefore(placeholder, targetElement);
          }
        } else if (dropInfo.intent === 'after') {
          if (targetElement.parentNode) {
            if (targetElement.nextSibling !== placeholder) {
              if (placeholder.parentNode) {
                placeholder.parentNode.removeChild(placeholder);
              }
              if (targetElement.nextSibling) {
                targetElement.parentNode.insertBefore(placeholder, targetElement.nextSibling);
              } else {
                targetElement.parentNode.appendChild(placeholder);
              }
            }
          }
        } else if (dropInfo.intent === 'inside') {
          if (targetElement !== placeholder.parentNode) {
            if (placeholder.parentNode) {
              placeholder.parentNode.removeChild(placeholder);
            }
            if (targetElement.firstChild) {
              targetElement.insertBefore(placeholder, targetElement.firstChild);
            } else {
              targetElement.appendChild(placeholder);
            }
          }
        }
      }
    } else {
      setDropTarget(null);
      setDropIntent(null);
    }

    // 🔥 NEW: Call onDragMove to broadcast position
    onDragMove?.({
      componentId,
      position: { x: pointerX, y: pointerY },
      dropTarget: dropInfo?.target,
      dropIntent: dropInfo?.intent,
    });
  }
}, [updateGhostPosition, detectDropTarget, componentId, component, canvasRef, onDragMove, onDragStart, threshold, createGhostClone, createPlaceholder]);

  /**
   * Handle pointer up (end drag)
   */
  const handlePointerUp = useCallback((e) => {
    if (!interactionStateRef.current.isWatching) return;

    const pointerX = e.touches?.[0]?.clientX ?? e.changedTouches?.[0]?.clientX ?? e.clientX;
    const pointerY = e.touches?.[0]?.clientY ?? e.changedTouches?.[0]?.clientY ?? e.clientY;

    // 🔥 CRITICAL: Check if drag was ever started
    if (!interactionStateRef.current.hasCrossedThreshold) {
      console.log('✅ Click detected (within threshold)');
      
      interactionStateRef.current.isWatching = false;
      interactionStateRef.current.hasCrossedThreshold = false;
      
      cleanup();
      return;
    }

    // Drag occurred - handle drop
    const dropInfo = detectDropTarget(pointerX, pointerY);
    
    const isValid = validateDrop?.({
      componentId,
      dropTarget: dropInfo?.target,
      dropIntent: dropInfo?.intent,
    }) ?? true;

    if (isValid && dropInfo) {
      onDragEnd?.({
        componentId,
        component,
        dropTarget: dropInfo.target,
        dropIntent: dropInfo.intent,
        position: { x: pointerX, y: pointerY },
      });
    } else {
      onDragCancel?.({
        componentId,
        component,
      });
    }

    interactionStateRef.current.isWatching = false;
    interactionStateRef.current.hasCrossedThreshold = false;

    cleanup();
  }, [detectDropTarget, validateDrop, componentId, component, onDragEnd, onDragCancel, cleanup]);

  /**
   * Handle pointer down (start drag)
   */
  const handlePointerDown = useCallback((e) => {
    if (!enabled) return;
    
    e.preventDefault();
    e.stopPropagation();

    const dragHandle = e.currentTarget;
    const componentElement = dragHandle.closest('[data-component-id]') || 
                             document.querySelector(`[data-component-id="${componentId}"]`);
    
    if (!componentElement) {
      console.warn('⚠️ Could not find component element');
      return;
    }

    originalElementRef.current = componentElement;
    
    const rect = componentElement.getBoundingClientRect();
    const pointerX = e.touches?.[0]?.clientX ?? e.clientX;
    const pointerY = e.touches?.[0]?.clientY ?? e.clientY;

    dragOffset.current = {
      x: pointerX - rect.left,
      y: pointerY - rect.top,
    };

    // 🔥 NEW: Start watching (don't create ghost yet)
    interactionStateRef.current = {
      isWatching: true,
      startX: pointerX,
      startY: pointerY,
      hasCrossedThreshold: false,
    };

    dragStartPos.current = { x: pointerX, y: pointerY };
    lastPointerPos.current = { x: pointerX, y: pointerY };

    const moveHandler = (moveEvent) => {
      if (!interactionStateRef.current.isWatching) return;
      handlePointerMove(moveEvent);
    };
    
    const upHandler = (upEvent) => {
      if (!interactionStateRef.current.isWatching) return;
      handlePointerUp(upEvent);
    };

    document.addEventListener('pointermove', moveHandler);
    document.addEventListener('pointerup', upHandler);
    document.addEventListener('touchmove', moveHandler, { passive: false });
    document.addEventListener('touchend', upHandler);

    dragStartPos.current.moveHandler = moveHandler;
    dragStartPos.current.upHandler = upHandler;

    document.body.style.overflow = 'hidden';
    document.body.style.userSelect = 'none';
  }, [enabled, componentId, component, handlePointerMove, handlePointerUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isDragging,
    dragState,
    ghostPosition,
    placeholderPosition,
    dropTarget,
    dropIntent,
    dragHandlers: {
      onPointerDown: handlePointerDown,
      onTouchStart: handlePointerDown,
    },
  };
};

