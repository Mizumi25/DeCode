import React, { useMemo } from 'react'
import PreviewFrame from './PreviewFrame'

export default function FramesContainer({ 
  frames, 
  scrollPosition, 
  scrollBounds, 
  onFrameDragStart, 
  onFrameDrag, 
  onFrameDragEnd,
  onFrameClick, // New prop for frame clicks
  zoom = 1,
  isDark = false
}) {
  // Simplified rendering - only render center instance for better performance
  const centerTransform = useMemo(() => 
    `translate3d(${-scrollPosition.x}px, ${-scrollPosition.y}px, 0)`,
    [scrollPosition.x, scrollPosition.y]
  )

  return (
    <div className="relative w-full h-full">
      {/* Main center instance */}
      <div
        className="absolute inset-0"
        style={{
          transform: centerTransform,
          willChange: 'transform'
        }}
      >
        {frames.map((frame, index) => (
          <PreviewFrame
            key={frame.id}
            title={frame.title}
            fileName={frame.fileName}
            frameId={frame.id}
            frame={frame} // Pass full frame object
            index={index}
            x={frame.x}
            y={frame.y}
            isDragging={frame.isDragging}
            isLoading={frame.isLoading}
            onDragStart={onFrameDragStart}
            onDrag={onFrameDrag}
            onDragEnd={onFrameDragEnd}
            onFrameClick={onFrameClick} // Pass click handler
            zoom={zoom}
            isDark={isDark}
          />
        ))}
      </div>
      
      {/* Infinite scroll duplicates - only when not dragging for performance */}
      {frames.every(frame => !frame.isDragging) && (
        <>
          {/* Top duplicate */}
          <div
            className="absolute inset-0"
            style={{
              transform: `translate3d(${-scrollPosition.x}px, ${-scrollPosition.y - scrollBounds.height}px, 0)`,
              willChange: 'transform'
            }}
          >
            {frames.map((frame, index) => (
              <PreviewFrame
                key={`top-${frame.id}`}
                title={frame.title}
                fileName={frame.fileName}
                frameId={frame.id}
                frame={frame}
                index={index}
                x={frame.x}
                y={frame.y}
                isDragging={false}
                isLoading={frame.isLoading}
                onDragStart={onFrameDragStart}
                onDrag={onFrameDrag}
                onDragEnd={onFrameDragEnd}
                onFrameClick={onFrameClick}
                zoom={zoom}
                isDark={isDark}
                isDraggable={false} // Disable drag on duplicates
              />
            ))}
          </div>

          {/* Bottom duplicate */}
          <div
            className="absolute inset-0"
            style={{
              transform: `translate3d(${-scrollPosition.x}px, ${-scrollPosition.y + scrollBounds.height}px, 0)`,
              willChange: 'transform'
            }}
          >
            {frames.map((frame, index) => (
              <PreviewFrame
                key={`bottom-${frame.id}`}
                title={frame.title}
                fileName={frame.fileName}
                frameId={frame.id}
                frame={frame}
                index={index}
                x={frame.x}
                y={frame.y}
                isDragging={false}
                isLoading={frame.isLoading}
                onDragStart={onFrameDragStart}
                onDrag={onFrameDrag}
                onDragEnd={onFrameDragEnd}
                onFrameClick={onFrameClick}
                zoom={zoom}
                isDark={isDark}
                isDraggable={false} // Disable drag on duplicates
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}