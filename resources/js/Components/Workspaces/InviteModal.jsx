// @/Components/Workspaces/InviteModal.jsx
import React, { useState, useEffect, useRef } from 'react'
import { X, Mail, Link as LinkIcon, Copy, Check, Users, Eye, Edit, Plus, AlertCircle, ChevronDown, ArrowRight, Zap, Home } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from '@inertiajs/react'
import Modal from '@/Components/Modal'
import CreateWorkspaceModal from './CreateWorkspaceModal'
import { useInviteStore, copyToClipboard, validateEmail } from '@/stores/useInviteStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

// Role options
const WORKSPACE_ROLES = [
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Can view projects and workspaces',
    icon: Eye
  },
  {
    value: 'editor', 
    label: 'Editor',
    description: 'Can create, edit, and manage projects',
    icon: Edit
  }
]

// Custom Dropdown Component
const CustomDropdown = ({ value, onChange, options, placeholder = "Select option" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(option => option.value === value)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon && (
            <selectedOption.icon className="w-4 h-4 text-[var(--color-text-muted)]" />
          )}
          <span>{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1 w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 max-h-60 overflow-auto"
          >
            {options.map((option) => {
              const IconComponent = option.icon
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-[var(--color-bg-muted)] transition-colors first:rounded-t-lg last:rounded-b-lg flex items-start gap-2 ${
                    value === option.value ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-text)]'
                  }`}
                >
                  {IconComponent && (
                    <IconComponent className={`w-4 h-4 mt-0.5 ${
                      value === option.value ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
                    }`} />
                  )}
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-[var(--color-text-muted)] mt-1">
                        {option.description}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Personal Workspace Notice Component
const PersonalWorkspaceNotice = ({ workspace, onConvert, onCreateNew, isConverting }) => {
  return (
    <div className="p-6 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-[var(--color-bg-muted)] rounded-full flex items-center justify-center mx-auto mb-4">
          <Home className="w-8 h-8 text-[var(--color-text-muted)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
          Personal Workspace
        </h3>
        <p className="text-[var(--color-text-muted)] mb-4">
          You can't invite members to a personal workspace. Choose an option below to enable team collaboration.
        </p>
      </div>

      <div className="space-y-4">
        {/* Convert Personal Workspace */}
        <div className="p-4 border border-[var(--color-border)] rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-[var(--color-primary)]" />
              <div className="text-left">
                <div className="font-medium text-[var(--color-text)]">Convert to Team Workspace</div>
                <div className="text-sm text-[var(--color-text-muted)]">
                  Transform "{workspace?.name}" into a collaborative workspace
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)]" />
          </div>
          <button
            onClick={onConvert}
            disabled={isConverting}
            className="w-full bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-medium hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isConverting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Converting...
              </>
            ) : (
              'Convert to Team Workspace'
            )}
          </button>
          <p className="text-xs text-[var(--color-text-muted)] mt-2">
            A new personal workspace will be created automatically
          </p>
        </div>

        {/* Create New Workspace */}
        <div className="p-4 border border-dashed border-[var(--color-border)] rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Plus className="w-4 h-4 text-[var(--color-text-muted)]" />
            <span className="text-[var(--color-text)] font-medium">Create New Team Workspace</span>
          </div>
          <button
            onClick={onCreateNew}
            disabled={isConverting}
            className="w-full bg-[var(--color-bg-muted)] text-[var(--color-text)] px-4 py-2 rounded-lg font-medium hover:bg-[var(--color-bg-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create New Workspace
          </button>
          <p className="text-xs text-[var(--color-text-muted)] mt-2">
            Keep your personal workspace and create a separate team workspace
          </p>
        </div>
      </div>
    </div>
  )
}

const InviteModal = ({ show, onClose, workspaceId, forceInviteMode = false }) => {
  const [activeTab, setActiveTab] = useState('email')
  const [emailInput, setEmailInput] = useState('')
  const [emailRole, setEmailRole] = useState('viewer')
  const [linkRole, setLinkRole] = useState('viewer')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  const {
    isLoading,
    error,
    sendEmailInvite,
    generateInviteLink,
    clearError
  } = useInviteStore()

  const { 
    currentWorkspace,
    workspaces,
    createWorkspace,
    updateWorkspace,
    initializeWorkspaces,
    setCurrentWorkspace
  } = useWorkspaceStore()

  // Get the workspace (either from prop or current)
  const workspace = workspaces.find(w => w.id === workspaceId) || currentWorkspace
  const isPersonalWorkspace = workspace?.type === 'personal' && !forceInviteMode

  // Reset state when modal opens/closes
  useEffect(() => {
    if (show) {
      setEmailInput('')
      setEmailSent(false)
      setGeneratedLink('')
      setCopied(false)
      clearError()
      setIsConverting(false)
    }
  }, [show, clearError])

  // Clear error when switching tabs
  useEffect(() => {
    clearError()
  }, [activeTab, clearError])

  // Listen for workspace conversion events
  useEffect(() => {
    const handleWorkspaceConverted = (event) => {
      const { shouldOpenInviteModal } = event.detail
      console.log('InviteModal: Workspace conversion event received', event.detail)
      
      if (shouldOpenInviteModal && !show) {
        console.log('InviteModal: Opening in invite mode after conversion')
        // This will be handled by the parent component
      }
    }

    window.addEventListener('workspace-converted', handleWorkspaceConverted)
    return () => {
      window.removeEventListener('workspace-converted', handleWorkspaceConverted)
    }
  }, [show])

    // Fixed handleEmailInvite function in InviteModal.jsx
  const handleEmailInvite = async (e) => {
    e.preventDefault()
    
    if (!validateEmail(emailInput)) {
      return
    }
  
    // Use the workspace UUID if available, otherwise fall back to the workspaceId prop
    const targetWorkspaceId = workspace?.uuid || workspaceId
    
    console.log('Sending invite with workspace ID:', targetWorkspaceId) // Debug log
    
    if (!targetWorkspaceId) {
      console.error('No workspace ID available for invite')
      return
    }
  
    const result = await sendEmailInvite(targetWorkspaceId, emailInput, emailRole)
    
    if (result.success) {
      setEmailSent(true)
      setEmailInput('')
      setTimeout(() => setEmailSent(false), 3000)
    }
  }
  
  // Also fix the handleGenerateLink function
  const handleGenerateLink = async () => {
    // Use the workspace UUID if available, otherwise fall back to the workspaceId prop  
    const targetWorkspaceId = workspace?.uuid || workspaceId
    
    console.log('Generating link with workspace ID:', targetWorkspaceId) // Debug log
    
    if (!targetWorkspaceId) {
      console.error('No workspace ID available for invite')
      return
    }
  
    const result = await generateInviteLink(targetWorkspaceId, linkRole)
    
    if (result.success) {
      setGeneratedLink(result.link)
    }
  }

  const handleCopyLink = async () => {
    if (await copyToClipboard(generatedLink)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

   const handleConvertPersonalWorkspace = async () => {
    if (!workspace) return
  
    setIsConverting(true)
    try {
      console.log('Converting personal workspace to team:', workspace.uuid)
  
      // Use the workspace UUID for the API call
      const result = await updateWorkspace(workspace.uuid, {
        type: 'team',
        settings: {
          ...workspace.settings,
          privacy: 'private'
        }
      })
  
      console.log('Conversion result:', result)
  
      if (result.converted) {
        onClose()
        console.log('Conversion successful, event dispatched')
      }
  
    } catch (error) {
      console.error('Failed to convert workspace:', error)
    } finally {
      setIsConverting(false)
    }
  }

  const handleCreateNewWorkspace = () => {
    setShowCreateWorkspace(true)
  }

  const handleClose = () => {
    setEmailInput('')
    setEmailSent(false)
    setGeneratedLink('')
    setCopied(false)
    setIsConverting(false)
    clearError()
    onClose()
  }

  // If it's a personal workspace and not forced to invite mode, show the conversion options instead
  if (isPersonalWorkspace) {
    return (
      <>
        <Modal 
          show={show} 
          onClose={handleClose}
          maxWidth="md"
          title="Invite to Workspace"
        >
          <PersonalWorkspaceNotice
            workspace={workspace}
            onConvert={handleConvertPersonalWorkspace}
            onCreateNew={handleCreateNewWorkspace}
            isConverting={isConverting}
          />
        </Modal>

        <CreateWorkspaceModal 
          show={showCreateWorkspace}
          onClose={() => setShowCreateWorkspace(false)}
        />
      </>
    )
  }

  return (
    <>
      <Modal 
        show={show} 
        onClose={handleClose}
        maxWidth="md"
        title="Invite to Workspace"
      >
        <div className="p-6">
          {/* Workspace Info */}
          {workspace && (
            <div className="mb-6 p-4 bg-[var(--color-bg-muted)] rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--color-text-muted)]" />
                <span className="font-medium text-[var(--color-text)]">{workspace.name}</span>
                {workspace.type === 'team' && (
                  <span className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-0.5 rounded border border-[var(--color-primary)]/20">
                    Team
                  </span>
                )}
                {workspace.type === 'company' && (
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                    Company
                  </span>
                )}
              </div>
              {workspace.description && (
                <p className="text-sm text-[var(--color-text-muted)] mt-2">{workspace.description}</p>
              )}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex border-b border-[var(--color-border)] mb-6">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'email'
                  ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <Mail className="w-4 h-4" />
              Invite by Email
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'link'
                  ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              Share Link
            </button>
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'email' ? (
              <motion.div
                key="email-tab"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleEmailInvite} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="colleague@example.com"
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Role
                    </label>
                    <CustomDropdown
                      value={emailRole}
                      onChange={setEmailRole}
                      options={WORKSPACE_ROLES}
                      placeholder="Select role"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !emailInput || emailSent}
                    className="w-full bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : emailSent ? (
                      <>
                        <Check className="w-4 h-4" />
                        Invitation Sent!
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="link-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Role for Link Users
                    </label>
                    <CustomDropdown
                      value={linkRole}
                      onChange={setLinkRole}
                      options={WORKSPACE_ROLES}
                      placeholder="Select role"
                    />
                  </div>

                  {!generatedLink ? (
                    <button
                      onClick={handleGenerateLink}
                      disabled={isLoading}
                      className="w-full bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-4 h-4" />
                          Generate Invite Link
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                          Invite Link
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={generatedLink}
                            readOnly
                            className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-muted)] text-[var(--color-text)] text-sm"
                          />
                          <button
                            onClick={handleCopyLink}
                            className="px-3 py-2 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors flex items-center gap-1"
                          >
                            {copied ? (
                              <>
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span className="text-sm">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-[var(--color-bg-muted)] rounded-lg">
                        <p className="text-sm text-[var(--color-text-muted)]">
                          Anyone with this link can join your workspace as a <strong>{linkRole}</strong>. 
                          Share it only with people you trust.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setGeneratedLink('')
                          setCopied(false)
                        }}
                        className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                      >
                        Generate new link
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Create New Workspace Option */}
          <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
            <button
              onClick={() => setShowCreateWorkspace(true)}
              className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-[var(--color-border)] rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Create a new workspace to invite people to</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal 
        show={showCreateWorkspace}
        onClose={() => setShowCreateWorkspace(false)}
      />
    </>
  )
}

export default InviteModal