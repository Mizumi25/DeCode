

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
        className="relative z-10 max-w-md mx-auto bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl shadow-xl p-8 mt-20"
      >
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Name */}
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <div className="relative mt-1">
              <input
                id="name"
                name="name"
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-lg border bg-white/80 dark:bg-zinc-800/70 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none shadow-sm"
                placeholder="Enter your name"
                required
                autoComplete="name"
              />
              <User className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <InputError message={errors.name} className="mt-2" />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="relative mt-1">
              <input
                id="email"
                type="email"
                name="email"
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

          {/* Password */}
          <div>
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
                className="w-full px-4 py-2 pl-10 rounded-lg border bg-white/80 dark:bg-zinc-800/70 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none shadow-sm"
                placeholder="Create a password"
                required
              />
              <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <InputError message={errors.password} className="mt-2" />
          </div>

          {/* Password Confirmation */}
          <div>
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
                className="w-full px-4 py-2 pl-10 rounded-lg border bg-white/80 dark:bg-zinc-800/70 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none shadow-sm"
                placeholder="Confirm your password"
                required
              />
              <Check className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <InputError message={errors.password_confirmation} className="mt-2" />
          </div>

          {/* ✅ Button with spinner */}
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
                Register
              </>
            )}
          </motion.button>

          {/* Login link */}
          <motion.div
            className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span>Already registered?</span>{' '}
            <Link
              href={route('login')}
              className="inline-flex items-center gap-1 font-medium text-[var(--color-primary)] hover:underline"
            >
              Log in
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.form>
      </motion.div>
    </GuestLayout>
  )
}
