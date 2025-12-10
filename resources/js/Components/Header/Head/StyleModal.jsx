import React, { useState, useEffect } from 'react'
import Modal from '@/Components/Modal'
import { useHeaderStore } from '@/stores/useHeaderStore'
import { Palette, Type, Layout, Zap, Grid, Sliders, Save } from 'lucide-react'
import { router, usePage } from '@inertiajs/react'

const StyleModal = () => {
  const { isStyleModalOpen, closeStyleModal } = useHeaderStore()
  const { project } = usePage().props
  
  // Style categories
  const [activeCategory, setActiveCategory] = useState('colors')
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  const categories = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'effects', label: 'Effects', icon: Zap },
    { id: 'spacing', label: 'Spacing', icon: Grid },
    { id: 'advanced', label: 'Advanced', icon: Sliders },
  ]
  
  // Default style variables
  const defaultStyleVariables = {
    '--color-primary': '#3b82f6',
    '--color-surface': '#ffffff',
    '--color-text': '#1f2937',
    '--color-border': '#e5e7eb',
    '--color-bg-muted': '#f9fafb',
    '--color-text-muted': '#6b7280',
    '--font-size-base': '14px',
    '--font-weight-normal': '400',
    '--line-height-base': '1.5',
    '--letter-spacing': '0',
    '--radius-md': '6px',
    '--radius-lg': '8px',
    '--container-width': '1200px',
    '--shadow-sm': '0 1px 2px rgba(0,0,0,0.05)',
    '--shadow-md': '0 4px 6px rgba(0,0,0,0.07)',
    '--shadow-lg': '0 10px 15px rgba(0,0,0,0.1)',
    '--spacing-xs': '4px',
    '--spacing-sm': '8px',
    '--spacing-md': '16px',
    '--spacing-lg': '24px',
    '--transition-duration': '200ms',
    '--transition-easing': 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--z-modal': '1000',
  }

  const [styleValues, setStyleValues] = useState(defaultStyleVariables)

  // Load saved style variables from project settings on mount
  useEffect(() => {
    if (project?.settings?.style_variables) {
      const savedVariables = { ...defaultStyleVariables, ...project.settings.style_variables }
      setStyleValues(savedVariables)
      
      // DO NOT apply to DeCode system DOM - these are for export only!
      // The variables will be applied to the exported project's CSS file
    }
  }, [project])

  // Style categories with dynamic values
  const styleCategories = {
    colors: [
      { name: 'Primary Color', variable: '--color-primary', type: 'color' },
      { name: 'Background', variable: '--color-surface', type: 'color' },
      { name: 'Text Color', variable: '--color-text', type: 'color' },
      { name: 'Border Color', variable: '--color-border', type: 'color' },
      { name: 'Muted Background', variable: '--color-bg-muted', type: 'color' },
      { name: 'Text Muted', variable: '--color-text-muted', type: 'color' },
    ],
    typography: [
      { name: 'Base Font Size', variable: '--font-size-base', type: 'text' },
      { name: 'Font Weight', variable: '--font-weight-normal', type: 'number' },
      { name: 'Line Height', variable: '--line-height-base', type: 'number' },
      { name: 'Letter Spacing', variable: '--letter-spacing', type: 'text' },
    ],
    layout: [
      { name: 'Border Radius', variable: '--radius-md', type: 'text' },
      { name: 'Border Radius Large', variable: '--radius-lg', type: 'text' },
      { name: 'Container Width', variable: '--container-width', type: 'text' },
    ],
    effects: [
      { name: 'Shadow Small', variable: '--shadow-sm', type: 'text' },
      { name: 'Shadow Medium', variable: '--shadow-md', type: 'text' },
      { name: 'Shadow Large', variable: '--shadow-lg', type: 'text' },
    ],
    spacing: [
      { name: 'Spacing XS', variable: '--spacing-xs', type: 'text' },
      { name: 'Spacing SM', variable: '--spacing-sm', type: 'text' },
      { name: 'Spacing MD', variable: '--spacing-md', type: 'text' },
      { name: 'Spacing LG', variable: '--spacing-lg', type: 'text' },
    ],
    advanced: [
      { name: 'Transition Duration', variable: '--transition-duration', type: 'text' },
      { name: 'Transition Easing', variable: '--transition-easing', type: 'text' },
      { name: 'Z-Index Modal', variable: '--z-modal', type: 'number' },
    ],
  }

  const handleStyleChange = (variable, value) => {
    setStyleValues(prev => ({ ...prev, [variable]: value }))
    // DO NOT apply to DeCode system DOM - these are for export only!
    // The variables will be applied to the exported project's CSS file
    setHasChanges(true)
  }

  const saveStyleSettings = async () => {
    if (!project?.uuid) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/projects/${project.uuid}/style-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
        body: JSON.stringify({
          style_variables: styleValues,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setHasChanges(false)
        console.log('Style settings saved successfully')
      } else {
        console.error('Failed to save style settings:', data.message)
      }
    } catch (error) {
      console.error('Error saving style settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const renderStyleInput = (style) => {
    const currentValue = styleValues[style.variable] || ''
    
    switch (style.type) {
      case 'color':
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={currentValue}
              onChange={(e) => handleStyleChange(style.variable, e.target.value)}
              className="w-10 h-8 rounded border border-[var(--color-border)] cursor-pointer"
            />
            <input
              type="text"
              value={currentValue}
              onChange={(e) => handleStyleChange(style.variable, e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
            />
          </div>
        )
      case 'number':
        return (
          <input
            type="number"
            value={parseInt(currentValue) || 0}
            onChange={(e) => handleStyleChange(style.variable, e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
          />
        )
      default:
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleStyleChange(style.variable, e.target.value)}
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
      {/* Info Banner */}
      <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Palette className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium text-blue-900 text-sm">
              Export Project Styling
            </div>
            <div className="text-xs text-blue-700 mt-1">
              These CSS variables will be applied to your <strong>exported project</strong> (HTML/React + CSS/Tailwind). 
              They do not affect the DeCode editor interface.
            </div>
          </div>
        </div>
      </div>
      
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
          {hasChanges ? 'Unsaved changes' : 'All changes saved'}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              // Reset all styles to default
              setStyleValues(defaultStyleVariables)
              // DO NOT apply to DeCode system DOM - these are for export only!
              setHasChanges(true)
            }}
            className="px-4 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-muted)] text-[var(--color-text)]"
          >
            Reset
          </button>
          <button
            onClick={saveStyleSettings}
            disabled={!hasChanges || isSaving}
            className="px-4 py-2 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={closeStyleModal}
            className="px-4 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-muted)] text-[var(--color-text)]"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default StyleModal