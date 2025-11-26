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
          // Get current workspace from URL
          const urlParams = new URLSearchParams(window.location.search);
          const workspaceId = urlParams.get('workspace');
          
          // Make request to search API endpoint (faster, no page reload)
          const params = new URLSearchParams({
            q: query.trim(),
            filter: searchFilters.filter,
            type: searchFilters.type,
            sort: searchFilters.sort
          })
          
          if (workspaceId) {
            params.append('workspace', workspaceId);
          }
          
          const response = await fetch(`/api/projects/search?${params.toString()}`, {
            headers: {
              'Accept': 'application/json',
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            }
          });
          
          if (!response.ok) {
            throw new Error('Search request failed');
          }
          
          const result = await response.json();
          
          if (result.success) {
            set({ 
              searchResults: result.data || [],
              isSearching: false 
            });
            
            // Update URL without reloading page
            const newUrl = `/projects?${params.toString()}`;
            window.history.replaceState({}, '', newUrl);
            
            // Trigger a custom event that ProjectList can listen to
            window.dispatchEvent(new CustomEvent('search-results-updated', { 
              detail: { 
                results: result.data,
                query: query 
              } 
            }));
          } else {
            throw new Error('Search failed');
          }
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
        
        // Get current workspace from URL and preserve it
        const urlParams = new URLSearchParams(window.location.search);
        const workspaceId = urlParams.get('workspace');
        
        // Update URL without search params but keep workspace
        const newUrl = workspaceId ? `/projects?workspace=${workspaceId}` : '/projects';
        window.history.replaceState({}, '', newUrl);
        
        // Trigger custom event for ProjectList to reload
        window.dispatchEvent(new CustomEvent('search-cleared'));
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