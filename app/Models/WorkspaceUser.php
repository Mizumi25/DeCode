<?php

// app/Models/WorkspaceUser.php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkspaceUser extends Model {
    use HasFactory;
    protected $fillable = ['workspace_id','user_id','role','discipline','discipline_order'];

    public function workspace() {
        return $this->belongsTo(Workspace::class);
    }
    public function user() {
        return $this->belongsTo(User::class);
    }
}
