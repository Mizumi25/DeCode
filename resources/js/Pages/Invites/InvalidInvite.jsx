import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, LogIn, UserPlus } from 'lucide-react';

export default function InvalidInvite({ message, auth }) {
  const Layout = auth && auth.user ? AuthenticatedLayout : GuestLayout;

  return (
    <Layout>
      <Head title="Invitation Not Available" />

      <div
        className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
        style={{
          background:
            'linear-gradient(135deg, var(--color-primary-soft) 0%, var(--color-bg) 45%)',
        }}
      >
        <div className="max-w-md w-full">
          <div
            className="rounded-xl p-6"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div className="flex items-start space-x-4">
              <div
                className="p-3 rounded-full"
                style={{ background: 'rgba(245, 158, 11, 0.12)' }}
              >
                <AlertTriangle className="h-8 w-8" style={{ color: 'rgb(245, 158, 11)' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                  Invitation not available
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {message || 'This invitation link is invalid or has expired.'}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href={route('welcome')}
                className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  background: 'var(--color-primary)',
                  color: 'white',
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to home
              </Link>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href={route('login')}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>

                <Link
                  href={route('register')}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign up
                </Link>
              </div>

              <div className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                If you believe this is a mistake, ask the workspace owner to send you a new invite.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
