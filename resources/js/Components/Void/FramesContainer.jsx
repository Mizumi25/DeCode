import React, { useMemo } from 'react'
import PreviewFrame from './PreviewFrame'

export default function FramesContainer({ frames, scrollPosition, scrollBounds }) {
  // Optimize rendering by memoizing the frame instances
  const frameInstances = useMemo(() => {
    return [-1, 0, 1].map(xOffset => (
      [-1, 0, 1].map(yOffset => ({
        xOffset,
        yOffset,
        key: `${xOffset}-${yOffset}`,
        transform: `translate3d(${-scrollPosition.x + (xOffset * scrollBounds.width)}px, ${-scrollPosition.y + (yOffset * scrollBounds.height)}px, 0)`
      }))
    )).flat()
  }, [scrollPosition.x, scrollPosition.y, scrollBounds.width, scrollBounds.height])

  return (
    <div className="absolute inset-0 z-15" style={{ willChange: 'transform' }}>
      {/* Create multiple instances for seamless infinite scroll */}
      {frameInstances.map(instance => (
        <div
          key={instance.key}
          className="absolute"
          style={{
            transform: instance.transform,
            willChange: 'transform',
            backfaceVisibility: 'hidden'
          }}
        >
          {frames.map((frame, index) => (
            <PreviewFrame
              key={`${frame.id}-${instance.xOffset}-${instance.yOffset}`}
              title={frame.title}
              fileName={frame.fileName}
              index={index}
              x={frame.x}
              y={frame.y}
            />
          ))}
        </div>
      ))}
    </div>
  )
}