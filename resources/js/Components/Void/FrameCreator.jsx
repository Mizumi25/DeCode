import React, { useState } from 'react'
import { router } from '@inertiajs/react'
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Component, 
  FileText, 
  Layout,
  Globe,
  Mail,
  BarChart3,
  Package,
  Palette
} from 'lucide-react'

const FRAME_TYPES = [
  {
    id: 'page',
    name: 'Page',
    description: 'A complete webpage with full layout',
    icon: Monitor,
    templates: [
      { id: 'home', name: 'Home Page', desc: 'Landing page with hero section' },
      { id: 'about', name: 'About Page', desc: 'Company information page' },
      { id: 'contact', name: 'Contact Page', desc: 'Contact form and info' },
      { id: 'blog', name: 'Blog Page', desc: 'Article listing page' },
      { id: 'product', name: 'Product Page', desc: 'Product showcase page' }
    ]
  },
  {
    id: 'component',
    name: 'Component',
    description: 'Reusable UI component',
    icon: Component,
    templates: [
      { id: 'button', name: 'Button', desc: 'Interactive button component' },
      { id: 'card', name: 'Card', desc: 'Content card component' },
      { id: 'navbar', name: 'Navigation', desc: 'Navigation bar component' },
      { id: 'form', name: 'Form', desc: 'Input form component' },
      { id: 'modal', name: 'Modal', desc: 'Dialog/popup component' }
    ]
  }
]

const DEVICE_PRESETS = [
  { id: 'desktop', name: 'Desktop', width: 1440, height: 900, icon: Monitor },
  { id: 'tablet', name: 'Tablet', width: 768, height: 1024, icon: Tablet },
  { id: 'mobile', name: 'Mobile', width: 375, height: 667, icon: Smartphone }
]

