<?php

// app/Models/Comment.php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model {
    use HasFactory;
    protected $fillable = ['project_id','frame_id','user_id','body','resolved_at'];
    protected $casts = ['resolved_at'=>'datetime'];
}
