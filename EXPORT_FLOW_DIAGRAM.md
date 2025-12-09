# Export System Architecture & Flow

## Complete System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                         │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌───────────────────┐    ┌──────────────────┐
        │  StyleModal Open  │    │  Export Clicked  │
        │   (Settings ⚙️)   │    │   (ZIP/GitHub)   │
        └───────────────────┘    └──────────────────┘
                    │                         │
                    │                         │
                    ▼                         ▼
        ┌───────────────────┐    ┌──────────────────┐
        │  Adjust Colors    │    │ Read Project     │
        │  Typography       │    │ Settings         │
        │  Spacing, etc.    │    │                  │
        └───────────────────┘    └──────────────────┘
                    │                         │
                    ▼                         │
        ┌───────────────────┐               │
        │ Click "Save       │               │
        │ Changes"          │               │
        └───────────────────┘               │
                    │                         │
                    ▼                         │
        ┌───────────────────┐               │
        │ API Call:         │               │
        │ PUT /style-       │               │
        │ settings          │               │
        └───────────────────┘               │
                    │                         │
                    ▼                         │
        ┌───────────────────┐               │
        │ Save to Database  │               │
        │ project.settings  │               │
        │ .style_variables  │               │
        └───────────────────┘               │
                    │                         │
                    └─────────┬───────────────┘
                              │
                              ▼
                ┌─────────────────────────┐
                │  EXPORT PROCESS STARTS  │
                └─────────────────────────┘
```

## Export Generation Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    EXPORT CONTROLLER                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────┐
                │ generateProjectStructure│
                └─────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
    ┌──────────────┐ ┌──────────┐ ┌──────────────┐
    │ Copy Template│ │  Frames  │ │  Global CSS  │
    │ Boilerplate  │ │Generation│ │  Generation  │
    └──────────────┘ └──────────┘ └──────────────┘
                │             │             │
                └─────────────┼─────────────┘
                              │
                              ▼
                ┌─────────────────────────┐
                │   Framework Detection   │
                │  (HTML+CSS / Tailwind)  │
                └─────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
        ┌───────────────────┐ ┌───────────────────┐
        │   HTML + CSS      │ │  HTML + Tailwind  │
        │                   │ │                   │
        │ • Extract styles  │ │ • Keep inline     │
        │   to global.css   │ │   Tailwind        │
        │ • Generate        │ │ • Skip style      │
        │   classes         │ │   extraction      │
        └───────────────────┘ └───────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              │
                              ▼
                ┌─────────────────────────┐
                │  Generate index.html    │
                │  with Navigation        │
                └─────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────┐
                │  Generate main.js       │
                │  with Frame Switching   │
                └─────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────┐
                │  Create ZIP Archive     │
                └─────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────┐
                │  Download to User       │
                └─────────────────────────┘
```

