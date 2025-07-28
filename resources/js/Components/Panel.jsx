// Create new file: @/Components/Panel/Panel.jsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2 } from 'lucide-react'

export default function Panel({ 
  isOpen, 
  onClose, 
  onMaximize, 
  position = 'right',
  size = 'medium',
  title = 'Panel',
  children 
}) {
  const panelVariants = {
    hidden: { 
      opacity: 0,
      x: position === 'right' ? '100%' : position === 'left' ? '-100%' : 0,
      y: position === 'bottom' ? '100%' : 0
    },
    visible: { 
      opacity: 1,
      x: 0,
      y: 0
    }
  }

  const sizeClasses = {
    small: position === 'bottom' ? 'h-1/3' : 'w-80',
    medium: position === 'bottom' ? 'h-1/2' : 'w-96',
    large: position === 'bottom' ? 'h-2/3' : 'w-[32rem]'
  }

  const positionClasses = {
    right: 'right-4 top-[62px] bottom-4',
    left: 'left-4 top-[62px] bottom-4',
    bottom: 'bottom-4 left-4 right-4'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={panelVariants}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed ${positionClasses[position]} ${sizeClasses[size]} z-40`}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
          >
            {/* Panel Header */}
            <div 
              className="flex items-center justify-between px-4 py-2 border-b"
              style={{
                backgroundColor: 'var(--color-bg-muted)',
                borderColor: 'var(--color-border)',
              }}
            >
              <h3 className="font-semibold text-[var(--color-text)]">{title}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={onMaximize}
                  className="p-1 rounded transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                  title="Full View"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1 rounded transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                  title="Close Panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-auto h-[calc(100%-48px)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}