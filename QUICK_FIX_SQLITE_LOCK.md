# SQLite Database Lock Issue - Quick Fix

## Issue
```
SQLSTATE[HY000]: General error: 5 database is locked
```

This happens when multiple processes try to write to SQLite at the same time:
- Web server (artisan serve)
- Queue worker (queue:work)
- Reverb server

---

## Quick Fix Options

### Option 1: Use Sync Queue (Simplest for Development)
Change in `.env`:
```env
QUEUE_CONNECTION=sync
```

This makes queue jobs run immediately instead of async, preventing concurrent writes.

**Restart after change**:
```bash
php artisan config:clear
php artisan queue:restart
```

---

### Option 2: Increase SQLite Timeout
Add to `config/database.php` in sqlite connection:
```php
'sqlite' => [
    'driver' => 'sqlite',
    'database' => env('DB_DATABASE', database_path('database.sqlite')),
    'prefix' => '',
    'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
    'busy_timeout' => 5000, // Add this line (5 seconds)
],
```

---

### Option 3: Use MySQL/PostgreSQL (Production Ready)
For production or heavy development, switch to a proper database.

---

## Your Current Setup

From your logs, you're using:
- SQLite database
- Queue worker running
- Reverb broadcasting
- Multiple users (mizumi@gmail.com, jay@gmail.com)

The lock errors are non-fatal - your frame lock feature is working! (I see `FrameLockStatusChanged` events succeeding)

---

## What's Working Despite Errors

✅ Frame lock status changes
✅ Presence updates
✅ Broadcasting events
✅ User authentication

The SQLite lock is just causing **some** queue jobs to retry, but they eventually succeed.

---

## Recommended Fix for Now

Add to `.env`:
```env
QUEUE_CONNECTION=sync
```

Then restart:
```bash
php artisan config:clear
pkill -9 php
php artisan serve &
php artisan reverb:start &
```

This will eliminate the database lock errors for development.

---

## About the Float Warning

The warning:
```
Implicit conversion from float 55.44248578333333 to int loses precision
```

This is a PHP 8.4 deprecation warning when casting floats to ints. Not critical but can be fixed later.

---

## Testing Interactive Toast

Based on your logs, you have 2 users active:
- User 1 (mizumi@gmail.com) 
- User 2 (jay@gmail.com)

Both are polling lock status every 2 seconds (that's our polling mechanism working!)

**To test interactive toast:**
1. User 1: Lock the frame
2. User 2: Try to access it
3. User 2: Send access request
4. User 1: Should see interactive toast with Accept/Decline buttons

**Check User 1's browser console** for:
```
🔔 Initializing Frame Lock Echo with user ID: 1
✅ Frame Lock Echo initialized
Received lock request: { request: {...} }
```

If you see these messages, the toast should appear!
