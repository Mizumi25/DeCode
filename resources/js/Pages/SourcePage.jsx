import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import Panel from '@/Components/Panel';
// Import components
import ExplorerPanel from '@/Components/Source/ExplorerPanel';
import PreviewPanel from '@/Components/Source/PreviewPanel';
import CodeEditor from '@/Components/Source/CodeEditor';
import TerminalPanel from '@/Components/Source/TerminalPanel';
// Import the new Source store
import { useSourceStore } from '@/stores/useSourceStore';
import { useCodeSyncStore } from '@/stores/useCodeSyncStore';
import EnhancedToastContainer from '@/Components/Notifications/EnhancedToast';
import useFrameLockStore from '@/stores/useFrameLockStore';
import LockAccessRequestDialog from '@/Components/Forge/LockAccessRequestDialog';
import PageLoadingProgress from '@/Components/PageLoadingProgress';
import { usePageLoadingProgress } from '@/hooks/usePageLoadingProgress';
import PageNavigationTutorial from '@/Components/Tutorial/PageNavigationTutorial';
import useTutorialStore from '@/stores/useTutorialStore';
import PublishOverlay from '@/Components/PublishOverlay';

export default function SourcePage({ projectId, frameId, frame }) {
  // Frame lock store for notifications and access requests
  const lockNotifications = useFrameLockStore(state => state.notifications);
  const removeNotification = useFrameLockStore(state => state.removeNotification);
  const lockRequests = useFrameLockStore(state => state.lockRequests);
  const respondToLockRequest = useFrameLockStore(state => state.respondToLockRequest);
  const initializeEcho = useFrameLockStore(state => state.initialize);
  
  // Page loading progress
  const {
    isLoading: isPageLoading,
    progress: loadingProgress,
    message: loadingMessage,
    startLoading,
    incrementProgress,
    finishLoading
  } = usePageLoadingProgress({ 
    totalResources: 2, // File system + code editor
    minDuration: 600,
    maxDuration: 2500
  })

  // Tutorial Integration
  const { setCurrentPage } = useTutorialStore()

  // Set current page for tutorial
  useEffect(() => {
    setCurrentPage('source')
  }, [setCurrentPage])
  
  // Use Source Store for panel management
  const {
    toggleSourcePanel,
    isSourcePanelOpen,
    toggleAllSourcePanels,
    allSourcePanelsHidden,
    sourcePanelStates,
    _sourceTriggerUpdate // Include trigger for reactive updates
  } = useSourceStore()
  
  const { 
    syncedCode, 
    codeStyle, 
    activeCodeTab,
    setActiveCodeTab: setSyncedActiveTab,
    lastUpdated 
  } = useCodeSyncStore();
  
  const [editorValue, setEditorValue] = useState('');
  
  const { props } = usePage();
  const { auth } = props;

  // Initialize loading
  useEffect(() => {
    startLoading('Loading file system...');
    
    // Simulate loading steps
    const timer1 = setTimeout(() => {
      incrementProgress('Initializing code editor...');
    }, 300);
    
    const timer2 = setTimeout(() => {
      finishLoading();
    }, 800);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);
  
  // Initialize Echo for lock requests
  useEffect(() => {
    if (auth?.user?.id) {
      initializeEcho(auth.user.id);
    }
  }, [auth?.user?.id, initializeEcho]);
  
  // Sync code from Forge to Source editor
  useEffect(() => {
    if (syncedCode && activeCodeTab) {
      const code = syncedCode[activeCodeTab] || '';
      setEditorValue(code);
      console.log('SourcePage: Code synced from Forge:', {
        tab: activeCodeTab,
        codeLength: code.length,
        lastUpdated
      });
    }
  }, [syncedCode, activeCodeTab, lastUpdated]);

  // Legacy panel states for compatibility with other parts (if needed)
  const [legacyPanelStates, setLegacyPanelStates] = useState({
    forge: false,
    source: false
  });
  
  // Split view state - always true now since preview is always on
  const [splitView] = useState(true);
  const [previewMode, setPreviewMode] = useState('desktop');
  
  // Use ref to track previous state and avoid console spam
  const previousPanelState = useRef(null);

  // CRITICAL: Force re-render when SourceStore state changes
  useEffect(() => {
    console.log('SourcePage: SourceStore state changed, triggering re-render');
    console.log('Panel states:', sourcePanelStates);
    console.log('All panels hidden:', allSourcePanelsHidden);
    console.log('Explorer panel (layers) open:', isSourcePanelOpen('explorer-panel'));
  }, [sourcePanelStates, allSourcePanelsHidden, _sourceTriggerUpdate]);

  // Handler for when a panel is closed - Updated to use SourceStore
  const handlePanelClose = useCallback((panelId) => {
    console.log(`SourcePage: Panel ${panelId} close requested`);
    toggleSourcePanel(panelId);
  }, [toggleSourcePanel]);

  // Handler for changes in panel state - with debouncing to prevent spam
  const handlePanelStateChange = useCallback((hasRightPanels) => {
    // Only log if the state actually changed
    if (previousPanelState.current !== hasRightPanels) {
      console.log(`SourcePage: Right panels active: ${hasRightPanels}`);
      previousPanelState.current = hasRightPanels;
    }
  }, []);

  // Handle panel maximize
  const handlePanelMaximize = useCallback((panelType) => {
    console.log('SourcePage: Panel maximize requested for:', panelType);
  }, []);

  // Handle toggling the visibility of a panel - Updated to use SourceStore
  const handlePanelToggle = useCallback((panelType) => {
    console.log('SourcePage: Header panel toggle requested:', panelType);
    
    // Handle special cases
    if (panelType === 'hideAll') {
      toggleAllSourcePanels();
      return;
    }

    // Map panel types to actual panel IDs
    const panelMap = {
      'explorer': 'explorer-panel',
      'layers': 'explorer-panel',       // SAME panel as explorer - because explorer IS the layers
      'preview': 'preview-panel',
      'terminal': 'terminal-panel',
      'output': 'output-panel',
      'problems': 'problems-panel',
      'debug': 'debug-panel'
    };

    const actualPanelId = panelMap[panelType];
    if (actualPanelId) {
      toggleSourcePanel(actualPanelId);
    }

    // Update legacy state for compatibility
    setLegacyPanelStates(prev => ({
      ...prev,
      [panelType]: !prev[panelType]
    }));
  }, [toggleSourcePanel, toggleAllSourcePanels]);

  // Handle switching between modes
  const handleModeSwitch = useCallback((mode) => {
    console.log('SourcePage: Mode switch requested:', mode);
  }, []);

  // Create mock panels with actual components
  const createSourcePanel = (id, title, content) => ({
    id,
    title,
    content: content || (
      <div className="p-4 space-y-2">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">Mock {title} panel content</p>
        <div className="space-y-1 text-xs text-gray-500">
          <div>This is a placeholder for the {title} panel</div>
          <div>Panel ID: {id}</div>
        </div>
      </div>
    )
  });

  // Memoize left panels with actual components  
  const leftPanels = useMemo(() => {
    const panels = [];

    // Explorer panel (always visible unless all hidden) - This IS the layers panel
    if (isSourcePanelOpen('explorer-panel')) {
      panels.push(createSourcePanel('explorer-panel', 'EXPLORER', 
        ExplorerPanel ? <ExplorerPanel /> : null
      ));
    }

    console.log(`SourcePage: Left panels: ${panels.map(p => p.id).join(', ')}`);
    return panels;
  }, [isSourcePanelOpen, ExplorerPanel, _sourceTriggerUpdate]);

  // Memoize right panels
  const rightPanels = useMemo(() => {
    const panels = [];

    // Preview panel (always visible unless all hidden)
    if (isSourcePanelOpen('preview-panel')) {
      panels.push(createSourcePanel('preview-panel', 'PREVIEW',
        PreviewPanel ? (
          <PreviewPanel previewMode={previewMode} setPreviewMode={setPreviewMode} />
        ) : null
      ));
    }

    // Debug panel (toggleable)
    if (isSourcePanelOpen('debug-panel')) {
      panels.push(createSourcePanel('debug-panel', 'DEBUG',
        <div className="p-4">
          <h3 className="font-semibold mb-2">Debug Console</h3>
          <div className="text-sm space-y-1 font-mono text-green-600">
            <div>[DEBUG] Source page loaded</div>
            <div>[DEBUG] Project ID: {projectId || 'N/A'}</div>
            <div>[DEBUG] Frame ID: {frameId || 'N/A'}</div>
            <div>[DEBUG] Panels: {Object.keys(sourcePanelStates).filter(k => sourcePanelStates[k]).join(', ')}</div>
          </div>
        </div>
      ));
    }

    console.log(`SourcePage: Right panels: ${panels.map(p => p.id).join(', ')}`);
    return panels;
  }, [isSourcePanelOpen, previewMode, projectId, frameId, sourcePanelStates, _sourceTriggerUpdate]);

  // Check if we have visible panels
  const hasLeftPanels = !allSourcePanelsHidden && leftPanels.length > 0;
  const hasRightPanels = !allSourcePanelsHidden && rightPanels.length > 0;

  console.log('SourcePage: Rendering with panel states:', {
    hasLeftPanels,
    hasRightPanels,
    leftPanelCount: leftPanels.length,
    rightPanelCount: rightPanels.length,
    allHidden: allSourcePanelsHidden,
    layersOpen: isSourcePanelOpen('layers-panel')
  });

  return (
    <AuthenticatedLayout
      headerProps={{
        onPanelToggle: handlePanelToggle,
        panelStates: legacyPanelStates, // Keep for compatibility
        onModeSwitch: handleModeSwitch,
        currentFrame: frame?.uuid || frameId, // Pass frame UUID for lock button
        projectId: projectId,
        frame: frame
      }}
    >
      <Head title="Source - Code Editor" />
      
      {/* Page Loading Progress */}
      <PageLoadingProgress 
        isLoading={isPageLoading} 
        progress={loadingProgress} 
        message={loadingMessage} 
      />

      {/* Page Navigation Tutorial */}
      <PageNavigationTutorial />
      
      {/* Main Layout Container */}
      <div 
        className="h-[calc(100vh-60px)] flex"
        style={{ 
          color: 'var(--color-text)' 
        }}
      >
        
        {/* Left Panel Container - Explorer & Layers */}
        {hasLeftPanels && (
          <div className="w-80 flex-shrink-0 shadow-lg">
            <Panel
              key={`left-panels-${_sourceTriggerUpdate}`} // Force re-render with key
              isOpen={true}
              initialPanels={leftPanels}
              allowedDockPositions={['left']}
              onPanelClose={handlePanelClose}
              onPanelStateChange={handlePanelStateChange}
              snapToEdge={true}
              mergePanels={true}
              mergePosition="left"
              showTabs={leftPanels.length > 1}
              defaultWidth={320}
              minWidth={280}
              maxWidth={400}
            />
          </div>
        )}

        {/* Main Code Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Code Editor */}
          <div className="flex-1 min-h-0">
            {CodeEditor ? (
              <CodeEditor />
            ) : (
              <div className="h-full flex items-center justify-center bg-[var(--color-bg-muted)]">
                <div className="text-center">
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                    Code Editor
                  </h2>
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Mock code editor area
                  </div>
                  <div className="text-xs mt-4 space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                    <div>Project: {projectId || 'No project'}</div>
                    <div>Frame: {frameId || 'No frame'}</div>
                    <div>Explorer/Layers panel: {isSourcePanelOpen('explorer-panel') ? 'Open' : 'Closed'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Terminal/Output Area */}
          {isSourcePanelOpen('terminal-panel') && (
            <div className="h-48 border-t" style={{ borderColor: 'var(--color-border)' }}>
              {TerminalPanel ? (
                <TerminalPanel />
              ) : (
                <div className="h-full bg-[var(--color-bg-muted)] p-4">
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Terminal</h3>
                  <div className="text-sm font-mono" style={{ color: 'var(--color-text-muted)' }}>
                    Mock terminal/output area
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel Container - Preview & Debug */}
        {hasRightPanels && (
          <div className="w-80 flex-shrink-0 shadow-lg">
            <Panel
              key={`right-panels-${_sourceTriggerUpdate}`} // Force re-render with key
              isOpen={true}
              initialPanels={rightPanels}
              allowedDockPositions={['right']}
              onPanelClose={handlePanelClose}
              onPanelStateChange={handlePanelStateChange}
              snapToEdge={true}
              mergePanels={true}
              mergePosition="right"
              showTabs={rightPanels.length > 1}
              defaultWidth={320}
              minWidth={280}
              maxWidth={400}
            />
          </div>
        )}
      </div>

      {/* Debug overlay for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black bg-opacity-80 text-white p-2 rounded text-xs font-mono z-50">
          <div>Layers: {isSourcePanelOpen('explorer-panel') ? 'ON' : 'OFF'}</div>
          <div>Explorer: {isSourcePanelOpen('explorer-panel') ? 'ON' : 'OFF'}</div>
          <div>Preview: {isSourcePanelOpen('preview-panel') ? 'ON' : 'OFF'}</div>
          <div>Terminal: {isSourcePanelOpen('terminal-panel') ? 'ON' : 'OFF'}</div>
          <div>All Hidden: {allSourcePanelsHidden ? 'YES' : 'NO'}</div>
        </div>
      )}
      
      {/* Enhanced Toast Notifications */}
      <EnhancedToastContainer 
        position="top-right"
        notifications={lockNotifications}
        onRemoveNotification={removeNotification}
      />

      {/* Publish Overlay - Real-time collaborative publishing UI */}
      <PublishOverlay />
      
    </AuthenticatedLayout>
  );
}