<?php

// app/Models/Workspace.php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workspace extends Model {
    use HasFactory;

    protected $fillable = ['owner_id','name','description','settings'];
    protected $casts = ['settings' => 'array'];

    public function owner() {
        return $this->belongsTo(User::class, 'owner_id');
    }
    public function users() {
        return $this->belongsToMany(User::class, 'workspace_users')->withPivot('role');
    }
    public function projects() {
        return $this->hasMany(Project::class);
    }
}
