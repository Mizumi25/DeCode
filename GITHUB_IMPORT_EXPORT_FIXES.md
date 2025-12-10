# GitHub Import/Export Fixes - Complete Summary

## Issues Identified and Fixed

### 🐛 **Issue 1: Boilerplate Files Created as Frames**
**Problem:**
- When exporting to GitHub, the system creates `index.html` and `main.js` as navigation/boilerplate files
- When re-importing that project, these files were being detected as frames
- This resulted in extra unwanted frames (index.html as Page, main.js potentially as component)

**Root Cause:**
- `FrontendAnalysisService.php` didn't filter out these boilerplate files
- No distinction between actual content frames and navigation scaffolding

**Solution:**
✅ **File:** `app/Services/FrontendAnalysisService.php`
- Added `index.html`, `main.js`, `app.js` to skip patterns
- Implemented exact match filtering for boilerplate files
- Added path-based filtering to skip root-level `scripts/` directory and root `index.html`

```php
// Skip boilerplate files (lines 48-50)
'index.html', 'main.js', 'app.js'

// Exact match logic (lines 99-101)
if (in_array($pattern, ['index.html', 'main.js', 'app.js'])) {
    if ($lowercaseName === $pattern) {
        return null;
    }
}

// Path-based filtering (lines 112-113)
if (strpos($lowercasePath, 'scripts/') === 0 || $lowercasePath === 'index.html') {
    return null;
}
```

---

### 🐛 **Issue 2: Missing Code in Code Panels**
**Problem:**
- After importing from GitHub, frames had no code visible in:
  - Code Panel (Forge page)
  - Export Modal code preview
  - Code Handler (Void page)
  - Source page editor
- Only placeholder/template elements were shown, not the actual GitHub file content

**Root Cause:**
- Import process only stored file metadata, not actual file content
- `canvas_data.generated_code` was empty
- Code panels rely on `generated_code` to display actual source

**Solution:**
✅ **File:** `app/Http/Controllers/GitHubRepoController.php`

**Added 3 new methods:**

1. **`fetchFileContent()`** (lines 1074-1111)
   - Fetches actual file content from GitHub API
   - Decodes base64 content
   - Handles errors gracefully

2. **`generateCodeFromGitHubFile()`** (lines 1113-1159)
   - Processes file content based on extension
   - Generates structured code object:
     - `.jsx/.tsx` → `react` code + extracted CSS
     - `.html/.htm` → `html` code + embedded CSS
     - `.js/.ts` → `react` code + CSS imports
     - `.css` → pure CSS

3. **`extractCSSFromHTML()`** and **`extractCSSFromJSX()`** (lines 1161-1190)
   - Extracts CSS from `<style>` tags in HTML
   - Detects CSS imports and CSS-in-JS in JSX

**Updated import flow (lines 297-320):**
```php
// Fetch actual content from GitHub
$fileContent = $this->fetchFileContent($validated['repository_id'], $fileData['path'], $user);
$generatedCode = $this->generateCodeFromGitHubFile($fileContent, $fileData);

// Store in canvas_data
'canvas_data' => [
    // ... other data
    'generated_code' => $generatedCode // ✅ Now contains actual code!
]
```

---

### 🐛 **Issue 3: Frame Type Preservation**
**Problem:**
- Original project had: `Home` (Page) and `Jss` (Component with linking enabled)
- After export → import, both became Pages
- Linking relationships were lost

**Status:** ⚠️ **Partially Fixed**
- The current fix preserves the `type` field from `FrontendAnalysisService::determineFrameType()`
- However, **component linking metadata is NOT preserved** in export/import cycle

**Current Behavior:**
- `Home.html` → correctly detected as `page`
- `Jss.jsx` (or similar component file) → detected as `component` based on path/filename patterns

**Limitation:**
- The linking relationship (which component is linked to which page) is stored in `FrameComponentAssignment` table
- This linking data is **NOT exported** to GitHub
- Upon re-import, files are analyzed fresh and linking must be manually re-established

