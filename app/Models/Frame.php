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
        'x',                 // Position X in void canvas
        'y',                 // Position Y in void canvas
        'container_id',      // Container this frame belongs to
        'container_order',   // Order within container
        'type',
        'scrolled_component',
        'scroll_direction',
        'canvas_data', 
        'settings',
        'canvas_style',      // Stores body/root styles
        'canvas_props',      // Stores body/root props
        'canvas_animation',  // Stores body/root animations
        'thumbnail_path',
        'is_locked',
        'locked_by_user_id',
        'locked_at',
        'locked_mode',
        'lock_reason',
    ];
    
    protected $casts = [
        'canvas_data' => 'array',
        'canvas_style' => 'array',      // ✅ Laravel handles this automatically
        'canvas_props' => 'array',      // ✅ Laravel handles this automatically
        'canvas_animation' => 'array',  // ✅ Laravel handles this automatically
        'settings' => 'array',
        'is_locked' => 'boolean',
        'locked_at' => 'datetime',
        'x' => 'integer',
        'y' => 'integer',
        'container_order' => 'integer',
    ];

protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            $model->uuid = (string) Str::uuid();
            
            // ✅ Initialize canvas_style with responsive defaults
            if (!$model->canvas_style) {
                $model->canvas_style = [
                    'width' => '100%',
                    'height' => '100%',
                    'minHeight' => '100%',
                    'backgroundColor' => '#ffffff',
                    'padding' => '0px',
                    'margin' => '0px',
                    'display' => 'block',
                    'overflow' => 'auto',
                    'fontFamily' => '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    'fontSize' => '16px',
                    'lineHeight' => '1.6',
                    'color' => '#1f2937',
                    'position' => 'relative',
                    'boxSizing' => 'border-box',
                ];
            }
            
            if (!$model->canvas_props) {
                $model->canvas_props = [];
            }
            
            if (!$model->canvas_animation) {
                $model->canvas_animation = [];
            }
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

    public function container()
    {
        return $this->belongsTo(FrameContainer::class, 'container_id');
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
    
    public function presences()
    {
        return $this->hasMany(Presence::class);
    }
    
    public function activePresences()
    {
        return $this->hasMany(Presence::class)->active();
    }
    
    /**
     * Check if user has active presence in this frame
     */
    public function hasActivePresence(int $userId): bool
    {
        return $this->activePresences()
                    ->where('user_id', $userId)
                    ->exists();
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

        // The user who locked it can unlock (if inside the frame)
        if ($this->locked_by_user_id === $userId) {
            return true;
        }

        // Workspace owner can unlock from anywhere (void or inside)
        if ($this->project->workspace_id) {
            $workspace = $this->project->workspace;
            $userRole = $workspace->getUserRole($userId);
            
            // Only workspace owner can unlock from outside (void)
            // Editors who locked can only unlock from inside (handled above)
            if ($userRole === 'owner') {
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

        // Check workspace permissions - Only Owner and Editor can lock
        if ($this->project->workspace_id) {
            $workspace = $this->project->workspace;
            $userRole = $workspace->getUserRole($userId);
            
            // Only owner and editor can lock frames
            if (in_array($userRole, ['owner', 'editor'])) {
                return true;
            }
        }

        return false;
    }
    
    /**
     * Check if user can access locked frame from outside (void page)
     * Owner can bypass lock, editors need to request
     */
    public function canUserBypassLock($userId): bool
    {
        // Not locked, anyone with access can enter
        if (!$this->is_locked) {
            return true;
        }
        
        // Owner of the project can always bypass
        if ($this->project->user_id === $userId) {
            return true;
        }
        
        // The user who locked it can ONLY enter if they're STILL INSIDE
        // Once they leave, they lose bypass privilege
        if ($this->locked_by_user_id === $userId) {
            // Check if they have active presence (currently inside)
            return $this->hasActivePresence($userId);
        }
        
        // Workspace owner can bypass lock
        if ($this->project->workspace_id) {
            $workspace = $this->project->workspace;
            $userRole = $workspace->getUserRole($userId);
            
            if ($userRole === 'owner') {
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
        // Get user's workspace role
        $userRole = null;
        if ($this->project->workspace_id) {
            $userRole = $this->project->workspace->getUserRole($userId);
        }
        
        return [
            'is_locked' => $this->is_locked,
            'locked_by_me' => $this->isLockedBy($userId),
            'can_lock' => $this->canUserLock($userId),
            'can_unlock' => $this->canUserUnlock($userId),
            'can_request' => $this->canUserRequest($userId),
            'can_bypass_lock' => $this->canUserBypassLock($userId),
            'has_pending_request' => $this->hasActiveLockRequest($userId),
            'user_role' => $userRole,
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
    
    public function isPageType(): bool
    {
        return $this->type === 'page';
    }
    
    public function isComponentType(): bool
    {
        return $this->type === 'component';
    }
    
    public function canHaveSubSections(): bool
    {
        return $this->isComponentType() && $this->scrolled_component;
    }
    
    // Component-Page Assignment relationships
    public function assignedComponents()
    {
        return $this->belongsToMany(Frame::class, 'frame_component_assignments', 'page_frame_id', 'component_frame_id')
                    ->withPivot(['position', 'x', 'y', 'override_props'])
                    ->withTimestamps()
                    ->orderBy('frame_component_assignments.position');
    }
    
    public function assignedToPages()
    {
        return $this->belongsToMany(Frame::class, 'frame_component_assignments', 'component_frame_id', 'page_frame_id')
                    ->withPivot(['position', 'x', 'y', 'override_props'])
                    ->withTimestamps();
    }
    
    public function componentAssignments()
    {
        return $this->hasMany(FrameComponentAssignment::class, 'page_frame_id');
    }
    
    public function projectComponents()
    {
        return $this->hasMany(ProjectComponent::class, 'frame_id');
    }
}