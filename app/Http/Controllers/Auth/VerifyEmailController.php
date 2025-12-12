<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     * 🔥 UPDATED: Redirect first-time users to survey instead of dashboard
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        $user = $request->user();
        
        if ($user->hasVerifiedEmail()) {
            // 🔥 Check if user has completed survey
            if (!$user->survey_completed) {
                return redirect()->route('survey.index');
            }
            return redirect()->intended(route('projects.index', absolute: false).'?verified=1');
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        // 🔥 NEW: Redirect to survey for first-time users
        if (!$user->survey_completed) {
            return redirect()->route('survey.index');
        }

        return redirect()->intended(route('projects.index', absolute: false).'?verified=1');
    }
}
