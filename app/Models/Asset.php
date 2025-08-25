<?php

// app/Models/Asset.php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model {
    use HasFactory;
    protected $fillable = ['workspace_id','project_id','user_id','path','type','metadata'];
    protected $casts = ['metadata'=>'array'];
}
