// Components/Auth/SessionConflictDialog.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, LogOut, Monitor } from 'lucide-react';

const SessionConflictDialog = ({ isOpen, onClose, userEmail, onForceLogout }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleForceLogout = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/force-logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success - close dialog and retry login
        onForceLogout();
      } else {
        setError(data.message || 'Invalid password');
      }
    } catch (error) {
      setError('Failed to force logout. Please try again.');
      console.error('Force logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md bg-[var(--color-surface)] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[var(--color-border)]">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">
                Already Logged In
              </h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                This account is currently logged in on another device
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
          <div className="mb-4 p-4 bg-amber-500/10 dark:bg-amber-500/20 rounded-lg flex items-start gap-3">
            <Monitor className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[var(--color-text)]">
              <p className="font-medium mb-1">Active Session Detected</p>
              <p className="text-[var(--color-text-muted)]">
                To continue logging in here, you need to logout from the other device first,
                or force logout by confirming your password below.
              </p>
            </div>
          </div>

          <form onSubmit={handleForceLogout}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Confirm Your Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                required
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-[var(--color-text)] bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg)] rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !password}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                Force Logout & Continue
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default SessionConflictDialog;
