import React from 'react'
import { Monitor, Tablet, Smartphone } from 'lucide-react'

const ResponsiveToggle = ({ activeMode, setActiveMode }) => {
  const modes = [
    { key: 'desktop', icon: Monitor, label: 'Desktop', size: 'Full Width' },
    { key: 'tablet', icon: Tablet, label: 'Tablet', size: '768×1024' },
    { key: 'mobile', icon: Smartphone, label: 'Mobile', size: '375×667' }
  ]
  
  return (
    <div className="flex items-center bg-[var(--color-bg-muted)] rounded-md p-0.5">
      {modes.map((mode) => {
        const Icon = mode.icon
        return (
          <button
            key={mode.key}
            onClick={() => setActiveMode(mode.key)}
            title={`${mode.label} - ${mode.size}`} // ADD: Tooltip with dimensions
            className={`relative px-1.5 py-0.5 rounded transition-all duration-200 ${
              activeMode === mode.key
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

export default ResponsiveToggle