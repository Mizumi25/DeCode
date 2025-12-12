<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\EmailVerification;
use App\Models\TrustedDevice;
use App\Models\User;
use App\Mail\VerificationCodeMail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

class VerificationController extends Controller
{
    /**
     * Show verification code page
     */
    public function show(Request $request): Response|RedirectResponse
    {
        $email = Session::get('verification_email');
        $type = Session::get('verification_type', 'register');
        
        if (!$email) {
            return redirect()->route($type === 'register' ? 'register' : 'login');
        }

        return Inertia::render('Auth/VerifyCode', [
            'email' => $email,
            'type' => $type,
        ]);
    }

    /**
     * Send verification code
     */
    public function sendCode(string $email, string $type = 'register', string $userName = 'User'): void
    {
        // Create verification code
        $verification = EmailVerification::createCode($email, $type);
        
        // Send email
        Mail::to($email)->send(new VerificationCodeMail(
            $verification->code,
            $type,
            $userName
        ));
        
        \Log::info('Verification code sent', [
            'email' => $email,
            'type' => $type,
            'code' => $verification->code, // Log for debugging (remove in production)
        ]);
    }

    /**
     * Verify code (API endpoint)
     */
    public function verifyCode(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|min:6|max:8',
            'type' => 'required|in:register,login',
        ]);

        $verified = EmailVerification::verifyCode(
            $request->email,
            $request->code,
            $request->type
        );

        if (!$verified) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired verification code.',
            ], 400);
        }

        // Handle based on type
        if ($request->type === 'register') {
            // For registration, mark user as verified and log them in
            $user = User::where('email', $request->email)->first();
            
            if ($user) {
                $user->markEmailAsVerified();
                Auth::login($user);
                
                // Trust this device
                TrustedDevice::trustDevice($user->id, true);
                
                // Track session
                $user->update([
                    'current_session_id' => Session::getId(),
                    'session_started_at' => now(),
                    'session_device' => request()->header('User-Agent'),
                    'session_ip' => request()->ip(),
                ]);
                
                Session::forget(['verification_email', 'verification_type']);
                
                // Check if user needs to complete survey
                $redirectUrl = $user->survey_completed ? '/projects' : '/survey';
                
                return response()->json([
                    'success' => true,
                    'message' => 'Email verified successfully!',
                    'redirect' => $redirectUrl,
                ]);
            }
        } else {
            // For login verification
            $userId = Session::get('pending_login_user_id');
            $rememberMe = Session::get('pending_login_remember', false);
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Login session expired. Please try again.',
                ], 400);
            }
            
            $user = User::find($userId);
            
            if ($user) {
                // Log the user in
                Auth::login($user);
                
                // Regenerate session
                Session::regenerate();
                
                // Trust this device
                TrustedDevice::trustDevice($user->id, $rememberMe);
                
                // Track session
                $user->update([
                    'current_session_id' => Session::getId(),
                    'session_started_at' => now(),
                    'session_device' => request()->header('User-Agent'),
                    'session_ip' => request()->ip(),
                ]);
                
                // Ensure user has personal workspace
                $user->ensurePersonalWorkspace();
                
                Session::forget([
                    'verification_email', 
                    'verification_type',
                    'pending_login_user_id',
                    'pending_login_remember'
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Login verified successfully!',
                ]);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Verification failed.',
        ], 400);
    }

    /**
     * Resend verification code (API endpoint)
     */
    public function resendCode(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'type' => 'required|in:register,login',
        ]);

        // Check if user exists for this email
        $user = User::where('email', $request->email)->first();
        $userName = $user ? $user->name : 'User';

        // Send new code
        $this->sendCode($request->email, $request->type, $userName);

        return response()->json([
            'success' => true,
            'message' => 'Verification code has been resent.',
        ]);
    }

    /**
     * Check if device needs verification
     */
    public static function needsVerification(User $user): bool
    {
        // Always require verification for new registrations
        if (!$user->hasVerifiedEmail()) {
            return true;
        }

        // Check if device is trusted
        return !TrustedDevice::isTrusted($user->id);
    }

    /**
     * Store email in session for verification
     */
    public static function setVerificationSession(string $email, string $type = 'register'): void
    {
        Session::put('verification_email', $email);
        Session::put('verification_type', $type);
    }
}
