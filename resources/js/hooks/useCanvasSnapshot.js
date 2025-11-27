// @/hooks/useCanvasSnapshot.js
// Hook for Framer-style canvas snapshots

import { useState, useCallback, useEffect, useRef } from 'react';
import { CanvasSnapshotService } from '@/Services/CanvasSnapshotService';

export function useCanvasSnapshot(projectId, options = {}) {
  const {
    autoCapture = false,
    captureDelay = 2000,
    onCaptureSuccess = null,
    onCaptureError = null
  } = options;

  const [isCapturing, setIsCapturing] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [error, setError] = useState(null);
  const [lastCaptured, setLastCaptured] = useState(null);

  const captureTimeoutRef = useRef(null);
  const mountedRef = useRef(true);

  /**
   * Capture snapshot manually
   */
  const captureSnapshot = useCallback(async (captureOptions = {}) => {
    if (!projectId) {
      console.warn('[useCanvasSnapshot] No project ID provided');
      return;
    }

    if (isCapturing) {
      console.warn('[useCanvasSnapshot] Capture already in progress');
      return;
    }

    try {
      setIsCapturing(true);
      setError(null);

      console.log(`[useCanvasSnapshot] Capturing snapshot for project ${projectId}`);

      const result = await CanvasSnapshotService.generateProjectThumbnail(
        projectId,
        captureOptions
      );

      if (mountedRef.current) {
        setThumbnailUrl(result.thumbnail_url);
        setLastCaptured(Date.now());
        setIsCapturing(false);

        if (onCaptureSuccess) {
          onCaptureSuccess(result);
        }

        console.log(`[useCanvasSnapshot] Capture successful:`, result.thumbnail_url);
      }

      return result;

    } catch (err) {
      console.error(`[useCanvasSnapshot] Capture failed:`, err);
      
      if (mountedRef.current) {
        setError(err.message || 'Snapshot capture failed');
        setIsCapturing(false);

        if (onCaptureError) {
          onCaptureError(err);
        }
      }

      throw err;
    }
  }, [projectId, isCapturing, onCaptureSuccess, onCaptureError]);

  /**
   * Schedule a debounced snapshot
   */
  const scheduleSnapshot = useCallback((captureOptions = {}) => {
    if (!projectId) return;

    // Clear existing timeout
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
    }

    console.log(`[useCanvasSnapshot] Scheduling snapshot in ${captureDelay}ms`);

    // Schedule new capture
    captureTimeoutRef.current = setTimeout(() => {
      captureSnapshot(captureOptions);
    }, captureDelay);
  }, [projectId, captureDelay, captureSnapshot]);

  /**
   * Cancel scheduled snapshot
   */
  const cancelScheduledSnapshot = useCallback(() => {
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
      console.log(`[useCanvasSnapshot] Cancelled scheduled snapshot`);
    }
  }, []);

  /**
   * Get cached snapshot
   */
  const getCachedSnapshot = useCallback(() => {
    if (!projectId) return null;
    return CanvasSnapshotService.getCachedSnapshot(projectId);
  }, [projectId]);

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    if (!projectId) return;
    CanvasSnapshotService.clearCache(projectId);
    setThumbnailUrl(null);
    setLastCaptured(null);
  }, [projectId]);

  /**
   * Auto-capture on mount if enabled
   */
  useEffect(() => {
    if (autoCapture && projectId) {
      console.log(`🚀 [useCanvasSnapshot] Auto-capture ENABLED for project ${projectId}`);
      console.log(`⏰ [useCanvasSnapshot] Will capture in ${captureDelay}ms`);
      scheduleSnapshot();
    } else {
      if (!autoCapture) {
        console.log(`⏸️ [useCanvasSnapshot] Auto-capture DISABLED`);
      }
      if (!projectId) {
        console.log(`⚠️ [useCanvasSnapshot] No project ID provided`);
      }
    }
  }, [autoCapture, projectId, scheduleSnapshot, captureDelay]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (captureTimeoutRef.current) {
        clearTimeout(captureTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    isCapturing,
    thumbnailUrl,
    error,
    lastCaptured,

    // Actions
    captureSnapshot,
    scheduleSnapshot,
    cancelScheduledSnapshot,
    getCachedSnapshot,
    clearCache,

    // Utils
    isReady: !isCapturing && !!projectId
  };
}
