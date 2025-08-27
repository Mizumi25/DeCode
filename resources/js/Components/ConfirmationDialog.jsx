import React from 'react'
import { AlertTriangle, Trash2, X, Check } from 'lucide-react'

export default function ConfirmationDialog({
  show = false,
  onClose = () => {},
  onConfirm = () => {},
  type = 'delete', // 'delete', 'warning', 'info', 'danger'
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger', 'warning', 'primary'
  isLoading = false,
  icon: CustomIcon = null
}) {
  if (!show) return null

  // Icon selection based on type
  const getIcon = () => {
    if (CustomIcon) return CustomIcon
    
    switch (type) {
      case 'delete':
        return Trash2
      case 'warning':
        return AlertTriangle
      case 'danger':
        return AlertTriangle
      default:
        return AlertTriangle
    }
  }

  // Color schemes based on variant
  const getColorScheme = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: 'text-red-500',
          iconBg: 'bg-red-100 dark:bg-red-900/20',
          confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
          confirmBtnDisabled: 'bg-red-400 text-white cursor-not-allowed'
        }
      case 'warning':
        return {
          icon: 'text-yellow-500',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          confirmBtnDisabled: 'bg-yellow-400 text-white cursor-not-allowed'
        }
      case 'primary':
        return {
          icon: 'text-blue-500',
          iconBg: 'bg-blue-100 dark:bg-blue-900/20',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
          confirmBtnDisabled: 'bg-blue-400 text-white cursor-not-allowed'
        }
      default:
        return {
          icon: 'text-gray-500',
          iconBg: 'bg-gray-100 dark:bg-gray-900/20',
          confirmBtn: 'bg-gray-600 hover:bg-gray-700 text-white',
          confirmBtnDisabled: 'bg-gray-400 text-white cursor-not-allowed'
        }
    }
  }

  const Icon = getIcon()
  const colors = getColorScheme()

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm()
    }
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div 
          className="relative transform overflow-hidden rounded-xl shadow-xl transition-all w-full max-w-md"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          </button>

          <div className="p-6">
            {/* Icon */}
            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${colors.iconBg} mb-4`}>
              <Icon className={`h-6 w-6 ${colors.icon}`} />
            </div>

            {/* Title */}
            <h3 
              className="text-lg font-semibold mb-2" 
              style={{ color: 'var(--color-text)' }}
            >
              {title}
            </h3>

            {/* Message */}
            <p 
              className="text-sm mb-6 leading-relaxed" 
              style={{ color: 'var(--color-text-muted)' }}
            >
              {message}
            </p>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  backgroundColor: 'var(--color-surface)'
                }}
              >
                {cancelText}
              </button>
              
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  isLoading ? colors.confirmBtnDisabled : colors.confirmBtn
                }`}
              >
                {isLoading && (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Usage examples:
/*
// Delete confirmation
<ConfirmationDialog
  show={showDeleteDialog}
  onClose={() => setShowDeleteDialog(false)}
  onConfirm={handleDelete}
  type="delete"
  title="Delete Frame"
  message="Are you sure you want to delete this frame? This action cannot be undone."
  confirmText="Delete"
  variant="danger"
  isLoading={isDeleting}
/>

// Warning confirmation
<ConfirmationDialog
  show={showWarningDialog}
  onClose={() => setShowWarningDialog(false)}
  onConfirm={handleProceed}
  type="warning"
  title="Unsaved Changes"
  message="You have unsaved changes that will be lost. Do you want to continue?"
  confirmText="Continue"
  cancelText="Stay"
  variant="warning"
/>

// Custom confirmation
<ConfirmationDialog
  show={showCustomDialog}
  onClose={() => setShowCustomDialog(false)}
  onConfirm={handleCustomAction}
  title="Custom Action"
  message="This will perform a custom action. Continue?"
  confirmText="Yes, do it"
  cancelText="No, cancel"
  variant="primary"
  icon={Check}
/>
*/