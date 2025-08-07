import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState, useEffect } from 'react';
import { Trash2, AlertTriangle, Eye, EyeOff, Shield } from 'lucide-react';
import gsap from 'gsap';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [confirmationText, setConfirmationText] = useState('');
    const passwordInput = useRef();
    const formRef = useRef();
    const dangerZoneRef = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    useEffect(() => {
        // Animate form entrance
        const ctx = gsap.context(() => {
            gsap.fromTo(formRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
            );
        });

        return () => ctx.revert();
    }, []);

    const confirmUserDeletion = () => {
        // Animate danger zone before opening modal
        gsap.to(dangerZoneRef.current, {
            scale: 1.02,
            duration: 0.2,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
            onComplete: () => setConfirmingUserDeletion(true)
        });
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        setConfirmationText('');
        clearErrors();
        reset();
    };

    const isConfirmationValid = confirmationText.toLowerCase() === 'delete my account';
    const canDelete = isConfirmationValid && data.password.length > 0;

    return (
        <section className={`${className}`} ref={formRef}>
            <div 
                ref={dangerZoneRef}
                className="border-2 border-red-200 dark:border-red-900/30 rounded-xl p-6"
                style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)',
                }}
            >
                <header className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">
                            Danger Zone
                        </h2>
                    </div>
                    <p className="text-[var(--color-text-muted)] leading-relaxed">
                        Once your account is deleted, all of its resources and data will be 
                        <span className="font-semibold text-red-600"> permanently deleted</span>. 
                        Before deleting your account, please download any data or information 
                        that you wish to retain.
                    </p>
                </header>

                {/* Warning Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
                                    Data Loss
                                </h4>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    All your projects, files, and settings will be permanently removed.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
                                    No Recovery
                                </h4>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    This action cannot be undone. Your account cannot be recovered.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DangerButton 
                    onClick={confirmUserDeletion}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                </DangerButton>
            </div>

            <Modal 
                show={confirmingUserDeletion} 
                onClose={closeModal}
                maxWidth="2xl"
                title="Delete Account Confirmation"
            >
                <form onSubmit={deleteUser} className="space-y-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                            Are you absolutely sure?
                        </h2>
                        <p className="text-[var(--color-text-muted)] leading-relaxed">
                            This action <span className="font-semibold text-red-600">cannot be undone</span>. 
                            This will permanently delete your account and remove all of your data from our servers.
                        </p>
                    </div>

                    {/* Confirmation Text Input */}
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <InputLabel
                            htmlFor="confirmation"
                            value={`Please type "delete my account" to confirm:`}
                            className="text-red-800 dark:text-red-200 font-medium mb-2"
                        />
                        <TextInput
                            id="confirmation"
                            type="text"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            className="w-full border-red-300 focus:border-red-500 focus:ring-red-500"
                            placeholder="Type: delete my account"
                        />
                        
                        {confirmationText && (
                            <div className="mt-2 flex items-center gap-2">
                                {isConfirmationValid ? (
                                    <>
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-green-600 font-medium">
                                            Confirmation text is correct
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span className="text-sm text-red-600">
                                            Please type exactly: "delete my account"
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Password Input */}
                    <div>
                        <InputLabel
                            htmlFor="password"
                            value="Enter your password to confirm:"
                            className="text-[var(--color-text)] font-medium mb-2"
                        />

                        <div className="relative">
                            <TextInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full pr-10 border-[var(--color-border)] focus:border-red-500 focus:ring-red-500"
                                isFocused
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    {/* Final Warning */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                                    Final Warning
                                </h4>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    We will immediately delete all of your data including projects, 
                                    settings, and any associated content. This action is irreversible.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-[var(--color-border)]">
                        <SecondaryButton 
                            onClick={closeModal}
                            className="px-6 py-3 font-medium"
                        >
                            Cancel
                        </SecondaryButton>

                        <DangerButton 
                            className={`px-6 py-3 font-medium transition-all duration-200 ${
                                canDelete 
                                    ? 'bg-red-600 hover:bg-red-700 transform hover:scale-105' 
                                    : 'opacity-50 cursor-not-allowed'
                            }`}
                            disabled={processing || !canDelete}
                        >
                            {processing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Account Forever
                                </>
                            )}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}