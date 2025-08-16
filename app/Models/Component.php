<?php
// app/Models/Component.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Component extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'category',
        'description',
        'icon',
        'default_props',
        'prop_definitions',
        'render_template',
        'code_generators',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'default_props' => 'array',
        'prop_definitions' => 'array',
        'code_generators' => 'array',
        'is_active' => 'boolean'
    ];

    public function projectComponents()
    {
        return $this->hasMany(ProjectComponent::class, 'component_type', 'type');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('category')->orderBy('sort_order')->orderBy('name');
    }
}