<?php
// app/Models/ProjectComponent.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProjectComponent extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'frame_id', // Change from frame_uuid to frame_id for consistency
        'component_instance_id',
        'component_type',
        'props',
        'position',
        'name',
        'z_index',
        'is_locked',
        'variant',        // ADD
        'style',          // ADD
        'animation',      // ADD
        'created_at',
        'updated_at'
    ];
    
    protected $casts = [
        'props' => 'array',
        'position' => 'array',
        'is_locked' => 'boolean',
        'variant' => 'array',     // ADD
        'style' => 'array',       // ADD
        'animation' => 'array'    // ADD
    ];

    public function component()
    {
        return $this->belongsTo(Component::class, 'component_type', 'type');
    }

    public function scopeByProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeByFrame($query, $frameId)
    {
        return $query->where('frame_id', $frameId);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('z_index')->orderBy('created_at');
    }
}