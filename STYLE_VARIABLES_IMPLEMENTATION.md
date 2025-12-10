# Style Variables & CSS Variable Selector Implementation

## Overview
This implementation allows users to:
1. Define CSS variables in StyleModal for their exported projects
2. Use these variables directly in the Property Panel via a visual selector
3. Export projects with proper Tailwind configuration and CSS variables

## What Was Fixed & Implemented

### 1. ✅ StyleModal Fix
**Problem**: StyleModal was applying CSS variables to the DeCode system itself instead of only to exported projects.

**Solution**:
- Removed all `document.documentElement.style.setProperty()` calls
- Added informative blue banner explaining variables are for export only
- Variables are now saved to database and only applied to exported projects

**File**: `resources/js/Components/Header/Head/StyleModal.jsx`

### 2. ✅ Tailwind Directives in Exported CSS
**Problem**: Tailwind projects didn't have `@tailwind` directives in global.css

**Solution**:
- Updated `ExportController.php` `generateGlobalCSS()` method
- Now adds `@tailwind base`, `@tailwind components`, `@tailwind utilities` for Tailwind projects
- CSS variables are placed in `:root` block after Tailwind directives

**File**: `app/Http/Controllers/ExportController.php` (lines 623-685)

### 3. ✅ Tailwind Config Files for Templates
**Problem**: React and HTML templates didn't have Tailwind configuration files

**Solution**:
- Created `tailwind.config.js` for both React and HTML templates
- Created `postcss.config.js` for React template
- Config files map Tailwind color utilities to CSS variables (e.g., `primary: 'var(--color-primary)'`)

**Files**:
- `storage/app/templates/react/tailwind.config.js`
- `storage/app/templates/react/postcss.config.js`
- `storage/app/templates/html/tailwind.config.js`

### 4. ✅ React Package.json Dependencies
**Problem**: React template didn't include Tailwind CSS dependencies

**Solution**:
- Added `tailwindcss`, `autoprefixer`, and `postcss` to devDependencies
- Users can now run `npm install` and have all dependencies ready

**File**: `storage/app/templates/react/package.json`

### 5. ✅ CSS Variable Selector Component
**Problem**: No easy way to use defined CSS variables in Property Panel

**Solution**:
- Created reusable `CSSVariableSelector` component
- Shows dropdown with all available variables from StyleModal
- Filters variables by type (color, typography, spacing, etc.)
- Works with both CSS and Tailwind frameworks
- Visual indicator when a variable is being used

**File**: `resources/js/Components/Forge/CSSVariableSelector.jsx`

### 6. ✅ Property Panel Integration
**Problem**: No way to access CSS variables from property inputs

**Solution**:
- Updated `InputField` component in `PropertyUtils.jsx` to support CSS variable selector
- Added selector button next to color, text, and number inputs
- Passes `styleFramework` prop down from project settings
- Filters available variables based on property type

**Files**:
- `resources/js/Components/Forge/PropertyUtils.jsx`
- `resources/js/Components/Forge/PropertiesPanel.jsx`
- `resources/js/Components/Forge/PropertySections/StylingSection.jsx`
- `resources/js/Components/Forge/PropertySections/TypographySection.jsx`

## How It Works

### For Users

#### 1. Define Variables in StyleModal
1. Open any project in DeCode
2. Click "Style" button in header
3. See categories: Colors, Typography, Layout, Effects, Spacing, Advanced
4. Customize variables like `--color-primary`, `--font-size-base`, etc.
5. Click "Save Changes"

#### 2. Use Variables in Property Panel
1. Select a component on canvas
2. Open Properties Panel (right side)
3. Find property fields (colors, sizes, spacing, etc.)
4. Click the variable icon (𝑓) next to the input
5. Select a variable from the dropdown
6. The input will show `var(--variable-name)`

#### 3. Export Project
1. Click "Export" button
2. Choose framework: HTML or React
3. Choose style: CSS or Tailwind
4. Download ZIP

#### 4. Run Exported Project
**HTML + CSS**:
```bash
# Just open index.html in browser
open index.html
```

**HTML + Tailwind**:
```bash
# Uses CDN, just open in browser
open index.html
```

**React + CSS**:
```bash
npm install
npm run dev
```

**React + Tailwind**:
```bash
npm install  # Includes tailwindcss, autoprefixer, postcss
npm run dev
```

### For Generated Code

#### CSS Framework
When using CSS variables in properties:
```css
/* In exported global.css */
:root {
  --color-primary: #3b82f6;
  --font-size-base: 14px;
}

/* Component styles use the variables */
.component-button-abc123 {
  background-color: var(--color-primary);
  font-size: var(--font-size-base);
}
```

