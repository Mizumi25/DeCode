<?php
// app/Models/Frame.php - Updated with Lock System

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class Frame extends Model 
{
    use HasFactory;

    protected $fillable = [
        'uuid', 
        'project_id', 
        'name', 
        'type', 
        'canvas_data', 
        'settings',
        'thumbnail_path',
        // Lock system fields
        'is_locked',
        'locked_by_user_id',
        'locked_at',
        'locked_mode',
        'lock_reason',
    ];
      
    protected $casts = [
        'canvas_data' => 'array',
        'settings' => 'array',
        'is_locked' => 'boolean',
        'locked_at' => 'datetime',
    ];

    public static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->uuid = (string) Str::uuid();
        });
    }

    public function getRouteKeyName()
    {
        return 'uuid';
    }

    // Relationships
    public function project() 
    {
        return $this->belongsTo(Project::class);
    }

    public function lockedByUser()
    {
        return $this->belongsTo(User::class, 'locked_by_user_id');
    }

    public function lockRequests()
    {
        return $this->hasMany(FrameLockRequest::class);
    }

    public function pendingLockRequests()
    {
        return $this->hasMany(FrameLockRequest::class)->pending();
    }

    // Lock system scopes
    public function scopeLocked($query)
    {
        return $query->where('is_locked', true);
    }

    public function scopeUnlocked($query)
    {
        return $query->where('is_locked', false);
    }

    public function scopeLockedBy($query, $userId)
    {
        return $query->where('is_locked', true)
                    ->where('locked_by_user_id', $userId);
    }

    // Lock system helper methods
    public function canUserUnlock($userId): bool
    {
        // Owner of the project can always unlock
        if ($this->project->user_id === $userId) {
            return true;
        }

        // The user who locked it can unlock
        if ($this->locked_by_user_id === $userId) {
            return true;
        }

        // Workspace owner/admin can unlock
        if ($this->project->workspace_id) {
            $workspace = $this->project->workspace;
            $userRole = $workspace->getUserRole($userId);
            
            // Owner and editors can unlock frames
            if (in_array($userRole, ['owner', 'editor'])) {
                return true;
            }
        }

        return false;
    }

    public function canUserLock($userId): bool
    {
        // If already locked, check if user can unlock first
        if ($this->is_locked) {
            return $this->canUserUnlock($userId);
        }

        // Owner of the project can always lock
        if ($this->project->user_id === $userId) {
            return true;
        }

        // Check workspace permissions
        if ($this->project->workspace_id) {
            $workspace = $this->project->workspace;
            $userRole = $workspace->getUserRole($userId);
            
            // Contributors and above can lock frames
            if (in_array($userRole, ['owner', 'editor', 'contributor'])) {
                return true;
            }
        }

        return false;
    }

    public function canUserRequest($userId): bool
    {
        // Can't request if not locked
        if (!$this->is_locked) {
            return false;
        }

        // Can't request if you're the one who locked it
        if ($this->locked_by_user_id === $userId) {
            return false;
        }

        // Check if user has basic access to the frame
        if ($this->project->user_id === $userId) {
            return true;
        }

        if ($this->project->workspace_id) {
            return $this->project->workspace->hasUser($userId);
        }

        return false;
    }

    public function lock(int $userId, string $mode, string $reason = null): bool
    {
        if (!$this->canUserLock($userId)) {
            return false;
        }

        return $this->update([
            'is_locked' => true,
            'locked_by_user_id' => $userId,
            'locked_at' => now(),
            'locked_mode' => $mode,
            'lock_reason' => $reason,
        ]);
    }

    public function unlock(): bool
    {
        return $this->update([
            'is_locked' => false,
            'locked_by_user_id' => null,
            'locked_at' => null,
            'locked_mode' => null,
            'lock_reason' => null,
        ]);
    }

    public function isLockedBy(int $userId): bool
    {
        return $this->is_locked && $this->locked_by_user_id === $userId;
    }

    public function getLockedDuration(): ?int
    {
        if (!$this->is_locked || !$this->locked_at) {
            return null;
        }

        return $this->locked_at->diffInMinutes(now());
    }

    public function hasActiveLockRequest(int $userId): bool
    {
        return $this->lockRequests()
                   ->where('requester_user_id', $userId)
                   ->pending()
                   ->exists();
    }

    public function createLockRequest(int $requesterId, string $mode, string $message = null): ?FrameLockRequest
    {
        if (!$this->is_locked) {
            return null;
        }

        // Don't create duplicate requests
        if ($this->hasActiveLockRequest($requesterId)) {
            return null;
        }

        return FrameLockRequest::createRequest(
            $this->id,
            $requesterId,
            $this->locked_by_user_id,
            $mode,
            $message
        );
    }

    public function getLockStatusForUser($userId): array
    {
        return [
            'is_locked' => $this->is_locked,
            'locked_by_me' => $this->isLockedBy($userId),
            'can_lock' => $this->canUserLock($userId),
            'can_unlock' => $this->canUserUnlock($userId),
            'can_request' => $this->canUserRequest($userId),
            'has_pending_request' => $this->hasActiveLockRequest($userId),
            'locked_by' => $this->lockedByUser ? [
                'id' => $this->lockedByUser->id,
                'name' => $this->lockedByUser->name,
                'avatar' => $this->lockedByUser->avatar,
                'initials' => $this->lockedByUser->getInitials(),
            ] : null,
            'locked_at' => $this->locked_at?->toISOString(),
            'locked_mode' => $this->locked_mode,
            'lock_duration_minutes' => $this->getLockedDuration(),
        ];
    }

    // Auto-unlock after certain time (optional feature)
    public function autoUnlockIfStale(int $maxMinutes = 60): bool
    {
        if (!$this->is_locked || !$this->locked_at) {
            return false;
        }

        if ($this->locked_at->addMinutes($maxMinutes)->isPast()) {
            return $this->unlock();
        }

        return false;
    }
}