import React, { useState } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Panel from '@/Components/Panel';
import {
  FilePlus,
  FolderPlus,
  RefreshCw,
  FolderMinus,
  ChevronRight,
  ChevronDown,
  FileText
} from 'lucide-react';


export default function SourcePage({ projectId, frameId }) {
  // Panel states
  const [panelStates, setPanelStates] = useState({
    forge: false,
    source: false
  })

  // Handler for when a panel is closed
  const handlePanelClose = (panelId) => {
    console.log(`Panel ${panelId} closed`)
    // Optionally update panelStates if a panel's closure affects its visibility state
    setPanelStates(prev => ({
      ...prev,
      [panelId]: false // Assuming panelId matches the state key (e.g., 'forge', 'source')
    }));
  }

  // Handler for changes in panel state (e.g., visibility of right panels)
  const handlePanelStateChange = (hasRightPanels) => {
    console.log(`Right panels active: ${hasRightPanels}`)
    // This function can be used to adjust the main content area's layout
    // based on whether side panels are active.
  }

  // Define the content for the left-docked panel, mimicking VS Code's Explorer
  const defaultPanels = [
    {
      id: 'explorer', // Unique ID for the explorer panel
      title: 'EXPLORER', // Title displayed at the top of the panel
      content: (
  <div className="flex flex-col h-full bg-[var(--color-bg-panel)] text-[var(--color-text)]">
    {/* Explorer Header */}
    <div className="flex items-center justify-between p-2 border-b border-[var(--color-border)] text-xs uppercase font-semibold text-[var(--color-text-muted)]">
      <span>Workspace</span>
      <div className="flex space-x-2">
        <FilePlus
          size={16}
          className="cursor-pointer hover:text-[var(--color-primary)]"
          title="New File"
        />
        <FolderPlus
          size={16}
          className="cursor-pointer hover:text-[var(--color-primary)]"
          title="New Folder"
        />
        <RefreshCw
          size={16}
          className="cursor-pointer hover:text-[var(--color-primary)]"
          title="Refresh Explorer"
        />
        <FolderMinus
          size={16}
          className="cursor-pointer hover:text-[var(--color-primary)]"
          title="Collapse All Folders"
        />
      </div>
    </div>

    {/* File Tree Area */}
    <div className="flex-grow overflow-y-auto p-2 text-sm">
      <div className="mb-2">
        <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
          <ChevronDown size={14} className="text-[var(--color-text-muted)]" />
          <span>MyWebsiteProject</span>
        </div>
        <div className="ml-4">
          <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
            <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
            <span>src</span>
          </div>
          <div className="ml-4">
            <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
              <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
              <span>Components</span>
            </div>
            <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
              <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
              <span>Layouts</span>
            </div>
            <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
              <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
              <span>Pages</span>
            </div>
            {/* Files */}
            <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
              <FileText size={14} className="text-[var(--color-text-muted)]" />
              <span>App.jsx</span>
            </div>
            <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
              <FileText size={14} className="text-[var(--color-text-muted)]" />
              <span>main.jsx</span>
            </div>
          </div>

          <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
            <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
            <span>public</span>
          </div>

          <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
            <FileText size={14} className="text-[var(--color-text-muted)]" />
            <span>.env</span>
          </div>
          <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
            <FileText size={14} className="text-[var(--color-text-muted)]" />
            <span>package.json</span>
          </div>
          <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
            <FileText size={14} className="text-[var(--color-text-muted)]" />
            <span>tailwind.config.js</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)

    },
  ]

  // Handle panel maximize (currently navigates to forge page)
  const handlePanelMaximize = (panelType) => {
    if (panelType === 'forge') {
      router.visit('/forge', { preserveState: true })
    }
    // Close the panel if it's a side panel that's being "maximized" into a full-page view
    setPanelStates(prev => ({
      ...prev,
      [panelType]: false
    }))
  }

  // Handle toggling the visibility of a panel
  const handlePanelToggle = (panelType) => {
    setPanelStates(prev => ({
      ...prev,
      [panelType]: !prev[panelType]
    }))
  }

  // Handle switching between 'forge' and 'source' modes
  const handleModeSwitch = (mode) => {
    if (mode === 'forge') {
      router.visit('/forge', { preserveState: true })
    }
    // 'source' mode is the current page, so no action is needed if 'source' is selected
  }

  return (
    <AuthenticatedLayout
      // Pass panel control functions and states to the header component
      headerProps={{
        onPanelToggle: handlePanelToggle,
        panelStates: panelStates,
        onModeSwitch: handleModeSwitch
      }}
    >
      <Head title="Source - Code Editor" />

      {/* Main Code Editor Area: Occupies the remaining space, mimicking a code editor layout */}
      <div className="h-[calc(100vh-60px)] flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        {/* Editor Tabs: Mock tabs for open files */}
        <div className="flex border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          {/* Active tab */}
          <div className="p-2 px-4 border-r border-[var(--color-border)] bg-[var(--color-bg-active)] text-[var(--color-text-active)] cursor-pointer">
            App.jsx <span className="ml-2 text-xs text-[var(--color-text-muted)]">x</span>
          </div>
          {/* Inactive tabs */}
          <div className="p-2 px-4 border-r border-[var(--color-border)] text-[var(--color-text-muted)] cursor-pointer hover:bg-[var(--color-bg-hover)]">
            index.js <span className="ml-2 text-xs">x</span>
          </div>
          <div className="p-2 px-4 text-[var(--color-text-muted)] cursor-pointer hover:bg-[var(--color-bg-hover)]">
            styles.css <span className="ml-2 text-xs">x</span>
          </div>
        </div>

        {/* Code Editor Content Area: Placeholder for the actual code editor */}
        <div className="flex-grow p-4 overflow-auto font-mono text-sm">
          {/* This `pre` and `code` block simulates a code editor with syntax highlighting */}
          <pre className="whitespace-pre-wrap">
            <code className="language-javascript">
{`import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Panel from '@/Components/Panel';

export default function SourcePage({ projectId, frameId }) {
  const [panelStates, setPanelStates] = useState({
    forge: false,
    source: false
  });

  const handlePanelClose = (panelId) => {
    console.log(\`Panel \${panelId} closed\`);
  };

  const handlePanelStateChange = (hasRightPanels) => {
    console.log(\`Right panels active: \${hasRightPanels}\`);
  };

  const defaultPanels = [
    {
      id: 'explorer',
      title: 'EXPLORER',
      content: (
        <div className="flex flex-col h-full bg-[var(--color-bg-panel)] text-[var(--color-text)]">
          {/* Explorer Header */}
          <div className="flex items-center justify-between p-2 border-b border-[var(--color-border)] text-xs uppercase font-semibold text-[var(--color-text-muted)]">
            <span>Workspace</span>
            <div className="flex space-x-2">
              <span className="cursor-pointer hover:text-[var(--color-primary)]" title="New File">📄</span>
              <span className="cursor-pointer hover:text-[var(--color-primary)]" title="New Folder">📁</span>
              <span className="cursor-pointer hover:text-[var(--color-primary)]" title="Refresh Explorer">🔄</span>
              <span className="cursor-pointer hover:text-[var(--color-primary)]" title="Collapse All Folders">📂</span>
            </div>
          </div>

          {/* File Tree Area */}
          <div className="flex-grow overflow-y-auto p-2 text-sm">
            <div className="mb-2">
              <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
                <span className="text-[var(--color-text-muted)]">▼</span>
                <span>MyWebsiteProject</span>
              </div>
              <div className="ml-4">
                <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
                  <span className="text-[var(--color-text-muted)]">▶</span>
                  <span>src</span>
                </div>
                <div className="ml-4">
                  <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
                    <span className="text-[var(--color-text-muted)]">▶</span>
                    <span>Components</span>
                  </div>
                  <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
                    <span className="text-[var(--color-text-muted)]">▶</span>
                    <span>Layouts</span>
                  </div>
                  <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
                    <span className="text-[var(--color-text-muted)]">▶</span>
                    <span>Pages</span>
                  </div>
                  <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
                    <span className="text-[var(--color-text-muted)]">📄 App.jsx</span>
                  </div>
                  <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
                    <span className="text-[var(--color-text-muted)]">📄 main.jsx</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
                  <span className="text-[var(--color-text-muted)]">▶</span>
                  <span>public</span>
                </div>
                <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
                  <span className="text-[var(--color-text-muted)]">📄 .env</span>
                </div>
                <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
                  <span className="text-[var(--color-text-muted)]">📄 package.json</span>
                </div>
                <div className="flex items-center space-x-1 cursor-pointer hover:bg-[var(--color-bg-hover)] p-1 rounded">
                  <span className="text-[var(--color-text-muted)]">📄 tailwind.config.js</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
  ];

  const handlePanelMaximize = (panelType) => {
    if (panelType === 'forge') {
      router.visit('/forge', { preserveState: true });
    }
    setPanelStates(prev => ({
      ...prev,
      [panelType]: false
    }));
  };

  const handlePanelToggle = (panelType) => {
    setPanelStates(prev => ({
      ...prev,
      [panelType]: !prev[panelType]
    }));
  };

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

      <div className="h-[calc(100vh-60px)] flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        {/* Editor Tabs */}
        <div className="flex border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <div className="p-2 px-4 border-r border-[var(--color-border)] bg-[var(--color-bg-active)] text-[var(--color-text-active)] cursor-pointer">
            App.jsx <span className="ml-2 text-xs text-[var(--color-text-muted)]">x</span>
          </div>
          <div className="p-2 px-4 border-r border-[var(--color-border)] text-[var(--color-text-muted)] cursor-pointer hover:bg-[var(--color-bg-hover)]">
            index.js <span className="ml-2 text-xs">x</span>
          </div>
          <div className="p-2 px-4 text-[var(--color-text-muted)] cursor-pointer hover:bg-[var(--color-bg-hover)]">
            styles.css <span className="ml-2 text-xs">x</span>
          </div>
        </div>

        {/* Code Editor Content Area */}
        <div className="flex-grow p-4 overflow-auto font-mono text-sm">
          {/* This is where your actual code editor component would go */}
          <p className="text-[var(--color-text-muted)]">// Start coding here...</p>
          <p>function Welcome() {'{'}</p>
          <p className="ml-4">return &lt;h1&gt;Hello, World!&lt;/h1&gt;;</p>
          <p>{'}'}</p>
          <p>export default Welcome;</p>
        </div>

        {/* Terminal/Output Area */}
        <div className="h-48 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex flex-col">
          <div className="flex border-b border-[var(--color-border)]">
            <div className="p-2 px-4 border-r border-[var(--color-border)] bg-[var(--color-bg-active)] text-[var(--color-text-active)] text-sm cursor-pointer">
              Terminal
            </div>
            <div className="p-2 px-4 border-r border-[var(--color-border)] text-[var(--color-text-muted)] text-sm cursor-pointer hover:bg-[var(--color-bg-hover)]">
              Problems
            </div>
            <div className="p-2 px-4 text-[var(--color-text-muted)] text-sm cursor-pointer hover:bg-[var(--color-bg-hover)]">
              Output
            </div>
          </div>
          <div className="flex-grow p-2 overflow-auto font-mono text-xs text-[var(--color-text-muted)]">
            <p>&gt; npm run dev</p>
            <p>&gt; vite</p>
            <p className="text-green-500">
              VITE v5.2.11 ready in 320 ms
            </p>
            <p className="text-blue-400">
              ➜ Local: http://localhost:5173/
            </p>
            <p className="text-blue-400">
              ➜ Network: use --host to expose
            </p>
            <p className="text-blue-400">
              ➜ press h + enter to show help
            </p>
          </div>
        </div>
      </div>

      {/* Panel System */}
      <Panel
        isOpen={true} // The explorer panel is always open in Source mode
        initialPanels={defaultPanels}
        allowedDockPositions={['left']} // It's docked to the left
        onPanelClose={handlePanelClose}
        onPanelStateChange={handlePanelStateChange}
        snapToEdge={true}
      />
    </AuthenticatedLayout>
  );
}
`}
            </code>
          </pre>
        </div>

        {/* Terminal/Output Area: Mock terminal at the bottom */}
        <div className="h-48 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex flex-col">
          {/* Terminal tabs */}
          <div className="flex border-b border-[var(--color-border)]">
            <div className="p-2 px-4 border-r border-[var(--color-border)] bg-[var(--color-bg-active)] text-[var(--color-text-active)] text-sm cursor-pointer">
              Terminal
            </div>
            <div className="p-2 px-4 border-r border-[var(--color-border)] text-[var(--color-text-muted)] text-sm cursor-pointer hover:bg-[var(--color-bg-hover)]">
              Problems
            </div>
            <div className="p-2 px-4 text-[var(--color-text-muted)] text-sm cursor-pointer hover:bg-[var(--color-bg-hover)]">
              Output
            </div>
          </div>
          {/* Terminal content */}
          <div className="flex-grow p-2 overflow-auto font-mono text-xs text-[var(--color-text-muted)]">
            <p>&gt; npm run dev</p>
            <p>&gt; vite</p>
            <p className="text-green-500">
              VITE v5.2.11 ready in 320 ms
            </p>
            <p className="text-blue-400">
              ➜ Local: http://localhost:5173/
            </p>
            <p className="text-blue-400">
              ➜ Network: use --host to expose
            </p>
            <p className="text-blue-400">
              ➜ press h + enter to show help
            </p>
          </div>
        </div>
      </div>

      {/* Panel System: Configured for the left-docked explorer panel */}
      <Panel
        isOpen={true} // The explorer panel is always open in Source mode
        initialPanels={defaultPanels}
        allowedDockPositions={['left']} // It's docked to the left
        onPanelClose={handlePanelClose}
        onPanelStateChange={handlePanelStateChange}
        snapToEdge={true}
      />
    </AuthenticatedLayout>
  );
}
