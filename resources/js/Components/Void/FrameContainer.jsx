// resources/js/Components/Void/FrameContainer.jsx
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Trash2, Edit2, Check, X } from 'lucide-react';
import PreviewFrame from './PreviewFrame';

const FrameContainer = ({
  container,
  frames = [],
  onMove,
  onResize,
  onNameChange,
  onDelete,
  onFrameAdd,
  onFrameRemove,
  zoom = 1,
  isDark = false,
  onFrameClick,
  isFrameDragging = false,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(container.name);
  const [isDraggingHeader, setIsDraggingHeader] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const containerRef = useRef(null);
  const nameInputRef = useRef(null);

  // Handle header drag (move container)
  const handleHeaderMouseDown = (e) => {
    if (isEditingName) return;
    e.stopPropagation();
    e.preventDefault();
    
    // Store initial container position and mouse position
    setDragOffset({
      startX: container.x,
      startY: container.y,
      mouseX: e.clientX,
      mouseY: e.clientY
    });
    setIsDraggingHeader(true);
  };

  const handleHeaderMouseMove = (e) => {
    if (!isDraggingHeader) return;
    
    // Calculate delta in screen coordinates, convert to canvas coordinates
    const deltaX = (e.clientX - dragOffset.mouseX) / zoom;
    const deltaY = (e.clientY - dragOffset.mouseY) / zoom;
    
    const newX = dragOffset.startX + deltaX;
    const newY = dragOffset.startY + deltaY;
    
    if (onMove) {
      onMove(container.uuid, newX, newY);
    }
  };

  const handleHeaderMouseUp = () => {
    setIsDraggingHeader(false);
  };

  // Handle corner drag (resize container)
  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    setResizeStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: container.width,
      height: container.height
    });
    setIsResizing(true);
  };

  const handleResizeMouseMove = (e) => {
    if (!isResizing) return;
    
    // Calculate delta in screen coordinates, convert to canvas coordinates
    const deltaX = (e.clientX - resizeStart.mouseX) / zoom;
    const deltaY = (e.clientY - resizeStart.mouseY) / zoom;
    
    const newWidth = Math.max(400, resizeStart.width + deltaX);
    const newHeight = Math.max(200, resizeStart.height + deltaY);
    
    if (onResize) {
      onResize(container.uuid, newWidth, newHeight);
    }
  };

  const handleResizeMouseUp = () => {
    setIsResizing(false);
  };

  // Handle name editing
  const handleNameDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const handleNameSave = () => {
    if (editedName.trim() && editedName !== container.name) {
      if (onNameChange) {
        onNameChange(container.uuid, editedName.trim());
      }
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setEditedName(container.name);
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  // Global mouse event handlers
  React.useEffect(() => {
    if (isDraggingHeader) {
      document.addEventListener('mousemove', handleHeaderMouseMove);
      document.addEventListener('mouseup', handleHeaderMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleHeaderMouseMove);
        document.removeEventListener('mouseup', handleHeaderMouseUp);
      };
    }
  }, [isDraggingHeader, dragOffset]);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMouseMove);
      document.addEventListener('mouseup', handleResizeMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleResizeMouseMove);
        document.removeEventListener('mouseup', handleResizeMouseUp);
      };
    }
  }, [isResizing, resizeStart]);

  // Calculate frame positions for horizontal layout
  const frameSpacing = 16;
  const frameWidth = 200;
  
  return (
    <motion.div
      ref={containerRef}
      className="absolute transition-all duration-200 frame-container"
      data-container-element="true"
      style={{
        left: container.x,
        top: container.y,
        width: container.width,
        height: container.height,
        backgroundColor: isFrameDragging && isHovering 
          ? (isDark ? 'rgba(138, 43, 226, 0.15)' : 'rgba(138, 43, 226, 0.08)')
          : (isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)'),
        border: `2px solid ${
          isFrameDragging && isHovering 
            ? 'var(--color-primary)'
            : (isDark ? 'rgba(100, 100, 100, 0.5)' : 'rgba(200, 200, 200, 0.5)')
        }`,
        borderRadius: '12px',
        boxShadow: isFrameDragging && isHovering 
          ? '0 8px 30px rgba(138, 43, 226, 0.3)'
          : '0 4px 20px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(10px)',
        zIndex: 100, // Above frames (frames are z-index 10-50)
        pointerEvents: 'auto', // Ensure it captures events
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{
          borderColor: isDark ? 'rgba(100, 100, 100, 0.3)' : 'rgba(200, 200, 200, 0.3)',
          cursor: isDraggingHeader ? 'grabbing' : 'grab',
          backgroundColor: isDark ? 'rgba(40, 40, 40, 0.8)' : 'rgba(245, 245, 245, 0.8)',
          pointerEvents: 'auto', // Ensure header captures mouse events
        }}
        onMouseDown={handleHeaderMouseDown}
        onTouchStart={handleHeaderMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                ref={nameInputRef}
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleNameKeyDown}
                onBlur={handleNameSave}
                className="px-2 py-1 text-sm font-semibold border rounded"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNameSave();
                }}
                className="p-1 rounded hover:bg-green-500/20"
              >
                <Check className="w-3 h-3 text-green-500" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNameCancel();
                }}
                className="p-1 rounded hover:bg-red-500/20"
              >
                <X className="w-3 h-3 text-red-500" />
              </button>
            </div>
          ) : (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onDoubleClick={handleNameDoubleClick}
            >
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                {container.name}
              </span>
              <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-50" style={{ color: 'var(--color-text-muted)' }} />
            </div>
          )}
          
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            ({frames.length} {frames.length === 1 ? 'frame' : 'frames'})
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete(container.uuid);
          }}
          className="p-1 rounded hover:bg-red-500/20 transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>

      {/* Content - Horizontal frame layout with auto-spacing */}
      <div
        className="relative p-4 overflow-x-auto overflow-y-hidden"
        style={{
          height: `calc(${container.height * zoom}px - 48px)`,
        }}
      >
        <div className="flex h-full" style={{ gap: `${frameSpacing}px` }}>
          {frames
            .sort((a, b) => (a.container_order || 0) - (b.container_order || 0))
            .map((frame, index) => (
              <div
                key={frame.uuid}
                style={{
                  width: frameWidth * zoom,
                  flexShrink: 0,
                  transition: 'transform 0.2s ease',
                }}
                className="hover:scale-105"
              >
                <PreviewFrame
                  frame={frame}
                  title={frame.name}
                  fileName={frame.name}
                  thumbnail={frame.thumbnail}
                  isSelected={false}
                  onClick={() => onFrameClick && onFrameClick(frame)}
                  zoom={zoom}
                  isDark={isDark}
                  inContainer={true}
                  onRemoveFromContainer={() => onFrameRemove && onFrameRemove(frame.uuid)}
                />
              </div>
            ))}
          
          {/* Empty state */}
          {frames.length === 0 && (
            <div
              className="flex items-center justify-center w-full h-full border-2 border-dashed rounded-lg transition-colors"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              <div className="text-center">
                <p className="text-sm font-medium">Drag frames here</p>
                <p className="text-xs mt-1 opacity-70">Frames will auto-arrange horizontally with {frameSpacing}px spacing</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize"
        style={{
          background: 'linear-gradient(135deg, transparent 50%, var(--color-primary) 50%)',
          borderBottomRightRadius: '10px',
          pointerEvents: 'auto', // Ensure resize captures mouse events
          zIndex: 101,
        }}
        onMouseDown={handleResizeMouseDown}
        onTouchStart={handleResizeMouseDown}
      />
    </motion.div>
  );
};

export default FrameContainer;
