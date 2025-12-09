# DeCode Import/Export - Quick Start Guide

## ✅ What's Been Implemented

### 1. Database Structure
- Two new migrations for project and frame metadata
- Run: `php artisan migrate` (already done - no pending migrations)

### 2. Boilerplate Templates
- ✅ React template in `storage/app/templates/react/`
- ✅ HTML template in `storage/app/templates/html/`

### 3. Export System
- ✅ ExportController with ZIP and GitHub export
- ✅ API routes added
- ✅ Export dropdown component for VoidPage
- ✅ Loading overlay component

### 4. Manual Project Creation
- ✅ Framework selection (React/HTML)
- ✅ Style selection (CSS/Tailwind)
- ✅ Automatic boilerplate generation

### 5. GitHub Import Enhancement
- ✅ Framework detection
- ✅ Preserved files tracking
- ✅ Project type marking

## 🧪 Testing Steps

### Test 1: Create Manual React Project
```bash
1. Go to Projects page
2. Click "Create New Project"
3. Choose Framework: React
4. Choose Style: CSS
5. Fill in name and create
6. Verify project opens in VoidPage
```

### Test 2: Export Project as ZIP
```bash
1. Open any project in VoidPage
2. Look for Export button (top-right, pink button)
3. Click Export → Export as ZIP
4. Wait for download
5. Extract ZIP and verify structure:
   - package.json exists
   - vite.config.js exists
   - src/main.jsx exists
   - src/styles/global.css exists
```

### Test 3: Import GitHub Project
```bash
1. Projects page → Create New Project
2. Switch to "Import from GitHub" tab
3. Connect GitHub account
4. Select a React repository
5. Import and verify frames are created
```

## 📝 Next Actions

### High Priority
1. **Test the export functionality**
   - Create a project with some frames
   - Export as ZIP
   - Verify the ZIP contains runnable code

2. **Add StyleModal to VoidPage**
   - Currently only in Forge/Source
   - Need to integrate CanvasSettingsDropdown

3. **Complete GitHub push logic**
   - Implement `pushToGitHub()` method in ExportController
   - Use GitHub API to create commits

### Medium Priority
4. **Filter GitHub repositories**
   - Only show HTML/React repos in import list

5. **Highlight tabs in Forge/Source**
   - Auto-detect project framework
   - Highlight matching code tabs

6. **Linked CSS extraction**
   - Extract CSS imports from React components
   - Store in linked_css_files

### Low Priority
7. **Enhanced error handling**
8. **Export preview**
9. **Real-time GitHub sync**

## 🐛 Potential Issues to Watch

1. **File permissions**: Ensure `storage/app/` is writable
2. **ZIP extension**: Check if PHP ZIP extension is loaded
3. **Memory limits**: Large projects may need increased memory
4. **Path separators**: Windows vs Linux path handling

## 🔧 Quick Fixes

### If export fails:
```bash
# Check permissions
chmod -R 775 storage/app/

# Check PHP ZIP extension
php -m | grep zip

# Clear caches
php artisan cache:clear
php artisan config:clear
```

### If migrations fail:
```bash
# Check database connection
php artisan db:show

# Force migrate
php artisan migrate:fresh --force
```

## 📂 Key Files to Review

**Backend:**
- `app/Http/Controllers/ExportController.php` - Export logic
- `app/Http/Controllers/ProjectController.php` - Manual project creation
- `app/Http/Controllers/GitHubRepoController.php` - GitHub import

**Frontend:**
- `resources/js/Components/Header/Head/ExportDropdown.jsx` - Export UI
- `resources/js/Components/Projects/NewProjectModal.jsx` - Framework selection
- `resources/js/Components/Void/ExportLoadingOverlay.jsx` - Loading state

**Templates:**
- `storage/app/templates/react/*` - React boilerplate
- `storage/app/templates/html/*` - HTML boilerplate

## 🎯 Success Criteria

A successful implementation will:
1. ✅ Allow framework/style selection in project creation
2. ✅ Generate correct boilerplate automatically
3. ✅ Export runnable ZIP files
4. ✅ Preserve all files from GitHub imports
5. ✅ Generate global CSS from settings
6. ✅ Convert frames to actual code files

## 📞 Support

See `IMPLEMENTATION_SUMMARY.md` for complete technical documentation.
