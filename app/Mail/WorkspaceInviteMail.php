<?php
// app/Mail/WorkspaceInviteMail.php
namespace App\Mail;

use App\Models\Invite;
use App\Models\Workspace;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WorkspaceInviteMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $invite;
    public $workspace;
    public $inviter;

    /**
     * Create a new message instance.
     */
    public function __construct(Invite $invite, Workspace $workspace, User $inviter)
    {
        $this->invite = $invite;
        $this->workspace = $workspace;
        $this->inviter = $inviter;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $appName = config('app.name', 'DeCode');
        
        return $this->subject("You're invited to join {$this->workspace->name} on {$appName}")
                    ->view('emails.workspace-invite')
                    ->with([
                        'invite' => $this->invite,
                        'workspace' => $this->workspace,
                        'inviter' => $this->inviter,
                        'inviteUrl' => $this->invite->getInviteUrl(),
                        'appName' => $appName,
                        'roleDescription' => $this->getRoleDescription($this->invite->role),
                        'expiresInDays' => now()->diffInDays($this->invite->expires_at),
                    ]);
    }

    /**
     * Get a human-readable description of the role
     */
    private function getRoleDescription($role)
    {
        return match($role) {
            'editor' => 'create, edit, and manage projects',
            'viewer' => 'view projects and workspaces',
            default => 'access the workspace'
        };
    }
}