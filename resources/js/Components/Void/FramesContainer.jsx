import React from 'react'
import PreviewFrame from './PreviewFrame'

export default function FramesContainer({ frames, scrollPosition, scrollBounds }) {
  return (
    <div className="absolute inset-0 z-15">
      {/* Create multiple instances for seamless infinite scroll */}
      {[-1, 0, 1].map(xOffset => (
        [-1, 0, 1].map(yOffset => (
          <div
            key={`${xOffset}-${yOffset}`}
            className="absolute"
            style={{
              transform: `translate3d(${-scrollPosition.x + (xOffset * scrollBounds.width)}px, ${-scrollPosition.y + (yOffset * scrollBounds.height)}px, 0)`,
              willChange: 'transform'
            }}
          >
            {frames.map((frame, index) => (
              <PreviewFrame
                key={`${frame.id}-${xOffset}-${yOffset}`}
                title={frame.title}
                fileName={frame.fileName}
                index={index}
                x={frame.x}
                y={frame.y}
              />
            ))}
          </div>
        ))
      ))}
    </div>
  )
}