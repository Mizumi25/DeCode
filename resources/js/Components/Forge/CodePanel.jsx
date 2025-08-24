// @/Components/Forge/CodePanel.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Code, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Copy, 
  Download, 
  RefreshCw, 
  Sparkles,
  Settings,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff
} from 'lucide-react';

const CodePanel = ({ 
  showTooltips,
  setShowTooltips,
  codePanelMinimized,
  setCodePanelMinimized,
  setShowCodePanel,
  codeStyle,
  setCodeStyle,
  activeCodeTab,
  setActiveCodeTab,
  generatedCode,
  getAvailableTabs,
  copyCodeToClipboard,
  downloadCode,
  generateCode,
  canvasComponents,
  handleCodeEdit
}) => {
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState('off');
  const [minimap, setMinimap] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lineNumbers, setLineNumbers] = useState('on');
  const editorRef = useRef(null);

  // Monaco Editor configuration
  const editorOptions = {
    fontSize,
    wordWrap,
    minimap: { enabled: minimap },
    lineNumbers,
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
    renderWhitespace: 'selection',
    renderControlCharacters: false,
    renderIndentGuides: true,
    highlightActiveIndentGuide: true,
    rulers: [],
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    scrollbar: {
      useShadows: false,
      verticalHasArrows: true,
      horizontalHasArrows: true,
      vertical: 'visible',
      horizontal: 'visible',
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10
    }
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
    
    // Configure themes
    monaco.editor.defineTheme('github-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
        { token: 'string', foreground: '9ecbff' },
        { token: 'number', foreground: '79b8ff' },
        { token: 'keyword', foreground: 'f97583' },
        { token: 'operator', foreground: 'f97583' },
        { token: 'type', foreground: 'b392f0' },
        { token: 'function', foreground: 'b392f0' },
        { token: 'variable', foreground: 'e1e4e8' }
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#e1e4e8',
        'editor.lineHighlightBackground': '#161b22',
        'editor.selectionBackground': '#264f78',
        'editorCursor.foreground': '#e1e4e8',
        'editorWhitespace.foreground': '#484f58'
      }
    });

    monaco.editor.defineTheme('github-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
        { token: 'string', foreground: '032f62' },
        { token: 'number', foreground: '005cc5' },
        { token: 'keyword', foreground: 'd73a49' },
        { token: 'operator', foreground: 'd73a49' },
        { token: 'type', foreground: '6f42c1' },
        { token: 'function', foreground: '6f42c1' },
        { token: 'variable', foreground: '24292e' }
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#24292e',
        'editor.lineHighlightBackground': '#f6f8fa',
        'editor.selectionBackground': '#0969da40',
        'editorCursor.foreground': '#24292e'
      }
    });

    // Set default theme
    monaco.editor.setTheme(editorTheme);

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
  };

  // Handle editor change
  const handleEditorChange = useCallback((value) => {
    if (handleCodeEdit && value !== undefined) {
      handleCodeEdit(value, activeCodeTab);
    }
  }, [handleCodeEdit, activeCodeTab]);

  // Copy to clipboard with notification
  const handleCopy = async () => {
    const success = await copyCodeToClipboard(generatedCode[activeCodeTab]);
    if (success && editorRef.current) {
      // Show temporary notification in editor
      const decorations = editorRef.current.deltaDecorations([], [
        {
          range: new monaco.Range(1, 1, 1, 1),
          options: {
            afterContentClassName: 'copied-notification'
          }
        }
      ]);
      
      setTimeout(() => {
        editorRef.current.deltaDecorations(decorations, []);
      }, 2000);
    }
  };

  // Format document
  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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

  return (
    <div className={`space-y-4 h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
            <Code className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Live Code Generator</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Monaco Editor with real-time code generation
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Tooltips Toggle */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
              Tooltips
            </label>
            <button
              onClick={() => setShowTooltips(!showTooltips)}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                showTooltips ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                showTooltips ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            title="Editor Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Minimize */}
          <button
            onClick={() => setCodePanelMinimized(!codePanelMinimized)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            title={codePanelMinimized ? 'Expand' : 'Minimize'}
          >
            {codePanelMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={() => setShowCodePanel(false)}
            className="p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && !codePanelMinimized && (
        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: 'var(--color-bg-muted)', 
          borderColor: 'var(--color-border)' 
        }}>
          <div className="grid grid-cols-2 gap-4">
            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Theme
              </label>
              <select
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value)}
                className="w-full px-3 py-2 rounded border"
                style={{ 
                  backgroundColor: 'var(--color-surface)', 
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <option value="vs-dark">Dark</option>
                <option value="vs">Light</option>
                <option value="github-dark">GitHub Dark</option>
                <option value="github-light">GitHub Light</option>
                <option value="hc-black">High Contrast Dark</option>
                <option value="hc-light">High Contrast Light</option>
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Font Size
              </label>
              <input
                type="range"
                min="12"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-center mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {fontSize}px
              </div>
            </div>

            {/* Word Wrap */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={wordWrap === 'on'}
                  onChange={(e) => setWordWrap(e.target.checked ? 'on' : 'off')}
                  className="rounded"
                />
                <span className="text-sm" style={{ color: 'var(--color-text)' }}>Word Wrap</span>
              </label>
            </div>

            {/* Minimap */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={minimap}
                  onChange={(e) => setMinimap(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm" style={{ color: 'var(--color-text)' }}>Minimap</span>
              </label>
            </div>

            {/* Line Numbers */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Line Numbers
              </label>
              <select
                value={lineNumbers}
                onChange={(e) => setLineNumbers(e.target.value)}
                className="w-full px-3 py-2 rounded border"
                style={{ 
                  backgroundColor: 'var(--color-surface)', 
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <option value="on">On</option>
                <option value="off">Off</option>
                <option value="relative">Relative</option>
                <option value="interval">Interval</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {!codePanelMinimized && (
        <>
          {/* Code Style Selector */}
          <div className="space-y-3 flex-shrink-0">
            <label className="block text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              Code Style Combination
            </label>
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
          <div className="flex gap-1 p-1 rounded-lg flex-shrink-0" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
            {getAvailableTabs().map(tab => (
              <button
                key={tab}
                onClick={() => setActiveCodeTab(tab)}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 relative"
                style={{
                  backgroundColor: activeCodeTab === tab ? 'var(--color-surface)' : 'transparent',
                  color: activeCodeTab === tab ? 'var(--color-text)' : 'var(--color-text-muted)',
                  boxShadow: activeCodeTab === tab ? 'var(--shadow-sm)' : 'none'
                }}
              >
                {tab.toUpperCase()}
                {activeCodeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
                )}
              </button>
            ))}
          </div>
          
          {/* Monaco Editor */}
          <div className="flex-1 min-h-0 relative">
            {/* Toolbar */}
            <div className="absolute top-2 right-2 z-10 flex gap-1 bg-black/50 rounded-lg p-1">
              <button
                onClick={formatCode}
                className="p-2 rounded text-white hover:bg-white hover:bg-opacity-20 transition-all"
                title="Format Code (Shift+Alt+F)"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                className="p-2 rounded text-white hover:bg-white hover:bg-opacity-20 transition-all"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => downloadCode(
                  generatedCode[activeCodeTab], 
                  `component.${getFileExtension(activeCodeTab)}`, 
                  activeCodeTab
                )}
                className="p-2 rounded text-white hover:bg-white hover:bg-opacity-20 transition-all"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => generateCode(canvasComponents)}
                className="p-2 rounded text-white hover:bg-white hover:bg-opacity-20 transition-all"
                title="Regenerate code"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Monaco Editor */}
            <div className="h-full rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
              <Editor
                height="100%"
                language={getLanguage(activeCodeTab)}
                value={generatedCode[activeCodeTab] || ''}
                theme={editorTheme}
                options={editorOptions}
                onMount={handleEditorDidMount}
                onChange={handleEditorChange}
                loading={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p style={{ color: 'var(--color-text-muted)' }}>Loading Monaco Editor...</p>
                    </div>
                  </div>
                }
              />
            </div>
          </div>
          
          {/* Pro Tip */}
          <div className="text-xs p-3 rounded-lg border flex items-center gap-2 flex-shrink-0" style={{ 
            color: 'var(--color-text-muted)', 
            backgroundColor: 'var(--color-primary-soft)', 
            borderColor: 'var(--color-primary)' 
          }}>
            <Sparkles className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            <span>
              <strong>Pro Tips:</strong> Use Shift+Alt+F to format, Alt+Z to toggle word wrap, 
              Ctrl+/ for comments. {showTooltips ? 'Hover over code for explanations.' : ''}
            </span>
          </div>
        </>
      )}

      {/* Custom CSS for copied notification */}
      <style jsx>{`
        .copied-notification::after {
          content: '✓ Copied!';
          position: absolute;
          top: 0;
          right: 0;
          background: #22c55e;
          color: white;
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

export default CodePanel;