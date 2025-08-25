<?php

// app/Models/Revision.php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Revision extends Model {
    use HasFactory;
    protected $fillable = ['project_id','user_id','change_data'];
    protected $casts = ['change_data'=>'array'];
}
