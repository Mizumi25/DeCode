




// Admin/RolePermissionPage.jsx
import { Shield } from 'lucide-react';

export default function RolePermissionPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-muted)] p-8 text-[var(--color-text)]">
      <h1 className="text-[var(--fs-xl)] font-semibold mb-6 flex items-center gap-2">
        <Shield size={24} /> Roles & Permissions
      </h1>
      <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-md)] shadow-md">
        <div className="space-y-4">
          {['Admin', 'Editor', 'Viewer'].map(role => (
            <div key={role}>
              <h2 className="font-semibold text-[var(--fs-lg)]">{role}</h2>
              <p className="text-[var(--color-text-muted)] text-[var(--fs-sm)]">
                {role === 'Admin'
                  ? 'Full access to all features'
                  : role === 'Editor'
                  ? 'Can edit projects but not manage users'
                  : 'Can view but not edit'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}