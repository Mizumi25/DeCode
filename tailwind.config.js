import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            // CSS Color Level 4 & 5 Support - OKLCH & OKLAB
            colors: {
                // OKLCH Colors (Perceptually uniform)
                'oklch-primary': 'oklch(65% 0.25 250)',
                'oklch-secondary': 'oklch(70% 0.20 320)',
                'oklch-accent': 'oklch(75% 0.22 150)',
                
                // OKLCH Vibrant Palette
                'oklch-vibrant-blue': 'oklch(60% 0.28 250)',
                'oklch-vibrant-purple': 'oklch(65% 0.25 300)',
                'oklch-vibrant-pink': 'oklch(70% 0.24 340)',
                'oklch-vibrant-red': 'oklch(65% 0.26 20)',
                'oklch-vibrant-orange': 'oklch(70% 0.22 60)',
                'oklch-vibrant-yellow': 'oklch(85% 0.18 100)',
                'oklch-vibrant-green': 'oklch(70% 0.20 150)',
                'oklch-vibrant-cyan': 'oklch(75% 0.18 200)',
                
                // OKLCH Pastel Palette
                'oklch-pastel-blue': 'oklch(85% 0.10 250)',
                'oklch-pastel-purple': 'oklch(85% 0.10 300)',
                'oklch-pastel-pink': 'oklch(85% 0.10 340)',
                'oklch-pastel-green': 'oklch(85% 0.10 150)',
                
                // OKLAB Colors
                'oklab-primary': 'oklab(65% 0.15 -0.10)',
                'oklab-secondary': 'oklab(70% 0.12 0.08)',
                'oklab-accent': 'oklab(75% -0.10 0.15)',
            },
            // You can now use color-mix() in arbitrary values
            // Example: bg-[color-mix(in_oklch,_theme(colors.blue.500),_white_30%)]
        },
    },

    plugins: [forms],
};
