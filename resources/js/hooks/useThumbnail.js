// @/hooks/useThumbnail.js - FIXED for better error handling and SVG support

import { useState, useEffect, useCallback, useRef } from 'react';
import { ThumbnailService } from '@/Services/ThumbnailService';

export function useThumbnail(frameUuid, frameType = 'page', options = {}) {
  const {
    autoGenerate = false,
    enableRealTimeUpdates = true,
    debounceMs = 2000,
    preloadThumbnails = true,
    maxRetries = 3
  } = options;

  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const unsubscribeRef = useRef(null);
  const mountedRef = useRef(true);
  const initializationRef = useRef(false);

  console.log(`[useThumbnail] Hook state for ${frameUuid}:`, {
    thumbnailUrl,
    isLoading,
    isGenerating,
    error,
    retryCount
  });

  // Initialize thumbnail status
  useEffect(() => {
    if (!frameUuid || !mountedRef.current || initializationRef.current) return;

    initializationRef.current = true;

    const initializeThumbnail = async () => {
      try {
        console.log(`[useThumbnail] Initializing thumbnail for ${frameUuid}`);
        setIsLoading(true);
        setError(null);
        setRetryCount(0);

        // First, try to get existing thumbnail
        let url = await ThumbnailService.getThumbnailUrl(frameUuid, true);
        console.log(`[useThumbnail] Initial URL fetch result:`, url);
        
        if (mountedRef.current) {
          if (url && ThumbnailService.isValidThumbnail(url)) {
            console.log(`[useThumbnail] Valid thumbnail found:`, url);
            setThumbnailUrl(url);
            setIsLoading(false);

            // Preload if requested
            if (preloadThumbnails) {
              ThumbnailService.preloadThumbnail(url)
                .then(() => console.log(`[useThumbnail] Thumbnail preloaded successfully`))
                .catch(err => console.warn(`[useThumbnail] Preload failed:`, err.message));
            }
          } else {
            console.log(`[useThumbnail] No valid thumbnail found`);
            
            // Set placeholder immediately
            const placeholderUrl = ThumbnailService.getPlaceholderUrl(frameType);
            setThumbnailUrl(placeholderUrl);
            setIsLoading(false);

            // Auto-generate if requested and no valid thumbnail exists
            if (autoGenerate) {
              console.log(`[useThumbnail] Auto-generating thumbnail for ${frameUuid}`);
              setTimeout(() => {
                if (mountedRef.current) {
                  generateThumbnail();
                }
              }, 100); // Small delay to avoid race conditions
            }
          }
        }

      } catch (err) {
        console.error(`[useThumbnail] Error initializing thumbnail for ${frameUuid}:`, err);
        if (mountedRef.current) {
          setError(err.message);
          setThumbnailUrl(ThumbnailService.getPlaceholderUrl(frameType));
          setIsLoading(false);
        }
      }
    };

    initializeThumbnail();

    // Cleanup function
    return () => {
      initializationRef.current = false;
    };
  }, [frameUuid, frameType, autoGenerate, preloadThumbnails]);

  // Subscribe to thumbnail updates
  useEffect(() => {
    if (!frameUuid || !enableRealTimeUpdates || !mountedRef.current) return;

    console.log(`[useThumbnail] Setting up real-time updates for ${frameUuid}`);

    const unsubscribe = ThumbnailService.subscribeThumbnailUpdates(frameUuid, (data) => {
      if (!mountedRef.current) return;

      console.log(`[useThumbnail] Received update for ${frameUuid}:`, data);

      if (data.success && data.thumbnail_url) {
        const isValid = ThumbnailService.isValidThumbnail(data.thumbnail_url);
        console.log(`[useThumbnail] Update thumbnail validity:`, isValid);

        if (isValid) {
          setThumbnailUrl(data.thumbnail_url);
          setLastGenerated(data.generated_at);
          setIsGenerating(false);
          setError(null);
          setRetryCount(0);

          // Preload new thumbnail
          if (preloadThumbnails) {
            ThumbnailService.preloadThumbnail(data.thumbnail_url)
              .catch(console.warn);
          }
        }
      } else if (data.error) {
        console.error(`[useThumbnail] Update error for ${frameUuid}:`, data.error);
        setError(data.error);
        setIsGenerating(false);
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [frameUuid, enableRealTimeUpdates, preloadThumbnails]);

  // Generate thumbnail manually with retry logic
  const generateThumbnail = useCallback(async () => {
    if (!frameUuid) {
      console.warn(`[useThumbnail] Cannot generate - no frameUuid`);
      return;
    }

    if (isGenerating) {
      console.warn(`[useThumbnail] Already generating thumbnail for ${frameUuid}`);
      return;
    }

    try {
      console.log(`[useThumbnail] Starting thumbnail generation for ${frameUuid} (attempt ${retryCount + 1})`);
      setIsGenerating(true);
      setError(null);

      const result = await ThumbnailService.generateThumbnail(frameUuid);
      
      if (result.success && mountedRef.current) {
        console.log(`[useThumbnail] Generation successful:`, result.thumbnail_url);
        
        const isValid = ThumbnailService.isValidThumbnail(result.thumbnail_url);
        if (isValid) {
          setThumbnailUrl(result.thumbnail_url);
          setLastGenerated(result.generated_at);
          setRetryCount(0);
        } else {
          console.warn(`[useThumbnail] Generated thumbnail URL not valid:`, result.thumbnail_url);
          throw new Error('Generated thumbnail URL is not valid');
        }
      } else if (!result.success) {
        throw new Error(result.message || 'Thumbnail generation failed');
      }

      return result;

    } catch (err) {
      console.error(`[useThumbnail] Generation failed for ${frameUuid}:`, err);
      
      if (mountedRef.current) {
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        
        if (newRetryCount < maxRetries) {
          console.log(`[useThumbnail] Scheduling retry ${newRetryCount}/${maxRetries} in 2 seconds`);
          
          // Schedule retry with exponential backoff
          setTimeout(() => {
            if (mountedRef.current && !isGenerating) {
              generateThumbnail();
            }
          }, 2000 * newRetryCount);
        } else {
          console.error(`[useThumbnail] Max retries reached for ${frameUuid}`);
          setError(`Failed to generate thumbnail after ${maxRetries} attempts`);
        }
      }
      
      throw err;
    } finally {
      if (mountedRef.current) {
        setIsGenerating(false);
      }
    }
  }, [frameUuid, isGenerating, retryCount, maxRetries]);

  // Generate thumbnail from canvas components
  const generateFromCanvas = useCallback(async (canvasComponents, canvasSettings = {}) => {
    if (!frameUuid || !canvasComponents) {
      console.warn(`[useThumbnail] Cannot generate from canvas - missing frameUuid or components`);
      return;
    }

    try {
      console.log(`[useThumbnail] Generating from canvas for ${frameUuid}:`, canvasComponents.length, 'components');
      setIsGenerating(true);
      setError(null);

      const result = await ThumbnailService.generateThumbnailFromCanvas(
        frameUuid, 
        canvasComponents, 
        canvasSettings
      );
      
      if (result.success && mountedRef.current) {
        console.log(`[useThumbnail] Canvas generation successful:`, result.thumbnail_url);
        
        if (ThumbnailService.isValidThumbnail(result.thumbnail_url)) {
          setThumbnailUrl(result.thumbnail_url);
          setLastGenerated(result.generated_at);
          setRetryCount(0);
        }
      }

      return result;

    } catch (err) {
      console.error(`[useThumbnail] Canvas generation failed for ${frameUuid}:`, err);
      if (mountedRef.current) {
        setError(err.message);
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setIsGenerating(false);
      }
    }
  }, [frameUuid]);

  // Schedule canvas thumbnail update (debounced)
  const scheduleCanvasUpdate = useCallback((canvasComponents, canvasSettings = {}) => {
    if (!frameUuid || !canvasComponents || canvasComponents.length === 0) {
      console.log(`[useThumbnail] Skipping canvas update - no frameUuid or components`);
      return;
    }

    console.log(`[useThumbnail] Scheduling canvas update for ${frameUuid}`);
    setIsGenerating(true);
    
    return ThumbnailService.scheduleCanvasThumbnailUpdate(frameUuid, canvasComponents, canvasSettings)
      .then((result) => {
        if (result?.success && mountedRef.current) {
          console.log(`[useThumbnail] Scheduled update successful:`, result.thumbnail_url);
          
          if (ThumbnailService.isValidThumbnail(result.thumbnail_url)) {
            setThumbnailUrl(result.thumbnail_url);
            setLastGenerated(result.generated_at);
            setRetryCount(0);
          }
        }
      })
      .catch((err) => {
        console.error(`[useThumbnail] Scheduled update failed for ${frameUuid}:`, err);
        if (mountedRef.current) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (mountedRef.current) {
          setIsGenerating(false);
        }
      });
  }, [frameUuid]);

  // Refresh thumbnail status
  const refreshThumbnail = useCallback(async () => {
    if (!frameUuid) return;

    try {
      console.log(`[useThumbnail] Refreshing thumbnail status for ${frameUuid}`);
      setIsLoading(true);
      setError(null);
      setRetryCount(0);

      // Force fresh fetch
      ThumbnailService.clearCache(frameUuid);
      const status = await ThumbnailService.getThumbnailStatus(frameUuid);
      
      if (status && mountedRef.current) {
        console.log(`[useThumbnail] Refresh status result:`, status);
        
        if (status.thumbnail_url && ThumbnailService.isValidThumbnail(status.thumbnail_url)) {
          setThumbnailUrl(status.thumbnail_url);
          setLastGenerated(status.generated_at);
        } else {
          // No valid thumbnail, use placeholder
          setThumbnailUrl(ThumbnailService.getPlaceholderUrl(frameType));
        }
      }

    } catch (err) {
      console.error(`[useThumbnail] Refresh failed for ${frameUuid}:`, err);
      if (mountedRef.current) {
        setError(err.message);
        setThumbnailUrl(ThumbnailService.getPlaceholderUrl(frameType));
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [frameUuid, frameType]);

  // Clear cache
  const clearCache = useCallback(() => {
    if (frameUuid) {
      console.log(`[useThumbnail] Clearing cache for ${frameUuid}`);
      ThumbnailService.clearCache(frameUuid);
      setRetryCount(0);
    }
  }, [frameUuid]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Check if thumbnail is valid
  const isValidThumbnail = ThumbnailService.isValidThumbnail(thumbnailUrl);

  return {
    thumbnailUrl,
    isLoading,
    isGenerating: isGenerating || ThumbnailService.isGenerating(frameUuid),
    error,
    lastGenerated,
    retryCount,
    
    // Actions
    generateThumbnail,
    generateFromCanvas,
    scheduleCanvasUpdate,
    refreshThumbnail,
    clearCache,
    
    // Utilities
    isValidThumbnail,
    placeholderUrl: ThumbnailService.getPlaceholderUrl(frameType),
    
    // Debug info
    debug: {
      frameUuid,
      frameType,
      rawThumbnailUrl: thumbnailUrl,
      isValidCheck: isValidThumbnail,
      serviceCache: ThumbnailService.cache.has(frameUuid) ? ThumbnailService.cache.get(frameUuid) : null
    }
  };
}