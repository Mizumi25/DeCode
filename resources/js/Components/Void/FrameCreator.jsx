import React, { useState } from 'react'
import { useForm } from '@inertiajs/react'
import axios from 'axios'
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

// Update the frame type selection in FrameCreator.jsx
const FRAME_TYPES = [
  {
    id: 'page',
    name: 'Page',
    description: 'A complete webpage that must start with sections',
    icon: Monitor,
    template: 'blank',
    features: ['Sections required', 'Full page structure', 'SEO optimized'],
    examples: ['Landing page', 'About page', 'Blog post']
  },
  {
    id: 'component',
    name: 'Component',
    description: 'Reusable UI component or widget',
    icon: Component,
    template: 'blank',
    features: ['No sections required', 'Flexible structure', 'Reusable'],
    examples: ['Button', 'Card', 'Navigation bar']
  }
];

// Add scrolled component toggle for components
const renderStep2 = () => (
    <div className="space-y-8">
        {/* ... existing viewport settings ... */}
        
        {/* Component-specific settings */}
        {data.type === 'component' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">Component Settings</h4>
                
                <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative mt-1">
                            <input
                                type="checkbox"
                                checked={data.scrolled_component || false}
                                onChange={(e) => setData(prev => ({
                                    ...prev,
                                    scrolled_component: e.target.checked,
                                    scroll_direction: e.target.checked ? 'vertical' : null
                                }))}
                                className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded border-2 transition-all ${
                                data.scrolled_component 
                                    ? 'bg-blue-600 border-blue-600' 
                                    : 'border-gray-300 group-hover:border-blue-400'
                            }`}>
                                {data.scrolled_component && (
                                    <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        </div>
                        <div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">Scrolled Component</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Enable if this component will contain sub-sections and act as a scroll container
                            </p>
                        </div>
                    </label>
                    
                    {data.scrolled_component && (
                        <div className="ml-8 space-y-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Scroll Direction
                            </label>
                            <div className="flex gap-3">
                                {['vertical', 'horizontal', 'both'].map((direction) => (
                                    <button
                                        key={direction}
                                        type="button"
                                        onClick={() => setData(prev => ({
                                            ...prev,
                                            scroll_direction: direction
                                        }))}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            data.scroll_direction === direction
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {direction.charAt(0).toUpperCase() + direction.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
);

const DEVICE_PRESETS = [
  { id: 'desktop', name: 'Desktop', width: 1440, height: 900, icon: Monitor },
  { id: 'tablet', name: 'Tablet', width: 768, height: 1024, icon: Tablet },
  { id: 'mobile', name: 'Mobile', width: 375, height: 667, icon: Smartphone }
]

export default function FrameCreator({ project, onFrameCreated, onClose }) {
  const [step, setStep] = useState(1)
  const [localErrors, setLocalErrors] = useState({})
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

 const { data, setData, post, processing, errors } = useForm({
    project_id: project.id,
    name: '',
    type: 'page',
    canvas_style: {  // CHANGED from canvas_root
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        overflow: 'auto',
        display: 'block',
        padding: '0px',
        margin: '0px',
        position: 'relative',
        boxSizing: 'border-box',
    },
    canvas_props: {},      // NEW
    canvas_animation: {},  // NEW
    canvas_data: {
        template: 'blank',
        device: 'desktop',
        viewport: { width: 1440, height: 900 },
        position: { x: 0, y: 0 },
        elements: []
    },
    settings: {
        background_color: '#ffffff',
    },
    // ✅ Component-specific settings
    scrolled_component: false,
    scroll_direction: null,
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

  const handleCreateFrame = async () => {
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

    // Check if AI prompt is provided
    if (aiPrompt.trim()) {
      setIsGeneratingAI(true)
      console.log('🤖 AI prompt detected:', aiPrompt)
      
      try {
        // First, create the frame
        console.log('📦 Creating frame...')
        await new Promise((resolve, reject) => {
          post('/frames', {
            preserveScroll: true,
            onSuccess: () => {
              console.log('✅ Frame created successfully')
              resolve()
            },
            onError: (errors) => {
              console.error('❌ Frame creation error:', errors)
              reject(errors)
            }
          })
        })

        console.log('🔍 Fetching latest frame from API...')
        
        // Fetch the latest frame for this project to get the correct database ID
        const framesResponse = await axios.get(`/api/frames?project_id=${project.id}`)
        const frames = framesResponse.data.frames || []
        
        if (frames.length === 0) {
          throw new Error('No frames found after creation')
        }
        
        // Get the most recently created frame (first in the list since they're ordered by created_at desc)
        const newFrame = frames[0]
        console.log('🆕 Latest frame:', newFrame)

        console.log('🎨 Calling AI with frame:', {
          frame_numeric_id: newFrame.numeric_id,
          frame_uuid: newFrame.uuid,
          project_id: project.id,
          project_uuid: project.uuid
        })

        // Now call AI to generate template with component information using axios
        const aiResponse = await axios.post('/api/ai/generate-template', {
          prompt: aiPrompt,
          frame_id: newFrame.numeric_id,  // Use the numeric database ID
          project_id: project.id
        })

        console.log('🤖 AI Response status:', aiResponse.status)
        console.log('🎯 AI Data received:', aiResponse.data)
        
        // Parse AI output and create components
        if (aiResponse.data.ai_output) {
          console.log('🔧 Starting component generation...')
          await handleAIGeneration(aiResponse.data.ai_output, newFrame)
        } else {
          console.warn('⚠️ No AI output received')
        }

        setIsGeneratingAI(false)
        console.log('✅ AI generation complete!')
        
        if (onFrameCreated) {
          onFrameCreated(newFrame)
        }
        onClose()

      } catch (error) {
        console.error('❌ Error with AI generation:', error)
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        setIsGeneratingAI(false)
        setLocalErrors({ submit: 'Frame created but AI generation failed: ' + (error.response?.data?.message || error.message) })
      }
    } else {
      // Normal frame creation without AI
      post('/frames', {
        onSuccess: () => {
          console.log('Frame creation request successful')
          if (onFrameCreated) {
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
  }

  const handleAIGeneration = async (aiOutput, frame) => {
    try {
      console.log('📝 Raw AI output:', aiOutput)
      
      // Try to extract JSON from AI output
      let aiComponentsData
      
      // Check if output contains JSON block
      const jsonMatch = aiOutput.match(/```json\n([\s\S]*?)\n```/) || 
                       aiOutput.match(/```\n([\s\S]*?)\n```/) ||
                       aiOutput.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[0]
        console.log('📋 Extracted JSON string:', jsonString)
        aiComponentsData = JSON.parse(jsonString)
      } else {
        console.log('📋 Parsing raw output as JSON')
        aiComponentsData = JSON.parse(aiOutput)
      }

      console.log('✅ Parsed AI components data:', aiComponentsData)

      // Get all available components from database
      console.log('🔍 Fetching available components...')
      const componentsResponse = await axios.get('/api/components')
      
      const dbComponentsData = componentsResponse.data
      console.log('📦 Raw components response:', dbComponentsData)
      
      // Flatten the grouped structure into a single array
      const availableComponents = []
      
      if (dbComponentsData.success && dbComponentsData.data) {
        // Process elements
        if (dbComponentsData.data.elements) {
          Object.values(dbComponentsData.data.elements).forEach(letterGroup => {
            availableComponents.push(...letterGroup)
          })
        }
        
        // Process components
        if (dbComponentsData.data.components) {
          Object.values(dbComponentsData.data.components).forEach(letterGroup => {
            availableComponents.push(...letterGroup)
          })
        }
      }
      
      console.log(`📦 Found ${availableComponents.length} available components`)
      
      // Match and create components
      if (aiComponentsData.components && Array.isArray(aiComponentsData.components)) {
        console.log(`🎯 Creating ${aiComponentsData.components.length} components...`)
        
        for (let i = 0; i < aiComponentsData.components.length; i++) {
          const componentSpec = aiComponentsData.components[i]
          console.log(`\n🔨 Creating component ${i + 1}/${aiComponentsData.components.length}:`, componentSpec)
          const result = await createComponentFromSpec(componentSpec, frame, availableComponents)
          console.log(`${result ? '✅' : '❌'} Component ${i + 1} result:`, result)
        }
        
        console.log('🎉 All components processed!')
      } else {
        console.warn('⚠️ No components array found in AI output')
      }

    } catch (error) {
      console.error('❌ Error parsing AI output:', error)
      console.error('Stack trace:', error.stack)
      throw error
    }
  }

  const createComponentFromSpec = async (spec, frame, availableComponents) => {
    try {
      console.log('  🔍 Looking for component type:', spec.type)
      
      // Find matching component from database
      const matchingComponent = findMatchingComponent(spec.type, availableComponents)
      
      if (!matchingComponent) {
        console.warn(`  ⚠️ No matching component found for: ${spec.type}`)
        return null
      }

      console.log('  ✅ Found matching component:', matchingComponent.name, matchingComponent.type)

      // Select appropriate variant if specified
      let selectedVariant = null
      let variantStyles = {}
      
      if (spec.variant && matchingComponent.variants) {
        console.log('  🎨 Looking for variant:', spec.variant)
        selectedVariant = matchingComponent.variants.find(v => 
          v.name.toLowerCase().includes(spec.variant.toLowerCase())
        )
        
        // Extract styles from the selected variant
        if (selectedVariant && selectedVariant.style) {
          variantStyles = selectedVariant.style
          console.log('  ✅ Found variant styles:', Object.keys(variantStyles))
        } else {
          console.log('  ⚠️ Variant not found or has no styles')
        }
      }

      // Merge styles: default component styles < variant styles < AI specified styles
      const mergedStyles = {
        ...(matchingComponent.default_props?.style || {}),
        ...variantStyles,
        ...(spec.style || {})
      }

      console.log('  📐 Merged styles:', Object.keys(mergedStyles))

      // Prepare component data
      const componentData = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: matchingComponent.type,
        name: spec.name || matchingComponent.name,
        props: spec.props || matchingComponent.default_props || {},
        style: mergedStyles,
        zIndex: spec.zIndex || 0,
        sortOrder: spec.sortOrder || 0,
        visible: true,
        locked: false,
        children: []
      }

      const payload = {
        project_id: project.id,
        frame_id: frame.numeric_id,  // Use numeric database ID
        component_instance_id: componentData.id,
        component_type: componentData.type,
        props: componentData.props,
        name: componentData.name,
        style: componentData.style,
        z_index: componentData.zIndex,
        sort_order: componentData.sortOrder,
        visible: componentData.visible,
        locked: componentData.locked
      }

      console.log('  📤 Sending to API:', {
        endpoint: '/api/project-components',
        payload_keys: Object.keys(payload),
        frame_numeric_id: frame.numeric_id,
        project_id: project.id
      })

      // Create component via API
      const response = await axios.post('/api/project-components', payload)

      console.log('  📥 API Response status:', response.status)
      console.log('  ✅ Component created successfully:', response.data)

      return response.data

    } catch (error) {
      console.error('  ❌ Error creating component from spec:', error)
      console.error('  Stack:', error.stack)
      return null
    }
  }

  const findMatchingComponent = (requestedType, availableComponents) => {
    console.log(`    🔎 Matching "${requestedType}" against ${availableComponents.length} components`)
    
    // First try exact match
    let match = availableComponents.find(c => 
      c.type.toLowerCase() === requestedType.toLowerCase()
    )
    
    if (match) {
      console.log(`    ✅ Exact match found: ${match.type}`)
      return match
    }

    // Try partial match
    match = availableComponents.find(c => 
      c.type.toLowerCase().includes(requestedType.toLowerCase()) ||
      c.name.toLowerCase().includes(requestedType.toLowerCase())
    )
    
    if (match) {
      console.log(`    ✅ Partial match found: ${match.type}`)
      return match
    }

    // Try category match
    match = availableComponents.find(c => 
      c.category?.toLowerCase().includes(requestedType.toLowerCase())
    )
    
    if (match) {
      console.log(`    ✅ Category match found: ${match.type}`)
      return match
    }
    
    console.log(`    ❌ No match found for: ${requestedType}`)
    return null
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


        {/* Canvas Settings - Only show for PAGE type (components don't have canvas root) */}
        {data.type === 'page' && (
          <>
            {/* Canvas Dimensions */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
                Canvas Dimensions
              </label>
              <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                These dimensions apply to the canvas root element (body/html)
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                    Width
                  </label>
                  <input
                    type="text"
                    value={data.canvas_style.width}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      canvas_style: { ...prev.canvas_style, width: e.target.value }
                    }))}
                    placeholder="e.g., 100%, 100vw, 1200px"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                    Height
                  </label>
                  <input
                    type="text"
                    value={data.canvas_style.height}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      canvas_style: { ...prev.canvas_style, height: e.target.value }
                    }))}
                    placeholder="e.g., 100%, 100vh, auto"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  Min Height
                </label>
                <input
                  type="text"
                  value={data.canvas_style.minHeight}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    canvas_style: { ...prev.canvas_style, minHeight: e.target.value }
                  }))}
                  placeholder="e.g., 100vh, 600px"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Background Color
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={data.canvas_style.backgroundColor}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    canvas_style: { ...prev.canvas_style, backgroundColor: e.target.value },
                    settings: { ...prev.settings, background_color: e.target.value }
                  }))}
                  className="w-16 h-10 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={data.canvas_style.backgroundColor}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    canvas_style: { ...prev.canvas_style, backgroundColor: e.target.value },
                    settings: { ...prev.settings, background_color: e.target.value }
                  }))}
                  placeholder="#ffffff"
                  className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </>
        )}

          {/* AI Prompt Input */}
          <div className="border-t border-[var(--color-border)] pt-6 mt-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              AI Design Prompt (Optional)
            </label>
            <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
              Describe what you want to create and AI will assemble pre-styled components for you. Leave empty for manual design.
            </p>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., Create a hero section with a heading, subheading, and a primary button"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all resize-none"
            />
            {aiPrompt.trim() && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  ✨ AI will use existing components from your library to build this design
                </p>
              </div>
            )}
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
            disabled={processing || isGeneratingAI}
            className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(processing || isGeneratingAI) && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {isGeneratingAI ? 'Generating with AI...' : processing ? 'Creating...' : 'Create Frame'}
            {!processing && !isGeneratingAI && <ArrowRight className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  )
}