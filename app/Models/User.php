<?php
// app/Models/User.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Log;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id', 
        'github_id',
        'github_username',
        'github_token',
        'github_refresh_token',
        'github_token_expires_at',
        'avatar',
        'platform_role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'github_token',
        'github_refresh_token',
    ];

    // This automatically includes is_admin when the model is serialized
    protected $appends = ['is_admin'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'github_token_expires_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected static function booted()
    {
        static::created(function ($user) {
            // Automatically create a personal workspace for new users
            $user->createPersonalWorkspace();
        });
    }
    
    // Relationships
    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function workspaces()
    {
        return $this->belongsToMany(Workspace::class, 'workspace_users')
                    ->withPivot('role', 'joined_at')
                    ->withTimestamps();
    }

    public function ownedWorkspaces()
    {
        return $this->hasMany(Workspace::class, 'owner_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    // Scopes
    public function scopeAdmins($query)
    {
        return $query->where('platform_role', 'admin');
    }

    /**
     * Check if the user is admin
     */
    public function isAdmin(): bool
    {
        return $this->platform_role === 'admin';
    }

    /**
     * Accessor for is_admin attribute
     * This makes isAdmin() available as a serialized property
     */
    public function getIsAdminAttribute(): bool
    {
        return $this->isAdmin();
    }

    /**
     * Get user initials for avatar display
     */
    public function getInitials(): string
    {
        $words = explode(' ', trim($this->name));
        if (count($words) >= 2) {
            return strtoupper(substr($words[0], 0, 1) . substr($words[1], 0, 1));
        }
        return strtoupper(substr($this->name, 0, 2));
    }

    /**
     * Get consistent avatar color based on user ID
     */
    public function getAvatarColor(): string
    {
        $colors = [
            'from-blue-500 to-blue-600',
            'from-emerald-500 to-emerald-600', 
            'from-purple-500 to-purple-600',
            'from-orange-500 to-orange-600',
            'from-pink-500 to-pink-600',
            'from-indigo-500 to-indigo-600',
            'from-red-500 to-red-600',
            'from-yellow-500 to-yellow-600',
            'from-green-500 to-green-600',
            'from-cyan-500 to-cyan-600',
        ];
        
        return $colors[$this->id % count($colors)];
    }

    /**
     * Check if user has GitHub connected
     */
    public function hasGitHubConnected(): bool
    {
        return !empty($this->github_id);
    }

    /**
     * Check if GitHub token is valid and not expired
     */
    public function isGitHubTokenValid(): bool
    {
        if (!$this->github_token) {
            return false;
        }

        // If we have an expiration time, check if it's still valid
        if ($this->github_token_expires_at) {
            return $this->github_token_expires_at->isFuture();
        }

        // If no expiration time is set, assume token is valid
        // (GitHub personal access tokens don't expire by default)
        return true;
    }

    /**
     * Get GitHub API headers for authentication
     * SIMPLIFIED VERSION - no encryption for now
     */
    public function getGitHubApiHeaders(): array
    {
        return [
            'Authorization' => 'token ' . $this->github_token,
            'Accept' => 'application/vnd.github.v3+json',
            'User-Agent' => config('app.name', 'DeCode') . '/1.0'
        ];
    }

    /**
     * Test if the current GitHub token works by making a simple API call
     */
    public function testGitHubToken(): bool
    {
        if (!$this->github_token) {
            return false;
        }

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders($this->getGitHubApiHeaders())
                ->timeout(10)
                ->get('https://api.github.com/user');
            
            if ($response->successful()) {
                return true;
            }
            
            // If token is invalid, mark it as expired
            if ($response->status() === 401) {
                $this->update(['github_token_expires_at' => now()->subMinute()]);
            }
            
            return false;
        } catch (\Exception $e) {
            Log::error('GitHub token test failed: ' . $e->getMessage());
            return false;
        }
    }

    // Workspace methods
    public function getAllWorkspaces()
    {
        return Workspace::forUser($this->id)
                        ->with(['owner', 'users'])
                        ->orderBy('created_at', 'desc')
                        ->get();
    }

    public function getPersonalWorkspace()
    {
        return $this->ownedWorkspaces()
                    ->where('type', 'personal')
                    ->first();
    }

    public function createPersonalWorkspace()
    {
        $workspace = $this->ownedWorkspaces()->create([
            'name' => $this->name . "'s Personal Workspace",
            'type' => 'personal',
            'description' => 'Personal workspace for ' . $this->name,
            'settings' => (new Workspace())->getDefaultSettings()
        ]);

        return $workspace;
    }
    
    // Ensure user has a personal workspace
    public function ensurePersonalWorkspace()
    {
        $personalWorkspace = $this->getPersonalWorkspace();
        
        if (!$personalWorkspace) {
            return $this->createPersonalWorkspace();
        }
        
        return $personalWorkspace;
    }

    public function getCurrentWorkspace()
    {
        // For now, return personal workspace or first available workspace
        $personalWorkspace = $this->getPersonalWorkspace();
        
        if ($personalWorkspace) {
            return $personalWorkspace;
        }

        // If no personal workspace, return first workspace user has access to
        return $this->getAllWorkspaces()->first();
    }

    // Helper methods for projects
    public function getRecentProjects($limit = 5)
    {
        return $this->projects()
            ->recent()
            ->limit($limit)
            ->get();
    }

    public function getProjectsCount()
    {
        return $this->projects()->count();
    }

    /**
     * Get GitHub projects (projects imported from GitHub)
     */
    public function getGitHubProjects()
    {
        return $this->projects()
            ->whereJsonContains('settings->imported_from_github', true)
            ->get();
    }

    /**
     * Disconnect GitHub account
     */
    public function disconnectGitHub(): void
    {
        $this->update([
            'github_id' => null,
            'github_username' => null,
            'github_token' => null,
            'github_refresh_token' => null,
            'github_token_expires_at' => null,
        ]);
    }
}