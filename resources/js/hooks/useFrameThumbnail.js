/**
 * useFrameThumbnail.js
 * 
 * React hook for managing frame thumbnails with automatic regeneration.
 * Detects when frame data changes and schedules thumbnail updates.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import voidFrameThumbnailService from '@/Services/VoidFrameThumbnailService.jsx';

export function useFrameThumbnail(frame, options = {}) {
  const {
    autoGenerate = true,
    debounceDelay = 2000,
    onSuccess = null,
    onError = null,
  } = options;

  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const previousHashRef = useRef(null);

  // Generate thumbnail manually
  const generateThumbnail = useCallback(async () => {
    if (!frame) return;

    const frameId = frame.id || frame.uuid;
    console.log(`[useFrameThumbnail] Generating thumbnail for ${frameId}`);

    setIsGenerating(true);
    setError(null);

    try {
      // Generate thumbnail
      const blob = await voidFrameThumbnailService.generateThumbnail(frame);
      
      // Create object URL for display
      const url = URL.createObjectURL(blob);
      setThumbnailUrl(url);

      // Upload to backend
      await voidFrameThumbnailService.uploadThumbnail(frame, blob);

      if (onSuccess) {
        onSuccess({ url, blob });
      }

      console.log(`[useFrameThumbnail] ✅ Thumbnail generated for ${frameId}`);

    } catch (err) {
      console.error(`[useFrameThumbnail] ❌ Failed to generate thumbnail:`, err);
      setError(err);

      if (onError) {
        onError(err);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [frame, onSuccess, onError]);

  // Detect frame changes and auto-regenerate
  useEffect(() => {
    if (!autoGenerate || !frame) return;

    // Hash current frame data
    const currentHash = voidFrameThumbnailService._hashFrameData(frame);

    // Check if data changed
    if (previousHashRef.current !== currentHash) {
      console.log(`[useFrameThumbnail] Frame data changed, clearing cache and scheduling regeneration`);
      previousHashRef.current = currentHash;

      // Clear cache for this frame to force regeneration
      const frameId = frame.id || frame.uuid;
      voidFrameThumbnailService.clearCache(frameId);

      // Schedule thumbnail generation with debounce
      voidFrameThumbnailService.scheduleThumbnailGeneration(frame, debounceDelay);
    }
  }, [frame, autoGenerate, debounceDelay]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (thumbnailUrl && thumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, [thumbnailUrl]);

  return {
    thumbnailUrl,
    isGenerating,
    error,
    generateThumbnail,
  };
}

export default useFrameThumbnail;
