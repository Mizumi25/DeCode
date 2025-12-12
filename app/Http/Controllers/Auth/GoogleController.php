<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')
          ->with(['prompt' => 'select_account'])
          ->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver('google')->stateless()->user();
        
        // Check if user already exists
        $user = User::where('google_id', $googleUser->getId())->first();
        
        $isNewUser = false;
        
        if (!$user) {
            // Create new user (don't check by email - Google and email are separate)
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'password' => Hash::make(uniqid()),
                'email_verified_at' => now(), // Google accounts are pre-verified
            ]);
            
            $isNewUser = true;
            
            // Ensure personal workspace exists
            $user->ensurePersonalWorkspace();
        }
    
        Auth::login($user);
        
        // Redirect to survey for first-time users
        if ($isNewUser || !$user->survey_completed) {
            return redirect()->route('survey.index');
        }
        
        return redirect('/projects');
    }
}