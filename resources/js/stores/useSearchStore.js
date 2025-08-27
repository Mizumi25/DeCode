import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { router } from '@inertiajs/react'

const useSearchStore = create(
  devtools(
    (set, get) => ({
      // Search state
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      searchFilters: {
        filter: 'all', // all, recent, draft, published, archived
        type: 'all', // all, website, landing_page, component_library, etc.
        sort: 'updated_at' // updated_at, created_at, name
      },
      
      // Debounce timer
      searchTimer: null,
      
      // Actions
      setSearchQuery: (query) => {
        const state = get()
        
        // Clear previous timer
        if (state.searchTimer) {
          clearTimeout(state.searchTimer)
        }
        
        set({ 
          searchQuery: query,
          isSearching: query.length > 0 
        })
        
        // Debounce search - wait 300ms after user stops typing
        const timer = setTimeout(() => {
          get().performSearch(query)
        }, 300)
        
        set({ searchTimer: timer })
      },
      
      setSearchFilter: (filterKey, value) => {
        set(state => ({
          searchFilters: {
            ...state.searchFilters,
            [filterKey]: value
          }
        }))
        
        // Trigger search with current query and new filters
        const { searchQuery } = get()
        if (searchQuery.length > 0) {
          get().performSearch(searchQuery)
        }
      },
      
      performSearch: async (query) => {
        const { searchFilters } = get()
        
        if (!query || query.trim().length === 0) {
          set({ 
            searchResults: [],
            isSearching: false 
          })
          return
        }
        
        set({ isSearching: true })
        
        try {
          // Make request to your Laravel backend
          const params = new URLSearchParams({
            search: query.trim(),
            filter: searchFilters.filter,
            type: searchFilters.type,
            sort: searchFilters.sort
          })
          
          // Using Inertia's visit method to update the page with search results
          router.visit(`/projects?${params.toString()}`, {
            method: 'get',
            preserveState: true,
            preserveScroll: true,
            only: ['projects', 'filters', 'stats'], // Only reload these props
            onSuccess: (page) => {
              set({ 
                searchResults: page.props.projects || [],
                isSearching: false 
              })
            },
            onError: (errors) => {
              console.error('Search failed:', errors)
              set({ isSearching: false })
            }
          })
        } catch (error) {
          console.error('Search error:', error)
          set({ isSearching: false })
        }
      },
      
      clearSearch: () => {
        const state = get()
        
        // Clear timer
        if (state.searchTimer) {
          clearTimeout(state.searchTimer)
        }
        
        set({ 
          searchQuery: '',
          searchResults: [],
          isSearching: false,
          searchTimer: null
        })
        
        // Reload page without search params
        router.visit('/projects', {
          method: 'get',
          preserveState: true,
          preserveScroll: true,
          only: ['projects', 'filters', 'stats']
        })
      },
      
      // Quick actions
      searchProjects: (query) => {
        get().setSearchQuery(query)
      },
      
      searchByType: (type) => {
        get().setSearchFilter('type', type)
        if (get().searchQuery.length > 0) {
          get().performSearch(get().searchQuery)
        }
      },
      
      searchByStatus: (status) => {
        get().setSearchFilter('filter', status)
        if (get().searchQuery.length > 0) {
          get().performSearch(get().searchQuery)
        }
      },
      
      // Initialize search from URL params (for page refreshes)
      initializeFromUrl: (urlParams) => {
        const search = urlParams.get('search') || ''
        const filter = urlParams.get('filter') || 'all'
        const type = urlParams.get('type') || 'all'
        const sort = urlParams.get('sort') || 'updated_at'
        
        set({
          searchQuery: search,
          searchFilters: { filter, type, sort },
          isSearching: false
        })
      },
      
      // Cleanup function
      cleanup: () => {
        const state = get()
        if (state.searchTimer) {
          clearTimeout(state.searchTimer)
        }
        set({
          searchQuery: '',
          searchResults: [],
          isSearching: false,
          searchTimer: null,
          searchFilters: {
            filter: 'all',
            type: 'all', 
            sort: 'updated_at'
          }
        })
      }
    }),
    {
      name: 'search-store',
      // Only persist filters, not search state
      partialize: (state) => ({ 
        searchFilters: state.searchFilters 
      })
    }
  )
)

export { useSearchStore }