<?php
// app/Models/Asset.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'user_id',
        'project_id',
        'name',
        'type',
        'file_path',
        'thumbnail_path',
        'file_size',
        'mime_type',
        'dimensions',
        'duration',
        'metadata',
        'tags',
        'is_public'
    ];

    protected $casts = [
        'dimensions' => 'array',
        'metadata' => 'array',
        'tags' => 'array',
        'is_public' => 'boolean',
        'duration' => 'float'
    ];

    protected $hidden = [
        'file_path',
        'user_id'
    ];

    protected $appends = [
        'url',
        'thumbnail_url',
        'formatted_size'
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
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id', 'uuid');
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeImages($query)
    {
        return $query->where('type', 'image');
    }

    public function scopeVideos($query)
    {
        return $query->where('type', 'video');
    }

    public function scopeAudio($query)
    {
        return $query->where('type', 'audio');
    }

    public function scopeDocuments($query)
    {
        return $query->where('type', 'document');
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopePrivate($query)
    {
        return $query->where('is_public', false);
    }

    public function scopeByProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    // Accessors
    public function getUrlAttribute()
    {
        return $this->file_path ? asset('storage/' . $this->file_path) : null;
    }

    public function getThumbnailUrlAttribute()
    {
        return $this->thumbnail_path ? asset('storage/' . $this->thumbnail_path) : null;
    }

    public function getFormattedSizeAttribute()
    {
        return $this->formatBytes($this->file_size);
    }

    public function getIsImageAttribute()
    {
        return $this->type === 'image';
    }

    public function getIsVideoAttribute()
    {
        return $this->type === 'video';
    }

    public function getIsAudioAttribute()
    {
        return $this->type === 'audio';
    }

    public function getIsDocumentAttribute()
    {
        return $this->type === 'document';
    }

    // Helper methods
    public function formatBytes($bytes, $precision = 2)
    {
        if ($bytes == 0) return '0 Bytes';
        
        $k = 1024;
        $sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        $i = floor(log($bytes) / log($k));
        
        return round($bytes / pow($k, $i), $precision) . ' ' . $sizes[$i];
    }

    public function getDominantColor()
    {
        if ($this->type === 'image' && isset($this->metadata['dominant_color'])) {
            return $this->metadata['dominant_color'];
        }
        return null;
    }

    public function getAspectRatio()
    {
        if ($this->dimensions && isset($this->dimensions['width']) && isset($this->dimensions['height'])) {
            $width = $this->dimensions['width'];
            $height = $this->dimensions['height'];
            
            if ($height > 0) {
                return round($width / $height, 2);
            }
        }
        return null;
    }

    public function isLandscape()
    {
        $ratio = $this->getAspectRatio();
        return $ratio && $ratio > 1;
    }

    public function isPortrait()
    {
        $ratio = $this->getAspectRatio();
        return $ratio && $ratio < 1;
    }

    public function isSquare()
    {
        $ratio = $this->getAspectRatio();
        return $ratio && abs($ratio - 1) < 0.1; // Allow for small variations
    }

    public function getReadableDuration()
    {
        if (!$this->duration) return null;
        
        $seconds = intval($this->duration);
        $minutes = floor($seconds / 60);
        $seconds = $seconds % 60;
        
        if ($minutes > 0) {
            return sprintf('%d:%02d', $minutes, $seconds);
        }
        
        return sprintf('0:%02d', $seconds);
    }

    public function addTag($tag)
    {
        $tags = $this->tags ?? [];
        if (!in_array($tag, $tags)) {
            $tags[] = $tag;
            $this->tags = $tags;
            $this->save();
        }
        return $this;
    }

    public function removeTag($tag)
    {
        $tags = $this->tags ?? [];
        $tags = array_filter($tags, fn($t) => $t !== $tag);
        $this->tags = array_values($tags);
        $this->save();
        return $this;
    }

    public function hasTag($tag)
    {
        return in_array($tag, $this->tags ?? []);
    }

    public function toArray()
    {
        $array = parent::toArray();
        
        // Add computed properties
        $array['url'] = $this->url;
        $array['thumbnail_url'] = $this->thumbnail_url;
        $array['formatted_size'] = $this->formatted_size;
        $array['aspect_ratio'] = $this->getAspectRatio();
        $array['readable_duration'] = $this->getReadableDuration();
        $array['is_landscape'] = $this->isLandscape();
        $array['is_portrait'] = $this->isPortrait();
        $array['is_square'] = $this->isSquare();
        
        return $array;
    }
}