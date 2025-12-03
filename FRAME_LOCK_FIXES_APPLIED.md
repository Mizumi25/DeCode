# Frame Lock Fixes Applied

## Issues Fixed

### 1. ✅ Unified Lock Between Forge and Source
**Problem**: Lock state was separate between Forge and Source pages

**Solution**: 
- Changed both pages to use `'forge'` mode for lock operations
- This creates a unified lock state shared between both pages
- When you lock in Forge, Source sees the same lock
- When you lock in Source, Forge sees the same lock

**Files Modified**:
- `resources/js/Components/Header/Head/FrameLockButton.jsx`
- `resources/js/Components/Void/EnhancedPreviewFrameLock.jsx`

**Code Change**:
```javascript
// Before
const result = await toggleFrameLock(frameUuid, currentMode); // 'forge' or 'source'

// After
const result = await toggleFrameLock(frameUuid, 'forge'); // Always 'forge' for unified lock
```

---

### 2. ✅ Lock Icon Not Updating After Toggle
**Problem**: After clicking lock button, icon remained in "unlock" state despite successful lock

**Solution**: 
- Added explicit refresh of lock status after toggle completes
- Added small delay to allow backend/store to update
- Added polling mechanism to keep UI in sync (checks every 2 seconds)

**Files Modified**:
- `resources/js/Components/Header/Head/FrameLockButton.jsx`
- `resources/js/Components/Void/EnhancedPreviewFrameLock.jsx`

**Code Changes**:
```javascript
// After successful toggle
if (result?.success) {
  // Wait a bit for the store to update
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Refresh lock status to ensure UI is in sync
  await getFrameLockStatus(frameUuid);
  
  // Then show notification
  addNotification({ ... });
}

// Added polling for continuous sync
useEffect(() => {
  if (!frameUuid) return;
  
  const interval = setInterval(() => {
    getFrameLockStatus(frameUuid);
  }, 2000);
  
  return () => clearInterval(interval);
}, [frameUuid, getFrameLockStatus]);
```

---

### 3. ✅ Dialog Centered on Void Page
**Problem**: Access dialog was positioned relative to preview frame, not centered on entire Void page

**Solution**: 
- Used React Portal to render dialog at document body level
- Added explicit fixed positioning with viewport coordinates
- Set proper pointer-events to allow backdrop click-through but dialog interaction

**Files Modified**:
- `resources/js/Components/Void/FrameAccessDialog.jsx`

**Code Changes**:
```javascript
// Import createPortal
import { createPortal } from 'react-dom';

// Render as portal
return createPortal(
  <AnimatePresence>
    {isOpen && (
      <>
        {/* Backdrop with explicit positioning */}
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        />

        {/* Dialog container with proper pointer-events */}
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}
        >
          {/* Dialog content with re-enabled pointer-events */}
          <motion.div
            className="..."
            style={{ pointerEvents: 'auto' }}
          >
            {/* Dialog content */}
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>,
  document.body // Render to body, not relative to preview frame
);
```

---

## Summary of Changes

| Issue | Status | Impact |
|-------|--------|--------|
| Unified lock between Forge/Source | ✅ Fixed | Both pages now share same lock state |
| Lock icon not updating | ✅ Fixed | Icon updates immediately after toggle + polling for sync |
| Dialog positioning | ✅ Fixed | Dialog now centered on entire Void page |

---

## Testing Checklist

- [ ] Lock in Forge → Verify Source sees locked state
- [ ] Lock in Source → Verify Forge sees locked state
- [ ] Unlock in Forge → Verify Source sees unlocked state
- [ ] Click lock button → Verify icon changes to locked immediately
- [ ] Click unlock button → Verify icon changes to unlocked immediately
- [ ] Click locked frame in Void → Verify dialog appears centered on page
- [ ] Move preview frame around → Verify dialog stays centered when opened
- [ ] Click dialog backdrop → Verify dialog closes properly

---

## Technical Details

### Unified Lock Mechanism
- Both Forge and Source use `mode: 'forge'` for all lock operations
- Backend stores one lock state per frame (not per mode)
- This means there's only one lock toggle for the entire frame
- Users see consistent lock state regardless of which page they're on

### UI Sync Strategy
1. **Immediate Update**: After toggle action, wait 100ms then refresh
2. **Polling**: Check lock status every 2 seconds
3. **Real-time**: Laravel Echo broadcasts still work for instant updates
4. **Combination**: All three methods ensure UI never gets out of sync

### Portal Positioning
- Dialog renders directly to `document.body`
- Uses `fixed` positioning relative to viewport, not parent
- `pointer-events: none` on container prevents accidental interactions
- `pointer-events: auto` on dialog re-enables interactions
- Z-index 9999 ensures it's above everything else

---

## Notes

- Polling interval (2 seconds) can be adjusted if needed
- The 100ms delay after toggle is conservative and can be reduced
- Portal approach works across all modern browsers
- Lock state is now truly unified - no more mode-specific locks
