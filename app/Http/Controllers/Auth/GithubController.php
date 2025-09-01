<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class GithubController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('github')
            ->scopes(['user:email', 'repo']) // Request repo access for importing
            ->redirect();
    }

    public function callback()
    {
        try {
            $githubUser = Socialite::driver('github')->stateless()->user();
            
            $user = User::updateOrCreate([
                'email' => $githubUser->getEmail(),
            ], [
                'name' => $githubUser->getName() ?? $githubUser->getNickname(),
                'github_id' => $githubUser->getId(),
                'github_username' => $githubUser->getNickname(),
                'avatar' => $githubUser->getAvatar(),
                'github_token' => $githubUser->token, // Store the access token
                'github_refresh_token' => $githubUser->refreshToken, // Store refresh token if available
                'password' => bcrypt(Str::random(16)), // Fallback password
            ]);

            Auth::login($user, true);
            
            // Redirect to projects page with a success message
            return redirect()->route('projects')->with('success', 'Successfully connected to GitHub!');
            
        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('GitHub OAuth Error: ' . $e->getMessage());
            
            return redirect()->route('login')->with('error', 'Failed to connect to GitHub. Please try again.');
        }
    }
}