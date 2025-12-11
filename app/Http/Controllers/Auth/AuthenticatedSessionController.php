<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $user = \App\Models\User::where('email', $request->email)->first();
        
        // 🔥 FIX: Check if user is already logged in elsewhere
        if ($user && $user->current_session_id && $user->current_session_id !== session()->getId()) {
            // Verify if the stored session is actually still active
            $sessionExists = \DB::table('sessions')
                ->where('id', $user->current_session_id)
                ->where('last_activity', '>', now()->subMinutes(config('session.lifetime', 120))->timestamp)
                ->exists();
            
            // 🔥 FIX: If session doesn't exist or expired, clear the stale session tracking
            if (!$sessionExists) {
                $user->update([
                    'current_session_id' => null,
                    'session_started_at' => null,
                    'session_device' => null,
                    'session_ip' => null,
                ]);
                // Allow login to proceed since old session is dead/expired
            } else {
                // Session is still active, show conflict dialog
                return redirect()->back()->withErrors([
                    'email' => 'This account is already logged in on another device.',
                ])->with('show_session_conflict', true)
                  ->with('conflict_user_email', $request->email);
            }
        }

        try {
            $request->authenticate();
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Check if verification is required
            if (isset($e->errors()['verification_required'])) {
                // Redirect to verification page
                return redirect()->route('verification.show')
                    ->with('status', $e->errors()['verification_required'][0]);
            }
            
            // Re-throw for other validation errors
            throw $e;
        }
        
        $request->session()->regenerate();

        // Ensure the user has a personal workspace
        $user = Auth::user();
        $user->ensurePersonalWorkspace();
        
        // Track session
        $user->update([
            'current_session_id' => session()->getId(),
            'session_started_at' => now(),
            'session_device' => $request->header('User-Agent'),
            'session_ip' => $request->ip(),
        ]);

        return redirect()->intended(route('projects.index', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Clear session tracking
        if ($user = Auth::user()) {
            $user->update([
                'current_session_id' => null,
                'session_started_at' => null,
                'session_device' => null,
                'session_ip' => null,
            ]);
        }
        
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Force a full page reload to get fresh CSRF token
        return redirect('/')->with('_fresh', true);
    }
}