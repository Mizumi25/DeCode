<?php

namespace App\Http\Requests\Auth;

use App\Http\Controllers\Auth\VerificationController;
use App\Models\TrustedDevice;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt($this->only('email', 'password'), false)) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
        
        // Get the authenticated user
        $user = Auth::user();
        
        // Check if device needs verification
        $needsVerification = !TrustedDevice::isTrusted($user->id);
        
        if ($needsVerification) {
            // Logout user temporarily
            Auth::logout();
            
            // Send verification code
            $verificationController = new VerificationController();
            $verificationController->sendCode($user->email, 'login', $user->name);
            
            // Store user info in session for verification
            Session::put('pending_login_user_id', $user->id);
            Session::put('pending_login_remember', $this->boolean('remember'));
            VerificationController::setVerificationSession($user->email, 'login');
            
            // Throw exception to redirect to verification
            throw ValidationException::withMessages([
                'verification_required' => 'Please verify your login with the code sent to your email.',
            ]);
        }
        
        // Device is trusted, complete login
        if ($this->boolean('remember')) {
            TrustedDevice::trustDevice($user->id, true);
        } else {
            TrustedDevice::trustDevice($user->id, false);
        }
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
