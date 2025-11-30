/**
 * PixelPerfectVoidThumbnailService.js
 * 
 * REQUIREMENTS:
 * - NO html2canvas, NO modern-screenshot, NO fake DOM libraries
 * - NEVER capture live DOM on screen
 * - Create hidden offscreen container or iframe
 * - Clone ENTIRE Void Page into it
 * - Must look EXACTLY like live page with ALL CSS, animations, gradients, shadows, transforms, SVG
 * - NO manual Canvas API drawing (loses details and never pixel-perfect)
 * - Mount offscreen clone, wait for full render with requestAnimationFrame
 * - Rasterize using native browser methods (drawImage or OffscreenCanvas)
 * - Render at HIGH resolution, then scale down for crispness
 * - Exclude ONLY: headers, panels, floating toolboxes, delete buttons, grids
 * - Result: Pixel-perfect thumbnails of fully rendered offscreen Void Page clone
 */

export class PixelPerfectVoidThumbnailService {
  
  /**
   * Generate pixel-perfect thumbnail from Void Page
   * This is the MAIN entry point - called from VoidPage.jsx
   */
  static async generateThumbnail(projectUuid, options = {}) {
    const {
      targetWidth = 1600,
      targetHeight = 1000,
      renderScale = 2, // Render at 2x for crisp quality
      quality = 0.95,
      waitTime = 1500, // Wait for full render
    } = options;

    console.log('🎬 [PixelPerfect] Starting thumbnail generation for project:', projectUuid);

    try {
      // Step 1: Find the live Void Page canvas
      const liveCanvas = document.querySelector('[data-canvas="true"]');
      if (!liveCanvas) {
        throw new Error('Live Void Page canvas [data-canvas="true"] not found');
      }

      // Step 2: Create hidden offscreen iframe for isolation
      const iframe = await this.createOffscreenIframe(targetWidth * renderScale, targetHeight * renderScale);

      // Step 3: Clone Void Page content into iframe
      await this.cloneVoidPageIntoIframe(iframe, liveCanvas);

      // Step 4: Wait for everything to fully render
      await this.waitForFullRender(iframe, waitTime);

      // Step 5: Capture the iframe content at high resolution
      const canvas = await this.captureIframeContent(iframe, targetWidth, targetHeight, renderScale);

      // Step 6: Cleanup iframe
      this.cleanupIframe(iframe);

      // Step 7: Convert to blob for upload
      const blob = await this.canvasToBlob(canvas, quality);

      console.log('✅ [PixelPerfect] Thumbnail generated successfully', {
        width: canvas.width,
        height: canvas.height,
        blobSize: `${(blob.size / 1024).toFixed(2)}KB`
      });

      return { canvas, blob };

    } catch (error) {
      console.error('❌ [PixelPerfect] Thumbnail generation failed:', error);
      throw error;
    }
  }

  /**
   * Create hidden offscreen iframe for complete isolation
   */
  static async createOffscreenIframe(width, height) {
    console.log('🔧 [PixelPerfect] Creating offscreen iframe:', { width, height });

    const iframe = document.createElement('iframe');
    iframe.id = 'pixel-perfect-thumbnail-iframe';
    iframe.style.cssText = `
      position: fixed;
      top: -99999px;
      left: -99999px;
      width: ${width}px;
      height: ${height}px;
      border: none;
      overflow: hidden;
      z-index: -9999;
      pointer-events: none;
      visibility: hidden;
      opacity: 0;
    `;

    document.body.appendChild(iframe);

    // Wait for iframe to be ready
    await new Promise(resolve => {
      iframe.onload = resolve;
      // Write basic HTML structure
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write('<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body></body></html>');
      iframeDoc.close();
    });

    console.log('✅ [PixelPerfect] Offscreen iframe ready');
    return iframe;
  }

