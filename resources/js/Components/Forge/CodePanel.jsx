// @/Components/Forge/CodePanel.jsx - FIXED for mobile Monaco Editor visibility
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
  handleCodeEdit,
  isMobile = false
}) => {
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(isMobile ? 12 : 14);
  const [wordWrap, setWordWrap] = useState('on'); // Enable word wrap by default on mobile
  const [minimap, setMinimap] = useState(!isMobile); // Disable minimap on mobile
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(isMobile ? 'off' : 'on');
  const [editorMounted, setEditorMounted] = useState(false);
  const editorRef = useRef(null);
  const editorContainerRef = useRef(null);

  // Mobile-optimized Monaco Editor configuration
  const editorOptions = {
    fontSize: isMobile ? 12 : fontSize,
    wordWrap: isMobile ? 'on' : wordWrap,
    minimap: { enabled: isMobile ? false : minimap },
    lineNumbers: isMobile ? 'off' : lineNumbers,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    formatOnPaste: true,
    formatOnType: true,
    autoIndent: 'advanced',
    bracketPairColorization: { enabled: true },
    colorDecorators: !isMobile,
    foldingHighlight: !isMobile,
    foldingImportsByDefault: false,
    unfoldOnClickAfterEndOfLine: true,
    showUnused: !isMobile,
    showDeprecated: !isMobile,
    suggest: {
      showKeywords: true,
      showSnippets: !isMobile,
      showClasses: true,
      showFunctions: true,
      showVariables: true
    },
    quickSuggestions: isMobile ? false : {
      other: true,
      comments: false,
      strings: false
    },
    parameterHints: { enabled: !isMobile },
    hover: { enabled: !isMobile },
    contextmenu: !isMobile,
    mouseWheelZoom: !isMobile,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: !isMobile,
    smoothScrolling: !isMobile,
    renderWhitespace: 'none',
    renderControlCharacters: false,
    renderIndentGuides: !isMobile,
    highlightActiveIndentGuide: !isMobile,
    rulers: [],
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    scrollbar: {
      useShadows: false,
      verticalHasArrows: false,
      horizontalHasArrows: false,
      vertical: isMobile ? 'auto' : 'visible',
      horizontal: isMobile ? 'auto' : 'visible',
      verticalScrollbarSize: isMobile ? 8 : 10,
      horizontalScrollbarSize: isMobile ? 8 : 10
    },
    // Mobile-specific optimizations
    readOnly: false,
    selectOnLineNumbers: !isMobile,
    roundedSelection: true,
    theme: editorTheme,
    // Performance optimizations for mobile
    fontLigatures: false,
    disableMonospaceOptimizations: isMobile,
    stopRenderingLineAfter: isMobile ? 1000 : 10000
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

  // Handle editor mount with mobile optimizations
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    setEditorMounted(true);
    
    // Configure themes
    monaco.editor.defineTheme('mobile-dark', {
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
        'editor.background': '#1a1a1a',
        'editor.foreground': '#e1e4e8',
        'editor.lineHighlightBackground': '#2a2a2a',
        'editor.selectionBackground': '#3a3a3a',
        'editorCursor.foreground': '#e1e4e8',
        'editorWhitespace.foreground': '#484f58'
      }
    });

    // Set theme based on device
    const theme = isMobile ? 'mobile-dark' : editorTheme;
    monaco.editor.setTheme(theme);

    // Mobile-specific editor configuration
    if (isMobile) {
      // Disable hover widgets that can interfere on mobile
      editor.updateOptions({
        hover: { enabled: false },
        parameterHints: { enabled: false },
        quickSuggestions: false
      });
    }

    // Add keyboard shortcuts only for non-mobile
    if (!isMobile) {
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
    }

    // Force layout refresh after mount
    setTimeout(() => {
      editor.layout();
    }, 100);
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
    <div 
      className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}
      style={{ minHeight: '200px' }}
    >
      {/* Header - Responsive for mobile */}
      <div className="flex items-center justify-between p-2 sm:p-4 flex-shrink-0 bg-gray-50 border-b">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="p-1.5 sm:p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
            <Code className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--color-text)' }}>
              Live Code Generator
            </h3>
            <p className="text-xs hidden sm:block" style={{ color: 'var(--color-text-muted)' }}>
              Monaco Editor with real-time code generation
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Simplified mobile controls */}
          {!isMobile && (
            <>
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
            </>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Minimize */}
          <button
            onClick={() => setCodePanelMinimized(!codePanelMinimized)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            title={codePanelMinimized ? 'Expand' : 'Minimize'}
          >
            {codePanelMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={() => setShowCodePanel(false)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel - Hidden on mobile by default */}
      {showSettings && !codePanelMinimized && !isMobile && (
        <div className="p-4 rounded-lg border flex-shrink-0" style={{ 
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
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ 
                  backgroundColor: 'var(--color-surface)', 
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <option value="vs-dark">Dark</option>
                <option value="vs">Light</option>
                <option value="mobile-dark">Mobile Dark</option>
              </select>
            </div>

            {/* Font Size */}
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
              />
              <div className="text-xs text-center mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {fontSize}px
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!codePanelMinimized && (
        <>
          {/* Code Style Selector - Simplified for mobile */}
          <div className="p-2 sm:p-4 space-y-2 sm:space-y-3 flex-shrink-0 border-b">
            <label className="block text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              Code Style
            </label>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
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
                  className="p-2 sm:p-3 rounded-lg text-left transition-all border-2"
                  style={{
                    backgroundColor: codeStyle === option.value ? 'var(--color-primary-soft)' : 'var(--color-bg-muted)',
                    borderColor: codeStyle === option.value ? 'var(--color-primary)' : 'var(--color-border)',
                    color: codeStyle === option.value ? 'var(--color-primary)' : 'var(--color-text)'
                  }}
                >
                  <div className="font-semibold text-xs sm:text-sm">{option.label}</div>
                  {!isMobile && <div className="text-xs opacity-80">{option.desc}</div>}
                </button>
              ))}
            </div>
          </div>
      
          {/* Code tabs - Responsive */}
          <div className="flex gap-1 p-1 sm:p-2 bg-gray-50 flex-shrink-0">
            {getAvailableTabs().map(tab => (
              <button
                key={tab}
                onClick={() => setActiveCodeTab(tab)}
                className="px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex-1 relative"
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
          
          {/* Monaco Editor Container - FIXED sizing */}
          <div 
            ref={editorContainerRef}
            className="flex-1 min-h-0 relative"
            style={{ minHeight: isMobile ? '200px' : '300px' }}
          >
            {/* Mobile-optimized toolbar */}
            <div className="absolute top-2 right-2 z-10 flex gap-1 bg-black/70 rounded-lg p-1">
              <button
                onClick={formatCode}
                className="p-1.5 sm:p-2 rounded text-white hover:bg-white hover:bg-opacity-20 transition-all"
                title="Format Code"
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 sm:p-2 rounded text-white hover:bg-white hover:bg-opacity-20 transition-all"
                title="Copy"
              >
                <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => downloadCode(
                  generatedCode[activeCodeTab], 
                  `component.${getFileExtension(activeCodeTab)}`, 
                  activeCodeTab
                )}
                className="p-1.5 sm:p-2 rounded text-white hover:bg-white hover:bg-opacity-20 transition-all"
                title="Download"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => generateCode(canvasComponents)}
                className="p-1.5 sm:p-2 rounded text-white hover:bg-white hover:bg-opacity-20 transition-all"
                title="Regenerate"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Monaco Editor - FIXED with proper dimensions */}
            <div className="h-full rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
              <Editor
                height="100%"
                width="100%"
                language={getLanguage(activeCodeTab)}
                value={generatedCode[activeCodeTab] || ''}
                theme={isMobile ? 'mobile-dark' : editorTheme}
                options={editorOptions}
                onMount={handleEditorDidMount}
                onChange={handleEditorChange}
                loading={
                  <div className="flex items-center justify-center h-full min-h-[200px]">
                    <div className="text-center">
                      <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading Monaco Editor...</p>
                    </div>
                  </div>
                }
              />
            </div>
          </div>
          
          {/* Pro Tip - Hidden on mobile to save space */}
          {!isMobile && (
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
          )}
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

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .monaco-editor .margin,
          .monaco-editor .margin-view-overlays {
            background: #1a1a1a !important;
          }
          
          .monaco-editor .current-line {
            background: rgba(255, 255, 255, 0.1) !important;
          }
          
          .monaco-editor .view-lines {
            font-size: 12px !important;
            line-height: 18px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CodePanel;