<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class EmailVerification extends Model
{
    protected $fillable = [
        'email',
        'code',
        'type',
        'ip_address',
        'user_agent',
        'expires_at',
        'verified_at',
        'is_used',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'verified_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    /**
     * Generate a random verification code
     */
    public static function generateCode(string $type = 'register'): string
    {
        $length = $type === 'register' ? 6 : 8;
        $code = '';
        
        for ($i = 0; $i < $length; $i++) {
            $code .= random_int(0, 9);
        }
        
        return $code;
    }

    /**
     * Create a new verification code
     */
    public static function createCode(string $email, string $type = 'register'): self
    {
        // Invalidate any existing codes for this email
        self::where('email', $email)
            ->where('type', $type)
            ->where('is_used', false)
            ->update(['is_used' => true]);

        return self::create([
            'email' => $email,
            'code' => self::generateCode($type),
            'type' => $type,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'expires_at' => Carbon::now()->addMinutes(10), // 10 minutes expiry
        ]);
    }

    /**
     * Verify a code
     */
    public static function verifyCode(string $email, string $code, string $type = 'register'): bool
    {
        $verification = self::where('email', $email)
            ->where('code', $code)
            ->where('type', $type)
            ->where('is_used', false)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$verification) {
            return false;
        }

        $verification->update([
            'is_used' => true,
            'verified_at' => Carbon::now(),
        ]);

        return true;
    }

    /**
     * Check if code is still valid
     */
    public function isValid(): bool
    {
        return !$this->is_used && $this->expires_at->isFuture();
    }
}
