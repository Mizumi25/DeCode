import { create } from 'zustand';

// Tutorial store for managing tutorial states and progress
import { persist } from 'zustand/middleware';

const useTutorialStore = create(
    persist(
        (set, get) => ({
            // Tutorial state
            isActive: false,
            currentStep: 'forge-intro',
            completedSteps: [],
            tutorialProgress: 0,
            skipTutorial: false,
            
            // Page Navigation Tutorial
            isPageTutorialActive: false,
            currentPage: null,
            pageNavigationStep: 0,
            tutorialWorkspaceId: typeof window !== 'undefined' 
                ? (localStorage.getItem('tutorial-workspace-id') ? parseInt(localStorage.getItem('tutorial-workspace-id')) : null)
                : null, // Store workspace ID created during tutorial
            
            // Debug flag
            debug: true,

            // Tutorial flow steps
            tutorialFlow: [
                'forge-intro',
                'navigate-home', 
                'workspace-dropdown',
                'create-workspace',
                'select-team-type',
                'switch-workspace',
                'create-project',
                'project-setup',
                'void-intro',
                'create-frame',
                'frame-setup',
                'open-frame',
                'forge-explained',
                'explore-source',
                'source-intro',
                'back-to-void'
            ],

            // Actions
            startTutorial: () => {
                console.log('🎯 TUTORIAL: Starting tutorial...');
                set({
                    isActive: true,
                    currentStep: 'forge-intro',
                    completedSteps: [],
                    tutorialProgress: 0,
                    skipTutorial: false
                });
                console.log('🎯 TUTORIAL: Tutorial started!', get());
            },

            nextStep: () => {
                const { currentStep, tutorialFlow, completedSteps } = get();
                const currentIndex = tutorialFlow.indexOf(currentStep);
                const nextIndex = currentIndex + 1;
                
                // Mark current step as completed
                const newCompletedSteps = [...completedSteps, currentStep];
                
                if (nextIndex < tutorialFlow.length) {
                    const nextStep = tutorialFlow[nextIndex];
                    const progress = ((nextIndex + 1) / tutorialFlow.length) * 100;
                    
                    set({
                        currentStep: nextStep,
                        completedSteps: newCompletedSteps,
                        tutorialProgress: progress
                    });
                } else {
                    // Tutorial completed
                    get().completeTutorial();
                }
            },

            goToStep: (stepName) => {
                const { tutorialFlow } = get();
                if (tutorialFlow.includes(stepName)) {
                    const stepIndex = tutorialFlow.indexOf(stepName);
                    const progress = ((stepIndex + 1) / tutorialFlow.length) * 100;
                    
                    set({
                        currentStep: stepName,
                        tutorialProgress: progress
                    });
                }
            },

            completeTutorial: () => {
                set({
                    isActive: false,
                    tutorialProgress: 100,
                    completedSteps: get().tutorialFlow
                });
                
                // Show completion toast
                if (window.toast) {
                    window.toast.success('🎉 Tutorial Complete! You\'re ready to build amazing apps!');
                }
                
                // Mark user as tutorial completed
                get().markUserTutorialCompleted();
            },

            skipTutorialAction: () => {
                set({
                    isActive: false,
                    skipTutorial: true,
                    tutorialProgress: 0
                });
            },

            resetTutorial: () => {
                set({
                    isActive: false,
                    currentStep: 'forge-intro',
                    completedSteps: [],
                    tutorialProgress: 0,
                    skipTutorial: false
                });
            },

            // Helper functions
            isStepCompleted: (stepName) => {
                return get().completedSteps.includes(stepName);
            },

            shouldShowTutorial: () => {
                const { skipTutorial, completedSteps, tutorialFlow } = get();
                return !skipTutorial && completedSteps.length < tutorialFlow.length;
            },

            getCurrentStepIndex: () => {
                const { currentStep, tutorialFlow } = get();
                return tutorialFlow.indexOf(currentStep);
            },

            getTotalSteps: () => {
                return get().tutorialFlow.length;
            },

            // Page-specific tutorial triggers
            triggerForgeIntro: () => {
                if (get().shouldShowTutorial() && !get().isStepCompleted('forge-intro')) {
                    set({ 
                        isActive: true,
                        currentStep: 'forge-intro'
                    });
                }
            },

            triggerVoidIntro: () => {
                if (get().shouldShowTutorial() && get().currentStep === 'void-intro') {
                    set({ isActive: true });
                }
            },

            triggerSourceIntro: () => {
                if (get().shouldShowTutorial() && get().currentStep === 'source-intro') {
                    set({ isActive: true });
                }
            },

            // Navigation helpers
            handleNavigationTrigger: (page) => {
                const { currentStep, isActive } = get();
                
                switch (page) {
                    case 'forge':
                        if (currentStep === 'forge-intro' && !isActive) {
                            get().triggerForgeIntro();
                        }
                        break;
                    case 'project-list':
                        if (currentStep === 'workspace-dropdown') {
                            set({ isActive: true });
                        }
                        break;
                    case 'void':
                        if (currentStep === 'void-intro') {
                            get().triggerVoidIntro();
                        }
                        break;
                    case 'source':
                        if (currentStep === 'source-intro') {
                            get().triggerSourceIntro();
                        }
                        break;
                }
            },

            // Page Navigation Tutorial Methods
            startPageTutorial: () => {
                console.log('🎯 PAGE TUTORIAL: Starting page navigation tutorial...');
                set({
                    isPageTutorialActive: true,
                    pageNavigationStep: 0,
                    currentPage: 'forge'
                });
                localStorage.setItem('pageNavigationTutorial', 'active');
            },

            completePageTutorial: () => {
                console.log('🎯 PAGE TUTORIAL: Completing page navigation tutorial...');
                set({
                    isPageTutorialActive: false,
                    pageNavigationStep: 0,
                    currentPage: null,
                    tutorialWorkspaceId: null
                });
                localStorage.setItem('pageNavigationTutorial', 'completed');
                localStorage.removeItem('tutorial-workspace-id');
                // Clear modal check flags
                sessionStorage.removeItem('tutorial-workspace-modal-checked');
                sessionStorage.removeItem('tutorial-project-modal-checked');
            },

            setCurrentPage: (page) => {
                set({ currentPage: page });
            },
            
            setPageNavigationStep: (step) => {
                console.log('🎯 PAGE TUTORIAL: Setting step to:', step);
                set({ pageNavigationStep: step });
            },
            
            getPageNavigationStep: () => {
                return get().pageNavigationStep;
            },
            
            setTutorialWorkspaceId: (workspaceId) => {
                console.log('🎯 PAGE TUTORIAL: Setting tutorial workspace ID:', workspaceId);
                set({ tutorialWorkspaceId: workspaceId });
                // Also save to localStorage for persistence across page reloads
                if (typeof window !== 'undefined' && workspaceId) {
                    localStorage.setItem('tutorial-workspace-id', workspaceId.toString());
                }
            },
            
            getTutorialWorkspaceId: () => {
                return get().tutorialWorkspaceId;
            },

            // API integration
            markUserTutorialCompleted: async () => {
                try {
                    await fetch('/api/user/tutorial-completed', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                        }
                    });
                } catch (error) {
                    console.error('Failed to mark tutorial as completed:', error);
                }
            },

            // Tutorial step validation
            validateStepCompletion: (stepName, data = {}) => {
                switch (stepName) {
                    case 'create-workspace':
                        return data.workspaceCreated === true;
                    case 'create-project':
                        return data.projectCreated === true;
                    case 'create-frame':
                        return data.frameCreated === true;
                    default:
                        return true;
                }
            },

            // Tutorial-specific element highlighting
            getHighlightedElements: () => {
                const { currentStep } = get();
                
                const highlightMap = {
                    'navigate-home': ['.decode-logo'],
                    'workspace-dropdown': ['.workspace-dropdown'],
                    'create-workspace': ['.create-workspace-btn'],
                    'select-team-type': ['.team-workspace-option'],
                    'switch-workspace': ['.workspace-dropdown'],
                    'create-project': ['.new-project-btn'],
                    'project-setup': ['.project-form'],
                    'create-frame': ['.floating-add-btn'],
                    'frame-setup': ['.frame-form'],
                    'open-frame': ['.frame-preview'],
                    'explore-source': ['.mode-dropdown'],
                    'back-to-void': ['.back-button']
                };
                
                return highlightMap[currentStep] || [];
            }
        }),
        {
            name: 'tutorial-store',
            version: 1
        }
    )
);

export default useTutorialStore;