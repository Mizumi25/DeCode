<?php
// app/Models/Icon.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Icon extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'category',
        'alphabet_group',
        'description',
        'svg_code',
        'library_name',
        'metadata',
        'tags',
        'user_id',
        'is_system',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'metadata' => 'array',
        'tags' => 'array',
        'is_system' => 'boolean',
        'is_active' => 'boolean'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    public function scopeUserUploaded($query)
    {
        return $query->where('is_system', false);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByAlphabetGroup($query, $letter)
    {
        return $query->where('alphabet_group', strtoupper($letter));
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where(function($q) use ($userId) {
            $q->where('is_system', true)
              ->orWhere('user_id', $userId);
        });
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('type')
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
              ->orWhere('category', 'like', '%' . $search . '%')
              ->orWhereJsonContains('tags', $search);
        });
    }
}
