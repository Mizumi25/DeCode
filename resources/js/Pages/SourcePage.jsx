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
  FileText,
  Play,
  Square,
  RotateCcw,
  Eye,
  Code2,
  Monitor,
  Smartphone,
  Tablet,
  SplitSquareHorizontal,
  Settings,
  Search,
  GitBranch,
  Bug,
  Zap,
  Box,
  Layers,
  Type,
  Image,
  MousePointer,
  Grid3X3
} from 'lucide-react';

export default function SourcePage({ projectId, frameId }) {
  // Panel states
  const [panelStates, setPanelStates] = useState({
    forge: false,
    source: false
  })

  // Split view state
  const [splitView, setSplitView] = useState(true) // Default to true to show preview
  const [previewMode, setPreviewMode] = useState('desktop') // desktop, tablet, mobile

  // Handler for when a panel is closed
  const handlePanelClose = (panelId) => {
    console.log(`Panel ${panelId} closed`)
    setPanelStates(prev => ({
      ...prev,
      [panelId]: false
    }));
  }

  // Handler for changes in panel state
  const handlePanelStateChange = (hasRightPanels) => {
    console.log(`Right panels active: ${hasRightPanels}`)
  }

  // Define the content for the left-docked panel (Explorer)
  const explorerPanel = {
    id: 'explorer',
    title: 'EXPLORER',
    content: (
      <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
        {/* Explorer Header */}
        <div 
          className="flex items-center justify-between p-3 border-b text-xs uppercase font-semibold"
          style={{ 
            borderColor: 'var(--color-border)', 
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-bg-muted)'
          }}
        >
          <span>DeCode Project</span>
          <div className="flex space-x-2">
            <FilePlus
              size={16}
              className="cursor-pointer hover:text-[var(--color-primary)] transition-colors"
              title="New File"
            />
            <FolderPlus
              size={16}
              className="cursor-pointer hover:text-[var(--color-primary)] transition-colors"
              title="New Folder"
            />
            <RefreshCw
              size={16}
              className="cursor-pointer hover:text-[var(--color-primary)] transition-colors"
              title="Refresh Explorer"
            />
            <FolderMinus
              size={16}
              className="cursor-pointer hover:text-[var(--color-primary)] transition-colors"
              title="Collapse All Folders"
            />
          </div>
        </div>

        {/* File Tree Area */}
        <div className="flex-grow overflow-y-auto p-2 text-sm">
          <div className="mb-2">
            <div 
              className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
              style={{
                ':hover': { backgroundColor: 'var(--color-bg-muted)' }
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <ChevronDown size={14} style={{ color: 'var(--color-text)' }} />
              <span className="font-medium">MyWebsiteProject</span>
            </div>
            <div className="ml-4 space-y-1">
              {/* src folder */}
              <div 
                className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <ChevronRight size={14} style={{ color: 'var(--color-text)' }} />
                <Box size={14} style={{ color: 'var(--color-accent)' }} />
                <span>src</span>
              </div>
              <div className="ml-4 space-y-1">
                <div 
                  className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <ChevronRight size={14} style={{ color: 'var(--color-text)' }} />
                  <Box size={14} style={{ color: 'var(--color-accent)' }} />
                  <span>components</span>
                </div>
                <div 
                  className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <ChevronRight size={14} style={{ color: 'var(--color-text)' }} />
                  <Box size={14} style={{ color: 'var(--color-accent)' }} />
                  <span>layouts</span>
                </div>
                <div 
                  className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <ChevronRight size={14} style={{ color: 'var(--color-text)' }} />
                  <Box size={14} style={{ color: 'var(--color-accent)' }} />
                  <span>pages</span>
                </div>
                {/* Files */}
                <div 
                  className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
                  style={{ backgroundColor: 'var(--color-primary-soft)' }}
                >
                  <FileText size={14} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ color: 'var(--color-primary)' }} className="font-medium">App.jsx</span>
                </div>
                <div 
                  className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <FileText size={14} style={{ color: 'var(--color-primary)' }} />
                  <span>main.jsx</span>
                </div>
                <div 
                  className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <Code2 size={14} style={{ color: '#e34c26' }} />
                  <span>index.html</span>
                </div>
              </div>

              {/* public folder */}
              <div 
                className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <ChevronRight size={14} style={{ color: 'var(--color-text)' }} />
                <Box size={14} style={{ color: 'var(--color-accent)' }} />
                <span>public</span>
              </div>

              {/* Config files */}
              <div 
                className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <Settings size={14} style={{ color: '#41a6b5' }} />
                <span>.env</span>
              </div>
              <div 
                className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <Settings size={14} style={{ color: '#e8bf6a' }} />
                <span>package.json</span>
              </div>
              <div 
                className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <FileText size={14} style={{ color: 'var(--color-primary)' }} />
                <span>tailwind.config.js</span>
              </div>
              <div 
                className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <Zap size={14} style={{ color: '#e8bf6a' }} />
                <span>vite.config.js</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  };

  // Define the content for the right-docked panel (Preview/Split View)
  const previewPanel = {
    id: 'preview',
    title: 'PREVIEW',
    content: (
      <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
        {/* Preview Header */}
        <div 
          className="flex items-center justify-between p-3 border-b"
          style={{ 
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg-muted)'
          }}
        >
          <div className="flex items-center space-x-2">
            <Eye size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm font-medium">Live Preview</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-1 rounded transition-colors ${previewMode === 'desktop' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
              title="Desktop View"
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => setPreviewMode('tablet')}
              className={`p-1 rounded transition-colors ${previewMode === 'tablet' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
              title="Tablet View"
            >
              <Tablet size={16} />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-1 rounded transition-colors ${previewMode === 'mobile' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
              title="Mobile View"
            >
              <Smartphone size={16} />
            </button>
            <div className="w-px h-4" style={{ backgroundColor: 'var(--color-border)' }}></div>
            <button
              className="p-1 rounded transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              title="Refresh Preview"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-grow p-2">
          <div 
            className="h-full rounded-lg shadow-lg overflow-hidden"
            style={{ backgroundColor: '#ffffff' }}
          >
            <div className={`h-full transition-all duration-300 ${
              previewMode === 'mobile' ? 'max-w-[375px] mx-auto' :
              previewMode === 'tablet' ? 'max-w-[768px] mx-auto' : 'w-full'
            }`}>
              {/* Mock Preview Content */}
              <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 h-full">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-4xl font-bold text-gray-900 mb-6">Welcome to DeCode</h1>
                  <p className="text-lg text-gray-600 mb-8">
                    A powerful website builder with visual design and code generation capabilities.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg mb-4 flex items-center justify-center">
                        <Layers className="text-white" size={24} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Visual Design</h3>
                      <p className="text-gray-600 text-sm">Design with drag and drop components</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <div className="w-12 h-12 bg-green-500 rounded-lg mb-4 flex items-center justify-center">
                        <Code2 className="text-white" size={24} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Code Generation</h3>
                      <p className="text-gray-600 text-sm">Automatically generate clean code</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <div className="w-12 h-12 bg-purple-500 rounded-lg mb-4 flex items-center justify-center">
                        <Eye className="text-white" size={24} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Live Preview</h3>
                      <p className="text-gray-600 text-sm">See changes in real-time</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Component Library Section */}
        <div 
          className="border-t p-4 space-y-3"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-muted)' }}
        >
          <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>COMPONENT LIBRARY</h4>
          <div className="grid grid-cols-2 gap-2">
            <div 
              className="flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors border"
              style={{ 
                borderColor: 'var(--color-border)', 
                backgroundColor: 'var(--color-surface)'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-surface)'}
            >
              <Type size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="text-xs">Text</span>
            </div>
            <div 
              className="flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors border"
              style={{ 
                borderColor: 'var(--color-border)', 
                backgroundColor: 'var(--color-surface)'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-surface)'}
            >
              <MousePointer size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="text-xs">Button</span>
            </div>
            <div 
              className="flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors border"
              style={{ 
                borderColor: 'var(--color-border)', 
                backgroundColor: 'var(--color-surface)'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-surface)'}
            >
              <Image size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="text-xs">Image</span>
            </div>
            <div 
              className="flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors border"
              style={{ 
                borderColor: 'var(--color-border)', 
                backgroundColor: 'var(--color-surface)'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-surface)'}
            >
              <Grid3X3 size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="text-xs">Grid</span>
            </div>
          </div>
        </div>
      </div>
    )
  };

  // Default panels configuration
  const defaultPanels = [explorerPanel];
  const previewPanels = splitView ? [previewPanel] : [];

  // Handle panel maximize
  const handlePanelMaximize = (panelType) => {
    if (panelType === 'forge') {
      router.visit('/forge', { preserveState: true })
    }
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

  // Handle switching between modes
  const handleModeSwitch = (mode) => {
    if (mode === 'forge') {
      router.visit('/forge', { preserveState: true })
    }
  }

  const sampleCode = `import React, { useState, useEffect } from 'react';
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
    setPanelStates(prev => ({
      ...prev,
      [panelId]: false
    }));
  };

  const handlePanelStateChange = (hasRightPanels) => {
    console.log(\`Right panels active: \${hasRightPanels}\`);
  };

  useEffect(() => {
    // Component mounted
    console.log('SourcePage mounted');
    
    return () => {
      console.log('SourcePage unmounted');
    };
  }, []);

  const renderCodeEditor = () => {
    return (
      <div className="flex-grow">
        <h1 className="text-2xl font-bold">Hello DeCode!</h1>
        <p>Start building something amazing.</p>
      </div>
    );
  };

  return (
    <AuthenticatedLayout>
      <Head title="Source - Code Editor" />
      {renderCodeEditor()}
    </AuthenticatedLayout>
  );
}`;

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
        <Panel
          isOpen={true}
          initialPanels={defaultPanels}
          allowedDockPositions={['left']}
          onPanelClose={handlePanelClose}
          onPanelStateChange={handlePanelStateChange}
          snapToEdge={true}
        />

        {/* Main Code Editor Area */}
        <div 
          className="flex-1 flex flex-col"
          style={{ 
            marginLeft: '320px',
            marginRight: splitView ? '320px' : '0px'
          }}
        >
          
          {/* Editor Tabs */}
          <div 
            className="flex border-b"
            style={{ 
              borderColor: 'var(--color-border)', 
              backgroundColor: 'var(--color-bg-muted)' 
            }}
          >
            <div 
              className="flex items-center px-4 py-2 border-r cursor-pointer"
              style={{ 
                borderColor: 'var(--color-border)', 
                backgroundColor: 'var(--color-surface)', 
                color: 'var(--color-text)' 
              }}
            >
              <FileText size={14} className="mr-2" style={{ color: 'var(--color-primary)' }} />
              <span className="text-sm font-medium">App.jsx</span>
              <button className="ml-3 text-xs hover:text-[var(--color-primary)] transition-colors" style={{ color: 'var(--color-text-muted)' }}>×</button>
            </div>
            <div 
              className="flex items-center px-4 py-2 border-r cursor-pointer hover:bg-[var(--color-bg-muted)] transition-colors"
              style={{ 
                borderColor: 'var(--color-border)', 
                color: 'var(--color-text-muted)' 
              }}
            >
              <FileText size={14} className="mr-2" style={{ color: 'var(--color-primary)' }} />
              <span className="text-sm">index.js</span>
              <button className="ml-3 text-xs hover:text-[var(--color-primary)] transition-colors">×</button>
            </div>
            <div 
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-[var(--color-bg-muted)] transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Code2 size={14} className="mr-2" style={{ color: '#e34c26' }} />
              <span className="text-sm">styles.css</span>
              <button className="ml-3 text-xs hover:text-[var(--color-primary)] transition-colors">×</button>
            </div>
            
            {/* Tab Actions */}
            <div className="ml-auto flex items-center px-4">
              <button
                onClick={() => setSplitView(!splitView)}
                className={`p-2 rounded transition-colors ${
                  splitView 
                    ? 'text-[var(--color-primary)] bg-[var(--color-primary-soft)]' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-muted)]'
                }`}
                title={splitView ? 'Close Split View' : 'Open Split View'}
              >
                <SplitSquareHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Code Editor Content */}
          <div className="flex-grow flex flex-col">
            <div className="flex-1 overflow-auto">
              {/* Line numbers and code content */}
              <div className="flex" style={{ backgroundColor: 'var(--color-surface)' }}>
                <div 
                  className="text-right px-4 py-6 select-none border-r font-mono text-sm"
                  style={{ 
                    backgroundColor: 'var(--color-bg-muted)', 
                    color: 'var(--color-text-muted)',
                    borderColor: 'var(--color-border)',
                    minWidth: '60px'
                  }}
                >
                  {sampleCode.split('\n').map((_, index) => (
                    <div key={index} className="leading-6 text-xs">
                      {index + 1}
                    </div>
                  ))}
                </div>
                
                {/* Code content */}
                <div className="flex-1 p-6">
                  <pre 
                    className="whitespace-pre-wrap font-mono text-sm leading-6"
                    style={{ color: 'var(--color-text)' }}
                  >
                    <code>{sampleCode}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Terminal/Output Area */}
            <div 
              className="h-48 border-t flex flex-col"
              style={{ 
                borderColor: 'var(--color-border)', 
                backgroundColor: 'var(--color-surface)' 
              }}
            >
              {/* Terminal tabs */}
              <div 
                className="flex border-b"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div 
                  className="flex items-center px-4 py-2 border-r text-sm cursor-pointer"
                  style={{ 
                    borderColor: 'var(--color-border)', 
                    backgroundColor: 'var(--color-primary-soft)', 
                    color: 'var(--color-primary)' 
                  }}
                >
                  Terminal
                </div>
                <div 
                  className="flex items-center px-4 py-2 border-r text-sm cursor-pointer hover:bg-[var(--color-bg-muted)] transition-colors"
                  style={{ 
                    borderColor: 'var(--color-border)', 
                    color: 'var(--color-text-muted)' 
                  }}
                >
                  <Bug size={14} className="mr-2" />
                  Problems
                </div>
                <div 
                  className="flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-[var(--color-bg-muted)] transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <Search size={14} className="mr-2" />
                  Output
                </div>
                
                {/* Terminal controls */}
                <div className="ml-auto flex items-center px-4 space-x-2">
                  <button 
                    className="p-1 rounded transition-colors hover:text-[var(--color-primary)]" 
                    style={{ color: 'var(--color-text-muted)' }}
                    title="Run"
                  >
                    <Play size={14} />
                  </button>
                  <button 
                    className="p-1 rounded transition-colors hover:text-[var(--color-primary)]" 
                    style={{ color: 'var(--color-text-muted)' }}
                    title="Stop"
                  >
                    <Square size={14} />
                  </button>
                  <button 
                    className="p-1 rounded transition-colors hover:text-[var(--color-primary)]" 
                    style={{ color: 'var(--color-text-muted)' }}
                    title="Clear"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
              
              {/* Terminal content */}
              <div 
                className="flex-grow p-4 overflow-auto font-mono text-xs space-y-1"
                style={{ backgroundColor: 'var(--color-bg-muted)' }}
              >
                <div style={{ color: 'var(--color-primary)' }}>$ npm run dev</div>
                <div style={{ color: 'var(--color-accent)' }}>&gt; vite</div>
                <div style={{ color: '#10b981' }}>
                  VITE v5.2.11 ready in 320 ms
                </div>
                <div style={{ color: 'var(--color-text)' }}>
                  ➜ Local: <span style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>http://localhost:5173/</span>
                </div>
                <div style={{ color: 'var(--color-text)' }}>
                  ➜ Network: use --host to expose
                </div>
                <div style={{ color: '#10b981' }}>
                  ➜ press h + enter to show help
                </div>
                <div style={{ color: 'var(--color-text)', marginTop: '8px' }}>
                  <span style={{ color: '#10b981' }}>✓</span> ready in 145ms
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel Container - Preview (when split view is enabled) */}
        {splitView && (
          <Panel
            isOpen={true}
            initialPanels={previewPanels}
            allowedDockPositions={['right']}
            onPanelClose={handlePanelClose}
            onPanelStateChange={handlePanelStateChange}
            snapToEdge={true}
          />
        )}
      </div>
    </AuthenticatedLayout>
  );
}