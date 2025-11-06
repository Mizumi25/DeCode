<?php
// app/Models/Message.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'user_id',
        'content',
        'type',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relationships
    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function mentions()
    {
        return $this->hasMany(MessageMention::class);
    }

    // Scopes
    public function scopeForWorkspace($query, $workspaceId)
    {
        return $query->where('workspace_id', $workspaceId);
    }

    public function scopeWithMentions($query)
    {
        return $query->with(['mentions.user', 'mentions.mentionable']);
    }

    // Helper methods
    public function hasMentions()
    {
        return $this->mentions()->exists();
    }

    public function getMentionedUsers()
    {
        return $this->mentions()
            ->where('mentionable_type', User::class)
            ->with('user')
            ->get()
            ->pluck('user');
    }
}