# Editable Code Panels Implementation Guide

## ✅ ANALYSIS COMPLETE - FEATURE IS POSSIBLE!

Your system already has everything needed:
- ✅ Monaco Editor (editable)
- ✅ ReverseCodeParserService (for parsing code back to components)
- ✅ Component generation and state management
- ✅ Real-time collaboration system

## Implementation Steps

### 1. Add State Tracking to ForgePage.jsx

```javascript
// Add these states after line 328 (after generatedCode state):

// 🔥 NEW: Track edited code and dirty state
const [editedCode, setEditedCode] = useState({ html: '', css: '', react: '', tailwind: '' })
const [isCodeDirty, setIsCodeDirty] = useState(false)
const [isSavingCode, setIsSavingCode] = useState(false)

// 🔥 NEW: Sync editedCode with generatedCode when it changes
useEffect(() => {
  setEditedCode(generatedCode);
  setIsCodeDirty(false);
}, [generatedCode]);
```

### 2. Update handleCodeEdit Function

Find the existing `handleCodeEdit` function (around line 2931) and replace it with:

```javascript
const handleCodeEdit = useCallback((newCode, codeType) => {
  console.log('📝 Code edited:', codeType, 'Length:', newCode?.length);
  
  // Update edited code state
  setEditedCode(prev => ({
    ...prev,
    [codeType]: newCode
  }));
  
  // Mark as dirty if different from generated
  const isDifferent = newCode !== generatedCode[codeType];
  setIsCodeDirty(isDifferent);
}, [generatedCode]);
```

### 3. Add Save Handler Function

Add this new function after `handleCodeEdit`:

```javascript
const handleSaveCode = useCallback(async () => {
  if (!isCodeDirty || isSavingCode) return;
  
  setIsSavingCode(true);
  
  try {
    console.log('💾 Saving edited code to canvas...');
    
    // Import the ReverseCodeParserService
    const reverseCodeParserService = (await import('@/Services/ReverseCodeParserService')).default;
    
    // Determine which code to parse based on codeStyle
    let codeToParse = '';
    let codeType = '';
    
    if (codeStyle.includes('react')) {
      codeToParse = editedCode.react;
      codeType = 'react';
    } else if (codeStyle.includes('html')) {
      codeToParse = editedCode.html;
      codeType = 'html';
    }
    
    // Parse code back to components
    const parsedComponents = await reverseCodeParserService.parseCodeToComponents(
      codeToParse,
      codeType,
      codeStyle
    );
    
    console.log('✅ Parsed components:', parsedComponents);
    
    // Update canvas components
    setFrameCanvasComponents(prev => ({
      ...prev,
      [currentFrame]: parsedComponents
    }));
    
    // Regenerate code from new components to ensure sync
    await generateCode(parsedComponents);
    
    // Mark as clean
    setIsCodeDirty(false);
    
    // Show success notification
    console.log('🎉 Code saved successfully to canvas!');
    
  } catch (error) {
    console.error('❌ Failed to save code:', error);
    alert('Failed to parse code. Please check for syntax errors.');
  } finally {
    setIsSavingCode(false);
  }
}, [isCodeDirty, isSavingCode, editedCode, codeStyle, currentFrame, generateCode]);
```

### 4. Update Code Panel Components

#### A. BottomCodePanel.jsx

Add Save button in the toolbar (after the Regenerate button around line 815):

```javascript
<button
  onClick={() => handleSaveCode && handleSaveCode()}
  disabled={!isCodeDirty || isSavingCode}
  className="p-2 rounded-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
  style={{ 
    color: isCodeDirty ? 'var(--color-success)' : 'var(--color-text)',
    backgroundColor: isCodeDirty ? 'var(--color-success-soft)' : 'var(--color-bg-muted)',
    boxShadow: isCodeDirty ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
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

Add dirty indicator badge near the panel title (around line 467):

```javascript
{isCodeDirty && (
  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
    style={{ 
      backgroundColor: 'var(--color-warning-soft)',
      color: 'var(--color-warning)'
    }}
  >
    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-warning)' }} />
    Unsaved
  </div>
)}
```

Update the props passed to BottomCodePanel:

```javascript
<BottomCodePanel
  // ... existing props
  handleCodeEdit={handleCodeEdit}
  handleSaveCode={handleSaveCode}
  isCodeDirty={isCodeDirty}
  isSavingCode={isSavingCode}
  editedCode={editedCode}
  // ... rest of props
/>
```

#### B. Apply same changes to:
- `SidebarCodePanel.jsx`
- `ModalCodePanel.jsx`
- `WindowCodePanel.jsx`

### 5. Import Icons

Add to the imports at the top of files that need them:

```javascript
import { Save, Loader2 } from 'lucide-react';
```

### 6. Update Editor to Use editedCode

In each code panel, change the Editor value prop from:

```javascript
value={generatedCode[activeCodeTab] || ''}
```

To:

```javascript
value={editedCode[activeCodeTab] || generatedCode[activeCodeTab] || ''}
```

## Testing the Feature

1. **Open ForgePage** with a frame that has components
2. **Open Code Panel** (any mode - bottom, sidebar, modal, window)
3. **Edit the code** - Monaco editor allows editing
4. **Observe "Unsaved" badge** appears
5. **Click Save button** - code is parsed and applied to canvas
6. **Verify canvas updates** with the changes from edited code

## Expected Behavior

### User Flow:
1. User sees generated code in Monaco editor ✅
2. User edits code (add/remove/modify components) ✅
3. "Unsaved" badge appears, Save button becomes active ✅
4. User clicks Save ✅
5. Code is parsed back to component structure ✅
6. Canvas updates with new components ✅
7. Code is regenerated to ensure sync ✅
8. "Unsaved" badge disappears ✅

### Visual Indicators:
- 🟡 **Yellow "Unsaved" badge** - Code has been edited
- 🟢 **Green Save button** - Ready to save changes
- 🔄 **Spinner** - Saving in progress
- 🔵 **Blue Save button** - No changes to save (disabled)

## Advanced Features (Future)

1. **Validation** - Show syntax errors before allowing save
2. **Preview** - Preview changes before applying to canvas
3. **Undo** - Revert edited code back to generated
4. **Diff View** - Show what changed between generated and edited code
5. **Auto-save** - Optionally save after X seconds of inactivity

## Notes

- The `ReverseCodeParserService` already exists and can parse React, HTML, and CSS
- Parsing is limited to the structure it knows how to handle
- Complex custom code may not parse perfectly - this is expected
- The system will work best with code that follows the generator's patterns

## File Changes Required

1. **resources/js/Pages/ForgePage.jsx** - Add states and handlers
2. **resources/js/Components/Forge/BottomCodePanel.jsx** - Add Save button and badge
3. **resources/js/Components/Forge/SidebarCodePanel.jsx** - Add Save button and badge
4. **resources/js/Components/Forge/ModalCodePanel.jsx** - Add Save button and badge  
5. **resources/js/Components/Forge/WindowCodePanel.jsx** - Add Save button and badge

Total: ~200 lines of code across 5 files

## Conclusion

This feature is **100% implementable** with your current architecture. The ReverseCodeParserService already exists and just needs to be connected to the UI. The implementation is straightforward and follows React best practices.

Would you like me to implement this for you?
