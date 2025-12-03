# Presence-Based Lock Power - Implementation

## Problem Solved
Editor who locked frame had eternal power - could leave and re-enter anytime, maintaining control indefinitely.

## Solution: Tie Lock Power to Being Inside

### How It Works Now:

```
1. Editor locks from inside ✅
2. While INSIDE frame → Has bypass privilege
3. Leaves to Void → Presence system detects exit
4. NO active presence → LOSES bypass privilege
5. Wants back in? → Must request access (like other editors)
```

---

## Code Changes

### Added Methods to Frame Model:

```php
public function presences()
{
    return $this->hasMany(Presence::class);
}

public function activePresences()
{
    return $this->hasMany(Presence::class)->active();
}

public function hasActivePresence(int $userId): bool
{
    return $this->activePresences()
                ->where('user_id', $userId)
                ->exists();
}
```

### Updated canUserBypassLock():

```php
// OLD: Editor who locked could ALWAYS re-enter
if ($this->locked_by_user_id === $userId) {
    return true; // Forever access!
}

// NEW: Editor who locked can ONLY re-enter if STILL INSIDE
if ($this->locked_by_user_id === $userId) {
    return $this->hasActivePresence($userId); // Must be inside!
}
```

---

## Behavior Matrix

| User | Action | Can Bypass? | Why |
|------|--------|-------------|-----|
| Editor A | Locks, stays inside | ✅ Yes | Active presence |
| Editor A | Locks, leaves to Void | ❌ No | No active presence |
| Editor A | Locks, leaves, comes back | ❌ No | Lost power by leaving |
| Editor B | Different editor | ❌ No | Must request |
| Owner | Always | ✅ Yes | Owner privilege |

---

## User Scenarios

### Scenario 1: Normal Work Session
```
1. Editor A enters Forge
2. Locks frame
3. Works on design
4. Leaves briefly to check Void
5. Wants back in → BLOCKED! ❌
6. Must request access from Editor B (who's inside)
   OR wait for auto-unlock
```

### Scenario 2: Prevents Monopoly
```
1. Editor A locks frame
2. Goes to lunch (leaves frame)
3. Editor B inside → Can now unlock! ✅
4. Editor A comes back → Must request ✅
5. No single editor has permanent control
```

### Scenario 3: Owner Override
```
1. Editor A locks, leaves
2. Editor B stuck inside, can't unlock
3. Owner from Void → Can still bypass ✅
4. Owner enters, unlocks
5. Normal flow resumes
```

---

## Benefits

✅ **No Eternal Power**: Leaving breaks control  
✅ **Automatic**: Uses existing presence system  
✅ **Fair**: Can't monopolize from outside  
✅ **Democratic**: Inside > Outside authority  
✅ **Owner Safety**: Owner can always override  

---

## Technical Details

### Presence System Integration:
- Uses existing `Presence` model
- `active()` scope checks for recent heartbeats
- Automatically tracks enter/leave via presence API

### Grace Period:
- Presence marked inactive after ~30 seconds of no heartbeat
- Small buffer prevents accidental lockout from network hiccup

### Edge Cases Handled:
1. **Network disconnect**: 30s grace before marked inactive
2. **Browser crash**: Eventually marked inactive, auto-unlock possible
3. **Multiple tabs**: Any tab with active presence counts

---

## Testing

### Test 1: Power Loss on Exit
1. Editor locks frame in Forge
2. Go to Void
3. Wait 30 seconds (presence timeout)
4. Try to re-enter → Should see access request dialog ✅

### Test 2: Can Unlock While Inside
1. Editor A locks frame
2. Editor A still inside → Can unlock ✅
3. Editor A leaves
4. Editor A tries to re-enter → Blocked ❌

### Test 3: Democratic Control
1. Editor A locks, leaves
2. Editor B inside → Can unlock ✅
3. Editor A can't interfere from outside

---

## API Changes

No API changes needed! The logic is in the model:
- `canUserBypassLock()` now checks presence
- Presence API already tracks enter/leave
- Seamless integration

---

## Summary

**Before**: 
- Editor locks → Forever has access
- Can leave and return anytime
- Monopolizes frame control

**After**:
- Editor locks → Has access ONLY while inside
- Leaves → Loses bypass privilege  
- Must request to re-enter (fair for everyone)

This creates a **democratic, presence-based** lock system where power is tied to actually being in the frame! 🎉
