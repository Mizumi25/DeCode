import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Building } from 'lucide-react';

export default function AlreadyMember({ workspace, user_role, auth }) {
  const Layout = auth && auth.user ? AuthenticatedLayout : GuestLayout;

  // build a safe projects URL that matches your web.php route: /workspaces/{workspace}/projects
  const projectsUrl = workspace && workspace.uuid ? `/workspaces/${workspace.uuid}/projects` : '/projects';

  return (
    <Layout>
      <Head title="Already a Member" />

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, var(--color-primary-soft) 0%, var(--color-bg) 45%)' }}>
        <div className="max-w-md w-full">
          <div className="rounded-xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-50">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                  You're already a member
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  You already belong to <strong>{workspace.name}</strong>.
                </p>
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))' }}>
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{workspace.name}</div>
                    {workspace.description && <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{workspace.description}</div>}
                  </div>
                </div>

                <div className="text-xs text-right" style={{ color: 'var(--color-text-muted)' }}>
                  <div>Role</div>
                  <div className="font-medium" style={{ color: 'var(--color-text)' }}>{user_role}</div>
                </div>
              </div>

              <div className="mt-6">
                <Link href={projectsUrl} className="w-full inline-flex justify-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium">
                  Go to Workspace
                </Link>
              </div>

              <div className="mt-3 text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                Already signed in? If you still have trouble accessing the workspace, contact the workspace owner.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
