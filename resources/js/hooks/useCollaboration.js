// resources/js/hooks/useCollaboration.js - ENHANCED

import { useEffect, useState, useCallback, useRef } from 'react';

export const useCollaboration = (frameUuid, currentUserId) => {
  const [activeCursors, setActiveCursors] = useState(new Map());
  const [draggedElements, setDraggedElements] = useState(new Map());
  const [selectedElements, setSelectedElements] = useState(new Map());
  const sessionId = useRef(generateSessionId()).current;
  const channel = useRef(null);
  const cursorThrottle = useRef(null);
  const dragThrottle = useRef(null);
  const touchState = useRef({ isTouch: false, lastTouchTime: 0 });

  // 🔥 NEW: Detect if user is on touch device
  useEffect(() => {
    const detectTouch = () => {
      touchState.current.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };
    detectTouch();
    window.addEventListener('touchstart', detectTouch, { once: true });
  }, []);

 // 🔥 CRITICAL: Initialize Echo connection
  useEffect(() => {
    if (!frameUuid || !window.Echo) {
      console.warn('⚠️ Echo not available or no frameUuid');
      return;
    }

    console.log('🔗 Joining collaboration channel:', frameUuid);

    const channelName = `frame.${frameUuid}`;
    channel.current = window.Echo.join(channelName)
      .here((users) => {
        console.log('👥 Users present:', users.length);
      })
      .joining((user) => {
        console.log('👋 User joining:', user.name);
      })
      .leaving((user) => {
        console.log('👋 User leaving:', user.name);
        // Remove cursors from leaving user
        setActiveCursors(prev => {
          const next = new Map(prev);
          for (const [key, cursor] of next.entries()) {
            if (cursor.userId === user.id) {
              next.delete(key);
            }
          }
          return next;
        });
      })
      // 🔥 CRITICAL: Listen for drag events
      .listen('.element.drag.started', (data) => {
        console.log('🎬 RECEIVED drag started:', data);
        handleDragStarted(data);
      })
      .listen('.element.drag.moving', (data) => {
        console.log('🎯 RECEIVED drag move:', data);
        handleDragMove(data);
      })
      .listen('.element.drag.ended', (data) => {
        console.log('🏁 RECEIVED drag ended:', data);
        handleDragEnd(data);
      })
      // Cursor events
      .listen('.cursor.moved', handleCursorMoved)
      .listenForWhisper('cursor.moved', handleCursorMoved)
      // Selection events
      .listen('.element.selected', handleElementSelected)
      .listen('.element.deselected', handleElementDeselected)
      // 🔥 Component updates
      .listen('.component.updated', (data) => {
        console.log('🔄 RECEIVED component update:', data);
        handleComponentUpdated(data);
      })
      // 🔥 NEW: Listen for granular operations
.listen('.component.operation', (data) => {
  console.log('🔥 Operation received:', data);
  
  switch (data.operation) {
    case 'move':
      handleRemoteMove(data.payload);
      break;
    case 'nest':
      handleRemoteNest(data.payload);
      break;
    case 'reorder':
      handleRemoteReorder(data.payload);
      break;
    case 'style':
      handleRemoteStyle(data.payload);
      break;
  }
});

    // Fetch existing cursors
    fetchActiveCursors();
    
    return () => {
      if (channel.current) {
        removeCursor();
        console.log('🔌 Leaving channel:', channelName);
        window.Echo.leave(channelName);
        channel.current = null;
      }
    };
  }, [frameUuid]);
  
  
  
  
  const handleRemoteMove = useCallback((payload) => {
  const { componentId, finalState } = payload;
  
  // Dispatch PRECISE update event
  window.dispatchEvent(new CustomEvent('remote-component-moved', {
    detail: {
      componentId,
      position: finalState.position,
      parentId: finalState.parentId,
      index: finalState.index,
    }
  }));
}, []);
  
  
  

  // Fetch existing cursors
  const fetchActiveCursors = async () => {
    try {
      const response = await axios.get(`/api/frames/${frameUuid}/collaboration/cursors`, {
        params: { session_id: sessionId }
      });
      
      if (response.data.success) {
        const cursorsMap = new Map();
        response.data.cursors.forEach(cursor => {
          const key = `${cursor.userId}-${cursor.sessionId}`;
          cursorsMap.set(key, cursor);
        });
        setActiveCursors(cursorsMap);
      }
    } catch (error) {
      console.error('Failed to fetch cursors:', error);
    }
  };

  // Handle cursor movement from others
  const handleCursorMoved = useCallback((data) => {
    if (data.userId === currentUserId && data.sessionId === sessionId) {
      return;
    }

    const key = `${data.userId}-${data.sessionId}`;
    setActiveCursors(prev => {
      const next = new Map(prev);
      next.set(key, {
        userId: data.userId,
        sessionId: data.sessionId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        x: data.x,
        y: data.y,
        viewportMode: data.viewportMode,
        color: data.color,
        meta: data.meta,
        lastUpdate: Date.now(),
      });
      return next;
    });

    // Auto-cleanup after 5 seconds
    setTimeout(() => {
      setActiveCursors(prev => {
        const cursor = prev.get(key);
        if (cursor && Date.now() - cursor.lastUpdate > 5000) {
          const next = new Map(prev);
          next.delete(key);
          return next;
        }
        return prev;
      });
    }, 5000);
  }, [currentUserId, sessionId]);

  // 🔥 NEW: Handle element selection
  const handleElementSelected = useCallback((data) => {
    if (data.userId === currentUserId && data.sessionId === sessionId) {
      return;
    }

    const key = `${data.userId}-${data.sessionId}-${data.componentId}`;
    setSelectedElements(prev => {
      const next = new Map(prev);
      
      // Remove previous selection from this user
      for (const [k, sel] of next.entries()) {
        if (sel.userId === data.userId && sel.sessionId === data.sessionId) {
          next.delete(k);
        }
      }
      
      // Add new selection
      next.set(key, {
        userId: data.userId,
        sessionId: data.sessionId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        componentId: data.componentId,
        componentName: data.componentName,
        color: data.color,
      });
      return next;
    });
  }, [currentUserId, sessionId]);

  // 🔥 NEW: Handle element deselection
  const handleElementDeselected = useCallback((data) => {
    if (data.userId === currentUserId && data.sessionId === sessionId) {
      return;
    }

    setSelectedElements(prev => {
      const next = new Map(prev);
      // Remove all selections from this user
      for (const [key, sel] of next.entries()) {
        if (sel.userId === data.userId && sel.sessionId === data.sessionId) {
          next.delete(key);
        }
      }
      return next;
    });
  }, [currentUserId, sessionId]);
  
  
  
  
  // 🔥 NEW: Handle component updates from other users
const handleComponentUpdated = useCallback((data) => {
  if (data.userId === currentUserId && data.sessionId === sessionId) {
    return; // Ignore own updates
  }

  console.log('✅ Applying remote component update:', {
    componentId: data.componentId,
    updateType: data.updateType,
    updates: data.updates,
  });

  // Dispatch custom event for ForgePage to handle
  window.dispatchEvent(new CustomEvent('remote-component-updated', {
    detail: {
      componentId: data.componentId,
      updates: data.updates,
      updateType: data.updateType,
      userId: data.userId,
    }
  }));
}, [currentUserId, sessionId]);




// 🔥 NEW: Broadcast component updates
const broadcastComponentUpdate = useCallback(async (componentId, updates, updateType) => {
  try {
    await axios.post(`/api/frames/${frameUuid}/collaboration/component-update`, {
      component_id: componentId,
      session_id: sessionId,
      updates,
      update_type: updateType,
    });
  } catch (error) {
    console.error('Failed to broadcast component update:', error);
  }
}, [frameUuid, sessionId]);




  
  
  

// 🔥 FIX: Handle drag started
  const handleDragStarted = useCallback((data) => {
    if (data.userId === currentUserId && data.sessionId === sessionId) {
      console.log('⏭️ Ignoring own drag start');
      return;
    }

    console.log('✅ Applying drag start from remote user:', data.userId);

    const key = `${data.userId}-${data.sessionId}-${data.componentId}`;
    setDraggedElements(prev => {
      const next = new Map(prev);
      next.set(key, {
        userId: data.userId,
        sessionId: data.sessionId,
        componentId: data.componentId,
        componentName: data.componentName,
        bounds: data.bounds,
        color: data.color,
        isDragging: true,
        x: data.bounds.x,
        y: data.bounds.y,
      });
      return next;
    });
  }, [currentUserId, sessionId]);

    // 🔥 FIX: Handle drag move
  const handleDragMove = useCallback((data) => {
    if (data.userId === currentUserId && data.sessionId === sessionId) {
      return; // Ignore own movements
    }

    console.log('✅ Applying drag move:', {
      user: data.userId,
      component: data.componentId,
      position: { x: data.x, y: data.y }
    });

    const key = `${data.userId}-${data.sessionId}-${data.componentId}`;
    setDraggedElements(prev => {
      const existing = prev.get(key);
      if (!existing) {
        console.warn('⚠️ Drag move received but no drag start:', key);
        return prev;
      }

      const next = new Map(prev);
      next.set(key, {
        ...existing,
        x: data.x,
        y: data.y,
        bounds: data.bounds,
      });
      return next;
    });
  }, [currentUserId, sessionId]);

    // 🔥 FIX: Handle drag end
  const handleDragEnd = useCallback((data) => {
    if (data.userId === currentUserId && data.sessionId === sessionId) {
      return;
    }

    console.log('✅ Applying drag end:', data.componentId);

    const key = `${data.userId}-${data.sessionId}-${data.componentId}`;
    setDraggedElements(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });

    // 🔥 CRITICAL: Trigger a refresh to get final position from backend
    window.dispatchEvent(new CustomEvent('remote-drag-ended', {
      detail: {
        componentId: data.componentId,
        userId: data.userId
      }
    }));
  }, [currentUserId, sessionId]);

  // 🔥 ENHANCED: Update cursor with touch detection
  const updateCursor = useCallback((x, y, viewportMode, meta = null) => {
    if (cursorThrottle.current) {
      clearTimeout(cursorThrottle.current);
    }

    // Merge touch state into meta
    const enrichedMeta = {
      ...meta,
      isTouch: touchState.current.isTouch,
      timestamp: Date.now(),
    };

    cursorThrottle.current = setTimeout(async () => {
      try {
        await axios.post(`/api/frames/${frameUuid}/collaboration/cursor`, {
          x,
          y,
          viewport_mode: viewportMode,
          session_id: sessionId,
          meta: enrichedMeta,
        });
      } catch (error) {
        console.error('Failed to update cursor:', error);
      }
    }, 50);
  }, [frameUuid, sessionId]);

  // Broadcast drag events
  const broadcastDragStart = useCallback(async (componentId, componentName, bounds) => {
    try {
      await axios.post(`/api/frames/${frameUuid}/collaboration/drag-start`, {
        component_id: componentId,
        component_name: componentName,
        session_id: sessionId,
        bounds,
      });
    } catch (error) {
      console.error('Failed to broadcast drag start:', error);
    }
  }, [frameUuid, sessionId]);

