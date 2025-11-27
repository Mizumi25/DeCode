// @/Services/CanvasSnapshotService.js
// Framer-style canvas snapshot service using DOM-to-image approach
// NO Playwright, NO headless browser, NO full-page screenshots
// Captures ONLY the canvas layer (frames) exactly like Framer does

import axios from 'axios';

export class CanvasSnapshotService {
  static pendingSnapshots = new Map();
  static snapshotCache = new Map();
  
  /**
   * Capture ENTIRE Void page snapshot - background, grid, frames, EVERYTHING visible
   * This is like taking a screenshot of the whole Void page UI
   */
  static async captureCanvasSnapshot(projectId, options = {}) {
    const {
      width = 1400,
      height = 900,
      quality = 0.9,
      format = 'image/jpeg',
      scale = 1, // No extra scaling, capture at actual viewport size
    } = options;

    try {
      console.log(`🎬 [CanvasSnapshot] Starting FULL VOID PAGE capture for project ${projectId}`);

      // Find the main Void page container with data-canvas="true"
      const voidPageElement = document.querySelector('[data-canvas="true"]');
      
      if (!voidPageElement) {
        console.error('❌ [CanvasSnapshot] Void page element [data-canvas="true"] not found in DOM');
        throw new Error('Void page element not found');
      }
      console.log('✅ [CanvasSnapshot] Found Void page element:', voidPageElement);

      // Count frames for logging
      const frameElements = voidPageElement.querySelectorAll('[data-frame-id]');
      console.log(`📊 [CanvasSnapshot] Found ${frameElements.length} frames in Void page`);

      // Get actual dimensions of the viewport
      const rect = voidPageElement.getBoundingClientRect();
      const captureWidth = Math.min(width, rect.width);
      const captureHeight = Math.min(height, rect.height);

      console.log(`📸 [CanvasSnapshot] Capturing ENTIRE Void page: ${captureWidth}x${captureHeight} (background, grid, frames, everything visible)`);

      // Use html2canvas to capture the entire visible Void page
      const canvas = await this.captureElementUsingHtml2Canvas(voidPageElement, captureWidth, captureHeight);
      
      // Convert to JPEG data URL
      const dataUrl = canvas.toDataURL('image/jpeg', quality);

      console.log(`✅ [CanvasSnapshot] FULL VOID PAGE captured! Data URL length: ${dataUrl.length}`);

      return {
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error(`❌ [CanvasSnapshot] Capture failed:`, error);
      throw error;
    }
  }

  /**
   * Capture element using html2canvas library or fallback to simple screenshot
   * This will render the entire Void page including background gradients
   */
  static async captureElementUsingHtml2Canvas(element, width, height) {
    // Check if html2canvas is available
    if (typeof window.html2canvas !== 'undefined') {
      console.log('📸 [CanvasSnapshot] Using html2canvas library');
      try {
        const canvas = await window.html2canvas(element, {
          width: width,
          height: height,
          scale: 1,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false
        });
        return canvas;
      } catch (error) {
        console.warn('⚠️ [CanvasSnapshot] html2canvas failed, using fallback:', error);
      }
    }

    // Fallback: Manual canvas rendering
    console.log('📸 [CanvasSnapshot] Using fallback manual canvas rendering');
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Get computed styles
        const computedStyle = window.getComputedStyle(element);
        const bgColor = computedStyle.backgroundColor;
        const bgImage = computedStyle.backgroundImage;

        // Fill with background color
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, width, height);
        } else {
          // Default dark background for Void page
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, width, height);
        }

        // Draw a simple grid pattern (since we can't capture the actual grid)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        const gridSize = 50;
        
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Draw frame rectangles
        const frameElements = element.querySelectorAll('[data-frame-id]');
        console.log(`🖼️ [CanvasSnapshot] Drawing ${frameElements.length} frames on canvas`);
        
        frameElements.forEach(frameEl => {
          const rect = frameEl.getBoundingClientRect();
          const containerRect = element.getBoundingClientRect();
          
          // Calculate relative position
          const x = rect.left - containerRect.left;
          const y = rect.top - containerRect.top;
          const w = rect.width;
          const h = rect.height;

          // Draw frame background
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x, y, w, h);
          
          // Draw frame border
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, w, h);
          
          // Try to get frame name from various sources
          let frameName = 'Frame';
          const nameElement = frameEl.querySelector('h2') || 
                            frameEl.querySelector('.frame-title') ||
                            frameEl.querySelector('[contenteditable]');
          if (nameElement) {
            frameName = nameElement.textContent || 'Frame';
          }
          
          // Draw frame name
          ctx.fillStyle = '#f1f5f9';
          ctx.font = '14px system-ui, -apple-system, sans-serif';
          ctx.fillText(frameName, x + 10, y + 25);
        });

        console.log('✅ [CanvasSnapshot] Fallback rendering complete');
        resolve(canvas);

      } catch (error) {
        console.error('❌ [CanvasSnapshot] Fallback rendering failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Capture DOM element to data URL using SVG foreignObject
   * This is the core technique used by Framer for canvas snapshots
   */
  static async captureElementToDataURL(element, width, height, scale = 2) {
    return new Promise((resolve, reject) => {
      try {
        // Get computed styles
        const styles = window.getComputedStyle(element);
        
        // Create SVG with foreignObject
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', width * scale);
        svg.setAttribute('height', height * scale);
        svg.setAttribute('xmlns', svgNS);

        const foreignObject = document.createElementNS(svgNS, 'foreignObject');
        foreignObject.setAttribute('width', '100%');
        foreignObject.setAttribute('height', '100%');

        // Clone element with styles
        const clonedElement = element.cloneNode(true);
        
        // Apply inline styles to preserve appearance
        this.applyStylesToClone(element, clonedElement);

        foreignObject.appendChild(clonedElement);
        svg.appendChild(foreignObject);

        // Serialize SVG to string
        const svgString = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        // Draw to canvas
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');

        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        };
        img.onerror = (error) => {
          URL.revokeObjectURL(url);
          reject(error);
        };
        img.src = url;

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Apply computed styles to cloned element recursively
   */
  static applyStylesToClone(original, clone) {
    const computedStyle = window.getComputedStyle(original);
    
    // Copy all computed styles
    Array.from(computedStyle).forEach(key => {
      clone.style[key] = computedStyle.getPropertyValue(key);
    });

    // Recursively apply to children
    const originalChildren = original.children;
    const cloneChildren = clone.children;
    
    for (let i = 0; i < originalChildren.length; i++) {
      if (originalChildren[i] && cloneChildren[i]) {
        this.applyStylesToClone(originalChildren[i], cloneChildren[i]);
      }
    }
  }

  /**
   * Alternative: Use canvas drawImage for already rendered canvas elements
   * This is faster for canvas-based frames
   */
  static async captureFromCanvasElement(canvasElement, width = 800, height = 600) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Draw the source canvas
    ctx.drawImage(canvasElement, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', 0.92);
  }

  /**
   * Upload snapshot to backend
   */
  static async uploadSnapshot(projectId, dataUrl) {
    try {
      console.log(`⬆️ [CanvasSnapshot] Uploading snapshot for project ${projectId}...`);

      // Convert data URL to blob
      const blob = await this.dataURLToBlob(dataUrl);
      console.log(`📦 [CanvasSnapshot] Blob created: ${(blob.size / 1024).toFixed(2)}KB`);

      // Create form data
      const formData = new FormData();
      formData.append('snapshot', blob, `project-${projectId}-snapshot.jpg`);
      formData.append('project_id', projectId);
      formData.append('method', 'canvas_snapshot');

      // Upload to backend
      const response = await axios.post(`/api/projects/${projectId}/thumbnail/snapshot`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        console.log(`✅ [CanvasSnapshot] Upload successful:`, response.data.thumbnail_url);
        console.log(`🎉 [CanvasSnapshot] PROJECT THUMBNAIL IS NOW VISIBLE ON PROJECT LIST!`);
        
        // Cache the result
        this.snapshotCache.set(projectId, {
          url: response.data.thumbnail_url,
          timestamp: Date.now()
        });

        return response.data;
      }

      throw new Error(response.data.message || 'Upload failed');

    } catch (error) {
      console.error(`❌ [CanvasSnapshot] Upload failed:`, error);
      throw error;
    }
  }

  /**
   * Convert data URL to Blob
   */
  static async dataURLToBlob(dataUrl) {
    const response = await fetch(dataUrl);
    return response.blob();
  }

  /**
   * Generate and upload project thumbnail
   * This is the main method to call
   */
  static async generateProjectThumbnail(projectId, options = {}) {
    // Prevent duplicate requests
    if (this.pendingSnapshots.has(projectId)) {
      console.log(`[CanvasSnapshot] Snapshot already pending for project ${projectId}`);
      return this.pendingSnapshots.get(projectId);
    }

    const promise = (async () => {
      try {
        // Capture snapshot
        const snapshot = await this.captureCanvasSnapshot(projectId, options);

        // Upload to backend
        const result = await this.uploadSnapshot(projectId, snapshot.dataUrl);

        this.pendingSnapshots.delete(projectId);
        return result;

      } catch (error) {
        this.pendingSnapshots.delete(projectId);
        throw error;
      }
    })();

    this.pendingSnapshots.set(projectId, promise);
    return promise;
  }

  /**
   * Debounced snapshot generation
   */
  static debounceTimers = new Map();
  
  static debouncedGenerateProjectThumbnail(projectId, options = {}, delay = 2000) {
    // Clear existing timer
    if (this.debounceTimers.has(projectId)) {
      clearTimeout(this.debounceTimers.get(projectId));
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.generateProjectThumbnail(projectId, options);
      this.debounceTimers.delete(projectId);
    }, delay);

    this.debounceTimers.set(projectId, timer);
  }

  /**
   * Get cached snapshot
   */
  static getCachedSnapshot(projectId) {
    return this.snapshotCache.get(projectId);
  }

  /**
   * Clear cache
   */
  static clearCache(projectId) {
    if (projectId) {
      this.snapshotCache.delete(projectId);
    } else {
      this.snapshotCache.clear();
    }
  }
}
