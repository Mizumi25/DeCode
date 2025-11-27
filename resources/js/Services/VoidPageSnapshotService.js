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
   * Capture the Void Page directly from the live DOM
   * Captures: Background, Frames Container, Preview Frames, Scroll Handler
   * Excludes: Header, Panels, Floating Toolbox, Delete Button, Grid overlays
   */
  static async captureOffscreenContainer(container, targetWidth, targetHeight, scale) {
    console.log('📸 [VoidSnapshot] Capturing Void Page to canvas');
    
    // Get the live Void page canvas element
    const liveVoidPage = document.querySelector('[data-canvas="true"]');
    
    if (!liveVoidPage) {
      throw new Error('Live Void page element [data-canvas="true"] not found');
    }

    // Find all frames in the DOM
    const frames = liveVoidPage.querySelectorAll('[data-frame-uuid]');
    console.log(`🖼️ [VoidSnapshot] Found ${frames.length} frames to capture`);

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { alpha: false });

    // Step 1: Draw the background
    await this.drawVoidBackground(ctx, liveVoidPage, targetWidth, targetHeight);

    // Step 2: If no frames, return background only
    if (frames.length === 0) {
      console.warn('⚠️ [VoidSnapshot] No frames found! Returning background snapshot only');
      return canvas;
    }

    // Step 3: Calculate viewport to capture all frames
    const viewport = this.calculateFramesViewport(frames, liveVoidPage);
    console.log('📐 [VoidSnapshot] Viewport:', viewport);

    // Step 4: Calculate scale to fit frames in target dimensions
    const fitScale = this.calculateFitScale(viewport, targetWidth, targetHeight);
    
    // Step 5: Center the content
    const offsetX = (targetWidth - (viewport.width * fitScale)) / 2;
    const offsetY = (targetHeight - (viewport.height * fitScale)) / 2;

    console.log('📐 [VoidSnapshot] Fit scale:', fitScale, 'Offset:', { offsetX, offsetY });

    // Step 6: Capture each frame with proper rendering
    await this.captureFrames(ctx, frames, viewport, liveVoidPage, fitScale, offsetX, offsetY);

    console.log('✅ [VoidSnapshot] Canvas rendering complete');
    return canvas;
  }

  /**
   * Draw the Void Page background (gradient or solid color)
   */
  static async drawVoidBackground(ctx, voidPageElement, width, height) {
    const computedStyle = window.getComputedStyle(voidPageElement);
    const bgColor = computedStyle.backgroundColor;
    const bgImage = computedStyle.backgroundImage;
    
    // Check if there's a gradient background
    if (bgImage && bgImage !== 'none') {
      // Try to extract gradient colors from background-image
      // For now, use default Void gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#0f172a'); // slate-900
      gradient.addColorStop(0.5, '#581c87'); // purple-900
      gradient.addColorStop(1, '#0f172a'); // slate-900
      ctx.fillStyle = gradient;
    } else if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
    } else {
      // Default dark gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.5, '#581c87');
      gradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = gradient;
    }
    
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Calculate viewport that encompasses all frames
   */
  static calculateFramesViewport(frames, containerElement) {
    const containerRect = containerElement.getBoundingClientRect();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    const frameData = [];
    frames.forEach((frameElement) => {
      const rect = frameElement.getBoundingClientRect();
      
      // Get frame position relative to the canvas container
      const frameX = rect.left - containerRect.left;
      const frameY = rect.top - containerRect.top;
      
      minX = Math.min(minX, frameX);
      minY = Math.min(minY, frameY);
      maxX = Math.max(maxX, frameX + rect.width);
      maxY = Math.max(maxY, frameY + rect.height);
      
      frameData.push({
        element: frameElement,
        x: frameX,
        y: frameY,
        width: rect.width,
        height: rect.height
      });
    });

    // Add padding around frames
    const padding = 50;
    return {
      x: Math.max(0, minX - padding),
      y: Math.max(0, minY - padding),
      width: (maxX - minX) + (padding * 2),
      height: (maxY - minY) + (padding * 2),
      frames: frameData
    };
  }

  /**
   * Calculate scale to fit viewport in target dimensions
   */
  static calculateFitScale(viewport, targetWidth, targetHeight) {
    const scaleX = targetWidth / viewport.width;
    const scaleY = targetHeight / viewport.height;
    return Math.min(scaleX, scaleY, 1); // Don't upscale beyond 1x
  }

  /**
   * Capture all frames onto the canvas
   */
  static async captureFrames(ctx, frames, viewport, containerElement, fitScale, offsetX, offsetY) {
    const containerRect = containerElement.getBoundingClientRect();

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      try {
        const rect = frame.getBoundingClientRect();
        
        // Calculate position relative to container
        const frameX = rect.left - containerRect.left;
        const frameY = rect.top - containerRect.top;
        
        // Calculate position in the snapshot canvas
        const canvasX = offsetX + ((frameX - viewport.x) * fitScale);
        const canvasY = offsetY + ((frameY - viewport.y) * fitScale);
        const canvasWidth = rect.width * fitScale;
        const canvasHeight = rect.height * fitScale;

        // Draw the frame using canvas API
        await this.drawFrameToCanvas(ctx, frame, canvasX, canvasY, canvasWidth, canvasHeight);
        
        console.log(`✅ [VoidSnapshot] Captured frame ${i + 1}/${frames.length} at (${canvasX.toFixed(0)}, ${canvasY.toFixed(0)})`);
      } catch (err) {
        console.warn(`⚠️ [VoidSnapshot] Failed to capture frame ${i}:`, err);
      }
    }
  }

  /**
   * Draw a single frame to canvas (without html2canvas)
   * Captures the actual rendered content by traversing the DOM
   */
  static async drawFrameToCanvas(ctx, frameElement, x, y, width, height) {
    // Save context state
    ctx.save();
    
    // Get frame styles
    const frameStyle = window.getComputedStyle(frameElement);
    
    // Draw frame background
    const bgColor = frameStyle.backgroundColor;
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
    } else {
      ctx.fillStyle = '#ffffff';
    }
    ctx.fillRect(x, y, width, height);
    
    // Draw frame border
    const borderColor = frameStyle.borderColor;
    const borderWidth = parseInt(frameStyle.borderWidth) || 1;
    if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
      ctx.strokeStyle = borderColor;
    } else {
      ctx.strokeStyle = '#e5e7eb';
    }
    ctx.lineWidth = Math.max(1, borderWidth * (width / frameElement.offsetWidth));
    ctx.strokeRect(x, y, width, height);
    
    // Draw frame shadow if present
    const boxShadow = frameStyle.boxShadow;
    if (boxShadow && boxShadow !== 'none') {
      // Simple shadow approximation
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
    }
    
    // Get frame title
    const titleElement = frameElement.querySelector('[class*="frame-title"], h2, h3, .title');
    if (titleElement) {
      const title = titleElement.textContent || '';
      if (title) {
        ctx.fillStyle = '#1f2937';
        ctx.font = `${Math.max(12, height * 0.03)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.fillText(title, x + (width * 0.05), y + (height * 0.08));
      }
    }
    
    // Draw iframe content if present
    const iframe = frameElement.querySelector('iframe');
    if (iframe) {
      // Draw a representation of the iframe
      ctx.fillStyle = '#f3f4f6';
      const iframeX = x + (width * 0.05);
      const iframeY = y + (height * 0.15);
      const iframeW = width * 0.9;
      const iframeH = height * 0.8;
      ctx.fillRect(iframeX, iframeY, iframeW, iframeH);
      
      // Try to capture iframe content if same-origin
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc && iframeDoc.body) {
          // Draw a simplified representation
          ctx.fillStyle = '#94a3b8';
          ctx.font = `${Math.max(10, height * 0.025)}px monospace`;
          ctx.fillText('Frame Content', iframeX + 10, iframeY + 20);
        }
      } catch (e) {
        // Cross-origin iframe, can't access content
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(iframeX + iframeW/2 - 20, iframeY + iframeH/2 - 20, 40, 40);
      }
    }
    
    // Restore context state
    ctx.restore();
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
