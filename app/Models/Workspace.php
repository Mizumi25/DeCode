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

    public function hasUser($userId): bool
    {
        // Check if user is owner
        if ($this->owner_id === $userId) {
            return true;
        }
        
        // Check if user is in workspace_users
        return $this->users()->where('user_id', $userId)->exists();
    }

    public function getUserRole($userId): ?string
    {
        // Check if user is the owner
        if ($this->owner_id === $userId) {
            return 'owner';
        }
        
        // Check workspace_users pivot table
        $workspaceUser = $this->users()->where('user_id', $userId)->first();
        
        return $workspaceUser?->pivot?->role ?? 'viewer'; // Default to viewer if not found
    }
    
    public function canUserInvite($userId)
    {
        $role = $this->getUserRole($userId);
        return in_array($role, ['owner', 'editor']);
    }

   public function canUserEdit($userId): bool
  {
      $userRole = $this->getUserRole($userId);
      $editableRoles = ['owner', 'admin', 'editor', 'contributor'];
      return in_array($userRole, $editableRoles);
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

    
    
    
      // app/Models/Workspace.php - ADD THESE METHODS
  
  public function updateUserDiscipline($userId, $discipline)
  {
      // Can't change if user is not in workspace
      if (!$this->hasUser($userId)) {
          return false;
      }
      
      // Owner can update their own discipline via pivot
      if ($this->owner_id === $userId) {
          return $this->users()->updateExistingPivot($userId, ['discipline' => $discipline]);
      }
  
      return $this->users()->updateExistingPivot($userId, ['discipline' => $discipline]);
  }
  
  public function updateDisciplineOrder($userId, $order)
  {
      if (!$this->hasUser($userId)) {
          return false;
      }
      
      return $this->users()->updateExistingPivot($userId, ['discipline_order' => $order]);
  }
  
  public function getUserDiscipline($userId): string
  {
      if ($this->owner_id === $userId) {
          $workspaceUser = $this->users()->where('user_id', $userId)->first();
          return $workspaceUser?->pivot?->discipline ?? 'Member';
      }
      
      $workspaceUser = $this->users()->where('user_id', $userId)->first();
      return $workspaceUser?->pivot?->discipline ?? 'Member';
  }
  
  // In toArray() method, update the users mapping:
  public function toArray()
  {
      $array = parent::toArray();
      
      // Add computed attributes
      $array['member_count'] = $this->getMemberCountAttribute();
      $array['project_count'] = $this->getProjectCountAttribute();
      
      return $array;
  }
}