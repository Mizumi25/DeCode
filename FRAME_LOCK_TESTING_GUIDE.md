# Frame Lock Feature - Testing Guide

## Prerequisites
- Multiple user accounts with different workspace roles (Owner, Editor, Viewer)
- Multiple browser windows/tabs or use incognito mode
- A workspace with at least one project and frame

## Test Scenarios

### Scenario 1: Editor Locks Frame from Forge Page
**Setup**: 
- User A (Editor) in Forge page
- User B (Editor) in Source page of same frame
- User C (Owner) in Void page viewing preview frame

**Steps**:
1. User A clicks the lock button in the header (left section)
2. Verify User A sees toast: "Frame locked - You have locked this frame in forge mode"
3. Verify lock button shows locked state (Lock icon, primary color background)
4. Switch to User B's browser
5. Verify User B sees toast: "Frame locked by [User A]"
6. Verify User B's lock button shows locked state
7. Switch to User C's browser
8. Verify preview frame lock icon updates to locked state

**Expected Results**:
- ✅ Lock button works in header
- ✅ Toast notifications appear
- ✅ Real-time sync between Forge and Source
- ✅ Preview frame updates in Void page

---

### Scenario 2: Editor Attempts to Enter Locked Frame from Void
**Setup**:
- User A (Editor) has locked a frame from inside
- User B (Editor) is in Void page

**Steps**:
1. User B clicks the locked preview frame
2. Verify dialog appears: "Frame is Locked"
3. Verify message shows who locked it: "locked by [User A]"
4. User B types optional message: "Need to make urgent changes"
5. User B clicks "Request Access"
6. Verify dialog closes
7. Verify toast appears: "Access Requested - Your request has been sent"

**Expected Results**:
- ✅ Click on locked frame triggers dialog
- ✅ Dialog shows correct information
- ✅ Request can be sent with message
- ✅ Toast confirmation appears

---

### Scenario 3: Owner Bypasses Lock from Void
**Setup**:
- User A (Editor) has locked a frame from inside
- User B (Owner) is in Void page

**Steps**:
1. User B clicks the locked preview frame
2. Verify dialog appears: "Frame Locked by Team Member"
3. Verify dialog shows owner override message
4. User B clicks "Enter Frame"
5. Verify User B navigates to Forge/Source page
6. Switch to User A's browser
7. Verify User A sees toast: "Workspace owner is entering the frame"

**Expected Results**:
- ✅ Owner sees different dialog than Editor
- ✅ Owner can bypass lock
- ✅ Users inside get notified of owner entry
- ✅ Frame remains locked

---

### Scenario 4: Owner Unlocks from Void Page
**Setup**:
- Frame is locked by Editor from inside
- User A (Owner) is in Void page

**Steps**:
1. User A clicks lock icon on preview frame
2. Verify confirmation dialog appears: "Unlock Frame"
3. User A clicks "Unlock"
4. Verify lock icon changes to unlocked state
5. Switch to browsers of users inside the frame
6. Verify they see toast: "Frame unlocked from outside"
7. Verify their lock buttons update to unlocked state

**Expected Results**:
- ✅ Owner can unlock from outside
- ✅ Confirmation dialog appears
- ✅ Real-time sync to users inside
- ✅ Toast notifications work

---

### Scenario 5: Editor Cannot Interact with Lock in Void
**Setup**:
- User A (Editor) is in Void page
- Frame is unlocked

**Steps**:
1. User A hovers over lock icon on preview frame
2. Verify no hover effect occurs
3. User A clicks lock icon
4. Verify nothing happens (no dialog, no state change)
5. Verify lock icon is non-interactive

**Expected Results**:
- ✅ Editor cannot interact with lock from outside
- ✅ Lock button is visually non-interactive

---

### Scenario 6: Viewer Cannot Access Locked Frame
**Setup**:
- User A (Editor) has locked a frame
- User B (Viewer) is in Void page

**Steps**:
1. User B clicks locked preview frame
2. Verify error toast appears: "Frame Locked - This frame is locked by [User A]"
3. Verify no dialog appears
4. Verify User B cannot enter the frame

**Expected Results**:
- ✅ Viewer sees error toast
- ✅ Viewer cannot enter or request access
- ✅ No dialog shown

---

### Scenario 7: Lock Syncs Between Forge and Source
**Setup**:
- User A (Editor) in Forge page
- User B (Editor) in Source page (same frame)

**Steps**:
1. User A locks frame from Forge
2. Switch to User B's browser
3. Verify lock button updates in Source page header
4. Verify toast appears for User B
5. User B clicks lock button to unlock
6. Switch to User A's browser
7. Verify lock button updates in Forge page
8. Verify toast appears for User A

**Expected Results**:
- ✅ Lock state syncs bidirectionally
- ✅ Both pages show correct lock state
- ✅ Toast notifications work in both directions

---

### Scenario 8: Owner Lock Button Visible in Void
**Setup**:
- User A (Owner) is in Void page

**Steps**:
1. Look at preview frame lock button
2. Verify small shield icon badge visible on lock button
3. Hover over lock button
4. Verify hover effects work (scale, color change)
5. Click lock button
6. Verify confirmation dialog appears
7. Lock the frame
8. Verify lock icon changes

