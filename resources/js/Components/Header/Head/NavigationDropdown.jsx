import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const NavigationDropdown = ({ activeNav, setActiveNav, onModeSwitch }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navOptions = ['Forge', 'Source']

  const handleNavChange = (option) => {
    setActiveNav(option)
    setDropdownOpen(false)
    
    // Call the mode switch function
    if (onModeSwitch) {
      onModeSwitch(option.toLowerCase())
    }
  }

  return (
    <div className="relative">
      <div
        className="flex items-center gap-0.5 cursor-pointer"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span className="text-[var(--color-text)] font-medium text-sm">{activeNav}</span>
        <ChevronDown className="w-3 h-3 text-[var(--color-text-muted)]" />
      </div>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="absolute top-full mt-2 left-0 w-32 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-lg z-50"
          >
            <ul className="text-sm text-[var(--color-text)]">
              {navOptions.map((option) => (
                <li
                  key={option}
                  className="px-4 py-2 hover:bg-[var(--color-bg-muted)] cursor-pointer"
                  onClick={() => handleNavChange(option)}
                >
                  {option}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NavigationDropdown