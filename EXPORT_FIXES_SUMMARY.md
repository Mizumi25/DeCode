# Export System Fixes & Enhancements

## Summary
Fixed the HTML+CSS export functionality and connected StyleModal settings to the exported projects.

## Changes Made

### 1. Fixed ZIP Export Directory Issue
**File:** `app/Http/Controllers/ExportController.php`
- **Problem:** ZIP export was failing with "No such file or directory" error
- **Solution:** Added directory check and creation before ZIP file generation
- **Lines Modified:** 35-38

```php
$exportsDir = storage_path("app/exports");
if (!file_exists($exportsDir)) {
    mkdir($exportsDir, 0755, true);
}
```

### 2. Connected StyleModal to Project Settings
**Files:** 
- `app/Http/Controllers/ProjectController.php` (new method)
- `routes/api.php` (new route)
- `resources/js/Components/Header/Head/StyleModal.jsx` (complete rewrite)

**Features:**
- StyleModal now saves CSS variables to `project.settings.style_variables`
- Settings persist across sessions
- Real-time preview with save functionality
- "Save Changes" button with loading state
- "Reset" button to restore defaults

**New API Endpoint:**
```
PUT /api/projects/{uuid}/style-settings
```

### 3. Enhanced Global CSS Generation
**File:** `app/Http/Controllers/ExportController.php`

**Improvements:**
- Export now includes ALL CSS variables from StyleModal (not just 4 defaults)
- Added 20+ CSS variables for typography, spacing, shadows, etc.
- CSS variables in export match exactly with StyleModal settings

**CSS Variables Exported:**
- Colors: `--color-primary`, `--color-surface`, `--color-text`, `--color-border`, `--color-bg-muted`, `--color-text-muted`
- Typography: `--font-size-base`, `--font-weight-normal`, `--line-height-base`, `--letter-spacing`
- Layout: `--radius-md`, `--radius-lg`, `--container-width`
- Effects: `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- Spacing: `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`
- Animation: `--transition-duration`, `--transition-easing`
- Z-Index: `--z-modal`

### 4. Component Styles Export (HTML+CSS Framework)
**File:** `app/Http/Controllers/ExportController.php`

**New Functionality:**
- For HTML+CSS projects, component styles are extracted to `global.css`
- Each component gets a unique CSS class (e.g., `component-button-a1b2c3d4`)
- Inline styles converted to CSS classes automatically
- No duplicate class definitions

**Methods Added:**
- `generateFrameComponentStyles()` - Extracts component styles
- `generateComponentClassName()` - Creates unique class names
- `convertCamelToKebab()` - Converts camelCase CSS to kebab-case

### 5. Frame Navigation System
**File:** `app/Http/Controllers/ExportController.php`

**New Features:**
- `index.html` now includes navigation bar for all frames
- Frames displayed in iframe with smooth switching
- Active frame highlighting
- Responsive navigation using CSS variables

**Methods Added:**
- `generateIndexHTML()` - Creates navigation-enabled index.html
- `generateMainJS()` - Generates frame switching JavaScript

**Navigation Features:**
- Fixed navigation bar at top
- Buttons for each frame
- Active state styling
- Smooth frame transitions
- Uses CSS variables for theming

### 6. Updated HTML Component Generation
**File:** `app/Http/Controllers/ExportController.php`

**Changes:**
- HTML+CSS: Uses CSS classes instead of inline styles
- HTML+Tailwind: Keeps Tailwind classes inline
- Ensures consistency between editor and export

### 7. Created Export Directory Structure
**Files Created:**
- `storage/app/exports/.gitignore` - Prevents committing export files

## Export Structure (HTML+CSS)

```
project-name.zip
├── index.html              # Navigation-enabled landing page
├── frames/
│   ├── home.html          # Individual frame pages
│   ├── about.html
│   └── contact.html
├── styles/
│   └── global.css         # Complete CSS with variables + component styles
└── scripts/
    └── main.js            # Frame navigation logic
```

## How It Works

### Export Flow:
1. User clicks "Export as ZIP" in Forge page
2. System reads project settings (including `style_variables`)
3. Generates `global.css` with saved CSS variables
4. For HTML+CSS: Extracts all component styles to `global.css`
5. For HTML+Tailwind: Keeps Tailwind classes inline
6. Creates `index.html` with frame navigation
7. Generates `main.js` with frame switching logic
8. Packages everything into ZIP file
9. Downloads to user's machine

### StyleModal Flow:
1. User opens Settings modal in header
2. Adjusts CSS variables (colors, typography, etc.)
3. Changes apply in real-time to editor
4. User clicks "Save Changes"
5. Variables saved to `project.settings.style_variables`
6. On next export, these variables are included in `global.css`

## Testing Checklist

- [x] ZIP export creates file successfully
- [ ] StyleModal saves settings to database
- [ ] Exported `global.css` contains saved CSS variables
- [ ] HTML+CSS projects have component styles in `global.css`
- [ ] HTML+Tailwind projects keep inline Tailwind classes
- [ ] Frame navigation works in exported project
- [ ] Active frame highlighting works
- [ ] CSS variables from StyleModal appear in export
- [ ] Reset button in StyleModal works
- [ ] Export works for projects with no frames

## Future Enhancements

1. **Template System:** Allow users to save/load CSS variable presets
2. **Theme Export:** Export multiple themes as separate CSS files
3. **Component Library:** Extract reusable components to separate files
4. **Asset Optimization:** Minify CSS/JS in production exports
5. **Preview Mode:** Preview export before downloading
6. **React Export:** Implement similar navigation for React projects

## API Reference

### Update Style Settings
```http
PUT /api/projects/{uuid}/style-settings
Content-Type: application/json

{
  "style_variables": {
    "--color-primary": "#3b82f6",
    "--color-surface": "#ffffff",
    ...
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Style settings saved successfully",
  "data": {
    "style_variables": { ... }
  }
}
```

## Notes

- The `storage/app/exports/` directory is now auto-created if missing
- Template files in `storage/app/templates/html/` are used as boilerplate
- All CSS variables follow the pattern `--category-property` (e.g., `--color-primary`)
- Frame names are slugified for file names (e.g., "Home Page" → "home_page.html")
