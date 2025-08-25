import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

const ThemeToggle = ({ isDark, onToggle }) => {
  return (
    <div onClick={onToggle} className="ml-1 cursor-pointer">
      <div className="w-8 h-4 bg-[var(--color-bg-muted)] rounded-full flex items-center px-0.5 relative shadow-sm">
        <motion.div
          className="absolute w-3 h-3 rounded-full flex items-center justify-center shadow bg-white"
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{ left: isDark ? 'calc(100% - 0.75rem)' : '0.125rem' }}
        >
          {isDark ? (
            <Moon className="text-[var(--color-primary)] w-2 h-2" />
          ) : (
            <Sun className="text-[var(--color-primary)] w-2 h-2" />
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ThemeToggle