import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to track real loading progress for page resources
 * 
 * @param {Object} options
 * @param {number} options.totalResources - Expected number of resources to load
 * @param {number} options.minDuration - Minimum loading duration in ms (default: 500)
 * @param {number} options.maxDuration - Maximum loading duration in ms (default: 3000)
 * @returns {Object} { isLoading, progress, message, startLoading, updateProgress, finishLoading }
 */
export const usePageLoadingProgress = ({ 
  totalResources = 1,
  minDuration = 500,
  maxDuration = 3000 
} = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [loadedResources, setLoadedResources] = useState(0);
  
  const startTimeRef = useRef(null);
  const simulationTimerRef = useRef(null);

  // Start loading
  const startLoading = useCallback((initialMessage = 'Loading...') => {
    setIsLoading(true);
    setProgress(0);
    setLoadedResources(0);
    setMessage(initialMessage);
    startTimeRef.current = Date.now();
    
    // Start progress simulation (slow initial progress)
    let simulatedProgress = 0;
    simulationTimerRef.current = setInterval(() => {
      simulatedProgress += Math.random() * 3; // Random increment up to 3%
      
      // Cap at 90% until actual resources are loaded
      if (simulatedProgress > 90) {
        simulatedProgress = 90;
      }
      
      setProgress(prev => Math.min(90, Math.max(prev, simulatedProgress)));
    }, 100);
  }, []);

  // Update progress based on loaded resources
  const updateProgress = useCallback((loaded, total, currentMessage) => {
    setLoadedResources(loaded);
    
    if (currentMessage) {
      setMessage(currentMessage);
    }
    
    // Calculate real progress (resources loaded contribute 90% of progress)
    const resourceProgress = total > 0 ? (loaded / total) * 90 : 0;
    
    setProgress(prev => Math.max(prev, resourceProgress));
  }, []);

  // Increment progress by one resource
  const incrementProgress = useCallback((currentMessage) => {
    setLoadedResources(prev => {
      const newLoaded = prev + 1;
      const resourceProgress = totalResources > 0 ? (newLoaded / totalResources) * 90 : 0;
      setProgress(p => Math.max(p, resourceProgress));
      return newLoaded;
    });
    
    if (currentMessage) {
      setMessage(currentMessage);
    }
  }, [totalResources]);

  // Finish loading (animate to 100%)
  const finishLoading = useCallback(() => {
    // Clear simulation timer
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
    
    const elapsed = Date.now() - (startTimeRef.current || Date.now());
    const remainingTime = Math.max(0, minDuration - elapsed);
    
    // Animate to 100%
    let currentProgress = progress;
    const animationInterval = setInterval(() => {
      currentProgress += (100 - currentProgress) * 0.2;
      
      if (currentProgress >= 99.5) {
        currentProgress = 100;
        setProgress(100);
        clearInterval(animationInterval);
        
        // Hide loading screen after reaching 100%
        setTimeout(() => {
          setIsLoading(false);
          setProgress(0);
          setLoadedResources(0);
        }, 200);
      } else {
        setProgress(currentProgress);
      }
    }, 50);
    
    // Respect minimum duration
    if (remainingTime > 0) {
      setTimeout(() => {
        // Animation already started, just let it complete
      }, remainingTime);
    }
    
    // Safety timeout to prevent infinite loading
    setTimeout(() => {
      clearInterval(animationInterval);
      setIsLoading(false);
      setProgress(0);
      setLoadedResources(0);
    }, maxDuration);
  }, [progress, minDuration, maxDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    progress,
    message,
    loadedResources,
    startLoading,
    updateProgress,
    incrementProgress,
    finishLoading
  };
};
