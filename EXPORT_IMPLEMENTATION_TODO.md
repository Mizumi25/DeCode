# Export/Import Implementation - Remaining Tasks

## ✅ Completed
1. ✅ Database migrations for import/export metadata
2. ✅ Created boilerplate templates (React & HTML)
3. ✅ ExportController with ZIP and GitHub export methods
4. ✅ ExportDropdown component for VoidPage
5. ✅ ExportLoadingOverlay component
6. ✅ Updated NewProjectModal with framework/style selection
7. ✅ Added SVG icons for React and HTML frameworks
8. ✅ Updated ProjectController for manual project creation
9. ✅ Updated GitHubRepoController for imported projects
10. ✅ API routes for export

## 🚧 TODO - High Priority

### 1. Fix ProjectController Project Creation
**File:** `app/Http/Controllers/ProjectController.php`
**Issue:** Need to find the exact Project::create() call and add framework fields
**Lines to check:** Around line 766-850

```php
// Need to add these fields to Project::create():
'framework' => $validated['framework'],
'style_framework' => $validated['style_framework'],
'project_type' => 'manual',
'boilerplate_template' => $validated['framework'] . '_' . $validated['style_framework'],
```

### 2. Add StyleModal to VoidPage
**File:** `resources/js/Pages/VoidPage.jsx`
**Action:** Import and integrate CanvasSettingsDropdown component
**Purpose:** Allow users to edit global CSS variables in VoidPage

```jsx
import CanvasSettingsDropdown from '@/Components/Forge/CanvasSettingsDropdown';

// Add to header in VoidPage
<CanvasSettingsDropdown 
  project={project}
  onSettingsChange={handleSettingsChange}
/>
```

### 3. Complete ExportController Implementation
**File:** `app/Http/Controllers/ExportController.php`

**Missing methods to implement:**
- `generateLinkedCSS()` - Extract CSS from frame imports
- `restorePreservedFiles()` - Restore non-frame files from imported projects
- `pushToGitHub()` - Implement GitHub API push logic

**GitHub Push Implementation:**
```php
private function pushToGitHub($project, $projectPath, $validated, $user): string
{
    $token = $user->github_token;
    $client = new \Github\Client();
    $client->authenticate($token, null, \Github\Client::AUTH_ACCESS_TOKEN);
    
    // Create or update repository
    if ($validated['create_new_repo']) {
        $repo = $client->api('repo')->create(
            $validated['repository_name'],
            '',
            '',
            $validated['is_private']
        );
    } else {
        // Update existing repo
        $repo = ['html_url' => $project->source_repo_url];
    }
    
    // Commit files
    // ... implementation
    
    return $repo['html_url'];
}
```

### 4. Filter GitHub Repository List
**File:** `resources/js/Pages/ProjectList.jsx` or `resources/js/Components/Projects/RepositoryList.jsx`
**Action:** Filter to show only HTML/React repositories

```jsx
const filteredRepos = repositories.filter(repo => {
  const languages = repo.language?.toLowerCase() || '';
  const hasPackageJson = repo.files?.some(f => f.name === 'package.json');
  const hasIndexHtml = repo.files?.some(f => f.name === 'index.html');
  
  return languages.includes('javascript') || 
         languages.includes('typescript') || 
         languages.includes('html') ||
         hasPackageJson ||
         hasIndexHtml;
});
```

### 5. Highlight Code Tabs in Forge/Source
**Files:** 
- `resources/js/Pages/ForgePage.jsx`
- `resources/js/Pages/SourcePage.jsx`

**Action:** Auto-detect and highlight tabs based on project framework

```jsx
// In ForgePage/SourcePage
const { framework, style_framework } = project;

// Highlight matching tabs
const isTabActive = (tab) => {
  if (tab === 'react' && framework === 'react') return true;
  if (tab === 'html' && framework === 'html') return true;
  if (tab === 'css' && style_framework === 'css') return true;
  if (tab === 'tailwind' && style_framework === 'tailwind') return true;
  return false;
};
```

