import React, { useState } from 'react'
import { useForm } from '@inertiajs/react'
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Component, 
  FileText,
  ArrowLeft,
  ArrowRight,
  X
} from 'lucide-react'

const FRAME_TYPES = [
  {
    id: 'page',
    name: 'Page',
    description: 'A complete webpage with full layout',
    icon: Monitor,
    template: 'blank'
  },
  {
    id: 'component',
    name: 'Component',
    description: 'Reusable UI component',
    icon: Component,
    template: 'blank'
  }
]

const DEVICE_PRESETS = [
  { id: 'desktop', name: 'Desktop', width: 1440, height: 900, icon: Monitor },
  { id: 'tablet', name: 'Tablet', width: 768, height: 1024, icon: Tablet },
  { id: 'mobile', name: 'Mobile', width: 375, height: 667, icon: Smartphone }
]

export default function FrameCreator({ project, onFrameCreated, onClose }) {
  const [step, setStep] = useState(1)
  const [localErrors, setLocalErrors] = useState({})

  const { data, setData, post, processing, errors } = useForm({
    project_id: project.id,
    name: '',
    type: 'page',
    canvas_data: {
      template: 'blank',
      device: 'desktop',
      viewport: {
        width: 1440,
        height: 900
      },
      position: {
        x: 0,
        y: 0
      },
      elements: []
    },
    settings: {
      viewport_width: 1440,
      viewport_height: 900,
      background_color: '#ffffff',
      grid_enabled: true,
      snap_to_grid: true
    }
  })

  const validateStep = (stepNumber) => {
    const newErrors = {}
    
    if (stepNumber === 1) {
      if (!data.name.trim()) {
        newErrors.name = 'Frame name is required'
      }
      if (!data.type) {
        newErrors.type = 'Frame type is required'
      }
    }

    setLocalErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
    setLocalErrors({})
  }

  const handleDeviceChange = (device) => {
    const preset = DEVICE_PRESETS.find(d => d.id === device)
    setData(prev => ({
      ...prev,
      canvas_data: {
        ...prev.canvas_data,
        device: device,
        viewport: {
          ...prev.canvas_data.viewport,
          width: preset.width,
          height: preset.height
        }
      },
      settings: {
        ...prev.settings,
        viewport_width: preset.width,
        viewport_height: preset.height
      }
    }))
  }

  const handleTypeChange = (type) => {
    const frameType = FRAME_TYPES.find(t => t.id === type)
    setData(prev => ({
      ...prev,
      type: type,
      canvas_data: {
        ...prev.canvas_data,
        template: frameType.template
      }
    }))
  }

  const handleCreateFrame = () => {
    if (!validateStep(2)) return

    const randomX = Math.floor(Math.random() * 1000) + 200
    const randomY = Math.floor(Math.random() * 600) + 200

    setData(prev => ({
      ...prev,
      canvas_data: {
        ...prev.canvas_data,
        position: {
          x: randomX,
          y: randomY
        }
      }
    }))

    // Use web route instead of API route
    post('/frames', {
      onSuccess: () => {
        console.log('Frame creation request successful')
        // Since we can't get the frame data directly from back() response,
        // we'll let the parent component handle reloading the frames
        if (onFrameCreated) {
          // Signal that a frame was created (parent will reload frames)
          onFrameCreated(null)
        }
        onClose()
      },
      onError: (errors) => {
        console.error('Error creating frame:', errors)
        const errorMessage = errors.error || errors.project || 'Failed to create frame. Please try again.'
        setLocalErrors({ submit: errorMessage })
      }
    })
  }

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--color-text)' }}>
          Create New Frame
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Choose the type and provide basic details
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Frame Name */}
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
            Frame Name
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            placeholder="Enter frame name..."
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
          />
          {(localErrors.name || errors.name) && (
            <p className="mt-2 text-sm text-red-500">{localErrors.name || errors.name}</p>
          )}
        </div>

        {/* Frame Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
            Frame Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            {FRAME_TYPES.map((type) => {
              const Icon = type.icon
              const isSelected = data.type === type.id
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleTypeChange(type.id)}
                  className={`group relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-md'
                      : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/30 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center transition-colors ${
                    isSelected 
                      ? 'bg-[var(--color-primary)] text-white' 
                      : 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)]'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-base mb-2" style={{ color: 'var(--color-text)' }}>
                    {type.name}
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {type.description}
                  </p>
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          {(localErrors.type || errors.type) && (
            <p className="mt-2 text-sm text-red-500">{localErrors.type || errors.type}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--color-text)' }}>
          Configure Settings
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Set up viewport dimensions and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Device Presets */}
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
            Target Device
          </label>
          <div className="grid grid-cols-3 gap-3">
            {DEVICE_PRESETS.map((device) => {
              const Icon = device.icon
              const isSelected = data.canvas_data.device === device.id
              return (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => handleDeviceChange(device.id)}
                  className={`group p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/30'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 transition-colors ${
                    isSelected 
                      ? 'text-[var(--color-primary)]' 
                      : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]'
                  }`} />
                  <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Width (px)
            </label>
            <input
              type="number"
              value={data.settings.viewport_width}
              onChange={(e) => {
                const width = parseInt(e.target.value) || 1440
                setData(prev => ({
                  ...prev,
                  settings: { ...prev.settings, viewport_width: width },
                  canvas_data: {
                    ...prev.canvas_data,
                    viewport: { ...prev.canvas_data.viewport, width }
                  }
                }))
              }}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
              min="320"
              max="3840"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Height (px)
            </label>
            <input
              type="number"
              value={data.settings.viewport_height}
              onChange={(e) => {
                const height = parseInt(e.target.value) || 900
                setData(prev => ({
                  ...prev,
                  settings: { ...prev.settings, viewport_height: height },
                  canvas_data: {
                    ...prev.canvas_data,
                    viewport: { ...prev.canvas_data.viewport, height }
                  }
                }))
              }}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
              min="240"
              max="2160"
            />
          </div>
        </div>

        {/* Grid Settings */}
        <div className="space-y-4">
          <label className="block text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            Grid Options
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={data.settings.grid_enabled}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, grid_enabled: e.target.checked }
                  }))}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 transition-all ${
                  data.settings.grid_enabled 
                    ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' 
                    : 'border-[var(--color-border)] group-hover:border-[var(--color-primary)]'
                }`}>
                  {data.settings.grid_enabled && (
                    <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Enable grid</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={data.settings.snap_to_grid}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, snap_to_grid: e.target.checked }
                  }))}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 transition-all ${
                  data.settings.snap_to_grid 
                    ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' 
                    : 'border-[var(--color-border)] group-hover:border-[var(--color-primary)]'
                }`}>
                  {data.settings.snap_to_grid && (
                    <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Snap to grid</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Step Content */}
      <div className="mb-8">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </div>

      {/* Error Display */}
      {(localErrors.submit || errors.message) && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400">
            {localErrors.submit || errors.message}
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={step === 1 ? onClose : handleBack}
          disabled={processing}
          className="flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === 1 ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <ArrowLeft className="w-4 h-4" />
              Back
            </>
          )}
        </button>

        {step < 2 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={processing}
            className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCreateFrame}
            disabled={processing}
            className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {processing ? 'Creating...' : 'Create Frame'}
            {!processing && <ArrowRight className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  )
}