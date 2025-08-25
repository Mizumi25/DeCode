<?php
// app/Models/Project.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'type',
        'status',
        'thumbnail',
        'settings',
        'canvas_data',
        'export_settings',
        'last_opened_at',
        'is_public',
        'template_id',
        'viewport_width',
        'viewport_height',
        'css_framework'
    ];

    protected $casts = [
        'settings' => 'array',
        'canvas_data' => 'array',
        'export_settings' => 'array',
        'last_opened_at' => 'datetime',
        'is_public' => 'boolean',
        'viewport_width' => 'integer',
        'viewport_height' => 'integer'
    ];

    protected $dates = [
        'deleted_at',
        'last_opened_at'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function projectComponents()
    {
        return $this->hasMany(ProjectComponent::class);
    }

    public function frames()
    {
        return $this->hasMany(Frame::class); // If you plan to have frames/pages
    }

    // Scopes
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('last_opened_at', 'desc')
                     ->orderBy('updated_at', 'desc');
    }

    public function scopeSearch($query, $search)
    {
        if (empty($search)) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', '%' . $search . '%')
              ->orWhere('description', 'like', '%' . $search . '%');
        });
    }

    // Mutators & Accessors
    public function getFormattedLastOpenedAttribute()
    {
        return $this->last_opened_at ? $this->last_opened_at->diffForHumans() : 'Never opened';
    }

    public function getComponentCountAttribute()
    {
        return $this->projectComponents()->count();
    }

    // Helper Methods
    public function updateLastOpened()
    {
        $this->update(['last_opened_at' => now()]);
    }

    public function duplicate($newName = null)
    {
        $newProject = $this->replicate();
        $newProject->name = $newName ?? ($this->name . ' (Copy)');
        $newProject->last_opened_at = null;
        $newProject->save();

        // Copy components
        foreach ($this->projectComponents as $component) {
            $newComponent = $component->replicate();
            $newComponent->project_id = $newProject->id;
            $newComponent->save();
        }

        return $newProject;
    }

    public function generateThumbnail()
    {
        // Logic to generate thumbnail from canvas_data
        // This could be implemented later with a service
        return null;
    }

    // Default values
    public static function getDefaultSettings()
    {
        return [
            'auto_save' => true,
            'grid_enabled' => true,
            'snap_to_grid' => true,
            'grid_size' => 10,
            'zoom_level' => 100,
            'show_rulers' => true,
            'theme' => 'light'
        ];
    }

    public static function getDefaultExportSettings()
    {
        return [
            'format' => 'html',
            'include_css' => true,
            'minify' => false,
            'responsive' => true,
            'framework' => 'vanilla'
        ];
    }
}