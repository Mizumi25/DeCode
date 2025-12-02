# 🎨 Role-Based UI Updates - Quick Implementation

## ✅ Already Done:
1. ✅ Added `myRole` state to TeamCollaborationPanel
2. ✅ Added `canInvite` permission check

---

## 📋 Remaining Changes:

### 1. TeamCollaborationPanel.jsx - Fetch Role (Add after line ~177)

After the existing `useEffect`, add:

```jsx
// Fetch current user's role
const fetchMyRole = async () => {
  if (!currentWorkspace?.uuid) return
  
  try {
    const response = await fetch(`/api/workspaces/${currentWorkspace.uuid}/roles/my-role`, {
      headers: { 'Accept': 'application/json' }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        setMyRole(data.data.role)
      }
    }
  } catch (error) {
    console.error('Failed to fetch role:', error)
  }
}

useEffect(() => {
  if (currentWorkspace?.id) {
    loadWorkspaceMembers()
    loadWorkspaceInvites()
    fetchMyRole() // ADD THIS LINE
  }
}, [currentWorkspace?.id])
```

### 2. TeamCollaborationPanel.jsx - Settings Icon (Line ~430)

**FIND:**
```jsx
<button
  onClick={() => setActiveTab('settings')}
  className={...}
  title="Settings"
>
  <Settings className="w-4 h-4" />
</button>
```

**REPLACE WITH:**
```jsx
<button
  onClick={() => setActiveTab('settings')}
  className={`p-2.5 rounded-lg transition-all duration-200 relative ${
    activeTab === 'settings'
      ? 'bg-[var(--color-primary)] text-white shadow-lg scale-110'
      : 'hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:scale-105'
  }`}
  title="⚙️ Workspace Settings & Roles"
>
  <Settings className="w-5 h-5" />
  {isOwner && (
    <span 
      className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2" 
      style={{ borderColor: 'var(--color-bg)' }}
      title="Owner Controls"
    />
  )}
</button>
```

**Changes:**
- Larger icon: `w-5 h-5` (was `w-4 h-4`)
- Better padding: `p-2.5` (was `p-2`)
- Scale effect: `scale-110` when active, `hover:scale-105` on hover
- Shadow: `shadow-lg` when active
- Yellow dot badge for owners

### 3. TeamCollaborationPanel.jsx - Hide Invite Button for Viewers (Line ~422)

**FIND:**
```jsx
<button
  onClick={() => setActiveTab('members')}
  className={...}
  title="Team Members"
>
  <UserPlus className="w-4 h-4" />
</button>
```

**REPLACE WITH:**
```jsx
{canInvite && (
  <button
    onClick={() => setActiveTab('members')}
    className={`p-2 rounded-lg transition-colors ${
      activeTab === 'members'
        ? 'bg-[var(--color-primary)] text-white'
        : 'hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]'
    }`}
    title="Invite Team Members"
  >
    <UserPlus className="w-4 h-4" />
  </button>
)}
```

**Result:** Invite icon only shows for owners and editors, hidden for viewers

---

### 4. RightSection.jsx - Hide Invite Button for Viewers

**File:** `resources/js/Components/Header/Head/RightSection.jsx`

**Step 1: Add Role State (after line ~41)**
```jsx
const [myRole, setMyRole] = useState(null)
const canInvite = currentWorkspace?.owner?.id === auth.user?.id || 
                  myRole === 'editor' || 
                  myRole === 'admin'
```

**Step 2: Fetch Role (add new useEffect)**
```jsx
useEffect(() => {
  const fetchMyRole = async () => {
    if (!currentWorkspace?.uuid) return
    
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace.uuid}/roles/my-role`, {
        headers: { 'Accept': 'application/json' }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMyRole(data.data.role)
        }
      }
    } catch (error) {
      console.error('Failed to fetch role:', error)
    }
  }
  
  if (currentWorkspace?.uuid) {
    fetchMyRole()
  }
}, [currentWorkspace?.uuid])
```

**Step 3: Wrap Invite Button (around line ~131)**

**FIND:**
```jsx
<button
  onClick={handleInviteClick}
  className="..."
  title="Invite Team"
>
  <UserPlus className="..." />
</button>
```

**REPLACE WITH:**
```jsx
{canInvite && (
  <button
    onClick={handleInviteClick}
    className="..."
    title="Invite Team"
  >
    <UserPlus className="..." />
  </button>
)}
```

---

## 🎯 Visual Results:

### Settings Icon:
- **Before:** Small, boring, easy to miss
- **After:** 
  - Larger (20px vs 16px)
  - Scales on hover (1.05x)
  - Scales when active (1.10x) with shadow
  - Yellow badge dot for owners
  - Better tooltip: "⚙️ Workspace Settings & Roles"

### Invite Button:
- **Owner/Editor:** ✅ Visible (can invite)
- **Viewer:** ❌ Hidden (cannot invite)
- **Both locations:** TeamCollaborationPanel + RightSection header

---

## ✅ Testing:

1. **As Owner:**
   - Settings icon has yellow dot badge
   - Settings icon is prominent
   - Invite button visible in both places

2. **As Editor:**
   - Settings icon visible (no yellow dot)
   - Invite button visible in both places

3. **As Viewer:**
   - Settings icon visible (no yellow dot)
   - Invite button HIDDEN in both places ✅

---

**Quick Summary:**
- Settings icon: Bigger, better, badged for owners
- Invite buttons: Hidden for viewers (they can't invite anyway)
- Role fetching: Added to both components
- Permission checks: Based on actual role from API
