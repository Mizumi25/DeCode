// Add this to your Echo configuration or main JavaScript file

// @/Services/EchoThumbnailListener.js
import Echo from 'laravel-echo';
import { ThumbnailService } from './ThumbnailService';

/**
 * Set up Echo listeners for thumbnail updates
 */
export function setupThumbnailBroadcastListeners(workspaceId, userId) {
  if (!window.Echo || !workspaceId) {
    console.warn('Echo not available or no workspace ID provided');
    return;
  }

  // Listen to workspace channel for thumbnail updates
  const channel = window.Echo.private(`workspace.${workspaceId}`)
    .listen('.thumbnail-generated', (data) => {
      console.log('Thumbnail generated broadcast received:', data);
      
      // Handle the broadcast through ThumbnailService
      ThumbnailService.handleBroadcastUpdate(data);
    })
    .listen('.frame-updated', (data) => {
      console.log('Frame updated broadcast received:', data);
      
      // Check if this update might need thumbnail regeneration
      if (data.frame && data.frame.canvas_data) {
        // Schedule thumbnail update if canvas data changed
        const frameUuid = data.frame.uuid;
        const components = data.frame.canvas_data.components || [];
        
        if (components.length > 0) {
          // Debounced thumbnail update from broadcast
          setTimeout(() => {
            ThumbnailService.scheduleCanvasThumbnailUpdate(frameUuid, components, {
              viewport: data.frame.canvas_data.viewport || { width: 1440, height: 900 },
              background_color: data.frame.settings?.background_color || '#ffffff'
            });
          }, 1000); // 1 second delay for broadcast updates
        }
      }
    });

  // Return cleanup function
  return () => {
    try {
      channel.stopListening('.thumbnail-generated');
      channel.stopListening('.frame-updated');
      window.Echo.leaveChannel(`workspace.${workspaceId}`);
    } catch (error) {
      console.error('Error cleaning up thumbnail broadcast listeners:', error);
    }
  };
}

// Modified version for your main app.js or bootstrap.js file:
// Add this to your existing Echo setup

if (window.Echo && window.authUser && window.currentWorkspace) {
  // Set up thumbnail listeners
  const cleanupThumbnailListeners = setupThumbnailBroadcastListeners(
    window.currentWorkspace.id,
    window.authUser.id
  );
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    if (cleanupThumbnailListeners) {
      cleanupThumbnailListeners();
    }
  });
}