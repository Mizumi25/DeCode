import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Github, Chrome, User } from 'lucide-react';
import gsap from 'gsap';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);
    const avatarRef = useRef(null);
    const formRef = useRef(null);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            avatar: null,
        });

    // Check if user is using social auth (has provider_id but no custom password)
    const isSocialAuth = user.provider === 'github' || user.provider === 'google';
    const canChangeAvatar = !isSocialAuth || !user.avatar;

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

    const handleAvatarChange = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target.result);
                setData('avatar', file);
                
                // Animate avatar preview
                gsap.fromTo(avatarRef.current,
                    { scale: 0.8, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
                );
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        handleAvatarChange(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        handleAvatarChange(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const removeAvatarPreview = () => {
        setAvatarPreview(null);
        setData('avatar', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    const getAvatarSrc = () => {
        if (avatarPreview) return avatarPreview;
        if (user.avatar) return user.avatar;
        return null;
    };

    const getProviderIcon = () => {
        switch (user.provider) {
            case 'github':
                return <Github className="w-4 h-4" />;
            case 'google':
                return <Chrome className="w-4 h-4" />;
            default:
                return <User className="w-4 h-4" />;
        }
    };

    return (
        <section className={className} ref={formRef}>
            <header className="mb-8">
                <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                    Profile Information
                </h2>
                <p className="text-[var(--color-text-muted)]">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                    <div className="flex-shrink-0">
                        <div className="relative group">
                            <div 
                                ref={avatarRef}
                                className="w-32 h-32 rounded-full border-4 border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-muted)] flex items-center justify-center transition-all duration-300 group-hover:border-[var(--color-primary)]"
                                style={{
                                    borderColor: 'var(--color-border)',
                                    background: getAvatarSrc() ? 'transparent' : 'var(--color-bg-muted)'
                                }}
                            >
                                {getAvatarSrc() ? (
                                    <img
                                        src={getAvatarSrc()}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-12 h-12 text-[var(--color-text-muted)]" />
                                )}
                                
                                {canChangeAvatar && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Provider Badge */}
                            {user.provider && (
                                <div 
                                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 border-white dark:border-[var(--color-surface)] flex items-center justify-center text-white"
                                    style={{
                                        backgroundColor: user.provider === 'github' ? '#333' : user.provider === 'google' ? '#4285f4' : 'var(--color-primary)',
                                        borderColor: 'var(--color-surface)'
                                    }}
                                >
                                    {getProviderIcon()}
                                </div>
                            )}

                            {/* Remove Preview Button */}
                            {avatarPreview && (
                                <button
                                    type="button"
                                    onClick={removeAvatarPreview}
                                    className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Avatar Upload Area */}
                    {canChangeAvatar && (
                        <div className="flex-1">
                            <div
                                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer ${
                                    isDragOver 
                                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]' 
                                        : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                                }`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
                                    Upload Profile Picture
                                </h3>
                                <p className="text-[var(--color-text-muted)] mb-4">
                                    Drag and drop your image here, or click to browse
                                </p>
                                <p className="text-sm text-[var(--color-text-muted)]">
                                    Supports: JPG, PNG, GIF (Max 5MB)
                                </p>
                                
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    )}

                    {!canChangeAvatar && (
                        <div className="flex-1">
                            <div className="bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    {getProviderIcon()}
                                    <h3 className="font-medium text-[var(--color-text)]">
                                        {user.provider === 'github' ? 'GitHub' : 'Google'} Profile
                                    </h3>
                                </div>
                                <p className="text-[var(--color-text-muted)] text-sm">
                                    Your avatar is managed by {user.provider === 'github' ? 'GitHub' : 'Google'}. 
                                    To change it, update your profile on their platform.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="name" value="Full Name" />
                        <TextInput
                            id="name"
                            className="mt-2 block w-full rounded-lg border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email Address" />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-2 block w-full rounded-lg border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError className="mt-2" message={errors.email} />
                    </div>
                </div>

                {/* Email Verification */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">!</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                                    Email Verification Required
                                </h4>
                                <p className="text-amber-700 dark:text-amber-300 text-sm mb-3">
                                    Your email address is unverified. Please verify your email to access all features.
                                </p>
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                >
                                    Send Verification Email
                                </Link>
                            </div>
                        </div>

                        {status === 'verification-link-sent' && (
                            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                                    ✓ A new verification link has been sent to your email address.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-6 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-4">
                        <PrimaryButton 
                            disabled={processing}
                            className="px-8 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
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
                                    Profile updated successfully!
                                </p>
                            </div>
                        </Transition>
                    </div>
                </div>
            </form>
        </section>
    );
}