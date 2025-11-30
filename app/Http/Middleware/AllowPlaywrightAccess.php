<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware to allow Playwright thumbnail generation to bypass authentication
 * for specific routes (VoidPage screenshot generation)
 */
class AllowPlaywrightAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if request has the Playwright auth bypass header
        $playwrightToken = $request->header('X-Playwright-Auth');
        
        if ($playwrightToken) {
            // Verify token matches our expected value
            $expectedToken = env('PLAYWRIGHT_AUTH_TOKEN', 'playwright_' . md5(env('APP_KEY')));
            
            if ($playwrightToken === $expectedToken) {
                // Log the bypass for security auditing
                \Log::info('🔓 Playwright auth bypass used', [
                    'url' => $request->fullUrl(),
                    'ip' => $request->ip(),
                ]);
                
                // Get the first user (or a specific user for Playwright)
                $user = \App\Models\User::first();
                
                if ($user) {
                    // Temporarily authenticate as this user for the request
                    \Auth::setUser($user);
                    \Log::info('🔐 Playwright authenticated as user', ['user_id' => $user->id]);
                }
                
                // Mark request as authenticated by Playwright
                $request->attributes->set('playwright_authenticated', true);
            } else {
                \Log::warning('⚠️ Invalid Playwright auth token attempted', [
                    'url' => $request->fullUrl(),
                    'ip' => $request->ip(),
                ]);
            }
        }
        
        // Continue to next middleware
        return $next($request);
    }
}
