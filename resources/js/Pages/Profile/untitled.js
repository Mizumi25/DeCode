

// ✅ ADD: Setup global navigation listeners
if (typeof window !== 'undefined') {
  // Listen for Inertia navigation start
  router.on('start', (event) => {
    console.log('🚀 Navigation starting, cleaning up Echo...');
    useFramePresenceStore.getState().setNavigating(true);
    useFramePresenceStore.getState().cleanupAllFrames();
  });
  
  // Listen for Inertia navigation finish
  router.on('finish', (event) => {
    console.log('✅ Navigation finished');
    // Small delay to ensure page is ready
    setTimeout(() => {
      useFramePresenceStore.getState().setNavigating(false);
    }, 100);
  });
  
  // Listen for beforeunload (browser navigation/close)
  window.addEventListener('beforeunload', () => {
    console.log('🚀 Page unloading, cleaning up Echo...');
    useFramePresenceStore.getState().cleanupAllFrames();
  });
}

export { useFramePresenceStore };