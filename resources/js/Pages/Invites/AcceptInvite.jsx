import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Users, Shield, Clock, Building } from 'lucide-react';

export default function AcceptInvite({ invite, auth }) {
    const { post, processing, errors } = useForm();

    const handleAccept = (e) => {
        e.preventDefault();
        post(route('invite.accept', invite.token));
    };

    const Layout = auth.user ? AuthenticatedLayout : GuestLayout;

    return (
        <Layout>
            <Head title="Accept Workspace Invitation" />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="flex min-h-screen">
                    <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                        <div className="mx-auto w-full max-w-md lg:w-96">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                    <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    You're Invited!
                                </h2>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Join {invite.workspace.name} and start collaborating
                                </p>
                            </div>

                            {/* Workspace Info Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                            <Building className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {invite.workspace.name}
                                        </h3>
                                        {invite.workspace.description && (
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                {invite.workspace.description}
                                            </p>
                                        )}
                                        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
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
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Invited by {invite.workspace.owner.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Role Description */}
                            <div className="mb-8">
                                <div className={`rounded-lg p-4 ${
                                    invite.role === 'editor' 
                                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                                        : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                }`}>
                                    <h4 className={`font-medium ${
                                        invite.role === 'editor' 
                                            ? 'text-green-900 dark:text-green-100' 
                                            : 'text-blue-900 dark:text-blue-100'
                                    }`}>
                                        {invite.role === 'editor' ? 'Editor Permissions' : 'Viewer Permissions'}
                                    </h4>
                                    <p className={`mt-1 text-sm ${
                                        invite.role === 'editor' 
                                            ? 'text-green-700 dark:text-green-300' 
                                            : 'text-blue-700 dark:text-blue-300'
                                    }`}>
                                        {invite.role === 'editor' 
                                            ? 'You can create, edit, and manage projects in this workspace.'
                                            : 'You can view projects and workspaces but cannot make changes.'
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Error Display */}
                            {errors && Object.keys(errors).length > 0 && (
                                <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                                    <div className="text-sm text-red-700 dark:text-red-300">
                                        {Object.values(errors).map((error, index) => (
                                            <div key={index}>{error}</div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Accept Button */}
                            <form onSubmit={handleAccept}>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                                </button>
                            </form>

                            {/* Footer */}
                            <div className="mt-8 text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    By accepting, you agree to collaborate in this workspace.
                                    {!auth.user && (
                                        <>
                                            <br />
                                            Need an account? <Link href={route('register')} className="text-blue-600 hover:text-blue-500">Sign up here</Link>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Visual */}
                    <div className="hidden lg:block relative w-0 flex-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700">
                            <div className="absolute inset-0 bg-black opacity-20"></div>
                            <div className="relative h-full flex flex-col justify-center px-12">
                                <div className="max-w-md">
                                    <h3 className="text-2xl font-bold text-white mb-4">
                                        Welcome to {invite.workspace.name}
                                    </h3>
                                    <p className="text-lg text-blue-100 mb-8">
                                        Join your team and start building amazing projects together with DeCode's visual development platform.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex items-center text-blue-100">
                                            <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                                            Visual drag-and-drop editor
                                        </div>
                                        <div className="flex items-center text-blue-100">
                                            <div className="w-2 h-2 bg-purple-300 rounded-full mr-3"></div>
                                            Real-time collaboration
                                        </div>
                                        <div className="flex items-center text-blue-100">
                                            <div className="w-2 h-2 bg-pink-300 rounded-full mr-3"></div>
                                            Export to production-ready code
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}