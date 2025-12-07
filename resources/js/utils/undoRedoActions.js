// undoRedoActions.js - Action creators for undo/redo system
// These create reversible action objects with do/undo/serialize/serializeUndo

/**
 * Create action for adding a new component to canvas
 * @param {Function} setComponents - State setter for components
 * @param {Object} component - The component to add
 * @param {Function} broadcast - Optional broadcast function
 */
export const createAddComponentAction = (setComponents, component, broadcast = null) => {
  return {
    type: 'CREATE',
    do: () => {
      console.log('🔨 DO: Add component', component.id);
      setComponents(prev => [...prev, component]);
    },
    undo: () => {
      console.log('⏪ UNDO: Remove component', component.id);
      setComponents(prev => prev.filter(c => c.id !== component.id));
    },
    serialize: () => ({
      type: 'CREATE',
      componentId: component.id,
      component: component,
    }),
    serializeUndo: () => ({
      type: 'DELETE',
      componentId: component.id,
    }),
  };
};

/**
 * Create action for deleting a component
 * @param {Function} setComponents - State setter for components
 * @param {string} componentId - ID of component to delete
 * @param {Object} deletedComponent - The component being deleted (for undo)
 */
export const createDeleteComponentAction = (setComponents, componentId, deletedComponent) => {
  return {
    type: 'DELETE',
    do: () => {
      console.log('🔨 DO: Delete component', componentId);
      setComponents(prev => prev.filter(c => c.id !== componentId));
    },
    undo: () => {
      console.log('⏪ UNDO: Restore component', componentId);
      setComponents(prev => [...prev, deletedComponent]);
    },
    serialize: () => ({
      type: 'DELETE',
      componentId: componentId,
    }),
    serializeUndo: () => ({
      type: 'CREATE',
      componentId: componentId,
      component: deletedComponent,
    }),
  };
};

/**
 * Create action for moving a component (parent change, reordering)
 * This works with your DOM-based system using parent/child relationships
 * @param {Function} setComponents - State setter for components
 * @param {string} componentId - Component being moved
 * @param {Object} oldState - Old parent/index state
 * @param {Object} newState - New parent/index state
 */
export const createMoveComponentAction = (setComponents, componentId, oldState, newState) => {
  const moveComponent = (targetState) => {
    setComponents(prev => {
      // Helper to recursively find and remove component
      const removeFromTree = (components, id) => {
        let removed = null;
        const filtered = components.filter(c => {
          if (c.id === id) {
            removed = c;
            return false;
          }
          return true;
        }).map(c => {
          if (c.children && c.children.length > 0) {
            const result = removeFromTree(c.children, id);
            if (result.removed) {
              removed = result.removed;
              return { ...c, children: result.filtered };
            }
          }
          return c;
        });
        return { filtered, removed };
      };

      // Helper to add component at target location
      const addToTree = (components, component, parentId, index) => {
        if (!parentId || parentId === 'root') {
          // Add to root level
          const newArray = [...components];
          newArray.splice(index, 0, component);
          return newArray;
        }
        
        // Add to specific parent
        return components.map(c => {
          if (c.id === parentId) {
            const newChildren = [...(c.children || [])];
            newChildren.splice(index, 0, component);
            return { ...c, children: newChildren };
          }
          if (c.children && c.children.length > 0) {
            return { ...c, children: addToTree(c.children, component, parentId, index) };
          }
          return c;
        });
      };

      // Remove component from its current location
      const { filtered, removed } = removeFromTree(prev, componentId);
      if (!removed) {
        console.warn('Component not found:', componentId);
        return prev;
      }

      // Add component to new location
      return addToTree(filtered, removed, targetState.parentId, targetState.index);
    });
  };

  return {
    type: 'MOVE',
    do: () => {
      console.log('🔨 DO: Move component', componentId, 'to', newState);
      moveComponent(newState);
    },
    undo: () => {
      console.log('⏪ UNDO: Move component', componentId, 'back to', oldState);
      moveComponent(oldState);
    },
    serialize: () => ({
      type: 'MOVE',
      componentId: componentId,
      parentId: newState.parentId,
      index: newState.index,
    }),
    serializeUndo: () => ({
      type: 'MOVE',
      componentId: componentId,
      parentId: oldState.parentId,
      index: oldState.index,
    }),
  };
};

