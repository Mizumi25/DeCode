# SourcePage Lock Button Debug Guide

## Issue
Lock button in SourcePage header doesn't work when clicked (Editor role user).

## Possible Causes

### 1. Button Not Getting Clicked
**Symptoms**: Click does nothing, no console logs

**Debug**:
```javascript
// In SourcePage, open console and check:
const frameUuid = 'your-frame-uuid'; // Get from URL
const lockStore = useFrameLockStore.getState();
console.log('Lock status for frame:', lockStore.getLockStatus(frameUuid));
```

### 2. Role Not Fetching
**Symptoms**: Button doesn't show or shows but is disabled

**Debug**:
```javascript
// Check if role is fetched:
fetch('/api/workspaces/YOUR_WORKSPACE_UUID/roles/my-role', {
  headers: { 'Accept': 'application/json' }
})
.then(r => r.json())
.then(data => console.log('My role:', data));
```

### 3. CurrentFrame Not Passed
**Symptoms**: Button doesn't render at all

**Debug in SourcePage console**:
```javascript
// Check if LeftSection receives currentFrame:
const header = document.querySelector('header');
console.log('Header exists:', !!header);

// Check props
const { props } = usePage();
console.log('Frame from props:', props.frame);
console.log('Frame UUID:', props.frame?.uuid);
```

### 4. Lock Status Not Loading
**Symptoms**: Button shows but click does nothing

**Debug**:
```javascript
const lockStore = useFrameLockStore.getState();
console.log('All lock statuses:', lockStore.lockStatuses);
console.log('Is loading:', lockStore.isLoading);
```

## Quick Test

### Test if button is receiving clicks:
1. Open SourcePage
2. Open browser console (F12)
3. Add temporary console.log in button click:

Manually test by running in console:
```javascript
// Get the lock button
const lockButton = document.querySelector('[title*="Lock frame"]') || 
                   document.querySelector('[title*="Unlock frame"]');

if (lockButton) {
  console.log('Lock button found!');
  console.log('Is disabled:', lockButton.disabled);
  console.log('Classes:', lockButton.className);
  
  // Try clicking programmatically
  lockButton.click();
} else {
  console.log('Lock button NOT found in DOM');
}
```

## Expected Behavior

### When Working Correctly:
1. Click lock button → Shows loading spinner
2. API call made to toggle lock
3. Button updates to show locked/unlocked state
4. Toast notification appears
5. Forge page lock button syncs

### When Not Working:
- Nothing happens on click
- No loading spinner
- No API call
- No toast
- No console errors (strange!)

## Common Issues

### Issue 1: Role = null
**Cause**: Workspace not loaded or API call failed

**Fix**: Check `currentWorkspace` exists:
```javascript
useWorkspaceStore.getState().currentWorkspace
// Should return: { id, uuid, name, ... }
```

### Issue 2: frameUuid = undefined
**Cause**: Header not receiving currentFrame prop

**Fix**: Already applied in SourcePage headerProps

### Issue 3: Button Disabled
**Cause**: `!canToggle` or `isLoading` is true

**Fix**: Check lock status:
```javascript
const lockStatus = useFrameLockStore.getState().getLockStatus(frameUuid);
console.log('Can toggle:', lockStatus.can_lock || lockStatus.can_unlock);
```

### Issue 4: Click Event Not Firing
**Cause**: Z-index or pointer-events issue

**Fix**: Check computed styles:
```javascript
const btn = document.querySelector('[title*="Lock"]');
console.log('Pointer events:', getComputedStyle(btn).pointerEvents);
console.log('Z-index:', getComputedStyle(btn).zIndex);
```

## Comparison: ForgePage vs SourcePage

### ForgePage (Working):
- ✅ Lock button visible
- ✅ Click works
- ✅ Updates state
- ✅ Toast appears

### SourcePage (Not Working):
- ✅ Lock button visible (confirmed)
- ❌ Click doesn't work
- ❌ No state update
- ❌ No toast

This suggests the button renders but the click handler isn't firing or the handler is failing silently.

## Action Items

1. **Check browser console** for any errors when clicking
2. **Check Network tab** - does API call happen?
3. **Check if button is disabled** - `disabled` attribute?
4. **Verify role** - Is it owner/editor?
5. **Check currentFrame** - Is it passed to LeftSection?

## Test Script

Run this in SourcePage console:
```javascript
// Comprehensive debug
const debug = {
  workspace: useWorkspaceStore.getState().currentWorkspace,
  lockStore: useFrameLockStore.getState(),
  frameProps: usePage().props.frame,
  button: document.querySelector('[title*="Lock"]'),
};

console.table({
  'Workspace UUID': debug.workspace?.uuid,
  'Frame UUID': debug.frameProps?.uuid,
  'Button Found': !!debug.button,
  'Button Disabled': debug.button?.disabled,
  'Lock Status Count': Object.keys(debug.lockStore.lockStatuses).length,
});

// Try to get role
fetch(`/api/workspaces/${debug.workspace?.uuid}/roles/my-role`, {
  headers: { 'Accept': 'application/json' }
})
.then(r => r.json())
.then(data => console.log('✅ My Role:', data.data?.role))
.catch(e => console.error('❌ Role fetch failed:', e));
```

This will show you exactly what's wrong!
