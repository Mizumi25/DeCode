import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useHeaderStore } from '@/stores/useHeaderStore'

const HeaderToggleButton = () => {
  const { isHeaderVisible, toggleHeaderVisibility } = useHeaderStore()
  
  return (
    <AnimatePresence>
      <motion.button
        onClick={toggleHeaderVisibility}
        className={`fixed top-8 right-2 z-[60] p-2 rounded-full transition-all duration-300 ${
          isHeaderVisible 
            ? 'bg-[var(--color-bg-muted)] text-[var(--color-text)] shadow-md hover:bg-[var(--color-border)]' 
            : 'bg-black/20 text-white/60 backdrop-blur-sm hover:bg-black/30 hover:text-white/80'
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: isHeaderVisible ? 1 : 0.6, 
          y: 0,
          scale: isHeaderVisible ? 1 : 0.9
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        title={isHeaderVisible ? "Hide Header" : "Show Header"}
      >
        {isHeaderVisible ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </motion.button>
    </AnimatePresence>
  )
}

export default HeaderToggleButton