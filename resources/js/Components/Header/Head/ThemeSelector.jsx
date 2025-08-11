import React, { useState } from 'react'
import { Palette } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Theme colors matching Discord's style
const themeColors = [
  { name: 'Mint', color: '#7dd3fc', gradient: 'linear-gradient(135deg, #7dd3fc, #a7f3d0)' },
  { name: 'Sunset', color: '#fbbf24', gradient: 'linear-gradient(135deg, #fbbf24, #f97316)' },
  { name: 'Lavender', color: '#c084fc', gradient: 'linear-gradient(135deg, #c084fc, #a855f7)' },
  { name: 'Forest', color: '#34d399', gradient: 'linear-gradient(135deg, #34d399, #059669)' },
  { name: 'Rose', color: '#f472b6', gradient: 'linear-gradient(135deg, #f472b6, #ec4899)' },
  { name: 'Ocean', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #1e40af)' },
  { name: 'Amber', color: '#d97706', gradient: 'linear-gradient(135deg, #d97706, #92400e)' },
  { name: 'Sage', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #047857)' },
  { name: 'Purple', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  { name: 'Teal', color: '#14b8a6', gradient: 'linear-gradient(135deg, #14b8a6, #0f766e)' },
  { name: 'Crimson', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
  { name: 'Indigo', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
  { name: 'Emerald', color: '#22c55e', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
  { name: 'Pink', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
  { name: 'Cyan', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
  { name: 'Violet', color: '#7c3aed', gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)' },
  { name: 'Lime', color: '#65a30d', gradient: 'linear-gradient(135deg, #65a30d, #4d7c0f)' },
  { name: 'Fuchsia', color: '#d946ef', gradient: 'linear-gradient(135deg, #d946ef, #c026d3)' },
  { name: 'Sky', color: '#0ea5e9', gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)' },
  { name: 'Orange', color: '#f97316', gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
  { name: 'Slate', color: '#64748b', gradient: 'linear-gradient(135deg, #64748b, #475569)' },
  { name: 'Default', color: '#A052FF', gradient: 'linear-gradient(135deg, #A052FF, #944BEB)' }
]

const ThemeSelector = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleThemeSelect = (theme) => {
    onThemeChange(theme)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
        title="Choose Theme"
      >
        <Palette className="w-3 h-3 text-[var(--color-text)]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-full mt-2 left-0 w-80 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-[var(--color-border)]">
                <h3 className="text-sm font-semibold text-[var(--color-text)]">Choose Your Theme</h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Get creative and make DeCode yours with unique colours.
                </p>
              </div>

              {/* Color Grid */}
              <div className="p-4">
                <div className="grid grid-cols-6 gap-3">
                  {themeColors.map((theme, index) => (
                    <motion.button
                      key={theme.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02, duration: 0.2 }}
                      onClick={() => handleThemeSelect(theme)}
                      className={`relative w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 ${
                        currentTheme?.name === theme.name 
                          ? 'ring-2 ring-[var(--color-text)] ring-offset-2 ring-offset-[var(--color-surface)]' 
                          : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2 hover:ring-offset-[var(--color-surface)]'
                      }`}
                      style={{ 
                        background: theme.gradient,
                        boxShadow: currentTheme?.name === theme.name 
                          ? `0 0 0 2px var(--color-surface), 0 0 0 4px ${theme.color}` 
                          : 'none'
                      }}
                      title={theme.name}
                    >
                      {currentTheme?.name === theme.name && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-[var(--color-bg-muted)] border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-muted)] text-center">
                  All themes are completely free!
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export { themeColors }
export default ThemeSelector