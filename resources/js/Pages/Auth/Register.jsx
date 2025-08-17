import React, { useEffect } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { motion } from 'framer-motion'
import {
  Mail,
  Lock,
  User,
  LogIn,
  Check,
  ArrowRight,
} from 'lucide-react'
import InputError from '@/Components/InputError'
import GuestLayout from '@/Layouts/GuestLayout'
import AnimatedBlackHoleLogo from '@/Components/AnimatedBlackHoleLogo'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  const submit = (e) => {
    e.preventDefault()
    NProgress.start()
    post(route('register'), {
      onFinish: () => {
        reset('password', 'password_confirmation')
        NProgress.done()
      },
    })
  }

  useEffect(() => {
    NProgress.configure({ showSpinner: false })
  }, [])

  return (
    <GuestLayout>
      <Head title="Register" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-md mx-auto bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mt-20 border border-gray-200/20 dark:border-zinc-700/20"
      >
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/">
             <AnimatedBlackHoleLogo size={80} className="filter drop-shadow-lg" />
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join us and start your journey today
          </p>
        </motion.div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Name Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <div className="relative mt-1">
              <input
                id="name"
                name="name"
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white/90 dark:bg-zinc-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 focus:border-transparent outline-none shadow-sm transition-all"
                placeholder="Enter your full name"
                required
                autoComplete="name"
              />
              <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            </div>
            <InputError message={errors.name} className="mt-2" />
          </motion.div>

          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white/90 dark:bg-zinc-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 focus:border-transparent outline-none shadow-sm transition-all"
                placeholder="Enter your email address"
                required
              />
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            </div>
            <InputError message={errors.email} className="mt-2" />
          </motion.div>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white/90 dark:bg-zinc-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 focus:border-transparent outline-none shadow-sm transition-all"
                placeholder="Create a secure password"
                required
              />
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            </div>
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
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
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
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white/90 dark:bg-zinc-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 focus:border-transparent outline-none shadow-sm transition-all"
                placeholder="Confirm your password"
                required
              />
              <Check className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            </div>
            <InputError message={errors.password_confirmation} className="mt-2" />
          </motion.div>

          {/* Terms and Conditions */}
          <motion.div
            className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 bg-blue-500 dark:bg-purple-500 rounded-full"></div>
            </div>
            <p>
              By creating an account, you agree to our{' '}
              <Link href="#" className="text-blue-600 dark:text-purple-400 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="text-blue-600 dark:text-purple-400 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            disabled={processing}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-4 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed transform hover:shadow-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            {processing ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Creating account...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Create Account
              </>
            )}
          </motion.button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-zinc-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-zinc-900 px-2 text-gray-500 dark:text-gray-400">
                Or sign up with
              </span>
            </div>
          </div>

          {/* Social Registration Options */}
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              type="button"
              onClick={() => window.location.href = '/auth/google/redirect'}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-zinc-700 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
                <path fill="#EA4335" d="M533.5 278.4c0-17.6-1.6-35.1-4.8-52H272v98.5h146.9c-6.4 34.3-25.4 63.2-54.2 82.8v68h87.6c51.1-47.1 81.2-116.5 81.2-197.3z" />
                <path fill="#34A853" d="M272 544.3c73.6 0 135.4-24.3 180.5-66.1l-87.6-68c-24.3 16.3-55.3 25.8-92.9 25.8-71.4 0-131.9-48.1-153.7-112.9H27.3v70.9c45.5 89.8 138.7 150.3 244.7 150.3z" />
                <path fill="#4A90E2" d="M118.3 323.1c-10.7-31.5-10.7-65.6 0-97.1V155.1H27.3c-38.5 76.9-38.5 166.8 0 243.7l91-70.9z" />
                <path fill="#FBBC05" d="M272 107.1c39.9-.6 78.2 13.7 107.8 39.8l80.8-80.8C409.7 24.4 343.6-.1 272 0 166 0 72.8 60.5 27.3 150.3l91 70.9C140.1 155.1 200.6 107.1 272 107.1z" />
              </svg>
              Google
            </motion.button>
            
            <motion.button
              type="button"
              onClick={() => window.location.href = '/auth/github/redirect'}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-zinc-700 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 0C5.371 0 0 5.371 0 12C0 17.303 3.438 21.8 8.207 23.385C8.805 23.495 9.025 23.145 9.025 22.845C9.025 22.575 9.015 21.855 9.009 20.955C5.672 21.675 4.968 19.455 4.968 19.455C4.422 18.105 3.633 17.745 3.633 17.745C2.546 17.025 3.714 17.04 3.714 17.04C4.922 17.13 5.555 18.285 5.555 18.285C6.623 20.055 8.385 19.575 9.05 19.275C9.155 18.495 9.47 17.955 9.82 17.64C7.158 17.325 4.344 16.29 4.344 11.61C4.344 10.29 4.803 9.225 5.58 8.4C5.454 8.085 5.049 6.825 5.694 5.115C5.694 5.115 6.693 4.785 8.994 6.36C9.933 6.09 10.941 5.955 11.949 5.949C12.957 5.955 13.965 6.09 14.907 6.36C17.205 4.785 18.204 5.115 18.204 5.115C18.849 6.825 18.444 8.085 18.318 8.4C19.095 9.225 19.548 10.29 19.548 11.61C19.548 16.305 16.728 17.319 14.058 17.631C14.499 18.015 14.889 18.78 14.889 20.01C14.889 21.735 14.871 22.455 14.871 22.845C14.871 23.145 15.087 23.499 15.693 23.385C20.46 21.798 24 17.301 24 12C24 5.371 18.627 0 12 0Z"
                />
              </svg>
              GitHub
            </motion.button>
          </div>

          {/* Login Link */}
          <motion.div
            className="text-center text-sm text-gray-600 dark:text-gray-400 pt-6 mt-6 border-t border-gray-200 dark:border-zinc-700"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <span>Already have an account?</span>{' '}
            <Link
              href={route('login')}
              className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-purple-400 hover:underline transition-colors"
            >
              Sign in
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.form>
      </motion.div>
    </GuestLayout>
  )
}