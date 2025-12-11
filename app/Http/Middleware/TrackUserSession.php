<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TrackUserSession
{
    /**
     * Handle an incoming request.
     * 
     * This middleware ensures that if a user's tracked session no longer matches
     * the current session (e.g., expired/cleared), we clear the tracking data.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            
            // If user has a tracked session but it doesn't match current session
            if ($user->current_session_id && $user->current_session_id !== $request->session()->getId()) {
                // Check if the tracked session is actually still active in database
                $trackedSessionExists = \DB::table('sessions')
                    ->where('id', $user->current_session_id)
                    ->where('last_activity', '>', now()->subMinutes(config('session.lifetime', 120))->timestamp)
                    ->exists();
                
                // If tracked session is dead/expired, clear it and update to current session
                if (!$trackedSessionExists) {
                    $user->update([
                        'current_session_id' => $request->session()->getId(),
                        'session_started_at' => now(),
                        'session_device' => $request->header('User-Agent'),
                        'session_ip' => $request->ip(),
                    ]);
                }
            }
        }
        
        return $next($request);
    }
}
