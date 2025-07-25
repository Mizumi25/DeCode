



import React, { useEffect } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react'
import Checkbox from '@/Components/Checkbox'
import InputError from '@/Components/InputError'
import GuestLayout from '@/Layouts/GuestLayout'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export default function Login({ status, canResetPassword }) {
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
    NProgress.start()
    window.location.href = '/auth/google/redirect'
  }

  useEffect(() => {
    NProgress.configure({ showSpinner: false })
  }, [])

  return (
    <GuestLayout>
      <Head title="Log in" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-md mx-auto bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl shadow-xl p-8 mt-20"
      >
        {status && (
          <div className="mb-4 text-sm font-medium text-green-600 dark:text-green-400">
            {status}
          </div>
        )}

        <motion.form onSubmit={submit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="relative mt-1">
              <input
                id="email"
                type="email"
                value={data.email}
                autoComplete="username"
                onChange={(e) => setData('email', e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-lg border bg-white/80 dark:bg-zinc-800/70 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none shadow-sm"
                placeholder="Enter your email"
                required
              />
              <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <InputError message={errors.email} className="mt-2" />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-2 pl-10 rounded-lg border bg-white/80 dark:bg-zinc-800/70 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none shadow-sm"
                placeholder="Enter your password"
                required
              />
              <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <InputError message={errors.password} className="mt-2" />
          </div>

          {/* Remember + Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <Checkbox
                name="remember"
                checked={data.remember}
                onChange={(e) => setData('remember', e.target.checked)}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Remember me</span>
            </label>
            {canResetPassword && (
              <Link
                href={route('password.request')}
                className="text-sm text-[var(--color-primary)] hover:underline"
              >
                Forgot password?
              </Link>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={processing}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white font-medium px-4 py-2 rounded-lg shadow transition-all disabled:opacity-60"
          >
            {processing ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Log in
              </>
            )}
          </motion.button>

          {/* Google Login */}
          <motion.button
            type="button"
            onClick={handleGoogleLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-zinc-600 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
              <path fill="#EA4335" d="M533.5 278.4c0-17.6-1.6-35.1-4.8-52H272v98.5h146.9c-6.4 34.3-25.4 63.2-54.2 82.8v68h87.6c51.1-47.1 81.2-116.5 81.2-197.3z" />
              <path fill="#34A853" d="M272 544.3c73.6 0 135.4-24.3 180.5-66.1l-87.6-68c-24.3 16.3-55.3 25.8-92.9 25.8-71.4 0-131.9-48.1-153.7-112.9H27.3v70.9c45.5 89.8 138.7 150.3 244.7 150.3z" />
              <path fill="#4A90E2" d="M118.3 323.1c-10.7-31.5-10.7-65.6 0-97.1V155.1H27.3c-38.5 76.9-38.5 166.8 0 243.7l91-70.9z" />
              <path fill="#FBBC05" d="M272 107.1c39.9-.6 78.2 13.7 107.8 39.8l80.8-80.8C409.7 24.4 343.6-.1 272 0 166 0 72.8 60.5 27.3 150.3l91 70.9C140.1 155.1 200.6 107.1 272 107.1z" />
            </svg>
            Continue with Google
          </motion.button>

          {/* Register */}
          <motion.div
            className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span>Don’t have an account?</span>{' '}
            <Link
              href={route('register')}
              className="inline-flex items-center gap-1 font-medium text-[var(--color-primary)] hover:underline"
            >
              Register
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.form>
      </motion.div>
    </GuestLayout>
  )
}
