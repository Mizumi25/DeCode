<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Revision extends Model 
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'uuid',
        'project_id',
        'frame_id', 
        'user_id',
        'revision_type', // 'manual', 'auto', 'github_sync'
        'title',
        'description',
        'component_data',
        'metadata',
        'github_commit_sha',
        'parent_revision_id'
    ];
    
    protected $casts = [
        'component_data' => 'array',
        'metadata' => 'array'
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

    public function frame()
    {
        return $this->belongsTo(Frame::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parentRevision()
    {
        return $this->belongsTo(Revision::class, 'parent_revision_id');
    }

    public function childRevisions()
    {
        return $this->hasMany(Revision::class, 'parent_revision_id');
    }

    // Scopes
    public function scopeByProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeByFrame($query, $frameId)
    {
        return $query->where('frame_id', $frameId);
    }

    public function scopeManual($query)
    {
        return $query->where('revision_type', 'manual');
    }

    public function scopeAuto($query)
    {
        return $query->where('revision_type', 'auto');
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    // Helper methods
    public static function createSnapshot($projectId, $frameId, $userId, $components, $type = 'auto', $title = null)
    {
        return static::create([
            'project_id' => $projectId,
            'frame_id' => $frameId,
            'user_id' => $userId,
            'revision_type' => $type,
            'title' => $title ?: "Snapshot " . now()->format('M j, Y g:i A'),
            'component_data' => $components,
            'metadata' => [
                'component_count' => count($components),
                'timestamp' => now()->toISOString()
            ]
        ]);
    }
}