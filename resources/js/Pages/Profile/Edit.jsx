


import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

import { User, Briefcase } from 'lucide-react'; 

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <div
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex gap-6">
                        {/* Mini Sidebar */}
                        <div className="w-[35%] max-w-sm border-r pr-4">
                            <div className="space-y-2">
                                <button className="flex items-center w-full gap-3 text-gray-700 hover:text-[var(--color-primary)] px-3 py-2 rounded-md transition-colors">
                                    <User className="w-5 h-5" />
                                    <span className="text-sm font-medium">Profile</span>
                                </button>

                                <button className="flex items-center w-full gap-3 text-gray-700 hover:text-[var(--color-primary)] px-3 py-2 rounded-md transition-colors">
                                    <Briefcase className="w-5 h-5" />
                                    <span className="text-sm font-medium">Workspaces</span>
                                </button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 space-y-6">
                            <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    className="max-w-xl"
                                />
                            </div>

                            <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                                <UpdatePasswordForm className="max-w-xl" />
                            </div>

                            <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                                <DeleteUserForm className="max-w-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
