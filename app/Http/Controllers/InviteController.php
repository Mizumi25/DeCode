<?php
// app/Http/Controllers/InviteController.php
namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\Invite;
use App\Models\User;
use App\Mail\WorkspaceInviteMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\RedirectResponse;

class InviteController extends Controller
{
    public function generateLink(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'workspace_id' => 'required|string',
                'role' => 'required|string|in:editor,viewer'
            ]);

            // Try to find workspace by UUID first, then by ID as fallback
            $workspace = $this->findWorkspace($validated['workspace_id']);
            
            if (!$workspace) {
                return response()->json([
                    'success' => false,
                    'message' => 'Workspace not found',
                    'error' => 'Workspace not found'
                ], 404);
            }

            $user = Auth::user();

            // Check if user can invite to this workspace
            if (!$workspace->canUserInvite($user->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to create invites for this workspace',
                    'error' => 'Permission denied'
                ], 403);
            }

            $invite = Invite::createLinkInvite(
                $workspace->id,
                $validated['role'],
                $user->id
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'token' => $invite->token,
                    'link' => $invite->getInviteUrl(),
                    'expires_at' => $invite->expires_at,
                    'role' => $invite->role
                ],
                'message' => 'Invite link generated successfully'
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'error' => $e->getMessage(),
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Invite link generation failed', [
                'user_id' => Auth::id(),
                'workspace_id' => $request->input('workspace_id'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate invite link',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function sendEmailInvite(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'workspace_id' => 'required|string',
                'email' => 'required|email|max:255',
                'role' => 'required|string|in:editor,viewer'
            ]);

            // Try to find workspace by UUID first, then by ID as fallback
            $workspace = $this->findWorkspace($validated['workspace_id']);
            
            if (!$workspace) {
                return response()->json([
                    'success' => false,
                    'message' => 'Workspace not found',
                    'error' => 'Workspace not found'
                ], 404);
            }

            $user = Auth::user();

            // Check if user can invite to this workspace
            if (!$workspace->canUserInvite($user->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to send invites for this workspace',
                    'error' => 'Permission denied'
                ], 403);
            }

            $invite = Invite::createEmailInvite(
                $workspace->id,
                $validated['email'],
                $validated['role'],
                $user->id
            );

            // Send the email invitation
            try {
                Mail::to($validated['email'])->send(new WorkspaceInviteMail($invite, $workspace, $user));
            } catch (\Exception $mailException) {
                \Log::error('Failed to send invite email', [
                    'invite_id' => $invite->id,
                    'email' => $validated['email'],
                    'workspace_id' => $workspace->id,
                    'error' => $mailException->getMessage()
                ]);
                
                // Don't fail the request if email sending fails
                // The invite is still created and can be resent
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $invite->id,
                    'email' => $invite->email,
                    'role' => $invite->role,
                    'token' => $invite->token,
                    'link' => $invite->getInviteUrl(),
                    'expires_at' => $invite->expires_at,
                    'status' => $invite->status,
                    'created_at' => $invite->created_at
                ],
                'message' => 'Invitation sent successfully'
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'error' => $e->getMessage(),
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Email invite failed', [
                'user_id' => Auth::id(),
                'workspace_id' => $request->input('workspace_id'),
                'email' => $request->input('email'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send invitation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function showInvite($token): Response
    {
        $invite = Invite::where('token', $token)->with('workspace.owner')->first();

        if (!$invite) {
            return Inertia::render('Invites/InvalidInvite', [
                'message' => 'This invitation link is invalid or has been removed.'
            ]);
        }

        if (!$invite->isPending()) {
            $message = match($invite->status) {
                'accepted' => 'This invitation has already been accepted.',
                'expired' => 'This invitation has expired.',
                'revoked' => 'This invitation has been cancelled.',
                default => 'This invitation is no longer valid.'
            };

            return Inertia::render('Invites/InvalidInvite', [
                'message' => $message
            ]);
        }

        // If user is not authenticated, redirect to login with the invite token
        if (!Auth::check()) {
            return Inertia::render('Invites/LoginRequired', [
                'invite' => [
                    'token' => $invite->token,
                    'workspace' => [
                        'name' => $invite->workspace->name,
                        'description' => $invite->workspace->description,
                    ],
                    'role' => $invite->role,
                    'email' => $invite->email,
                    'expires_at' => $invite->expires_at,
                ],
                'login_url' => route('login') . '?invite=' . $token,
                'register_url' => route('register') . '?invite=' . $token,
            ]);
        }

        $user = Auth::user();

        // Check if user can use this invite
        if (!$invite->canBeUsedBy($user->email)) {
            return Inertia::render('Invites/InvalidInvite', [
                'message' => 'This invitation is for a different email address (' . $invite->email . ').'
            ]);
        }

        // Check if user is already a member
        if ($invite->workspace->hasUser($user->id)) {
            return Inertia::render('Invites/AlreadyMember', [
                'workspace' => [
                    'name' => $invite->workspace->name,
                    'description' => $invite->workspace->description,
                    'uuid' => $invite->workspace->uuid,
                ],
                'user_role' => $invite->workspace->getUserRole($user->id)
            ]);
        }

        return Inertia::render('Invites/AcceptInvite', [
            'invite' => [
                'token' => $invite->token,
                'workspace' => [
                    'id' => $invite->workspace->id,
                    'uuid' => $invite->workspace->uuid,
                    'name' => $invite->workspace->name,
                    'description' => $invite->workspace->description,
                    'type' => $invite->workspace->type,
                    'owner' => [
                        'name' => $invite->workspace->owner->name,
                        'email' => $invite->workspace->owner->email,
                    ],
                ],
                'role' => $invite->role,
                'email' => $invite->email,
                'expires_at' => $invite->expires_at,
            ]
        ]);
    }

    public function acceptInvite($token): JsonResponse
    {
        try {
            $invite = Invite::where('token', $token)
                          ->with('workspace')
                          ->first();

            if (!$invite) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid invitation link',
                    'error' => 'Invite not found'
                ], 404);
            }

            if (!$invite->isPending()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This invitation is no longer valid',
                    'error' => 'Invite expired or used'
                ], 400);
            }

            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'You must be logged in to accept invitations',
                    'error' => 'Authentication required'
                ], 401);
            }

            // Check if user can use this invite
            if (!$invite->canBeUsedBy($user->email)) {
                return response()->json([
                    'success' => false,
                    'message' => 'This invitation is for a different email address',
                    'error' => 'Email mismatch'
                ], 400);
            }

            $workspace = $invite->workspace;

            // Check if user is already a member
            if ($workspace->hasUser($user->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are already a member of this workspace',
                    'error' => 'Already member'
                ], 400);
            }

            // Add user to workspace
            $workspace->addUser($user->id, $invite->role);

            // Mark invite as accepted
            $invite->markAsAccepted();

            return response()->json([
                'success' => true,
                'data' => [
                    'workspace' => [
                        'id' => $workspace->id,
                        'uuid' => $workspace->uuid,
                        'name' => $workspace->name,
                        'description' => $workspace->description,
                        'type' => $workspace->type,
                    ],
                    'role' => $invite->role
                ],
                'message' => 'Successfully joined workspace!',
                'redirect_url' => route('workspace.projects', ['workspace' => $workspace->uuid])
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Accept invite failed', [
                'user_id' => Auth::id(),
                'token' => $token,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to accept invitation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getWorkspaceInvites(Workspace $workspace): JsonResponse
    {
        try {
            $user = Auth::user();

            // Check if user can view invites for this workspace
            if (!$workspace->canUserInvite($user->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to view invites for this workspace',
                    'error' => 'Permission denied'
                ], 403);
            }

            $invites = $workspace->invites()
                ->active()
                ->with('invitedBy:id,name,email')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($invite) {
                    return [
                        'id' => $invite->id,
                        'email' => $invite->email,
                        'role' => $invite->role,
                        'status' => $invite->status,
                        'link' => $invite->getInviteUrl(),
                        'expires_at' => $invite->expires_at,
                        'created_at' => $invite->created_at,
                        'is_link_invite' => is_null($invite->email),
                        'invited_by' => $invite->invitedBy ? [
                            'id' => $invite->invitedBy->id,
                            'name' => $invite->invitedBy->name,
                            'email' => $invite->invitedBy->email,
                        ] : null
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $invites
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Get workspace invites failed', [
                'user_id' => Auth::id(),
                'workspace_id' => $workspace->id,
                'workspace_uuid' => $workspace->uuid,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch invites',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function revokeInvite(Invite $invite): JsonResponse
    {
        try {
            $user = Auth::user();
            $workspace = $invite->workspace;
            
            // Check if user can revoke invites for this workspace
            if (!$workspace->canUserInvite($user->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to revoke invites for this workspace',
                    'error' => 'Permission denied'
                ], 403);
            }

            $invite->revoke();

            return response()->json([
                'success' => true,
                'message' => 'Invitation revoked successfully'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Revoke invite failed', [
                'user_id' => Auth::id(),
                'invite_id' => $invite->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to revoke invitation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function resendInvite(Invite $invite): JsonResponse
    {
        try {
            $user = Auth::user();
            $workspace = $invite->workspace;
            
            // Check if user can send invites for this workspace
            if (!$workspace->canUserInvite($user->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to resend invites for this workspace',
                    'error' => 'Permission denied'
                ], 403);
            }

            if (!$invite->isPending()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot resend this invitation',
                    'error' => 'Invalid invite status'
                ], 400);
            }

            // For email invites, resend the email
            if ($invite->email) {
                try {
                    Mail::to($invite->email)->send(new WorkspaceInviteMail($invite, $workspace, $user));
                    
                    return response()->json([
                        'success' => true,
                        'message' => 'Invitation resent successfully'
                    ], 200);
                } catch (\Exception $mailException) {
                    \Log::error('Failed to resend invite email', [
                        'invite_id' => $invite->id,
                        'email' => $invite->email,
                        'workspace_id' => $workspace->id,
                        'error' => $mailException->getMessage()
                    ]);
                    
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to send email invitation',
                        'error' => 'Email sending failed'
                    ], 500);
                }
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot resend link-based invitations',
                    'error' => 'Invalid invite type'
                ], 400);
            }

        } catch (\Exception $e) {
            \Log::error('Resend invite failed', [
                'user_id' => Auth::id(),
                'invite_id' => $invite->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to resend invitation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Cleanup expired invites - can be called via a scheduled job
    public function cleanupExpired(): JsonResponse
    {
        try {
            $count = Invite::cleanupExpired();
            
            return response()->json([
                'success' => true,
                'message' => "Cleaned up {$count} expired invitations",
                'data' => ['cleaned_count' => $count]
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Cleanup expired invites failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to cleanup expired invitations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper method to find workspace by UUID or ID
     */
    private function findWorkspace($identifier): ?Workspace
    {
        // First try to find by UUID
        $workspace = Workspace::where('uuid', $identifier)->first();
        
        // If not found and identifier looks like an integer, try by ID
        if (!$workspace && is_numeric($identifier)) {
            $workspace = Workspace::find((int) $identifier);
        }
        
        return $workspace;
    }
    
    /**
     * Accept invite via web form submission (for Inertia pages)
     */
    public function acceptInviteWeb($token): RedirectResponse
    {
        try {
             $invite = Invite::where('token', $token)
                           ->with('workspace')
                           ->first();

             if (!$invite) {
                 return redirect()->route('projects.index')->with('error', 'Invalid invitation link');
             }

             if (!$invite->isPending()) {
                 $message = match($invite->status) {
                     'accepted' => 'This invitation has already been accepted.',
                     'expired' => 'This invitation has expired.',
                     'revoked' => 'This invitation has been cancelled.',
                     default => 'This invitation is no longer valid.'
                 };
                 
                 return redirect()->route('projects.index')->with('error', $message);
             }

             $user = Auth::user();

             if (!$user) {
                 // Store the invite token in session and redirect to login
                 session(['pending_invite' => $token]);
                 return redirect()->route('login')
                     ->with('message', 'Please log in to accept the workspace invitation');
             }

             // Check if user can use this invite
             if (!$invite->canBeUsedBy($user->email)) {
                 return redirect()->route('projects.index')
                     ->with('error', 'This invitation is for a different email address (' . $invite->email . ')');
             }

             $workspace = $invite->workspace;

             // Check if user is already a member
             if ($workspace->hasUser($user->id)) {
                 return redirect()->route('workspace.projects', ['workspace' => $workspace->uuid])
                     ->with('info', 'You are already a member of ' . $workspace->name);
             }

             // Add user to workspace
             $workspace->addUser($user->id, $invite->role);

             // Mark invite as accepted
             $invite->markAsAccepted();

             // Redirect to projects with the workspace selected
             return redirect()->route('workspace.projects', ['workspace' => $workspace->uuid])
                 ->with('success', 'Successfully joined ' . $workspace->name . '!');

         } catch (\Exception $e) {
             \Log::error('Accept invite web failed', [
                 'user_id' => Auth::id(),
                 'token' => $token,
                 'error' => $e->getMessage(),
                 'trace' => $e->getTraceAsString()
             ]);

             return redirect()->route('projects.index')
                 ->with('error', 'Failed to accept invitation. Please try again.');
         }
     }
}