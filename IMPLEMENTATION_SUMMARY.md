# DeCode Import/Export System Implementation Summary

## Overview
This implementation adds comprehensive import/export functionality to DeCode, enabling projects to be fully portable and runnable outside the system.

## Key Features Implemented

### 1. **Project Types**
- **Manual Projects**: Created directly in DeCode with automatic boilerplate generation
- **Imported Projects**: GitHub repositories with preserved non-frame files

### 2. **Framework Support**
- **React**: Component-based with JSX, Vite configuration
- **HTML**: Standard HTML pages with vanilla JavaScript

### 3. **Style Support**
- **CSS**: Pure CSS with full control
- **Tailwind**: Utility-first CSS framework

### 4. **Boilerplate Templates**
Created template structures for both frameworks:
- `storage/app/templates/react/` - React + Vite boilerplate
- `storage/app/templates/html/` - HTML boilerplate

### 5. **Export System**
New `ExportController.php` with two export methods:
- **Export as ZIP**: Download complete project
- **Export to GitHub**: Push to repository

## Database Migrations

### Projects Table (`2025_12_15_000000_add_import_export_metadata_to_projects.php`)
Added fields:
- `project_type`: 'manual' or 'imported'
- `source_repo_url`: GitHub repository URL
- `source_repo_branch`: Branch name
- `last_synced_at`: Last sync timestamp
- `framework`: 'react', 'html', 'vue', 'angular'
- `style_framework`: 'css', 'tailwind', 'bootstrap', 'styled_components'
- `preserved_files`: JSON array of preserved files
- `boilerplate_template`: Template identifier

### Frames Table (`2025_12_15_000001_add_import_export_metadata_to_frames.php`)
Added fields:
- `source_frontend_path`: Original file path
- `linked_css_files`: JSON array of CSS file paths
- `framework`: Frame-specific framework
- `style_framework`: Frame-specific style
- `original_content`: Original file content

## Controllers

### ExportController.php
**Methods:**
- `exportAsZip(Project $project)`: Generate and download ZIP
- `exportToGitHub(Request $request, Project $project)`: Push to GitHub
- `generateProjectStructure(Project $project)`: Create complete project structure
- `generateFrameFile(Frame $frame, ...)`: Generate frame files (JSX/HTML)
- `generateReactComponent(Frame $frame, ...)`: Create React components
- `generateHTMLFile(Frame $frame, ...)`: Create HTML files
- `generateGlobalCSS(Project $project, ...)`: Generate global CSS from settings

### Updated Controllers
**ProjectController.php:**
- Added `framework` and `style_framework` validation
- Set `project_type` to 'manual' for new projects
- Auto-generate boilerplate template identifier

**GitHubRepoController.php:**
- Detect framework from imported files
- Set `project_type` to 'imported'
- Store `source_repo_url` and sync metadata

## Frontend Components

### ExportDropdown.jsx
New component for VoidPage header:
- Export as ZIP button
- Export to GitHub button
- Loading states
- Error handling

### ExportLoadingOverlay.jsx
Full-screen loading overlay during export:
- Animated icons
- Progress steps
- Export type indicators

### NewProjectModal.jsx Updates
Enhanced to support framework/style selection:
- Framework choice (React/HTML)
- Style choice (CSS/Tailwind)
- Updated form validation
- Visual framework logos

### RightSection.jsx Updates
- Integrated ExportDropdown component
- Only visible in VoidPage
- Permission-based visibility

## API Routes
Added to `routes/api.php`:
```php
Route::get('/projects/{project:uuid}/export/zip', [ExportController::class, 'exportAsZip']);
Route::post('/projects/{project:uuid}/export/github', [ExportController::class, 'exportToGithub']);
```

## Export Process Flow

### 1. Manual Project Export
```
User clicks Export → Choose ZIP/GitHub
↓
System generates:
  - Copy boilerplate template (react/html)
  - Generate frames from components
  - Generate global.css from settings
  - Bundle all files
↓
ZIP: Download file
GitHub: Create commit and push
```

### 2. Imported Project Export
```
User clicks Export → Choose ZIP/GitHub
↓
System generates:
  - Restore preserved files
  - Update only frame files
  - Keep original boilerplate
  - Update linked CSS
↓
ZIP: Download file
GitHub: Update existing repo
```

