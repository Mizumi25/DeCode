<?php

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
    
    // Relationships
    public function projects()
    {
        return $this->hasMany(Project::class);
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