# Export Code Generation Fix

## Problem
Exported ZIPs show "empty canvas" (fallback "Empty frame" message) even though the preview modal shows code correctly.

**Root Cause**: Generated code was only saved to Zustand (local browser state), NOT to the database. When exporting, `ExportController.php` reads from `frame.canvas_data.generated_code` in the database, which was always empty.

## Flow Analysis

### Before Fix (Broken)
```
User edits canvas
  ↓
generateCode() called
  ↓
componentLibraryService.clientSideCodeGeneration()
  ↓
updateSyncedCode(code) → Zustand only (local state)
  ↓
Preview Modal → ✅ Works (reads from Zustand)
  ↓
Export ZIP → ❌ Fails (reads from database, which is empty)
```

### After Fix (Working)
```
User edits canvas
  ↓
generateCode() called
  ↓
componentLibraryService.clientSideCodeGeneration()
  ↓
updateSyncedCode(code) → Zustand + Database API call
  ↓
Preview Modal → ✅ Works (reads from Zustand)
  ↓
Export ZIP → ✅ Works (reads from database)
```

## Solution

### 1. Updated `useCodeSyncStore.js`
**File**: `resources/js/stores/useCodeSyncStore.js`

**Changes**:
- Added `axios` import
- Added `currentFrameUuid` state to track which frame we're editing
- Added `setCurrentFrame()` to set the frame UUID
- Updated `updateSyncedCode()` to save to database via API:
  ```javascript
  updateSyncedCode: async (code) => {
    // Update local state immediately (for preview)
    set({ syncedCode: code, lastUpdated: Date.now() });
    
    // Save to database in background (for export)
    if (currentFrameUuid) {
      await axios.put(`/api/frames/${currentFrameUuid}/generated-code`, {
        generated_code: code
      });
    }
  }
  ```

### 2. Updated `ForgePage.jsx`
**File**: `resources/js/Pages/ForgePage.jsx`

**Changes**:
- Destructured `setCurrentFrame` as `setCodeSyncFrame` from store
- Called `setCodeSyncFrame(currentFrameId)` when frame changes
- This ensures the store knows which frame to save code to

## API Endpoint Used

**Route**: `PUT /api/frames/{uuid}/generated-code`

**Controller**: `VoidController@saveGeneratedCode` or `VoidController@updateGeneratedCode`

**Request Body**:
```json
{
  "generated_code": {
    "react": "...",
    "html": "...",
    "css": "...",
    "tailwind": "..."
  }
}
```

**Database Storage**:
- Saved to `frames.canvas_data` JSON column
- Path: `canvas_data.generated_code`

## How ExportController Uses It

**File**: `app/Http/Controllers/ExportController.php`

### For React Export (line 419-436)
```php
$canvasData = $frame->canvas_data ?? [];
$generatedCode = $canvasData['generated_code'] ?? null;

if ($generatedCode && isset($generatedCode['react'])) {
    return $generatedCode['react']; // ✅ Use pre-generated code
}

// Fallback to component-based generation
```

### For HTML Export (line 476-489)
```php
$canvasData = $frame->canvas_data ?? [];
$generatedCode = $canvasData['generated_code'] ?? null;

if ($generatedCode && isset($generatedCode['html'])) {
    return $generatedCode['html']; // ✅ Use pre-generated code
}

// Fallback to component-based generation
```

### For CSS (line 705-713)
```php
$canvasData = $frame->canvas_data ?? [];
$generatedCode = $canvasData['generated_code'] ?? null;

if ($generatedCode && isset($generatedCode['css'])) {
    $css .= $generatedCode['css']; // ✅ Use pre-generated CSS
}
```

## Testing

### Test 1: Verify Code is Saved
1. Open any project in Forge
2. Add some components to canvas
3. Open browser DevTools → Console
4. Look for: `✅ Generated code saved to database`

### Test 2: Verify Export Works
1. Add components to canvas (e.g., Button, Text)
2. Wait for auto-save (2 seconds)
3. Click Export → Download ZIP
4. Extract and open frame HTML files
5. **Expected**: Should see actual components, not "Empty frame"

### Test 3: All Export Formats
Test all 4 combinations:
- ✅ HTML + CSS
- ✅ HTML + Tailwind
- ✅ React + CSS
- ✅ React + Tailwind

All should show actual components, not empty canvas.

## Benefits

1. **Consistent Behavior**: Preview and Export now use the same data source
2. **Performance**: Code is pre-generated, export is instant
3. **Reliability**: No runtime code generation failures during export
4. **Offline Export**: Code is saved, doesn't require re-generation

## Debugging

If exports still show empty:

1. **Check if code is being saved**:
   - Open DevTools Console
   - Look for: `✅ Generated code saved to database`
   - If missing, check network tab for API errors

2. **Check database**:
   ```sql
   SELECT canvas_data->>'$.generated_code' FROM frames WHERE uuid = 'frame-uuid';
   ```
   Should show JSON with `react`, `html`, `css`, `tailwind` keys

3. **Check frame UUID**:
   - Console log: `window.currentFrameUuid`
   - Should match the current frame you're editing

4. **Check API endpoint**:
   - Network tab → Filter by `generated-code`
   - Should see PUT request with 200 status

## Files Modified

1. **resources/js/stores/useCodeSyncStore.js**
   - Added database save to `updateSyncedCode()`
   - Added frame tracking

2. **resources/js/Pages/ForgePage.jsx**
   - Added `setCodeSyncFrame()` call when frame changes

## Related Code

- **Code Generation**: `componentLibraryService.clientSideCodeGeneration()`
- **Preview Modal**: Reads from Zustand `syncedCode`
- **Export Controller**: Reads from `frame.canvas_data.generated_code`
- **API Route**: `/api/frames/{uuid}/generated-code`

## Summary

The issue was a disconnect between local state (Zustand) and database state. The fix ensures that whenever code is generated for preview, it's also saved to the database for export. This makes the system consistent and reliable.

**Before**: Preview ✅ | Export ❌
**After**: Preview ✅ | Export ✅
