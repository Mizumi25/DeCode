import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Panel from '@/Components/Panel';

// Import components
import ExplorerPanel from '@/Components/Source/ExplorerPanel';
import PreviewPanel from '@/Components/Source/PreviewPanel';
import CodeEditor from '@/Components/Source/CodeEditor';
import TerminalPanel from '@/Components/Source/TerminalPanel';

export default function SourcePage({ projectId, frameId }) {
  // Panel states
  const [panelStates, setPanelStates] = useState({
    forge: false,
    source: false
  });

  // Split view state
  const [splitView, setSplitView] = useState(true);
  const [previewMode, setPreviewMode] = useState('desktop');

  // Handler for when a panel is closed
  const handlePanelClose = (panelId) => {
    console.log(`Panel ${panelId} closed`);
    setPanelStates(prev => ({
      ...prev,
      [panelId]: false
    }));
  };

  // Handler for changes in panel state
  const handlePanelStateChange = (hasRightPanels) => {
    console.log(`Right panels active: ${hasRightPanels}`);
  };

  // Define the content for the left-docked panel (Explorer)
  const explorerPanel = {
    id: 'explorer',
    title: 'EXPLORER',
    content: <ExplorerPanel />
  };

  // Define the content for the right-docked panel (Preview/Split View)
  const previewPanel = {
    id: 'preview',
    title: 'PREVIEW',
    content: <PreviewPanel previewMode={previewMode} setPreviewMode={setPreviewMode} />
  };

  // Default panels configuration
  const defaultPanels = [explorerPanel];
  const previewPanels = splitView ? [previewPanel] : [];

  // Handle panel maximize
  const handlePanelMaximize = (panelType) => {
    if (panelType === 'forge') {
      router.visit('/forge', { preserveState: true });
    }
    setPanelStates(prev => ({
      ...prev,
      [panelType]: false
    }));
  };

  // Handle toggling the visibility of a panel
  const handlePanelToggle = (panelType) => {
    setPanelStates(prev => ({
      ...prev,
      [panelType]: !prev[panelType]
    }));
  };

  // Handle switching between modes
  const handleModeSwitch = (mode) => {
    if (mode === 'forge') {
      router.visit('/forge', { preserveState: true });
    }
  };

  return (
    <AuthenticatedLayout
      headerProps={{
        onPanelToggle: handlePanelToggle,
        panelStates: panelStates,
        onModeSwitch: handleModeSwitch
      }}
    >
      <Head title="Source - Code Editor" />

      {/* Main Layout Container */}
      <div 
        className="h-[calc(100vh-60px)] flex"
        style={{ 
          backgroundColor: 'var(--color-bg)', 
          color: 'var(--color-text)' 
        }}
      >
        
        {/* Left Panel Container - Explorer */}
        <div className="w-80 flex-shrink-0">
          <Panel
            isOpen={true}
            initialPanels={defaultPanels}
            allowedDockPositions={['left']}
            onPanelClose={handlePanelClose}
            onPanelStateChange={handlePanelStateChange}
            snapToEdge={true}
          />
        </div>

        {/* Main Code Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Code Editor */}
          <div className="flex-1 min-h-0">
            <CodeEditor splitView={splitView} setSplitView={setSplitView} />
          </div>

          {/* Terminal/Output Area */}
          <TerminalPanel />
        </div>

        {/* Right Panel Container - Preview (when split view is enabled) */}
        {splitView && (
          <div className="w-80 flex-shrink-0">
            <Panel
              isOpen={true}
              initialPanels={previewPanels}
              allowedDockPositions={['right']}
              onPanelClose={handlePanelClose}
              onPanelStateChange={handlePanelStateChange}
              snapToEdge={true}
            />
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}