const broadcastDragMove = useCallback((componentId, x, y, bounds) => {
  // 🔥 REMOVED THROTTLE for real-time updates
  try {
    axios.post(`/api/frames/${frameUuid}/collaboration/drag-move`, {
      component_id: componentId,
      session_id: sessionId,
      x,
      y,
      bounds,
    });
  } catch (error) {
    console.error('Failed to broadcast drag move:', error);
  }
}, [frameUuid, sessionId]);

  const broadcastDragEnd = useCallback(async (componentId) => {
    try {
      await axios.post(`/api/frames/${frameUuid}/collaboration/drag-end`, {
        component_id: componentId,
        session_id: sessionId,
      });
    } catch (error) {
      console.error('Failed to broadcast drag end:', error);
    }
  }, [frameUuid, sessionId]);

  // 🔥 NEW: Broadcast selection
  const broadcastSelection = useCallback(async (componentId, componentName) => {
    try {
      // Whisper for instant delivery
      channel.current?.whisper('element.selected', {
        userId: currentUserId,
        sessionId: sessionId,
        componentId,
        componentName,
        userName: window.auth?.user?.name || 'User',
        userAvatar: window.auth?.user?.avatar || null,
        color: getUserColor(currentUserId),
      });
    } catch (error) {
      console.error('Failed to broadcast selection:', error);
    }
  }, [frameUuid, sessionId, currentUserId]);

  // 🔥 NEW: Broadcast deselection
  const broadcastDeselection = useCallback(async () => {
    try {
      channel.current?.whisper('element.deselected', {
        userId: currentUserId,
        sessionId: sessionId,
      });
    } catch (error) {
      console.error('Failed to broadcast deselection:', error);
    }
  }, [frameUuid, sessionId, currentUserId]);

  // Remove cursor
  const removeCursor = useCallback(async () => {
    try {
      await axios.post(`/api/frames/${frameUuid}/collaboration/remove-cursor`, {
        session_id: sessionId,
      });
    } catch (error) {
      console.error('Failed to remove cursor:', error);
    }
  }, [frameUuid, sessionId]);

  // Line ~150: ADD these methods
