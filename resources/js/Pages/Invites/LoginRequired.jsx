import React from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import { Building, LogIn, UserPlus, Shield } from 'lucide-react';

export default function LoginRequired({ invite, login_url, register_url }) {
  const workspaceName = invite?.workspace?.name;
  const workspaceDescription = invite?.workspace?.description;
  const roleLabel = invite?.role === 'editor' ? 'Editor Access' : 'Viewer Access';

  return (
    <GuestLayout>
      <Head title="Login Required" />

      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'var(--color-surface)' }}>
          <Shield className="h-7 w-7" style={{ color: 'var(--color-primary)' }} />
        </div>
        <h2 className="mt-4 text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Please sign in to accept your invite
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          You need an account to join this workspace.
        </p>
      </div>

      <div
        className="mt-6 rounded-xl p-5"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div className="flex items-start space-x-3">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))' }}>
            <Building className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              {workspaceName || 'Workspace'}
            </div>
            {workspaceDescription ? (
              <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {workspaceDescription}
              </div>
            ) : null}
            <div className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              Role: <span style={{ color: 'var(--color-text)' }}>{roleLabel}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={login_url || route('login')}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--color-primary)', color: 'white' }}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Link>

          <Link
            href={register_url || route('register')}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Create account
          </Link>
        </div>

        <div className="mt-4 text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
          After signing in, you’ll be returned to this invitation.
        </div>
      </div>
    </GuestLayout>
  );
}
