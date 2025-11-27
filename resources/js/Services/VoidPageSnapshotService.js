/**
 * VoidPageSnapshotService
 * 
 * High-fidelity offscreen rendering service for capturing entire Void Page UI
 * Similar to Framer's approach - renders the complete page in a hidden container
 * then captures as a high-quality image.
 */

export class VoidPageSnapshotService {
  /**
   * Generate a high-fidelity snapshot of the entire Void Page
   * 
   * @param {string} projectId - Project UUID
   * @param {Object} options - Snapshot options
   * @returns {Promise<Object>} - {dataUrl, width, height, timestamp}
   */
  static async generateVoidPageSnapshot(projectId, options = {}) {
    const {
      width = 1600,
      height = 1000,
      scale = 2, // Render at 2x for high quality, then scale down
      quality = 0.95,
      waitForRender = 2000, // Wait 2 seconds for components to fully render
    } = options;

    try {
      console.log('🎬 [VoidSnapshot] Starting high-fidelity Void page snapshot for project:', projectId);

      // Step 1: Create offscreen container
      const offscreenContainer = this.createOffscreenContainer(width * scale, height * scale);
      
      // Step 2: Clone and mount Void Page into offscreen container
      await this.mountVoidPageOffscreen(offscreenContainer, projectId);
      
      // Step 3: Wait for render and layout
      console.log('⏳ [VoidSnapshot] Waiting for components to render...');
      await this.waitForRender(waitForRender);
      
      // Step 4: Capture the rendered output
      console.log('📸 [VoidSnapshot] Capturing rendered output...');
      const canvas = await this.captureOffscreenContainer(offscreenContainer, width, height, scale);
      
      // Step 5: Clean up offscreen container
      this.cleanupOffscreenContainer(offscreenContainer);
      
      // Step 6: Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      
      console.log('✅ [VoidSnapshot] High-fidelity snapshot generated!', {
        width: canvas.width,
        height: canvas.height,
        dataUrlLength: dataUrl.length
      });

      return {
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('❌ [VoidSnapshot] Snapshot generation failed:', error);
      throw error;
    }
  }

  /**
   * Create an offscreen container for rendering
   */
  static createOffscreenContainer(width, height) {
    console.log('🔧 [VoidSnapshot] Creating offscreen container:', { width, height });
    
    const container = document.createElement('div');
    container.id = 'void-snapshot-offscreen-container';
    container.style.cssText = `
      position: fixed;
      top: -99999px;
      left: -99999px;
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      z-index: -9999;
      pointer-events: none;
      visibility: hidden;
      opacity: 0;
    `;
    
    document.body.appendChild(container);
    return container;
  }

  /**
   * Mount Void Page content into offscreen container
   */
  static async mountVoidPageOffscreen(container, projectId) {
    console.log('🔧 [VoidSnapshot] Mounting Void Page content offscreen');
    
    // Find the main Void page container
    const voidPageElement = document.querySelector('[data-canvas="true"]');
    
    if (!voidPageElement) {
      throw new Error('Void page element [data-canvas="true"] not found');
    }

    // Clone the entire Void page element
    const clonedVoidPage = voidPageElement.cloneNode(true);
    
    // Remove excluded elements from clone
    const excludeSelectors = [
      '.header',
      '[class*="Header"]',
      '[class*="header"]',
      '[class*="Panel"]',
      '[class*="panel"]',
      '.floating-toolbox',
      '[class*="FloatingToolbox"]',
      '.delete-button',
      '[class*="DeleteButton"]',
      '.infinite-grid',
      '[class*="InfiniteGrid"]',
      '[data-exclude-snapshot="true"]',
      'header',
      'nav',
      'aside',
    ];

    excludeSelectors.forEach(selector => {
      const elements = clonedVoidPage.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // Remove grid background classes/styles
    clonedVoidPage.querySelectorAll('[class*="grid"]').forEach(el => {
      if (el.classList.toString().toLowerCase().includes('grid')) {
        el.style.backgroundImage = 'none';
        el.style.background = 'none';
      }
    });

    // Apply full dimensions to cloned element
    clonedVoidPage.style.width = container.style.width;
    clonedVoidPage.style.height = container.style.height;
    clonedVoidPage.style.position = 'relative';
    clonedVoidPage.style.overflow = 'hidden';
    
    // Mount to container
    container.appendChild(clonedVoidPage);
    
    // Debug: Check what we actually captured
    const capturedFrames = clonedVoidPage.querySelectorAll('[data-frame-id]');
    console.log('✅ [VoidSnapshot] Void Page content mounted to offscreen container');
    console.log(`🔍 [VoidSnapshot] DEBUG: Found ${capturedFrames.length} frames in cloned container`);
    
    if (capturedFrames.length === 0) {
      console.warn('⚠️ [VoidSnapshot] No frames found! Checking original...');
      const originalFrames = voidPageElement.querySelectorAll('[data-frame-id]');
      console.log(`🔍 [VoidSnapshot] Original has ${originalFrames.length} frames`);
      console.log('🔍 [VoidSnapshot] Cloned element structure:', clonedVoidPage.outerHTML.substring(0, 500));
    }
  }

  /**
   * Wait for render to complete
   */
  static waitForRender(ms) {
    return new Promise(resolve => {
      // Force layout reflow
      document.body.offsetHeight;
      
      // Use requestAnimationFrame to ensure paint cycle completes
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(resolve, ms);
        });
      });
    });
  }

  /**
   * Capture the offscreen container as a canvas
   * FIXED: Capture LIVE frames from the actual DOM, not cloned container
   */
  static async captureOffscreenContainer(container, targetWidth, targetHeight, scale) {
    console.log('📸 [VoidSnapshot] Capturing offscreen container to canvas');
    
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { alpha: false });

    // IMPORTANT: Get frames from the LIVE DOM, not the cloned container
    // Because React components don't clone properly with cloneNode()
    const liveVoidPage = document.querySelector('[data-canvas="true"]');
    
    if (!liveVoidPage) {
      throw new Error('Live Void page element not found');
    }

    // Method 1: Capture from live DOM
    try {
      // Draw background
      const computedStyle = window.getComputedStyle(liveVoidPage);
      const bgColor = computedStyle.backgroundColor;
      
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
        ctx.fillStyle = bgColor;
      } else {
        // Default Void page background
        ctx.fillStyle = '#0f172a';
      }
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Draw frames from the LIVE Void page (React-rendered)
      const frames = liveVoidPage.querySelectorAll('[data-frame-id]');
      console.log(`🖼️ [VoidSnapshot] Found ${frames.length} frames to render from LIVE DOM`);

      // Calculate container offset for positioning
      const containerRect = liveVoidPage.getBoundingClientRect();

      frames.forEach((frame, index) => {
        try {
          const frameRect = frame.getBoundingClientRect();
          
          // Calculate position relative to container
          const x = (frameRect.left - containerRect.left) / scale;
          const y = (frameRect.top - containerRect.top) / scale;
          const w = frameRect.width / scale;
          const h = frameRect.height / scale;

          // Get frame styles
          const frameStyle = window.getComputedStyle(frame);
          const frameBg = frameStyle.backgroundColor;
          const frameBorder = frameStyle.borderColor;

          // Draw frame background
          if (frameBg && frameBg !== 'rgba(0, 0, 0, 0)') {
            ctx.fillStyle = frameBg;
          } else {
            ctx.fillStyle = '#ffffff';
          }
          ctx.fillRect(x, y, w, h);

          // Draw frame border
          ctx.strokeStyle = frameBorder || '#e5e7eb';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, w, h);

          // Draw frame content (components) if any
          const components = frame.querySelectorAll('[data-component-id]');
          components.forEach(comp => {
            const compRect = comp.getBoundingClientRect();
            const compX = (compRect.left - containerRect.left) / scale;
            const compY = (compRect.top - containerRect.top) / scale;
            const compW = compRect.width / scale;
            const compH = compRect.height / scale;

            const compStyle = window.getComputedStyle(comp);
            const compBg = compStyle.backgroundColor;

            if (compBg && compBg !== 'rgba(0, 0, 0, 0)') {
              ctx.fillStyle = compBg;
              ctx.fillRect(compX, compY, compW, compH);
            }

            // Draw component border
            ctx.strokeStyle = compStyle.borderColor || '#d1d5db';
            ctx.lineWidth = 1;
            ctx.strokeRect(compX, compY, compW, compH);
          });

          // Draw frame name
          const frameName = frame.querySelector('h2')?.textContent || 
                          frame.querySelector('.frame-title')?.textContent ||
                          frame.getAttribute('data-frame-name') ||
                          `Frame ${index + 1}`;
          
          ctx.fillStyle = '#1f2937';
          ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText(frameName, x + 12, y + 28);

        } catch (err) {
          console.warn(`⚠️ [VoidSnapshot] Failed to render frame ${index}:`, err);
        }
      });

      console.log('✅ [VoidSnapshot] Canvas rendering complete');
      return canvas;

    } catch (error) {
      console.error('❌ [VoidSnapshot] Canvas rendering failed:', error);
      throw error;
    }
  }

  /**
   * Clean up offscreen container
   */
  static cleanupOffscreenContainer(container) {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      console.log('🧹 [VoidSnapshot] Offscreen container cleaned up');
    }
  }

  /**
   * Upload snapshot to backend
   */
  static async uploadSnapshot(projectId, dataUrl) {
    try {
      console.log('⬆️ [VoidSnapshot] Uploading snapshot for project:', projectId);

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      console.log('📦 [VoidSnapshot] Blob created:', {
        size: (blob.size / 1024).toFixed(2) + 'KB',
        type: blob.type
      });

      // Create form data - backend expects 'snapshot' not 'thumbnail'
      const formData = new FormData();
      formData.append('snapshot', blob, `project-${projectId}-snapshot.jpg`);
      formData.append('method', 'offscreen_rendering');

      // Upload to backend
      const uploadResponse = await fetch(`/api/projects/${projectId}/thumbnail/snapshot`, {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin', // Include cookies for Sanctum auth
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status ${uploadResponse.status}`);
      }

      const result = await uploadResponse.json();
      console.log('✅ [VoidSnapshot] Upload successful:', result);

      return result;

    } catch (error) {
      console.error('❌ [VoidSnapshot] Upload failed:', error);
      throw error;
    }
  }

  /**
   * Generate and upload snapshot (complete workflow)
   */
  static async generateAndUpload(projectId, options = {}) {
    try {
      console.log('🚀 [VoidSnapshot] Starting complete snapshot workflow for project:', projectId);

      // Generate snapshot
      const snapshot = await this.generateVoidPageSnapshot(projectId, options);

      // Upload to backend
      const uploadResult = await this.uploadSnapshot(projectId, snapshot.dataUrl);

      console.log('🎉 [VoidSnapshot] COMPLETE! Project thumbnail updated successfully');

      return {
        ...snapshot,
        uploadResult,
        thumbnailUrl: uploadResult.thumbnail_url
      };

    } catch (error) {
      console.error('❌ [VoidSnapshot] Complete workflow failed:', error);
      throw error;
    }
  }
}

export default VoidPageSnapshotService;
