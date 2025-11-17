<?php
// app/Models/FrameCursor.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FrameCursor extends Model
{
    protected $fillable = [
        'frame_id',
        'user_id',
        'session_id',
        'x',
        'y',
        'viewport_mode',
        'color',
        'meta',
        'last_seen_at',
    ];

    protected $casts = [
        'x' => 'float',
        'y' => 'float',
        'meta' => 'array',
        'last_seen_at' => 'datetime',
    ];

    public function frame(): BelongsTo
    {
        return $this->belongsTo(Frame::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Clean up stale cursors (inactive for >30 seconds)
     */
    public static function cleanupStale(): int
    {
        return self::where('last_seen_at', '<', now()->subSeconds(30))->delete();
    }

    /**
     * Get active cursors for a frame
     */
    public static function getActiveCursors(int $frameId): array
    {
        return self::with('user:id,name,avatar')
            ->where('frame_id', $frameId)
            ->where('last_seen_at', '>=', now()->subSeconds(30))
            ->get()
            ->map(fn($cursor) => [
                'userId' => $cursor->user_id,
                'sessionId' => $cursor->session_id,
                'userName' => $cursor->user->name,
                'userAvatar' => $cursor->user->avatar,
                'x' => $cursor->x,
                'y' => $cursor->y,
                'viewportMode' => $cursor->viewport_mode,
                'color' => $cursor->color,
                'meta' => $cursor->meta,
                'lastSeen' => $cursor->last_seen_at->toISOString(),
            ])
            ->toArray();
    }
}