<?php
// app/Models/Workspace.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Workspace extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'owner_id',
        'name',
        'description',
        'type', // personal, team, company
        'settings'
    ];

    protected $casts = [
        'settings' => 'array'
    ];

    protected $with = ['owner'];

    public static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            $model->uuid = (string) Str::uuid();
            
            // Ensure settings has default values
            if (empty($model->settings)) {
                $model->settings = $model->getDefaultSettings();
            }
        });

        // When a workspace is created, automatically add the owner as a user
        static::created(function ($workspace) {
            if ($workspace->type !== 'personal') {
                $workspace->users()->attach($workspace->owner_id, [
                    'role' => 'owner',
                    'joined_at' => now()
                ]);
            }
        });
    }

    public function getRouteKeyName()
    {
        return 'uuid';
    }

    // Relationships
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'workspace_users')
                    ->withPivot('role', 'joined_at')
                    ->withTimestamps();
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function invites()
    {
        return $this->hasMany(Invite::class);
    }

    // Scopes
    public function scopeForUser($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('owner_id', $userId)
              ->orWhereHas('users', function ($userQuery) use ($userId) {
                  $userQuery->where('user_id', $userId);
              });
        });
    }

    public function scopePersonal($query)
    {
        return $query->where('type', 'personal');
    }

    public function scopeTeam($query)
    {
        return $query->where('type', 'team');
    }

    // Helper methods
    public function addUser($userId, $role = 'viewer')
    {
        // Don't add if already exists
        if ($this->users()->where('user_id', $userId)->exists()) {
            return false;
        }

        return $this->users()->attach($userId, [
            'role' => $role,
            'joined_at' => now()
        ]);
    }

    public function removeUser($userId)
    {
        // Don't remove owner
        if ($this->owner_id === $userId) {
            return false;
        }

        return $this->users()->detach($userId);
    }

    public function updateUserRole($userId, $role)
    {
        // Can't change owner role
        if ($this->owner_id === $userId) {
            return false;
        }

        return $this->users()->updateExistingPivot($userId, ['role' => $role]);
    }

    public function hasUser($userId)
    {
        return $this->owner_id === $userId || $this->users()->where('user_id', $userId)->exists();
    }

    public function getUserRole($userId)
    {
        if ($this->owner_id === $userId) {
            return 'owner';
        }

        $user = $this->users()->where('user_id', $userId)->first();
        return $user ? $user->pivot->role : null;
    }

    public function canUserInvite($userId)
    {
        $role = $this->getUserRole($userId);
        return in_array($role, ['owner', 'editor']);
    }

    public function canUserEdit($userId)
    {
        $role = $this->getUserRole($userId);
        return in_array($role, ['owner', 'editor']);
    }

    public function canUserView($userId)
    {
        return $this->hasUser($userId);
    }

    public function isPrivate()
    {
        return ($this->settings['privacy'] ?? 'private') === 'private';
    }

    public function getDefaultSettings()
    {
        return [
            'privacy' => 'private', // private, public
            'allow_public_projects' => false,
            'default_project_privacy' => 'private',
            'invite_permissions' => [
                'editors_can_invite' => true,
                'viewers_can_invite' => false
            ]
        ];
    }

    // Computed attributes
    public function getMemberCountAttribute()
    {
        return $this->users()->count() + 1; // +1 for owner
    }

    public function getProjectCountAttribute()
    {
        return $this->projects()->count();
    }

    // Serialization
    public function toArray()
    {
        $array = parent::toArray();
        
        // Add computed attributes
        $array['member_count'] = $this->getMemberCountAttribute();
        $array['project_count'] = $this->getProjectCountAttribute();
        
        return $array;
    }
}