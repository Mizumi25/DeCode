import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const themeColors = [
  { name: 'Mint', color: '#7dd3fc', gradient: 'linear-gradient(135deg, #7dd3fc, #a7f3d0)' },
  { name: 'Sunset', color: '#fbbf24', gradient: 'linear-gradient(135deg, #fbbf24, #f97316)' },
  { name: 'Lavender', color: '#c084fc', gradient: 'linear-gradient(135deg, #c084fc, #a855f7)' },
  { name: 'Forest', color: '#34d399', gradient: 'linear-gradient(135deg, #34d399, #059669)' },
  { name: 'Rose', color: '#f472b6', gradient: 'linear-gradient(135deg, #f472b6, #ec4899)' },
  { name: 'Ocean', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #1e40af)' },
  { name: 'Amber', color: '#d97706', gradient: 'linear-gradient(135deg, #d97706, #92400e)' },
  { name: 'Sage', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #047857)' },
  { name: 'Purple', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  { name: 'Teal', color: '#14b8a6', gradient: 'linear-gradient(135deg, #14b8a6, #0f766e)' },
  { name: 'Crimson', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
  { name: 'Indigo', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
  { name: 'Emerald', color: '#22c55e', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
  { name: 'Pink', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
  { name: 'Cyan', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
  { name: 'Violet', color: '#7c3aed', gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)' },
  { name: 'Lime', color: '#65a30d', gradient: 'linear-gradient(135deg, #65a30d, #4d7c0f)' },
  { name: 'Fuchsia', color: '#d946ef', gradient: 'linear-gradient(135deg, #d946ef, #c026d3)' },
  { name: 'Sky', color: '#0ea5e9', gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)' },
  { name: 'Orange', color: '#f97316', gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
  { name: 'Slate', color: '#64748b', gradient: 'linear-gradient(135deg, #64748b, #475569)' },
  { name: 'Default', color: '#A052FF', gradient: 'linear-gradient(135deg, #A052FF, #944BEB)' }
]

// Helper function to apply theme color to DOM
const applyThemeColor = (theme) => {
  if (typeof window !== 'undefined') {
    const root = document.documentElement
    root.style.setProperty('--color-primary', theme.color)
    root.style.setProperty('--color-primary-hover', theme.color + 'dd')
  }
}

// Helper function to apply dark/light mode to DOM
const applyThemeMode = (isDark) => {
  if (typeof window !== 'undefined') {
    document.documentElement.classList.toggle('dark', isDark)
  }
}

const useThemeStore = create(
  persist(
    (set, get) => ({
      // Theme state
      isDark: false,
      currentTheme: themeColors[themeColors.length - 1], // Default to last theme (Default)
      isInitialized: false,
      
      // Actions
      toggleTheme: () => {
        const newTheme = !get().isDark
        set({ isDark: newTheme })
        applyThemeMode(newTheme)
      },
      
      setTheme: (isDark) => {
        set({ isDark })
        applyThemeMode(isDark)
      },
      
      setThemeColor: (theme) => {
        set({ currentTheme: theme })
        applyThemeColor(theme)
      },
      
      // Initialize theme from localStorage and system preference
      initializeTheme: () => {
        // Prevent multiple initializations
        if (get().isInitialized) return
        
        if (typeof window === 'undefined') return
        
        // Get the persisted state first (Zustand persist will handle this)
        const state = get()
        
        // Apply the persisted theme mode
        applyThemeMode(state.isDark)
        
        // Apply the persisted theme color
        applyThemeColor(state.currentTheme)
        
        // If no persisted theme mode, check system preference
        if (!localStorage.getItem('theme-storage')) {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          if (prefersDark !== state.isDark) {
            set({ isDark: prefersDark })
            applyThemeMode(prefersDark)
          }
        }
        
        set({ isInitialized: true })
      },
      
      // Force refresh theme (useful for page changes)
      refreshTheme: () => {
        const state = get()
        applyThemeMode(state.isDark)
        applyThemeColor(state.currentTheme)
      }
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        isDark: state.isDark,
        currentTheme: state.currentTheme,
      }),
      // Ensure theme is applied after rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme immediately after rehydration
          applyThemeMode(state.isDark)
          applyThemeColor(state.currentTheme)
        }
      }
    }
  )
)

export { useThemeStore, themeColors }