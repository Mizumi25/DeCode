/**
 * ForgeFrameOffscreenPreview.jsx
 * 
 * Offscreen renderer for frame thumbnails.
 * Mounts the actual ForgePage canvas WITHOUT any editor UI.
 * Only the design itself is rendered - no panels, grids, toolboxes, selection boxes, etc.
 * 
 * This component uses the same ComponentLibraryService and rendering pipeline
 * as ForgePage to ensure visual accuracy.
 */

import React, { useEffect, useRef, useState } from 'react';
import componentLibraryService from '@/Services/ComponentLibraryService';

export function ForgeFrameOffscreenPreview({ frame, width, height, onMounted }) {
  const containerRef = useRef(null);
  const [components, setComponents] = useState([]);
  const [isReady, setIsReady] = useState(false);

  // Load components from project_components table via API
  useEffect(() => {
    if (!frame || !frame.uuid) {
      console.warn('[ForgeFrameOffscreenPreview] No frame data provided');
      setComponents([]);
      return;
    }

    console.log('[ForgeFrameOffscreenPreview] Loading components for frame:', frame.uuid);
    
    // Fetch components from the correct endpoint
    fetch(`/api/frames/${frame.uuid}/components`)
      .then(res => res.json())
      .then(data => {
        // Handle different response formats
        let loadedComponents = [];
        
        // ✅ FIX: API returns data in response.data.data format
        if (data && data.success && Array.isArray(data.data)) {
          loadedComponents = data.data;
        } else if (Array.isArray(data)) {
          loadedComponents = data;
        } else if (data && Array.isArray(data.components)) {
          loadedComponents = data.components;
        } else if (data && typeof data === 'object' && !data.success) {
          // If it's an object with component data, wrap it in an array
          loadedComponents = Object.values(data);
        } else {
          console.warn('[ForgeFrameOffscreenPreview] Unexpected API response format:', data);
          loadedComponents = [];
        }
        
        console.log(`[ForgeFrameOffscreenPreview] ✅ Loaded ${loadedComponents.length} components from API`, loadedComponents.slice(0, 2));
        setComponents(loadedComponents);
      })
      .catch(err => {
        console.error('[ForgeFrameOffscreenPreview] Failed to fetch components:', err);
        setComponents([]);
      });
  }, [frame?.uuid]);

  // Notify when mounted and ready
  useEffect(() => {
    if (isReady && onMounted) {
      console.log('[ForgeFrameOffscreenPreview] Components mounted, notifying parent');
      onMounted();
    }
  }, [isReady, onMounted]);

  // Mark as ready after components are set and rendered
  useEffect(() => {
    if (components.length >= 0 && containerRef.current) {
      // Use multiple RAFs to ensure full paint cycle
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsReady(true);
        });
      });
    }
  }, [components]);

  // Render components using ComponentLibraryService
  const renderComponent = (component, index) => {
    try {
      const rendered = componentLibraryService.renderComponent(
        component,
        index,
        null, // selectedComponentId - not needed for thumbnail
        () => {}, // handleComponentClick - not needed
        () => {}, // handleComponentDoubleClick - not needed
        () => {}, // handlePropertyChange - not needed
        false, // isDragging
        null, // activeDragId
        containerRef, // parentRef
        { 'data-component-type': component.type } // Add data attribute for counting
      );
      return rendered;
    } catch (error) {
      console.error('[ForgeFrameOffscreenPreview] Error rendering component:', component, error);
      return null;
    }
  };

  // Get canvas styles from frame
  const canvasStyle = frame?.canvas_style || {};
  const backgroundColor = canvasStyle.backgroundColor || frame?.settings?.backgroundColor || '#ffffff';
  const backgroundImage = canvasStyle.backgroundImage;
  const backgroundSize = canvasStyle.backgroundSize;
  const backgroundPosition = canvasStyle.backgroundPosition;
  const backgroundRepeat = canvasStyle.backgroundRepeat;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        overflow: 'hidden',
        backgroundColor,
        backgroundImage,
        backgroundSize,
        backgroundPosition,
        backgroundRepeat,
        fontFamily: canvasStyle.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: canvasStyle.fontSize,
        lineHeight: canvasStyle.lineHeight,
        color: canvasStyle.color,
        // Apply all other canvas styles
        ...Object.fromEntries(
          Object.entries(canvasStyle).filter(([key]) => 
            !['width', 'height', 'position'].includes(key)
          )
        ),
      }}
      data-offscreen-canvas="true"
      data-frame-uuid={frame?.uuid}
    >
      {/* Render actual components using the same rendering pipeline as ForgePage */}
      {components.map((component, index) => (
        <React.Fragment key={component.id || index}>
          {renderComponent(component, index)}
        </React.Fragment>
      ))}
    </div>
  );
}

export default ForgeFrameOffscreenPreview;
