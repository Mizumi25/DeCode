# Interactive Toast Debug Guide

## What Should Happen

When someone sends an access request:

1. **Backend** broadcasts `lock.request.created` event
2. **Echo listener** in `useFrameLockStore` receives it
3. **Store automatically** creates interactive notification with Accept/Decline buttons
4. **EnhancedToastContainer** displays the toast in top-right corner
5. **User clicks** Accept or Decline
6. **Toast disappears**, response sent

---

## Debugging Steps

### 1. Check Browser Console
Open DevTools console and look for:
```
Received lock request: { request: {...} }
Frame lock Echo initialized
```

If you see these, Echo is working!

### 2. Check Echo Connection
In browser console, run:
```javascript
// Check if Echo is connected
window.Echo

// Check if store is initialized
useFrameLockStore.getState().echoConnected

// Check notifications
useFrameLockStore.getState().notifications

// Check lock requests
useFrameLockStore.getState().lockRequests
```

### 3. Manually Trigger Notification
Test if the toast system works by running in console:
```javascript
useFrameLockStore.getState().addNotification({
  id: 'test-123',
  type: 'lock_request',
  title: 'Test Request',
  message: 'This is a test',
  persistent: true,
  interactive: true,
  actions: [
    {
      label: 'Accept',
      icon: 'check',
      variant: 'success',
      onClick: () => console.log('Accept clicked')
    },
    {
      label: 'Decline',
      icon: 'x',
      variant: 'danger',
      onClick: () => console.log('Decline clicked')
    }
  ]
})
```

If you see the toast with buttons, the system works!

### 4. Check if Echo is Initialized
Look for:
```javascript
useFrameLockStore.getState().echoConnected
// Should return: true
```

If false, Echo might not be initialized. Check if:
- Laravel Reverb/Pusher is running
- `.env` has correct broadcasting settings
- User ID is being passed correctly

---

## Common Issues

### Issue 1: Toast Not Appearing
**Symptoms**: No toast shows up after request

**Check**:
1. Is Echo connected? (`window.Echo` exists?)
2. Is store initialized? (`echoConnected === true`)
3. Are notifications being added? (Check `notifications` array)
4. Is `EnhancedToastContainer` rendered?

**Solution**: Make sure `initialize()` is called in ForgePage

### Issue 2: Toast Appears but No Buttons
**Symptoms**: Toast shows but no Accept/Decline buttons

**Check**:
1. Is `interactive: true`?
2. Is `actions` array defined?
3. Check console for errors

### Issue 3: Buttons Don't Work
**Symptoms**: Clicking buttons does nothing

**Check**:
1. Are `onClick` functions defined?
2. Check console for errors when clicking
3. Is `respondToLockRequest` working?

---

## Checklist

Before sending request, verify:

- [ ] ForgePage has `initializeEcho` in useEffect
- [ ] SourcePage has `initializeEcho` in useEffect
- [ ] `auth?.user?.id` is available
- [ ] `EnhancedToastContainer` is rendered
- [ ] Echo/Reverb server is running
- [ ] Browser console shows no errors

---

## Manual Test

### Step 1: Open Console in ForgePage
```javascript
// Should show user ID
console.log(usePage().props.auth.user.id)

// Should show true
console.log(useFrameLockStore.getState().echoConnected)

// Should show empty array initially
console.log(useFrameLockStore.getState().notifications)
```

### Step 2: Send Request from Another Browser
- User 2 clicks locked frame
- User 2 sends request

### Step 3: Check User 1's Console
Should see:
```
Received lock request: { request: {...} }
```

And notification array should have 1 item:
```javascript
useFrameLockStore.getState().notifications
// Should show array with 1 interactive notification
```

### Step 4: Look at Screen
Toast should be visible in top-right corner with:
- Title: "Frame Access Request"
- Message: "[Name] wants to access this frame"
- Two buttons: [Decline] [Accept]

---

## Fix if Not Working

### If Echo Not Connected:
Add to ForgePage.jsx (around line 900):
```javascript
useEffect(() => {
  console.log('Initializing Echo with user ID:', auth?.user?.id);
  if (auth?.user?.id) {
    initializeEcho(auth.user.id);
  }
}, [auth?.user?.id]);
```

### If Notifications Not Showing:
Check EnhancedToastContainer has correct props:
```javascript
<EnhancedToastContainer 
  position="top-right"
  notifications={lockNotifications}  // Using Zustand selector
  onRemoveNotification={removeNotification}
/>
```

### If Interactive Features Missing:
Check EnhancedToast.jsx has:
- `persistent` handling (no auto-dismiss)
- `interactive` handling (shows action buttons)
- `actions` rendering with onClick handlers

---

## Expected Console Output

When everything works:
```
1. Page loads:
   "Frame lock Echo initialized"

2. Request arrives:
   "Received lock request: {request: {...}}"

3. Notification added:
   (Check: useFrameLockStore.getState().notifications.length === 1)

4. Click Accept:
   "Response Sent" or success message

5. Toast disappears
```

---

## Quick Fix Command

Run in browser console to force initialize:
```javascript
const userId = usePage().props.auth.user.id;
useFrameLockStore.getState().initialize(userId);
console.log('Forced initialization. Echo connected:', useFrameLockStore.getState().echoConnected);
```

Then send request again.
