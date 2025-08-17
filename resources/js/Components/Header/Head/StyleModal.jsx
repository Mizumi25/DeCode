import React, { useState } from 'react'
import Modal from '@/Components/Modal'
import { useHeaderStore } from '@/stores/useHeaderStore'
import { Palette, Type, Layout, Zap, Grid, Sliders } from 'lucide-react'

const StyleModal = () => {
  const { isStyleModalOpen, closeStyleModal } = useHeaderStore()
  
  // Style categories
  const [activeCategory, setActiveCategory] = useState('colors')
  
  const categories = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'effects', label: 'Effects', icon: Zap },
    { id: 'spacing', label: 'Spacing', icon: Grid },
    { id: 'advanced', label: 'Advanced', icon: Sliders },
  ]
  
  // Sample style variables (static for now)
  const styleCategories = {
    colors: [
      { name: 'Primary Color', variable: '--color-primary', value: '#3b82f6', type: 'color' },
      { name: 'Background', variable: '--color-surface', value: '#ffffff', type: 'color' },
      { name: 'Text Color', variable: '--color-text', value: '#1f2937', type: 'color' },
      { name: 'Border Color', variable: '--color-border', value: '#e5e7eb', type: 'color' },
      { name: 'Muted Background', variable: '--color-bg-muted', value: '#f9fafb', type: 'color' },
      { name: 'Text Muted', variable: '--color-text-muted', value: '#6b7280', type: 'color' },
    ],
    typography: [
      { name: 'Base Font Size', variable: '--font-size-base', value: '14px', type: 'text' },
      { name: 'Font Weight', variable: '--font-weight-normal', value: '400', type: 'number' },
      { name: 'Line Height', variable: '--line-height-base', value: '1.5', type: 'number' },
      { name: 'Letter Spacing', variable: '--letter-spacing', value: '0', type: 'text' },
    ],
    layout: [
      { name: 'Border Radius', variable: '--radius-md', value: '6px', type: 'text' },
      { name: 'Border Radius Large', variable: '--radius-lg', value: '8px', type: 'text' },
      { name: 'Container Width', variable: '--container-width', value: '1200px', type: 'text' },
    ],
    effects: [
      { name: 'Shadow Small', variable: '--shadow-sm', value: '0 1px 2px rgba(0,0,0,0.05)', type: 'text' },
      { name: 'Shadow Medium', variable: '--shadow-md', value: '0 4px 6px rgba(0,0,0,0.07)', type: 'text' },
      { name: 'Shadow Large', variable: '--shadow-lg', value: '0 10px 15px rgba(0,0,0,0.1)', type: 'text' },
    ],
    spacing: [
      { name: 'Spacing XS', variable: '--spacing-xs', value: '4px', type: 'text' },
      { name: 'Spacing SM', variable: '--spacing-sm', value: '8px', type: 'text' },
      { name: 'Spacing MD', variable: '--spacing-md', value: '16px', type: 'text' },
      { name: 'Spacing LG', variable: '--spacing-lg', value: '24px', type: 'text' },
    ],
    advanced: [
      { name: 'Transition Duration', variable: '--transition-duration', value: '200ms', type: 'text' },
      { name: 'Transition Easing', variable: '--transition-easing', value: 'cubic-bezier(0.4, 0, 0.2, 1)', type: 'text' },
      { name: 'Z-Index Modal', variable: '--z-modal', value: '1000', type: 'number' },
    ],
  }

  const renderStyleInput = (style) => {
    switch (style.type) {
      case 'color':
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={style.value}
              onChange={(e) => {
                document.documentElement.style.setProperty(style.variable, e.target.value)
              }}
              className="w-10 h-8 rounded border border-[var(--color-border)] cursor-pointer"
            />
            <input
              type="text"
              value={style.value}
              onChange={(e) => {
                document.documentElement.style.setProperty(style.variable, e.target.value)
              }}
              className="flex-1 px-3 py-2 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
            />
          </div>
        )
      case 'number':
        return (
          <input
            type="number"
            value={parseInt(style.value)}
            onChange={(e) => {
              document.documentElement.style.setProperty(style.variable, e.target.value)
            }}
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
          />
        )
      default:
        return (
          <input
            type="text"
            value={style.value}
            onChange={(e) => {
              document.documentElement.style.setProperty(style.variable, e.target.value)
            }}
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
          />
        )
    }
  }

  return (
    <Modal
      show={isStyleModalOpen}
      onClose={closeStyleModal}
      title="Style Variables"
      maxWidth="4xl"
    >
      <div className="flex h-[70vh]">
        {/* Sidebar */}
        <div className="w-48 border-r border-[var(--color-border)] pr-6">
          <div className="space-y-1">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeCategory === category.id
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text)] hover:bg-[var(--color-bg-muted)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 pl-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              {(() => {
                const activeIcon = categories.find(c => c.id === activeCategory)?.icon
                const Icon = activeIcon || Palette
                return <Icon className="w-5 h-5 text-[var(--color-primary)]" />
              })()}
              <h3 className="text-lg font-semibold text-[var(--color-text)] capitalize">
                {activeCategory} Settings
              </h3>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto">
              {styleCategories[activeCategory]?.map((style, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-text)]">
                    {style.name}
                  </label>
                  <div className="space-y-1">
                    {renderStyleInput(style)}
                    <p className="text-xs text-[var(--color-text-muted)] font-mono">
                      {style.variable}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-[var(--color-border)] mt-6">
        <div className="text-sm text-[var(--color-text-muted)]">
          Changes are applied in real-time
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              // Reset all styles to default
              location.reload()
            }}
            className="px-4 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-muted)] text-[var(--color-text)]"
          >
            Reset
          </button>
          <button
            onClick={closeStyleModal}
            className="px-4 py-2 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default StyleModal