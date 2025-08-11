import React from 'react'
import { Search } from 'lucide-react'

const SearchBar = ({ placeholder = "Search Project", mobile = false, autoFocus = false }) => {
  return (
    <div className={`relative ${mobile ? 'w-full' : 'w-full max-w-xl mx-auto'}`}>
      <div className="relative bg-[var(--color-bg-muted)] rounded-full shadow-sm">
        <input
          type="text"
          className="bg-transparent focus:outline-none outline-none border-none text-sm text-[var(--color-text)] text-center w-full px-4 py-2 rounded-full"
          autoFocus={autoFocus}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-1">
            <Search className="text-[var(--color-text-muted)] w-4 h-4" />
            <span className="text-sm text-[var(--color-text-muted)]">{placeholder}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchBar