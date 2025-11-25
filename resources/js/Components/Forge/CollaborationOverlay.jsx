// @/Components/Forge/CollaborationOverlay.jsx - Real-time Collaboration Overlay
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Renders real-time collaboration overlays:
 * - Floating cursors from other users
 * - Element drag ghosts
 * - Selection indicators
 */
const CollaborationOverlay = ({ 
  cursors = [], 
  draggedElements = [],
  selectedElements = [],
  canvasRef,
  responsiveMode,
  zoomLevel = 100,
}) => {
  // 🔥 DEBUG: Log props
  console.log('🎨 CollaborationOverlay render:', { 
    cursorsCount: cursors.length, 
    draggedCount: draggedElements.length,
    selectedCount: selectedElements.length,
    hasCanvasRef: !!canvasRef?.current
  });

  // Get canvas bounds for coordinate transformation
  const canvasBounds = useMemo(() => {
    if (!canvasRef?.current) {
      console.warn('⚠️ CollaborationOverlay: No canvas ref');
      return null;
    }
    const bounds = canvasRef.current.getBoundingClientRect();
    console.log('📐 Canvas bounds:', bounds);
    return bounds;
  }, [canvasRef, cursors.length, draggedElements.length]);

  if (!canvasBounds) {
    console.warn('⚠️ CollaborationOverlay: No canvas bounds, not rendering');
    return null;
  }

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-[9999]"
      style={{ 
        overflow: 'visible',
        isolation: 'isolate',
      }}
    >
      {/* Render cursors */}
      <AnimatePresence>
        {cursors.map((cursor) => (
          <CollaboratorCursor
            key={`${cursor.userId}-${cursor.sessionId}`}
            cursor={cursor}
            canvasBounds={canvasBounds}
            responsiveMode={responsiveMode}
            zoomLevel={zoomLevel}
          />
        ))}
      </AnimatePresence>

      {/* Render dragged elements */}
      <AnimatePresence>
        {draggedElements.map((draggedEl) => (
          <DraggedElementGhost
            key={`${draggedEl.userId}-${draggedEl.sessionId}-${draggedEl.componentId}`}
            draggedElement={draggedEl}
            canvasBounds={canvasBounds}
            responsiveMode={responsiveMode}
            zoomLevel={zoomLevel}
          />
        ))}
      </AnimatePresence>

      {/* Render selection indicators */}
      <AnimatePresence>
        {selectedElements.map((selection) => (
          <SelectionIndicator
            key={`${selection.userId}-${selection.sessionId}-${selection.componentId}`}
            selection={selection}
            canvasBounds={canvasBounds}
            responsiveMode={responsiveMode}
            zoomLevel={zoomLevel}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * Individual collaborator cursor with smooth following
 * Supports both desktop mouse and mobile touch cursors
 */
const CollaboratorCursor = ({ cursor, canvasBounds, responsiveMode, zoomLevel }) => {
  const scale = zoomLevel / 100;
  
  // Calculate absolute position (cursor coordinates are relative to canvas)
  const x = canvasBounds.left + (cursor.x * scale);
  const y = canvasBounds.top + (cursor.y * scale);
  
  // Detect if this is a touch/mobile cursor
  const isTouch = cursor.meta?.isTouch || false;
  const isClicking = cursor.meta?.isClicking || false;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: x,
        y: y,
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        type: "spring",
        stiffness: 600,  // 🔥 Increased for smoother following
        damping: 30,     // 🔥 Reduced for more fluid movement
        mass: 0.5,
      }}
      className="fixed pointer-events-none"
      style={{
        left: 0,
        top: 0,
        zIndex: 10000,
      }}
    >
      {/* Cursor SVG */}
      {/* Cursor icon - Different for touch vs mouse */}
      {isTouch ? (
        // Touch cursor (hand pointer icon)
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
          }}
        >
          <path
            d="M9 11V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V11M9 11C9 11 9 11.5 9 12M9 11H7C5.34315 11 4 12.3431 4 14C4 15.6569 5.34315 17 7 17H9M15 11V13M15 11H17C18.6569 11 20 12.3431 20 14C20 15.6569 18.6569 17 17 17H15M15 13V17M9 12V17M9 12H11M15 17V19C15 20.1046 14.1046 21 13 21H11C9.89543 21 9 20.1046 9 19V17M15 17H9"
            stroke={cursor.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="white"
          />
        </svg>
      ) : (
        // Desktop cursor (pointer arrow)
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          }}
        >
          <path
            d="M5.65376 12.3673L8.55578 19.8442L11.4558 18.3442L14.3558 25.8211L17.2558 24.3211L14.3558 16.8442L17.2558 15.3442L5.65376 12.3673Z"
            fill={cursor.color}
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {/* User name label */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap shadow-lg"
        style={{
          backgroundColor: cursor.color,
          color: 'white',
        }}
      >
        {cursor.userName}
        {cursor.meta?.isTouch && (
          <span className="ml-1 opacity-75">📱</span>
        )}
      </motion.div>

      {/* Ripple effect for touch/click */}
      {cursor.meta?.isClicking && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0.6 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute rounded-full"
          style={{
            width: 40,
            height: 40,
            border: `2px solid ${cursor.color}`,
            top: -8,
            left: -8,
          }}
        />
      )}
    </motion.div>
  );
};

