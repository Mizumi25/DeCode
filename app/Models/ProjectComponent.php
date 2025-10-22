<?php
// app/Models/ProjectComponent.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProjectComponent extends Model
{
    use HasFactory;

    // app/Models/ProjectComponent.php - MODIFIED fillable and casts
    protected $fillable = [
        'project_id',
        'frame_id',
        'parent_id',
        'component_instance_id',
        'component_type',
        'props',
        'text_content',      // 🔥 NEW
        'name',
        'z_index',
        'sort_order',
        'is_locked',
        'variant',
        'style',
        'animation',
        'display_type',
        'layout_props',
        'is_layout_container',
        'visible',           // 🔥 NEW
        'locked',            // 🔥 NEW
    ];
    
    protected $casts = [
        'props' => 'array',
        'is_locked' => 'boolean',
        'variant' => 'array',
        'style' => 'array',
        'animation' => 'array',
        'layout_props' => 'array',
        'is_layout_container' => 'boolean',
        'visible' => 'boolean',     // 🔥 NEW
        'locked' => 'boolean',      // 🔥 NEW
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