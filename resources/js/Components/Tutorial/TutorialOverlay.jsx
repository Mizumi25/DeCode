import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, 
    MousePointer, 
    Zap, 
    Layers, 
    Code, 
    Palette,
    ArrowRight,
    ChevronDown,
    Plus,
    Eye,
    ArrowLeft
} from 'lucide-react';

const TutorialOverlay = ({ 
    isActive, 
    step, 
    onNext, 
    onComplete,
    highlightElement,
    allowedClicks = []
}) => {
    const [clickAnywhere, setClickAnywhere] = useState(false);

    const tutorialSteps = {
        'forge-intro': {
            title: 'Welcome to Forge! ⚡',
            description: 'Forge is the visual builder of Decode where you create stunning UIs with Real DOM rendering. Build faster, ship smarter!',
            icon: <Sparkles className="w-8 h-8" />,
            action: 'Click anywhere on screen to continue',
            position: 'center'
        },
        'navigate-home': {
            title: 'Navigation Guide 🧭',
            description: 'Click on the Decode logo to navigate between pages. This will take you to the Project List.',
            icon: <MousePointer className="w-8 h-8" />,
            action: 'Click the Decode logo in header',
            position: 'top-left',
            highlight: '.decode-logo'
        },
        'workspace-dropdown': {
            title: 'Workspace Management 🏢',
            description: 'Workspaces help you organize projects by teams. Let\'s create your first team workspace!',
            icon: <Layers className="w-8 h-8" />,
            action: 'Click the workspace dropdown',
            position: 'top-center',
            highlight: '.workspace-dropdown'
        },
        'create-workspace': {
            title: 'Create Team Workspace ✨',
            description: 'Team workspaces enable collaboration with your colleagues.',
            icon: <Plus className="w-8 h-8" />,
            action: 'Click "Create Workspace"',
            position: 'top-center',
            highlight: '.create-workspace-btn'
        },
        'select-team-type': {
            title: 'Choose Team Workspace 👥',
            description: 'Select "Team Workspace" for collaborative projects.',
            icon: <Layers className="w-8 h-8" />,
            action: 'Select "Team Workspace"',
            position: 'center',
            highlight: '.team-workspace-option'
        },
        'switch-workspace': {
            title: 'Switch to New Workspace 🔄',
            description: 'Now select your newly created workspace to start building.',
            icon: <ChevronDown className="w-8 h-8" />,
            action: 'Click workspace dropdown and select your workspace',
            position: 'top-center',
            highlight: '.workspace-dropdown'
        },
        'create-project': {
            title: 'Create Your First Project 🚀',
            description: 'Projects contain your app\'s frames and components. Let\'s create your first one!',
            icon: <Plus className="w-8 h-8" />,
            action: 'Click "New Project"',
            position: 'top-right',
            highlight: '.new-project-btn'
        },
        'project-setup': {
            title: 'Project Configuration ⚙️',
            description: 'Choose React and Tailwind for modern, fast development.',
            icon: <Code className="w-8 h-8" />,
            action: 'Fill form: Select React + Tailwind, then Create',
            position: 'center',
            highlight: '.project-form'
        },
        'void-intro': {
            title: 'Welcome to Void Page! 🌌',
            description: 'Void is your frame dashboard - the central point for managing all your app screens and components.',
            icon: <Eye className="w-8 h-8" />,
            action: 'Click anywhere to continue',
            position: 'center'
        },
        'create-frame': {
            title: 'Create Your First Frame 📱',
            description: 'Frames are your app screens. Let\'s create a mobile frame to start designing!',
            icon: <Plus className="w-8 h-8" />,
            action: 'Click the floating + button',
            position: 'bottom-right',
            highlight: '.floating-add-btn'
        },
        'frame-setup': {
            title: 'Frame Configuration 📐',
            description: 'Choose "Page" type and "Mobile" responsive size for your first screen.',
            icon: <Palette className="w-8 h-8" />,
            action: 'Select Page + Mobile, then Create Frame',
            position: 'center',
            highlight: '.frame-form'
        },
        'open-frame': {
            title: 'Enter Design Mode 🎨',
            description: 'Click on your newly created frame to enter Forge and start designing!',
            icon: <ArrowRight className="w-8 h-8" />,
            action: 'Click the frame preview',
            position: 'center',
            highlight: '.frame-preview'
        },
        'forge-explained': {
            title: 'You\'re in Forge! ⚡',
            description: 'This is where the magic happens! Drag components, customize styles, and build amazing UIs.',
            icon: <Zap className="w-8 h-8" />,
            action: 'Click anywhere to continue',
            position: 'center'
        },
        'explore-source': {
            title: 'Explore Source Mode 💻',
            description: 'Switch to Source mode to see the generated code. Real-time code generation!',
            icon: <Code className="w-8 h-8" />,
            action: 'Click "Source" in header mode dropdown',
            position: 'top-center',
            highlight: '.mode-dropdown'
        },
        'source-intro': {
            title: 'Source Mode 📄',
            description: 'Here you can see your generated React + Tailwind code, export projects, and fine-tune your build.',
            icon: <Code className="w-8 h-8" />,
            action: 'Click anywhere to continue',
            position: 'center'
        },
        'back-to-void': {
            title: 'Return to Dashboard 🏠',
            description: 'Use the back button to return to Void page and manage your frames.',
            icon: <ArrowLeft className="w-8 h-8" />,
            action: 'Click the back button',
            position: 'top-left',
            highlight: '.back-button'
        }
    };

    const currentStep = tutorialSteps[step];

    console.log('🎯 TUTORIAL: TutorialOverlay render', { isActive, step, currentStep: currentStep?.title });

    if (!isActive || !currentStep) {
        console.log('🎯 TUTORIAL: TutorialOverlay not rendering', { isActive, hasCurrentStep: !!currentStep });
        return null;
    }

    const handleOverlayClick = (e) => {
        // Don't prevent default for "click anywhere" steps
        if (clickAnywhere && currentStep.action.includes('Click anywhere')) {
            e.preventDefault();
            e.stopPropagation();
            onNext();
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();
    };

    const handleAllowedClick = (e) => {
        // For "click anywhere" steps, don't block any clicks - let the overlay handle it
        if (clickAnywhere) {
            return; // Don't block anything
        }
        
        // For specific element clicks, only allow the designated elements
        if (allowedClicks.includes(e.target.closest('[data-tutorial-clickable]')?.dataset?.tutorialClickable)) {
            // Allow the click through
            return;
        }
        e.preventDefault();
        e.stopPropagation();
    };

    useEffect(() => {
        const isClickAnywhere = currentStep.action.includes('Click anywhere');
        setClickAnywhere(isClickAnywhere);
        
        console.log('Tutorial step:', step, 'Click anywhere:', isClickAnywhere, 'Action:', currentStep.action);
        
        // Add highlight to specified elements
        if (currentStep.highlight) {
            const element = document.querySelector(currentStep.highlight);
            if (element) {
                element.style.position = 'relative';
                element.style.zIndex = '10001';
                element.style.pointerEvents = allowedClicks.length > 0 ? 'auto' : 'none';
            }
        }

        return () => {
            // Cleanup highlights
            if (currentStep.highlight) {
                const element = document.querySelector(currentStep.highlight);
                if (element) {
                    element.style.position = '';
                    element.style.zIndex = '';
                    element.style.pointerEvents = '';
                }
            }
        };
    }, [step, currentStep, allowedClicks]);

    const getModalPosition = () => {
        switch (currentStep.position) {
            case 'top-left':
                return 'top-8 left-8';
            case 'top-center':
                return 'top-8 left-1/2 transform -translate-x-1/2';
            case 'top-right':
                return 'top-8 right-8';
            case 'bottom-left':
                return 'bottom-8 left-8';
            case 'bottom-right':
                return 'bottom-8 right-8';
            case 'center':
            default:
                return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`fixed inset-0 bg-black/30 z-[9999] ${clickAnywhere ? 'cursor-pointer' : 'cursor-default'}`}
                style={{ zIndex: 9999 }}
                onClick={handleOverlayClick}
                onClickCapture={handleAllowedClick}
            >
                {/* Highlight Box */}
                {currentStep.highlight && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute border-4 border-blue-400 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                        style={{
                            // Position will be calculated based on highlighted element
                            pointerEvents: 'none',
                            zIndex: 10001
                        }}
                    />
                )}

                {/* Tutorial Modal */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 20 }}
                    className={`absolute ${getModalPosition()} max-w-md w-full mx-4`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                        {/* Icon */}
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
                            {currentStep.icon}
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
                            {currentStep.title}
                        </h2>

                        {/* Description */}
                        <p className="text-gray-600 text-center mb-8 leading-relaxed">
                            {currentStep.description}
                        </p>

                        {/* Action */}
                        <div className={`flex items-center justify-center space-x-2 font-medium ${clickAnywhere ? 'text-green-600' : 'text-blue-600'}`}>
                            <MousePointer className={`w-5 h-5 ${clickAnywhere ? 'animate-pulse' : 'animate-bounce'}`} />
                            <span className={clickAnywhere ? 'text-lg font-semibold' : ''}>{currentStep.action}</span>
                        </div>
                        
                        {clickAnywhere && (
                            <div className="mt-4 text-center text-sm text-green-500 font-medium animate-pulse">
                                ✨ Click anywhere on this overlay to continue ✨
                            </div>
                        )}

                        {/* Progress Indicator */}
                        <div className="mt-6 text-center text-sm text-gray-400">
                            Tutorial Progress
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TutorialOverlay;