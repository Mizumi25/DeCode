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
        'frame_id',
        'component_instance_id',
        'component_type',
        'props',
        'position',
        'name',
        'z_index',
        'is_locked'
    ];

    protected $casts = [
        'props' => 'array',
        'position' => 'array',
        'is_locked' => 'boolean'
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