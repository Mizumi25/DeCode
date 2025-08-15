// stores/useThemeStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const themeColors = [
  { name: 'Purple', color: '#a052ff' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Green', color: '#10b981' },
  { name: 'Pink', color: '#ec4899' },
  { name: 'Orange', color: '#f97316' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Indigo', color: '#6366f1' },
  { name: 'Teal', color: '#14b8a6' },
]

const useThemeStore = create(
  persist(
    (set, get) => ({
      // Theme state
      isDark: false,
      currentTheme: themeColors[themeColors.length - 1], // Default to last theme
      
      // Actions
      toggleTheme: () => {
        const newTheme = !get().isDark
        set({ isDark: newTheme })
        
        // Apply to DOM
        document.documentElement.classList.toggle('dark', newTheme)
        localStorage.setItem('theme', newTheme ? 'dark' : 'light')
      },
      
      setTheme: (isDark) => {
        set({ isDark })
        document.documentElement.classList.toggle('dark', isDark)
        localStorage.setItem('theme', isDark ? 'dark' : 'light')
      },
      
      setThemeColor: (theme) => {
        set({ currentTheme: theme })
        
        // Apply CSS variables
        const root = document.documentElement
        root.style.setProperty('--color-primary', theme.color)
        root.style.setProperty('--color-primary-hover', theme.color + 'dd')
      },
      
      // Initialize theme from localStorage and system preference
      initializeTheme: () => {
        const savedTheme = localStorage.getItem('theme')
        const savedThemeColor = localStorage.getItem('themeColor')
        
        let isDark = false
        if (savedTheme === 'dark') {
          isDark = true
        } else if (savedTheme === 'light') {
          isDark = false
        } else {
          isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        
        // Set theme
        document.documentElement.classList.toggle('dark', isDark)
        set({ isDark })
        
        // Set theme color
        if (savedThemeColor) {
          const savedThemeObj = JSON.parse(savedThemeColor)
          get().setThemeColor(savedThemeObj)
        } else {
          // Apply default theme color
          get().setThemeColor(get().currentTheme)
        }
      }
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        isDark: state.isDark,
        currentTheme: state.currentTheme,
      }),
    }
  )
)

export { useThemeStore, themeColors }