// @/Services/ThumbnailService.js - FIXED for SVG thumbnails
import axios from 'axios';

export class ThumbnailService {
  static pendingGenerations = new Map();
  static listeners = new Map();
  static cache = new Map();
  
  /**
   * Generate thumbnail for a frame
   */
  static async generateThumbnail(frameUuid) {
    try {
      // Prevent duplicate requests
      if (this.pendingGenerations.has(frameUuid)) {
        return this.pendingGenerations.get(frameUuid);
      }

      console.log(`[ThumbnailService] Starting generation for frame: ${frameUuid}`);

      const request = axios.post(`/api/frames/${frameUuid}/thumbnail`, {
        generate_thumbnail: true
      });

      this.pendingGenerations.set(frameUuid, request);

      const response = await request;
      
      // Clear pending request
      this.pendingGenerations.delete(frameUuid);
      
      console.log(`[ThumbnailService] Generation response:`, response.data);
      
      if (response.data.success) {
        const thumbnailData = {
          url: response.data.thumbnail_url,
          generated_at: response.data.generated_at,
          version: this.extractVersionFromUrl(response.data.thumbnail_url) || Date.now(),
          method: response.data.method || 'unknown'
        };

        // Update cache
        this.cache.set(frameUuid, thumbnailData);

        // Notify listeners
        this.notifyListeners(frameUuid, response.data);
        
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to generate thumbnail');

    } catch (error) {
      this.pendingGenerations.delete(frameUuid);
      console.error(`Thumbnail generation failed for frame ${frameUuid}:`, error);
      throw error;
    }
  }

  /**
   * Get thumbnail status and URL - ENHANCED for better error handling
   */
  static async getThumbnailStatus(frameUuid) {
    try {
      console.log(`[ThumbnailService] Getting status for frame: ${frameUuid}`);
      
      const response = await axios.get(`/api/frames/${frameUuid}/thumbnail/status`);
      
      console.log(`[ThumbnailService] Status response:`, response.data);
      
      if (response.data.success) {
        // Update cache
        if (response.data.thumbnail_url) {
          this.cache.set(frameUuid, {
            url: response.data.thumbnail_url,
            generated_at: response.data.generated_at,
            version: response.data.version || this.extractVersionFromUrl(response.data.thumbnail_url) || Date.now(),
            file_exists: response.data.file_exists,
            method: response.data.method
          });
        }
        
        return response.data;
      }

      return null;

    } catch (error) {
      console.error(`Failed to get thumbnail status for frame ${frameUuid}:`, error);
      return null;
    }
  }

  /**
   * Get cached thumbnail URL or fetch status - IMPROVED
   */
  static async getThumbnailUrl(frameUuid, useCache = true) {
    console.log(`[ThumbnailService] Getting thumbnail URL for ${frameUuid}, useCache: ${useCache}`);
    
    if (useCache && this.cache.has(frameUuid)) {
      const cached = this.cache.get(frameUuid);
      console.log(`[ThumbnailService] Found cached URL:`, cached.url);
      
      // Apply cache busting
      if (cached.url) {
        const version = cached.version || Date.now();
        const separator = cached.url.includes('?') ? '&' : '?';
        return `${cached.url}${separator}v=${version}`;
      }
      
      return cached.url;
    }

    console.log(`[ThumbnailService] No cache, fetching status...`);
    const status = await this.getThumbnailStatus(frameUuid);
    const url = status?.thumbnail_url || null;
    
    console.log(`[ThumbnailService] Status fetch result:`, url);
    return url;
  }

  /**
   * FIXED: Check if thumbnail URL is valid (properly handles SVG)
   */
  static isValidThumbnail(url) {
    if (!url) return false;
    
    console.log(`[ThumbnailService] Validating URL: ${url}`);
    
    // Check for placeholder patterns
    const placeholderPatterns = [
      '/api/placeholder/',
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9', // Generic placeholder
      'placeholder',
      'dummy',
      'example.com'
    ];
    
    // Return false if URL contains any placeholder patterns
    for (const pattern of placeholderPatterns) {
      if (url.includes(pattern)) {
        console.log(`[ThumbnailService] URL contains placeholder pattern: ${pattern}`);
        return false;
      }
    }
    
    // ENHANCED: Check for actual thumbnail file patterns - including SVG
    const validThumbnailPatterns = [
      '/storage/thumbnails/frames/', // Our primary thumbnail storage
      '.png',
      '.svg', // IMPORTANT: SVG support
      '.jpg',
      '.jpeg',
      '.webp'
    ];
    
    // Return true if URL contains any valid thumbnail patterns
    const isValid = validThumbnailPatterns.some(pattern => url.includes(pattern));
    console.log(`[ThumbnailService] URL validation result: ${isValid} for ${url}`);
    
    return isValid;
  }

  /**
   * Get thumbnail with fallback to placeholder - ENHANCED for SVG
   */
  static async getThumbnailUrlWithFallback(frameUuid, frameType = 'page') {
    try {
      console.log(`[ThumbnailService] Getting thumbnail with fallback for ${frameUuid}`);
      
      const url = await this.getThumbnailUrl(frameUuid);
      
      if (this.isValidThumbnail(url)) {
        // For SVG files, we don't need to verify accessibility via HEAD request
        // as some servers might not support it properly
        if (url.endsWith('.svg') || url.includes('.svg')) {
          console.log(`[ThumbnailService] SVG thumbnail found: ${url}`);
          return url;
        }
        
        // For raster images, optionally verify accessibility
        try {
          const response = await fetch(url, { method: 'HEAD' });
          if (response.ok) {
            console.log(`[ThumbnailService] Valid thumbnail verified: ${url}`);
            return url;
          } else {
            console.warn(`[ThumbnailService] Thumbnail URL not accessible: ${response.status}`);
          }
        } catch (fetchError) {
          console.warn(`[ThumbnailService] Failed to verify accessibility: ${fetchError.message}`);
          // Don't fail completely - still return the URL as it might work
          console.log(`[ThumbnailService] Returning unverified URL: ${url}`);
          return url;
        }
      }
      
      console.log(`[ThumbnailService] Using placeholder for ${frameUuid}`);
      return this.getPlaceholderUrl(frameType);
      
    } catch (error) {
      console.warn(`Failed to get thumbnail for ${frameUuid}, using placeholder:`, error.message);
      return this.getPlaceholderUrl(frameType);
    }
  }

  /**
   * Preload thumbnail images for better UX - ENHANCED for SVG
   */
  static preloadThumbnail(url) {
    if (!url) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
      if (url.endsWith('.svg') || url.includes('.svg')) {
        // For SVG, use fetch instead of Image() - but also try to validate it's actually an SVG
        fetch(url)
          .then(response => {
            if (response.ok) {
              // Check if content type is SVG
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('image/svg')) {
                console.log(`[ThumbnailService] SVG preloaded successfully: ${url}`);
                resolve(url);
              } else {
                // Try as regular image if it's not actually an SVG
                this.preloadAsImage(url).then(resolve).catch(reject);
              }
            } else {
              reject(new Error(`Failed to preload SVG: ${response.status}`));
            }
          })
          .catch(reject);
      } else {
        // For raster images, use traditional Image preloading
        this.preloadAsImage(url).then(resolve).catch(reject);
      }
    });
  }

  /**
   * Helper to preload as regular image
   */
  static preloadAsImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        console.log(`[ThumbnailService] Image preloaded successfully: ${url}`);
        resolve(url);
      };
      img.onerror = () => {
        reject(new Error(`Failed to preload image: ${url}`));
      };
      img.src = url;
    });
  }

  /**
   * Generate thumbnail URL with cache busting
   */
  static getThumbnailUrl(frameUuid) {
    const cached = this.cache.get(frameUuid);
    if (cached && cached.url) {
      const version = cached.version || Date.now();
      // Add or update version parameter
      const separator = cached.url.includes('?') ? '&' : '?';
      return `${cached.url}${separator}v=${version}&_cb=${Date.now()}`;
    }
    return null;
  }


  

  /**
   * Subscribe to thumbnail updates
   */
  static subscribeThumbnailUpdates(frameUuid, callback) {
    console.log(`[ThumbnailService] Subscribing to updates for frame: ${frameUuid}`);
    
    if (!this.listeners.has(frameUuid)) {
      this.listeners.set(frameUuid, new Set());
    }
    
    this.listeners.get(frameUuid).add(callback);

    // Return unsubscribe function
    return () => {
      const frameListeners = this.listeners.get(frameUuid);
      if (frameListeners) {
        frameListeners.delete(callback);
        if (frameListeners.size === 0) {
          this.listeners.delete(frameUuid);
        }
      }
      console.log(`[ThumbnailService] Unsubscribed from updates for frame: ${frameUuid}`);
    };
  }

  /**
   * Notify all listeners of thumbnail updates
   */
  static notifyListeners(frameUuid, data) {
    console.log(`[ThumbnailService] Notifying listeners for frame: ${frameUuid}`, data);
    
    const frameListeners = this.listeners.get(frameUuid);
    if (frameListeners) {
      frameListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Thumbnail listener error:', error);
        }
      });
    }
  }

  /**
   * Handle broadcast thumbnail updates
   */
  static handleBroadcastUpdate(data) {
    if (data.type === 'thumbnail_generated' && data.frame_uuid) {
      const frameUuid = data.frame_uuid;
      
      console.log(`[ThumbnailService] Handling broadcast update for frame: ${frameUuid}`, data);
      
      // Update cache
      this.cache.set(frameUuid, {
        url: data.thumbnail_url,
        generated_at: data.generated_at,
        version: this.extractVersionFromUrl(data.thumbnail_url) || Date.now(),
        broadcast: true
      });

      // Notify listeners
      this.notifyListeners(frameUuid, {
        success: true,
        thumbnail_url: data.thumbnail_url,
        generated_at: data.generated_at,
        broadcast: true
      });
    }
  }

  /**
   * Clear cache for a frame
   */
  static clearCache(frameUuid) {
    this.cache.delete(frameUuid);
    console.log(`[ThumbnailService] Cache cleared for frame: ${frameUuid}`);
  }

  /**
   * Clear all caches
   */
  static clearAllCaches() {
    this.cache.clear();
    console.log(`[ThumbnailService] All caches cleared`);
  }

  /**
   * Get thumbnail loading state
   */
  static isGenerating(frameUuid) {
    return this.pendingGenerations.has(frameUuid);
  }

  /**
   * Extract version number from thumbnail URL
   */
  static extractVersionFromUrl(url) {
    if (!url) return null;
    const match = url.match(/[?&]v=(\d+)/);
    return match ? match[1] : null;
  }

  /**
   * Get placeholder thumbnail URL for loading states - ENHANCED
   */
  static getPlaceholderUrl(frameType = 'page') {
    // Use better placeholder URLs that actually work
    const placeholders = {
      page: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="320" height="224" xmlns="http://www.w3.org/2000/svg">
          <rect width="320" height="224" fill="#f8fafc"/>
          <rect x="0" y="0" width="320" height="32" fill="#e5e7eb"/>
          <circle cx="16" cy="16" r="4" fill="#ef4444"/>
          <circle cx="32" cy="16" r="4" fill="#f59e0b"/>
          <circle cx="48" cy="16" r="4" fill="#10b981"/>
          <rect x="24" y="56" width="272" height="12" rx="6" fill="#3b82f6"/>
          <rect x="24" y="80" width="200" height="8" rx="4" fill="#6b7280"/>
          <text x="160" y="140" font-family="Arial" font-size="12" fill="#9ca3af" text-anchor="middle">Loading Preview...</text>
        </svg>
      `),
      component: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="320" height="224" xmlns="http://www.w3.org/2000/svg">
          <rect width="320" height="224" fill="#ffffff" stroke="#e2e8f0" rx="12"/>
          <rect x="8" y="8" width="304" height="208" fill="none" stroke="#3b82f6" stroke-width="2" stroke-dasharray="8,4" rx="8"/>
          <rect x="24" y="24" width="120" height="16" rx="8" fill="#1f2937"/>
          <text x="160" y="140" font-family="Arial" font-size="12" fill="#9ca3af" text-anchor="middle">Component Preview</text>
        </svg>
      `)
    };
    
    return placeholders[frameType] || placeholders.page;
  }

  /**
   * Force refresh thumbnail by clearing cache and regenerating
   */
  static async forceRefresh(frameUuid) {
    console.log(`[ThumbnailService] Force refreshing thumbnail for: ${frameUuid}`);
    
    // Clear cache first
    this.clearCache(frameUuid);
    
    // Generate new thumbnail
    return this.generateThumbnail(frameUuid);
  }

  /**
   * Debounce utility function
   */
  static debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func(...args);
    };
  }

  /**
   * Generate thumbnail from canvas state
   */
  static async generateThumbnailFromCanvas(frameUuid, canvasComponents, canvasSettings = {}) {
    try {
      console.log(`[ThumbnailService] Generating from canvas for ${frameUuid}:`, canvasComponents.length, 'components');
      
      const payload = {
        canvas_components: canvasComponents,
        canvas_settings: canvasSettings,
        viewport: canvasSettings.viewport || { width: 1440, height: 900 },
        background_color: canvasSettings.background_color || '#ffffff'
      };

      const response = await axios.post(`/api/frames/${frameUuid}/thumbnail/canvas`, payload);
      
      if (response.data.success) {
        // Update cache with new thumbnail
        this.cache.set(frameUuid, {
          url: response.data.thumbnail_url,
          generated_at: response.data.generated_at,
          version: this.extractVersionFromUrl(response.data.thumbnail_url) || Date.now(),
          components_count: response.data.components_count,
          method: 'canvas'
        });

        // Notify listeners
        this.notifyListeners(frameUuid, response.data);
        
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to generate thumbnail from canvas');

    } catch (error) {
      console.error(`Canvas thumbnail generation failed for frame ${frameUuid}:`, error);
      throw error;
    }
  }

  /**
   * Debounced thumbnail generation for real-time canvas updates
   */
  static debouncedGenerateFromCanvas = this.debounce((frameUuid, canvasComponents, canvasSettings) => {
    return this.generateThumbnailFromCanvas(frameUuid, canvasComponents, canvasSettings);
  }, 2000);

  /**
   * Schedule thumbnail generation based on canvas changes
   */
  static scheduleCanvasThumbnailUpdate(frameUuid, canvasComponents, canvasSettings = {}) {
    // Don't generate if no components
    if (!canvasComponents || canvasComponents.length === 0) {
      console.log(`[ThumbnailService] Skipping thumbnail update - no components`);
      return;
    }

    console.log(`[ThumbnailService] Scheduling canvas update for ${frameUuid}`);
    
    // Use debounced generation to prevent too many requests
    return this.debouncedGenerateFromCanvas(frameUuid, canvasComponents, canvasSettings);
  }
}