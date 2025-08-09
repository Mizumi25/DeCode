// PreviewFrame.jsx
import React from 'react'
import { Plug, Lock, MoreHorizontal } from 'lucide-react'

const sizes = [
  { w: 80, h: 56 },
  { w: 64, h: 96 },
  { w: 72, h: 72 },
  { w: 52, h: 40 },
  { w: 96, h: 64 },
]

export default function PreviewFrame({ title = 'Untitled', index = 0, x = 0, y = 0, fileName = 'File1' }) {
  const size = sizes[index % sizes.length]

  // Dummy avatar colors for stacked avatars
  const avatarColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500']

  return (
    <div
      className="absolute rounded-md border p-2 shadow-md hover:shadow-lg cursor-pointer transition-all duration-200 flex flex-col"
      style={{
        top: y,
        left: x,
        width: `${size.w * 4}px`,
        height: `${size.h * 4}px`,
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Top Header with Frame Info and Controls */}
      <div className="flex items-center justify-between mb-2 -mt-1">
        {/* Left: Frame name and file connection */}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <span className="font-medium">{title}</span>
          <span>-</span>
          <span>({fileName})</span>
          <Plug className="w-3 h-3" />
        </div>

        {/* Right: Lock, Avatars, and More options */}
        <div className="flex items-center gap-1.5">
          {/* Lock icon */}
          <Lock className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
          
          {/* Stacked avatars */}
          <div className="flex -space-x-1">
            {avatarColors.map((color, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border border-white ${color} flex items-center justify-center`}
                style={{ fontSize: '8px', color: 'white' }}
              >
                {String.fromCharCode(65 + i)} {/* A, B, C */}
              </div>
            ))}
          </div>
          
          {/* More options */}
          <MoreHorizontal className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
        </div>
      </div>

      {/* Mock content */}
      <div
        className="rounded-sm mb-2 flex-1"
        style={{
          backgroundColor: 'var(--color-primary-soft)',
        }}
      />
      
      {/* Bottom mock lines */}
      <div className="space-y-1">
        <div
          className="rounded-sm"
          style={{
            height: '6px',
            width: '70%',
            backgroundColor: 'var(--color-border)',
          }}
        />
        <div
          className="rounded-sm"
          style={{
            height: '6px',
            width: '50%',
            backgroundColor: 'var(--color-border)',
          }}
        />
      </div>
    </div>
  )
}