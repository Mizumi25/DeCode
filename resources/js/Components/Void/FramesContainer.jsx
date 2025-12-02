import React, { useMemo, useCallback } from 'react'
import PreviewFrame from './PreviewFrame'

export default function FramesContainer({ 
  frames, 
  scrollPosition, 
  scrollBounds, 
  setScrollPosition,
  onFrameClick,
  onFrameDelete,
  zoom = 1,
  isDark = false
}) {
  // Auto-scroll handler for frame dragging
  const handleAutoScroll = useCallback((scrollDelta) => {
    if (!setScrollPosition) return
    
    setScrollPosition(prev => {
      let newX = prev.x + scrollDelta.x
      let newY = prev.y + scrollDelta.y
      
      // Keep within bounds
      newX = Math.max(0, Math.min(scrollBounds.width - window.innerWidth / zoom, newX))
      newY = Math.max(0, Math.min(scrollBounds.height - window.innerHeight / zoom, newY))
      
      return { x: newX, y: newY }
    })
  }, [setScrollPosition, scrollBounds, zoom])

  // Render all frames
  const frameElements = useMemo(() => 
    frames.map((frame, index) => (
      <PreviewFrame
        key={frame.id}
        title={frame.title}
        fileName={frame.fileName}
        frameId={frame.id}
        frame={frame}
        index={index}
        x={frame.x}
        y={frame.y}
        isDragging={frame.isDragging}
        isLoading={frame.isLoading}
        onFrameClick={onFrameClick}
        onFrameDelete={onFrameDelete}
        zoom={zoom}
        isDark={isDark}
        isDraggable={true}
        scrollPosition={scrollPosition}
        onAutoScroll={handleAutoScroll}
      />
    ))
  , [frames, onFrameClick, onFrameDelete, zoom, isDark, scrollPosition, handleAutoScroll])

  return (
    <div 
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        // CRITICAL: Container MUST be full scrollBounds size
        width: `${scrollBounds.width}px`,
        height: `${scrollBounds.height}px`,
        transform: `translate(${-scrollPosition.x}px, ${-scrollPosition.y}px)`,
        willChange: 'transform',
        pointerEvents: 'auto', // CHANGED: Allow pointer events for scrolling
      }}
    >
      {frameElements}
    </div>
  )
}