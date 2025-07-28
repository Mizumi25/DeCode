



// Update your existing AuthenticatedLayout.jsx
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Header from '@/Components/Header/Header';

export default function AuthenticatedLayout({ 
  header, 
  children, 
  onThemeChange, 
  headerProps = {} // NEW: Accept header props from pages
}) {
  const user = usePage().props.auth.user;
  const currentRoute = usePage().url;
  const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

  const handleThemeChange = (isDark) => {
    if (onThemeChange) {
      onThemeChange(isDark);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Header 
        isAuthenticated={!!user} 
        currentRoute={currentRoute} 
        onThemeChange={handleThemeChange}
        // Pass through the header props from pages
        {...headerProps}
      />
      
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