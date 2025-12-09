# 🔍 Panel Debug Guide - All Icons Opening Everything

## Issue
All panel icons are opening all panels instead of individual panels.

## Possible Causes

### 1. **Zustand Persistence Cache**
The ForgeStore uses `persist` middleware which saves state to localStorage. Old cached state might be interfering.

**Solution: Clear localStorage**
```javascript
// In browser console (F12):
localStorage.clear()
location.reload()
```

### 2. **React Component Re-render Loop**
Multiple panels might be triggering each other to open.

**Check with console logs:**
```javascript
// Already added to MiddlePanelControls.jsx:
🔵 handlePanelToggle called with: assets
🔵 Mapped to actualPanelId: assets-panel
🔵 Calling toggleForgePanel for: assets-panel
🔵 Panel states after toggle: {...}
```

### 3. **Event Bubbling**
Clicking one icon might be triggering parent/sibling handlers.

**Check:**
- Are icons nested inside each other?
- Is there event delegation?

---

## Debug Steps

### Step 1: Clear Cache & Test
```bash
1. Open DevTools (F12)
2. Console tab
3. Run: localStorage.clear()
4. Run: location.reload()
5. Try clicking individual panel icons
6. Check if issue persists
```

### Step 2: Check Console Logs
```bash
1. Open DevTools Console
2. Click Assets icon
3. Look for logs:
   🔵 handlePanelToggle called with: assets
   
4. If you see multiple logs or wrong panel IDs:
   → Event is being called multiple times
   → OR wrong handler is being triggered
```

### Step 3: Check Current Panel States
```javascript
// In browser console:
useForgeStore.getState().forgePanelStates

// Should show:
{
  'components-panel': false,
  'code-panel': false,
  'layers-panel': false,
  'properties-panel': false,
  'assets-panel': false
}
```

### Step 4: Test Individual Toggle
```javascript
// In browser console:
useForgeStore.getState().toggleForgePanel('assets-panel')

// Check if ONLY assets panel opens
// Then check state:
useForgeStore.getState().forgePanelStates['assets-panel']
// Should be: true
```

---

## Common Issues

### Issue 1: Old Persisted State
**Symptom:** Panels open on page load
**Fix:** Clear localStorage

### Issue 2: Multiple Event Handlers
**Symptom:** One click triggers multiple logs
**Fix:** Check for duplicate onClick handlers

### Issue 3: Wrong Panel IDs
**Symptom:** Logs show wrong panel being toggled
**Fix:** Check forgePanelMap in MiddlePanelControls

### Issue 4: Parent Component Re-opening Panels
**Symptom:** Panels close then immediately reopen
**Fix:** Check useEffect dependencies in ForgePage

---

## Testing Script

Save this to browser console to test each panel individually:

```javascript
// Test script
const store = window.useForgeStore?.getState();

console.log('=== PANEL TEST SCRIPT ===');
console.log('Current states:', store?.forgePanelStates);

// Test each panel
const testPanels = ['assets-panel', 'properties-panel', 'layers-panel', 'code-panel', 'components-panel'];

testPanels.forEach(panelId => {
  console.log(`\nTesting ${panelId}...`);
  
  // Get initial state
  const initialState = store?.forgePanelStates[panelId];
  console.log(`  Initial: ${initialState}`);
  
  // Toggle
  store?.toggleForgePanel(panelId);
  
  // Check new state
  setTimeout(() => {
    const newState = store?.forgePanelStates[panelId];
    console.log(`  After toggle: ${newState}`);
    console.log(`  ✅ Success: ${newState === !initialState}`);
  }, 100);
});
```

---

## Files to Check

### 1. **MiddlePanelControls.jsx**
```jsx
// Check if icons have correct onClick handlers
<button onClick={() => handlePanelToggle('assets')}>  // ✅ Correct
<button onClick={() => handlePanelToggle('properties')}>  // ✅ Correct

// NOT like this:
<button onClick={handlePanelToggle}>  // ❌ Wrong - no parameter
```

### 2. **useForgeStore.js**
```javascript
// Check toggleForgePanel function
toggleForgePanel: (panelId) => set((state) => {
  const newPanelStates = {
    ...state.forgePanelStates,
    [panelId]: !state.forgePanelStates[panelId]  // Toggle only this panel
  };
  // Should NOT set multiple panels to true
})
```

### 3. **ForgePage.jsx**
```javascript
// Check if any useEffect is opening panels
useEffect(() => {
  // Should NOT call toggleForgePanel for multiple panels
}, [deps]);
```

---

## Expected Console Output

### When clicking Assets icon:
```
🔵 handlePanelToggle called with: assets
🔵 Mapped to actualPanelId: assets-panel
🔵 Calling toggleForgePanel for: assets-panel
🔵 Panel states after toggle: {
  'components-panel': false,
  'code-panel': false,
  'layers-panel': false,
  'properties-panel': false,
  'assets-panel': true  ← Only this should be true
}
```

### If you see this (BAD):
```
🔵 handlePanelToggle called with: assets
🔵 handlePanelToggle called with: properties
🔵 handlePanelToggle called with: layers
← Multiple calls = event bubbling or wrong handlers
```

### Or this (BAD):
```
🔵 Panel states after toggle: {
  'components-panel': true,
  'code-panel': true,
  'layers-panel': true,
  'properties-panel': true,
  'assets-panel': true
}
← All panels true = something is opening all panels
```

---

## Quick Fixes to Try

### Fix 1: Clear Browser State
```bash
1. F12 → Console
2. localStorage.clear()
3. sessionStorage.clear()
4. location.reload()
```

### Fix 2: Check for onClick Duplication
```bash
# Search for duplicate handlers
grep -n "onClick.*handlePanelToggle" resources/js/Components/Header/Head/MiddlePanelControls.jsx
```

### Fix 3: Check Parent Container
```bash
# Look for parent div with onClick
grep -B5 "handlePanelToggle" resources/js/Components/Header/Head/MiddlePanelControls.jsx
```

---

## Next Steps

1. **Try clearing localStorage first** (most common fix)
2. **Check console logs** when clicking icons
3. **Report what you see** in the console
4. **Test with the JavaScript test script** above

---

## Questions to Answer

1. Do console logs appear when you click an icon?
2. How many times does `handlePanelToggle` get called per click?
3. What panelId is logged?
4. What are the panel states after the toggle?

**Please try clearing localStorage first and let me know what console logs you see!**
