import React from 'react';
import { FileText, Code2, Settings, Plus, X } from 'lucide-react';
import Editor from '@monaco-editor/react';

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

const tabs = [
  { name: 'App.jsx', icon: FileText, color: '#61dafb', active: true },
  { name: 'index.js', icon: FileText, color: '#f7df1e', active: false },
  { name: 'styles.css', icon: Code2, color: '#1572b6', active: false },
  { name: 'package.json', icon: Settings, color: '#68a063', active: false }
];

export default function CodeEditor() {
  // detect dark mode from your CSS variable or Tailwind dark class
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div className="flex flex-col h-full">
      {/* Editor Tabs */}
      <div
        className="flex border-b backdrop-blur-sm"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div className="flex items-center space-x-1 px-4">
          {tabs.map((tab) => (
            <div
              key={tab.name}
              className={`flex items-center px-4 py-3 border-r cursor-pointer rounded-t-lg transition-all border-b-2 ${
                tab.active
                  ? 'border-blue-400'
                  : 'border-transparent'
              }`}
              style={{
                borderRightColor: 'var(--color-border)',
                backgroundColor: tab.active ? 'var(--color-primary-soft)' : 'transparent',
                color: tab.active ? 'var(--color-primary)' : 'var(--color-text)',
                borderBottomColor: tab.active ? 'var(--color-primary)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (!tab.active) {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
                  e.currentTarget.style.color = 'var(--color-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (!tab.active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text)';
                }
              }}
            >
              <tab.icon size={14} className="mr-2" style={{ color: tab.color }} />
              <span className="text-sm font-medium">{tab.name}</span>
              <button
                className="ml-3 text-xs transition-colors opacity-0 hover:opacity-100"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button
            className="p-2 rounded-lg transition-all"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-text)';
              e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-muted)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Monaco Code Editor */}
      <div className="flex-grow flex flex-col min-h-0" style={{ backgroundColor: 'var(--color-surface)' }}>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue={sampleCode}
          theme={isDarkMode ? 'vs-dark' : 'light'}
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 13,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            renderLineHighlight: 'line',
            padding: { top: 10, bottom: 10 }
          }}
        />
      </div>
    </div>
  );
}
