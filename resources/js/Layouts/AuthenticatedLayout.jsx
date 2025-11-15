import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Header from '@/Components/Header/Header';
import { useThemeStore } from '@/stores/useThemeStore';
import { useHeaderStore } from '@/stores/useHeaderStore';
import CustomCursor from '@/Components/CustomCursor';
import DecodeLoading from '@/Components/DecodeLoading';
import WorkspaceChat from '@/Components/Workspaces/WorkspaceChat';

export default function AuthenticatedLayout({ 
  header, 
  children, 
  onThemeChange, 
  headerProps = {},
  workspaceProps = {} // ✅ ADD workspace props
}) {
  const user = usePage().props.auth.user;
  const currentRoute = usePage().url;
  const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
  
  // Get theme and header state from Zustand stores
  const { isDark } = useThemeStore();
  const { isHeaderVisible } = useHeaderStore();
  
  const handleThemeChange = (isDarkFromHeader) => {
    // Call the prop callback if provided (for backward compatibility)
    if (onThemeChange) {
      onThemeChange(isDarkFromHeader);
    }
  };

  return (
    <div className="min-h-screen relative bg-[var(--color-bg)]">
      <DecodeLoading />
   <CustomCursor />
      <Header 
        isAuthenticated={!!user} 
        currentRoute={currentRoute} 
        onThemeChange={handleThemeChange}
        // Pass through the header props from pages
        {...headerProps}
      />
      
      {/* Main content with dynamic margin based on header visibility */}
      <div 
        className={`h-full w-full relative transition-all duration-300 ${
          isHeaderVisible ? 'mt-10' : 'mt-0'
        }`}
      >
        {header && (
          <header className="bg-[var(--color-surface)] shadow">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {header}
            </div>
          </header>
        )}
        
        <main>{children}</main>
        
        {/* ✅ ADD THE WORKSPACE CHAT COMPONENT HERE */}
        <WorkspaceChat {...workspaceProps} />
      </div>
    </div>
  );
}