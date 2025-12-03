// Components/Forge/LockAccessRequestDialog.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, UserPlus, Check, X } from 'lucide-react';

/**
 * Dialog that appears for users inside Forge/Source when someone requests access
 */
const LockAccessRequestDialog = ({ request, onAccept, onDecline }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await onAccept();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    try {
      await onDecline();
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-6 right-6 z-[9999] max-w-md"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[var(--color-text)]">
                  Access Request
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Someone wants to enter
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start gap-3 mb-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {request.requester?.avatar ? (
                  <img
                    src={request.requester.avatar}
                    alt={request.requester.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white"
                    style={{ backgroundColor: request.requester?.color || '#6366f1' }}
                  >
                    {request.requester?.initials || 'U'}
                  </div>
                )}
              </div>

              {/* Request Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-text)] mb-1">
                  <span className="font-semibold">{request.requester?.name || 'Someone'}</span>
                  {' '}wants to access this frame
                </p>
                {request.message && (
                  <div className="mt-2 p-2 bg-[var(--color-bg-muted)] rounded-lg">
                    <p className="text-xs text-[var(--color-text-muted)] italic">
                      "{request.message}"
                    </p>
                  </div>
                )}
                <p className="text-xs text-[var(--color-text-muted)] mt-2">
                  Mode: <span className="font-medium">{request.requested_mode || 'forge'}</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleDecline}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-[var(--color-text)] bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg)] rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Decline
              </button>
              <button
                onClick={handleAccept}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Accept
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default LockAccessRequestDialog;
