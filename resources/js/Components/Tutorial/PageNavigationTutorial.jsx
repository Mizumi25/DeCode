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
  const [isVisible, setIsVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [clickToNext, setClickToNext] = useState(false);
  const [highlightTarget, setHighlightTarget] = useState(null);
  const hasSetHighlightRef = useRef(false); // Prevent re-setting highlight for same step
  const hasOpenedDropdownRef = useRef(false); // Prevent opening dropdown multiple times
  const overlayRef = useRef(null);
  
  // Use sessionStorage to persist modal check flags across component remounts
  const hasCheckedWorkspaceModal = () => {
    return sessionStorage.getItem('tutorial-workspace-modal-checked') === 'true';
  };
  const setCheckedWorkspaceModal = () => {
    sessionStorage.setItem('tutorial-workspace-modal-checked', 'true');
  };
  const hasCheckedProjectModal = () => {
    return sessionStorage.getItem('tutorial-project-modal-checked') === 'true';
  };
  const setCheckedProjectModal = () => {
    sessionStorage.setItem('tutorial-project-modal-checked', 'true');
  };
  
  const {
    isPageTutorialActive,
    startPageTutorial,
    completePageTutorial,
    currentPage,
    pageNavigationStep,
    setPageNavigationStep,
    getPageNavigationStep
  } = useTutorialStore();
  
  // Use persisted step from store instead of local state
  const currentStep = pageNavigationStep;

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
    // Step 3: Click Create Workspace in Dropdown
    {
      id: 'create-workspace-click',
      page: 'projects',
      title: 'Create New Workspace',
      subtitle: 'Click the button in dropdown',
      content: [
        'Click "Create Workspace" in the dropdown menu.',
        'This will open a form where you can set up your workspace.',
        'Click the highlighted button to continue!'
      ],
      icon: Sparkles,
      action: 'highlight-element',
      target: '[data-tutorial="create-workspace"]',
      gradient: 'from-pink-600 to-purple-600'
    },
    // Step 4: Type Workspace Name
    {
      id: 'workspace-name-input',
      page: 'projects',
      title: 'Enter Workspace Name',
      subtitle: 'Type at least 5 characters',
      content: [
        'Type a name for your workspace.',
        'Make it descriptive - like your company or team name.',
        'Once you type 5 characters, we\'ll move to the next step!'
      ],
      icon: Code2,
      action: 'progressive-form',
      target: '[data-tutorial="workspace-name-input"]',
      validation: 'input-length:5',
      gradient: 'from-indigo-600 to-blue-600'
    },
    // Step 5: Select Team Workspace
    {
      id: 'workspace-type-select',
      page: 'projects',
      title: 'Select Team Workspace',
      subtitle: 'Click the team option',
      content: [
        'Click "Team Workspace" to enable collaboration.',
        'Team workspaces let you invite members and work together.',
        'It will auto-advance when you click!'
      ],
      icon: Settings,
      action: 'progressive-form',
      target: '[data-tutorial="team-workspace-option"]',
      validation: 'selection-made',
      gradient: 'from-green-600 to-emerald-600'
    },
    // Step 6: Click Create Workspace Button
    {
      id: 'workspace-create-button',
      page: 'projects',
      title: 'Create Your Workspace',
      subtitle: 'Click the button',
      content: [
        'Perfect! Now click "Create Workspace" to finish.',
        'Your workspace will be created and we\'ll continue the tutorial!'
      ],
      icon: Sparkles,
      action: 'highlight-element',
      target: '[data-tutorial="create-workspace-button"]',
      gradient: 'from-cyan-600 to-teal-600'
    },
    // Step 7: New Project
    {
      id: 'new-project',
      page: 'projects',
      title: 'Create Your First Project',
      subtitle: 'Start building something amazing',
      content: [
        'Perfect! Your workspace has been created and you\'re now inside it.',
        'Click "New Project" to start your first project in this workspace.',
        'Projects contain all your frames, components, and generated code.'
      ],
      icon: Zap,
      action: 'highlight-element',
      target: '[data-tutorial="new-project"]',
      gradient: 'from-yellow-600 to-orange-600'
    },
    // Step 8: Project Name Input
    {
      id: 'project-name',
      page: 'projects',
      title: 'Name Your Project',
      subtitle: 'Choose a descriptive name',
      content: [
        'Type a name for your project.',
        'Make it descriptive and memorable!',
        'You can always change it later.'
      ],
      icon: Palette,
      action: 'progressive-form',
      target: '[data-tutorial="project-name-input"]',
      validation: 'input-length:5',
      gradient: 'from-violet-600 to-purple-600'
    },
    // Step 9: Select React Framework
    {
      id: 'project-framework',
      page: 'projects',
      title: 'Choose React Framework',
      subtitle: 'Modern web development',
      content: [
        'Click on "React" to select it as your framework.',
        'React is perfect for building modern, interactive UIs.',
        'It\'s the most popular choice for web apps!'
      ],
      icon: Code2,
      action: 'progressive-form',
      target: '[data-tutorial="project-framework-react"]',
      validation: 'selection-made',
      gradient: 'from-blue-600 to-cyan-600'
    },
    // Step 10: Select Tailwind CSS
    {
      id: 'project-style',
      page: 'projects',
      title: 'Choose Tailwind CSS',
      subtitle: 'Utility-first styling',
      content: [
        'Click on "Tailwind CSS" for styling.',
        'Tailwind makes it easy to create beautiful designs.',
        'It works perfectly with React!'
      ],
      icon: Palette,
      action: 'progressive-form',
      target: '[data-tutorial="project-style-tailwind"]',
      validation: 'selection-made',
      gradient: 'from-cyan-600 to-teal-600'
    },
    // Step 11: Create Project Button
    {
      id: 'project-create-button',
      page: 'projects',
      title: 'Create Your Project',
      subtitle: 'Click the button',
      content: [
        'Perfect! Now click "Create Project" to finish.',
        'Your project will be created and we\'ll move to the Void page!',
        'This is where you\'ll design your frames.'
      ],
      icon: Sparkles,
      action: 'highlight-element',
      target: '[data-tutorial="create-project-button"]',
      gradient: 'from-teal-600 to-cyan-600'
    },
    // Step 12: Void Page Introduction
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
    // Step 13: Add Frame
    {
      id: 'add-frame',
      page: 'void',
      title: 'Create Your First Frame',
      subtitle: 'Click the + button',
      content: [
        'Look for the floating toolbox on the LEFT side of the screen.',
        'Click the "+" icon (top button) to create a new frame.',
        'Frames are like pages in your application - each one represents a different view.',
        'After creating, click "Next" in this tutorial box!'
      ],
      icon: Sparkles,
      action: 'info',
      gradient: 'from-emerald-600 to-green-600'
    },
    // Step 13: Frame Configuration
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
    // Step 14: Open Frame
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
    // Step 15: Mode Switch to Source
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
    // Step 16: Source Page Explanation
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
    // Step 17: Return to Void
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

  const currentStepData = tutorialSteps[currentStep];

  useEffect(() => {
    if (isPageTutorialActive) {
      console.log('🎯 TUTORIAL: Page effect', { currentPage, currentStep, stepPage: currentStepData?.page });
      
      // Auto-advance when navigating to projects page from forge
      if (currentPage === 'projects' && currentStep <= 1) {
        console.log('🎯 TUTORIAL: Advancing to workspace step');
        setPageNavigationStep(2); // Jump to workspace-dropdown step
        setIsVisible(true);
        document.body.style.overflow = 'hidden';
        return;
      }
      
      // Check if we're on "Click Create Workspace" step but dropdown is closed
      // Only run this ONCE per step 3 to prevent re-opening
      if (currentPage === 'projects' && currentStep === 3 && !hasOpenedDropdownRef.current) {
        const createButton = document.querySelector('[data-tutorial="create-workspace"]');
        
        if (!createButton) {
          console.log('🔄 TUTORIAL: Create Workspace button not visible. Auto-opening dropdown...');
          hasOpenedDropdownRef.current = true; // Mark that we've opened it
          
          setTimeout(() => {
            const dropdownButton = document.querySelector('[data-tutorial="workspace-dropdown"]');
            if (dropdownButton) {
              dropdownButton.click();
              console.log('✅ TUTORIAL: Auto-opened workspace dropdown');
            }
          }, 500);
          
          return;
        }
      }
      
      // Reset dropdown flag when leaving step 3
      if (currentStep !== 3 && hasOpenedDropdownRef.current) {
        hasOpenedDropdownRef.current = false;
      }
      
      // DISABLED: Modal check was causing loops
      // Only check modal on actual page refresh/reload, not during normal progression
      // The workspace modal will stay open during steps 4-6, no need to check
      // if (currentPage === 'projects' && (currentStep === 4 || currentStep === 5 || currentStep === 6)) {
      //   // Modal check disabled to prevent switching/looping
      // }
      
      // Check if we're on a project form step after refresh
      // Always reset to step 7 (New Project button) to ensure user goes through the full flow
      if (currentPage === 'projects' && (currentStep === 8 || currentStep === 9 || currentStep === 10) && !hasCheckedProjectModal()) {
        setCheckedProjectModal(); // Mark that we've checked
        
        console.log('🔄 TUTORIAL: Project form step detected after refresh');
        console.log('🔄 TUTORIAL: Resetting to step 7 to restart project creation flow');
        
        // Close any open project modal
        const closeButton = document.querySelector('[role="dialog"] button[aria-label="Close"], [role="dialog"] .close-button');
        if (closeButton) {
          closeButton.click();
          console.log('🔄 TUTORIAL: Closed project modal');
        }
        
        // Reset to "click New Project" step
        setPageNavigationStep(7);
        setIsVisible(false);
        return;
      }
      
      // Show tutorial if current step matches current page or if we're on step 0
      const shouldShow = currentStep === 0 || 
                        (currentStepData && currentStepData.page === currentPage);
      
      console.log('🎯 TUTORIAL: Visibility check', { 
        currentStep, 
        currentPage, 
        stepPage: currentStepData?.page,
        shouldShow 
      });
      
      if (shouldShow) {
        setIsVisible(true);
        document.body.style.overflow = 'hidden';
      } else {
        setIsVisible(false);
        document.body.style.overflow = '';
      }
    }
  }, [isPageTutorialActive, currentPage, currentStep, currentStepData]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleNext = () => {
    console.log('🚀 TUTORIAL: handleNext called', { 
      from: currentStep, 
      to: currentStep + 1,
      stepName: tutorialSteps[currentStep]?.id 
    });
    
    // Clean up current highlights before advancing
    cleanupHighlights();
    
    // Reset highlight flag for next step
    hasSetHighlightRef.current = false;
    
    if (currentStep < tutorialSteps.length - 1) {
      setPageNavigationStep(currentStep + 1);
      setClickToNext(false);
      
      // Handle page transitions
      const nextStep = tutorialSteps[currentStep + 1];
      if (nextStep.action === 'highlight-element' && nextStep.target) {
        setTimeout(() => setHighlightTarget(nextStep.target), 300); // Longer delay for cleanup
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
    setPageNavigationStep(0);
  };

  const handleOverlayClick = () => {
    if (clickToNext || currentStepData?.action === 'click-anywhere') {
      handleNext();
    }
  };

  const handleElementHighlight = (target, validation = null) => {
    const element = document.querySelector(target);
    if (element) {
      // Check if element is inside a modal
      const parentModal = element.closest('[role="dialog"], .modal, .workspace-modal');
      
      // Only scroll if element is NOT in a modal (modals are already centered)
      if (!parentModal) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      } else {
        // For modal elements, just ensure they're visible without aggressive scrolling
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        
        if (!isVisible) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' // Less aggressive - only scroll if needed
          });
        }
      }

      // Get element position and size
      const rect = element.getBoundingClientRect();
      const padding = 20; // Extra space around element
      
      // CRITICAL: Elevate the element AND its modal parent
      element.style.position = 'relative';
      element.style.zIndex = '100003'; // Above everything
      element.style.pointerEvents = 'auto';
      
      // Elevate modal/dropdown parent if exists
      const modal = element.closest('.modal, [role="dialog"], .workspace-modal, [data-headlessui-state]');
      if (modal) {
        modal.style.zIndex = '100003';
        modal.style.pointerEvents = 'auto';
        console.log('🔥 TUTORIAL: Elevated modal to z-index 100003');
      }
      
      // Handle progressive form validation
      if (validation) {
        if (validation.startsWith('input-length:')) {
          const minLength = parseInt(validation.split(':')[1]);
          console.log(`📝 TUTORIAL: Watching input for ${minLength} characters`);
          
          // Add input listener
          const inputHandler = (e) => {
            if (e.target.value.length >= minLength) {
              console.log(`✅ TUTORIAL: Input reached ${minLength} characters, advancing!`);
              element.removeEventListener('input', inputHandler);
              element.removeAttribute('data-tutorial-input-handler');
              setTimeout(() => handleNext(), 800); // Small delay so user sees completion
            }
          };
          
          element.addEventListener('input', inputHandler);
          element.setAttribute('data-tutorial-input-handler', 'true');
          
        } else if (validation === 'selection-made') {
          console.log('📝 TUTORIAL: Watching for selection');
          
          // Add click listener for selection
          const clickHandler = () => {
            console.log('✅ TUTORIAL: Selection made, advancing!');
            element.removeEventListener('click', clickHandler);
            element.removeAttribute('data-tutorial-click-handler');
            setTimeout(() => handleNext(), 500);
          };
          
          element.addEventListener('click', clickHandler);
          element.setAttribute('data-tutorial-click-handler', 'true');
        }
      } else {
        // Add click listener to auto-advance tutorial (only for CLICKABLE elements, not inputs)
        const isInput = element.matches('input, textarea, select');
        
        if (!isInput) {
          const clickHandler = () => {
            console.log('🎯 TUTORIAL: Highlighted element clicked, advancing step');
            setTimeout(() => handleNext(), 500);
          };
          element.addEventListener('click', clickHandler);
          element.setAttribute('data-tutorial-click-handler', 'true');
        }
      }
      
      // Create SVG overlay with cutout (allows clicks through the hole)
      let cutoutOverlay = document.querySelector('.tutorial-cutout-overlay');
      if (!cutoutOverlay) {
        cutoutOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        cutoutOverlay.setAttribute('class', 'tutorial-cutout-overlay');
        cutoutOverlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 100001;
          pointer-events: none;
        `;
        document.body.appendChild(cutoutOverlay);
      }
      
      // Function to update overlay position
      const updateOverlayPosition = () => {
        const updatedRect = element.getBoundingClientRect();
        cutoutOverlay.innerHTML = `
          <defs>
            <mask id="tutorial-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white"/>
              <rect 
                x="${updatedRect.left - padding}" 
                y="${updatedRect.top - padding}" 
                width="${updatedRect.width + padding * 2}" 
                height="${updatedRect.height + padding * 2}" 
                rx="12" 
                fill="black"
              />
            </mask>
          </defs>
          <rect 
            x="0" 
            y="0" 
            width="100%" 
            height="100%" 
            fill="rgba(0, 0, 0, 0.8)" 
            mask="url(#tutorial-mask)"
          />
          <rect 
            x="${updatedRect.left - padding}" 
            y="${updatedRect.top - padding}" 
            width="${updatedRect.width + padding * 2}" 
            height="${updatedRect.height + padding * 2}" 
            rx="12" 
            fill="none" 
            stroke="#3b82f6" 
            stroke-width="3"
            class="tutorial-highlight-ring"
          />
        `;
      };
      
      // Initial position
      updateOverlayPosition();
      
      // Debounced update function to prevent blinking
      let resizeTimeout;
      const debouncedUpdate = () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateOverlayPosition, 150);
      };
      
      // Store update function for later cleanup
      element.setAttribute('data-tutorial-update', 'true');
      element._tutorialUpdateOverlay = debouncedUpdate;
      
      // Update position when window resizes (debounced)
      window.addEventListener('resize', debouncedUpdate);
      
      // Animate the highlight ring
      const ring = cutoutOverlay.querySelector('.tutorial-highlight-ring');
      if (ring) {
        gsap.fromTo(ring, 
          { opacity: 0.5, strokeWidth: 3 },
          { 
            opacity: 1,
            strokeWidth: 4,
            duration: 0.8,
            ease: 'power2.inOut',
            yoyo: true,
            repeat: -1
          }
        );
      }
      
      // Animate element with subtle glow
      gsap.fromTo(element, 
        { scale: 1 },
        { 
          scale: 1.02, 
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
    document.querySelectorAll('.tutorial-highlight-box').forEach(el => el.remove());
    document.querySelectorAll('.tutorial-cutout-overlay').forEach(el => el.remove());
    document.querySelectorAll('.tutorial-click-blocker').forEach(el => el.remove());
    
    // Reset highlighted elements (check for all z-index values used)
    document.querySelectorAll('[style*="z-index: 100003"], [style*="z-index: 100002"], [style*="z-index: 100001"], [style*="z-index: 999999"], [style*="z-index: 99999"]').forEach(el => {
      el.style.position = '';
      el.style.zIndex = '';
      el.style.pointerEvents = '';
      
      // Remove click handlers
      if (el.hasAttribute('data-tutorial-click-handler')) {
        el.removeEventListener('click', handleNext);
        el.removeAttribute('data-tutorial-click-handler');
      }
      
      // Remove input handlers
      if (el.hasAttribute('data-tutorial-input-handler')) {
        el.removeEventListener('input', () => {});
        el.removeAttribute('data-tutorial-input-handler');
      }
      
      // Remove overlay update listeners
      if (el.hasAttribute('data-tutorial-update') && el._tutorialUpdateOverlay) {
        window.removeEventListener('resize', el._tutorialUpdateOverlay);
        el.removeAttribute('data-tutorial-update');
        delete el._tutorialUpdateOverlay;
      }
    });
    
    // Stop GSAP animations
    gsap.killTweensOf('*');
  };

  useEffect(() => {
    if (highlightTarget && (currentStepData?.action === 'highlight-element' || currentStepData?.action === 'progressive-form')) {
      cleanupHighlights();
      setTimeout(() => {
        const validation = currentStepData?.validation || null;
        handleElementHighlight(highlightTarget, validation);
      }, 100);
    }

    return cleanupHighlights;
  }, [highlightTarget, currentStepData]);

  // Auto-highlight when step changes for highlight-element and progressive-form actions
  useEffect(() => {
    if ((currentStepData?.action === 'highlight-element' || currentStepData?.action === 'progressive-form') && currentStepData?.target) {
      // Prevent re-highlighting for same step
      if (hasSetHighlightRef.current) {
        console.log('🔒 TUTORIAL: Already set highlight for this step, skipping');
        return;
      }
      
      // Special handling for create-workspace button (inside dropdown)
      if (currentStepData.target === '[data-tutorial="create-workspace"]') {
        console.log('🎯 TUTORIAL: Looking for Create Workspace button...');
        
        // Check if button exists, if not, wait for dropdown to open
        const checkForButton = () => {
          const button = document.querySelector('[data-tutorial="create-workspace"]');
          if (button) {
            console.log('✅ TUTORIAL: Found Create Workspace button');
            hasSetHighlightRef.current = true;
            setHighlightTarget(currentStepData.target);
          } else {
            console.log('⏳ TUTORIAL: Create Workspace button not found, checking again...');
            setTimeout(checkForButton, 200);
          }
        };
        
        checkForButton();
      } else if (currentStepData.action === 'progressive-form') {
        // For progressive form steps, wait for modal to be open
        console.log('🎯 TUTORIAL: Progressive form step, waiting for element:', currentStepData.target);
        
        const checkForElement = () => {
          const element = document.querySelector(currentStepData.target);
          if (element) {
            console.log('✅ TUTORIAL: Found progressive form element');
            hasSetHighlightRef.current = true;
            setHighlightTarget(currentStepData.target);
          } else {
            console.log('⏳ TUTORIAL: Element not found, checking again...');
            setTimeout(checkForElement, 200);
          }
        };
        
        checkForElement();
      } else {
        // Wait a bit for page to settle before highlighting (prevents positioning issues)
        let attempts = 0;
        const maxAttempts = 10; // Try for 2 seconds (10 * 200ms)
        
        const checkForElement = () => {
          attempts++;
          const element = document.querySelector(currentStepData.target);
          if (element) {
            console.log('✅ TUTORIAL: Found element for highlighting');
            hasSetHighlightRef.current = true;
            setHighlightTarget(currentStepData.target);
          } else if (attempts < maxAttempts) {
            console.log(`⏳ TUTORIAL: Element not ready, checking again... (${attempts}/${maxAttempts})`);
            setTimeout(checkForElement, 200);
          } else {
            console.warn('⚠️ TUTORIAL: Element not found after max attempts:', currentStepData.target);
            console.warn('⚠️ TUTORIAL: Showing tutorial anyway without highlight');
            hasSetHighlightRef.current = true;
            // Show tutorial even without highlighting the element
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
          }
        };
        
        // Small delay to ensure DOM is ready
        setTimeout(checkForElement, 100);
      }
    }
    
    // NEW: Handle multi-highlight for workspace form
    if (currentStepData?.action === 'multi-highlight' && currentStepData?.targets) {
      console.log('🎯 TUTORIAL: Creating multiple spotlight holes for workspace form');
      
      const createMultipleSpotlights = () => {
        // First, wait for workspace modal to open
        const waitForModal = () => {
          const modal = document.querySelector('.modal, [role="dialog"], .workspace-modal');
          if (modal) {
            console.log('✅ TUTORIAL: Workspace modal found, creating spotlight holes to drill through');
            
            // Keep modal BELOW overlay - don't elevate it
            // The spotlight holes will make inputs visible and clickable
            
            // Highlight each target element
            currentStepData.targets.forEach((target, index) => {
              setTimeout(() => {
                const element = document.querySelector(target);
                if (element) {
                  console.log('✨ TUTORIAL: Creating spotlight hole for input:', target);
                  handleElementHighlight(target);
                } else {
                  console.log('❌ TUTORIAL: Element not found:', target);
                  // Debug: Log all available tutorial elements
                  const allTutorialElements = document.querySelectorAll('[data-tutorial]');
                  console.log('🔍 Available tutorial elements:', Array.from(allTutorialElements).map(el => el.getAttribute('data-tutorial')));
                }
              }, 300 * (index + 1)); // Stagger the highlights
            });
          } else {
            console.log('⏳ TUTORIAL: Workspace modal not found, waiting...');
            setTimeout(waitForModal, 200);
          }
        };
        
        waitForModal();
      };
      
      createMultipleSpotlights();
    }
  }, [currentStepData]);

  if (!isVisible || !currentStepData) return null;

  const IconComponent = currentStepData.icon;

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Overlay - Only for non-highlight steps (click-anywhere, form-guidance) */}
            {currentStepData.action !== 'highlight-element' && currentStepData.action !== 'multi-highlight' && currentStepData.action !== 'progressive-form' && (
              <motion.div
                ref={overlayRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100]"
                style={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  pointerEvents: currentStepData.action === 'click-anywhere' ? 'auto' : 'none' // Clickable for click-anywhere, otherwise let modals through
                }}
                onClick={currentStepData.action === 'click-anywhere' ? handleNext : undefined}
              />
            )}
            
            {/* SVG Cutout Overlay is created dynamically in handleElementHighlight */}
            {/* It allows clicks through the cutout hole to the highlighted element */}
            {/* Tutorial Modal - ABOVE overlay */}
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
              className={`fixed z-[1000000] rounded-3xl shadow-2xl overflow-hidden
                ${
                  // Position based on which step we're on
                  currentStep >= 4 && currentStep <= 10 
                    ? 'top-4 left-4 w-[90vw] max-w-[320px] sm:max-w-xs md:max-w-sm' // Top-left for modal steps, very small on mobile
                    : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md' // Center for other steps
                }
              `}
              onClick={currentStepData?.action === 'click-anywhere' ? handleNext : (e) => {
                // CRITICAL: Don't let tutorial modal clicks close workspace modal
                e.stopPropagation();
                e.preventDefault();
              }}
              style={{
                background: `linear-gradient(135deg, ${currentStepData.gradient.split(' ')[1]} 0%, ${currentStepData.gradient.split(' ')[3]} 100%)`,
                backgroundColor: 'var(--surface-color)',
                pointerEvents: 'auto' // Make modal clickable
              }}
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
                      style={{ color: 'var(--color-primary)' }}
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
                        : currentStepData.action === 'progressive-form'
                        ? currentStepData.validation?.startsWith('input-length:')
                          ? `Type ${currentStepData.validation.split(':')[1]}+ characters to continue`
                          : 'Make a selection to continue'
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
          </>
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