<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id', 
        'github_id',
        'avatar',
        'platform_role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // This automatically includes is_admin when the model is serialized
    protected $appends = ['is_admin'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
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
}