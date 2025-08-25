<?php

// app/Models/Message.php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model {
    use HasFactory;
    protected $fillable = ['workspace_id','project_id','user_id','type','body'];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
