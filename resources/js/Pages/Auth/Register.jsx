import React, { useEffect, useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  User,
  LogIn,
  Check,
  ArrowRight,
  X,
  Loader2,
} from 'lucide-react'
import InputError from '@/Components/InputError'
import GuestLayout from '@/Layouts/GuestLayout'
import AnimatedBlackHoleLogo from '@/Components/AnimatedBlackHoleLogo'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1) // 1 = name/email, 2 = passwords
  const [socialLoading, setSocialLoading] = useState(null) // Track which social provider is loading
  const [emailValidation, setEmailValidation] = useState({ isValid: false, isChecking: false, isAvailable: false });
  const [passwordValidation, setPasswordValidation] = useState({ isValid: false, length: 0 });
  const [confirmPasswordValidation, setConfirmPasswordValidation] = useState({ isValid: false, matches: false });
  
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  // Email validation and availability check
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(data.email);
    
    if (data.email && isValidFormat) {
      setEmailValidation(prev => ({ ...prev, isValid: true, isChecking: true }));
      
      // Debounce email availability check
      const timer = setTimeout(async () => {
        try {
          const response = await fetch('/api/check-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
            },
            body: JSON.stringify({ email: data.email }),
          });
          
          const result = await response.json();
          setEmailValidation({
            isValid: true,
            isChecking: false,
            isAvailable: result.available || false,
          });
        } catch (error) {
          setEmailValidation({ isValid: true, isChecking: false, isAvailable: false });
        }
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setEmailValidation({ isValid: false, isChecking: false, isAvailable: false });
    }
  }, [data.email]);

  // Password validation
  useEffect(() => {
    const isValid = data.password.length >= 8;
    setPasswordValidation({ isValid, length: data.password.length });
  }, [data.password]);

  // Confirm password validation
  useEffect(() => {
    const matches = data.password === data.password_confirmation && data.password_confirmation.length > 0;
    const isValid = matches && data.password_confirmation.length >= 8;
    setConfirmPasswordValidation({ isValid, matches });
  }, [data.password, data.password_confirmation]);

  // Check if step 1 is valid (name and email)
  const isStep1Valid = 
    data.name.length > 0 &&
    emailValidation.isValid && 
    emailValidation.isAvailable && 
    !emailValidation.isChecking;

  // Check if step 2 is valid (passwords)
  const isStep2Valid = 
    passwordValidation.isValid && 
    confirmPasswordValidation.isValid;

  const handleContinueToStep2 = (e) => {
    e.preventDefault()
    if (isStep1Valid) {
      setCurrentStep(2)
    }
  }

  const handleBackToStep1 = () => {
    setCurrentStep(1)
  }

  const submit = (e) => {
    e.preventDefault()
    if (!isStep2Valid) return;
    
    NProgress.start()
    post(route('register'), {
      onFinish: () => {
        reset('password', 'password_confirmation')
        NProgress.done()
      },
    })
  }

  const handleGoogleSignup = (e) => {
    e.preventDefault()
    setSocialLoading('google')
    NProgress.start()
    
    // Small delay to show the loading state before redirect
    setTimeout(() => {
      window.location.href = '/auth/google/redirect'
    }, 100)
  }

  const handleGithubSignup = (e) => {
    e.preventDefault()
    setSocialLoading('github')
    NProgress.start()
    
    // Small delay to show the loading state before redirect
    setTimeout(() => {
      window.location.href = '/auth/github/redirect'
    }, 100)
  }

  // Reset loading state when component unmounts or user returns
  useEffect(() => {
    NProgress.configure({ showSpinner: false })
    
    // Clear loading state if user comes back to the page
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setSocialLoading(null)
        NProgress.done()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      setSocialLoading(null)
      NProgress.done()
    }
  }, [])

  const LoadingSpinner = () => (
    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )

  return (
    <GuestLayout>
      <Head title="Register" />

      {/* Logo */}
      <motion.div
        className="flex justify-center mb-8 md:mb-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Link href="/">
           <AnimatedBlackHoleLogo size={80} className="filter drop-shadow-lg w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
        </Link>
      </motion.div>

        {/* Title */}
        <motion.div
          className="text-center mb-8 md:mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-2 md:mb-3">
            Create Account
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[var(--color-text-muted)]">
            Join us and start your journey today
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {currentStep === 1 ? (
            // STEP 1: Name and Email
            <motion.form
              key="step1"
              onSubmit={handleContinueToStep2}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 md:space-y-7"
            >
              {/* Name Input */}
              <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label htmlFor="name" className="text-sm font-medium text-[var(--color-text)]">
              Full Name
            </label>
            <div className="relative mt-1">
              <input
                id="name"
                name="name"
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                disabled={socialLoading}
                className="w-full px-4 py-3 pl-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none shadow-[var(--shadow-sm)] transition-all disabled:opacity-60"
                style={{
                  colorScheme: 'dark',
                  WebkitTextFillColor: 'var(--color-text)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)'
                }}
                placeholder="Enter your full name"
                required
                autoComplete="name"
              />
              <User className="absolute left-4 top-3.5 w-5 h-5 text-[var(--color-text-muted)]" />
            </div>
            <InputError message={errors.name} className="mt-2" />
          </motion.div>

          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label htmlFor="email" className="text-sm font-medium text-[var(--color-text)]">
              Email Address
            </label>
            <div className="relative mt-1">
              <input
                id="email"
                type="email"
                name="email"
                value={data.email}
                autoComplete="username"
                onChange={(e) => setData('email', e.target.value)}
                disabled={socialLoading}
                style={{
                  colorScheme: 'dark',
                  WebkitTextFillColor: 'var(--color-text)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)'
                }}
                className={`w-full px-4 py-3 pl-12 pr-12 rounded-xl border-2 bg-[var(--color-surface)]/90 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none shadow-[var(--shadow-sm)] transition-all disabled:opacity-60 ${
                  data.email.length === 0 
                    ? 'border-[var(--color-border)]' 
                    : emailValidation.isValid && emailValidation.isAvailable && !emailValidation.isChecking
                    ? 'border-green-500 focus:border-green-500'
                    : emailValidation.isValid && !emailValidation.isAvailable && !emailValidation.isChecking
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-[var(--color-border)]'
                }`}
                placeholder="Enter your email address"
                required
              />
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-[var(--color-text-muted)]" />
              
              {/* Validation Icons */}
              <div className="absolute right-4 top-3.5">
                <AnimatePresence mode="wait">
                  {emailValidation.isChecking && (
                    <motion.div
                      key="checking"
                      initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                      animate={{ opacity: 1, scale: 1, rotate: 360 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    </motion.div>
                  )}
                  {!emailValidation.isChecking && emailValidation.isValid && emailValidation.isAvailable && (
                    <motion.div
                      key="valid"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <Check className="w-5 h-5 text-green-500" />
                    </motion.div>
                  )}
                  {!emailValidation.isChecking && emailValidation.isValid && !emailValidation.isAvailable && (
                    <motion.div
                      key="invalid"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            {!emailValidation.isChecking && emailValidation.isValid && !emailValidation.isAvailable && (
              <p className="text-xs text-red-500 mt-1">Email is already taken</p>
            )}
            <InputError message={errors.email} className="mt-2" />
          </motion.div>

          {/* Continue Button for Step 1 */}
          <motion.button
            type="submit"
            disabled={!isStep1Valid || emailValidation.isChecking}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className={`w-full flex items-center justify-center gap-2 font-medium px-6 py-4 rounded-xl shadow-[var(--shadow-lg)] transition-all duration-200 disabled:cursor-not-allowed transform ${
              isStep1Valid && !emailValidation.isChecking
                ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white hover:shadow-xl'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          {/* Divider */}
          <div className="relative my-6 md:my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--color-border)]" />
            </div>
            <div className="relative flex justify-center text-xs md:text-sm uppercase">
              <span className="bg-[var(--color-surface)] px-2 md:px-4 text-[var(--color-text-muted)]">
                Or sign up with
              </span>
            </div>
          </div>

          {/* Social Registration Options */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            <motion.button
              type="button"
              onClick={handleGoogleSignup}
              disabled={socialLoading}
              whileHover={{ scale: socialLoading ? 1 : 1.02, y: socialLoading ? 0 : -2 }}
              whileTap={{ scale: socialLoading ? 1 : 0.98 }}
              className="flex items-center justify-center gap-2 border-2 border-[var(--color-border)] px-4 py-3 rounded-xl text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] transition-all duration-200 font-medium shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] disabled:opacity-60 disabled:cursor-not-allowed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              {socialLoading === 'google' ? (
                <>
                  <LoadingSpinner />
                  <span className="hidden sm:inline">Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </>
              )}
            </motion.button>

            <motion.button
              type="button"
              onClick={handleGithubSignup}
              disabled={socialLoading}
              whileHover={{ scale: socialLoading ? 1 : 1.02, y: socialLoading ? 0 : -2 }}
              whileTap={{ scale: socialLoading ? 1 : 0.98 }}
              className="flex items-center justify-center gap-2 border-2 border-[var(--color-border)] px-4 py-3 rounded-xl text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] transition-all duration-200 font-medium shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] disabled:opacity-60 disabled:cursor-not-allowed"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              {socialLoading === 'github' ? (
                <>
                  <LoadingSpinner />
                  <span className="hidden sm:inline">Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 0C5.371 0 0 5.371 0 12C0 17.303 3.438 21.8 8.207 23.385C8.805 23.495 9.025 23.145 9.025 22.845C9.025 22.575 9.015 21.855 9.009 20.955C5.672 21.675 4.968 19.455 4.968 19.455C4.422 18.105 3.633 17.745 3.633 17.745C2.546 17.025 3.714 17.04 3.714 17.04C4.922 17.13 5.555 18.285 5.555 18.285C6.623 20.055 8.385 19.575 9.05 19.275C9.155 18.495 9.47 17.955 9.82 17.64C7.158 17.325 4.344 16.29 4.344 11.61C4.344 10.29 4.803 9.225 5.58 8.4C5.454 8.085 5.049 6.825 5.694 5.115C5.694 5.115 6.705 4.815 9 6.465C9.975 6.195 11.01 6.06 12.045 6.06C13.08 6.06 14.115 6.195 15.09 6.465C17.385 4.815 18.39 5.115 18.39 5.115C19.035 6.825 18.63 8.085 18.51 8.4C19.281 9.225 19.74 10.29 19.74 11.61C19.74 16.305 16.92 17.325 14.25 17.64C14.715 18.06 15.135 18.885 15.135 20.145C15.135 21.945 15.12 23.385 15.12 23.835C15.12 24.135 15.33 24.495 15.945 24.375C20.565 22.785 24 18.285 24 13.005C24 5.955 18.63 0 12 0Z"
                    />
                  </svg>
                  GitHub
                </>
              )}
            </motion.button>
          </div>

          {/* Login Link */}
          <motion.div
            className="text-center text-sm text-[var(--color-text-muted)] pt-6 mt-6 border-t border-[var(--color-border)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <span>Already have an account?</span>{' '}
            <Link
              href={route('login')}
              className="inline-flex items-center gap-1 font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline transition-colors"
            >
              Sign in
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.form>
      ) : (
        // STEP 2: Passwords
        <motion.form
          key="step2"
          onSubmit={submit}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 md:space-y-7"
        >
          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <label htmlFor="password" className="text-sm font-medium text-[var(--color-text)]">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type="password"
                name="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                autoComplete="new-password"
                disabled={socialLoading}
                style={{
                  colorScheme: 'dark',
                  WebkitTextFillColor: 'var(--color-text)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)'
                }}
                className={`w-full px-4 py-3 pl-12 pr-12 rounded-xl border-2 bg-[var(--color-surface)]/90 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none shadow-[var(--shadow-sm)] transition-all disabled:opacity-60 ${
                  data.password.length === 0
                    ? 'border-[var(--color-border)]'
                    : passwordValidation.isValid
                    ? 'border-green-500 focus:border-green-500'
                    : 'border-red-500 focus:border-red-500'
                }`}
                placeholder="Create a secure password (min 8 characters)"
                required
              />
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-[var(--color-text-muted)]" />
              
              {/* Validation Icon */}
              <div className="absolute right-4 top-3.5">
                <AnimatePresence mode="wait">
                  {data.password.length > 0 && passwordValidation.isValid && (
                    <motion.div
                      key="valid"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <Check className="w-5 h-5 text-green-500" />
                    </motion.div>
                  )}
                  {data.password.length > 0 && !passwordValidation.isValid && (
                    <motion.div
                      key="invalid"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            {data.password.length > 0 && !passwordValidation.isValid && (
              <p className="text-xs text-red-500 mt-1">Password must be at least 8 characters ({passwordValidation.length}/8)</p>
            )}
            <InputError message={errors.password} className="mt-2" />
          </motion.div>

          {/* Password Confirmation Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <label
              htmlFor="password_confirmation"
              className="text-sm font-medium text-[var(--color-text)]"
            >
              Confirm Password
            </label>
            <div className="relative mt-1">
              <input
                id="password_confirmation"
                type="password"
                name="password_confirmation"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                autoComplete="new-password"
                disabled={socialLoading}
                style={{
                  colorScheme: 'dark',
                  WebkitTextFillColor: 'var(--color-text)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)'
                }}
                className={`w-full px-4 py-3 pl-12 pr-12 rounded-xl border-2 bg-[var(--color-surface)]/90 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none shadow-[var(--shadow-sm)] transition-all disabled:opacity-60 ${
                  data.password_confirmation.length === 0
                    ? 'border-[var(--color-border)]'
                    : confirmPasswordValidation.isValid
                    ? 'border-green-500 focus:border-green-500'
                    : 'border-red-500 focus:border-red-500'
                }`}
                placeholder="Confirm your password"
                required
              />
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-[var(--color-text-muted)]" />
              
              {/* Validation Icon */}
              <div className="absolute right-4 top-3.5">
                <AnimatePresence mode="wait">
                  {data.password_confirmation.length > 0 && confirmPasswordValidation.isValid && (
                    <motion.div
                      key="valid"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <Check className="w-5 h-5 text-green-500" />
                    </motion.div>
                  )}
                  {data.password_confirmation.length > 0 && !confirmPasswordValidation.isValid && (
                    <motion.div
                      key="invalid"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            {data.password_confirmation.length > 0 && !confirmPasswordValidation.matches && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
            <InputError message={errors.password_confirmation} className="mt-2" />
          </motion.div>

          {/* Terms and Conditions */}
          <motion.div
            className="flex items-start gap-3 text-sm text-[var(--color-text-muted)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full"></div>
            </div>
            <p>
              By creating an account, you agree to our{' '}
              <Link href="#" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline">
                Privacy Policy
              </Link>
            </p>
          </motion.div>

          {/* Back and Submit Buttons */}
          <div className="flex gap-3">
            <motion.button
              type="button"
              onClick={handleBackToStep1}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] transition-all duration-200 font-medium"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              Back
            </motion.button>

            <motion.button
              type="submit"
              whileHover={{ scale: (processing || !isStep2Valid) ? 1 : 1.02, y: (processing || !isStep2Valid) ? 0 : -2 }}
              whileTap={{ scale: (processing || !isStep2Valid) ? 1 : 0.98 }}
              disabled={processing || !isStep2Valid}
              className={`flex-1 flex items-center justify-center gap-2 font-medium px-6 py-4 rounded-xl shadow-[var(--shadow-lg)] transition-all duration-200 disabled:cursor-not-allowed transform ${
                isStep2Valid && !processing
                  ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white hover:shadow-xl'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              {processing ? (
                <>
                  <LoadingSpinner />
                  Creating account...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Create Account
                </>
              )}
            </motion.button>
          </div>

          {/* Login Link */}
          <motion.div
            className="text-center text-sm text-[var(--color-text-muted)] pt-6 mt-6 border-t border-[var(--color-border)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <span>Already have an account?</span>{' '}
            <Link
              href={route('login')}
              className="inline-flex items-center gap-1 font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline transition-colors"
            >
              Sign in
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.form>
      )}
    </AnimatePresence>
    </GuestLayout>
  )
}
