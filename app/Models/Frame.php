<?php

// app/Models/Frame.php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Frame extends Model {
    use HasFactory;
    protected $fillable = ['project_id','name','type','canvas_data','settings'];
    protected $casts = ['canvas_data'=>'array','settings'=>'array'];

    public function project() {
        return $this->belongsTo(Project::class);
    }
}
