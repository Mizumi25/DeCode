<?php

// app/Models/Presence.php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Presence extends Model {
    use HasFactory;
    protected $fillable = ['project_id','user_id','cursor_position','selection_state','last_ping'];
    protected $casts = ['cursor_position'=>'array','selection_state'=>'array','last_ping'=>'datetime'];
}
