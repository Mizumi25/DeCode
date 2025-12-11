// @/Components/PublishModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Lock, AlertCircle, ExternalLink, Copy, Check } from 'lucide-react';

export default function PublishModal({ 
  show, 
  onClose, 
  onConfirm, 
  project,
  mode = 'publish' // 'publish' or 'unpublish'
}) {
  // Generate default subdomain from project name
  const generateSubdomain = (name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/-+/g, '-') // Replace multiple dashes with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
  };

  const defaultSubdomain = project?.published_subdomain || generateSubdomain(project?.name);
  const [subdomain, setSubdomain] = useState(defaultSubdomain);
  const [isPublic, setIsPublic] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    if (project?.published_url) {
      navigator.clipboard.writeText(project.published_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirm = () => {
    onConfirm({ subdomain, isPublic });
  };

  const isPublished = project?.published_url;

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] max-w-lg w-full overflow-hidden"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-6 border-b border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      mode === 'publish' 
                        ? 'bg-[var(--color-primary)]/10' 
                        : 'bg-red-500/10'
                    }`}>
                      {mode === 'publish' ? (
                        <Globe className={`w-5 h-5 ${
                          isPublished 
                            ? 'text-green-500' 
                            : 'text-[var(--color-primary)]'
                        }`} />
                      ) : (
                        <Lock className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[var(--color-text)]">
                        {mode === 'publish' 
                          ? (isPublished ? 'Update Published Site' : 'Publish Project')
                          : 'Unpublish Project'
                        }
                      </h2>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {project?.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
                  >
                    <X className="w-5 h-5 text-[var(--color-text-muted)]" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {mode === 'publish' ? (
                  <>
                    {/* Current URL Display (if already published) */}
                    {isPublished && (
                      <div className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <Check className="w-5 h-5 text-green-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">
                              Site is Live! 🎉
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)] mb-3">
                              Your project is published and accessible to everyone
                            </p>
                            
                            {/* URL Display */}
                            <div className="flex items-center gap-2 p-2 bg-[var(--color-bg)]/50 rounded-lg mb-3">
                              <code className="flex-1 text-xs text-[var(--color-text)] truncate font-mono">
                                {project.published_url}
                              </code>
                              <button
                                onClick={handleCopyUrl}
                                className="p-1.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors flex-shrink-0"
                                title="Copy URL"
                              >
                                {copied ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4 text-[var(--color-text-muted)]" />
                                )}
                              </button>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <a
                                href={project.published_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-green-500/25"
                              >
                                <ExternalLink className="w-4 h-4" />
                                <span className="text-sm">View Site</span>
                              </a>
                              <button
                                onClick={() => {
                                  // TODO: Implement unpublish
                                  console.log('Unpublish clicked')
                                }}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg font-medium transition-colors text-sm"
                              >
                                Unpublish
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Subdomain Input */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                        Subdomain
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={subdomain}
                          onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          placeholder="my-awesome-project"
                          className="flex-1 px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                        />
                        <span className="text-sm text-[var(--color-text-muted)] whitespace-nowrap">
                          .yoursite.com
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                        Choose a unique subdomain for your project URL
                      </p>
                    </div>

                    {/* Visibility Toggle */}
                    <div className="flex items-center justify-between p-4 bg-[var(--color-bg-muted)] rounded-lg">
                      <div className="flex items-center gap-3">
                        {isPublic ? (
                          <Globe className="w-5 h-5 text-[var(--color-primary)]" />
                        ) : (
                          <Lock className="w-5 h-5 text-[var(--color-text-muted)]" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text)]">
                            {isPublic ? 'Public' : 'Private'}
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {isPublic 
                              ? 'Anyone with the link can view'
                              : 'Only workspace members can view'
                            }
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsPublic(!isPublic)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isPublic ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isPublic ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Info Message */}
                    <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-[var(--color-text-muted)]">
                        <p className="font-medium text-[var(--color-text)] mb-1">
                          What happens when you publish?
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Your project will be built and optimized</li>
                          <li>A public URL will be generated</li>
                          <li>All collaborators will see the publish progress</li>
                          <li>You can update or unpublish anytime</li>
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Unpublish Content */
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-[var(--color-text)] mb-1">
                          Are you sure you want to unpublish?
                        </p>
                        <p className="text-[var(--color-text-muted)]">
                          This will remove your site from the public URL. The project data will remain in your workspace.
                        </p>
                      </div>
                    </div>

                    {isPublished && (
                      <div className="p-4 bg-[var(--color-bg-muted)] rounded-lg">
                        <p className="text-sm text-[var(--color-text-muted)] mb-1">
                          Current URL:
                        </p>
                        <p className="text-sm font-mono text-[var(--color-text)] break-all">
                          {project.published_url}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg-muted)]/50">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-[var(--color-bg)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text)] transition-colors"
                  >
                    {isPublished ? 'Close' : 'Cancel'}
                  </button>
                  {!isPublished && (
                    <button
                      onClick={handleConfirm}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        mode === 'publish'
                          ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-lg shadow-[var(--color-primary)]/25'
                          : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
                      }`}
                    >
                      {mode === 'publish' ? 'Publish Now' : 'Unpublish'}
                    </button>
                  )}
                  {isPublished && mode === 'publish' && (
                    <button
                      onClick={handleConfirm}
                      className="px-6 py-2 rounded-lg font-medium bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-lg shadow-[var(--color-primary)]/25 transition-all"
                    >
                      Update Site
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
