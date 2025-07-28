import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { User, Briefcase, Settings, Shield, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Edit({ mustVerifyEmail, status }) {
    const [activeTab, setActiveTab] = useState('profile');
    const contentRef = useRef(null);
    const sidebarRef = useRef(null);

    useEffect(() => {
        // Initial page load animation
        const ctx = gsap.context(() => {
            gsap.fromTo(sidebarRef.current, 
                { x: -50, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
            );
            gsap.fromTo(contentRef.current,
                { x: 50, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.2 }
            );
        });

        return () => ctx.revert();
    }, []);

    const handleTabChange = (tab) => {
        if (tab === activeTab) return;
        
        // Animate content transition
        gsap.to(contentRef.current, {
            opacity: 0,
            y: 20,
            duration: 0.2,
            ease: "power2.inOut",
            onComplete: () => {
                setActiveTab(tab);
                gsap.fromTo(contentRef.current, 
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
                );
            }
        });
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'workspaces', label: 'Workspaces', icon: Briefcase },
        { id: 'danger', label: 'Danger Zone', icon: Trash2 }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <div 
                            className="bg-white dark:bg-[var(--color-surface)] p-6 shadow-sm border border-[var(--color-border)] rounded-xl"
                            style={{ 
                                background: 'var(--color-surface)',
                                borderColor: 'var(--color-border)',
                                boxShadow: 'var(--shadow-md)'
                            }}
                        >
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-2xl"
                            />
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-6">
                        <div 
                            className="bg-white dark:bg-[var(--color-surface)] p-6 shadow-sm border border-[var(--color-border)] rounded-xl"
                            style={{ 
                                background: 'var(--color-surface)',
                                borderColor: 'var(--color-border)',
                                boxShadow: 'var(--shadow-md)'
                            }}
                        >
                            <UpdatePasswordForm className="max-w-2xl" />
                        </div>
                    </div>
                );
            case 'workspaces':
                return (
                    <div className="space-y-6">
                        <div 
                            className="bg-white dark:bg-[var(--color-surface)] p-6 shadow-sm border border-[var(--color-border)] rounded-xl"
                            style={{ 
                                background: 'var(--color-surface)',
                                borderColor: 'var(--color-border)',
                                boxShadow: 'var(--shadow-md)'
                            }}
                        >
                            <div className="text-center py-12">
                                <Briefcase className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
                                    Workspaces Coming Soon
                                </h3>
                                <p className="text-[var(--color-text-muted)]">
                                    Manage your projects and collaborations in organized workspaces.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 'danger':
                return (
                    <div className="space-y-6">
                        <div 
                            className="bg-white dark:bg-[var(--color-surface)] p-6 shadow-sm border border-red-200 dark:border-red-900/30 rounded-xl"
                            style={{ 
                                background: 'var(--color-surface)',
                                boxShadow: 'var(--shadow-md)'
                            }}
                        >
                            <DeleteUserForm className="max-w-2xl" />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
            <Head title="Profile Settings" />
            
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
                            Account Settings
                        </h1>
                        <p className="text-[var(--color-text-muted)]">
                            Manage your account preferences and security settings
                        </p>
                    </div>

                    <div className="flex gap-8">
                        {/* Enhanced Sidebar */}
                        <div ref={sidebarRef} className="w-80 flex-shrink-0">
                            <div 
                                className="sticky top-8 bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4"
                                style={{ 
                                    background: 'var(--color-surface)',
                                    borderColor: 'var(--color-border)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            >
                                <nav className="space-y-2">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => handleTabChange(tab.id)}
                                                className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group ${
                                                    isActive 
                                                        ? 'bg-[var(--color-primary)] text-white shadow-md' 
                                                        : 'text-[var(--color-text)] hover:bg-[var(--color-bg-muted)]'
                                                }`}
                                                style={{
                                                    backgroundColor: isActive ? 'var(--color-primary)' : 'transparent'
                                                }}
                                            >
                                                <Icon 
                                                    className={`w-5 h-5 transition-transform duration-200 ${
                                                        isActive ? 'scale-110' : 'group-hover:scale-105'
                                                    }`} 
                                                />
                                                <span className="font-medium">{tab.label}</span>
                                                {isActive && (
                                                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </nav>

                                {/* Settings Footer */}
                                <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                                    <div className="flex items-center gap-3 px-4 py-2 text-[var(--color-text-muted)]">
                                        <Settings className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div ref={contentRef} className="flex-1 min-w-0">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}