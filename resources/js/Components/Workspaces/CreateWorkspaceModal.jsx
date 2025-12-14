// @/Components/Workspaces/CreateWorkspaceModal.jsx
import React, { useState, useEffect } from 'react'
import { X, Users, Globe, Lock, Briefcase, Home } from 'lucide-react'
import Modal from '@/Components/Modal'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import useTutorialStore from '@/stores/useTutorialStore'

const WORKSPACE_TYPES = [
  {
    value: 'team',
    label: 'Team Workspace',
    icon: Users,
    description: 'Collaborate with your team on projects',
    recommended: true
  },
  {
    value: 'company',
    label: 'Company Workspace', 
    icon: Briefcase,
    description: 'Organization-wide workspace for multiple teams'
  },
  {
    value: 'personal',
    label: 'Personal Workspace',
    icon: Home,
    description: 'Private workspace for your personal projects'
  }
]

const PRIVACY_OPTIONS = [
  {
    value: 'private',
    label: 'Private',
    icon: Lock,
    description: 'Only invited members can access this workspace'
  },
  {
    value: 'public',
    label: 'Public',
    icon: Globe,
    description: 'Anyone with the link can join this workspace'
  }
]

const CreateWorkspaceModal = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'team',
    privacy: 'private'
  })
  const [errors, setErrors] = useState({})

  const { createWorkspace, isLoading, error } = useWorkspaceStore()
  const { isPageTutorialActive } = useTutorialStore()
  
  // During tutorial: force team workspace type
  useEffect(() => {
    if (isPageTutorialActive && formData.type !== 'team') {
      setFormData(prev => ({ ...prev, type: 'team' }))
    }
  }, [isPageTutorialActive, show])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Workspace name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Workspace name must be at least 2 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await createWorkspace({
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        settings: {
          privacy: formData.privacy
        }
      })
      
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        type: 'team',
        privacy: 'private'
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Failed to create workspace:', error)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      type: 'team',
      privacy: 'private'
    })
    setErrors({})
    onClose()
  }

  const selectedType = WORKSPACE_TYPES.find(t => t.value === formData.type)
  const selectedPrivacy = PRIVACY_OPTIONS.find(p => p.value === formData.privacy)

  return (
    <Modal
      show={show}
      onClose={handleClose}
      maxWidth="lg"
      title="Create New Workspace"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Workspace Name */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Workspace Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Acme Design Team"
            data-tutorial="workspace-name-input"
            className={`w-full px-3 py-2 border rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent ${
              errors.name ? 'border-red-300 dark:border-red-600' : 'border-[var(--color-border)]'
            }`}
            maxLength="50"
          />
          {errors.name && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Description <span className="text-[var(--color-text-muted)] font-normal">(Optional)</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Brief description of what this workspace is for..."
            rows={3}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
            maxLength="200"
          />
          <div className="text-right text-xs text-[var(--color-text-muted)] mt-1">
            {formData.description.length}/200
          </div>
        </div>

        {/* Workspace Type */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
            Workspace Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {WORKSPACE_TYPES.map((type) => {
              const Icon = type.icon
              const isSelected = formData.type === type.value
              
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('type', type.value)}
                  disabled={isPageTutorialActive && type.value !== 'team'}
                  data-tutorial={type.value === 'team' ? 'team-workspace-option' : undefined}
                  className={`relative p-4 border rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                  } ${isPageTutorialActive && type.value !== 'team' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {type.recommended && (
                    <span className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-xs px-2 py-1 rounded-full">
                      Recommended
                    </span>
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
                    <span className={`font-medium ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
                      {type.label}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {type.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Privacy Settings */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
            Privacy
          </label>
          <div className="space-y-3">
            {PRIVACY_OPTIONS.map((privacy) => {
              const Icon = privacy.icon
              const isSelected = formData.privacy === privacy.value
              
              return (
                <button
                  key={privacy.value}
                  type="button"
                  onClick={() => handleInputChange('privacy', privacy.value)}
                  className={`w-full p-3 border rounded-lg text-left transition-colors flex items-start gap-3 ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                  }`}
                >
                  <div className="mt-0.5">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
                  </div>
                  <div>
                    <div className={`font-medium mb-1 ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
                      {privacy.label}
                    </div>
                    <div className="text-sm text-[var(--color-text-muted)]">
                      {privacy.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-[var(--color-text)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            data-tutorial="create-workspace-button"
            className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Create Workspace'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateWorkspaceModal