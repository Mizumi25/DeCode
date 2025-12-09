# Export System Testing Guide

## Quick Test Steps

### 1. Test StyleModal Saving
1. Open any project in Forge page
2. Click the **Settings icon** (⚙️) in the header middle panel
3. Change some colors (e.g., Primary Color to red `#ff0000`)
4. Click **"Save Changes"** button
5. ✅ Verify: Button shows "Saving..." then becomes disabled
6. ✅ Verify: Status shows "All changes saved"
7. Refresh the page
8. Open Settings modal again
9. ✅ Verify: Your red color is still there (persisted)

### 2. Test Export with Saved Settings
1. In the same project, ensure you have at least one frame with some components
2. Click **Export** dropdown → **Export as ZIP**
3. Wait for download to complete
4. Extract the ZIP file
5. ✅ Verify: Folder structure exists:
   ```
   - index.html
   - frames/
   - styles/global.css
   - scripts/main.js
   ```

### 3. Test Global CSS Contains Saved Variables
1. Open `styles/global.css` from extracted ZIP
2. ✅ Verify: You see your custom red color:
   ```css
   :root {
     --color-primary: #ff0000;  /* Your custom color! */
     --color-surface: #ffffff;
     /* ... other variables */
   }
   ```

### 4. Test Frame Navigation
1. Open `index.html` in a web browser
2. ✅ Verify: You see a navigation bar at the top
3. ✅ Verify: Your frame names appear as buttons
4. ✅ Verify: First frame is loaded by default
5. Click on different frame buttons
6. ✅ Verify: Frames switch smoothly
7. ✅ Verify: Active button is highlighted

### 5. Test HTML+CSS Component Styles
**Only for HTML+CSS projects:**
1. Open `styles/global.css`
2. Scroll to the bottom
3. ✅ Verify: You see component styles like:
   ```css
   /* Component Styles */
   .component-button-a1b2c3d4 {
     background-color: #3b82f6;
     padding: 10px 20px;
     /* ... component styles */
   }
   ```
4. Open any frame HTML file in `frames/` folder
5. ✅ Verify: Components use class names, not inline styles:
   ```html
   <button class="component-button-a1b2c3d4">Click Me</button>
   ```

### 6. Test HTML+Tailwind Inline Styles
**Only for HTML+Tailwind projects:**
1. Open any frame HTML file in `frames/` folder
2. ✅ Verify: Components use Tailwind classes:
   ```html
   <button class="bg-blue-500 px-4 py-2">Click Me</button>
   ```

### 7. Test Empty Project Export
1. Create a new project with no frames
2. Export as ZIP
3. ✅ Verify: Export completes without errors
4. ✅ Verify: index.html shows "No frames available" message

## Browser Console Testing

Open browser console (F12) while using the app:

### Test Save API Call
1. Open Settings modal
2. Change a color
3. Click "Save Changes"
4. Check Network tab
5. ✅ Verify: You see request to `/api/projects/{uuid}/style-settings`
6. ✅ Verify: Response status is 200
7. ✅ Verify: Response contains `"success": true`

## Known Issues to Watch For

1. **Export fails with "No such file or directory"**
   - ✅ FIXED: Directory is now auto-created
   
2. **StyleModal changes don't persist**
   - ✅ FIXED: Now saves to database
   
3. **Exported CSS missing custom colors**
   - ✅ FIXED: All 20+ variables now included
   
4. **Frames not visible in exported project**
   - ✅ FIXED: Navigation system added
   
5. **Component styles inline instead of CSS classes**
   - ✅ FIXED: For HTML+CSS, styles extracted to global.css

## Manual Testing Scenarios

### Scenario 1: Multi-Frame Project
- Create project with 3 frames: "Home", "About", "Contact"
- Add different components to each frame
- Customize colors in StyleModal
- Export and verify all frames are navigable

### Scenario 2: Custom Theme
- Create a dark theme in StyleModal:
  - Background: `#1a1a1a`
  - Text: `#ffffff`
  - Primary: `#00ff00`
- Save changes
- Export project
- Open in browser
- Verify dark theme is applied

### Scenario 3: Complex Components
- Add buttons, text, images, containers
- Style each component differently
- For HTML+CSS: Verify each gets unique class
- For HTML+Tailwind: Verify Tailwind classes preserved

## Automated Testing (Future)

```php
// Test style settings save
public function test_can_save_style_settings()
{
    $project = Project::factory()->create();
    $response = $this->actingAs($project->user)
        ->putJson("/api/projects/{$project->uuid}/style-settings", [
            'style_variables' => [
                '--color-primary' => '#ff0000'
            ]
        ]);
    
    $response->assertStatus(200);
    $project->refresh();
    $this->assertEquals('#ff0000', $project->settings['style_variables']['--color-primary']);
}

// Test export includes style variables
public function test_export_includes_style_variables()
{
    $project = Project::factory()->create([
        'settings' => [
            'style_variables' => [
                '--color-primary' => '#ff0000'
            ]
        ]
    ]);
    
    $response = $this->actingAs($project->user)
        ->get("/api/projects/{$project->uuid}/export/zip");
    
    $response->assertStatus(200);
    // Extract and verify CSS contains custom color
}
```

## Performance Testing

- Export project with 10+ frames
- Export project with 100+ components
- Verify export completes within 10 seconds
- Verify ZIP file size is reasonable

## Browser Compatibility

Test exported HTML in:
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## Success Criteria

All of the following should work:
1. ✅ StyleModal saves settings to database
2. ✅ Settings persist after page refresh
3. ✅ Export includes saved CSS variables
4. ✅ Frame navigation works in exported project
5. ✅ Component styles are properly organized
6. ✅ Exported project runs without errors
7. ✅ CSS variables apply throughout export
8. ✅ No console errors in browser
