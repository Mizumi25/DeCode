<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Crypt;

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
     * Get decrypted GitHub token
     */
    public function getGitHubToken(): ?string
    {
        if (!$this->github_token) {
            return null;
        }

        try {
            return Crypt::decryptString($this->github_token);
        } catch (\Exception $e) {
            // Token might be corrupted or unencrypted legacy data
            return null;
        }
    }

    /**
     * Set encrypted GitHub token
     */
    public function setGitHubToken(?string $token): void
    {
        if ($token) {
            $this->github_token = Crypt::encryptString($token);
        } else {
            $this->github_token = null;
        }
    }

    /**
     * Check if GitHub token is valid (not expired)
     */
    public function isGitHubTokenValid(): bool
    {
        if (!$this->github_token) {
            return false;
        }

        // If we don't have an expiration date, assume it's valid
        if (!$this->github_token_expires_at) {
            return true;
        }

        return $this->github_token_expires_at->isFuture();
    }

    /**
     * Get GitHub API headers with authentication
     */
    public function getGitHubApiHeaders(): array
    {
        $headers = [
            'Accept' => 'application/vnd.github.v3+json',
            'User-Agent' => config('app.name', 'DeCode'),
        ];

        $token = $this->getGitHubToken();
        if ($token && $this->isGitHubTokenValid()) {
            $headers['Authorization'] = 'token ' . $token;
        }

        return $headers;
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