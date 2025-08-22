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
        'component_type',
        'category',
        'alphabet_group',
        'description',
        'icon',
        'default_props',
        'prop_definitions',
        'render_template',
        'code_generators',
        'variants',
        'has_animation',
        'animation_type',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'default_props' => 'array',
        'prop_definitions' => 'array',
        'code_generators' => 'array',
        'variants' => 'array',
        'is_active' => 'boolean',
        'has_animation' => 'boolean'
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

    public function scopeByComponentType($query, $type)
    {
        return $query->where('component_type', $type);
    }

    public function scopeByAlphabetGroup($query, $letter)
    {
        return $query->where('alphabet_group', strtoupper($letter));
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('component_type')
                     ->orderBy('alphabet_group')
                     ->orderBy('category')
                     ->orderBy('sort_order')
                     ->orderBy('name');
    }

    public function scopeSearch($query, $search)
    {
        if (empty($search)) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', '%' . $search . '%')
              ->orWhere('description', 'like', '%' . $search . '%')
              ->orWhere('category', 'like', '%' . $search . '%');
        });
    }
}