**Potential Future Enhancement:**
Export a metadata file (e.g., `.decode-metadata.json`) containing:
```json
{
  "frames": {
    "Home": {
      "type": "page",
      "linked_components": ["Jss"]
    },
    "Jss": {
      "type": "component",
      "linked_to_pages": ["Home"]
    }
  }
}
```

---

## Testing Checklist

### ✅ Test 1: Boilerplate Files Excluded
1. Create a manual project with 2 frames: `Home` (page) and `TestComponent` (component)
2. Export to GitHub
3. Import the same repo
4. **Expected:** Only 2 frames created (Home and TestComponent)
5. **Expected:** NO frames for `index.html`, `main.js`, or `scripts/main.js`

### ✅ Test 2: Code Visible in Panels
1. Import a GitHub project with HTML/JSX files
2. Open in Forge page → check Code Panel
3. Open Export Modal → check code preview tabs
4. Open Void page → check Code Handler panel
5. **Expected:** Actual file content visible in all panels

### ✅ Test 3: Frame Types Correct
1. Export project with mixed page/component frames
2. Re-import
3. **Expected:** Files in `/pages/` or with `index/home` names → Page type
4. **Expected:** Files in `/components/` or with component patterns → Component type

---

## Files Modified

1. ✅ `app/Services/FrontendAnalysisService.php`
   - Added boilerplate file filtering
   - Enhanced skip pattern logic

2. ✅ `app/Http/Controllers/GitHubRepoController.php`
   - Added `fetchFileContent()` method
   - Added `generateCodeFromGitHubFile()` method
   - Added CSS extraction helpers
   - Updated import flow to fetch and store actual code

---

## How It Works Now

### Export Flow (No Changes)
```
Manual Project
  ↓
Export to GitHub
  ↓
Creates: frames/*.html + index.html + main.js (navigation)
  ↓
Pushed to GitHub
```

### Import Flow (Fixed)
```
GitHub Repo
  ↓
Fetch repository file list
  ↓
Filter files (FrontendAnalysisService)
  ├─ ❌ Skip: index.html (root level)
  ├─ ❌ Skip: scripts/main.js
  ├─ ✅ Include: frames/Home.html
  └─ ✅ Include: frames/Jss.jsx
  ↓
For each valid file:
  ├─ Fetch actual content from GitHub API
  ├─ Parse content based on extension
  ├─ Generate code structure (html/react/css)
  └─ Store in canvas_data.generated_code
  ↓
Create Frame with:
  ├─ Correct type (page/component)
  ├─ Actual source code
  └─ Visual placeholder elements
```

---

## Known Limitations

1. **Linking relationships not preserved** - Components must be re-linked to pages after import
2. **CSS file references** - Separate `.css` files are detected but content may not be fetched (only main HTML/JSX files)
3. **Complex imports** - Files with many cross-dependencies may not have all code visible

---

## Recommendations

### For Users:
- ✅ Export and import now works correctly for individual frame files
- ⚠️ After importing, re-establish component linking in Void page
- 💡 Keep frame structures simple (one file per frame) for best results

### For Future Development:
1. **Add metadata export** - Store linking relationships in a `.decode-metadata.json` file
2. **Fetch linked CSS files** - When importing HTML with `<link rel="stylesheet">`, fetch those CSS files too
3. **Preserve canvas layout** - Store frame positions and container relationships
4. **Two-way sync** - Detect changes on GitHub and offer to update local project

---

## Quick Reference

| Issue | Status | File Changed |
|-------|--------|--------------|
| Boilerplate files as frames | ✅ Fixed | `FrontendAnalysisService.php` |
| Missing code in panels | ✅ Fixed | `GitHubRepoController.php` |
| Frame type preservation | ⚠️ Partial | `FrontendAnalysisService.php` |
| Component linking | ❌ Not preserved | N/A (needs metadata export) |

---

**Last Updated:** January 2025  
**Version:** 40.2+
