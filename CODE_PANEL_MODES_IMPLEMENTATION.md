# 🎨 Code Panel Multi-Mode System Implementation

## Overview
Implementing a 4-mode code panel system where the code panel can switch between different display modes, all controlled by the same Code icon in the header.

---

## 🎯 **The Four Modes**

### **1. Bottom Panel Mode** ⬇️
- Icon: `AlignBottom`
- Position: Bottom of screen
- Behavior: Slides up from bottom
- Use: Quick code viewing while working
- **File:** `BottomCodePanel.jsx` (already exists)

### **2. Side Panel Mode** ➡️
- Icon: `Maximize`
- Position: Right sidebar
- Behavior: Docked to right side
- Use: Keep code visible while editing
- **File:** `SidebarCodePanel.jsx` (already exists)

### **3. Modal Mode** ⬜
- Icon: `Square`
- Position: Centered overlay
- Behavior: Modal dialog over canvas
- Use: Focused code viewing
- **File:** `ModalCodePanel.jsx` (already exists)

### **4. Window Mode** 🪟 **NEW!**
- Icon: `ExternalLink`
- Position: Floating window
- Behavior: Draggable & resizable window
- Use: Multi-monitor setup, flexible positioning
- **File:** `WindowCodePanel.jsx` ✅ **CREATED**

---

## 🎮 **Control System**

### **Single Icon Control:**
- One Code icon in `MiddlePanelControls` controls all modes
- Clicking opens the code panel in current mode
- Mode is stored in state: `codePanelPosition`

### **Mode Switching:**
Each code panel header has 4 buttons to switch between modes:
```
[⬇️ Bottom] [➡️ Side] [⬜ Modal] [🪟 Window]
```

- Active mode button is highlighted (primary color)
- Clicking switches to that mode instantly
- Code content persists across mode switches

---

## 📋 **Implementation Status**

### **Phase 1: Create WindowCodePanel** ✅
- [x] Created `WindowCodePanel.jsx`
- [x] Draggable functionality
- [x] Resizable functionality
- [x] Maximize/restore
- [x] Monaco Editor integration
- [x] Mode switching buttons in header

### **Phase 2: Add Mode Buttons to BottomCodePanel** ✅
- [x] Import mode switching icons
- [x] Add 4 mode buttons to header
- [x] Highlight active mode (bottom)
- [x] Connect to `setCodePanelPosition`

### **Phase 3: Add Mode Buttons to Other Panels** 🔄
- [ ] Add to `SidebarCodePanel.jsx`
- [ ] Add to `ModalCodePanel.jsx`
- [ ] Ensure consistent button layout

### **Phase 4: Integrate into ForgePage** 🔄
- [ ] Import `WindowCodePanel`
- [ ] Add conditional rendering for window mode
- [ ] Pass props to all code panels
- [ ] Handle mode switching logic

### **Phase 5: Update Header Control** 🔄
- [ ] Ensure Code icon toggles current mode
- [ ] Add mode persistence
- [ ] Handle edge cases

---

## 🎨 **UI Layout**

### **All Code Panel Headers Will Have:**
```
┌────────────────────────────────────────────────────────┐
│ Code Panel  [⬇️] [➡️] [⬜] [🪟] | [−] [×]              │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Monaco Editor Content                                 │
│                                                         │
└────────────────────────────────────────────────────────┘

Legend:
[⬇️] = Bottom mode (AlignBottom icon)
[➡️] = Side mode (Maximize icon)
[⬜] = Modal mode (Square icon)
[🪟] = Window mode (ExternalLink icon)
[−] = Minimize
[×] = Close
```

**Active mode is highlighted in primary color**

---

## 🔧 **Technical Details**

### **State Management:**
```jsx
const [codePanelPosition, setCodePanelPosition] = useState('bottom')
// Values: 'bottom' | 'right' | 'modal' | 'window'
```

### **Conditional Rendering in ForgePage:**
```jsx
{codePanelPosition === 'bottom' && <BottomCodePanel />}
{codePanelPosition === 'right' && <SidebarCodePanel />}
{codePanelPosition === 'modal' && <ModalCodePanel />}
{codePanelPosition === 'window' && <WindowCodePanel />}
```

### **Props Shared Across All Modes:**
```jsx
- selectedComponentCode
- activeCodeTab
- setActiveCodeTab
- generatedCode
- onClose
- setCodePanelPosition
- currentMode (for highlighting active button)
```

---

## 💡 **Features**

### **Common Features (All Modes):**
- ✅ Monaco Editor
- ✅ Syntax highlighting
- ✅ Copy code
- ✅ Download code
- ✅ Multiple tabs (React/HTML/CSS)
- ✅ Theme support (light/dark)
- ✅ Mode switching buttons

### **Window Mode Specific:**
- ✅ Draggable anywhere
- ✅ Resizable from corners
- ✅ Maximize/restore
- ✅ Floating above canvas
- ✅ Z-index: 9999 (always on top)

---

## 🎯 **Use Cases**

### **Bottom Panel:**
- Quick glance at code while designing
- Default mode for most users
- Mobile-friendly

### **Side Panel:**
- Keep code visible while editing components
- Split-screen workflow
- Desktop users

### **Modal:**
- Focused code review
- Takes center stage
- Blocks canvas interaction

### **Window:**
- Multi-monitor setup
- Position code on second screen
- Flexible positioning
- Advanced users

---

## 📊 **Files Modified/Created**

### **Created (1):**
1. ✅ `resources/js/Components/Forge/WindowCodePanel.jsx` (252 lines)

### **Modified (4):**
2. ✅ `resources/js/Components/Forge/BottomCodePanel.jsx` (added mode buttons)
3. 🔄 `resources/js/Components/Forge/SidebarCodePanel.jsx` (needs mode buttons)
4. 🔄 `resources/js/Components/Forge/ModalCodePanel.jsx` (needs mode buttons)
5. 🔄 `resources/js/Pages/ForgePage.jsx` (needs window mode integration)

---

## 🔄 **Next Steps**

1. **Add mode buttons to SidebarCodePanel**
   - Same 4 buttons
   - Highlight 'right' mode as active

2. **Add mode buttons to ModalCodePanel**
   - Same 4 buttons
   - Highlight 'modal' mode as active

3. **Import WindowCodePanel in ForgePage**
   - Add conditional rendering
   - Pass necessary props

4. **Test mode switching**
   - Verify smooth transitions
   - Check code persistence
   - Test all button combinations

5. **Polish & refinement**
   - Consistent styling
   - Animation transitions
   - Edge case handling

---

## ✅ **Current Progress**

- ✅ WindowCodePanel created
- ✅ BottomCodePanel updated with mode buttons
- 🔄 SidebarCodePanel needs mode buttons (NEXT)
- 🔄 ModalCodePanel needs mode buttons
- 🔄 ForgePage integration
- 🔄 Testing & polish

**Status: 30% Complete** 🚧

---

## 🎉 **Expected Result**

When complete, users will be able to:
1. Click Code icon to toggle code panel
2. See code panel in current mode
3. Click mode buttons to switch between 4 modes
4. Code content persists across mode switches
5. Each mode has appropriate behavior
6. Smooth transitions between modes

All controlled by one icon, with flexible viewing options! 🎨
