import React from 'react'

const BinaryToggle = ({ activeMode, setActiveMode, options }) => {
  return (
    <div className="flex items-center bg-[var(--color-bg-muted)] rounded-md p-0.5">
      {options.map((option) => {
        const Icon = option.icon
        return (
          <button
            key={option.key}
            onClick={() => setActiveMode(option.key)}
            className={`relative px-1.5 py-0.5 rounded transition-all duration-200 ${
              activeMode === option.key
                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Icon className="w-2.5 h-2.5" />
          </button>
        )
      })}
    </div>
  )
}

export default BinaryToggle