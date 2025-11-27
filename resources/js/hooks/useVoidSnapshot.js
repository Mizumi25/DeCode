import { useCallback, useEffect, useRef, useState } from 'react';
import { VoidPageSnapshotService } from '@/Services/VoidPageSnapshotService';

/**
 * Hook for high-fidelity Void Page snapshots
 * Uses offscreen rendering approach similar to Framer
 */
export const useVoidSnapshot = (projectId, options = {}) => {
  const {
    autoCapture = true,
    captureDelay = 5000,
    onCaptureSuccess = null,
    onCaptureError = null,
  } = options;

  const [isCapturing, setIsCapturing] = useState(false);
  const [lastSnapshot, setLastSnapshot] = useState(null);
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

      const result = await VoidPageSnapshotService.generateAndUpload(projectId, {
        width: 1600,
        height: 1000,
        scale: 2,
        quality: 0.95,
        waitForRender: 2000,
      });

      setLastSnapshot(result);
      
      if (onCaptureSuccess) {
        onCaptureSuccess(result);
      }

      console.log('[useVoidSnapshot] ✅ Snapshot generation complete!', result);
      return result;

    } catch (error) {
      console.error('[useVoidSnapshot] ❌ Snapshot generation failed:', error);
      
      if (onCaptureError) {
        onCaptureError(error);
      }

      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [projectId, isCapturing, onCaptureSuccess, onCaptureError]);

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
   * Use separate effect that only runs when projectId changes from null to a value
   */
  useEffect(() => {
    // Only schedule if we have a projectId and haven't scheduled yet
    if (autoCapture && projectId && !hasScheduledRef.current) {
      hasScheduledRef.current = true;
      
      console.log('[useVoidSnapshot] 🚀 SCHEDULING snapshot in 5 seconds for project:', projectId);
      
      const timeoutId = setTimeout(() => {
        console.log('[useVoidSnapshot] ⏰ TIMEOUT FIRED! Starting snapshot generation...');
        
        // Call generateSnapshot directly
        if (!isCapturing) {
          setIsCapturing(true);
          console.log('[useVoidSnapshot] 🚀 Starting snapshot generation for project:', projectId);

          VoidPageSnapshotService.generateAndUpload(projectId, {
            width: 1600,
            height: 1000,
            scale: 2,
            quality: 0.95,
            waitForRender: 2000,
          })
            .then(result => {
              setLastSnapshot(result);
              if (onCaptureSuccess) {
                onCaptureSuccess(result);
              }
              console.log('[useVoidSnapshot] ✅ Snapshot generation complete!', result);
            })
            .catch(error => {
              console.error('[useVoidSnapshot] ❌ Snapshot generation failed:', error);
              if (onCaptureError) {
                onCaptureError(error);
              }
            })
            .finally(() => {
              setIsCapturing(false);
            });
        }
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
  }, [projectId]); // ONLY depend on projectId!

  return {
    generateSnapshot,
    scheduleSnapshot,
    isCapturing,
    lastSnapshot,
  };
};

export default useVoidSnapshot;
