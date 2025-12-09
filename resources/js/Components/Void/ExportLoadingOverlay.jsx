import React from 'react'
import { Download, Github, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ExportLoadingOverlay = ({ isExporting, exportType }) => {
  return (
    <AnimatePresence>
      {isExporting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-[var(--color-surface)] rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
          >
            <div className="flex flex-col items-center gap-6">
              {/* Icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--color-primary)]/20 rounded-full animate-ping" />
                <div className="relative bg-[var(--color-primary)]/10 p-6 rounded-full">
                  {exportType === 'zip' ? (
                    <Download className="w-12 h-12 text-[var(--color-primary)] animate-bounce" />
                  ) : (
                    <Github className="w-12 h-12 text-[var(--color-primary)] animate-pulse" />
                  )}
                </div>
              </div>

              {/* Text */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-[var(--color-text)]">
                  {exportType === 'zip' ? 'Exporting Project...' : 'Pushing to GitHub...'}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {exportType === 'zip' 
                    ? 'Generating project files and creating ZIP archive'
                    : 'Committing changes and pushing to repository'
                  }
                </p>
              </div>

              {/* Loading spinner */}
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-[var(--color-primary)] animate-spin" />
                <span className="text-sm text-[var(--color-text-muted)]">Please wait...</span>
              </div>

              {/* Progress steps */}
              <div className="w-full space-y-2 text-xs text-[var(--color-text-muted)]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Collecting frames and components</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse animation-delay-200" />
                  <span>Generating boilerplate files</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse animation-delay-400" />
                  <span>Processing styles and assets</span>
                </div>
                {exportType === 'github' && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse animation-delay-600" />
                    <span>Pushing to repository</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ExportLoadingOverlay
