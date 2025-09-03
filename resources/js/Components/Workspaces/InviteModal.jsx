// @/Components/Workspaces/InviteModal.jsx
import React, { useState, useEffect, useRef } from 'react'
import { X, Mail, Link as LinkIcon, Copy, Check, Users, Eye, Edit, Plus, AlertCircle, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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

const InviteModal = ({ show, onClose, workspaceId }) => {
  const [activeTab, setActiveTab] = useState('email')
  const [emailInput, setEmailInput] = useState('')
  const [emailRole, setEmailRole] = useState('viewer')
  const [linkRole, setLinkRole] = useState('viewer')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false)

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
    createWorkspace 
  } = useWorkspaceStore()

  // Reset state when modal opens/closes
  useEffect(() => {
    if (show) {
      setEmailInput('')
      setEmailSent(false)
      setGeneratedLink('')
      setCopied(false)
      clearError()
    }
  }, [show, clearError])

  // Clear error when switching tabs
  useEffect(() => {
    clearError()
  }, [activeTab, clearError])

  const handleEmailInvite = async (e) => {
    e.preventDefault()
    
    if (!validateEmail(emailInput)) {
      return
    }

    const result = await sendEmailInvite(workspaceId, emailInput, emailRole)
    
    if (result.success) {
      setEmailSent(true)
      setEmailInput('')
      setTimeout(() => setEmailSent(false), 3000)
    }
  }

  const handleGenerateLink = async () => {
    const result = await generateInviteLink(workspaceId, linkRole)
    
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

  const handleCreateWorkspace = async (workspaceData) => {
    try {
      const newWorkspace = await createWorkspace(workspaceData)
      setShowCreateWorkspace(false)
      // The workspace dropdown will automatically switch to the new workspace
    } catch (error) {
      console.error('Failed to create workspace:', error)
    }
  }

  const workspace = workspaces.find(w => w.id === workspaceId) || currentWorkspace

  return (
    <>
      <Modal 
        show={show} 
        onClose={onClose}
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
                {workspace.type === 'personal' && (
                  <span className="text-xs bg-[var(--color-bg)] text-[var(--color-text-muted)] px-2 py-0.5 rounded">
                    Personal
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