<?php
// app/Models/Invite.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class Invite extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'email',
        'role',
        'token',
        'status', // pending, accepted, expired, revoked
        'expires_at',
        'invited_by'
    ];

    protected $casts = [
        'expires_at' => 'datetime'
    ];

    protected static function booted()
    {
        static::creating(function ($invite) {
            if (empty($invite->token)) {
                $invite->token = Str::random(32);
            }
            
            if (empty($invite->expires_at)) {
                $invite->expires_at = now()->addDays(7);
            }

            if (empty($invite->status)) {
                $invite->status = 'pending';
            }
        });
    }

    // Relationships
    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function invitedBy()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending')
                     ->where('expires_at', '>', now());
    }

    public function scopeExpired($query)
    {
        return $query->where(function($q) {
            $q->where('expires_at', '<=', now())
              ->orWhere('status', 'expired');
        });
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'pending')
                     ->where('expires_at', '>', now());
    }

    // Helper methods
    public function isExpired()
    {
        return $this->expires_at <= now() || $this->status === 'expired';
    }

    public function isPending()
    {
        return $this->status === 'pending' && !$this->isExpired();
    }

    public function isAccepted()
    {
        return $this->status === 'accepted';
    }

    public function isRevoked()
    {
        return $this->status === 'revoked';
    }

    public function markAsAccepted()
    {
        $this->update(['status' => 'accepted']);
        return $this;
    }

    public function markAsExpired()
    {
        $this->update(['status' => 'expired']);
        return $this;
    }

    public function revoke()
    {
        $this->update(['status' => 'revoked']);
        return $this;
    }

    public function getInviteUrl()
    {
        return url('/invite/' . $this->token);
    }

    // Check if this invite can be used by the given email
    public function canBeUsedBy($email)
    {
        if (!$this->isPending()) {
            return false;
        }

        // For email-specific invites
        if ($this->email) {
            return strtolower($this->email) === strtolower($email);
        }

        // For link-based invites (no specific email)
        return true;
    }

    // Validation methods
    public static function createEmailInvite($workspaceIdentifier, $email, $role, $invitedBy = null)
    {
        try {
            // Find workspace by ID or UUID
            $workspace = static::findWorkspace($workspaceIdentifier);
            
            if (!$workspace) {
                throw new \InvalidArgumentException('Workspace not found');
            }

            // Validate inputs
            if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new \InvalidArgumentException('Valid email address is required');
            }

            if (!in_array($role, ['editor', 'viewer'])) {
                throw new \InvalidArgumentException('Valid role (editor or viewer) is required');
            }

            // Check if there's already a pending invite for this email/workspace
            $existingInvite = static::where('workspace_id', $workspace->id)
                                   ->where('email', $email)
                                   ->pending()
                                   ->first();

            if ($existingInvite) {
                throw new \Exception('An invitation has already been sent to this email address.');
            }

            // Check if user is already a member
            $user = User::where('email', $email)->first();
            if ($user && $workspace->hasUser($user->id)) {
                throw new \Exception('This user is already a member of the workspace.');
            }

            return static::create([
                'workspace_id' => $workspace->id,
                'email' => $email,
                'role' => $role,
                'invited_by' => $invitedBy,
                'status' => 'pending',
                'expires_at' => now()->addDays(7)
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to create email invite', [
                'workspace_identifier' => $workspaceIdentifier,
                'email' => $email,
                'role' => $role,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public static function createLinkInvite($workspaceIdentifier, $role, $invitedBy = null)
    {
        try {
            // Find workspace by ID or UUID
            $workspace = static::findWorkspace($workspaceIdentifier);
            
            if (!$workspace) {
                throw new \InvalidArgumentException('Workspace not found');
            }

            if (!in_array($role, ['editor', 'viewer'])) {
                throw new \InvalidArgumentException('Valid role (editor or viewer) is required');
            }

            return static::create([
                'workspace_id' => $workspace->id,
                'email' => null, // Link invites don't have specific emails
                'role' => $role,
                'invited_by' => $invitedBy,
                'status' => 'pending',
                'expires_at' => now()->addDays(7)
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to create link invite', [
                'workspace_identifier' => $workspaceIdentifier,
                'role' => $role,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    // Clean up expired invites
    public static function cleanupExpired()
    {
        try {
            $count = static::where('expires_at', '<=', now())
                          ->where('status', 'pending')
                          ->update(['status' => 'expired']);
            
            Log::info('Cleaned up expired invites', ['count' => $count]);
            
            return $count;
        } catch (\Exception $e) {
            Log::error('Failed to cleanup expired invites', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    // Get invite statistics for a workspace
    public static function getWorkspaceStats($workspaceIdentifier)
    {
        try {
            $workspace = static::findWorkspace($workspaceIdentifier);
            
            if (!$workspace) {
                return [
                    'total' => 0,
                    'pending' => 0,
                    'accepted' => 0,
                    'expired' => 0,
                    'revoked' => 0,
                ];
            }

            return [
                'total' => static::where('workspace_id', $workspace->id)->count(),
                'pending' => static::where('workspace_id', $workspace->id)->pending()->count(),
                'accepted' => static::where('workspace_id', $workspace->id)->where('status', 'accepted')->count(),
                'expired' => static::where('workspace_id', $workspace->id)->where('status', 'expired')->count(),
                'revoked' => static::where('workspace_id', $workspace->id)->where('status', 'revoked')->count(),
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get workspace invite stats', [
                'workspace_identifier' => $workspaceIdentifier,
                'error' => $e->getMessage()
            ]);
            return [
                'total' => 0,
                'pending' => 0,
                'accepted' => 0,
                'expired' => 0,
                'revoked' => 0,
            ];
        }
    }

    /**
     * Helper method to find workspace by UUID or ID
     */
    private static function findWorkspace($identifier): ?Workspace
    {
        // First try to find by UUID
        $workspace = Workspace::where('uuid', $identifier)->first();
        
        // If not found and identifier looks like an integer, try by ID
        if (!$workspace && is_numeric($identifier)) {
            $workspace = Workspace::find((int) $identifier);
        }
        
        return $workspace;
    }
}