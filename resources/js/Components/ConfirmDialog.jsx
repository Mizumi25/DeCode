import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger', 'warning', 'info'
  isLoading = false
}) => {
  
  const variantStyles = {
    danger: {
      bg: 'bg-red-500 hover:bg-red-600',
      icon: 'text-red-500',
      iconBg: 'bg-red-100 dark:bg-red-900/20'
    },
    warning: {
      bg: 'bg-yellow-500 hover:bg-yellow-600',
      icon: 'text-yellow-500',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    info: {
      bg: 'bg-blue-500 hover:bg-blue-600',
      icon: 'text-blue-500',
      iconBg: 'bg-blue-100 dark:bg-blue-900/20'
    }
  };

  const style = variantStyles[variant] || variantStyles.danger;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${style.iconBg} flex items-center justify-center`}>
                    <AlertTriangle className={`w-6 h-6 ${style.icon}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                      {title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {message}
                    </p>
                  </div>

                  <button
                    onClick={onClose}
                    className="flex-shrink-0 p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-[var(--color-text-muted)]" />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-[var(--color-bg-muted)] flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg)] transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${style.bg}`}
                >
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
