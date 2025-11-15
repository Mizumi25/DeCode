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
        className={`fixed right-20 z-[60] p-2 rounded-full transition-all duration-300 ${
          isHeaderVisible 
            ? 'bg-[var(--color-bg)] text-[var(--color-primary)] shadow-md hover:bg-[var(--color-border)] top-12' 
            : 'bg-black/40 text-[var(--color-primary)] backdrop-blur-sm hover:bg-black/30 hover:text-white/80 top-2'
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