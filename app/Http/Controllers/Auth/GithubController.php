<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GithubController extends Controller
{
    public function redirect(Request $request)
    {
        // Store the intended redirect URL if provided (for modal flow)
        if ($request->has('modal')) {
            session(['github_connect_modal' => true]);
        }
        
        return Socialite::driver('github')
            ->scopes(['repo', 'user:email']) // Request repo access for importing
            ->redirect();
    }

    public function callback()
    {
        try {
            $githubUser = Socialite::driver('github')->stateless()->user();
            
            // Get current authenticated user or find by email
            $user = Auth::user();
            
            if ($user) {
                // User is already logged in - just connect GitHub
                $this->connectGitHubToUser($user, $githubUser);
                $message = 'GitHub account connected successfully!';
                $redirectUrl = '/projects';
            } else {
                // User is not logged in - find or create user
                $user = $this->findOrCreateUser($githubUser);
                Auth::login($user);
                $message = 'Logged in with GitHub successfully!';
                $redirectUrl = '/projects';
            }

            // Check if this was a modal connection request
            if (session('github_connect_modal')) {
                session()->forget('github_connect_modal');
                // Add this for debugging
               return redirect('/projects?github_connected=1&message=' . urlencode($message));
                            
            }

            return redirect($redirectUrl)->with('success', $message);
            
        } catch (\Exception $e) {
            Log::error('GitHub OAuth Error: ' . $e->getMessage());
            
            $errorMessage = 'Failed to connect GitHub account. Please try again.';
            
            if (session('github_connect_modal')) {
                session()->forget('github_connect_modal');
                return redirect('/projects?github_error=1&message=' . urlencode($errorMessage));
            }
            
            return redirect('/login')->withErrors(['github' => $errorMessage]);
        }
    }

    private function connectGitHubToUser(User $user, $githubUser)
    {
        $user->update([
            'github_id' => $githubUser->getId(),
            'github_username' => $githubUser->getNickname() ?? $githubUser->getName(),
            'github_token' => $githubUser->token, // Store as plain text for now
            'github_refresh_token' => $githubUser->refreshToken,
            'github_token_expires_at' => $githubUser->expiresIn ? now()->addSeconds($githubUser->expiresIn) : null,
            // Update avatar if user doesn't have one
            'avatar' => $user->avatar ?: $githubUser->getAvatar(),
        ]);
    }

    private function findOrCreateUser($githubUser)
    {
        // First try to find user by GitHub ID
        $user = User::where('github_id', $githubUser->getId())->first();
        
        if ($user) {
            // Update GitHub data for existing user
            $this->connectGitHubToUser($user, $githubUser);
            return $user;
        }

        // Then try to find user by email
        $user = User::where('email', $githubUser->getEmail())->first();
        
        if ($user) {
            // Connect GitHub to existing email user
            $this->connectGitHubToUser($user, $githubUser);
            return $user;
        }

        // Create new user
        return User::create([
            'name' => $githubUser->getName() ?: $githubUser->getNickname(),
            'email' => $githubUser->getEmail(),
            'github_id' => $githubUser->getId(),
            'github_username' => $githubUser->getNickname() ?? $githubUser->getName(),
            'github_token' => $githubUser->token, // Store as plain text for now
            'github_refresh_token' => $githubUser->refreshToken,
            'github_token_expires_at' => $githubUser->expiresIn ? now()->addSeconds($githubUser->expiresIn) : null,
            'avatar' => $githubUser->getAvatar(),
            'password' => Hash::make(uniqid()),
            'email_verified_at' => now(), // GitHub emails are considered verified
        ]);
    }

    /**
     * Disconnect GitHub account
     */
    public function disconnect()
    {
        $user = Auth::user();
        
        if ($user) {
            $user->disconnectGitHub();
            return response()->json([
                'success' => true,
                'message' => 'GitHub account disconnected successfully'
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'User not found'
        ], 404);
    }
}