#### Tailwind Framework
When using CSS variables in properties:
```css
/* In exported global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #3b82f6;
  --font-size-base: 14px;
}

/* Tailwind config maps to variables */
/* Component uses: className="bg-primary text-[length:var(--font-size-base)]" */
```

## Available CSS Variables

### Colors
- `--color-primary` - Primary brand color
- `--color-surface` - Surface/card background
- `--color-text` - Main text color
- `--color-border` - Border color
- `--color-bg-muted` - Muted background
- `--color-text-muted` - Muted text

### Typography
- `--font-size-base` - Base font size
- `--font-weight-normal` - Normal font weight
- `--line-height-base` - Base line height
- `--letter-spacing` - Letter spacing

### Layout
- `--radius-md` - Medium border radius
- `--radius-lg` - Large border radius
- `--container-width` - Container max width

### Effects
- `--shadow-sm` - Small shadow
- `--shadow-md` - Medium shadow
- `--shadow-lg` - Large shadow

### Spacing
- `--spacing-xs` - Extra small spacing (4px)
- `--spacing-sm` - Small spacing (8px)
- `--spacing-md` - Medium spacing (16px)
- `--spacing-lg` - Large spacing (24px)

### Advanced
- `--transition-duration` - Animation duration
- `--transition-easing` - Animation easing
- `--z-modal` - Z-index for modals

## Technical Details

### CSS Variable Selector Props
```jsx
<CSSVariableSelector
  value={currentValue}              // Current input value
  onChange={handleChange}           // Callback when variable selected
  propertyType="color"              // Filter: 'color', 'size', 'spacing', 'typography', 'all'
  styleFramework="css"              // 'css' or 'tailwind'
/>
```

### InputField New Props
```jsx
<InputField
  // ... existing props
  enableVariableSelector={true}     // Show variable selector button
  variablePropertyType="color"      // Type for filtering variables
  styleFramework="css"              // Framework for code generation
/>
```

### Export Process Flow
1. User clicks Export → selects framework/style
2. `ExportController.php` reads project settings
3. Copies template (html or react)
4. Generates `global.css` with:
   - Tailwind directives (if Tailwind)
   - CSS variables in `:root`
   - Component styles (if CSS)
5. Generates frame files (HTML or JSX)
6. Updates main entry point
7. Creates ZIP

### Code Generation
When properties use CSS variables:
- **CSS**: Direct use → `color: var(--color-primary);`
- **Tailwind**: Bracket notation → `className="text-[color:var(--color-primary)]"`

## Testing Checklist

### StyleModal
- [ ] Open StyleModal
- [ ] Change `--color-primary` to red (#ff0000)
- [ ] Save changes
- [ ] Verify DeCode UI is NOT affected (still blue)

### Property Panel
- [ ] Select a component
- [ ] Click variable icon next to "Background Color"
- [ ] Select `--color-primary`
- [ ] Verify input shows `var(--color-primary)`
- [ ] Check component preview uses the variable

### Export - HTML + CSS
- [ ] Export project as HTML + CSS
- [ ] Extract ZIP
- [ ] Verify `styles/global.css` has variables in `:root`
- [ ] Open `index.html` in browser
- [ ] Verify colors match defined variables

### Export - HTML + Tailwind
- [ ] Export project as HTML + Tailwind
- [ ] Verify `styles/global.css` has `@tailwind` directives
- [ ] Verify variables in `:root` after directives
- [ ] Open in browser (uses CDN)
- [ ] Verify styles work correctly

### Export - React + CSS
- [ ] Export project as React + CSS
- [ ] Extract ZIP
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Verify app runs correctly
- [ ] Check `src/styles/global.css` has variables

### Export - React + Tailwind
- [ ] Export project as React + Tailwind
- [ ] Verify `package.json` has tailwindcss dependencies
- [ ] Run `npm install`
- [ ] Verify Tailwind installs correctly
- [ ] Run `npm run dev`
- [ ] Verify app runs with Tailwind classes
- [ ] Check `src/styles/global.css` has `@tailwind` directives

## Benefits

1. **Consistent Theming**: Define colors once, use everywhere
2. **Easy Customization**: Users can change theme in one place
3. **Professional Output**: Exported projects follow best practices
4. **Framework Agnostic**: Works with CSS and Tailwind
5. **Type-Safe**: Variables filtered by property type
6. **Visual Feedback**: Clear indication when using variables
7. **No System Pollution**: DeCode UI remains unaffected

## Future Enhancements

- [ ] Add more variable categories (animations, breakpoints)
- [ ] Export theme as separate file
- [ ] Import existing CSS variables
- [ ] Theme presets (light/dark, brand colors)
- [ ] Variable dependencies (calculated values)
- [ ] CSS custom properties autocomplete
