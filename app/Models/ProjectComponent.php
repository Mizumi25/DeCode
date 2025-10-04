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
        'parent_id',
        'component_instance_id',
        'component_type',
        'props',
        'name',
        'z_index',
        'sort_order',
        'is_locked',
        'variant',        // ADD
        'style',          // ADD
        'animation',      // ADD
        'display_type',      // 'block', 'flex', 'grid', 'inline-block', etc.
        'layout_props',      // flexDirection, gap, gridTemplateColumns, etc.
        'is_layout_container', // boolean
        'created_at',
        'updated_at'
    ];
    
    protected $casts = [
        'props' => 'array',
        'is_locked' => 'boolean',
        'variant' => 'array',     // ADD
        'style' => 'array',       // ADD
        'animation' => 'array',   // ADD
        'layout_props' => 'array',
        'is_layout_container' => 'boolean',
    ];
    
    // ADD this relationship
  public function parent()
  {
      return $this->belongsTo(ProjectComponent::class, 'parent_id');
  }
  
  // ADD this relationship
  public function children()
  {
      return $this->hasMany(ProjectComponent::class, 'parent_id');
  }
    

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