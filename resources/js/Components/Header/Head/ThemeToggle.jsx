import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

const ThemeToggle = ({ isDark, onToggle }) => {
  return (
    <div onClick={onToggle} className="ml-1 cursor-pointer group">
      <div 
        className="w-8 h-4 rounded-full flex items-center px-0.5 relative shadow-sm transition-all duration-200"
        style={{
          backgroundColor: 'var(--color-border)',
        }}
      >
        {/* Inactive Icon (left side when dark, right side when light) */}
        <div 
          className="absolute transition-opacity duration-200"
          style={{
            left: isDark ? '0.25rem' : 'auto',
            right: isDark ? 'auto' : '0.25rem',
            opacity: 0.5,
          }}
        >
          {isDark ? (
            <Sun 
              className="w-2 h-2 transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            />
          ) : (
            <Moon 
              className="w-2 h-2 transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            />
          )}
        </div>
        
        {/* Active Circle with Icon */}
        <motion.div
          className="absolute w-3 h-3 rounded-full flex items-center justify-center shadow"
          style={{ backgroundColor: 'var(--color-primary)' }}
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          animate={{ left: isDark ? 'calc(100% - 0.75rem)' : '0.125rem' }}
        >
          {isDark ? (
            <Moon className="w-2 h-2 text-white" />
          ) : (
            <Sun className="w-2 h-2 text-white" />
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ThemeToggle