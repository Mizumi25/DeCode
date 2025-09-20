// @/Components/Forge/BottomCodePanel.jsx - FIXED Single Header Version
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  GripVertical, 
  GripHorizontal, 
  Move, 
  Maximize2, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Code2,
  Copy,
  Download,
  RefreshCw,
  Sparkles,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import Editor from '@monaco-editor/react';

const BottomCodePanel = ({
  showCodePanel,
  setShowCodePanel,
  codePanelMinimized,
  setCodePanelMinimized,
  codePanelHeight,
  setCodePanelHeight,
  codePanelRef,
  moveCodePanelToRightSidebar,
  handleCodePanelDragStart,
  showTooltips,
  setShowTooltips,
  codeStyle,
  setCodeStyle,
  activeCodeTab,
  setActiveCodeTab,
  generatedCode,
  getAvailableTabs,
  highlightCode,
  handleTokenHover,
  handleTokenLeave,
  handleCodeEdit,
  copyCodeToClipboard,
  downloadCode,
  generateCode,
  canvasComponents,
  setCodePanelPosition,
  isMobile,
  windowDimensions
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartHeight, setDragStartHeight] = useState(codePanelHeight || 400);
  
  // Editor states
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(isMobile ? 12 : 14);
  const [wordWrap, setWordWrap] = useState('on');
  const [minimap, setMinimap] = useState(!isMobile);
  const [showSettings, setShowSettings] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(isMobile ? 'off' : 'on');
  const [editorMounted, setEditorMounted] = useState(false);

  const panelRef = useRef(null);
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
    readOnly: false,
    selectOnLineNumbers: !isMobile,
    roundedSelection: true,
    theme: editorTheme,
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
    monaco.editor.defineTheme('bottom-dark', {
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

    const theme = isMobile ? 'bottom-dark' : editorTheme;
    monaco.editor.setTheme(theme);

    if (isMobile) {
      editor.updateOptions({
        hover: { enabled: false },
        parameterHints: { enabled: false },
        quickSuggestions: false
      });
    }

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

    setTimeout(() => {
      editor.layout();
    }, 100);
  };

  // Handle editor change
  const handleEditorChange = React.useCallback((value) => {
    if (handleCodeEdit && value !== undefined) {
      handleCodeEdit(value, activeCodeTab);
    }
  }, [handleCodeEdit, activeCodeTab]);

  // Start drag (mouse + touch)
  const startDrag = (clientY) => {
    setIsDragging(true);
    setDragStartY(clientY);
    setDragStartHeight(codePanelHeight || 400);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseDown = (e) => startDrag(e.clientY);
  const handleTouchStart = (e) => startDrag(e.touches[0].clientY);

  // Handle move
  const handleMove = (clientY) => {
    if (!isDragging) return;
    const deltaY = dragStartY - clientY;
    const vh = window.innerHeight;
    const maxHeight = vh * 0.7;
    const newHeight = Math.max(200, Math.min(maxHeight, dragStartHeight + deltaY));
    setCodePanelHeight(newHeight);
  };

  const handleMouseMove = (e) => handleMove(e.clientY);
  const handleTouchMove = (e) => handleMove(e.touches[0].clientY);

  // End drag
  const stopDrag = () => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  const handleMouseUp = stopDrag;
  const handleTouchEnd = stopDrag;

  // Attach/remove listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragStartY, dragStartHeight]);

  // Handle close panel
  const handleClosePanel = () => {
    console.log('BottomCodePanel: Close button clicked');
    if (setShowCodePanel && typeof setShowCodePanel === 'function') {
      setShowCodePanel();
    }
  };

  // Copy to clipboard with notification
  const handleCopy = async () => {
    const success = await copyCodeToClipboard(generatedCode[activeCodeTab]);
    if (success && editorRef.current) {
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

  if (!showCodePanel) return null;

  // Responsive height
  const getResponsiveHeight = () => {
    const vh = windowDimensions?.height || window.innerHeight;
    const isMobileDevice = isMobile || window.innerWidth < 768;
    
    if (codePanelMinimized) return '60px';
    if (isMobileDevice) return `${Math.min(codePanelHeight, vh * 0.7)}px`;
    return `${Math.min(codePanelHeight, vh * 0.6)}px`;
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-50 flex flex-col"
      style={{
        height: getResponsiveHeight(),
        minHeight: codePanelMinimized ? 'auto' : '200px',
        maxHeight: codePanelMinimized ? 'auto' : '80vh',
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Resize handle */}
      {!codePanelMinimized && (
        <div
          className="h-2 cursor-ns-resize flex items-center justify-center border-b group transition-colors"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          title="Drag to resize panel"
          style={{
            backgroundColor: 'var(--color-bg-muted)',
            borderColor: 'var(--color-border)',
          }}
        >
          <GripHorizontal
            className="w-4 h-4 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </div>
      )}
      
      {/* SINGLE UNIFIED HEADER - All controls in one place */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50 flex-shrink-0"
        style={{ 
          backgroundColor: 'var(--color-bg-muted)', 
          borderColor: 'var(--color-border)',
          minHeight: '56px',
          maxHeight: '56px'
        }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {handleCodePanelDragStart && (
            <GripVertical
              className="w-4 h-4 cursor-move flex-shrink-0"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseDown={handleCodePanelDragStart}
            />
          )}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
              <Code2 className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>
                Live Code Generator
              </h3>
              <p className="text-xs hidden sm:block" style={{ color: 'var(--color-text-muted)' }}>
                {codePanelMinimized ? 'Click to expand' : 'Monaco Editor with real-time generation'}
              </p>
            </div>
          </div>
        </div>

        {/* All controls in one section */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Tooltips Toggle */}
          {!isMobile && (
            <div className="flex items-center gap-2 mr-2">
              <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                Tips
              </label>
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
          )}

          {/* Settings */}
          {!isMobile && (
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
          )}

          {/* Move to Sidebar (desktop only) */}
          {moveCodePanelToRightSidebar && (
            <button
              onClick={moveCodePanelToRightSidebar}
              className="hidden sm:flex px-3 py-2 text-xs rounded-lg transition-colors text-white items-center gap-2"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Move className="w-4 h-4" />
              <span className="hidden md:inline">Move to Sidebar</span>
            </button>
          )}

          {/* Minimize/Expand */}
          <button
            onClick={() => setCodePanelMinimized(!codePanelMinimized)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            title={codePanelMinimized ? 'Expand' : 'Minimize'}
          >
            {codePanelMinimized ? <Maximize2 className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={handleClosePanel}
            className="p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content - Only show when not minimized */}
      {!codePanelMinimized && (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {/* Settings Panel */}
          {showSettings && !isMobile && (
            <div 
              className="p-4 rounded-lg border-b flex-shrink-0" 
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
                    <option value="bottom-dark">Bottom Dark</option>
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
          <div 
            className="p-4 space-y-3 flex-shrink-0 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
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
                  className="p-3 rounded-lg text-left transition-all border-2"
                  style={{
                    backgroundColor: codeStyle === option.value ? 'var(--color-primary-soft)' : 'var(--color-bg-muted)',
                    borderColor: codeStyle === option.value ? 'var(--color-primary)' : 'var(--color-border)',
                    color: codeStyle === option.value ? 'var(--color-primary)' : 'var(--color-text)'
                  }}
                >
                  <div className="font-semibold text-sm">{option.label}</div>
                  {!isMobile && <div className="text-xs opacity-80">{option.desc}</div>}
                </button>
              ))}
            </div>
          </div>
      
          {/* Code tabs */}
          <div 
            className="flex gap-1 p-2 flex-shrink-0"
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
            style={{ minHeight: isMobile ? '200px' : '300px' }}
          >
            {/* Mobile-optimized toolbar */}
            <div 
              className="absolute top-2 right-2 z-10 flex gap-1 rounded-lg p-1"
              style={{ backgroundColor: 'var(--color-surface-overlay)' }}
            >
              <button
                onClick={formatCode}
                className="p-1.5 rounded transition-all"
                style={{ 
                  color: 'var(--color-text)',
                  backgroundColor: 'transparent'
                }}
                title="Format Code"
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded transition-all"
                style={{ 
                  color: 'var(--color-text)',
                  backgroundColor: 'transparent'
                }}
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
                className="p-1.5 rounded transition-all"
                style={{ 
                  color: 'var(--color-text)',
                  backgroundColor: 'transparent'
                }}
                title="Download"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => generateCode(canvasComponents)}
                className="p-1.5 rounded transition-all"
                style={{ 
                  color: 'var(--color-text)',
                  backgroundColor: 'transparent'
                }}
                title="Regenerate"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
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
                theme={isMobile ? 'bottom-dark' : editorTheme}
                options={editorOptions}
                onMount={handleEditorDidMount}
                onChange={handleEditorChange}
                loading={
                  <div 
                    className="flex items-center justify-center h-full min-h-[200px]"
                    style={{ backgroundColor: 'var(--color-surface)' }}
                  >
                    <div className="text-center">
                      <div 
                        className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-4 border-t-transparent rounded-full mx-auto mb-4"
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
          
          {/* Pro Tip - Hidden on mobile to save space */}
          {!isMobile && (
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
          )}
        </div>
      )}

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

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .monaco-editor .margin,
          .monaco-editor .margin-view-overlays {
            background: var(--color-surface-dark, #1a1a1a) !important;
          }
          
          .monaco-editor .current-line {
            background: var(--color-surface-overlay, rgba(255, 255, 255, 0.1)) !important;
          }
          
          .monaco-editor .view-lines {
            font-size: 12px !important;
            line-height: 18px !important;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default BottomCodePanel;