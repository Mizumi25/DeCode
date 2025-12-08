<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FrameComponentAssignment extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'page_frame_id',
        'component_frame_id',
        'position',
        'x',
        'y',
        'override_props',
    ];
    
    protected $casts = [
        'override_props' => 'array',
        'position' => 'integer',
        'x' => 'integer',
        'y' => 'integer',
    ];
    
    // Relationships
    public function pageFrame()
    {
        return $this->belongsTo(Frame::class, 'page_frame_id');
    }
    
    public function componentFrame()
    {
        return $this->belongsTo(Frame::class, 'component_frame_id');
    }
}
