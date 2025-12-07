import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FileText, Code2, Settings, Plus, X } from 'lucide-react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useCodeSyncStore } from '@/stores/useCodeSyncStore';

const tabs = [
  { name: 'App.jsx', icon: FileText, color: '#61dafb', active: true },
  { name: 'index.js', icon: FileText, color: '#f7df1e', active: false },
  { name: 'styles.css', icon: Code2, color: '#1572b6', active: false },
  { name: 'package.json', icon: Settings, color: '#68a063', active: false }
];

export default function CodeEditor() {
  const monaco = useMonaco();
  const editorRef = useRef(null);
  const [theme, setTheme] = useState('decode-theme');

  // ADDED: Connect to code sync store
  const { 
    syncedCode, 
    codeStyle, 
    activeCodeTab,
    setActiveCodeTab,
    updateSyncedCode 
  } = useCodeSyncStore();

  const [localValue, setLocalValue] = useState('');

  // ADDED: Sync from store to editor
  useEffect(() => {
    const code = syncedCode[activeCodeTab] || '';
    setLocalValue(code);
    
    // Update editor value if it's mounted
    if (editorRef.current && code !== editorRef.current.getValue()) {
      editorRef.current.setValue(code);
    }
    
    console.log('CodeEditor: Synced code from store:', {
      activeCodeTab,
      codeLength: code.length,
      codeStyle
    });
  }, [syncedCode, activeCodeTab, codeStyle]);

  // ADDED: Handle editor changes (update back to store with debounce)
  const handleEditorChange = useCallback((value) => {
    if (value === undefined || value === null) return;
    
    setLocalValue(value);
    
    // Debounce sync back to store
    const timeoutId = setTimeout(() => {
      const updatedCode = { 
        ...syncedCode, 
        [activeCodeTab]: value 
      };
      updateSyncedCode(updatedCode);
      
      console.log('CodeEditor: Updated code in store:', {
        activeCodeTab,
        codeLength: value.length
      });
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [activeCodeTab, syncedCode, updateSyncedCode]);

  // Get CSS variable value
  const getCSSVar = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  // Define custom theme from CSS variables
  const defineDecodeTheme = () => {
    if (monaco) {
      const surface = getCSSVar('--color-surface');
      const text = getCSSVar('--color-text');
      const primary = getCSSVar('--color-primary');
      const muted = getCSSVar('--color-text-muted');

      monaco.editor.defineTheme('decode-theme', {
        base: document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs',
        inherit: true,
        rules: [
          { token: '', foreground: text.replace('#', '') },
          { token: 'comment', foreground: muted.replace('#', '') },
          { token: 'keyword', foreground: primary.replace('#', '') }
        ],
        colors: {
          'editor.background': surface,
          'editor.foreground': text,
          'editorLineNumber.foreground': muted,
          'editorLineNumber.activeForeground': primary,
          'editor.selectionBackground': primary + '33',
          'editorCursor.foreground': primary
        }
      });
      monaco.editor.setTheme('decode-theme');
    }
  };

  // Re-define theme on load and when theme changes
  useEffect(() => {
    defineDecodeTheme();

    const updateTheme = () => {
      defineDecodeTheme();
      setTheme('decode-theme');
    };

    // Watch for .dark class changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Also watch system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateTheme);

    return () => {
      if (observer) observer.disconnect();
      mediaQuery.removeEventListener('change', updateTheme);
    };
  }, [monaco]);

  // Get language based on active tab
  const getLanguage = () => {
    switch (activeCodeTab) {
      case 'react':
        return 'javascript';
      case 'html':
        return 'html';
      case 'css':
      case 'tailwind':
        return 'css';
      default:
        return 'javascript';
    }
  };

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

      {/* Monaco Code Editor - MODIFIED to use synced code */}
      <div className="flex-grow flex flex-col min-h-0" style={{ backgroundColor: 'var(--color-surface)' }}>
        <Editor
          height="100%"
          language={getLanguage()}
          value={localValue}
          theme={theme}
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 13,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            renderLineHighlight: 'line',
            padding: { top: 10, bottom: 10 }
          }}
          onMount={(editor) => {
            editorRef.current = editor;
            // Set initial value from store
            if (localValue) {
              editor.setValue(localValue);
            }
          }}
          onChange={handleEditorChange}
        />
      </div>

      {/* Code Info Bar */}
      <div 
        className="flex items-center justify-between px-4 py-2 text-xs border-t"
        style={{
          backgroundColor: 'var(--color-bg-muted)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-muted)'
        }}
      >
        <div className="flex items-center gap-4">
          <span>Language: {getLanguage().toUpperCase()}</span>
          <span>Style: {codeStyle}</span>
          <span>Tab: {activeCodeTab}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${localValue ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span>{localValue ? 'Synced' : 'No content'}</span>
        </div>
      </div>
    </div>
  );
}