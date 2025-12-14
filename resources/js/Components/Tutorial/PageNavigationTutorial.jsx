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
  const overlayRef = useRef(null);
  
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
    // Step 4: Fill Workspace Name (Progressive Step 1)
    {
      id: 'fill-workspace-name',
      page: 'projects',
      title: 'Enter Workspace Name',
      subtitle: 'Give your workspace a meaningful name',
      content: [
        'Type a name for your workspace in the input field.',
        'Once you type 5 or more characters, we\'ll move to the next step.'
      ],
      icon: Code2,
      action: 'progressive-form',
      target: '[data-tutorial="workspace-name-input"]',
      validation: 'input-length:5',
      gradient: 'from-indigo-600 to-blue-600'
    },
    // Step 5: Select Workspace Type (Progressive Step 2)
    {
      id: 'select-workspace-type',
      page: 'projects',
      title: 'Choose Workspace Type',
      subtitle: 'Select "Team Workspace"',
      content: [
        'Now select "Team Workspace" from the dropdown.',
        'Once selected, we\'ll automatically move to the final step.'
      ],
      icon: Settings,
      action: 'progressive-form',
      target: '[data-tutorial="team-workspace-option"]',
      validation: 'selection-made',
      gradient: 'from-green-600 to-emerald-600'
    },
    // Step 6: Click Create Button (Progressive Step 3)
    {
      id: 'click-create-workspace',
      page: 'projects',
      title: 'Create Your Workspace',
      subtitle: 'Finalize your team space',
      content: [
        'Perfect! Now click the "Create Workspace" button.',
        'Your workspace will be created and you can start adding projects!'
      ],
      icon: Sparkles,
      action: 'highlight-element',
      target: '[data-tutorial="create-workspace-button"]',
      gradient: 'from-blue-600 to-cyan-600'
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
      if (currentPage === 'projects' && currentStep === 3) {
        const createButton = document.querySelector('[data-tutorial="create-workspace"]');
        
        if (!createButton) {
          console.log('🔄 TUTORIAL: Create Workspace button not visible. Auto-opening dropdown...');
          
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
      
      // Check if we're on a workspace form step but modal is closed (after refresh)
      if (currentPage === 'projects' && (currentStep === 4 || currentStep === 5 || currentStep === 6)) {
        const isModalOpen = document.querySelector('[role="dialog"], .workspace-modal, [data-tutorial="workspace-name-input"]');
        
        if (!isModalOpen) {
          console.log('🔄 TUTORIAL: Workspace form step detected but modal closed. Auto-opening modal...');
          
          // Try multiple times with increasing delays to handle race conditions
          let attempts = 0;
          const maxAttempts = 5;
          
          const tryOpenModal = () => {
            attempts++;
            console.log(`🔄 TUTORIAL: Attempt ${attempts}/${maxAttempts} to open modal`);
            
            // First check if modal is now open
            const modalCheck = document.querySelector('[role="dialog"], .workspace-modal, [data-tutorial="workspace-name-input"]');
            if (modalCheck) {
              console.log('✅ TUTORIAL: Modal is now open, showing tutorial');
              setIsVisible(true);
              document.body.style.overflow = 'hidden';
              return;
            }
            
            // Try to open it
            const dropdownButton = document.querySelector('[data-tutorial="workspace-dropdown"]');
            if (dropdownButton) {
              dropdownButton.click();
              console.log('🔄 TUTORIAL: Clicked workspace dropdown');
              
              // Then click Create Workspace button
              setTimeout(() => {
                const createButton = document.querySelector('[data-tutorial="create-workspace"]');
                if (createButton) {
                  createButton.click();
                  console.log('✅ TUTORIAL: Clicked Create Workspace button');
                  
                  // Verify modal opened
                  setTimeout(() => {
                    const finalCheck = document.querySelector('[role="dialog"], .workspace-modal, [data-tutorial="workspace-name-input"]');
                    if (finalCheck) {
                      console.log('✅ TUTORIAL: Modal successfully opened');
                      setIsVisible(true);
                      document.body.style.overflow = 'hidden';
                    } else if (attempts < maxAttempts) {
                      console.log('⚠️ TUTORIAL: Modal not opened, retrying...');
                      setTimeout(tryOpenModal, 1000);
                    } else {
                      console.error('❌ TUTORIAL: Failed to open modal after max attempts');
                      // Fallback: Skip to next step if modal won't open
                      console.log('🔄 TUTORIAL: Skipping to next step (new-project)');
                      setPageNavigationStep(7); // Skip to "new-project" step
                    }
                  }, 500);
                }
              }, 400);
            } else if (attempts < maxAttempts) {
              console.log('⚠️ TUTORIAL: Dropdown not found, retrying...');
              setTimeout(tryOpenModal, 1000);
            }
          };
          
          // Start the process
          setTimeout(tryOpenModal, 500);
          return;
        } else {
          // Modal is already open, just show the tutorial
          console.log('✅ TUTORIAL: Modal already open, showing tutorial');
          setIsVisible(true);
          document.body.style.overflow = 'hidden';
        }
      }
      
      // Show tutorial if current step matches current page or if we're on step 0
      const shouldShow = currentStep === 0 || 
                        (currentStepData && currentStepData.page === currentPage);
      
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
    // Clean up current highlights before advancing
    cleanupHighlights();
    
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
      // Scroll element into view
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });

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
      // Special handling for create-workspace button (inside dropdown)
      if (currentStepData.target === '[data-tutorial="create-workspace"]') {
        console.log('🎯 TUTORIAL: Looking for Create Workspace button...');
        
        // Check if button exists, if not, wait for dropdown to open
        const checkForButton = () => {
          const button = document.querySelector('[data-tutorial="create-workspace"]');
          if (button) {
            console.log('✅ TUTORIAL: Found Create Workspace button');
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
            setHighlightTarget(currentStepData.target);
          } else {
            console.log('⏳ TUTORIAL: Element not found, checking again...');
            setTimeout(checkForElement, 200);
          }
        };
        
        checkForElement();
      } else {
        // Wait a bit for page to settle before highlighting (prevents positioning issues)
        const checkForElement = () => {
          const element = document.querySelector(currentStepData.target);
          if (element) {
            console.log('✅ TUTORIAL: Found element for highlighting');
            setHighlightTarget(currentStepData.target);
          } else {
            console.log('⏳ TUTORIAL: Element not ready, checking again...');
            setTimeout(checkForElement, 200);
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
                className="fixed inset-0 z-[100000]"
                style={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  pointerEvents: 'auto'
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
              className={`fixed z-[100005] max-w-md rounded-3xl shadow-2xl overflow-hidden ${
                currentStepData?.id === 'select-team' ? 'bottom-4 left-4' : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
              }`}
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