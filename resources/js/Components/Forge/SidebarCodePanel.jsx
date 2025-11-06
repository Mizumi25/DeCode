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
  Move
} from 'lucide-react';

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
      resizeObserver.disconnect();
    };
  }, [editorMounted]);

  return (
    <div className="h-full flex flex-col space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
            <Code className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Live Code</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Monaco Editor with real-time generation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Tooltips Toggle */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Tips</label>
            <button
              onClick={() => setShowTooltips(!showTooltips)}
              className="relative w-10 h-6 rounded-full transition-colors"
              style={{
                backgroundColor: showTooltips ? 'var(--color-primary)' : 'var(--color-border)'
              }}
            >
              <div 
                className="absolute top-1 w-4 h-4 rounded-full transition-transform"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  transform: showTooltips ? 'translateX(20px)' : 'translateX(4px)'
                }}
              />
              {showTooltips ? (
                <Eye className="absolute top-1.5 left-1.5 w-3 h-3" style={{ color: 'var(--color-surface)' }} />
              ) : (
                <EyeOff className="absolute top-1.5 right-1.5 w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
              )}
            </button>
          </div>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg transition-colors"
            style={{ 
              color: 'var(--color-text-muted)',
              backgroundColor: showSettings ? 'var(--color-primary-soft)' : 'transparent'
            }}
            title="Editor Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Move to Bottom */}
          <button
            onClick={() => setCodePanelPosition('bottom')}
            className="px-3 py-2 text-xs rounded-lg transition-colors text-white flex items-center gap-2"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Move className="w-4 h-4" />
            <span>Move to Bottom</span>
          </button>

          {/* Close */}
          <button
            onClick={() => setShowCodePanel(false)}
            className="p-2 rounded-lg transition-colors hover:bg-red-50 text-red-500 hover:text-red-600"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div 
          className="p-4 rounded-lg border flex-shrink-0" 
          style={{ 
            backgroundColor: 'var(--color-bg-muted)', 
            borderColor: 'var(--color-border)' 
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Theme
              </label>
              <select
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm"
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
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Font Size
              </label>
              <input
                type="range"
                min="10"
                max="20"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <div className="text-xs text-center mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {fontSize}px
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Code Style Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Code Style</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'react-tailwind', label: 'React + Tailwind', desc: 'Modern JSX with utility classes' },
            { value: 'react-css', label: 'React + CSS', desc: 'JSX with traditional stylesheets' },
            { value: 'html-css', label: 'HTML + CSS', desc: 'Vanilla HTML with CSS files' },
            { value: 'html-tailwind', label: 'HTML + Tailwind', desc: 'HTML with utility classes' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => {
                setCodeStyle(option.value);
                generateCode(canvasComponents);
              }}
              className="p-3 rounded-lg text-left transition-all border-2"
              style={{
                backgroundColor: codeStyle === option.value ? 'var(--color-primary-soft)' : 'var(--color-bg-muted)',
                borderColor: codeStyle === option.value ? 'var(--color-primary)' : 'var(--color-border)',
                color: codeStyle === option.value ? 'var(--color-primary)' : 'var(--color-text)'
              }}
            >
              <div className="font-semibold text-sm">{option.label}</div>
              <div className="text-xs opacity-80">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Code tabs */}
      <div 
        className="flex gap-1 p-1 rounded-lg flex-shrink-0"
        style={{ backgroundColor: 'var(--color-bg-muted)' }}
      >
        {getAvailableTabs().map(tab => (
          <button
            key={tab}
            onClick={() => setActiveCodeTab(tab)}
            className="px-3 py-2 rounded-md text-sm font-medium transition-all flex-1 relative"
            style={{
              backgroundColor: activeCodeTab === tab ? 'var(--color-surface)' : 'transparent',
              color: activeCodeTab === tab ? 'var(--color-text)' : 'var(--color-text-muted)',
              boxShadow: activeCodeTab === tab ? 'var(--shadow-sm)' : 'none'
            }}
          >
            {tab.toUpperCase()}
            {activeCodeTab === tab && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" 
                style={{ backgroundColor: 'var(--color-primary)' }} 
              />
            )}
          </button>
        ))}
      </div>
      
      {/* Monaco Editor Container */}
      <div 
        ref={editorContainerRef}
        className="flex-1 min-h-0 relative"
        style={{ minHeight: '300px' }}
      >
        {/* Toolbar */}
        <div 
          className="absolute top-2 right-2 z-10 flex gap-1 rounded-lg p-1"
          style={{ backgroundColor: 'var(--color-surface-overlay)' }}
        >
          <button
            onClick={formatCode}
            className="p-2 rounded transition-all"
            style={{ 
              color: 'var(--color-text)',
              backgroundColor: 'transparent'
            }}
            title="Format Code"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 rounded transition-all"
            style={{ 
              color: 'var(--color-text)',
              backgroundColor: 'transparent'
            }}
            title="Copy"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => downloadCode(
              generatedCode[activeCodeTab], 
              `component.${getFileExtension(activeCodeTab)}`, 
              activeCodeTab
            )}
            className="p-2 rounded transition-all"
            style={{ 
              color: 'var(--color-text)',
              backgroundColor: 'transparent'
            }}
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => generateCode(canvasComponents)}
            className="p-2 rounded transition-all"
            style={{ 
              color: 'var(--color-text)',
              backgroundColor: 'transparent'
            }}
            title="Regenerate"
          >
            <RefreshCw className="w-4 h-4" />
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
      
      {/* Pro Tip */}
      <div 
        className="text-xs p-3 rounded-lg border flex items-center gap-2 flex-shrink-0" 
        style={{ 
          color: 'var(--color-text-muted)', 
          backgroundColor: 'var(--color-primary-soft)', 
          borderColor: 'var(--color-primary)' 
        }}
      >
        <Sparkles className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
        <span>
          <strong>Pro Tips:</strong> Use Shift+Alt+F to format, Alt+Z to toggle word wrap, 
          Ctrl+/ for comments. {showTooltips ? 'Hover over code for explanations.' : ''}
        </span>
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
      `}</style>
    </div>
  );
};

export default SidebarCodePanel;