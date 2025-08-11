import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SearchBar from './SearchBar'

const MobileSearch = ({ isOpen, onProjectsPage }) => {
  return (
    <AnimatePresence>
      {isOpen && onProjectsPage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-full left-0 w-full z-40 bg-[var(--color-surface)] border-t border-[var(--color-border)] px-4 py-3"
        >
          <SearchBar mobile autoFocus />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MobileSearch