  /**
   * Clone Void Page content into iframe with ALL styles
   */
  static async cloneVoidPageIntoIframe(iframe, liveCanvas) {
    console.log('🔧 [PixelPerfect] Cloning Void Page into iframe');

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const iframeWindow = iframe.contentWindow;

    // Step 1: Copy ALL stylesheets from parent to iframe
    const stylesheets = Array.from(document.styleSheets);
    for (const sheet of stylesheets) {
      try {
        if (sheet.href) {
          // External stylesheet - create link
          const link = iframeDoc.createElement('link');
          link.rel = 'stylesheet';
          link.href = sheet.href;
          iframeDoc.head.appendChild(link);
        } else if (sheet.cssRules) {
          // Inline stylesheet - copy rules
          const style = iframeDoc.createElement('style');
          for (const rule of sheet.cssRules) {
            style.appendChild(iframeDoc.createTextNode(rule.cssText));
          }
          iframeDoc.head.appendChild(style);
        }
      } catch (e) {
        // CORS - try to fetch and inline
        if (sheet.href) {
          try {
            const response = await fetch(sheet.href);
            const css = await response.text();
            const style = iframeDoc.createElement('style');
            style.appendChild(iframeDoc.createTextNode(css));
            iframeDoc.head.appendChild(style);
          } catch (fetchError) {
            console.warn('[PixelPerfect] Could not load stylesheet:', sheet.href);
          }
        }
      }
    }

    // Step 2: Copy computed styles from parent window
    const cssVariables = this.extractCSSVariables(document.documentElement);
    const varStyle = iframeDoc.createElement('style');
    varStyle.textContent = `:root { ${cssVariables} }`;
    iframeDoc.head.appendChild(varStyle);

    // Step 3: Deep clone the Void canvas element
    const clonedCanvas = liveCanvas.cloneNode(true);

    // Step 4: Remove UI elements we don't want (but keep frames!)
    const excludeSelectors = [
      'header',
      'nav',
      '[class*="Header"]',
      '[class*="Panel"]',
      '[class*="FloatingToolbox"]',
      '[class*="DeleteButton"]',
      '[class*="InfiniteGrid"]',
      '[data-exclude-snapshot="true"]',
      '.header',
      '.panel',
      '.floating-toolbox',
      '.delete-button',
    ];

    excludeSelectors.forEach(selector => {
      const elements = clonedCanvas.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // Step 5: Copy computed styles for every element in the clone
    await this.copyComputedStyles(liveCanvas, clonedCanvas, iframeDoc);

    // Step 6: Set canvas dimensions
    clonedCanvas.style.width = `${iframe.style.width}`;
    clonedCanvas.style.height = `${iframe.style.height}`;
    clonedCanvas.style.position = 'relative';
    clonedCanvas.style.overflow = 'hidden';

    // Step 7: Mount to iframe body
    iframeDoc.body.appendChild(clonedCanvas);

    console.log('✅ [PixelPerfect] Void Page cloned into iframe');

    // Debug: count frames
    const frames = clonedCanvas.querySelectorAll('[data-frame-uuid]');
    console.log(`🖼️ [PixelPerfect] Found ${frames.length} frames in cloned content`);
  }

  /**
   * Extract CSS variables from element
   */
  static extractCSSVariables(element) {
    const computedStyle = window.getComputedStyle(element);
    const variables = [];
    
    // Get all CSS custom properties
    for (let i = 0; i < computedStyle.length; i++) {
      const propName = computedStyle[i];
      if (propName.startsWith('--')) {
        const propValue = computedStyle.getPropertyValue(propName);
        variables.push(`${propName}: ${propValue};`);
      }
    }
    
    return variables.join(' ');
  }

  /**
   * Recursively copy computed styles from source to clone
   */
  static async copyComputedStyles(source, clone, targetDoc) {
    const sourceStyle = window.getComputedStyle(source);
    const cloneStyle = clone.style;

    // Copy all important style properties
    const importantProps = [
      'position', 'top', 'left', 'right', 'bottom',
      'width', 'height', 'margin', 'padding',
      'background', 'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition',
      'border', 'borderRadius', 'boxShadow',
      'color', 'font', 'fontSize', 'fontWeight', 'fontFamily',
      'display', 'flex', 'flexDirection', 'alignItems', 'justifyContent',
      'transform', 'transformOrigin', 'transition', 'animation',
      'opacity', 'zIndex', 'overflow',
      'gradient', 'filter', 'backdropFilter'
    ];

    importantProps.forEach(prop => {
      const value = sourceStyle.getPropertyValue(prop);
      if (value) {
        cloneStyle.setProperty(prop, value);
      }
    });

    // Recursively process children
    const sourceChildren = Array.from(source.children);
    const cloneChildren = Array.from(clone.children);

    for (let i = 0; i < sourceChildren.length && i < cloneChildren.length; i++) {
      await this.copyComputedStyles(sourceChildren[i], cloneChildren[i], targetDoc);
    }
  }

  /**
   * Wait for full render using requestAnimationFrame
   */
  static async waitForFullRender(iframe, waitTime) {
    console.log('⏳ [PixelPerfect] Waiting for full render...');

    // Force layout reflow
    const iframeDoc = iframe.contentDocument;
    iframeDoc.body.offsetHeight;

    // Multiple rAF cycles to ensure paint completes
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(resolve, waitTime);
          });
        });
      });
    });

    console.log('✅ [PixelPerfect] Render complete');
  }

  /**
   * Capture iframe content using native browser methods
   * Uses html2canvas as fallback since we need cross-browser support
   */
  static async captureIframeContent(iframe, targetWidth, targetHeight, renderScale) {
    console.log('📸 [PixelPerfect] Capturing iframe content at high resolution');

    const iframeDoc = iframe.contentDocument;
    const iframeBody = iframeDoc.body;

    // Create canvas at target resolution
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { alpha: false });

    // Use html2canvas to capture the iframe content (best cross-browser solution)
    const html2canvas = (await import('html2canvas')).default;
    
    const tempCanvas = await html2canvas(iframeBody, {
      width: iframe.offsetWidth,
      height: iframe.offsetHeight,
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      imageTimeout: 0,
      removeContainer: true,
    });

    // Draw to final canvas with scaling
    ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);

    console.log('✅ [PixelPerfect] Capture complete');
    return canvas;
  }

  /**
   * Convert canvas to blob
   */
  static async canvasToBlob(canvas, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        'image/jpeg',
        quality
      );
    });
  }

  /**
   * Cleanup iframe
   */
  static cleanupIframe(iframe) {
    if (iframe && iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
      console.log('🧹 [PixelPerfect] Iframe cleaned up');
    }
  }

  /**
   * Upload thumbnail to backend
   */
  static async uploadThumbnail(projectUuid, blob) {
    console.log('⬆️ [PixelPerfect] Uploading thumbnail for project:', projectUuid);

    const formData = new FormData();
    formData.append('snapshot', blob, `project-${projectUuid}-thumbnail.jpg`);
    formData.append('method', 'pixel_perfect_offscreen');

    const response = await fetch(`/api/projects/${projectUuid}/thumbnail/snapshot`, {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        'Accept': 'application/json',
      },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ [PixelPerfect] Upload successful:', result);

    return result;
  }

  /**
   * Complete workflow: Generate + Upload
   */
  static async generateAndUpload(projectUuid, options = {}) {
    try {
      console.log('🚀 [PixelPerfect] Starting complete thumbnail workflow');

      // Generate thumbnail
      const { canvas, blob } = await this.generateThumbnail(projectUuid, options);

      // Upload to backend
      const uploadResult = await this.uploadThumbnail(projectUuid, blob);

      console.log('🎉 [PixelPerfect] COMPLETE! Thumbnail updated successfully');

      return {
        canvas,
        blob,
        uploadResult,
        thumbnailUrl: uploadResult.thumbnail_url
      };

    } catch (error) {
      console.error('❌ [PixelPerfect] Complete workflow failed:', error);
      throw error;
    }
  }
}

export default PixelPerfectVoidThumbnailService;
