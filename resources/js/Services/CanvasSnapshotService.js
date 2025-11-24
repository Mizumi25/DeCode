// @/Services/CanvasSnapshotService.js
// Framer-style canvas snapshot service using DOM-to-image approach
// NO Playwright, NO headless browser, NO full-page screenshots
// Captures ONLY the canvas layer (frames) exactly like Framer does

import axios from 'axios';

export class CanvasSnapshotService {
  static pendingSnapshots = new Map();
  static snapshotCache = new Map();
  
  /**
   * Capture canvas snapshot using DOM element snapshotting
   * Captures ONLY the frames container, excluding UI elements
   */
  static async captureCanvasSnapshot(projectId, options = {}) {
    const {
      width = 800,
      height = 600,
      quality = 0.92,
      format = 'image/jpeg',
      scale = 2, // For higher quality (retina)
      excludeSelectors = [
        '[data-exclude-snapshot="true"]',
        '.header',
        '.panel',
        '.floating-toolbox',
        '.delete-button',
        '.infinite-grid',
      ]
    } = options;

    try {
      console.log(`[CanvasSnapshot] Starting capture for project ${projectId}`);

      // Find the canvas container (the scrollable area with frames)
      const canvasElement = document.querySelector('[data-canvas="true"]');
      if (!canvasElement) {
        throw new Error('Canvas element not found');
      }

      // Find the frames container (the element that contains all frames)
      const framesContainer = canvasElement.querySelector('.absolute.inset-0');
      if (!framesContainer) {
        throw new Error('Frames container not found');
      }

      console.log(`[CanvasSnapshot] Found frames container, capturing...`);

      // Create a temporary canvas for snapshot
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');

      // Scale context for better quality
      ctx.scale(scale, scale);

      // Fill with background
      const isDark = canvasElement.classList.contains('bg-gradient-to-br') && 
                     canvasElement.style.backgroundColor.includes('slate');
      ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      // Clone the frames container to avoid modifying the DOM
      const clonedContainer = framesContainer.cloneNode(true);

      // Remove excluded elements from clone
      excludeSelectors.forEach(selector => {
        const elements = clonedContainer.querySelectorAll(selector);
        elements.forEach(el => el.remove());
      });

      // Capture using foreign object in SVG
      const dataUrl = await this.captureElementToDataURL(clonedContainer, width, height, scale);

      console.log(`[CanvasSnapshot] Capture successful`);

      return {
        dataUrl,
        width: width * scale,
        height: height * scale,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error(`[CanvasSnapshot] Capture failed:`, error);
      throw error;
    }
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
      console.log(`[CanvasSnapshot] Uploading snapshot for project ${projectId}`);

      // Convert data URL to blob
      const blob = await this.dataURLToBlob(dataUrl);

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
        console.log(`[CanvasSnapshot] Upload successful:`, response.data.thumbnail_url);
        
        // Cache the result
        this.snapshotCache.set(projectId, {
          url: response.data.thumbnail_url,
          timestamp: Date.now()
        });

        return response.data;
      }

      throw new Error(response.data.message || 'Upload failed');

    } catch (error) {
      console.error(`[CanvasSnapshot] Upload failed:`, error);
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
