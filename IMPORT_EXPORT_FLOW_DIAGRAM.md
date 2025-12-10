# GitHub Import/Export Flow - Visual Guide

## 📤 Export Flow (Manual Project → GitHub)

```
┌─────────────────────────────────────┐
│   Your Manual Project (DeCode)      │
│                                     │
│   ┌─────────┐    ┌─────────┐      │
│   │  Home   │    │   Jss   │      │
│   │ (Page)  │◄───│(Component)│     │
│   └─────────┘    └─────────┘      │
│                  (Linked)          │
└─────────────────────────────────────┘
              │
              │ Export to GitHub
              ▼
┌─────────────────────────────────────┐
│   GitHub Repository Structure       │
│                                     │
│   📁 Project Root                   │
│   ├── 📄 index.html ─────────────┐ │
│   ├── 📁 scripts/                │ │
│   │   └── 📄 main.js ────────────┤ │  Boilerplate
│   ├── 📁 frames/                 │ │  (Navigation)
│   │   ├── 📄 Home.html ──────────┘ │
│   │   └── 📄 Jss.jsx               │  Content Frames
│   └── 📁 styles/                   │
│       └── 📄 global.css            │
└─────────────────────────────────────┘
```

---

## 📥 Import Flow (GitHub → DeCode Project)

### Before Fix ❌
```
GitHub Repo
    │
    │ Import (OLD)
    ▼
┌─────────────────────────────────────┐
│   Created 4 Frames:                 │
│                                     │
│   1. 📄 Home (page)                 │
│   2. 📄 Jss (page) ← WRONG TYPE     │
│   3. 📄 index (page) ← UNWANTED     │
│   4. 📄 main (component) ← UNWANTED │
│                                     │
│   ❌ Code panels empty              │
│   ❌ No linking preserved           │
└─────────────────────────────────────┘
```

### After Fix ✅
```
GitHub Repo
    │
    │ 1. Fetch file list
    ▼
┌─────────────────────────────────────┐
│   FrontendAnalysisService           │
│   Filtering files...                │
│                                     │
│   ❌ index.html → SKIP              │
│   ❌ scripts/main.js → SKIP         │
│   ✅ frames/Home.html → INCLUDE     │
│   ✅ frames/Jss.jsx → INCLUDE       │
└─────────────────────────────────────┘
    │
    │ 2. For each valid file
    ▼
┌─────────────────────────────────────┐
│   GitHubRepoController              │
│   Fetching file content...          │
│                                     │
│   🌐 GET /repos/.../Home.html       │
│   📥 Decode base64 content          │
│   🔍 Parse HTML + extract CSS       │
│   💾 Store in canvas_data           │
│                                     │
│   🌐 GET /repos/.../Jss.jsx         │
│   📥 Decode base64 content          │
│   🔍 Parse JSX + detect CSS         │
│   💾 Store in canvas_data           │
└─────────────────────────────────────┘
    │
    │ 3. Create frames
    ▼
┌─────────────────────────────────────┐
│   Imported Project                  │
│                                     │
│   ┌─────────┐    ┌─────────┐      │
│   │  Home   │    │   Jss   │      │
│   │ (Page)  │    │(Component)│     │
│   │         │    │         │      │
│   │ ✅ Code │    │ ✅ Code │      │
│   │ visible │    │ visible │      │
│   └─────────┘    └─────────┘      │
│                                     │
│   ⚠️ Linking not preserved          │
│   (must re-link manually)           │
└─────────────────────────────────────┘
```

---

## 🔍 Code Storage Structure

### Before Fix ❌
```json
{
  "canvas_data": {
    "elements": [...],
    "generated_code": null  ← EMPTY!
  }
}
```

### After Fix ✅
```json
{
  "canvas_data": {
    "elements": [...],
    "generated_code": {
      "html": "<!DOCTYPE html>...",
      "css": ".container { ... }",
      "react": null
    }
  }
}
```

---

## 🎯 Code Panel Integration

```
Frame with generated_code
    │
    ├─► Forge Code Panel ──────► Shows HTML/JSX
    │
    ├─► Export Modal ──────────► Shows preview tabs
    │
    ├─► Void Code Handler ─────► Shows actual code
    │
    └─► Source Page Editor ────► Editable code
```

---

## 📋 File Type Detection Logic

```
File Analysis
    │
    ├─ Path contains "frames/"? ──────┐
    │                                  │
    ├─ Filename = "index.html"? ──► ❌ SKIP
    ├─ Filename = "main.js"? ─────► ❌ SKIP
    ├─ Path = "scripts/*"? ───────► ❌ SKIP
    │                                  │
    └─────────────────────────────────┘
                    │
                    │ Valid file
                    ▼
    ┌───────────────────────────────┐
    │   Determine Type              │
    │                               │
    │   Filename patterns:          │
    │   - index, home, main ──► Page│
    │   - Path: /pages/ ──────► Page│
    │   - Path: /components/ ► Comp │
    │   - Extension: .jsx ────► Comp│
    └───────────────────────────────┘
```

---

## 🔧 Technical Details

### fetchFileContent()
```
GitHub API Request
    │
    ├─ GET /repositories/{id}/contents/{path}
    │
    ├─ Response: { content: "base64..." }
    │
    ├─ Decode base64
    │
    └─ Return plain text content
```

### generateCodeFromGitHubFile()
```
File Content + Extension
    │
    ├─ .jsx/.tsx ──► { react: content, css: extracted }
    ├─ .html/.htm ─► { html: content, css: from <style> }
    ├─ .js/.ts ────► { react: content, css: imports }
    └─ .css ───────► { css: content }
```

---

## ⚠️ Current Limitations

1. **Linking Not Preserved**
   ```
   Export: Home (Page) ◄─── Jss (Component)
                       Link
   
   Import: Home (Page)      Jss (Component)
                 ✗ No link ✗
   
   Solution: Manually re-link in Void page
   ```

2. **Separate CSS Files Not Fully Supported**
   ```
   ✅ Embedded <style> in HTML → Extracted
   ✅ CSS imports detected → Noted in comments
   ❌ Linked .css files → Not automatically fetched
   ```

3. **Complex Imports Not Resolved**
   ```
   import Header from './components/Header'
                      └─► Not fetched or resolved
   ```

---

## 🚀 Future Enhancements

### Metadata Export (Proposed)
```json
{
  ".decode-metadata.json": {
    "version": "1.0",
    "frames": {
      "Home": {
        "type": "page",
        "linked_components": ["Jss"],
        "position": { "x": 200, "y": 200 }
      },
      "Jss": {
        "type": "component",
        "linked_to_pages": ["Home"],
        "position": { "x": 600, "y": 200 }
      }
    },
    "containers": [...],
    "settings": {...}
  }
}
```

This would enable:
- ✅ Preserve linking relationships
- ✅ Restore canvas layout
- ✅ Maintain container hierarchy
- ✅ Perfect round-trip export/import

---

**Created:** January 2025  
**Version:** 40.2+
