// @/Components/Projects/ShareModal.jsx
import React, { useState, useEffect } from 'react'
import { X, Copy, Check, Globe, Lock, ExternalLink, QrCode } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ShareModal = ({ show, onClose, project }) => {
  const [isPublic, setIsPublic] = useState(project?.is_public || false)
  const [copied, setCopied] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [showQR, setShowQR] = useState(false)

  // Update local state when project changes
  useEffect(() => {
    setIsPublic(project?.is_public || false)
  }, [project?.is_public])

  if (!show || !project) return null

  const publicUrl = `${window.location.origin}/public/${project.uuid}/void`

  const handleTogglePublic = async () => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/projects/${project.uuid}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
        },
        body: JSON.stringify({
          is_public: !isPublic
        })
      })

      if (response.ok) {
        const data = await response.json()
        setIsPublic(data.project.is_public)
        
        // Reload page to reflect changes
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        console.error('Failed to update project visibility')
      }
    } catch (error) {
      console.error('Error updating visibility:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleOpenInNewTab = () => {
    window.open(publicUrl, '_blank')
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[var(--color-surface)] rounded-xl shadow-2xl z-[9999] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Globe className="w-6 h-6 text-green-500" />
                ) : (
                  <Lock className="w-6 h-6 text-[var(--color-text-muted)]" />
                )}
                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-text)]">
                    Share Project
                  </h2>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {project.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[var(--color-bg-muted)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[var(--color-text-muted)]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Public/Private Toggle */}
              <div className="flex items-center justify-between p-4 bg-[var(--color-bg-muted)] rounded-lg">
                <div className="flex items-center gap-3">
                  {isPublic ? (
                    <Globe className="w-5 h-5 text-green-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-[var(--color-text-muted)]" />
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-[var(--color-text)]">
                      {isPublic ? 'Public Project' : 'Private Project'}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {isPublic
                        ? 'Anyone with the link can view this project'
                        : 'Only workspace members can access'}
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={handleTogglePublic}
                  disabled={updating}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isPublic ? 'bg-green-500' : 'bg-[var(--color-border)]'
                  } ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <motion.div
                    animate={{ x: isPublic ? 24 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>

              {/* Public URL Section (only show if public) */}
              {isPublic && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-[var(--color-text)]">
                    Public Link
                  </label>
                  
                  {/* URL Display with Copy Button */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg">
                      <Globe className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
                      <input
                        type="text"
                        readOnly
                        value={publicUrl}
                        className="flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none"
                      />
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-sm font-medium">Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenInNewTab}
                      className="flex-1 px-4 py-2 bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text)] rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm font-medium">Open Link</span>
                    </button>
                    
                    <button
                      onClick={() => setShowQR(!showQR)}
                      className="flex-1 px-4 py-2 bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text)] rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      <span className="text-sm font-medium">QR Code</span>
                    </button>
                  </div>

                  {/* QR Code Display */}
                  {showQR && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex justify-center p-4 bg-white rounded-lg"
                    >
                      <div className="text-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`}
                          alt="QR Code"
                          className="w-48 h-48"
                        />
                        <p className="mt-2 text-xs text-gray-600">
                          Scan to open project
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Help Text */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {isPublic ? (
                    <>
                      <strong>Note:</strong> Anyone with this link can view your project in read-only mode. 
                      Workspace members can still edit if they have permission.
                    </>
                  ) : (
                    <>
                      <strong>Tip:</strong> Make this project public to share it with anyone, even without a workspace account.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--color-border)] bg-[var(--color-bg-muted)]">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ShareModal