## 🔧 TODO - Medium Priority

### 6. Extract Linked CSS from React Imports
**File:** `app/Http/Controllers/GitHubRepoController.php`
**Action:** Parse React files for CSS imports

```php
private function extractLinkedCss($fileContent, $filePath): array
{
    $linkedCss = [];
    
    // Match import statements
    preg_match_all(
        "/import\s+['\"](.+\.css)['\"]/",
        $fileContent,
        $matches
    );
    
    foreach ($matches[1] as $cssPath) {
        $linkedCss[] = $this->resolveCssPath($cssPath, $filePath);
    }
    
    return $linkedCss;
}
```

### 7. Generate Component-Level CSS
**File:** `app/Http/Controllers/ExportController.php`
**Action:** Extract styles from component props and generate CSS files

```php
private function generateComponentCss($component): string
{
    $css = '';
    $selector = ".component-{$component->id}";
    
    if (!empty($component->style)) {
        $css .= "{$selector} {\n";
        foreach ($component->style as $prop => $value) {
            $cssProp = $this->camelToKebab($prop);
            $css .= "  {$cssProp}: {$value};\n";
        }
        $css .= "}\n\n";
    }
    
    return $css;
}
```

### 8. Add Tailwind Config Generation
**File:** `app/Http/Controllers/ExportController.php`
**Action:** Generate tailwind.config.js for Tailwind projects

```php
private function generateTailwindConfig(Project $project, string $exportPath): void
{
    if ($project->style_framework !== 'tailwind') {
        return;
    }
    
    $config = <<<JS
    module.exports = {
      content: [
        './src/**/*.{js,jsx,html}',
        './frames/**/*.{js,jsx,html}',
      ],
      theme: {
        extend: {},
      },
      plugins: [],
    }
    JS;
    
    file_put_contents("{$exportPath}/tailwind.config.js", $config);
}
```

### 9. Update Package.json for Tailwind
**File:** `storage/app/templates/react/package.json`
**Action:** Create separate templates for React+Tailwind

```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
```

### 10. Add Export Progress Tracking
**File:** `app/Http/Controllers/ExportController.php`
**Action:** Use Laravel events for progress updates

```php
event(new ExportProgressEvent($project, 'Generating frames', 30));
event(new ExportProgressEvent($project, 'Creating boilerplate', 60));
event(new ExportProgressEvent($project, 'Compressing files', 90));
```

## 📝 TODO - Low Priority

### 11. Add Export Preview
Allow users to preview the file structure before exporting

### 12. Add Export History
Track all exports in database with timestamps and download links

### 13. Add Git Integration
Allow committing directly to existing repos without full export

### 14. Add Component-Level Exports
Export individual frames as standalone components

### 15. Add Custom Boilerplate Templates
Let users upload their own boilerplate templates

## 🧪 Testing Checklist

- [ ] Create manual React + CSS project
- [ ] Create manual React + Tailwind project  
- [ ] Create manual HTML + CSS project
- [ ] Create manual HTML + Tailwind project
- [ ] Export manual project as ZIP
- [ ] Unzip and run project locally
- [ ] Import GitHub React project
- [ ] Import GitHub HTML project
- [ ] Export imported project as ZIP
- [ ] Verify preserved files intact
- [ ] Test Settings → global.css generation
- [ ] Test frame generation from components
- [ ] Test Export to GitHub (requires GitHub API setup)

## 🐛 Known Issues

1. **ZIP Extension:** Ensure PHP ZIP extension is enabled
2. **File Permissions:** Ensure `storage/app/` is writable
3. **Memory Limits:** Large projects may need increased PHP memory
4. **Path Separators:** Windows vs Linux compatibility
5. **GitHub Token:** Need to store and refresh GitHub tokens

## 📚 Documentation Needed

1. User guide for import/export
2. Developer guide for adding new frameworks
3. API documentation for export endpoints
4. Troubleshooting guide
