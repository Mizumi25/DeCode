


import React from 'react'

const sizes = [
  { w: 80, h: 56 },
  { w: 64, h: 96 },
  { w: 72, h: 72 },
  { w: 52, h: 40 },
  { w: 96, h: 64 },
]

export default function PreviewFrame({ title = 'Untitled', index = 0, x = 0, y = 0 }) {
  const size = sizes[index % sizes.length]

  return (
    <div
      className="absolute rounded-md border p-2 shadow-md hover:shadow-lg cursor-pointer transition-all duration-200 flex flex-col justify-between"
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
      {/* Mock content */}
      <div
        className="rounded-sm mb-2"
        style={{
          height: '60%',
          backgroundColor: 'var(--color-primary-soft)',
        }}
      />
      <div className="space-y-1">
        <div
          className="rounded-sm"
          style={{
            height: '8px',
            width: '70%',
            backgroundColor: 'var(--color-border)',
          }}
        />
        <div
          className="rounded-sm"
          style={{
            height: '8px',
            width: '50%',
            backgroundColor: 'var(--color-border)',
          }}
        />
      </div>
      <div
        className="text-right mt-auto"
        style={{
          fontSize: 'var(--fs-sm)',
          color: 'var(--color-text-muted)',
        }}
      >
        {title}
      </div>
    </div>
  )
}
