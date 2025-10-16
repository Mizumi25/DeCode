import React, { useEffect, useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react'
import Checkbox from '@/Components/Checkbox'
import InputError from '@/Components/InputError'
import GuestLayout from '@/Layouts/GuestLayout'
import AnimatedBlackHoleLogo from '@/Components/AnimatedBlackHoleLogo'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export default function Login({ status, canResetPassword }) {
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [socialLoading, setSocialLoading] = useState(null) // Track which social login is loading
  
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  })

  const submit = (e) => {
    e.preventDefault()
    NProgress.start()
    post(route('login'), {
      onFinish: () => {
        reset('password')
        NProgress.done()
      },
    })
  }

  const handleGoogleLogin = (e) => {
    e.preventDefault()
    setSocialLoading('google')
    NProgress.start()
    
    // Small delay to show the loading state before redirect
    setTimeout(() => {
      localStorage.setItem('lastUsed', 'google')
      window.location.href = '/auth/google/redirect'
    }, 100)
  }

  const handleGithubLogin = (e) => {
    e.preventDefault()
    setSocialLoading('github')
    NProgress.start()
    
    // Small delay to show the loading state before redirect
    setTimeout(() => {
      localStorage.setItem('lastUsed', 'github')
      window.location.href = '/auth/github/redirect'
    }, 100)
  }

  const handleEmailLogin = () => {
    localStorage.setItem('lastUsed', 'email')
    setShowEmailForm(true)
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
      <Head title="Log in" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-md mx-auto bg-[var(--color-surface)]/80 backdrop-blur-md rounded-2xl shadow-[var(--shadow-lg)] p-8 mt-20 border border-[var(--color-border)]/20"
      >
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/">
            <AnimatedBlackHoleLogo
              size={80}
              className={`filter drop-shadow-lg transition-all duration-500 ${
                errors.email || errors.password ? 'hue-rotate-[330deg]' : ''
              }`}
            />
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
            Welcome Back
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Sign in to continue to your account
          </p>
        </motion.div>

        {status && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800"
          >
            {status}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!showEmailForm ? (
            // Initial Login Options
            <motion.div
              key="login-options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Email Login Button */}
             <div className="relative w-full">
              <motion.button
                onClick={handleEmailLogin}
                disabled={socialLoading}
                whileHover={{ scale: socialLoading ? 1 : 1.02, y: socialLoading ? 0 : -2 }}
                whileTap={{ scale: socialLoading ? 1 : 0.98 }}
                className="w-full flex items-center justify-center gap-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium px-6 py-4 rounded-xl shadow-[var(--shadow-lg)] transition-all duration-200 transform hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Mail className="w-5 h-5" />
                Sign in with Email
              </motion.button>
            
              {/* Label for Last Used */}
              {localStorage.getItem('lastUsed') === 'email' && (
                <label className="absolute left-2 bottom-[-18px] text-xs text-purple-500 font-medium">
                  Last Used
                </label>
              )}
            </div>


              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[var(--color-border)]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[var(--color-surface)] px-2 text-[var(--color-text-muted)]">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Login */}
              <div className="relative w-full">
                <motion.button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={socialLoading}
                  whileHover={{ scale: socialLoading ? 1 : 1.02, y: socialLoading ? 0 : -2 }}
                  whileTap={{ scale: socialLoading ? 1 : 0.98 }}
                  className="w-full flex items-center justify-center gap-3 border-2 border-[var(--color-border)] px-6 py-4 rounded-xl text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] transition-all duration-200 font-medium shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {socialLoading === 'google' ? (
                    <>
                      <LoadingSpinner />
                      Connecting to Google...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
                        <path fill="#EA4335" d="M533.5 278.4c0-17.6-1.6-35.1-4.8-52H272v98.5h146.9c-6.4 34.3-25.4 63.2-54.2 82.8v68h87.6c51.1-47.1 81.2-116.5 81.2-197.3z" />
                        <path fill="#34A853" d="M272 544.3c73.6 0 135.4-24.3 180.5-66.1l-87.6-68c-24.3 16.3-55.3 25.8-92.9 25.8-71.4 0-131.9-48.1-153.7-112.9H27.3v70.9c45.5 89.8 138.7 150.3 244.7 150.3z" />
                        <path fill="#4A90E2" d="M118.3 323.1c-10.7-31.5-10.7-65.6 0-97.1V155.1H27.3c-38.5 76.9-38.5 166.8 0 243.7l91-70.9z" />
                        <path fill="#FBBC05" d="M272 107.1c39.9-.6 78.2 13.7 107.8 39.8l80.8-80.8C409.7 24.4 343.6-.1 272 0 166 0 72.8 60.5 27.3 150.3l91 70.9C140.1 155.1 200.6 107.1 272 107.1z" />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </motion.button>
                
                {/* Label for Last Used */}
                {localStorage.getItem('lastUsed') === 'google' && (
                 <label className="absolute left-2 bottom-[-18px] text-xs text-purple-500 font-medium">
                    Last Used
                  </label>
                )}
              </div>  
              
              {/* GitHub Login */}
              <div className="relative w-full">
                <motion.button
                  type="button"
                  onClick={handleGithubLogin}
                  disabled={socialLoading}
                  whileHover={{ scale: socialLoading ? 1 : 1.02, y: socialLoading ? 0 : -2 }}
                  whileTap={{ scale: socialLoading ? 1 : 0.98 }}
                  className="w-full flex items-center justify-center gap-3 border-2 border-[var(--color-border)] px-6 py-4 rounded-xl text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] transition-all duration-200 font-medium shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {socialLoading === 'github' ? (
                    <>
                      <LoadingSpinner />
                      Connecting to GitHub...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 0C5.371 0 0 5.371 0 12C0 17.303 3.438 21.8 8.207 23.385C8.805 23.495 9.025 23.145 9.025 22.845C9.025 22.575 9.015 21.855 9.009 20.955C5.672 21.675 4.968 19.455 4.968 19.455C4.422 18.105 3.633 17.745 3.633 17.745C2.546 17.025 3.714 17.04 3.714 17.04C4.922 17.13 5.555 18.285 5.555 18.285C6.623 20.055 8.385 19.575 9.05 19.275C9.155 18.495 9.47 17.955 9.82 17.64C7.158 17.325 4.344 16.29 4.344 11.61C4.344 10.29 4.803 9.225 5.58 8.4C5.454 8.085 5.049 6.825 5.694 5.115C5.694 5.115 6.693 4.785 8.994 6.36C9.933 6.09 10.941 5.955 11.949 5.949C12.957 5.955 13.965 6.09 14.907 6.36C17.205 4.785 18.204 5.115 18.204 5.115C18.849 6.825 18.444 8.085 18.318 8.4C19.095 9.225 19.548 10.29 19.548 11.61C19.548 16.305 16.728 17.319 14.058 17.631C14.499 18.015 14.889 18.78 14.889 20.01C14.889 21.735 14.871 22.455 14.871 22.845C14.871 23.145 15.087 23.499 15.693 23.385C20.46 21.798 24 17.301 24 12C24 5.371 18.627 0 12 0Z"
                        />
                      </svg>
                      Continue with GitHub
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            // Email Form (unchanged, keeping original content)
            <motion.form
              key="email-form"
              onSubmit={submit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Back Button */}
              <motion.button
                type="button"
                onClick={() => setShowEmailForm(false)}
                disabled={socialLoading}
                className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-4 disabled:opacity-50"
                whileHover={{ x: socialLoading ? 0 : -4 }}
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to login options
              </motion.button>

              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label htmlFor="email" className="text-sm font-medium text-[var(--color-text)]">
                  Email
                </label>
                <div className="relative mt-1">
                  <input
                    id="email"
                    type="email"
                    value={data.email}
                    autoComplete="username"
                    onChange={(e) => setData('email', e.target.value)}
                    className="w-full px-4 py-3 pl-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none shadow-[var(--shadow-sm)] transition-all"
                    placeholder="Enter your email"
                    required
                  />
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-[var(--color-text-muted)]" />
                </div>
                <InputError message={errors.email} className="mt-2" />
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label htmlFor="password" className="text-sm font-medium text-[var(--color-text)]">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    autoComplete="current-password"
                    className="w-full px-4 py-3 pl-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none shadow-[var(--shadow-sm)] transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-[var(--color-text-muted)]" />
                </div>
                <InputError message={errors.password} className="mt-2" />
              </motion.div>

              {/* Remember + Forgot Password */}
              <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="flex items-center gap-2">
                  <Checkbox
                    name="remember"
                    checked={data.remember}
                    onChange={(e) => setData('remember', e.target.checked)}
                  />
                  <span className="text-sm text-[var(--color-text)]">Remember me</span>
                </label>
                {canResetPassword && (
                  <Link
                    href={route('password.request')}
                    className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={processing || socialLoading}
                className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium px-6 py-4 rounded-xl shadow-[var(--shadow-lg)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed transform hover:shadow-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {processing ? (
                  <>
                    <LoadingSpinner />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Log in
                  </>
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Register Link */}
        <motion.div
          className="text-center text-sm text-[var(--color-text-muted)] pt-6 mt-6 border-t border-[var(--color-border)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span>Don't have an account?</span>{' '}
          <Link
            href={route('register')}
            className="inline-flex items-center gap-1 font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline transition-colors"
          >
            Create account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </motion.div>
    </GuestLayout>
  )
}