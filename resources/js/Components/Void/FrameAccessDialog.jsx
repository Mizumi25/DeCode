// Components/Void/FrameAccessDialog.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Shield, AlertTriangle, X } from 'lucide-react';

/**
 * Dialog for handling locked frame access from Void page
 * - Shows different prompts for Owner vs Editor
 * - Owner can bypass lock
 * - Editor must request access
 */
const FrameAccessDialog = ({
  isOpen,
  onClose,
  onBypass,
  onRequest,
  lockStatus,
  userRole,
  frameName,
  isLoading = false,
}) => {
  const [requestMessage, setRequestMessage] = useState('');

  if (!isOpen || !lockStatus) return null;

  const isOwner = userRole === 'owner';
  const lockedBy = lockStatus.locked_by;
  const lockedMode = lockStatus.locked_mode;

  const handleConfirm = () => {
    if (isOwner) {
      onBypass();
    } else {
      onRequest(requestMessage);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Dialog */}
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--color-surface)] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              style={{ pointerEvents: 'auto' }}
            >
              {/* Header */}
              <div className="p-6 pb-4 border-b border-[var(--color-border)]">
                <div className="flex items-start gap-4">
                  <div
                    className={`
                      flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                      ${
                        isOwner
                          ? 'bg-amber-500/10 dark:bg-amber-500/20'
                          : 'bg-purple-500/10 dark:bg-purple-500/20'
                      }
                    `}
                  >
                    {isOwner ? (
                      <Shield className="w-6 h-6 text-amber-500" />
                    ) : (
                      <Lock className="w-6 h-6 text-purple-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">
                      {isOwner ? 'Frame Locked by Team Member' : 'Frame is Locked'}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {frameName && (
                        <span className="font-medium">"{frameName}" </span>
                      )}
                      is locked by {lockedBy?.name || 'someone'} in {lockedMode} mode
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

              {/* Content */}
              <div className="p-6">
                {isOwner ? (
                  <>
                    <div className="mb-4">
                      <div className="flex items-start gap-3 p-4 bg-amber-500/10 dark:bg-amber-500/20 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-[var(--color-text)]">
                          <p className="font-medium mb-1">Owner Override Available</p>
                          <p className="text-[var(--color-text-muted)]">
                            As workspace owner, you can enter the locked frame. The frame
                            will remain locked, but you'll be notified inside.
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-[var(--color-text-muted)] mb-4">
                      {lockedBy?.name} will be notified that you're entering the frame.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-[var(--color-text-muted)] mb-4">
                      This frame is currently being edited. You can request access, and{' '}
                      {lockedBy?.name} will be notified.
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                        Request Message (Optional)
                      </label>
                      <textarea
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        placeholder="Let them know why you need access..."
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                        rows={3}
                        maxLength={500}
                      />
                      <div className="mt-1 text-xs text-[var(--color-text-muted)] text-right">
                        {requestMessage.length}/500
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-[var(--color-bg-muted)] flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg)] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`
                    px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2
                    ${
                      isOwner
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : 'bg-purple-500 hover:bg-purple-600'
                    }
                  `}
                >
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {isOwner ? 'Enter Frame' : 'Request Access'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default FrameAccessDialog;
