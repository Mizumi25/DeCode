# Frame Lock Feature - Implementation Summary

## Overview
This feature allows workspace owners and editors to lock frames from inside (Forge/Source pages) or outside (Void page), with synchronized real-time updates and role-based permissions.

## Key Features Implemented

### 1. **Role-Based Lock Permissions** (Backend - `app/Models/Frame.php`)
- **Owner**: Can lock/unlock from anywhere (inside or outside)
- **Editor**: Can lock/unlock only from inside the frame (Forge/Source)
- **Viewer**: Cannot lock/unlock at all

#### Changes:
- Updated `canUserLock()` - Only Owner and Editor can lock
- Updated `canUserUnlock()` - Owner can unlock from anywhere, Editor only if they locked it
- Added `canUserBypassLock()` - Owner can bypass locks, Editor must request access
- Updated `getLockStatusForUser()` - Returns `can_bypass_lock` and `user_role`

### 2. **Enhanced Toast Notification System** (`resources/js/Components/Notifications/EnhancedToast.jsx`)
- Modern, minimalist design with rounded corners and no borders
- Smooth GSAP entrance/exit animations
- Framer Motion integration for layout animations
- Configurable position (top-right, top-left, bottom-right, bottom-left, top-center, bottom-center)
- Progress bar indicator
- Auto-dismiss with 5-second timer
- Multiple notification types: success, error, warning, info, lock, unlock, lock_request, lock_granted, lock_denied, owner_bypass

### 3. **Header Lock Button** (Forge & Source Pages)
**File**: `resources/js/Components/Header/Head/FrameLockButton.jsx`

- Visible only to Owner and Editor roles
- Shows lock/unlock state with icons
- Integrated into LeftSection of Header
- Real-time sync between Forge and Source pages
- Toast notifications when lock status changes

**Integration**:
- Added to `resources/js/Components/Header/Head/LeftSection.jsx`
- Replaces the static lock icon

### 4. **Preview Frame Lock Button** (Void Page)
**File**: `resources/js/Components/Void/EnhancedPreviewFrameLock.jsx`

- **Owner**: Can lock/unlock from outside with confirmation dialog
- **Editor/Viewer**: Cannot interact from outside (button is non-interactive)
- Visual indicators:
  - Owner badge (Shield icon) for owners
  - Lock status indicator (green = locked by me, red = locked by others)
  - Hover effects only for owners
- Confirmation dialog before lock/unlock

**Integration**:
- Replaced old lock button in `resources/js/Components/Void/PreviewFrame.jsx`

### 5. **Frame Access Dialog** (Void Page Click Handling)
**File**: `resources/js/Components/Void/FrameAccessDialog.jsx`

When clicking a locked preview frame:

#### Owner Behavior:
- Shows dialog: "Frame Locked by Team Member"
- Option to "Enter Frame" (bypass lock)
- Warning that users inside will be notified
- Can enter without unlocking the frame
- Toast notification sent to users inside

#### Editor Behavior:
- Shows dialog: "Frame is Locked"
- Option to "Request Access" with optional message
- Request sent to the user who locked the frame
- Toast notification confirming request was sent

#### Viewer Behavior:
- Shows error toast: "Frame Locked"
- Cannot enter or request access

**Integration**:
- Added to `resources/js/Components/Void/PreviewFrame.jsx`
- Handles `handleFrameClick` logic with role checking

### 6. **Real-Time Synchronization**

#### Forge ↔ Source Sync:
- Lock button state syncs between pages
- When User 1 locks in Forge, User 2 in Source sees the change immediately
- Toast notifications appear for all users inside the frame

#### Void ↔ Inside Sync:
- Preview frame lock icon updates when locked/unlocked from inside
- When locked from inside, preview frame shows locked state
- Owner can see who locked it and from where

### 7. **Toast Notifications Integration**
Added to both pages:
- `resources/js/Pages/ForgePage.jsx`
- `resources/js/Pages/SourcePage.jsx`

Toast notifications display:
- Lock/unlock events
- Access requests
- Owner bypass warnings
- Error messages

## Notification Types

