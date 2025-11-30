import { useCallback, useEffect, useRef, useState } from 'react';
import { PlaywrightVoidThumbnailService } from '@/Services/PlaywrightVoidThumbnailService';
import { VoidPageSnapshotService } from '@/Services/VoidPageSnapshotService';

/**
 * Hook for high-fidelity Void Page snapshots
 * Uses Playwright for server-side rendering (PRIMARY)
 * Falls back to canvas rendering if Playwright fails (FALLBACK)
 */
export const useVoidSnapshot = (projectId, options = {}) => {
  const {
    autoCapture = true,
    captureDelay = 5000,
    onCaptureSuccess = null,
    onCaptureError = null,
    usePlaywright = true, // Enable Playwright by default
    canvasFallback = true, // Enable fallback by default
  } = options;

  const [isCapturing, setIsCapturing] = useState(false);
  const [lastSnapshot, setLastSnapshot] = useState(null);
  const [captureMethod, setCaptureMethod] = useState(null); // Track which method was used
  const captureTimeoutRef = useRef(null);
  const hasScheduledRef = useRef(false);

  /**
   * Generate snapshot manually
   */
  const generateSnapshot = useCallback(async () => {
    if (!projectId || isCapturing) {
      console.log('[useVoidSnapshot] Skipping: no projectId or already capturing');
      return null;
    }

    try {
      setIsCapturing(true);
      console.log('[useVoidSnapshot] 🚀 Starting snapshot generation for project:', projectId);
      console.log('[useVoidSnapshot] 🎬 Method: Playwright-first with canvas fallback');

      let result;

      if (usePlaywright) {
        // Use Playwright-first approach with automatic fallback
        result = await PlaywrightVoidThumbnailService.generateWithFallback(projectId, {
          width: 1600,
          height: 1000,
          quality: 95,
          waitTime: 3000,
          onPlaywrightAttempt: () => {
            console.log('[useVoidSnapshot] 🎬 Attempting Playwright generation...');
            setCaptureMethod('playwright_attempting');
          },
          onPlaywrightSuccess: (data) => {
            console.log('[useVoidSnapshot] ✅ Playwright generation successful!', data);
            setCaptureMethod('playwright');
          },
          onPlaywrightFailure: (error) => {
            console.warn('[useVoidSnapshot] ⚠️ Playwright failed, falling back to canvas...', error);
            setCaptureMethod('playwright_failed');
          },
          onFallbackAttempt: () => {
            console.log('[useVoidSnapshot] 🎨 Attempting canvas fallback...');
            setCaptureMethod('canvas_attempting');
          },
          onFallbackSuccess: (data) => {
            console.log('[useVoidSnapshot] ✅ Canvas fallback successful!', data);
            setCaptureMethod('canvas_fallback');
          },
          onFallbackFailure: (error) => {
            console.error('[useVoidSnapshot] ❌ Canvas fallback failed!', error);
            setCaptureMethod('all_failed');
          },
        });
      } else if (canvasFallback) {
        // Use canvas-only if Playwright is disabled
        console.log('[useVoidSnapshot] 🎨 Using canvas-only mode (Playwright disabled)');
        result = await VoidPageSnapshotService.generateAndUpload(projectId, {
          width: 1600,
          height: 1000,
          scale: 2,
          quality: 0.95,
          waitForRender: 2000,
        });
        setCaptureMethod('canvas_only');
      } else {
        console.error('[useVoidSnapshot] ❌ Both Playwright and canvas are disabled!');
        return null;
      }

      setLastSnapshot(result);
      
      if (result.success && onCaptureSuccess) {
        onCaptureSuccess(result);
      }

      console.log('[useVoidSnapshot] ✅ Snapshot generation complete!', {
        success: result.success,
        method: result.method || captureMethod,
        thumbnailUrl: result.thumbnailUrl || result.thumbnail_url,
      });
      
      return result;

    } catch (error) {
      console.error('[useVoidSnapshot] ❌ Snapshot generation failed:', error);
      setCaptureMethod('error');
      
      if (onCaptureError) {
        onCaptureError(error);
      }

      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [projectId, isCapturing, usePlaywright, canvasFallback, onCaptureSuccess, onCaptureError]);

  /**
   * Schedule snapshot with delay
   */
  const scheduleSnapshot = useCallback((delay = captureDelay) => {
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
    }

    console.log(`[useVoidSnapshot] ⏰ Scheduling snapshot in ${delay}ms`);

    captureTimeoutRef.current = setTimeout(() => {
      generateSnapshot();
    }, delay);
  }, [captureDelay, generateSnapshot]);

  // Memoize the schedule function to prevent recreating it on every render
  const scheduleSnapshotStable = useRef(scheduleSnapshot);
  useEffect(() => {
    scheduleSnapshotStable.current = scheduleSnapshot;
  }, [scheduleSnapshot]);

  /**
   * Auto-capture ONCE when projectId is available
   * Uses generateSnapshot which includes Playwright-first logic
   */
  useEffect(() => {
    // Only schedule if we have a projectId and haven't scheduled yet
    if (autoCapture && projectId && !hasScheduledRef.current) {
      hasScheduledRef.current = true;
      
      console.log('[useVoidSnapshot] 🚀 SCHEDULING snapshot in 5 seconds for project:', projectId);
      
      const timeoutId = setTimeout(() => {
        console.log('[useVoidSnapshot] ⏰ TIMEOUT FIRED! Starting snapshot generation...');
        
        // Call generateSnapshot which now handles Playwright-first with fallback
        generateSnapshot();
      }, 5000);
      
      captureTimeoutRef.current = timeoutId;
      
      console.log('[useVoidSnapshot] ✅ Timeout scheduled with ID:', timeoutId);
    }
    
    // Cleanup function
    return () => {
      if (captureTimeoutRef.current) {
        console.log('[useVoidSnapshot] 🧹 Clearing timeout:', captureTimeoutRef.current);
        clearTimeout(captureTimeoutRef.current);
        captureTimeoutRef.current = null;
      }
    };
  }, [projectId, autoCapture, generateSnapshot]); // Include dependencies

  return {
    generateSnapshot,
    scheduleSnapshot,
    isCapturing,
    lastSnapshot,
    captureMethod, // Expose the method used for debugging
  };
};

export default useVoidSnapshot;
