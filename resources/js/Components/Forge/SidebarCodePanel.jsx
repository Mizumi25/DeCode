import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Code, 
  Copy, 
  Download, 
  RefreshCw, 
  Sparkles,
  Settings,
  Eye,
  EyeOff,
  X,
  Move,
  AlignHorizontalDistributeEnd,
  PanelRight,
  SquareDashed,
  ExternalLink
} from 'lucide-react';
import useCodePanelStore from '@/stores/useCodePanelStore';

const SidebarCodePanel = ({
  showTooltips,
  setShowTooltips,
  codeStyle,
  setCodeStyle,
  activeCodeTab,
  setActiveCodeTab,
  generatedCode,
  getAvailableTabs,
  copyCodeToClipboard,
  downloadCode,
  setCodePanelPosition,
  canvasComponents,
  generateCode,
  handleCodeEdit,
  setShowCodePanel
}) => {
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState('on');
  const [minimap, setMinimap] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [editorMounted, setEditorMounted] = useState(false);
  const editorRef = useRef(null);
  const editorContainerRef = useRef(null);

  // Code panel store for UI controls
  const { showCodeStyleTabs, toggleCodeStyleTabs } = useCodePanelStore();

  // Monaco Editor configuration
  const editorOptions = {
    fontSize: fontSize,
    wordWrap: wordWrap,
    minimap: { enabled: minimap },
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    formatOnPaste: true,
    formatOnType: true,
    autoIndent: 'advanced',
    bracketPairColorization: { enabled: true },
    colorDecorators: true,
    foldingHighlight: true,
    foldingImportsByDefault: false,
    unfoldOnClickAfterEndOfLine: true,
    showUnused: true,
    showDeprecated: true,
    suggest: {
      showKeywords: true,
      showSnippets: true,
      showClasses: true,
      showFunctions: true,
      showVariables: true
    },
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false
    },
    parameterHints: { enabled: true },
    hover: { enabled: true },
    contextmenu: true,
    mouseWheelZoom: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: true,
    smoothScrolling: true,
    renderWhitespace: 'none',
    renderControlCharacters: false,
    renderIndentGuides: true,
    highlightActiveIndentGuide: true,
    rulers: [],
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    scrollbar: {
      useShadows: false,
      verticalHasArrows: false,
      horizontalHasArrows: false,
      vertical: 'visible',
      horizontal: 'visible',
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10
    },
    readOnly: false,
    selectOnLineNumbers: true,
    roundedSelection: true,
    theme: editorTheme,
    fontLigatures: false
  };

  // Get language for Monaco based on active tab
  const getLanguage = (tab) => {
    switch (tab) {
      case 'react': return 'javascript';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'tailwind': return 'css';
      default: return 'javascript';
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    setEditorMounted(true);
    
    // Add keyboard shortcuts
    editor.addAction({
      id: 'format-document',
      label: 'Format Document',
      keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
      run: () => {
        editor.getAction('editor.action.formatDocument').run();
      }
    });

    editor.addAction({
      id: 'toggle-word-wrap',
      label: 'Toggle Word Wrap',
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyZ],
      run: () => {
        setWordWrap(prev => prev === 'on' ? 'off' : 'on');
      }
    });

    setTimeout(() => {
      editor.layout();
    }, 100);
  };

  // Handle editor change
  const handleEditorChange = (value) => {
    if (handleCodeEdit && value !== undefined) {
      handleCodeEdit(value, activeCodeTab);
    }
  };

  // 🔥 FIX: Update editor when activeCodeTab changes (auto-switch from main tab change)
  useEffect(() => {
    if (editorRef.current && generatedCode && generatedCode[activeCodeTab] !== undefined) {
      const currentValue = editorRef.current.getValue();
      const newValue = generatedCode[activeCodeTab] || '';
      
      // Only update if value is actually different
      if (currentValue !== newValue) {
        console.log('🔄 [Sidebar] Updating editor content for tab:', activeCodeTab);
        editorRef.current.setValue(newValue);
        editorRef.current.layout();
      }
    }
  }, [activeCodeTab, generatedCode]);

  // Copy to clipboard
  const handleCopy = async () => {
    const success = await copyCodeToClipboard(generatedCode[activeCodeTab]);
    if (success && editorRef.current) {
      // Show temporary notification
      const decorations = editorRef.current.deltaDecorations([], [
        {
          range: window.monaco
            ? new window.monaco.Range(1, 1, 1, 1)
            : { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 },
          options: {
            afterContentClassName: 'copied-notification'
          }
        }
      ]);
      
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.deltaDecorations(decorations, []);
        }
      }, 2000);
    }
  };

  // Format document
  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  // Get file extension for download
  const getFileExtension = (tab) => {
    switch (tab) {
      case 'react': return 'jsx';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'tailwind': return 'css';
      default: return 'txt';
    }
  };

  // Force editor layout on container resize
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (editorRef.current) {
        setTimeout(() => {
          editorRef.current.layout();
        }, 50);
      }
    });

    if (editorContainerRef.current) {
      resizeObserver.observe(editorContainerRef.current);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [editorMounted]);

  return (
    <div className="h-full flex flex-col space-y-3 p-3">
      {/* Simplified Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
            <Code className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          </div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Code</h3>
        </div>
        <div className="flex items-center gap-1">
          {/* Mode Switching Buttons */}
          <button
            onClick={() => setCodePanelPosition('bottom')}
            className="p-1.5 rounded transition-colors"
            style={{ 
              color: 'var(--color-text-muted)',
              backgroundColor: 'transparent'
            }}
            title="Bottom Panel"
          >
            <AlignHorizontalDistributeEnd className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCodePanelPosition('right')}
            className="p-1.5 rounded transition-colors"
            style={{ 
              color: 'white',
              backgroundColor: 'var(--color-primary)'
            }}
            title="Side Panel (Current)"
          >
            <PanelRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCodePanelPosition('modal')}
            className="p-1.5 rounded transition-colors"
            style={{ 
              color: 'var(--color-text-muted)',
              backgroundColor: 'transparent'
            }}
            title="Modal"
          >
            <SquareDashed className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCodePanelPosition('window')}
            className="p-1.5 rounded transition-colors"
            style={{ 
              color: 'var(--color-text-muted)',
              backgroundColor: 'transparent'
            }}
            title="Window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded transition-colors"
            style={{ 
              color: 'var(--color-text-muted)',
              backgroundColor: showSettings ? 'var(--color-primary-soft)' : 'transparent'
            }}
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Code Style Tabs */}
          <button
            onClick={toggleCodeStyleTabs}
            className="p-1.5 rounded transition-colors"
            style={{ 
              color: 'var(--color-text-muted)',
              backgroundColor: showCodeStyleTabs ? 'var(--color-primary-soft)' : 'transparent'
            }}
            title={showCodeStyleTabs ? 'Hide Code Style Tabs' : 'Show Code Style Tabs'}
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Settings */}
      {showSettings && (
        <div 
          className="p-2 rounded-lg border flex-shrink-0 mb-2" 
          style={{ 
            backgroundColor: 'var(--color-bg-muted)', 
            borderColor: 'var(--color-border)' 
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>Theme</label>
              <select
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value)}
                className="w-full px-2 py-1 rounded border text-xs"
                style={{ 
                  backgroundColor: 'var(--color-surface)', 
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <option value="vs-dark">Dark</option>
                <option value="vs">Light</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>Font</label>
              <input
                type="range"
                min="10"
                max="18"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <div className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                {fontSize}px
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Compact Code Style Selector - Conditional visibility */}
      {showCodeStyleTabs && (
        <div className="flex-shrink-0">
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { value: 'react-tailwind', label: 'R+T' },
              { value: 'react-css', label: 'R+C' },
              { value: 'html-css', label: 'H+C' },
              { value: 'html-tailwind', label: 'H+T' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => {
                  setCodeStyle(option.value);
                  generateCode(canvasComponents);
                }}
                className="px-2 py-1.5 rounded text-xs font-medium transition-all"
                style={{
                  backgroundColor: codeStyle === option.value ? 'var(--color-primary-soft)' : 'var(--color-bg-muted)',
                  color: codeStyle === option.value ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  boxShadow: codeStyle === option.value ? 'var(--shadow-sm)' : 'none'
                }}
                title={option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Compact Code tabs */}
      <div 
        className="flex gap-0.5 flex-shrink-0"
        style={{ backgroundColor: 'var(--color-bg-muted)', padding: '2px', borderRadius: '6px' }}
      >
        {getAvailableTabs().map(tab => (
          <button
            key={tab}
            onClick={() => setActiveCodeTab(tab)}
            className="px-2 py-1 rounded text-xs font-medium transition-all flex-1 relative"
            style={{
              backgroundColor: activeCodeTab === tab ? 'var(--color-surface)' : 'transparent',
              color: activeCodeTab === tab ? 'var(--color-text)' : 'var(--color-text-muted)',
              boxShadow: activeCodeTab === tab ? 'var(--shadow-sm)' : 'none'
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>
      
      {/* Monaco Editor Container */}
      <div 
        ref={editorContainerRef}
        className="flex-1 min-h-0 relative"
        style={{ minHeight: '300px' }}
      >
        {/* Compact Toolbar */}
        <div 
          className="absolute top-2 right-2 z-10 flex gap-0.5 rounded-lg p-1"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--color-border)'
          }}
        >
          <button
            onClick={formatCode}
            className="p-1.5 rounded transition-all hover:bg-[var(--color-primary-soft)]"
            style={{ color: 'var(--color-text)' }}
            title="Format"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded transition-all hover:bg-[var(--color-primary-soft)]"
            style={{ color: 'var(--color-text)' }}
            title="Copy"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => downloadCode(
              generatedCode[activeCodeTab], 
              `component.${getFileExtension(activeCodeTab)}`, 
              activeCodeTab
            )}
            className="p-1.5 rounded transition-all hover:bg-[var(--color-primary-soft)]"
            style={{ color: 'var(--color-text)' }}
            title="Download"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Monaco Editor */}
        <div 
          className="h-full rounded-xl overflow-hidden border" 
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Editor
            height="100%"
            width="100%"
            language={getLanguage(activeCodeTab)}
            value={generatedCode[activeCodeTab] || ''}
            theme={editorTheme}
            options={editorOptions}
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
            loading={
              <div 
                className="flex items-center justify-center h-full"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <div className="text-center">
                  <div 
                    className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full mx-auto mb-4"
                    style={{ 
                      borderColor: 'var(--color-primary)',
                      borderTopColor: 'transparent'
                    }}
                  ></div>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading Monaco Editor...</p>
                </div>
              </div>
            }
          />
        </div>
      </div>
      

      {/* Custom CSS for copied notification */}
      <style jsx>{`
        .copied-notification::after {
          content: '✓ Copied!';
          position: absolute;
          top: 0;
          right: 0;
          background: var(--color-success, #22c55e);
          color: var(--color-surface, white);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 1000;
          animation: fadeInOut 2s ease-in-out;
        }

        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }

        /* 🔥 NEW: Touch device optimizations */
        @media (pointer: coarse), (hover: none) {
          .monaco-editor {
            touch-action: manipulation !important;
          }
          
          .monaco-editor .view-lines {
            font-size: 16px !important;
            line-height: 24px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SidebarCodePanel;