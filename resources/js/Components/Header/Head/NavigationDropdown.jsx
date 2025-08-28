import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { router, usePage } from '@inertiajs/react'

const NavigationDropdown = ({ activeNav, setActiveNav, onModeSwitch }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navOptions = ['Forge', 'Source']
  
  // Get project and frame data directly from Inertia props
  const { props, url } = usePage()
  const project = props.project
  const frame = props.frame

  // Sync activeNav with URL on component mount and URL changes
  useEffect(() => {
    if (url.includes('/modeForge') && activeNav !== 'Forge') {
      setActiveNav('Forge')
    } else if (url.includes('/modeSource') && activeNav !== 'Source') {
      setActiveNav('Source')
    }
  }, [url, activeNav, setActiveNav])

  const handleNavChange = (option) => {
    // Don't do anything if clicking the already active option
    if (option === activeNav) {
      setDropdownOpen(false)
      return
    }

    setActiveNav(option)
    setDropdownOpen(false)
    
    // Navigate to the correct URL if we have project and frame
    if (project && frame) {
      const newUrl = `/void/${project.uuid}/frame=${frame.uuid}/mode${option}`
      
      // Use router.visit with proper options
      router.visit(newUrl, {
        method: 'get',
        preserveScroll: true,
        preserveState: true,
      })
    } else {
      console.error('Project or frame data not available for navigation')
    }
    
    // Call the mode switch function for any additional logic
    if (onModeSwitch) {
      onModeSwitch(option.toLowerCase())
    }
  }

  return (
    <div className="relative">
      <div
        className="flex items-center gap-0.5 cursor-pointer px-2 py-1 rounded hover:bg-[var(--color-bg-muted)] transition-colors"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span className="text-[var(--color-text)] font-medium text-sm">{activeNav}</span>
        <ChevronDown className={`w-3 h-3 text-[var(--color-text-muted)] transition-transform duration-200 ${
          dropdownOpen ? 'rotate-180' : ''
        }`} />
      </div>
      
      <AnimatePresence>
        {dropdownOpen && (
          <>
            {/* Backdrop to close dropdown */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setDropdownOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="absolute top-full mt-2 left-0 w-32 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-lg z-50"
            >
              <ul className="text-sm text-[var(--color-text)]">
                {navOptions.map((option) => (
                  <li
                    key={option}
                    className={`px-4 py-2 hover:bg-[var(--color-bg-muted)] cursor-pointer transition-colors first:rounded-t-md last:rounded-b-md ${
                      activeNav === option 
                        ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]' 
                        : ''
                    }`}
                    onClick={() => handleNavChange(option)}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NavigationDropdown