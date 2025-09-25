import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const themeColors = [
  // Framer default - modern and sleek
  { name: 'Framer', color: '#0055FF', gradient: 'linear-gradient(135deg, #0055FF, #0099FF)', isDefault: true },
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
  { name: 'DeCode', color: '#A052FF', gradient: 'linear-gradient(135deg, #A052FF, #944BEB)' }
]

// Color utility functions
const hexToHsl = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
};

const hslToHex = (h, s, l) => {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (c) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Generate dynamic theme colors based on primary color
const generateDynamicTheme = (primaryColor, isDark = false) => {
  const [h, s, l] = hexToHsl(primaryColor);
  
  if (isDark) {
    // Dark mode theme generation - Framer-inspired
    return {
      '--color-primary': primaryColor,
      '--color-primary-hover': hslToHex(h, s, Math.min(l + 8, 85)),
      '--color-primary-soft': hslToHex(h, Math.max(s - 30, 15), Math.max(l - 35, 8)),
      '--color-bg': hslToHex(h, Math.min(s * 0.15, 8), 4), // Very dark with primary hue
      '--color-bg-muted': hslToHex(h, Math.min(s * 0.2, 12), 7), // Slightly lighter
      '--color-surface': hslToHex(h, Math.min(s * 0.18, 10), 5.5), // Between bg and bg-muted
      '--color-border': hslToHex(h, Math.min(s * 0.2, 10), 12), // Subtle border with primary hue
      '--color-text': hslToHex(h, Math.min(s * 0.05, 3), 97), // Very light with subtle primary tint
      '--color-text-muted': hslToHex(h, Math.min(s * 0.15, 8), 65), // Muted with primary tint
      '--color-accent': '#facc15' // Keep accent independent
    };
  } else {
    // Light mode theme generation - MORE NOTICEABLE tinting
    return {
      '--color-primary': primaryColor,
      '--color-primary-hover': hslToHex(h, s, Math.max(l - 8, 15)),
      '--color-primary-soft': hslToHex(h, Math.max(s - 20, 30), Math.min(l + 30, 85)),
      '--color-bg': hslToHex(h, Math.min(s * 0.25, 12), 98), // More noticeable primary tint
      '--color-bg-muted': hslToHex(h, Math.min(s * 0.35, 18), 94), // Much more noticeable tint
      '--color-surface': hslToHex(h, Math.min(s * 0.15, 8), 99), // Subtle but visible primary hint
      '--color-border': hslToHex(h, Math.min(s * 0.4, 20), 85), // More noticeable border tint
      '--color-text': hslToHex(h, Math.min(s * 0.3, 15), 12), // Dark text with primary tint
      '--color-text-muted': hslToHex(h, Math.min(s * 0.25, 12), 50), // More noticeable muted tint
      '--color-accent': '#facc15' // Keep accent independent
    };
  }
};

// Helper function to apply dynamic theme to DOM
const applyDynamicTheme = (theme, dynamicColors) => {
  if (typeof window !== 'undefined') {
    const root = document.documentElement;
    
    // Apply all dynamic colors
    Object.entries(dynamicColors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }
};

// Helper function to apply dark/light mode to DOM
const applyThemeMode = (isDark) => {
  if (typeof window !== 'undefined') {
    document.documentElement.classList.toggle('dark', isDark);
  }
};

const useThemeStore = create(
  persist(
    (set, get) => ({
      // Theme state
      isDark: false,
      currentTheme: themeColors[0], // Framer is now first in array, so this is the default
      isInitialized: false,
      
      // Actions
      toggleTheme: () => {
        const state = get();
        const newTheme = !state.isDark;
        set({ isDark: newTheme });
        
        // Apply both theme mode and dynamic colors
        applyThemeMode(newTheme);
        const dynamicColors = generateDynamicTheme(state.currentTheme.color, newTheme);
        applyDynamicTheme(state.currentTheme, dynamicColors);
      },
      
      setTheme: (isDark) => {
        const state = get();
        set({ isDark });
        
        // Apply both theme mode and dynamic colors
        applyThemeMode(isDark);
        const dynamicColors = generateDynamicTheme(state.currentTheme.color, isDark);
        applyDynamicTheme(state.currentTheme, dynamicColors);
      },
      
      setThemeColor: (theme) => {
        const state = get();
        set({ currentTheme: theme });
        
        // Apply dynamic theme colors
        const dynamicColors = generateDynamicTheme(theme.color, state.isDark);
        applyDynamicTheme(theme, dynamicColors);
      },
      
      // Initialize theme from localStorage and system preference
      initializeTheme: () => {
        // Prevent multiple initializations
        if (get().isInitialized) return;
        
        if (typeof window === 'undefined') return;
        
        // Get the persisted state first (Zustand persist will handle this)
        const state = get();
        
        // Apply the persisted theme mode
        applyThemeMode(state.isDark);
        
        // Apply the persisted dynamic theme colors
        const dynamicColors = generateDynamicTheme(state.currentTheme.color, state.isDark);
        applyDynamicTheme(state.currentTheme, dynamicColors);
        
        // If no persisted theme mode, check system preference
        if (!localStorage.getItem('theme-storage')) {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark !== state.isDark) {
            set({ isDark: prefersDark });
            applyThemeMode(prefersDark);
            const newDynamicColors = generateDynamicTheme(state.currentTheme.color, prefersDark);
            applyDynamicTheme(state.currentTheme, newDynamicColors);
          }
        }
        
        set({ isInitialized: true });
      },
      
      // Force refresh theme (useful for page changes)
      refreshTheme: () => {
        const state = get();
        applyThemeMode(state.isDark);
        const dynamicColors = generateDynamicTheme(state.currentTheme.color, state.isDark);
        applyDynamicTheme(state.currentTheme, dynamicColors);
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
          applyThemeMode(state.isDark);
          const dynamicColors = generateDynamicTheme(state.currentTheme.color, state.isDark);
          applyDynamicTheme(state.currentTheme, dynamicColors);
        }
      }
    }
  )
)

export { useThemeStore, themeColors }