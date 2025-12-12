import React, { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import GuestLayout from '@/Layouts/GuestLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { 
  User, 
  Briefcase, 
  Building2, 
  Rocket, 
  Landmark, 
  GraduationCap,
  Palette,
  Code,
  BarChart3,
  Megaphone,
  Sparkles,
  Globe,
  FileText,
  Zap,
  Smartphone,
  ShoppingCart,
  Box,
  Sprout,
  TreeDeciduous,
  Trees,
  ChevronDown
} from 'lucide-react';

export default function Survey({ auth }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    useCase: '',
    role: '',
    projectType: '',
    designExperience: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const getStartedButtonRef = useRef(null);
  const buttonTextRef = useRef(null);
  const buttonBgRef = useRef(null);

  // GSAP hover animation for Get Started button
  useEffect(() => {
    if (currentStep === 3 && getStartedButtonRef.current && !isSubmitting) {
      const button = getStartedButtonRef.current;
      const buttonText = buttonTextRef.current;
      const buttonBg = buttonBgRef.current;

      const handleMouseEnter = (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Animate background gradient position
        gsap.to(buttonBg, {
          duration: 0.6,
          background: `radial-gradient(circle at ${x}px ${y}px, rgba(var(--color-primary-rgb, 99, 102, 241), 0.3), transparent 70%)`,
          ease: 'power2.out'
        });

        // Animate text with slight scale and color shift
        gsap.to(buttonText, {
          duration: 0.4,
          scale: 1.05,
          y: -2,
          ease: 'power2.out'
        });

        // Add a subtle rotation and scale to the button
        gsap.to(button, {
          duration: 0.5,
          scale: 1.05,
          rotateX: 5,
          rotateY: 5,
          ease: 'power2.out'
        });
      };

      const handleMouseMove = (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create dynamic gradient that follows the cursor
        gsap.to(buttonBg, {
          duration: 0.3,
          background: `radial-gradient(circle at ${x}px ${y}px, rgba(var(--color-primary-rgb, 99, 102, 241), 0.35), transparent 70%)`,
          ease: 'none'
        });

        // Subtle parallax effect on text
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;

        gsap.to(buttonText, {
          duration: 0.3,
          x: deltaX * 8,
          y: deltaY * 4,
          ease: 'power2.out'
        });
      };

      const handleMouseLeave = () => {
        // Reset all animations
        gsap.to(buttonBg, {
          duration: 0.5,
          background: 'transparent',
          ease: 'power2.out'
        });

        gsap.to(buttonText, {
          duration: 0.4,
          scale: 1,
          x: 0,
          y: 0,
          ease: 'power2.out'
        });

        gsap.to(button, {
          duration: 0.5,
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          ease: 'power2.out'
        });
      };

      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mousemove', handleMouseMove);
      button.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mousemove', handleMouseMove);
        button.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [currentStep, isSubmitting]);

  // Options for the survey
  const useCaseOptions = [
    { value: 'personal', label: 'Personal Projects', icon: User },
    { value: 'freelance', label: 'Freelance Work', icon: Briefcase },
    { value: 'agency', label: 'Agency/Team', icon: Building2 },
    { value: 'startup', label: 'Startup', icon: Rocket },
    { value: 'enterprise', label: 'Enterprise', icon: Landmark },
    { value: 'learning', label: 'Learning/Education', icon: GraduationCap }
  ];

  const roleOptions = [
    { value: 'designer', label: 'Designer', icon: Palette },
    { value: 'developer', label: 'Developer', icon: Code },
    { value: 'product-manager', label: 'Product Manager', icon: BarChart3 },
    { value: 'founder', label: 'Founder/Entrepreneur', icon: Rocket },
    { value: 'marketer', label: 'Marketer', icon: Megaphone },
    { value: 'student', label: 'Student', icon: GraduationCap },
    { value: 'other', label: 'Other', icon: Sparkles }
  ];

  const projectTypeOptions = [
    { value: 'website', label: 'Website', icon: Globe },
    { value: 'landing-page', label: 'Landing Page', icon: FileText },
    { value: 'web-app', label: 'Web Application', icon: Zap },
    { value: 'mobile-app', label: 'Mobile App UI', icon: Smartphone },
    { value: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { value: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { value: 'ecommerce', label: 'E-commerce', icon: ShoppingCart },
    { value: 'prototype', label: 'Prototype', icon: Box }
  ];

  const experienceOptions = [
    { value: 'beginner', label: 'Beginner (Just starting out)', icon: Sprout },
    { value: 'intermediate', label: 'Intermediate (1-3 years)', icon: TreeDeciduous },
    { value: 'advanced', label: 'Advanced (3-5 years)', icon: Trees },
    { value: 'expert', label: 'Expert (5+ years)', icon: Trees }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    } else if (step === 2) {
      if (!formData.useCase) newErrors.useCase = 'Please select what you will use Decode for';
      if (!formData.role) newErrors.role = 'Please select your role';
    } else if (step === 3) {
      if (!formData.projectType) newErrors.projectType = 'Please select what you are going to build';
      if (!formData.designExperience) newErrors.designExperience = 'Please select your experience level';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Submit survey data
      await router.post('/survey/submit', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        survey_data: {
          useCase: formData.useCase,
          role: formData.role,
          projectType: formData.projectType,
          designExperience: formData.designExperience
        }
      }, {
        onSuccess: () => {
          // Will redirect to forge page after auto-creating project/frame
        },
        onError: (errors) => {
          setErrors(errors);
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error('Survey submission error:', error);
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[var(--color-text)]">
                Welcome to Decode
              </h2>
              <p className="text-[var(--color-text-muted)] mt-2">
                Let's get to know you better
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                First Name
              </label>
              <TextInput
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter your first name"
                className="w-full"
                autoFocus
              />
              <InputError message={errors.firstName} className="mt-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Last Name
              </label>
              <TextInput
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter your last name"
                className="w-full"
              />
              <InputError message={errors.lastName} className="mt-2" />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[var(--color-text)]">
                Tell us about yourself
              </h2>
              <p className="text-[var(--color-text-muted)] mt-2">
                This helps us personalize your experience
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                What will you use Decode for?
              </label>
              <div className="relative">
                <select
                  value={formData.useCase}
                  onChange={(e) => handleInputChange('useCase', e.target.value)}
                  className="w-full px-4 py-3 pr-10 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] appearance-none cursor-pointer transition-all hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                >
                  <option value="">Select an option...</option>
                  {useCaseOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] pointer-events-none" />
              </div>
              <InputError message={errors.useCase} className="mt-2" />
            </div>

            <AnimatePresence>
              {formData.useCase && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
                    What's your role?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {roleOptions.map((option) => {
                      const IconComponent = option.icon;
                      const isSelected = formData.role === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => handleInputChange('role', option.value)}
                          className={`
                            relative p-4 rounded-lg border-2 transition-all text-left
                            ${isSelected 
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                              : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-primary)]/50'
                            }
                          `}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex flex-col items-start gap-2">
                            <IconComponent 
                              className={`w-6 h-6 ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} 
                            />
                            <span className={`text-sm font-medium ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
                              {option.label}
                            </span>
                          </div>
                          {isSelected && (
                            <motion.div
                              layoutId="roleSelection"
                              className="absolute inset-0 border-2 border-[var(--color-primary)] rounded-lg pointer-events-none"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                  <InputError message={errors.role} className="mt-2" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[var(--color-text)]">
                Almost there
              </h2>
              <p className="text-[var(--color-text-muted)] mt-2">
                Let's set up your first project
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                What are you going to build?
              </label>
              <div className="relative">
                <select
                  value={formData.projectType}
                  onChange={(e) => handleInputChange('projectType', e.target.value)}
                  className="w-full px-4 py-3 pr-10 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] appearance-none cursor-pointer transition-all hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                >
                  <option value="">Select project type...</option>
                  {projectTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] pointer-events-none" />
              </div>
              <InputError message={errors.projectType} className="mt-2" />
            </div>

            <AnimatePresence>
              {formData.projectType && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    How much experience do you have with design tools?
                  </label>
                  <div className="relative">
                    <select
                      value={formData.designExperience}
                      onChange={(e) => handleInputChange('designExperience', e.target.value)}
                      className="w-full px-4 py-3 pr-10 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] appearance-none cursor-pointer transition-all hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    >
                      <option value="">Select experience level...</option>
                      {experienceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] pointer-events-none" />
                  </div>
                  <InputError message={errors.designExperience} className="mt-2" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <GuestLayout>
      <Head title="Welcome Survey" />
      
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
        <div className="w-full max-w-2xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 bg-[var(--color-bg-muted)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[var(--color-primary)]"
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Survey Content */}
          <div className="bg-[var(--color-surface)] rounded-xl shadow-lg p-8">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-[var(--color-border)]">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  disabled={isSubmitting}
                >
                  ← Back
                </button>
              )}
              
              {currentStep === 3 && !isSubmitting ? (
                <button
                  ref={getStartedButtonRef}
                  onClick={handleContinue}
                  disabled={isSubmitting}
                  className="ml-auto relative px-8 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl"
                  style={{ 
                    perspective: '1000px',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div 
                    ref={buttonBgRef}
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'transparent' }}
                  />
                  <span ref={buttonTextRef} className="relative z-10 inline-block">
                    Get Started
                  </span>
                </button>
              ) : (
                <PrimaryButton
                  onClick={handleContinue}
                  disabled={isSubmitting}
                  className="ml-auto"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Setting up...
                    </span>
                  ) : (
                    'Continue'
                  )}
                </PrimaryButton>
              )}
            </div>
          </div>

          {/* Skip Option */}
          <div className="text-center mt-4">
            <button
              onClick={() => router.visit('/projects')}
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
