import React, { useEffect, useRef } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { useSearchStore } from '@/stores/useSearchStore'

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
  
  const [showFilters, setShowFilters] = React.useState(false)
  
  // Auto focus when requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])
  
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value)
  }
  
  const handleClear = () => {
    clearSearch()
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }
  
  const filterOptions = {
    filter: [
      { value: 'all', label: 'All Projects' },
      { value: 'recent', label: 'Recent' },
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
      { value: 'archived', label: 'Archived' }
    ],
    type: [
      { value: 'all', label: 'All Types' },
      { value: 'website', label: 'Website' },
      { value: 'landing_page', label: 'Landing Page' },
      { value: 'component_library', label: 'Component Library' },
      { value: 'prototype', label: 'Prototype' },
      { value: 'email_template', label: 'Email Template' },
      { value: 'dashboard', label: 'Dashboard' }
    ],
    sort: [
      { value: 'updated_at', label: 'Last Updated' },
      { value: 'created_at', label: 'Date Created' },
      { value: 'name', label: 'Name' }
    ]
  }
  
  return (
    <div className={`relative ${mobile ? 'w-full' : 'w-full max-w-xl mx-auto'}`}>
      {/* Main Search Input */}
      <div className="relative bg-[var(--color-bg-muted)] rounded-full shadow-sm border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          <Search className={`w-4 h-4 transition-colors ${
            isSearching 
              ? 'text-[var(--color-primary)] animate-pulse' 
              : 'text-[var(--color-text-muted)]'
          }`} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="bg-transparent focus:outline-none outline-none border-none text-sm text-[var(--color-text)] w-full pl-10 pr-20 py-2 rounded-full placeholder:text-[var(--color-text-muted)]"
          placeholder={placeholder}
        />
        
        {/* Right side controls */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {/* Clear button */}
          {searchQuery && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-[var(--color-bg)] rounded-full transition-colors"
              title="Clear search"
            >
              <X className="w-3 h-3 text-[var(--color-text-muted)]" />
            </button>
          )}
          
          {/* Filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1 rounded-full transition-colors ${
              showFilters || searchFilters.filter !== 'all' || searchFilters.type !== 'all'
                ? 'bg-[var(--color-primary)] text-white'
                : 'hover:bg-[var(--color-bg)] text-[var(--color-text-muted)]'
            }`}
            title="Search filters"
          >
            <Filter className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Advanced Filters Dropdown */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg p-3 z-50">
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
        </div>
      )}
      
      {/* Search loading indicator */}
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1">
          <div className="text-xs text-[var(--color-text-muted)] text-center py-1">
            Searching...
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar