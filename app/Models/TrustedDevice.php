<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class TrustedDevice extends Model
{
    protected $fillable = [
        'user_id',
        'device_fingerprint',
        'device_name',
        'ip_address',
        'user_agent',
        'last_used_at',
        'expires_at',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Relationships
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate device fingerprint from request
     */
    public static function generateFingerprint(): string
    {
        $userAgent = request()->userAgent();
        $ip = request()->ip();
        
        // Simple fingerprint - you can enhance this with more data
        return hash('sha256', $userAgent . $ip);
    }

    /**
     * Check if device is trusted for this user
     */
    public static function isTrusted(int $userId): bool
    {
        $fingerprint = self::generateFingerprint();
        
        return self::where('user_id', $userId)
            ->where('device_fingerprint', $fingerprint)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', Carbon::now());
            })
            ->exists();
    }

    /**
     * Mark device as trusted
     */
    public static function trustDevice(int $userId, bool $rememberMe = false): self
    {
        $fingerprint = self::generateFingerprint();
        $deviceName = self::getDeviceName();
        
        return self::updateOrCreate(
            [
                'user_id' => $userId,
                'device_fingerprint' => $fingerprint,
            ],
            [
                'device_name' => $deviceName,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'last_used_at' => Carbon::now(),
                'expires_at' => $rememberMe ? Carbon::now()->addDays(30) : null,
            ]
        );
    }

    /**
     * Get human-readable device name
     */
    private static function getDeviceName(): string
    {
        $userAgent = request()->userAgent();
        
        // Simple browser detection
        if (str_contains($userAgent, 'Chrome')) {
            $browser = 'Chrome';
        } elseif (str_contains($userAgent, 'Firefox')) {
            $browser = 'Firefox';
        } elseif (str_contains($userAgent, 'Safari')) {
            $browser = 'Safari';
        } elseif (str_contains($userAgent, 'Edge')) {
            $browser = 'Edge';
        } else {
            $browser = 'Unknown Browser';
        }
        
        // Simple OS detection
        if (str_contains($userAgent, 'Windows')) {
            $os = 'Windows';
        } elseif (str_contains($userAgent, 'Mac')) {
            $os = 'macOS';
        } elseif (str_contains($userAgent, 'Linux')) {
            $os = 'Linux';
        } elseif (str_contains($userAgent, 'Android')) {
            $os = 'Android';
        } elseif (str_contains($userAgent, 'iOS')) {
            $os = 'iOS';
        } else {
            $os = 'Unknown OS';
        }
        
        return "{$browser} on {$os}";
    }

    /**
     * Update last used timestamp
     */
    public function updateLastUsed(): void
    {
        $this->update(['last_used_at' => Carbon::now()]);
    }
}
