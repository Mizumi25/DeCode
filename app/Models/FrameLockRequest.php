<?php
// app/Models/FrameLockRequest.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class FrameLockRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'frame_id',
        'requester_user_id',
        'frame_owner_user_id',
        'requested_mode',
        'message',
        'status',
        'expires_at',
        'responded_at',
        'response_message',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'responded_at' => 'datetime',
    ];

    public static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->uuid = (string) Str::uuid();
        });
    }

    public function getRouteKeyName()
    {
        return 'uuid';
    }

    // Relationships
    public function frame()
    {
        return $this->belongsTo(Frame::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_user_id');
    }

    public function frameOwner()
    {
        return $this->belongsTo(User::class, 'frame_owner_user_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending')
                    ->where('expires_at', '>', now());
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'pending')
                    ->where('expires_at', '<=', now());
    }

    public function scopeForFrameOwner($query, $userId)
    {
        return $query->where('frame_owner_user_id', $userId);
    }

    public function scopeForRequester($query, $userId)
    {
        return $query->where('requester_user_id', $userId);
    }

    // Helper methods
    public function isPending(): bool
    {
        return $this->status === 'pending' && $this->expires_at > now();
    }

    public function isExpired(): bool
    {
        return $this->status === 'pending' && $this->expires_at <= now();
    }

    public function approve(string $responseMessage = null): bool
    {
        if (!$this->isPending()) {
            return false;
        }

        return $this->update([
            'status' => 'approved',
            'responded_at' => now(),
            'response_message' => $responseMessage,
        ]);
    }

    public function reject(string $responseMessage = null): bool
    {
        if (!$this->isPending()) {
            return false;
        }

        return $this->update([
            'status' => 'rejected',
            'responded_at' => now(),
            'response_message' => $responseMessage,
        ]);
    }

    public function markAsExpired(): bool
    {
        if ($this->status !== 'pending') {
            return false;
        }

        return $this->update([
            'status' => 'expired',
            'responded_at' => now(),
        ]);
    }

    // Static helper methods
    public static function createRequest(
        int $frameId, 
        int $requesterId, 
        int $frameOwnerId, 
        string $mode, 
        string $message = null,
        int $expirationMinutes = 10
    ): self {
        return self::create([
            'frame_id' => $frameId,
            'requester_user_id' => $requesterId,
            'frame_owner_user_id' => $frameOwnerId,
            'requested_mode' => $mode,
            'message' => $message,
            'expires_at' => now()->addMinutes($expirationMinutes),
        ]);
    }

    public static function cleanupExpired(): int
    {
        return self::expired()->update([
            'status' => 'expired',
            'responded_at' => now(),
        ]);
    }

    public static function hasPendingRequest(int $frameId, int $requesterId): bool
    {
        return self::pending()
                  ->where('frame_id', $frameId)
                  ->where('requester_user_id', $requesterId)
                  ->exists();
    }
}