**Expected Results**:
- ✅ Owner badge (shield) visible
- ✅ Lock button is interactive for owner
- ✅ Hover effects work
- ✅ Can lock/unlock from outside

---

### Scenario 9: Toast Notification Animations
**Setup**:
- Any lock/unlock action

**Steps**:
1. Trigger a lock action
2. Observe toast notification entrance
3. Verify smooth slide-in animation from right
4. Verify progress bar animates from left to right
5. Wait for auto-dismiss (5 seconds)
6. Observe toast exit animation
7. Verify smooth slide-out animation

**Expected Results**:
- ✅ Smooth GSAP entrance animation
- ✅ Progress bar animates correctly
- ✅ Auto-dismiss after 5 seconds
- ✅ Smooth exit animation
- ✅ Multiple toasts stack properly

---

### Scenario 10: Discipline Routing with Locks
**Setup**:
- User A (Developer discipline) in Void page
- User B (Designer discipline) in Void page
- Frame is unlocked

**Steps**:
1. User A (Developer) clicks frame → Should go to Forge by default
2. User B (Designer) clicks frame → Should go to Forge (Designer only route)
3. Editor locks frame from inside
4. User A clicks locked frame
5. Verify access dialog appears (not affected by discipline)
6. User A requests access and is granted
7. Verify User A is routed based on discipline (Forge for Developer)

**Expected Results**:
- ✅ Discipline routing works without locks
- ✅ Lock system doesn't break discipline routing
- ✅ After lock bypass/access, discipline routing applies

---

## Role Permission Matrix

| Action | Owner | Editor | Viewer |
|--------|-------|--------|--------|
| Lock from Forge/Source header | ✅ | ✅ | ❌ |
| Unlock from Forge/Source header | ✅ | ✅* | ❌ |
| Lock from Void preview | ✅ | ❌ | ❌ |
| Unlock from Void preview | ✅ | ❌ | ❌ |
| Bypass locked frame | ✅ | ❌ | ❌ |
| Request access to locked frame | ✅** | ✅ | ❌ |
| Enter locked frame | ✅ | ❌*** | ❌ |

\* Editor can only unlock if they locked it  
\** Owner doesn't need to request (can bypass)  
\*** Editor can enter if access granted

---

## Visual Indicators Checklist

### Lock Button in Header (Forge/Source)
- [ ] Shows Unlock icon when frame is unlocked
- [ ] Shows Lock icon when frame is locked
- [ ] Has primary color background when locked
- [ ] Has hover effect (bg-muted) when unlocked
- [ ] Disabled state when user cannot interact

### Preview Frame Lock (Void)
- [ ] Owner: Shows shield badge indicator
- [ ] Owner: Has hover effects (scale, color)
- [ ] Owner: Interactive cursor on hover
- [ ] Editor/Viewer: No hover effects
- [ ] Editor/Viewer: Default cursor (non-interactive)
- [ ] Lock icon changes Lock ↔ Unlock based on state
- [ ] Status indicator dot (green = locked by me, red = locked by others)

### Toast Notifications
- [ ] Modern rounded design
- [ ] No borders (uses shadow instead)
- [ ] Minimalist style
- [ ] Shows user name who performed action
- [ ] Different colors for different types
- [ ] Progress bar at top
- [ ] Close button (X)
- [ ] Proper stacking when multiple toasts

---

## Common Issues & Debugging

### Issue: Lock button not appearing in header
**Check**: 
- User has Owner or Editor role
- Frame UUID is being passed correctly
- FrameLockButton component is imported

### Issue: Lock state not syncing
**Check**:
- Laravel Echo is connected
- Broadcasting is configured correctly
- Frame lock channels are subscribed
- Zustand store is updating

### Issue: Toast not appearing
**Check**:
- EnhancedToastContainer is rendered
- Notifications array in Zustand store
- GSAP is installed
- z-index is high enough (9999)

### Issue: Dialog not showing
**Check**:
- Lock status is being fetched correctly
- User role is being fetched
- Dialog state is managed properly
- No CSS conflicts with z-index

---

## Browser DevTools Debugging

### Check Lock Status:
```javascript
// In browser console
useFrameLockStore.getState().lockStatuses
```

### Check Notifications:
```javascript
// In browser console
useFrameLockStore.getState().notifications
```

### Check User Role:
```javascript
// In browser console (when on page)
// Check the LeftSection or FrameLockButton component state
```

### Trigger Test Notification:
```javascript
// In browser console
useFrameLockStore.getState().addNotification({
  type: 'lock',
  title: 'Test',
  message: 'This is a test notification',
  userName: 'Test User'
})
```

---

## Performance Checks

- [ ] Toast animations are smooth (60fps)
- [ ] No lag when multiple users lock/unlock
- [ ] Real-time updates happen within 1 second
- [ ] No memory leaks with long sessions
- [ ] Multiple toasts don't cause performance issues

---

## Accessibility Checks

- [ ] Lock buttons have proper title/aria-label
- [ ] Dialogs can be closed with Escape key
- [ ] Focus management in dialogs works
- [ ] Color contrast meets WCAG standards
- [ ] Screen readers can understand lock states

---

## Notes

- Test with at least 3 concurrent users for best results
- Use browser DevTools network tab to verify Echo connections
- Check Laravel logs for any backend errors
- Clear browser cache if changes don't appear
- Use incognito windows to test multiple users easily