/**
 * Ghost representation of element being dragged by another user
 */
const DraggedElementGhost = ({ draggedElement, canvasBounds, responsiveMode, zoomLevel }) => {
  const scale = zoomLevel / 100;
  
  const x = canvasBounds.left + (draggedElement.x * scale);
  const y = canvasBounds.top + (draggedElement.y * scale);
  
  const width = draggedElement.bounds.width * scale;
  const height = draggedElement.bounds.height * scale;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 0.6,
        x: x,
        y: y,
      }}
      exit={{ opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className="fixed pointer-events-none"
      style={{
        left: 0,
        top: 0,
        width: width,
        height: height,
        border: `2px dashed ${draggedElement.color}`,
        borderRadius: '4px',
        backgroundColor: `${draggedElement.color}20`,
        zIndex: 9999,
      }}
    >
      {/* 🔥 Enhanced: Label with dragging state */}
      <motion.div
        initial={{ y: -5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="absolute -top-7 left-0 px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow-lg flex items-center gap-1"
        style={{
          backgroundColor: draggedElement.color,
          color: 'white',
        }}
      >
        <span>↔️</span>
        <span>{draggedElement.userName || 'User'}</span>
        <span className="opacity-75 text-[10px]">• dragging</span>
        <span className="font-bold">{draggedElement.componentName}</span>
      </motion.div>
    </motion.div>
  );
};

/**
 * Selection indicator showing which element another user has selected
 */
const SelectionIndicator = ({ selection, canvasBounds, responsiveMode, zoomLevel }) => {
  // Find the element in the DOM
  const element = document.querySelector(`[data-component-id="${selection.componentId}"]`);
  
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  const scale = zoomLevel / 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed pointer-events-none"
      style={{
        left: rect.left - 2,
        top: rect.top - 2,
        width: rect.width + 4,
        height: rect.height + 4,
        border: `2px solid ${selection.color}`,
        borderRadius: '4px',
        boxShadow: `0 0 0 1px ${selection.color}40`,
        zIndex: 9998,
      }}
    >
      {/* 🔥 Enhanced: User name tag with state indicator */}
      <motion.div
        initial={{ y: -5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="absolute -top-7 left-0 px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow-lg flex items-center gap-1"
        style={{
          backgroundColor: selection.color,
          color: 'white',
        }}
      >
        {selection.userAvatar ? (
          <img 
            src={selection.userAvatar} 
            alt={selection.userName}
            className="w-3 h-3 rounded-full"
          />
        ) : (
          <div 
            className="w-3 h-3 rounded-full flex items-center justify-center text-[8px]"
            style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
          >
            {selection.userName.charAt(0).toUpperCase()}
          </div>
        )}
        <span>{selection.userName}</span>
        <span className="opacity-75 text-[10px]">• selecting</span>
      </motion.div>
    </motion.div>
  );
};

export default CollaborationOverlay;