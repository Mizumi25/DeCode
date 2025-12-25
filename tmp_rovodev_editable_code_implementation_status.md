# Editable Code Panels - Implementation Status

## ✅ COMPLETED (Steps 1-3)

### 1. State Tracking Added ✅
**File:** `resources/js/Pages/ForgePage.jsx`
- Added `editedCode` state to track user edits
- Added `isCodeDirty` to track unsaved changes
- Added `isSavingCode` to track save operation status
- Added `useEffect` to sync `editedCode` with `generatedCode`

### 2. Handler Functions Implemented ✅
**File:** `resources/js/Pages/ForgePage.jsx`
- `handleCodeEdit`: Now updates `editedCode` and marks dirty state
- `handleSaveCode`: New function that:
  - Imports ReverseCodeParserService dynamically
  - Parses edited code back to components
  - Updates canvas with parsed components
  - Regenerates code to ensure sync
  - Shows success/error messages

### 3. Save Icon Imported ✅
**File:** `resources/js/Pages/ForgePage.jsx`
- Added `Save` icon import from lucide-react

## 🔄 IN PROGRESS (Steps 4-6)

### 4. Update Code Panel Props (Partially Done)

Need to find and update these props for ALL code panel usages:

```javascript
// Change from:
generatedCode={generatedCode}

// Change to:
generatedCode={editedCode}

// Add these new props:
handleSaveCode={handleSaveCode}
isCodeDirty={isCodeDirty}
isSavingCode={isSavingCode}
```

**Locations found:**
- Line 3488: SidebarCodePanel (WindowCodePanel?)
- Line 3904: BottomCodePanel  
- Line 4129: ModalCodePanel

### 5. Update Code Panel Components

Each code panel component needs:

#### A. Accept New Props
```javascript
const XxxCodePanel = ({
  // ... existing props
  handleSaveCode,    // NEW
  isCodeDirty,       // NEW
  isSavingCode,      // NEW
  // ... rest
}) => {
```

#### B. Add Save Button (in toolbar, after Regenerate)
```jsx
<button
  onClick={() => handleSaveCode && handleSaveCode()}
  disabled={!isCodeDirty || isSavingCode}
  className="p-2 rounded-lg transition-all hover:scale-110 disabled:opacity-50"
  style={{ 
    color: isCodeDirty ? 'var(--color-success)' : 'var(--color-text)',
    backgroundColor: isCodeDirty ? 'var(--color-success-soft)' : 'var(--color-bg-muted)'
  }}
  title={isCodeDirty ? "Save code changes to canvas" : "No changes to save"}
>
  {isSavingCode ? (
    <Loader2 className="w-4 h-4 animate-spin" />
  ) : (
    <Save className="w-4 h-4" />
  )}
</button>
```

#### C. Add Dirty Badge (near panel title)
```jsx
{isCodeDirty && (
  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
    style={{ 
      backgroundColor: 'var(--color-warning-soft)',
      color: 'var(--color-warning)'
    }}
  >
    <span className="w-2 h-2 rounded-full animate-pulse" 
      style={{ backgroundColor: 'var(--color-warning)' }} 
    />
    Unsaved
  </div>
)}
```

#### D. Import Icons (if not already present)
```javascript
import { Save, Loader2 } from 'lucide-react';
```

**Files to update:**
1. ✅ `resources/js/Components/Forge/BottomCodePanel.jsx` - DONE (props passed)
2. ⏳ `resources/js/Components/Forge/SidebarCodePanel.jsx` - Needs props + UI
3. ⏳ `resources/js/Components/Forge/ModalCodePanel.jsx` - Needs props + UI
4. ⏳ `resources/js/Components/Forge/WindowCodePanel.jsx` - Needs props + UI

## 📝 NEXT STEPS

### Immediate Actions Needed:

1. **Update ForgePage.jsx prop passing** (3 locations):
   ```bash
   # Lines to update: 3488, 3904, 4129
   # Change: generatedCode={generatedCode}
   # To: generatedCode={editedCode}
   # Add: handleSaveCode, isCodeDirty, isSavingCode props
   ```

2. **Update BottomCodePanel.jsx** - Add Save button and badge UI

3. **Update SidebarCodePanel.jsx** - Add props, Save button, and badge

4. **Update ModalCodePanel.jsx** - Add props, Save button, and badge

5. **Update WindowCodePanel.jsx** - Add props, Save button, and badge

### Testing Checklist:

- [ ] Open ForgePage with components on canvas
- [ ] Open Code Panel (any mode)
- [ ] Verify code shows in Monaco editor
- [ ] Edit the code
- [ ] Verify "Unsaved" badge appears
- [ ] Verify Save button becomes active (green)
- [ ] Click Save button
- [ ] Verify spinner shows during save
- [ ] Verify canvas updates with changes
- [ ] Verify "Unsaved" badge disappears after save
- [ ] Test all 4 panel modes (Bottom, Sidebar, Modal, Window)

## 🎯 Expected Behavior

### User Flow:
1. User drops components on canvas ✅
2. User opens code panel ✅
3. Code is generated and shown ✅
4. User edits code in Monaco editor ✅
5. "Unsaved" badge appears 🔄
6. Save button turns green 🔄
7. User clicks Save 🔄
8. Code is parsed → Components updated → Canvas refreshes 🔄
9. Badge disappears, button returns to normal 🔄

### Visual States:
- 🔵 **Clean State**: No badge, gray Save button (disabled)
- 🟡 **Dirty State**: Yellow "Unsaved" badge, green Save button (enabled)
- 🔄 **Saving State**: Spinner in Save button
- ✅ **Saved State**: Returns to clean state

## 📊 Implementation Progress

**Overall: 60% Complete**
- ✅ Backend Logic: 100% (State + Handlers)
- 🔄 Frontend Props: 33% (1 of 3 locations)
- ⏳ UI Components: 0% (0 of 4 panels updated)

## 🚀 To Complete Implementation

Run these commands or apply these changes:

1. Update ForgePage.jsx line ~3488, ~3904, ~4129
2. Update 4 code panel components with Save UI
3. Test all panel modes
4. Clean up this temp file

Estimated time to complete: ~30 minutes

