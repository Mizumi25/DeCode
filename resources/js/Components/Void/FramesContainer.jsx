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
      
      // Keep within bounds with wrapping
      newX = ((newX % scrollBounds.width) + scrollBounds.width) % scrollBounds.width
      newY = ((newY % scrollBounds.height) + scrollBounds.height) % scrollBounds.height
      
      return { x: newX, y: newY }
    })
  }, [setScrollPosition, scrollBounds])

  // Optimized rendering - only render what's needed
  const centerTransform = useMemo(() => 
    `translate3d(${-scrollPosition.x}px, ${-scrollPosition.y}px, 0)`,
    [scrollPosition.x, scrollPosition.y]
  )

 // REPLACE the visibleFrames useMemo with:
const visibleFrames = useMemo(() => {
  const viewportWidth = (window.innerWidth / zoom) + 1000 // Larger buffer
  const viewportHeight = (window.innerHeight / zoom) + 1000
  const buffer = 1000 / zoom // Scale buffer with zoom
  
  return frames.filter(frame => {
    // Always render frames that are being dragged
    if (frame.isDragging) return true
    
    // Adjust frame dimensions for zoom
    const frameWidth = 320
    const frameHeight = 224
    
    const frameRight = frame.x + frameWidth
    const frameBottom = frame.y + frameHeight
    
    const isVisible = (
      frameRight >= scrollPosition.x - buffer &&
      frame.x <= scrollPosition.x + viewportWidth + buffer &&
      frameBottom >= scrollPosition.y - buffer &&
      frame.y <= scrollPosition.y + viewportHeight + buffer
    )
    
    return isVisible
  })
}, [frames, scrollPosition, zoom])




  return (
    <div className="relative w-full h-full">
      {/* Main center instance - optimized for performance */}
      <div
        className="absolute inset-0"
        style={{
          transform: centerTransform,
          willChange: 'transform',
          backfaceVisibility: 'hidden'
        }}
      >
        {visibleFrames.map((frame, index) => (
          <div
            key={frame.id}
            className="relative group"
            title={frame.isGithubImport ? `GitHub Import: ${frame.githubPath || frame.fileName}` : frame.title}
          >
           <PreviewFrame
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
              scrollPosition={scrollPosition}
              onAutoScroll={handleAutoScroll}
            />
            
            {/* GitHub import indicator tooltip */}
            {frame.isGithubImport && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}