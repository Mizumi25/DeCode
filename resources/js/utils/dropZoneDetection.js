// @/utils/dropZoneDetection.js - Drop zone detection using bounding boxes
/**
 * Detects valid drop zones and nesting targets using getBoundingClientRect
 * Similar to Framer/Webflow's drop detection system
 */

/**
 * Check if a component can accept children (is a container)
 * 🔥 LIKE REAL DOM: Everything can technically nest (even if semantically wrong)
 */
export const canAcceptChildren = (component) => {
  if (!component) return false;
  
  // 🔥 NEW: Only exclude self-closing elements that CAN'T have children
  const selfClosingTypes = ['input', 'img', 'br', 'hr', 'meta', 'link'];
  if (selfClosingTypes.includes(component.type)) {
    return false; // These physically can't have children
  }
  
  // 🔥 EVERYTHING ELSE can accept children (like real DOM)
  // Yes, even buttons, spans, etc. - DOM allows it even if semantically wrong
  return true;
};

/**
 * Check if dropping would create circular reference
 */
export const wouldCreateCircularRef = (draggedId, targetId, components) => {
  if (draggedId === targetId) return true;

  const findDescendants = (compId, comps) => {
    const descendants = [];
    const find = (id, list) => {
      for (const comp of list) {
        if (comp.id === id) {
          if (comp.children) {
            comp.children.forEach(child => {
              descendants.push(child.id);
              if (child.children) {
                find(child.id, comp.children);
              }
            });
          }
          return;
        }
        if (comp.children) {
          find(id, comp.children);
        }
      }
    };
    find(compId, comps);
    return descendants;
  };

  const descendants = findDescendants(draggedId, components);
  return descendants.includes(targetId);
};

/**
 * Get all valid drop targets in the canvas
 */
export const getValidDropTargets = (canvasRef, excludeId = null) => {
  if (!canvasRef?.current) return [];

  const targets = [];
  const elements = canvasRef.current.querySelectorAll('[data-component-id]');

  elements.forEach(element => {
    const componentId = element.getAttribute('data-component-id');
    if (componentId === excludeId) return;

    const isLayout = element.getAttribute('data-is-layout') === 'true';
    const rect = element.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();

    targets.push({
      id: componentId,
      element,
      isLayout,
      bounds: {
        left: rect.left - canvasRect.left,
        right: rect.right - canvasRect.left,
        top: rect.top - canvasRect.top,
        bottom: rect.bottom - canvasRect.top,
        width: rect.width,
        height: rect.height,
        centerX: (rect.left + rect.right) / 2 - canvasRect.left,
        centerY: (rect.top + rect.bottom) / 2 - canvasRect.top,
      },
    });
  });

  return targets;
};

/**
 * Find the best drop target at a given pointer position
 */
export const findDropTargetAtPosition = (pointerX, pointerY, canvasRef, excludeId = null) => {
  const targets = getValidDropTargets(canvasRef, excludeId);
  if (!targets.length) return null;

  const canvasRect = canvasRef.current.getBoundingClientRect();
  const relativeX = pointerX - canvasRect.left;
  const relativeY = pointerY - canvasRect.top;

  let bestTarget = null;
  let bestIntent = null;
  let minDistance = Infinity;

  targets.forEach(target => {
    const bounds = target.bounds;

    // Check if pointer is inside bounds
    const isInside = 
      relativeX >= bounds.left &&
      relativeX <= bounds.right &&
      relativeY >= bounds.top &&
      relativeY <= bounds.bottom;

    if (isInside) {
      // Determine drop intent based on position
      let intent = null;
      
      if (target.isLayout) {
        // Layout containers: can nest inside
        const topZone = bounds.top + Math.min(40, bounds.height * 0.25);
        const bottomZone = bounds.bottom - Math.min(40, bounds.height * 0.25);

        if (relativeY < topZone) {
          intent = 'before';
        } else if (relativeY > bottomZone) {
          intent = 'after';
        } else {
          intent = 'inside'; // Nest inside
        }
      } else {
        // Non-layout: only before/after
        intent = relativeY < bounds.centerY ? 'before' : 'after';
      }

      // Calculate distance to center for priority
      const distance = Math.hypot(
        relativeX - bounds.centerX,
        relativeY - bounds.centerY
      );

      if (distance < minDistance) {
        minDistance = distance;
        bestTarget = target;
        bestIntent = intent;
      }
    }
  });

  return bestTarget ? { target: bestTarget, intent: bestIntent } : null;
};

/**
 * Calculate placeholder position for drop intent
 */
export const calculatePlaceholderPosition = (dropTarget, dropIntent, canvasRef) => {
  if (!dropTarget || !canvasRef?.current) return null;

  const canvasRect = canvasRef.current.getBoundingClientRect();
  const targetRect = dropTarget.element.getBoundingClientRect();

  if (dropIntent === 'before') {
    return {
      top: targetRect.top - canvasRect.top - 2,
      left: targetRect.left - canvasRect.left,
      width: targetRect.width,
      height: 4,
    };
  } else if (dropIntent === 'after') {
    return {
      top: targetRect.bottom - canvasRect.top + 2,
      left: targetRect.left - canvasRect.left,
      width: targetRect.width,
      height: 4,
    };
  } else if (dropIntent === 'inside') {
    // Placeholder inside container (will be positioned by layout)
    return {
      top: targetRect.top - canvasRect.top + 20,
      left: targetRect.left - canvasRect.left + 20,
      width: targetRect.width - 40,
      height: 40,
    };
  }

  return null;
};

