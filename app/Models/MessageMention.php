<?php
// app/Models/MessageMention.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MessageMention extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'user_id',
        'mentionable_type',
        'mentionable_id',
        'position',
        'length'
    ];

    protected $casts = [
        'position' => 'integer',
        'length' => 'integer'
    ];

    // Relationships
    public function message()
    {
        return $this->belongsTo(Message::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function mentionable()
    {
        return $this->morphTo();
    }
}