import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef, useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, Check, X } from 'lucide-react';
import gsap from 'gsap';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const formRef = useRef();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
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

    // Password strength checker
    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const handlePasswordChange = (value) => {
        setData('password', value);
        setPasswordStrength(checkPasswordStrength(value));
    };

    const getStrengthColor = () => {
        switch (passwordStrength) {
            case 0:
            case 1: return 'bg-red-500';
            case 2: return 'bg-orange-500';
            case 3: return 'bg-yellow-500';
            case 4: return 'bg-blue-500';
            case 5: return 'bg-green-500';
            default: return 'bg-gray-300';
        }
    };

    const getStrengthText = () => {
        switch (passwordStrength) {
            case 0:
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Strong';
            case 5: return 'Very Strong';
            default: return '';
        }
    };

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setPasswordStrength(0);
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    const passwordRequirements = [
        { test: (pwd) => pwd.length >= 8, text: 'At least 8 characters' },
        { test: (pwd) => /[a-z]/.test(pwd), text: 'One lowercase letter' },
        { test: (pwd) => /[A-Z]/.test(pwd), text: 'One uppercase letter' },
        { test: (pwd) => /[0-9]/.test(pwd), text: 'One number' },
        { test: (pwd) => /[^A-Za-z0-9]/.test(pwd), text: 'One special character' },
    ];

    return (
        <section className={className} ref={formRef}>
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[var(--color-primary-soft)] rounded-lg">
                        <Shield className="w-6 h-6 text-[var(--color-primary)]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--color-text)]">
                        Update Password
                    </h2>
                </div>
                <p className="text-[var(--color-text-muted)]">
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className="space-y-6">
                {/* Current Password */}
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Current Password"
                        className="text-[var(--color-text)] font-medium"
                    />
                    <div className="relative mt-2">
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            type={showCurrentPassword ? 'text' : 'password'}
                            className="block w-full pr-10 rounded-lg border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                            {showCurrentPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    <InputError
                        message={errors.current_password}
                        className="mt-2"
                    />
                </div>

                {/* New Password */}
                <div>
                    <InputLabel 
                        htmlFor="password" 
                        value="New Password" 
                        className="text-[var(--color-text)] font-medium"
                    />
                    <div className="relative mt-2">
                        <TextInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            type={showNewPassword ? 'text' : 'password'}
                            className="block w-full pr-10 rounded-lg border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                            {showNewPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {data.password && (
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-[var(--color-text-muted)]">
                                    Password Strength
                                </span>
                                <span className={`text-sm font-medium ${
                                    passwordStrength >= 4 ? 'text-green-600' : 
                                    passwordStrength >= 3 ? 'text-blue-600' :
                                    passwordStrength >= 2 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                    {getStrengthText()}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Password Requirements */}
                    {data.password && (
                        <div className="mt-4 p-4 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg">
                            <h4 className="text-sm font-medium text-[var(--color-text)] mb-3">
                                Password Requirements
                            </h4>
                            <div className="space-y-2">
                                {passwordRequirements.map((req, index) => {
                                    const isValid = req.test(data.password);
                                    return (
                                        <div key={index} className="flex items-center gap-2">
                                            {isValid ? (
                                                <Check className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <X className="w-4 h-4 text-red-500" />
                                            )}
                                            <span className={`text-sm ${
                                                isValid ? 'text-green-600' : 'text-[var(--color-text-muted)]'
                                            }`}>
                                                {req.text}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Confirm Password */}
                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm New Password"
                        className="text-[var(--color-text)] font-medium"
                    />
                    <div className="relative mt-2">
                        <TextInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            type={showConfirmPassword ? 'text' : 'password'}
                            className="block w-full pr-10 rounded-lg border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {/* Password Match Indicator */}
                    {data.password_confirmation && (
                        <div className="mt-2 flex items-center gap-2">
                            {data.password === data.password_confirmation ? (
                                <>
                                    <Check className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-green-600">Passwords match</span>
                                </>
                            ) : (
                                <>
                                    <X className="w-4 h-4 text-red-500" />
                                    <span className="text-sm text-red-600">Passwords don't match</span>
                                </>
                            )}
                        </div>
                    )}

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-6 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-4">
                        <PrimaryButton 
                            disabled={processing || passwordStrength < 3}
                            className="px-8 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
                        >
                            {processing ? 'Updating...' : 'Update Password'}
                        </PrimaryButton>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out duration-300"
                            enterFrom="opacity-0 scale-90"
                            enterTo="opacity-100 scale-100"
                            leave="transition ease-in-out duration-300"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-90"
                        >
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                                    Password updated successfully!
                                </p>
                            </div>
                        </Transition>
                    </div>
                </div>
            </form>
        </section>
    );
}