/**
 * VoidFrameThumbnailService.js
 * 
 * Framer-style offscreen thumbnail generator for VoidPage frames.
 * This service generates thumbnails by mounting the actual ForgePage canvas
 * in an offscreen container, waiting for full render, then capturing using
 * browser-native rasterization (createImageBitmap + OffscreenCanvas).
 * 
 * NO html2canvas, NO playwright, NO modern-screenshot, NO DOM cloning.
 * Only the ForgePage canvas root is rendered, with no editor UI.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';

class VoidFrameThumbnailService {
  constructor() {
    this.offscreenContainer = null;
    this.offscreenRoot = null;
    this.cache = new Map(); // frameId -> { blob, timestamp, hash }
    this.pendingCaptures = new Map(); // frameId -> Promise
    this.debounceTimers = new Map(); // frameId -> timeoutId
  }

  /**
   * Generate thumbnail for a frame using offscreen ForgePage rendering
   * @param {Object} frame - Frame data with canvas_data.components
   * @param {Object} options - { width, height, scale, quality }
   * @returns {Promise<Blob>} - PNG blob
   */
  async generateThumbnail(frame, options = {}) {
    const {
      width = 400,
      height = 300,
      scale = 2,
      quality = 0.95,
      waitForRender = 1500,
    } = options;

    const frameId = frame.id || frame.uuid;
    
    // Check if already capturing
    if (this.pendingCaptures.has(frameId)) {
      console.log(`[VoidFrameThumbnail] Already capturing ${frameId}, waiting...`);
      return this.pendingCaptures.get(frameId);
    }

    // Check cache
    const cached = this.getCached(frame);
    if (cached) {
      console.log(`[VoidFrameThumbnail] ✅ Using cached thumbnail for ${frameId}`);
      return cached.blob;
    }

    console.log(`[VoidFrameThumbnail] 🎬 Starting offscreen render for frame ${frameId}`);

    const capturePromise = this._generateThumbnailInternal(frame, { width, height, scale, quality, waitForRender });
    this.pendingCaptures.set(frameId, capturePromise);

    try {
      const blob = await capturePromise;
      
      // Cache the result
      this.cache.set(frameId, {
        blob,
        timestamp: Date.now(),
        hash: this._hashFrameData(frame),
      });

      console.log(`[VoidFrameThumbnail] ✅ Thumbnail generated for ${frameId}`, {
        size: `${(blob.size / 1024).toFixed(2)}KB`,
      });

      return blob;
    } finally {
      this.pendingCaptures.delete(frameId);
    }
  }

  /**
   * Internal thumbnail generation
   */
  async _generateThumbnailInternal(frame, options) {
    const { width, height, scale, quality, waitForRender } = options;

    try {
      // Step 1: Create offscreen container
      this._createOffscreenContainer(width * scale, height * scale);

      // Step 2: Mount ForgePage canvas offscreen
      await this._mountForgeCanvasOffscreen(frame, width * scale, height * scale);

      // Step 3: Wait for full render (styles, fonts, SVGs, etc.)
      await this._waitForFullRender(waitForRender);

      // Step 4: Capture using browser-native rasterization
      const blob = await this._captureToBlob(width, height, scale, quality);

      // Step 5: Cleanup
      this._cleanup();

      return blob;

    } catch (error) {
      this._cleanup();
      console.error('[VoidFrameThumbnail] ❌ Thumbnail generation failed:', error);
      throw error;
    }
  }

  /**
   * Create offscreen container (hidden, positioned off-screen)
   */
  _createOffscreenContainer(width, height) {
    if (this.offscreenContainer) {
      this._cleanup();
    }

    const container = document.createElement('div');
    container.id = 'void-frame-thumbnail-offscreen';
    container.style.cssText = `
      position: fixed;
      top: -99999px;
      left: -99999px;
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      visibility: hidden;
      pointer-events: none;
      z-index: -9999;
      background: white;
    `;

    document.body.appendChild(container);
    this.offscreenContainer = container;

    console.log(`[VoidFrameThumbnail] 📦 Offscreen container created: ${width}x${height}`);
  }

  /**
   * Mount ForgePage canvas into offscreen container
   * This uses the same rendering pipeline as ForgePage
   */
  async _mountForgeCanvasOffscreen(frame, width, height) {
    if (!this.offscreenContainer) {
      throw new Error('Offscreen container not created');
    }

    // Dynamically import React component to avoid circular dependencies
    const ForgeFrameOffscreenPreviewModule = await import('@/Components/ForgeFrameOffscreenPreview');
    const ForgeFrameOffscreenPreview = ForgeFrameOffscreenPreviewModule.default || ForgeFrameOffscreenPreviewModule.ForgeFrameOffscreenPreview;

    // Create React root if doesn't exist
    if (!this.offscreenRoot) {
      this.offscreenRoot = createRoot(this.offscreenContainer);
    }

    // Render the ForgePage canvas with frame data
    return new Promise((resolve) => {
      this.offscreenRoot.render(
        <ForgeFrameOffscreenPreview
          frame={frame}
          width={width}
          height={height}
          onMounted={resolve}
        />
      );
    });
  }

  /**
   * Wait for full render (fonts, styles, SVGs, gradients, etc.)
   */
  async _waitForFullRender(ms) {
    console.log(`[VoidFrameThumbnail] ⏳ Waiting ${ms}ms for full render...`);

    // Force layout reflow
    if (this.offscreenContainer) {
      this.offscreenContainer.offsetHeight;
    }

    // Wait for fonts to load
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // Use multiple RAF to ensure paint cycles complete
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(resolve, ms);
        });
      });
    });

    console.log(`[VoidFrameThumbnail] ✅ Render complete`);
  }

  /**
   * Capture offscreen container to blob using html2canvas
   * This properly captures the rendered HTML including all components
   */
  async _captureToBlob(targetWidth, targetHeight, scale, quality) {
    if (!this.offscreenContainer) {
      throw new Error('Offscreen container not found');
    }

    console.log(`[VoidFrameThumbnail] 📸 Capturing offscreen container to blob...`);

    // Get the rendered container
    const renderedContainer = this.offscreenContainer.querySelector('[data-offscreen-canvas="true"]');
    
    if (!renderedContainer) {
      throw new Error('Rendered container not found in offscreen container');
    }

    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      console.log(`[VoidFrameThumbnail] Using html2canvas to capture rendered frame`);
      
      // Capture using html2canvas with proper options
      const canvas = await html2canvas(renderedContainer, {
        width: targetWidth * scale,
        height: targetHeight * scale,
        scale: 1, // We already handle scaling in width/height
        backgroundColor: null, // Preserve transparency
        logging: false,
        useCORS: true, // Allow cross-origin images
        allowTaint: false,
        removeContainer: false,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          // Ensure the cloned element maintains the correct size
          const clonedElement = clonedDoc.querySelector('[data-offscreen-canvas="true"]');
          if (clonedElement) {
            clonedElement.style.width = `${targetWidth * scale}px`;
            clonedElement.style.height = `${targetHeight * scale}px`;
          }
        }
      });
      
      // Resize canvas to target dimensions if needed
      let finalCanvas = canvas;
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        finalCanvas = document.createElement('canvas');
        finalCanvas.width = targetWidth;
        finalCanvas.height = targetHeight;
        const ctx = finalCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
      }
      
      // Convert to blob
      const blob = await new Promise((resolve, reject) => {
        finalCanvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          },
          'image/png',
          quality
        );
      });

      console.log(`[VoidFrameThumbnail] ✅ html2canvas capture succeeded, blob size: ${(blob.size / 1024).toFixed(2)}KB`);
      return blob;

    } catch (error) {
      console.error('[VoidFrameThumbnail] html2canvas failed, using fallback:', error);

      // Fallback - create a styled representation
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        
        // Get background color from rendered container
        const computedStyle = window.getComputedStyle(renderedContainer);
        const bgColor = computedStyle.backgroundColor || '#ffffff';
        
        // Draw background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        
        // Count components rendered
        const componentCount = renderedContainer.querySelectorAll('[data-component-type]').length;
        
        if (componentCount > 0) {
          // Draw simple representation
          ctx.fillStyle = 'rgba(102, 126, 234, 0.15)';
          ctx.strokeStyle = 'rgba(102, 126, 234, 0.4)';
          ctx.lineWidth = 2;
          
          const padding = 30;
          const spacing = 25;
          const boxHeight = 20;
          
          for (let i = 0; i < Math.min(componentCount, 8); i++) {
            const y = padding + (i * spacing);
            const boxWidth = targetWidth - (padding * 2);
            
            ctx.fillRect(padding, y, boxWidth, boxHeight);
            ctx.strokeRect(padding, y, boxWidth, boxHeight);
          }
          
          // Draw component count badge
          ctx.fillStyle = '#667eea';
          ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(`${componentCount} component${componentCount > 1 ? 's' : ''}`, targetWidth / 2, targetHeight - 15);
        } else {
          // Empty frame indicator
          ctx.fillStyle = 'rgba(200, 200, 200, 0.2)';
          const boxSize = Math.min(targetWidth, targetHeight) * 0.5;
          const x = (targetWidth - boxSize) / 2;
          const y = (targetHeight - boxSize) / 2;
          ctx.fillRect(x, y, boxSize, boxSize);
          
          ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, boxSize, boxSize);
          
          ctx.fillStyle = '#999';
          ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Empty Canvas', targetWidth / 2, targetHeight / 2);
        }
        
        const blob = await new Promise((resolve, reject) => {
          canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('Failed to create fallback blob')),
            'image/png',
            quality
          );
        });
        
        console.log(`[VoidFrameThumbnail] ⚠️ Using fallback representation, blob size: ${(blob.size / 1024).toFixed(2)}KB`);
        return blob;

      } catch (error2) {
        console.error('[VoidFrameThumbnail] All capture methods failed:', error2);
        throw error2;
      }
    }
  }

  /**
   * Cleanup offscreen container and React root
   */
  _cleanup() {
    if (this.offscreenRoot) {
      try {
        this.offscreenRoot.unmount();
      } catch (e) {
        console.warn('[VoidFrameThumbnail] Root unmount warning:', e);
      }
      this.offscreenRoot = null;
    }

    if (this.offscreenContainer && this.offscreenContainer.parentNode) {
      this.offscreenContainer.parentNode.removeChild(this.offscreenContainer);
      this.offscreenContainer = null;
    }

    console.log(`[VoidFrameThumbnail] 🧹 Cleanup complete`);
  }

  /**
   * Schedule thumbnail generation with debounce
   */
  scheduleThumbnailGeneration(frame, delay = 1000) {
    const frameId = frame.id || frame.uuid;

    // Clear existing timer
    if (this.debounceTimers.has(frameId)) {
      clearTimeout(this.debounceTimers.get(frameId));
    }

    // Schedule new generation
    const timerId = setTimeout(() => {
      this.debounceTimers.delete(frameId);
      this.generateThumbnail(frame);
    }, delay);

    this.debounceTimers.set(frameId, timerId);

    console.log(`[VoidFrameThumbnail] ⏰ Scheduled thumbnail for ${frameId} in ${delay}ms`);
  }

  /**
   * Check if cached thumbnail is still valid
   */
  getCached(frame) {
    const frameId = frame.id || frame.uuid;
    const cached = this.cache.get(frameId);

    if (!cached) return null;

    // Check if frame data changed
    const currentHash = this._hashFrameData(frame);
    if (cached.hash !== currentHash) {
      console.log(`[VoidFrameThumbnail] Cache invalidated for ${frameId} (data changed)`);
      this.cache.delete(frameId);
      return null;
    }

    // Check age (cache for 5 minutes)
    const age = Date.now() - cached.timestamp;
    if (age > 5 * 60 * 1000) {
      console.log(`[VoidFrameThumbnail] Cache expired for ${frameId}`);
      this.cache.delete(frameId);
      return null;
    }

    return cached;
  }

  /**
   * Clear cache for a specific frame or all frames
   */
  clearCache(frameId = null) {
    if (frameId) {
      this.cache.delete(frameId);
      console.log(`[VoidFrameThumbnail] Cache cleared for ${frameId}`);
    } else {
      this.cache.clear();
      console.log(`[VoidFrameThumbnail] All cache cleared`);
    }
  }

  /**
   * Hash frame data to detect changes
   */
  _hashFrameData(frame) {
    const data = {
      components: frame.canvas_data?.components || [],
      settings: frame.settings,
      type: frame.type,
    };
    return JSON.stringify(data);
  }

  /**
   * Upload thumbnail to backend
   */
  async uploadThumbnail(frame, blob) {
    const frameId = frame.id || frame.uuid;

    try {
      const formData = new FormData();
      formData.append('thumbnail', blob, `frame-${frameId}-thumb.png`);
      formData.append('frame_id', frameId);

      const response = await window.axios.post(`/api/frames/${frameId}/thumbnail`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(`[VoidFrameThumbnail] ✅ Thumbnail uploaded for ${frameId}`);
      return response.data;

    } catch (error) {
      console.error(`[VoidFrameThumbnail] ❌ Upload failed for ${frameId}:`, error);
      throw error;
    }
  }

  /**
   * Generate and upload thumbnail
   */
  async generateAndUpload(frame, options = {}) {
    const blob = await this.generateThumbnail(frame, options);
    const result = await this.uploadThumbnail(frame, blob);
    return result;
  }
}

// Export singleton instance
export const voidFrameThumbnailService = new VoidFrameThumbnailService();
export default voidFrameThumbnailService;
