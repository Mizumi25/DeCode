// @/Pages/Auth/VerifyCode.jsx
import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import GuestLayout from '@/Layouts/GuestLayout';
import VerificationCodeInput from '@/Components/Auth/VerificationCodeInput';
import { Mail, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react';

export default function VerifyCode({ email, type = 'register' }) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerify = async (verificationCode) => {
    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
          type,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        
        // Redirect after success
        setTimeout(() => {
          window.location.href = '/projects';
        }, 1500);
      } else {
        setError(data.message || 'Invalid verification code. Please try again.');
        setCode('');
        setIsVerifying(false);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setCode('');
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
        },
        body: JSON.stringify({ email, type }),
      });

      const data = await response.json();

      if (data.success) {
        setCanResend(false);
        setCountdown(60);
      } else {
        setError(data.message || 'Failed to resend code.');
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <GuestLayout>
      <Head title={type === 'register' ? 'Verify Email' : 'Verify Login'} />

      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] p-8">
            
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-full flex items-center justify-center"
              >
                {success ? (
                  <CheckCircle className="w-10 h-10 text-white" />
                ) : (
                  <Mail className="w-10 h-10 text-white" />
                )}
              </motion.div>

              <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
                {success ? 'Verified!' : 'Check Your Email'}
              </h1>
              
              <p className="text-[var(--color-text-muted)]">
                {success ? (
                  'Your email has been verified successfully!'
                ) : (
                  <>
                    We sent a {type === 'register' ? '6' : '8'}-digit verification code to<br />
                    <span className="font-semibold text-[var(--color-text)]">{email}</span>
                  </>
                )}
              </p>
            </div>

            {!success && (
              <>
                {/* Code Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-4 text-center">
                    Enter Verification Code
                  </label>
                  
                  {type === 'login' ? (
                    // Login: Single input field (8 digits)
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={8}
                      value={code}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setCode(value);
                        // Auto-submit when 8 digits are entered
                        if (value.length === 8) {
                          handleVerify(value);
                        }
                      }}
                      disabled={isVerifying}
                      placeholder="Enter 8-digit code"
                      className={`w-full px-4 py-3 text-center text-2xl font-mono tracking-widest rounded-xl border-2 ${
                        error 
                          ? 'border-red-500 text-red-500' 
                          : code.length === 8
                            ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                            : 'border-[var(--color-border)] text-[var(--color-text)]'
                      } bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface)] transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                      style={{
                        colorScheme: 'dark',
                        WebkitTextFillColor: error ? '#ef4444' : code.length === 8 ? 'var(--color-primary)' : 'var(--color-text)',
                        backgroundColor: 'var(--color-bg)',
                        color: 'var(--color-text)',
                        caretColor: error ? '#ef4444' : 'var(--color-primary)',
                      }}
                      autoFocus
                    />
                  ) : (
                    // Register: Box-by-box input (6 digits, smaller size)
                    <div className="flex justify-center">
                      <div style={{ transform: 'scale(0.85)' }}>
                        <VerificationCodeInput
                          length={6}
                          value={code}
                          onChange={setCode}
                          onComplete={handleVerify}
                          disabled={isVerifying}
                          error={!!error}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Loading State */}
                {isVerifying && (
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 text-[var(--color-text-muted)]">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  </div>
                )}

                {/* Resend Code */}
                <div className="text-center mb-6">
                  <p className="text-sm text-[var(--color-text-muted)] mb-2">
                    Didn't receive the code?
                  </p>
                  <button
                    onClick={handleResend}
                    disabled={!canResend || resending}
                    className={`text-sm font-medium ${
                      canResend && !resending
                        ? 'text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] cursor-pointer'
                        : 'text-[var(--color-text-muted)] cursor-not-allowed'
                    } transition-colors`}
                  >
                    {resending ? (
                      <span className="inline-flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Sending...
                      </span>
                    ) : canResend ? (
                      'Resend Code'
                    ) : (
                      `Resend in ${countdown}s`
                    )}
                  </button>
                </div>

                {/* Security Note */}
                <div className="p-4 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-lg mb-6">
                  <p className="text-xs text-[var(--color-text-muted)] text-center">
                    🔒 For your security, this code will expire in 10 minutes.
                  </p>
                </div>

                {/* Back Button */}
                <button
                  onClick={() => router.visit(type === 'register' ? '/register' : '/login')}
                  className="w-full flex items-center justify-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to {type === 'register' ? 'Register' : 'Login'}</span>
                </button>
              </>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="text-[var(--color-text-muted)] mb-4">
                  Redirecting you to your dashboard...
                </p>
                <div className="inline-flex items-center gap-2 text-[var(--color-primary)]">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Please wait</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Help Text */}
          {!success && (
            <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
              Need help? <a href="mailto:support@decode.com" className="text-[var(--color-primary)] hover:underline">Contact Support</a>
            </p>
          )}
        </motion.div>
      </div>
    </GuestLayout>
  );
}
