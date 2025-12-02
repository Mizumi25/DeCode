<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class FrameContainer extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'project_id',
        'name',
        'x',
        'y',
        'width',
        'height',
        'orientation',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
        'x' => 'integer',
        'y' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($container) {
            if (empty($container->uuid)) {
                $container->uuid = (string) Str::uuid();
            }
        });
    }

    // Relationships
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function frames()
    {
        return $this->hasMany(Frame::class, 'container_id')->orderBy('container_order');
    }
}
