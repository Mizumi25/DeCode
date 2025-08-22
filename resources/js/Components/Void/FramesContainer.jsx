import React, { useMemo } from 'react'
import PreviewFrame from './PreviewFrame'

export default function FramesContainer({ 
  frames, 
  scrollPosition, 
  scrollBounds, 
  onFrameDragStart, 
  onFrameDrag, 
  onFrameDragEnd,
  zoom = 1,
  isDark = false
}) {
  // Simplified rendering - only render center instance for better performance
  const centerTransform = useMemo(() => 
    `translate3d(${-scrollPosition.x}px, ${-scrollPosition.y}px, 0)`,
    [scrollPosition.x, scrollPosition.y]
  )

  return (
    <div className="absolute inset-0" style={{ willChange: 'transform' }}>
      {/* Main center instance */}
      <div
        className="absolute"
        style={{
          transform: centerTransform,
          willChange: 'transform',
          backfaceVisibility: 'hidden'
        }}
      >
        {frames.map((frame, index) => (
          <PreviewFrame
            key={frame.id}
            title={frame.title}
            fileName={frame.fileName}
            index={index}
            x={frame.x}
            y={frame.y}
            frameId={frame.id}
            isDragging={frame.isDragging}
            isLoading={frame.isLoading}
            onDragStart={onFrameDragStart}
            onDrag={onFrameDrag}
            onDragEnd={onFrameDragEnd}
            zoom={zoom}
            isDark={isDark}
            isDraggable={true}
          />
        ))}
      </div>
      
      {/* Infinite scroll duplicates - only when not dragging for performance */}
      {frames.every(frame => !frame.isDragging) && (
        <>
          {/* Top duplicate */}
          <div
            className="absolute"
            style={{
              transform: `translate3d(${-scrollPosition.x}px, ${-scrollPosition.y - scrollBounds.height}px, 0)`,
              willChange: 'transform',
              backfaceVisibility: 'hidden'
            }}
          >
            {frames.map((frame, index) => (
              <PreviewFrame
                key={`top-${frame.id}`}
                title={frame.title}
                fileName={frame.fileName}
                index={index}
                x={frame.x}
                y={frame.y}
                frameId={frame.id}
                isDragging={false}
                isLoading={frame.isLoading}
                zoom={zoom}
                isDark={isDark}
                isDraggable={false}
              />
            ))}
          </div>
          
          {/* Bottom duplicate */}
          <div
            className="absolute"
            style={{
              transform: `translate3d(${-scrollPosition.x}px, ${-scrollPosition.y + scrollBounds.height}px, 0)`,
              willChange: 'transform',
              backfaceVisibility: 'hidden'
            }}
          >
            {frames.map((frame, index) => (
              <PreviewFrame
                key={`bottom-${frame.id}`}
                title={frame.title}
                fileName={frame.fileName}
                index={index}
                x={frame.x}
                y={frame.y}
                frameId={frame.id}
                isDragging={false}
                isLoading={frame.isLoading}
                zoom={zoom}
                isDark={isDark}
                isDraggable={false}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}