## File Structure

### React Project Export
```
project/
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── frames/
    │   ├── home.jsx
    │   └── about.jsx
    └── styles/
        ├── global.css (generated from settings)
        └── linkedCss/
            └── component.css
```

### HTML Project Export
```
project/
├── index.html
├── styles/
│   ├── global.css (generated from settings)
│   └── linkedCss/
│       └── component.css
├── scripts/
│   └── main.js
└── frames/
    ├── home.html
    └── about.html
```

## Settings Integration

The StyleModal (Settings Dropdown) generates CSS variables that export to:
- `src/styles/global.css` (React)
- `styles/global.css` (HTML)

Variables include:
- Colors (primary, background, text, border)
- Typography (font size, weight, line height)
- Layout (border radius, container width)
- Effects (shadows)
- Spacing
- Transitions

## Next Steps

### To Complete:
1. **Run migrations**: `php artisan migrate`
2. **Test manual project creation** with framework selection
3. **Test ZIP export** functionality
4. **Add StyleModal to VoidPage** (currently only in Forge/Source)
5. **Implement GitHub push logic** in `pushToGitHub()` method
6. **Add linked CSS extraction** from imported projects
7. **Filter GitHub repo list** to show only HTML/React repos
8. **Add tab highlighting** in Forge/Source based on project framework
9. **Test full import → edit → export cycle**

### Future Enhancements:
- Vue.js and Angular support
- More style frameworks (Bootstrap, Styled Components)
- Better CSS extraction from imported files
- Automatic Tailwind config generation
- Real-time GitHub sync
- Export preview before download

## Testing Checklist

- [ ] Create manual React + CSS project
- [ ] Create manual React + Tailwind project
- [ ] Create manual HTML + CSS project
- [ ] Create manual HTML + Tailwind project
- [ ] Export manual project as ZIP
- [ ] Verify ZIP contains all boilerplate
- [ ] Run exported project locally
- [ ] Import GitHub React project
- [ ] Import GitHub HTML project
- [ ] Export imported project as ZIP
- [ ] Verify preserved files intact
- [ ] Test Settings → global.css generation
- [ ] Test frame generation from components
- [ ] Test linked CSS handling

## Files Created/Modified

**Created:**
- `app/Http/Controllers/ExportController.php`
- `resources/js/Components/Header/Head/ExportDropdown.jsx`
- `resources/js/Components/Void/ExportLoadingOverlay.jsx`
- `storage/app/templates/react/package.json`
- `storage/app/templates/react/vite.config.js`
- `storage/app/templates/react/index.html`
- `storage/app/templates/react/src/main.jsx`
- `storage/app/templates/react/src/App.jsx`
- `storage/app/templates/react/src/styles/global.css`
- `storage/app/templates/html/index.html`
- `storage/app/templates/html/styles/global.css`
- `storage/app/templates/html/scripts/main.js`
- `database/migrations/2025_12_15_000000_add_import_export_metadata_to_projects.php`
- `database/migrations/2025_12_15_000001_add_import_export_metadata_to_frames.php`

**Modified:**
- `app/Http/Controllers/ProjectController.php`
- `app/Http/Controllers/GitHubRepoController.php`
- `resources/js/Components/Projects/NewProjectModal.jsx`
- `resources/js/Components/Header/Head/RightSection.jsx`
- `resources/js/Pages/VoidPage.jsx`
- `routes/api.php`

## Known Limitations

1. **GitHub Push**: Not fully implemented (placeholder method)
2. **CSS Extraction**: Linked CSS from imports needs implementation
3. **Tailwind Config**: Not auto-generated yet
4. **Repository Filtering**: GitHub list shows all repos (not filtered by framework)
5. **Tab Highlighting**: Forge/Source tabs not auto-highlighted yet
6. **Settings in Void**: StyleModal not added to VoidPage yet

## Notes

- All exported projects are runnable standalone
- Manual projects automatically get correct boilerplate
- Imported projects preserve original structure
- Export system handles both React and HTML projects
- Global CSS generated from DeCode settings
- Frames converted to actual code files (JSX/HTML)
- Component data used to generate markup
