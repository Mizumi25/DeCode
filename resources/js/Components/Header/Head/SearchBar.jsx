import React, { useEffect, useRef, useState } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { useSearchStore } from '@/stores/useSearchStore'
import { motion, AnimatePresence } from 'framer-motion'

const SearchBar = ({ placeholder = "Search projects...", mobile = false, autoFocus = false }) => {

  const inputRef = useRef(null)

  const {
    searchQuery,
    isSearching,
    searchFilters,
    setSearchQuery,
    clearSearch,
    setSearchFilter
  } = useSearchStore()

  const [showFilters, setShowFilters] = useState(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
      setFocused(true)
    }
  }, [autoFocus])

  const handleInputChange = (e) => setSearchQuery(e.target.value)

  const handleClear = () => {
    clearSearch()
    if (inputRef.current) inputRef.current.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') handleClear()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`relative ${mobile ? 'w-full' : 'w-full'}`}
    >
      {/* SEARCH INPUT WRAPPER */}
      <motion.div
        initial={{ borderColor: "var(--color-border)" }}
        animate={{
          borderColor: focused ? "var(--color-primary)" : "var(--color-border)"
        }}
        transition={{ duration: 0.3 }}
        className="relative rounded-full border bg-[var(--color-bg)] shadow-sm"
      >
        {/* ICON LEFT */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          <Search
            className={`w-4 h-4 transition-colors ${
              isSearching
                ? "text-[var(--color-primary)] animate-pulse"
                : "text-[var(--color-text-muted)]"
            }`}
          />
        </div>

        {/* INPUT FIELD */}
        <motion.input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => !searchQuery && setFocused(false)}
          placeholder={placeholder}
          className={`search-placeholder bg-transparent w-full py-1.5 pl-10 pr-16 text-sm text-[var(--color-text)] rounded-full placeholder:text-[var(--color-text-muted)] outline-none
            ${focused || searchQuery ? 'search-active' : ''}
          `}
          animate={{
            paddingLeft: focused || searchQuery ? "2.5rem" : "2.5rem",
            textAlign: "left"
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />

        {/* RIGHT CONTROLS */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-[var(--color-bg-muted)] rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-[var(--color-text-muted)]" />
            </button>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1 rounded-full transition-colors ${
              showFilters ||
              searchFilters.filter !== "all" ||
              searchFilters.type !== "all"
                ? "bg-[var(--color-primary)] text-white"
                : "hover:bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]"
            }`}
          >
            <Filter className="w-3 h-3" />
          </button>
        </div>
      </motion.div>

      {/* FILTER DROPDOWN */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 p-3 rounded-lg shadow-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                Status
              </label>
              <select
                value={searchFilters.filter}
                onChange={(e) => setSearchFilter('filter', e.target.value)}
                className="w-full text-xs bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded px-2 py-1 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                {filterOptions.filter.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Type Filter */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                Type
              </label>
              <select
                value={searchFilters.type}
                onChange={(e) => setSearchFilter('type', e.target.value)}
                className="w-full text-xs bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded px-2 py-1 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                {filterOptions.type.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sort Filter */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                Sort by
              </label>
              <select
                value={searchFilters.sort}
                onChange={(e) => setSearchFilter('sort', e.target.value)}
                className="w-full text-xs bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded px-2 py-1 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                {filterOptions.sort.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Quick clear filters */}
          {(searchFilters.filter !== 'all' || searchFilters.type !== 'all') && (
            <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
              <button
                onClick={() => {
                  setSearchFilter('filter', 'all')
                  setSearchFilter('type', 'all')
                  setSearchFilter('sort', 'updated_at')
                }}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCHING INDICATOR */}
      {isSearching && (
        <div className="text-xs text-[var(--color-text-muted)] text-center py-1">
          Searching...
        </div>
      )}
    </motion.div>
  )
}

export default SearchBar
