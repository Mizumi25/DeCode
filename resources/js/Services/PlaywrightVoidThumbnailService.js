/**
 * Playwright-first VoidPage Thumbnail Service
 * 
 * Attempts to generate thumbnails using server-side Playwright rendering,
 * falling back to client-side canvas rendering if Playwright fails.
 * 
 * This provides:
 * 1. High-fidelity screenshots with actual browser rendering (PRIMARY)
 * 2. Fallback to canvas-based rendering for reliability (FALLBACK)
 */

import axios from 'axios';
import { VoidPageSnapshotService } from './VoidPageSnapshotService';

export class PlaywrightVoidThumbnailService {
  /**
   * Generate thumbnail using Playwright with automatic fallback
   * 
   * @param {string} projectId - UUID of the project
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - Result with success status and thumbnail URL
   */
  static async generateWithFallback(projectId, options = {}) {
    const {
      width = 1600,
      height = 1000,
      quality = 90,
      waitTime = 3000,
      onPlaywrightAttempt = null,
      onPlaywrightSuccess = null,
      onPlaywrightFailure = null,
      onFallbackAttempt = null,
      onFallbackSuccess = null,
      onFallbackFailure = null,
    } = options;

    // Starting thumbnail generation
    const logData = {
      projectId,
      method: 'playwright_with_fallback',
      dimensions: `${width}x${height}`,
    };

    // STEP 1: Try Playwright (PRIMARY METHOD)
    try {
      if (onPlaywrightAttempt) {
        onPlaywrightAttempt();
      }

      // Attempting Playwright generation

      const playwrightResult = await axios.post(
        `/api/projects/${projectId}/thumbnail/playwright`,
        {
          width,
          height,
          quality,
          wait_time: waitTime,
        },
        {
          timeout: 60000, // 60 second timeout for Playwright
        }
      );

      if (playwrightResult.data.success) {
        // Playwright generation successful

        if (onPlaywrightSuccess) {
          onPlaywrightSuccess(playwrightResult.data);
        }

        return {
          success: true,
          method: 'playwright',
          thumbnailUrl: playwrightResult.data.thumbnail_url,
          data: playwrightResult.data,
        };
      }
    } catch (error) {
      console.warn('⚠️ [PlaywrightVoidThumbnail] Playwright generation failed:', error.message);

      if (onPlaywrightFailure) {
        onPlaywrightFailure(error);
      }

      // Check if server explicitly requested fallback
      const fallbackRequired = error.response?.data?.fallback_required;
      const fallbackReason = error.response?.data?.method || 'unknown_error';

      // Fallback required
      const fallbackInfo = {
        fallbackRequired,
        reason: fallbackReason,
        status: error.response?.status,
      });
    }

    // STEP 2: Fallback to Canvas Rendering (FALLBACK METHOD)
    try {
      if (onFallbackAttempt) {
        onFallbackAttempt();
      }

      // Falling back to canvas rendering

      const canvasResult = await VoidPageSnapshotService.generateAndUpload(projectId, {
        width,
        height,
        scale: 2,
        quality: quality / 100,
        waitForRender: waitTime,
      });

      if (canvasResult.success) {
        // Canvas fallback successful

        if (onFallbackSuccess) {
          onFallbackSuccess(canvasResult);
        }

        return {
          success: true,
          method: 'canvas_fallback',
          thumbnailUrl: canvasResult.thumbnailUrl,
          data: canvasResult,
        };
      }
    } catch (error) {
      console.error('❌ [PlaywrightVoidThumbnail] Canvas fallback failed:', error);

      if (onFallbackFailure) {
        onFallbackFailure(error);
      }

      return {
        success: false,
        method: 'all_failed',
        error: error.message,
      };
    }

    // Both methods failed
    console.error('❌ [PlaywrightVoidThumbnail] All thumbnail generation methods failed');
    return {
      success: false,
      method: 'all_failed',
      error: 'Both Playwright and Canvas methods failed',
    };
  }

  /**
   * Force canvas-only generation (skip Playwright)
   * Useful for testing or when Playwright is known to be unavailable
   */
  static async generateCanvasOnly(projectId, options = {}) {
    // Generating with canvas only (Playwright skipped)

    try {
      const canvasResult = await VoidPageSnapshotService.generateAndUpload(projectId, {
        width: options.width || 1600,
        height: options.height || 1000,
        scale: 2,
        quality: (options.quality || 90) / 100,
        waitForRender: options.waitTime || 3000,
      });

      return {
        success: canvasResult.success,
        method: 'canvas_only',
        thumbnailUrl: canvasResult.thumbnailUrl,
        data: canvasResult,
      };
    } catch (error) {
      console.error('❌ [PlaywrightVoidThumbnail] Canvas-only generation failed:', error);
      return {
        success: false,
        method: 'canvas_only_failed',
        error: error.message,
      };
    }
  }

  /**
   * Force Playwright-only generation (no fallback)
   * Useful for testing or when canvas rendering is not desired
   */
  static async generatePlaywrightOnly(projectId, options = {}) {
    // Generating with Playwright only (no fallback)

    try {
      const playwrightResult = await axios.post(
        `/api/projects/${projectId}/thumbnail/playwright`,
        {
          width: options.width || 1600,
          height: options.height || 1000,
          quality: options.quality || 90,
          wait_time: options.waitTime || 3000,
        },
        {
          timeout: 60000,
        }
      );

      if (playwrightResult.data.success) {
        return {
          success: true,
          method: 'playwright_only',
          thumbnailUrl: playwrightResult.data.thumbnail_url,
          data: playwrightResult.data,
        };
      }

      return {
        success: false,
        method: 'playwright_only_failed',
        error: playwrightResult.data.message,
      };
    } catch (error) {
      console.error('❌ [PlaywrightVoidThumbnail] Playwright-only generation failed:', error);
      return {
        success: false,
        method: 'playwright_only_failed',
        error: error.message,
      };
    }
  }

  /**
   * Check if Playwright is available on the server
   */
  static async checkPlaywrightAvailability() {
    try {
      const response = await axios.get('/api/thumbnails/playwright-status');
      return response.data.available || false;
    } catch (error) {
      console.warn('⚠️ [PlaywrightVoidThumbnail] Could not check Playwright availability:', error.message);
      return false;
    }
  }
}

export default PlaywrightVoidThumbnailService;
