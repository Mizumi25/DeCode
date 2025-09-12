import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Shield, Clock, Building, Users } from 'lucide-react';
import { motion } from 'framer-motion'
import AnimatedBlackHoleLogo from '@/Components/AnimatedBlackHoleLogo'

export default function AcceptInvite({ invite, auth }) {
    const { post, processing, errors } = useForm();

    const handleAccept = (e) => {
        e.preventDefault();
        post(route('invite.accept', invite.token));
    };

    const Layout = auth.user ? AuthenticatedLayout : GuestLayout;

    // simple, consistent motion variants
    const container = {
      hidden: { opacity: 0, y: 8 },
      show: { opacity: 1, y: 0, transition: { staggerChildren: 0.04, ease: 'easeOut', duration: 0.36 } },
    }

    const pop = {
      hidden: { opacity: 0, y: 6, scale: 0.995 },
      show: { opacity: 1, y: 0, scale: 1, transition: { ease: 'easeOut', duration: 0.32 } },
    }

    return (
        <Layout>
            <Head title="Accept Workspace Invitation" />
            
            <div
              className="min-h-screen"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary-soft) 0%, var(--color-bg) 45%, rgba(255,255,255,0.6) 55%)',
              }}
            >
                <motion.div className="flex min-h-screen" initial="hidden" animate="show" variants={container}>
                    <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                        <div className="mx-auto w-full max-w-md lg:w-96">
                            {/* Header */}
                            <motion.div className="text-center mb-8" variants={pop}>
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{
                                    background: 'var(--color-surface)',
                                }}>
                                    {/* Replaced Users icon with Animated Black Hole logo (like your Login) */}
                                    <AnimatedBlackHoleLogo size={50} />
                                </div>
                                <h2 className="mt-4 text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                                    You're Invited!
                                </h2>
                                <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                    Join {invite.workspace.name} and start collaborating
                                </p>
                            </motion.div>

                            {/* Workspace Info Card */}
                            <motion.div
                                variants={pop}
                                className="rounded-xl p-6 mb-8"
                                style={{
                                    background: 'var(--color-surface)',
                                    boxShadow: 'var(--shadow-lg)',
                                    border: '1px solid',
                                    borderColor: 'var(--color-border)',
                                }}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-12 w-12 rounded-lg flex items-center justify-center"
                                            style={{
                                                background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))',
                                            }}
                                        >
                                            <Building className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                                            {invite.workspace.name}
                                        </h3>
                                        {invite.workspace.description && (
                                            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                                {invite.workspace.description}
                                            </p>
                                        )}
                                        <div className="mt-3 flex items-center space-x-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                            <div className="flex items-center">
                                                <Shield className="h-4 w-4 mr-1" />
                                                {invite.role === 'editor' ? 'Editor Access' : 'Viewer Access'}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 mr-1" />
                                                Expires {new Date(invite.expires_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                                Invited by {invite.workspace.owner.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Role Description */}
                            <motion.div variants={pop} className="mb-8">
                                <div
                                    className={`rounded-lg p-4`}
                                    style={{
                                        border: '1px solid',
                                        borderColor: invite.role === 'editor' ? 'var(--color-accent)' : 'var(--color-border)',
                                        background: invite.role === 'editor' ? 'linear-gradient(180deg, rgba(16,185,129,0.06), transparent)' : 'linear-gradient(180deg, rgba(59,130,246,0.04), transparent)'
                                    }}
                                >
                                    <h4 className="font-medium" style={{ color: invite.role === 'editor' ? 'var(--color-text)' : 'var(--color-text)' }}>
                                        {invite.role === 'editor' ? 'Editor Permissions' : 'Viewer Permissions'}
                                    </h4>
                                    <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                        {invite.role === 'editor' 
                                            ? 'You can create, edit, and manage projects in this workspace.'
                                            : 'You can view projects and workspaces but cannot make changes.'
                                        }
                                    </p>
                                </div>
                            </motion.div>

                            {/* Error Display */}
                            {errors && Object.keys(errors).length > 0 && (
                                <motion.div variants={pop} className="mb-6 rounded-lg p-4" style={{
                                    background: 'linear-gradient(180deg, rgba(254,226,226,0.6), rgba(255,255,255,0.02))',
                                    border: '1px solid',
                                    borderColor: 'rgba(240, 68, 68, 0.12)',
                                }}>
                                    <div className="text-sm" style={{ color: 'var(--color-text)' }}>
                                        {Object.values(errors).map((error, index) => (
                                            <div key={index}>{error}</div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Accept Button */}
                            <motion.form onSubmit={handleAccept} variants={pop}>
                                <motion.button
                                    type="submit"
                                    disabled={processing}
                                    whileHover={{ y: processing ? 0 : -4, scale: processing ? 1 : 1.01 }}
                                    whileTap={{ scale: 0.995 }}
                                    className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white"
                                    style={{
                                        background: 'var(--color-primary)',
                                        outline: 'none',
                                        boxShadow: 'var(--shadow-lg)',
                                        opacity: processing ? 0.85 : 1,
                                        transition: 'transform var(--transition), box-shadow var(--transition)',
                                    }}
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Joining Workspace...
                                        </>
                                    ) : (
                                        <>
                                            <Users className="h-5 w-5 mr-2" />
                                            Accept Invitation & Join Workspace
                                        </>
                                    )}
                                </motion.button>
                            </motion.form>

                            {/* Footer */}
                            <motion.div variants={pop} className="mt-8 text-center">
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                    By accepting, you agree to collaborate in this workspace.
                                    {!auth.user && (
                                        <>
                                            <br />
                                            Need an account? <Link href={route('register')} className="text-[var(--color-primary)] hover:underline">Sign up here</Link>
                                        </>
                                    )}
                                </p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right side - Visual */}
                    <motion.div
                      className="hidden lg:block relative w-0 flex-1"
                      variants={pop}
                      style={{ minWidth: 340 }}
                    >
                        <div className="absolute inset-0" style={{
                            background: 'linear-gradient(180deg, var(--color-primary), var(--color-primary-hover))',
                        }}>
                            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.18)' }}></div>
                            <div className="relative h-full flex flex-col justify-center px-12">
                                <div className="max-w-md">
                                    <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                                        Welcome to {invite.workspace.name}
                                    </h3>
                                    <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Join your team and start building amazing projects together with DeCode's visual development platform.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex items-center" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                            <div className="w-2 h-2 bg-[var(--color-primary-soft)] rounded-full mr-3"></div>
                                            Visual drag-and-drop editor
                                        </div>
                                        <div className="flex items-center" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                            <div className="w-2 h-2 bg-[var(--color-border)] rounded-full mr-3"></div>
                                            Real-time collaboration
                                        </div>
                                        <div className="flex items-center" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                            <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full mr-3"></div>
                                            Export to production-ready code
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </Layout>
    );
}
