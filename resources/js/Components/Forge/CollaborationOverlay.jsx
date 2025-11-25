// @/Components/Forge/CollaborationOverlay.jsx - Real-time Collaboration Overlay
import React, { useState, useEffect, useMemo } from 'react';
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
  const [canvasBounds, setCanvasBounds] = useState(null);
  
  useEffect(() => {
    const updateBounds = () => {
      if (!canvasRef?.current) {
        console.warn('⚠️ CollaborationOverlay: No canvas ref');
        return;
      }
      
      const bounds = canvasRef.current.getBoundingClientRect();
      if (bounds && bounds.width > 0 && bounds.height > 0) {
        console.log('📐 Canvas bounds updated:', bounds);
        setCanvasBounds(bounds);
      }
    };
    
    // Initial update
    updateBounds();
    
    // Update on scroll/resize
    window.addEventListener('scroll', updateBounds, true);
    window.addEventListener('resize', updateBounds);
    
    // Update every 500ms to catch dynamic changes
    const interval = setInterval(updateBounds, 500);
    
    return () => {
      window.removeEventListener('scroll', updateBounds, true);
      window.removeEventListener('resize', updateBounds);
      clearInterval(interval);
    };
  }, [canvasRef, cursors.length, draggedElements.length, selectedElements.length]);

  if (!canvasBounds) {
    return null; // Silently skip rendering until bounds are available
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
        // Touch cursor - simple circle with dot (clean and professional)
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
          <circle cx="12" cy="12" r="8" fill={cursor.color} opacity="0.3" />
          <circle cx="12" cy="12" r="4" fill={cursor.color} stroke="white" strokeWidth="2" />
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
        <span>{cursor.userName || 'Unknown User'}</span>
        {cursor.meta?.isTouch && (
          <svg className="ml-1 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
            <line x1="12" y1="18" x2="12" y2="18"/>
          </svg>
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
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="5 9 2 12 5 15"/>
          <polyline points="9 5 12 2 15 5"/>
          <polyline points="15 19 12 22 9 19"/>
          <polyline points="19 9 22 12 19 15"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <line x1="12" y1="2" x2="12" y2="22"/>
        </svg>
        <span>{draggedElement.userName || 'Unknown User'}</span>
        <span className="opacity-75 text-[10px]">dragging</span>
        <span className="font-semibold">{draggedElement.componentName}</span>
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
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>{selection.userName || 'Unknown User'}</span>
        <span className="opacity-75 text-[10px]">selecting</span>
      </motion.div>
    </motion.div>
  );
};

export default CollaborationOverlay;