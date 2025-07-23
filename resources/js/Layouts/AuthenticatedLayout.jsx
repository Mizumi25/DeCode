import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Header from '@/Components/Header/Header';

export default function AuthenticatedLayout({ header, children }) {
  const user = usePage().props.auth.user;
  const currentRoute = usePage().url // gets current route like '/projects'
  const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Header isAuthenticated={!!user} currentRoute={currentRoute} />

      {header && (
        <header className="bg-[var(--color-surface)] shadow">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {header}
          </div>
        </header>
      )}

      <main>{children}</main>
    </div>
  );
}