export default function FrameCreator({ project, onFrameCreated, onClose }) {
  const [step, setStep] = useState(1)
  const [frameData, setFrameData] = useState({
    name: '',
    type: 'page',
    template: '',
    device: 'desktop',
    settings: {
      viewport_width: 1440,
      viewport_height: 900,
      background_color: '#ffffff',
      grid_enabled: true,
      snap_to_grid: true
    }
  })
  const [isCreating, setIsCreating] = useState(false)
  const [errors, setErrors] = useState({})

  const currentFrameType = FRAME_TYPES.find(t => t.id === frameData.type)
  const currentDevice = DEVICE_PRESETS.find(d => d.id === frameData.device)

  const validateStep = (stepNumber) => {
    const newErrors = {}
    
    if (stepNumber === 1) {
      if (!frameData.name.trim()) {
        newErrors.name = 'Frame name is required'
      }
      if (!frameData.type) {
        newErrors.type = 'Frame type is required'
      }
    }
    
    if (stepNumber === 2) {
      if (!frameData.template) {
        newErrors.template = 'Please select a template'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
    setErrors({})
  }

  const handleDeviceChange = (device) => {
    const preset = DEVICE_PRESETS.find(d => d.id === device)
    setFrameData(prev => ({
      ...prev,
      device: device,
      settings: {
        ...prev.settings,
        viewport_width: preset.width,
        viewport_height: preset.height
      }
    }))
  }

  const handleCreateFrame = async () => {
    if (!validateStep(3)) return

    setIsCreating(true)
    
    try {
      // Generate random position
      const randomX = Math.floor(Math.random() * 3000) + 400
      const randomY = Math.floor(Math.random() * 2000) + 300

      const response = await fetch('/api/frames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({
          project_id: project.id,
          name: frameData.name,
          type: frameData.type,
          canvas_data: {
            template: frameData.template,
            device: frameData.device,
            viewport: {
              width: frameData.settings.viewport_width,
              height: frameData.settings.viewport_height
            },
            position: {
              x: randomX,
              y: randomY
            },
            elements: []
          },
          settings: frameData.settings
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create frame')
      }

      const result = await response.json()
      
      // Call success callback
      if (onFrameCreated) {
        onFrameCreated(result.frame)
      }
      
      // Close modal
      onClose()

    } catch (error) {
      console.error('Error creating frame:', error)
      setErrors({ submit: error.message || 'Failed to create frame. Please try again.' })
    } finally {
      setIsCreating(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          Frame Details
        </h3>
        
        {/* Frame Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
            Frame Name
          </label>
          <input
            type="text"
            value={frameData.name}
            onChange={(e) => setFrameData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter frame name..."
            className="w-full px-3 py-2 rounded-lg border transition-colors"
            style={{
              backgroundColor: 'var(--color-bg-muted)',
              borderColor: errors.name ? '#ef4444' : 'var(--color-border)',
              color: 'var(--color-text)'
            }}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Frame Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
            Frame Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {FRAME_TYPES.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  onClick={() => setFrameData(prev => ({ ...prev, type: type.id, template: '' }))}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    frameData.type === type.id 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  style={{
                    backgroundColor: frameData.type === type.id 
                      ? 'var(--color-primary-bg)' 
                      : 'var(--color-surface)'
                  }}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${
                    frameData.type === type.id ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                  <h4 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                    {type.name}
                  </h4>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {type.description}
                  </p>
                </button>
              )
            })}
          </div>
          {errors.type && (
            <p className="mt-1 text-sm text-red-500">{errors.type}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
          Choose Template
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Select a starting template for your {currentFrameType?.name.toLowerCase()}
        </p>

        <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
          {currentFrameType?.templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setFrameData(prev => ({ ...prev, template: template.id }))}
              className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                frameData.template === template.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              style={{
                backgroundColor: frameData.template === template.id
                  ? 'var(--color-primary-bg)'
                  : 'var(--color-surface)'
              }}
            >
              <h4 className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                {template.name}
              </h4>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {template.desc}
              </p>
            </button>
          ))}
        </div>
        {errors.template && (
          <p className="mt-2 text-sm text-red-500">{errors.template}</p>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
          Device & Settings
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Configure viewport and initial settings
        </p>

        {/* Device Presets */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
            Target Device
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DEVICE_PRESETS.map((device) => {
              const Icon = device.icon
              return (
                <button
                  key={device.id}
                  onClick={() => handleDeviceChange(device.id)}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    frameData.device === device.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  style={{
                    backgroundColor: frameData.device === device.id
                      ? 'var(--color-primary-bg)'
                      : 'var(--color-surface)'
                  }}
                >
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${
                    frameData.device === device.id ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                  <div className="text-xs" style={{ color: 'var(--color-text)' }}>
                    {device.name}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {device.width}×{device.height}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Custom Dimensions */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              Width (px)
            </label>
            <input
              type="number"
              value={frameData.settings.viewport_width}
              onChange={(e) => setFrameData(prev => ({
                ...prev,
                settings: { ...prev.settings, viewport_width: parseInt(e.target.value) || 1440 }
              }))}
              className="w-full px-2 py-1 text-sm rounded border"
              style={{
                backgroundColor: 'var(--color-bg-muted)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              Height (px)
            </label>
            <input
              type="number"
              value={frameData.settings.viewport_height}
              onChange={(e) => setFrameData(prev => ({
                ...prev,
                settings: { ...prev.settings, viewport_height: parseInt(e.target.value) || 900 }
              }))}
              className="w-full px-2 py-1 text-sm rounded border"
              style={{
                backgroundColor: 'var(--color-bg-muted)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
          </div>
        </div>

        {/* Grid Settings */}
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={frameData.settings.grid_enabled}
              onChange={(e) => setFrameData(prev => ({
                ...prev,
                settings: { ...prev.settings, grid_enabled: e.target.checked }
              }))}
              className="rounded"
            />
            <span className="text-sm" style={{ color: 'var(--color-text)' }}>Enable grid</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={frameData.settings.snap_to_grid}
              onChange={(e) => setFrameData(prev => ({
                ...prev,
                settings: { ...prev.settings, snap_to_grid: e.target.checked }
              }))}
              className="rounded"
            />
            <span className="text-sm" style={{ color: 'var(--color-text)' }}>Snap to grid</span>
          </label>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-md mx-auto">
      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {stepNum}
              </div>
              {stepNum < 3 && (
                <div
                  className={`w-16 h-0.5 mx-2 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
          Step {step} of 3
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      {/* Error Display */}
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-3">
        <button
          onClick={step === 1 ? onClose : handleBack}
          disabled={isCreating}
          className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
            backgroundColor: 'var(--color-surface)'
          }}
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </button>

        {step < 3 ? (
          <button
            onClick={handleNext}
            disabled={isCreating}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleCreateFrame}
            disabled={isCreating}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {isCreating && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {isCreating ? 'Creating...' : 'Create Frame'}
          </button>
        )}
      </div>
    </div>
  )
}