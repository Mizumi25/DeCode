import React from 'react'

const StackingAvatars = () => {
  const collaborators = [
    { id: 1, color: 'bg-blue-500', initial: 'A' },
    { id: 2, color: 'bg-green-500', initial: 'B' },
    { id: 3, color: 'bg-purple-500', initial: 'C' }
  ]

  return (
    <div className="flex items-center -space-x-1">
      {collaborators.map((collaborator, index) => (
        <div
          key={collaborator.id}
          className={`w-4 h-4 rounded-full ${collaborator.color} text-white flex items-center justify-center font-bold text-[10px] border border-[var(--color-surface)] z-${10 - index}`}
          style={{ zIndex: 10 - index }}
        >
          {collaborator.initial}
        </div>
      ))}
    </div>
  )
}

export default StackingAvatars