const broadcastRealtimeUpdate = useCallback(async (componentId, updateType, data) => {
  try {
    await axios.post(`/api/frames/${frameUuid}/collaboration/realtime-update`, {
      component_id: componentId,
      session_id: sessionId,
      update_type: updateType,
      data,
    });
  } catch (error) {
    console.error('Failed to broadcast realtime update:', error);
  }
}, [frameUuid, sessionId]);

const broadcastStateChanged = useCallback(async (componentId, operation, finalState) => {
  try {
    await axios.post(`/api/frames/${frameUuid}/collaboration/state-changed`, {
      component_id: componentId,
      operation,
      final_state: finalState,
    });
  } catch (error) {
    console.error('Failed to broadcast state change:', error);
  }
}, [frameUuid, sessionId]);

// Update return statement (line ~250)
return {
  activeCursors: Array.from(activeCursors.values()),
  draggedElements: Array.from(draggedElements.values()),
  selectedElements: Array.from(selectedElements.values()),
  updateCursor,
  broadcastDragStart, // Keep for initial drag indication
  broadcastDragMove, // Keep for live ghost updates
  broadcastDragEnd, // Keep for cleanup
  broadcastRealtimeUpdate, // 🔥 NEW: For live component updates
  broadcastStateChanged, // 🔥 NEW: For final state changes
  broadcastSelection,
  broadcastDeselection,
  sessionId,
};
};

function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getUserColor(userId) {
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
  ];
  return colors[userId % colors.length];
}