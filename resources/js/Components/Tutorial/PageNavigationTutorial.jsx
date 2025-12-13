import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { 
  MousePointer2, 
  ChevronRight, 
  Sparkles, 
  Code2, 
  Layout, 
  Palette, 
  Zap, 
  Monitor, 
  Smartphone,
  Settings,
  ArrowRight,
  Eye,
  FileCode
} from 'lucide-react';
import useTutorialStore from '@/stores/useTutorialStore';
import TutorialCompleteToast from './TutorialCompleteToast';

/**
 * Page Navigation Tutorial - Comprehensive onboarding guide for new users
 * Implements Genshin Impact-style tutorial with smooth animations and guided interactions
 */
const PageNavigationTutorial = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [clickToNext, setClickToNext] = useState(false);
  const [highlightTarget, setHighlightTarget] = useState(null);
  const overlayRef = useRef(null);
  
  const {
    isPageTutorialActive,
    startPageTutorial,
    completePageTutorial,
    currentPage
  } = useTutorialStore();

  // Tutorial steps configuration
  const tutorialSteps = [
    // Step 0: Forge Introduction
    {
      id: 'forge-intro',
      page: 'forge',
      title: 'Welcome to Forge',
      subtitle: 'Your Visual Builder Awaits',
      content: [
        'Forge is the visual builder of Decode where you create stunning interfaces with ease.',
        'Build with Real DOM components, live preview, and seamless code generation.',
        'No more wrestling with complex code - just drag, drop, and design!'
      ],
      icon: Layout,
      action: 'click-anywhere',
      gradient: 'from-blue-600 to-purple-600'
    },
    // Step 1: Navigate to Project List
    {
      id: 'navigate-home',
      page: 'forge',
      title: 'Navigate to Projects',
      subtitle: 'Let\'s learn navigation',
      content: [
        'Click on the Decode logo in the header to navigate to your project dashboard.',
        'This is how you\'ll switch between projects and access your workspace.'
      ],
      icon: MousePointer2,
      action: 'highlight-element',
      target: '[data-tutorial="home-logo"]',
      gradient: 'from-emerald-600 to-teal-600'
    },
    // Step 2: Workspace Dropdown
    {
      id: 'workspace-dropdown',
      page: 'projects',
      title: 'Workspace Management',
      subtitle: 'Organize your projects',
      content: [
        'Click on the workspace dropdown to manage your workspaces.',
        'Workspaces help you organize projects by team, client, or purpose.'
      ],
      icon: Settings,
      action: 'highlight-element',
      target: '[data-tutorial="workspace-dropdown"]',
      gradient: 'from-orange-600 to-red-600'
    },
    // Step 3: Create Workspace
    {
      id: 'create-workspace',
      page: 'projects',
      title: 'Create New Workspace',
      subtitle: 'Set up your team space',
      content: [
        'Click "Create Workspace" to set up a new collaborative space.',
        'This will be where your team can work together on projects.'
      ],
      icon: Sparkles,
      action: 'highlight-element',
      target: '[data-tutorial="create-workspace"]',
      gradient: 'from-pink-600 to-purple-600'
    },
    // Step 4: Select Team Workspace
    {
      id: 'select-team',
      page: 'projects',
      title: 'Choose Team Workspace',
      subtitle: 'Collaboration made easy',
      content: [
        'Select "Team Workspace" for collaborative projects.',
        'Team workspaces include advanced collaboration features and member management.'
      ],
      icon: Code2,
      action: 'form-guidance',
      gradient: 'from-indigo-600 to-blue-600'
    },
    // Step 5: Create Workspace Button
    {
      id: 'confirm-workspace',
      page: 'projects',
      title: 'Create Your Workspace',
      subtitle: 'Almost there!',
      content: [
        'Click "Create Workspace" to finalize your new collaborative space.',
        'Your team will be able to join and start building together.'
      ],
      icon: ArrowRight,
      action: 'highlight-element',
      target: '[data-tutorial="create-workspace-button"]',
      gradient: 'from-green-600 to-emerald-600'
    },
    // Step 6: Select New Workspace
    {
      id: 'select-new-workspace',
      page: 'projects',
      title: 'Enter Your New Workspace',
      subtitle: 'Switch to your team space',
      content: [
        'Now click the workspace dropdown again and select your newly created workspace.',
        'This will switch you to your new team workspace environment.'
      ],
      icon: Monitor,
      action: 'multi-step',
      targets: ['[data-tutorial="workspace-dropdown"]', '[data-tutorial="new-workspace"]'],
      gradient: 'from-cyan-600 to-blue-600'
    },
    // Step 7: New Project
    {
      id: 'new-project',
      page: 'projects',
      title: 'Create Your First Project',
      subtitle: 'Start building something amazing',
      content: [
        'Click "New Project" to start your first project in this workspace.',
        'Projects contain all your frames, components, and generated code.'
      ],
      icon: Zap,
      action: 'highlight-element',
      target: '[data-tutorial="new-project"]',
      gradient: 'from-yellow-600 to-orange-600'
    },
    // Step 8: Project Configuration
    {
      id: 'project-config',
      page: 'projects',
      title: 'Configure Your Project',
      subtitle: 'Set up your tech stack',
      content: [
        'Select React and Tailwind CSS for your project.',
        'These are the most popular tools for modern web development.',
        'Don\'t fill out optional fields for now - we\'ll keep it simple!'
      ],
      icon: Palette,
      action: 'form-guidance',
      gradient: 'from-violet-600 to-purple-600'
    },
    // Step 9: Void Page Introduction
    {
      id: 'void-intro',
      page: 'void',
      title: 'Welcome to Void',
      subtitle: 'Your Frame Dashboard',
      content: [
        'Void is your project\'s central control center.',
        'Here you manage frames, preview your work, and organize your project structure.',
        'Think of it as your project\'s mission control!'
      ],
      icon: Monitor,
      action: 'click-anywhere',
      gradient: 'from-slate-600 to-gray-700'
    },
    // Step 10: Add Frame
    {
      id: 'add-frame',
      page: 'void',
      title: 'Create Your First Frame',
      subtitle: 'Add a new page to your project',
      content: [
        'Click the "+" icon in the floating toolbox to create a new frame.',
        'Frames are like pages in your application - each one represents a different view.'
      ],
      icon: Sparkles,
      action: 'highlight-element',
      target: '[data-tutorial="add-frame"]',
      gradient: 'from-emerald-600 to-green-600'
    },
    // Step 11: Frame Configuration
    {
      id: 'frame-config',
      page: 'void',
      title: 'Configure Your Frame',
      subtitle: 'Set up your page',
      content: [
        'Select "Page" as your frame type and choose "Mobile" for responsive design.',
        'Skip the optional fields - we\'ll keep this tutorial focused on the essentials.',
        'Click "Create Frame" when ready!'
      ],
      icon: Smartphone,
      action: 'form-guidance',
      gradient: 'from-blue-600 to-indigo-600'
    },
    // Step 12: Open Frame
    {
      id: 'open-frame',
      page: 'void',
      title: 'Open Your Frame',
      subtitle: 'Let\'s start designing!',
      content: [
        'Click on your newly created frame preview to open it in Forge.',
        'This will take you to the visual builder where you can design your page.'
      ],
      icon: Eye,
      action: 'highlight-element',
      target: '[data-tutorial="new-frame"]',
      gradient: 'from-purple-600 to-pink-600'
    },
    // Step 13: Mode Switch to Source
    {
      id: 'mode-switch',
      page: 'forge',
      title: 'Explore Source Mode',
      subtitle: 'See your generated code',
      content: [
        'Click on the mode dropdown in the header and select "Source".',
        'This will show you the actual code generated from your visual designs.'
      ],
      icon: Code2,
      action: 'highlight-element',
      target: '[data-tutorial="mode-dropdown"]',
      gradient: 'from-teal-600 to-cyan-600'
    },
    // Step 14: Source Page Explanation
    {
      id: 'source-explanation',
      page: 'source',
      title: 'Source Code Magic',
      subtitle: 'Your designs become code',
      content: [
        'Here you can see the React components and code generated from your visual designs.',
        'Edit the code directly or switch back to visual mode - they stay in sync!',
        'This is the power of Decode: visual design meets clean code.'
      ],
      icon: FileCode,
      action: 'click-anywhere',
      gradient: 'from-gray-600 to-slate-600'
    },
    // Step 15: Return to Void
    {
      id: 'return-void',
      page: 'source',
      title: 'Back to Project Dashboard',
      subtitle: 'Navigate back to Void',
      content: [
        'Click the back button in the header to return to your Void dashboard.',
        'From there you can manage all your project frames and continue building.'
      ],
      icon: ArrowRight,
      action: 'highlight-element',
      target: '[data-tutorial="back-button"]',
      gradient: 'from-indigo-600 to-purple-600'
    }
  ];

  useEffect(() => {
    if (isPageTutorialActive && currentPage === 'forge' && currentStep === 0) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    }
  }, [isPageTutorialActive, currentPage]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const currentStepData = tutorialSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setClickToNext(false);
      
      // Handle page transitions
      const nextStep = tutorialSteps[currentStep + 1];
      if (nextStep.action === 'highlight-element' && nextStep.target) {
        setTimeout(() => setHighlightTarget(nextStep.target), 100);
      }
    } else {
      // Tutorial complete
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    document.body.style.overflow = '';
    completePageTutorial();
    setShowToast(true);
    setCurrentStep(0);
  };

  const handleOverlayClick = () => {
    if (clickToNext || currentStepData?.action === 'click-anywhere') {
      handleNext();
    }
  };

  const handleElementHighlight = (target) => {
    const element = document.querySelector(target);
    if (element) {
      // Scroll element into view
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });

      // Add highlighting
      element.style.position = 'relative';
      element.style.zIndex = '100001';
      element.style.pointerEvents = 'auto';
      
      // Create spotlight effect
      const spotlight = document.createElement('div');
      spotlight.className = 'tutorial-spotlight';
      spotlight.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at var(--x) var(--y), transparent 80px, rgba(0,0,0,0.7) 120px);
        pointer-events: none;
        z-index: 100000;
        transition: all 0.3s ease;
      `;
      
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      spotlight.style.setProperty('--x', x + 'px');
      spotlight.style.setProperty('--y', y + 'px');
      
      document.body.appendChild(spotlight);
      
      // Animate element
      gsap.fromTo(element, 
        { scale: 1, boxShadow: 'none' },
        { 
          scale: 1.05, 
          boxShadow: '0 0 30px rgba(var(--color-primary-rgb), 0.6)',
          duration: 0.5,
          ease: 'power2.out',
          yoyo: true,
          repeat: -1
        }
      );
    }
  };

  const cleanupHighlights = () => {
    // Remove all tutorial elements
    document.querySelectorAll('.tutorial-spotlight').forEach(el => el.remove());
    
    // Reset highlighted elements
    document.querySelectorAll('[style*="z-index: 100001"]').forEach(el => {
      el.style.position = '';
      el.style.zIndex = '';
      el.style.pointerEvents = '';
    });
    
    // Stop GSAP animations
    gsap.killTweensOf('*');
  };

  useEffect(() => {
    if (highlightTarget && currentStepData?.action === 'highlight-element') {
      cleanupHighlights();
      setTimeout(() => handleElementHighlight(highlightTarget), 100);
    }

    return cleanupHighlights;
  }, [highlightTarget, currentStepData]);

  if (!isVisible || !currentStepData) return null;

  const IconComponent = currentStepData.icon;

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100002] flex items-center justify-center"
            style={{
              background: currentStepData.action === 'highlight-element' 
                ? 'rgba(0, 0, 0, 0.3)' 
                : 'rgba(0, 0, 0, 0.8)'
            }}
            onClick={handleOverlayClick}
          >
            {/* Tutorial Card */}
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ 
                type: "spring", 
                damping: 20, 
                stiffness: 300,
                delay: 0.1 
              }}
              className="relative max-w-md mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${currentStepData.gradient.split(' ')[1]} 0%, ${currentStepData.gradient.split(' ')[3]} 100%)`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Icon */}
              <div className="relative p-8 pb-6 text-white">
                <div className="flex items-center space-x-4 mb-4">
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"
                  >
                    <IconComponent className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <motion.h2
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-2xl font-bold"
                    >
                      {currentStepData.title}
                    </motion.h2>
                    <motion.p
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-white/80 text-sm"
                    >
                      {currentStepData.subtitle}
                    </motion.p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/20 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-white rounded-full h-2"
                  />
                </div>
                <p className="text-xs text-white/60 mt-2">
                  Step {currentStep + 1} of {tutorialSteps.length}
                </p>

                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        opacity: 0,
                        x: Math.random() * 400,
                        y: Math.random() * 200 
                      }}
                      animate={{
                        opacity: [0, 0.6, 0],
                        y: [
                          Math.random() * 200,
                          Math.random() * 200 - 50,
                          Math.random() * 200 - 100
                        ],
                        x: [
                          Math.random() * 400,
                          Math.random() * 400 + 20,
                          Math.random() * 400 - 20
                        ]
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2
                      }}
                      className="absolute w-1 h-1 bg-white rounded-full"
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="bg-white p-8 pt-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-3"
                >
                  {currentStepData.content.map((text, index) => (
                    <motion.p
                      key={index}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="text-gray-700 text-sm leading-relaxed"
                    >
                      {text}
                    </motion.p>
                  ))}
                </motion.div>

                {/* Action Hint */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mt-6 p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <MousePointer2 className="w-5 h-5 text-gray-600" />
                    </motion.div>
                    <p className="text-xs text-gray-600 font-medium">
                      {currentStepData.action === 'click-anywhere' 
                        ? 'Click anywhere to continue'
                        : currentStepData.action === 'highlight-element'
                        ? 'Click the highlighted element to continue'
                        : 'Follow the instructions above'
                      }
                    </p>
                  </div>
                </motion.div>

                {/* Next Button for non-action steps */}
                {currentStepData.action === 'form-guidance' && (
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.3 }}
                    onClick={handleNext}
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Complete Toast */}
      <TutorialCompleteToast 
        show={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </>
  );
};

export default PageNavigationTutorial;