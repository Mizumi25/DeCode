import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FileText, Code2, Settings, Plus, X, File } from 'lucide-react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useCodeSyncStore } from '@/stores/useCodeSyncStore';

// File icon mapping
const getFileIcon = (fileName, extension) => {
  const iconMap = {
    jsx: { icon: Code2, color: '#61dafb' },
    js: { icon: Code2, color: '#f7df1e' },
    html: { icon: Code2, color: '#e34c26' },
    css: { icon: FileText, color: '#264de4' },
    json: { icon: Settings, color: '#e8bf6a' },
  };
  
  if (fileName === 'package.json') return { icon: Settings, color: '#e8bf6a' };
  if (fileName?.includes('vite.config')) return { icon: Settings, color: '#646cff' };
  if (fileName?.includes('tailwind.config')) return { icon: FileText, color: '#38bdf8' };
  
  return iconMap[extension] || { icon: File, color: 'var(--color-text-muted)' };
};

export default function CodeEditor({ 
  openTabs = [], 
  activeTab = null, 
  onTabChange, 
  onTabClose,
  fileContent = '',
  fileName = '',
  fileExtension = 'jsx'
}) {
  const monaco = useMonaco();
  const editorRef = useRef(null);
  const [theme, setTheme] = useState('decode-theme');

  const [localValue, setLocalValue] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ lineNumber: 1, column: 1 });

  // Update local value when file content changes
  useEffect(() => {
    setLocalValue(fileContent);
  }, [fileContent, activeTab]);

  // Handle editor changes
  const handleEditorChange = useCallback((value) => {
    if (value === undefined || value === null) return;
    setLocalValue(value);
  }, []);

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
      // 🔥 FIX: Safe observer disconnect
      try {
        if (observer && typeof observer.disconnect === 'function') {
          observer.disconnect();
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      mediaQuery.removeEventListener('change', updateTheme);
    };
  }, [monaco]);

  // Get language based on active tab
  const getLanguage = () => {
    switch (activeCodeTab) {
      case 'react': return 'javascript';
      case 'html': return 'html';
      case 'css':
      case 'tailwind': return 'css';
      default: return 'javascript';
    }
  };

  // Reverse parsing helpers
  const getParseLanguage = () => {
    switch (activeCodeTab) {
      case 'react': return 'jsx';
      case 'html': return 'html';
      case 'css':
      case 'tailwind': return 'css';
      default: return 'html';
    }
  };

  // 🔥 REMOVED: All reverse parsing functions (not needed in SourcePage)
  // SourcePage is for direct code editing only, no visual sync

  // Get language from file extension
  const getLanguageFromExtension = (ext) => {
    const langMap = {
      jsx: 'javascript',
      js: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown'
    };
    return langMap[ext] || 'javascript';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Tabs */}
      <div
        className="flex border-b backdrop-blur-sm overflow-x-auto"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div className="flex items-center space-x-1 px-4">
          {openTabs.length === 0 ? (
            <div className="flex items-center px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <FileText size={14} className="mr-2" />
              <span>No files open</span>
            </div>
          ) : (
            openTabs.map((tab) => {
              const { icon: Icon, color } = getFileIcon(tab.name, tab.extension);
              const isActive = tab.path === activeTab;
              
              return (
                <div
                  key={tab.path}
                  className={`flex items-center px-4 py-3 border-r cursor-pointer rounded-t-lg transition-all border-b-2 group ${
                    isActive
                      ? 'border-blue-400'
                      : 'border-transparent'
                  }`}
                  style={{
                    borderRightColor: 'var(--color-border)',
                    backgroundColor: isActive ? 'var(--color-primary-soft)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                    borderBottomColor: isActive ? 'var(--color-primary)' : 'transparent'
                  }}
                  onClick={() => onTabChange && onTabChange(tab.path)}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
                      e.currentTarget.style.color = 'var(--color-text)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-text)';
                    }
                  }}
                >
                  <Icon size={14} className="mr-2" style={{ color: isActive ? color : 'var(--color-text-muted)' }} />
                  <span className="text-sm font-medium whitespace-nowrap">
                    {tab.name}
                    {tab.isFrame && <span className="ml-1 text-xs">★</span>}
                  </span>
                  <button
                    className="ml-3 text-xs transition-colors opacity-0 group-hover:opacity-100"
                    style={{ color: 'var(--color-text-muted)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTabClose && onTabClose(tab.path);
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Monaco Code Editor */}
      <div className="flex-grow flex flex-col min-h-0" style={{ backgroundColor: 'var(--color-surface)' }}>
        {openTabs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center" style={{ color: 'var(--color-text-muted)' }}>
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No file selected</p>
              <p className="text-sm">Open a file from the explorer to start editing</p>
            </div>
          </div>
        ) : (
          <Editor
            height="100%"
            language={getLanguageFromExtension(fileExtension)}
            value={localValue}
            theme={theme}
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: ('ontouchstart' in window || navigator.maxTouchPoints > 0) ? 16 : 13, // 🔥 FIX: 16px minimum for touch devices
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

            // 🔥 DISABLED: All reverse parsing (causes browser freeze)
            // SourcePage is for CODE EDITING only, not visual sync
            
            // Just track cursor position
            editor.onDidChangeCursorPosition((event) => {
              setCursorPosition({ lineNumber: event.position.lineNumber, column: event.position.column });
            });

            // Track cursor position
            editor.onDidChangeCursorPosition((event) => {
              setCursorPosition({ lineNumber: event.position.lineNumber, column: event.position.column });
            });
          }}
          onChange={handleEditorChange}
          />
        )}
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
          <span>Ln {cursorPosition.lineNumber}, Col {cursorPosition.column}</span>
          {activeTab && <span>{fileName}</span>}
          <span>{getLanguageFromExtension(fileExtension)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${localValue ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span>{openTabs.length} {openTabs.length === 1 ? 'file' : 'files'} open</span>
        </div>
      </div>
    </div>
  );
}