import React, { useMemo, useCallback } from 'react'
import PreviewFrame from './PreviewFrame'

export default function FramesContainer({ 
  frames, 
  scrollPosition, 
  scrollBounds, 
  setScrollPosition,
  onFrameClick,
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
      newX = Math.max(0, Math.min(scrollBounds.width, newX))
      newY = Math.max(0, Math.min(scrollBounds.height, newY))
      
      return { x: newX, y: newY }
    })
  }, [setScrollPosition, scrollBounds])

  // SIMPLE: Just render all frames
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
        zoom={zoom}
        isDark={isDark}
        isDraggable={true}
        scrollPosition={scrollPosition}
        onAutoScroll={handleAutoScroll}
      />
    ))
  , [frames, onFrameClick, zoom, isDark, scrollPosition, handleAutoScroll])

  // DEAD SIMPLE: Just a big container that moves with scroll
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
      pointerEvents: 'none',
      // DEBUG: Make it visible
      border: '2px dashed rgba(255, 0, 0, 0.3)'
    }}
  >
    {/* DEBUG: Add corner markers */}
    <div style={{ position: 'absolute', left: 0, top: 0, width: 100, height: 100, background: 'rgba(255, 0, 0, 0.2)' }}>
      TOP-LEFT
    </div>
    <div style={{ position: 'absolute', right: 0, top: 0, width: 100, height: 100, background: 'rgba(0, 255, 0, 0.2)' }}>
      TOP-RIGHT
    </div>
    <div style={{ position: 'absolute', left: 0, bottom: 0, width: 100, height: 100, background: 'rgba(0, 0, 255, 0.2)' }}>
      BOTTOM-LEFT
    </div>
    <div style={{ position: 'absolute', right: 0, bottom: 0, width: 100, height: 100, background: 'rgba(255, 255, 0, 0.2)' }}>
      BOTTOM-RIGHT
    </div>
    
    {frameElements}
  </div>
)
}