/**
 * Create action for updating component properties
 * @param {Function} setComponents - State setter for components
 * @param {string} componentId - Component to update
 * @param {Object} oldProps - Old properties
 * @param {Object} newProps - New properties
 */
export const createUpdatePropsAction = (setComponents, componentId, oldProps, newProps) => {
  const updateProps = (targetProps) => {
    // ✅ FIX: Same fix as createUpdateStyleAction
    const updateRecursive = (components) => {
      return components.map(c => {
        if (c.id === componentId) {
          return { ...c, props: { ...c.props, ...targetProps } };
        }
        if (c.children && c.children.length > 0) {
          return { ...c, children: updateRecursive(c.children) };
        }
        return c;
      });
    };
    
    setComponents(prevComponents => {
      if (!Array.isArray(prevComponents)) {
        console.error('❌ createUpdatePropsAction: prevComponents is not an array:', prevComponents);
        return prevComponents;
      }
      return updateRecursive(prevComponents);
    });
  };

  return {
    type: 'UPDATE_PROPS',
    do: () => {
      console.log('🔨 DO: Update props', componentId, newProps);
      updateProps(newProps);
    },
    undo: () => {
      console.log('⏪ UNDO: Restore props', componentId, oldProps);
      updateProps(oldProps);
    },
    serialize: () => ({
      type: 'UPDATE_PROPS',
      componentId: componentId,
      props: newProps,
    }),
    serializeUndo: () => ({
      type: 'UPDATE_PROPS',
      componentId: componentId,
      props: oldProps,
    }),
  };
};

/**
 * Create action for updating component styles
 * @param {Function} setComponents - State setter for components
 * @param {string} componentId - Component to update
 * @param {Object} oldStyle - Old style object
 * @param {Object} newStyle - New style object
 */
export const createUpdateStyleAction = (setComponents, componentId, oldStyle, newStyle) => {
  const updateStyle = (targetStyle) => {
    // ✅ FIX: setComponents is a callback that expects an array of components
    // It should NOT receive prev as a parameter since the callback handles that
    const updateRecursive = (components) => {
      return components.map(c => {
        if (c.id === componentId) {
          return { ...c, style: { ...c.style, ...targetStyle } };
        }
        if (c.children && c.children.length > 0) {
          return { ...c, children: updateRecursive(c.children) };
        }
        return c;
      });
    };
    
    // ✅ Call setComponents as a function that takes (prevComponents) => newComponents
    setComponents(prevComponents => {
      if (!Array.isArray(prevComponents)) {
        console.error('❌ createUpdateStyleAction: prevComponents is not an array:', prevComponents);
        return prevComponents;
      }
      return updateRecursive(prevComponents);
    });
  };

  return {
    type: 'UPDATE_STYLE',
    do: () => {
      console.log('🔨 DO: Update style', componentId, newStyle);
      updateStyle(newStyle);
    },
    undo: () => {
      console.log('⏪ UNDO: Restore style', componentId, oldStyle);
      updateStyle(oldStyle);
    },
    serialize: () => ({
      type: 'UPDATE_STYLE',
      componentId: componentId,
      style: newStyle,
    }),
    serializeUndo: () => ({
      type: 'UPDATE_STYLE',
      componentId: componentId,
      style: oldStyle,
    }),
  };
};

/**
 * Create batched action for drag end (only saves final position, not intermediate)
 * @param {Function} setComponents - State setter for components
 * @param {string} componentId - Component being dragged
 * @param {Object} oldState - Old position/parent state before drag started
 * @param {Object} newState - New position/parent state after drag ended
 */
export const createDragEndAction = (setComponents, componentId, oldState, newState) => {
  // Reuse move action since drag is essentially a move operation
  return createMoveComponentAction(setComponents, componentId, oldState, newState);
};

export default {
  createAddComponentAction,
  createDeleteComponentAction,
  createMoveComponentAction,
  createUpdatePropsAction,
  createUpdateStyleAction,
  createDragEndAction,
};
