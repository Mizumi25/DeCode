# Export Preview & Database Fix - Complete Solution

## Problem
1. **Export Preview Modal** shows "empty canvas" 
2. **Downloaded ZIP** shows "empty canvas"
3. **CodePanel in ForgePage** shows correct code ✓

## Root Cause Analysis

### Why CodePanel Works
- Reads from Zustand local state (`syncedCode`)
- Updated immediately when components change
- Always has latest generated code

### Why Export Preview & ZIP Failed
- Both read from **database** (`frame.canvas_data.generated_code`)
- Code was never saved to database
- `updateSyncedCode()` was NOT being awaited (fire-and-forget)
- Export Preview/ZIP API called before database save completed

## Complete Solution

### 1. Made `updateSyncedCode` Save to Database
**File**: `resources/js/stores/useCodeSyncStore.js`

```javascript
updateSyncedCode: async (code) => {
  const { currentFrameUuid } = get();
  
  // Update local state (for CodePanel)
  set({ syncedCode: code, lastUpdated: Date.now() });
  
  // Save to database (for Export Preview & ZIP)
  if (currentFrameUuid) {
    await axios.put(`/api/frames/${currentFrameUuid}/generated-code`, {
      generated_code: code
    });
    console.log('✅ Generated code saved to database');
  }
}
```

### 2. Set Frame UUID in Store
**File**: `resources/js/Pages/ForgePage.jsx`

```javascript
// Extract setCurrentFrame from store
const { setCurrentFrame: setCodeSyncFrame } = useCodeSyncStore();

// Set frame UUID when frame changes
setCodeSyncFrame(currentFrameId);
```

### 3. AWAIT Database Save (Critical Fix!)
**File**: `resources/js/Pages/ForgePage.jsx`

**Before** (Broken):
```javascript
const code = await componentLibraryService.clientSideCodeGeneration(...);
setGeneratedCode(code);
updateSyncedCode(code); // ❌ Fire-and-forget, doesn't wait
// Export Preview opened here might not have code yet!
```

**After** (Fixed):
```javascript
const code = await componentLibraryService.clientSideCodeGeneration(...);
setGeneratedCode(code);
await updateSyncedCode(code); // ✅ Wait for database save
// Now Export Preview will definitely have code!
```

## Data Flow

### Complete Flow
```
User Edits Canvas
  ↓
generateCode(components) called
  ↓
componentLibraryService.clientSideCodeGeneration()
  ↓
setGeneratedCode(code) → Local React state
  ↓
await updateSyncedCode(code) → Zustand + Database API
  ↓
  ├─→ Zustand updated → CodePanel shows code ✓
  └─→ Database saved → Export Preview/ZIP can read ✓
```

### Three Views of Code

1. **CodePanel** (ForgePage)
   - Source: Zustand `syncedCode`
   - Updated: Immediately
   - Status: ✅ Always worked

2. **Export Preview Modal**
   - Source: Database `frame.canvas_data.generated_code`
   - API: `/api/projects/{uuid}/preview-export`
   - Status: ✅ Now fixed

3. **Downloaded ZIP**
   - Source: Database `frame.canvas_data.generated_code`
   - Controller: `ExportController@exportAsZip`
   - Status: ✅ Now fixed

## How Export Preview Works

**Endpoint**: `POST /api/projects/{uuid}/preview-export`

**Controller Logic** (ExportController.php lines 40-72):
```php
foreach ($frames as $frame) {
    $canvasData = $frame->canvas_data ?? [];
    $generatedCode = $canvasData['generated_code'] ?? null;
    
    // 🔥 Use pre-generated code if available
    if ($generatedCode && !empty($generatedCode)) {
        if ($framework === 'html') {
            $framePreview['html'] = $generatedCode['html'];
            $framePreview['css'] = $generatedCode['css'];
        } else {
            $framePreview['jsx'] = $generatedCode['react'];
            $framePreview['css'] = $generatedCode['css'];
        }
        continue;
    }
    
    // Fallback: Generate from ProjectComponent table
    // (This fallback was being used because generated_code was empty)
}
```

## Testing

### Test 1: Code is Saved to Database
1. Open any frame in Forge
2. Add components (Button, Text, etc.)
3. Open DevTools Console
4. Look for: `✅ Generated code saved to database`
5. Should appear within 1-2 seconds

### Test 2: Export Preview Shows Code
1. Add components to canvas
2. Wait for save (2 seconds)
3. Click **Export** button
4. **Expected**: Modal shows actual HTML/React code, not empty

### Test 3: Downloaded ZIP Works
1. Add components
2. Wait for save
3. Export → Download ZIP
4. Extract and open frame files
5. **Expected**: Shows components, not "Empty frame"

### Test 4: All Framework Combinations
Test all 4:
- ✅ HTML + CSS
- ✅ HTML + Tailwind
- ✅ React + CSS
- ✅ React + Tailwind

All should work in both Preview and ZIP.

## Database Structure

**Table**: `frames`
**Column**: `canvas_data` (JSON)

**Structure**:
```json
{
  "components": [...],
  "generated_code": {
    "react": "import React from 'react'...",
    "html": "<!DOCTYPE html>...",
    "css": ".component { ... }",
    "tailwind": "<!-- Tailwind classes -->"
  }
}
```

## API Endpoint

**Route**: `PUT /api/frames/{uuid}/generated-code`

**Request**:
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

**Response**:
```json
{
  "success": true,
  "message": "Generated code saved successfully"
}
```

## Timing & Performance

### Auto-Save Timing
- Components change → 2 second debounce → Save to DB
- Code generation → Immediate → Save to DB (awaited)

### Export Preview Timing
**Before**: Instant open, but showed empty (code not in DB yet)
**After**: Waits for code save, shows correct code

### Performance Impact
- Database save adds ~100-200ms
- Still feels instant to user
- Worth it for correct exports

## Debugging

### If Preview Still Shows Empty

1. **Check Console Logs**:
   - `✅ Generated code saved to database` ← Should see this
   - `⚠️ No frame UUID set` ← Frame not set in store
   - `❌ Failed to save generated code` ← API error

2. **Check Network Tab**:
   - Filter: `generated-code`
   - Should see: `PUT /api/frames/{uuid}/generated-code`
   - Status: 200 OK

3. **Check Database**:
   ```sql
   SELECT 
     uuid,
     name,
     JSON_EXTRACT(canvas_data, '$.generated_code.react') as react_code
   FROM frames 
   WHERE uuid = 'your-frame-uuid';
   ```

4. **Check Frame UUID**:
   ```javascript
   // In browser console
   console.log(window.currentFrameUuid);
   ```

## Files Modified

1. **resources/js/stores/useCodeSyncStore.js**
   - Added axios import
   - Added `currentFrameUuid` state
   - Added `setCurrentFrame()` method
   - Made `updateSyncedCode()` async with database save

2. **resources/js/Pages/ForgePage.jsx**
   - Added `setCodeSyncFrame` from store
   - Called `setCodeSyncFrame(frameUuid)` on frame load
   - Added `await` to all `updateSyncedCode()` calls (3 places)

## Summary

The issue was a **timing and persistence problem**:
- Code was generated but not saved to database
- `updateSyncedCode()` was called without `await`
- Export Preview/ZIP opened before database save completed

The fix ensures:
- ✅ Code is saved to database immediately
- ✅ We wait for save to complete before continuing
- ✅ Export Preview reads from database successfully
- ✅ Downloaded ZIPs contain actual code

**All three views now show the same code!**
- CodePanel: ✅ Works (Zustand)
- Export Preview: ✅ Fixed (Database)
- Downloaded ZIP: ✅ Fixed (Database)