## CSS Variable Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    StyleModal Component                      │
│                                                              │
│  User Changes:                                              │
│  • --color-primary: #3b82f6 → #ff0000                      │
│  • --color-surface: #ffffff → #1a1a1a                      │
│  • ... (20+ variables)                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Save Changes)
┌─────────────────────────────────────────────────────────────┐
│                    Database: projects.settings               │
│                                                              │
│  {                                                          │
│    "style_variables": {                                     │
│      "--color-primary": "#ff0000",                         │
│      "--color-surface": "#1a1a1a",                         │
│      "--color-text": "#ffffff",                            │
│      ...                                                    │
│    }                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Export Triggered)
┌─────────────────────────────────────────────────────────────┐
│                    ExportController                          │
│                                                              │
│  1. Read project.settings.style_variables                   │
│  2. Merge with default variables                            │
│  3. Generate global.css                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    exported/styles/global.css                │
│                                                              │
│  :root {                                                    │
│    --color-primary: #ff0000;  ← Custom value!              │
│    --color-surface: #1a1a1a;  ← Custom value!              │
│    --color-text: #ffffff;     ← Custom value!              │
│    --color-border: #e5e7eb;                                │
│    ... (all 20+ variables)                                  │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

## Component Style Extraction (HTML+CSS Only)

```
┌─────────────────────────────────────────────────────────────┐
│                    Forge Editor                              │
│                                                              │
│  Frame: "Home"                                              │
│  ├─ Button Component                                        │
│  │  ├─ UUID: abc123...                                     │
│  │  └─ style: {                                            │
│  │       backgroundColor: "#3b82f6",                       │
│  │       padding: "10px 20px",                            │
│  │       borderRadius: "6px"                               │
│  │     }                                                    │
│  └─ Text Component                                          │
│     ├─ UUID: def456...                                     │
│     └─ style: {                                            │
│          fontSize: "16px",                                  │
│          color: "#1f2937"                                   │
│        }                                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Export)
┌─────────────────────────────────────────────────────────────┐
│                    generateFrameComponentStyles()            │
│                                                              │
│  For each component:                                        │
│  1. Generate unique class name                              │
│  2. Convert camelCase → kebab-case                         │
│  3. Output to global.css                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    exported/styles/global.css                │
│                                                              │
│  /* Component Styles */                                     │
│  .component-button-abc123 {                                │
│    background-color: #3b82f6;                              │
│    padding: 10px 20px;                                      │
│    border-radius: 6px;                                      │
│  }                                                          │
│                                                              │
│  .component-text-def456 {                                  │
│    font-size: 16px;                                         │
│    color: #1f2937;                                          │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    exported/frames/home.html                 │
│                                                              │
│  <button class="component-button-abc123">                  │
│    Click Me                                                 │
│  </button>                                                  │
│  <p class="component-text-def456">                         │
│    Hello World                                              │
│  </p>                                                       │
└─────────────────────────────────────────────────────────────┘
```

## Frame Navigation System

```
┌─────────────────────────────────────────────────────────────┐
│                    exported/index.html                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Navigation Bar                                        │  │
│  │ [Home] [About] [Contact]  ← Buttons for each frame  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │         <iframe src="frames/home.html">              │  │
│  │                                                       │  │
│  │         Frame content loads here                      │  │
│  │                                                       │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (User clicks "About")
┌─────────────────────────────────────────────────────────────┐
│                    scripts/main.js                           │
│                                                              │
│  document.querySelectorAll('.nav-button').forEach(btn => { │
│    btn.addEventListener('click', function() {              │
│      // Remove active from all                             │
│      // Add active to clicked                              │
│      // Load frame: frames/about.html                      │
│      frameViewer.src = this.getAttribute('data-frame');    │
│    });                                                      │
│  });                                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Result                                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Navigation Bar                                        │  │
│  │ [Home] [About*] [Contact]  ← About is now active    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         <iframe src="frames/about.html">             │  │
│  │         About page content                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## File Generation Tree

```
exportAsZip()
│
├─ generateProjectStructure()
│  │
│  ├─ copyDirectory(template)
│  │
│  ├─ generateFrameFile() [for each frame]
│  │  │
│  │  ├─ generateHTMLFile()
│  │  │  └─ generateHTMLFromComponents()
│  │  │     └─ componentToHTML()
│  │  │        └─ Uses CSS class (HTML+CSS)
│  │  │        └─ Uses Tailwind (HTML+Tailwind)
│  │  │
│  │  └─ generateReactComponent() [if React]
│  │
│  ├─ generateGlobalCSS()
│  │  │
│  │  ├─ Merge defaults + saved style_variables
│  │  ├─ Output :root { ... }
│  │  ├─ Output base styles
│  │  └─ generateFrameComponentStyles() [if HTML+CSS]
│  │     └─ Extract all component styles to classes
│  │
│  └─ updateMainEntryPoint()
│     │
│     ├─ generateIndexHTML() [if HTML]
│     │  └─ Create navigation + iframe
│     │
│     ├─ generateMainJS() [if HTML]
│     │  └─ Frame switching logic
│     │
│     └─ Update App.jsx [if React]
│
├─ createZipFromDirectory()
│  └─ Package all files
│
└─ Return ZIP download
```

## Key Methods Reference

| Method | Purpose | Framework |
|--------|---------|-----------|
| `updateStyleSettings()` | Save CSS variables to DB | Both |
| `generateGlobalCSS()` | Create global.css with variables | Both |
| `generateFrameComponentStyles()` | Extract component styles | HTML+CSS |
| `generateComponentClassName()` | Create unique class names | HTML+CSS |
| `componentToHTML()` | Convert component to HTML | HTML |
| `generateIndexHTML()` | Create navigation page | HTML |
| `generateMainJS()` | Frame switching logic | HTML |
| `convertCamelToKebab()` | CSS property conversion | Both |

## Data Flow Summary

1. **User → StyleModal → Database**
   - User customizes CSS variables
   - Saved to `projects.settings.style_variables`

2. **Database → Export → global.css**
   - Export reads saved variables
   - Merges with defaults
   - Outputs complete CSS

3. **Components → CSS Classes → global.css** (HTML+CSS only)
   - Extract inline styles
   - Generate unique class names
   - Output to global.css

4. **Frames → Navigation → index.html**
   - List all frames
   - Create navigation buttons
   - Setup iframe viewer

5. **ZIP → Download → User**
   - Package everything
   - Download complete project
   - Ready to run in browser