| Type | Color | Use Case |
|------|-------|----------|
| `lock` | Purple | Frame locked |
| `unlock` | Indigo | Frame unlocked |
| `lock_request` | Orange | Access request sent |
| `lock_granted` | Teal | Access granted |
| `lock_denied` | Rose | Access denied |
| `owner_bypass` | Amber | Owner entering locked frame |
| `success` | Green | General success |
| `error` | Red | General error |
| `warning` | Yellow | General warning |
| `info` | Blue | General info |

## Discipline Routing Compatibility

The lock system works seamlessly with existing discipline routing:
- **Developer**: Can switch between Forge and Source
- **Designer**: Directed to Forge only
- **Programmer**: Directed to Source only

The lock prevents **entering** the frame but doesn't affect discipline-based routing once inside.

## Files Created

1. `resources/js/Components/Notifications/EnhancedToast.jsx` - Toast notification system
2. `resources/js/Components/Header/Head/FrameLockButton.jsx` - Header lock button for Forge/Source
3. `resources/js/Components/Void/EnhancedPreviewFrameLock.jsx` - Preview frame lock button for Void
4. `resources/js/Components/Void/FrameAccessDialog.jsx` - Access request dialog

## Files Modified

1. `app/Models/Frame.php` - Updated lock permission methods
2. `resources/js/Components/Header/Head/LeftSection.jsx` - Added lock button
3. `resources/js/Components/Void/PreviewFrame.jsx` - Replaced lock button and added access dialog
4. `resources/js/Pages/ForgePage.jsx` - Added toast container
5. `resources/js/Pages/SourcePage.jsx` - Added toast container

## User Flows

### Flow 1: Editor Locks Frame from Inside
1. Editor is in Forge page
2. Clicks lock button in header
3. Toast appears: "Frame locked in forge mode"
4. Frame is locked
5. Real-time update:
   - Source page lock button updates (for users inside)
   - Void page preview frame shows locked icon
   - Other editors outside cannot enter

### Flow 2: Editor Tries to Enter Locked Frame
1. Editor clicks locked preview frame in Void
2. Dialog appears: "Frame is Locked"
3. Editor enters optional message and clicks "Request Access"
4. Request sent to the user who locked it
5. Toast: "Access request sent"
6. User inside receives notification (via existing lock request system)

### Flow 3: Owner Bypasses Lock
1. Owner clicks locked preview frame in Void
2. Dialog appears: "Frame Locked by Team Member"
3. Owner clicks "Enter Frame"
4. Owner enters without unlocking
5. Toast sent to users inside: "Workspace owner is entering the frame"

### Flow 4: Owner Unlocks from Outside
1. Owner is in Void page
2. Clicks lock icon on preview frame
3. Confirmation dialog appears
4. Owner confirms unlock
5. Frame unlocks
6. Toast sent to users inside: "Frame unlocked from outside"

## Testing Checklist

- [ ] Owner can lock/unlock from Forge page header
- [ ] Owner can lock/unlock from Source page header
- [ ] Owner can lock/unlock from Void page preview frame
- [ ] Editor can lock/unlock from Forge/Source header
- [ ] Editor cannot interact with lock button in Void page
- [ ] Editor sees access dialog when clicking locked frame
- [ ] Viewer cannot see lock button in Forge/Source
- [ ] Viewer sees error when clicking locked frame
- [ ] Lock syncs between Forge and Source in real-time
- [ ] Lock syncs from inside to Void preview frame
- [ ] Toast notifications appear correctly
- [ ] Toast animations work smoothly
- [ ] Access requests work correctly
- [ ] Owner bypass works and notifies users inside
- [ ] Discipline routing still works with locks

## Dependencies

- **GSAP**: For toast animations (already installed via `framer-motion` or needs separate install)
- **Framer Motion**: For component animations (already installed)
- Existing: Zustand, Inertia.js, Laravel Echo

## Notes

- Lock prevents entering from outside, not editing from inside
- Locking is mode-specific (forge or source)
- Owner always has ultimate control
- Toast notifications auto-dismiss after 5 seconds
- All lock changes broadcast via Laravel Echo
