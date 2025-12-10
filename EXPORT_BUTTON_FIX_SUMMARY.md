# Export Button & Framework Selection Fix

## Issues Fixed

### Issue 1: Export Modal Defaults to HTML+CSS (FIXED ✅)
**Problem**: Even when creating a React+Tailwind project manually, the export modal defaulted to HTML+CSS tabs.

**Root Cause**: VoidController wasn't passing `output_format` and `css_framework` to the frontend.

**Solution**: Updated VoidController's `show()` method to include:
- `output_format` (react/html)
- `css_framework` (tailwind/vanilla)
- `project_type` (manual/github_import)
- `github_repo_url`
- `settings`

**File Modified**: `app/Http/Controllers/VoidController.php`

---

### Issue 2: Export Button Small/Not Rendering Until Refresh
**Problem**: Export button appears small or doesn't render properly until page refresh.

**Likely Cause**: `currentProject` from `usePage().props.project` might not be immediately available on initial render.

**Where it happens**: 
- `resources/js/Components/Header/Head/RightSection.jsx` line 328
- Conditional: `{onVoidPage && myRole !== 'viewer' && currentProject && (...)`

**Debugging Steps**:

1. Check browser console for project data on VoidPage load
2. Add console.log to see when currentProject becomes available
3. Verify Inertia props are being passed correctly

**Temporary Workaround**: Refresh the page to load the button properly.

**Permanent Fix Options**:

**Option A - Add Loading State** (Recommended):
```jsx
// In RightSection.jsx
{onVoidPage && myRole !== 'viewer' && (
  currentProject ? (
    <ExportDropdown 
      projectUuid={currentProject.uuid}
      projectName={currentProject.name}
    />
  ) : (
    <div className="w-20 h-8 bg-gray-200 animate-pulse rounded-lg" />
  )
)}
```

**Option B - Use useEffect to ensure data is loaded**:
```jsx
const [projectReady, setProjectReady] = useState(false)

useEffect(() => {
  if (currentProject?.uuid) {
    setProjectReady(true)
    console.log('Project ready for export:', currentProject)
  }
}, [currentProject])

// Then use:
{onVoidPage && myRole !== 'viewer' && projectReady && (
  <ExportDropdown {...} />
)}
```

**Option C - Check Inertia data passing**:
Verify VoidPage is properly passing project data to Header component.

---

## Testing

### Test Export Framework Auto-Selection:
1. Create new project with React + Tailwind
2. Go to VoidPage
3. Click Export button
4. **Expected**: React + Tailwind tabs should be pre-selected ✅
5. **Check console for**: `🎯 Auto-selected export framework: { framework: "react", style: "tailwind" }`

### Test Export Button Rendering:
1. Create new project
2. Navigate to VoidPage
3. **Check**: Export button should render immediately
4. **If not**: Check browser console for errors
5. **Workaround**: Refresh page

---

## Complete Flow Now

### Manual Project Creation:
```
1. User selects React + Tailwind in NewProjectModal
2. Frontend sends: framework='react', style_framework='tailwind'
3. Backend maps: output_format='react', css_framework='tailwind'
4. Saves to database ✅
5. VoidPage loads with project data including framework settings ✅
6. ExportModal reads project.output_format & project.css_framework ✅
7. Auto-selects React + Tailwind tabs ✅
```

### GitHub Import:
```
1. Backend auto-detects framework from repo
2. Saves: output_format='react', css_framework='tailwind'
3. VoidPage loads with project data ✅
4. ExportModal auto-selects correct tabs ✅
```

---

## Console Debug Commands

### Check project data in VoidPage:
```javascript
// In browser console on VoidPage
console.log('Project:', window.Laravel?.page?.props?.project)
console.log('Output format:', window.Laravel?.page?.props?.project?.output_format)
console.log('CSS framework:', window.Laravel?.page?.props?.project?.css_framework)
```

### Check when ExportModal receives data:
```javascript
// Should appear when opening export modal:
🎯 Auto-selected export framework: {
  framework: "react",
  style: "tailwind",
  projectType: "manual",
  isImported: false
}
```

---

## Files Modified This Session

1. ✅ `app/Http/Controllers/VoidController.php` - Pass framework data to frontend
2. ✅ `app/Http/Controllers/ProjectController.php` - Map framework selection to database columns
3. ✅ `resources/js/Components/Header/Head/ExportModal.jsx` - Auto-select tabs (already done)

---

## Summary

**Framework Auto-Selection**: ✅ FIXED - Export modal now reads from project settings
**Export Button Issue**: ⚠️ PARTIALLY DIAGNOSED - Needs testing to confirm fix

The framework selection should now work correctly. If the button rendering issue persists after testing, we'll implement one of the fix options above.
