import React from 'react';
import { FileText, Code2, SplitSquareHorizontal } from 'lucide-react';

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

export default function CodeEditor({ splitView, setSplitView }) {
  return (
    <div className="flex flex-col h-full">
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
      <div className="flex-grow flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          {/* Line numbers and code content */}
          <div className="flex" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div 
              className="text-right px-4 py-6 select-none border-r font-mono text-sm flex-shrink-0"
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
            <div className="flex-1 p-6 overflow-auto">
              <pre 
                className="whitespace-pre-wrap font-mono text-sm leading-6"
                style={{ color: 'var(--color-text)' }}
              >
                <code>{sampleCode}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}