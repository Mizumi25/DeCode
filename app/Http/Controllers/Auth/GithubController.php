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
        return Socialite::driver('github')->redirect();
    }

    public function callback()
    {
        $githubUser = Socialite::driver('github')->stateless()->user();

        $user = User::updateOrCreate([
            'email' => $githubUser->getEmail(),
        ], [
            'name' => $githubUser->getName() ?? $githubUser->getNickname(),
            'github_id' => $githubUser->getId(),
            'avatar' => $githubUser->getAvatar(),
            'password' => bcrypt(Str::random(16)), // Fallback password
        ]);

        Auth::login($user, true);

        return redirect()->intended(route('dashboard'));
    }
}
