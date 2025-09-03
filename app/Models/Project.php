<?php
// app/Models/Project.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid', // Add this
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
        'css_framework',
        'output_format',
        'workspace_id', 
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
    
    // This is new
    public static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->uuid = (string) Str::uuid();
        });
    }

    // This is new, it tells Laravel to use the 'uuid' column for route model binding
    public function getRouteKeyName()
    {
        return 'uuid';
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function frames()
    {
        return $this->hasMany(Frame::class);
    }

    public function projectComponents()
    {
        return $this->hasMany(ProjectComponent::class);
    }
    
    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
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
    
    public function scopeForWorkspace($query, $workspaceId)
    {
        return $query->where('workspace_id', $workspaceId);
    }

    public function scopeForUserAndWorkspace($query, $userId, $workspaceId = null)
    {
        $query->where('user_id', $userId);
        
        if ($workspaceId) {
            $query->where('workspace_id', $workspaceId);
        }
        
        return $query;
    }

    // Mutators & Accessors
    public function getFormattedLastOpenedAttribute()
    {
        return $this->last_opened_at ? $this->last_opened_at->diffForHumans() : 'Never opened';
    }

    public function getComponentCountAttribute()
    {
        // Count components from canvas_data frames
        $canvasData = $this->canvas_data ?? [];
        $frames = $canvasData['frames'] ?? [];
        
        $totalComponents = 0;
        foreach ($frames as $frame) {
            $totalComponents += count($frame['components'] ?? []);
        }
        
        return $totalComponents;
    }

    public function getFrameCountAttribute()
    {
        $canvasData = $this->canvas_data ?? [];
        return count($canvasData['frames'] ?? []);
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
        $newProject->is_public = false; // Duplicates are always private
        $newProject->save();

        return $newProject;
    }

    public function generateThumbnail()
    {
        // Logic to generate thumbnail from canvas_data
        // This could be implemented later with a service
        return null;
    }

    public function getFrame($frameId)
    {
        $canvasData = $this->canvas_data ?? [];
        $frames = $canvasData['frames'] ?? [];
        
        return collect($frames)->firstWhere('id', $frameId);
    }

    public function updateFrame($frameId, $frameData)
    {
        $canvasData = $this->canvas_data ?? ['frames' => []];
        $frames = $canvasData['frames'] ?? [];
        
        $frameIndex = collect($frames)->search(function ($frame) use ($frameId) {
            return $frame['id'] === $frameId;
        });
        
        if ($frameIndex !== false) {
            $canvasData['frames'][$frameIndex] = array_merge($frames[$frameIndex], $frameData);
            $this->update(['canvas_data' => $canvasData]);
            return true;
        }
        
        return false;
    }

    public function deleteFrame($frameId)
    {
        $canvasData = $this->canvas_data ?? ['frames' => []];
        $frames = $canvasData['frames'] ?? [];
        
        $canvasData['frames'] = array_values(array_filter($frames, function ($frame) use ($frameId) {
            return $frame['id'] !== $frameId;
        }));
        
        $this->update(['canvas_data' => $canvasData]);
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
            'theme' => 'light',
            'responsive_breakpoints' => [
                'mobile' => 375,
                'tablet' => 768,
                'desktop' => 1440
            ]
        ];
    }

    public static function getDefaultExportSettings()
    {
        return [
            'format' => 'zip',
            'include_css' => true,
            'include_js' => true,
            'minify_code' => false,
            'responsive' => true,
            'framework' => 'vanilla',
            'include_assets' => true,
            'output_structure' => 'standard' // standard, single-file, component-library
        ];
    }

    public static function getProjectTypeOptions()
    {
        return [
            'website' => [
                'name' => 'Website',
                'description' => 'Multi-page website with navigation',
                'default_frames' => ['Home', 'About', 'Contact'],
                'suggested_output' => 'html'
            ],
            'landing_page' => [
                'name' => 'Landing Page',  
                'description' => 'Single page marketing experience',
                'default_frames' => ['Landing'],
                'suggested_output' => 'html'
            ],
            'component_library' => [
                'name' => 'Design System',
                'description' => 'Reusable component collection',
                'default_frames' => ['Button', 'Card', 'Input'],
                'suggested_output' => 'react'
            ],
            'dashboard' => [
                'name' => 'Dashboard',
                'description' => 'Data-driven interface',
                'default_frames' => ['Overview', 'Analytics', 'Settings'],
                'suggested_output' => 'react'
            ],
            'email_template' => [
                'name' => 'Email Template',
                'description' => 'Responsive email template',
                'default_frames' => ['Email'],
                'suggested_output' => 'html'
            ],
            'prototype' => [
                'name' => 'Prototype',
                'description' => 'Interactive prototype',
                'default_frames' => ['Screen 1'],
                'suggested_output' => 'html'
            ]
        ];
    }

    public static function getOutputFormatOptions()
    {
        return [
            'html' => [
                'name' => 'HTML/CSS/JS',
                'description' => 'Static HTML with CSS and JavaScript',
                'extensions' => ['html', 'css', 'js'],
                'frameworks' => ['vanilla', 'tailwind', 'bootstrap']
            ],
            'react' => [
                'name' => 'React',
                'description' => 'React components with JSX',
                'extensions' => ['jsx', 'css', 'js'],
                'frameworks' => ['tailwind', 'styled_components', 'emotion']
            ],
            'vue' => [
                'name' => 'Vue.js',
                'description' => 'Vue single file components',
                'extensions' => ['vue', 'css', 'js'],
                'frameworks' => ['tailwind', 'vuetify']
            ],
            'angular' => [
                'name' => 'Angular',
                'description' => 'Angular components with TypeScript',
                'extensions' => ['ts', 'html', 'css'],
                'frameworks' => ['angular_material', 'tailwind']
            ]
        ];
    }

    public function getCompatibleFrameworks()
    {
        $outputFormats = self::getOutputFormatOptions();
        return $outputFormats[$this->output_format]['frameworks'] ?? ['vanilla'];
    }

    public function getSuggestedOutputFormat()
    {
        $projectTypes = self::getProjectTypeOptions();
        return $projectTypes[$this->type]['suggested_output'] ?? 'html';
    }
}