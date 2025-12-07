// @/Components/Forge/ModalCodePanel.jsx - NEW Modal Mode for Code Panel
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { 
  Code2, 
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
  EyeOff,
  Move,
  GripVertical
} from 'lucide-react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(Draggable);
}

const ModalCodePanel = ({ 
  showCodePanel,
  setShowCodePanel,
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
  generateCode,
  canvasComponents,
  handleCodeEdit,
  isMobile = false,
  title = "Live Code Generator",
  defaultPosition = { x: 100, y: 100 },
  defaultSize = { width: 800, height: 600 }
}) => {
  const panelRef = useRef(null);
  const headerRef = useRef(null);
  const editorContainerRef = useRef(null);
  const draggableInstance = useRef(null);
  const resizeInstance = useRef(null);
  const editorRef = useRef(null);

  // Modal states
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [modalPosition, setModalPosition] = useState(defaultPosition);
  const [modalSize, setModalSize] = useState(defaultSize);
  const [normalSize, setNormalSize] = useState(defaultSize);

  // Editor states
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(isMobile ? 12 : 14);
  const [wordWrap, setWordWrap] = useState('on');
  const [minimap, setMinimap] = useState(!isMobile);
  const [showSettings, setShowSettings] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(isMobile ? 'off' : 'on');
  const [editorMounted, setEditorMounted] = useState(false);

  const minimizedSize = { width: 400, height: 200 };

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
    monaco.editor.defineTheme('modal-dark', {
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

    const theme = isMobile ? 'modal-dark' : editorTheme;
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
  const handleEditorChange = useCallback((value) => {
    if (handleCodeEdit && value !== undefined) {
      handleCodeEdit(value, activeCodeTab);
    }
  }, [handleCodeEdit, activeCodeTab]);

  // Initialize dragging and resizing
  useEffect(() => {
    if (showCodePanel && panelRef.current && typeof window !== 'undefined') {
      // Cleanup previous instances
      if (draggableInstance.current) {
        draggableInstance.current.kill();
        draggableInstance.current = null;
      }
      if (resizeInstance.current) {
        resizeInstance.current.kill();
        resizeInstance.current = null;
      }

      // Initialize dragging - works in all states except maximized
      if (!isMaximized && headerRef.current) {
        draggableInstance.current = Draggable.create(panelRef.current, {
          trigger: headerRef.current,
          type: "x,y",
          edgeResistance: 0.65,
          bounds: "body",
          inertia: true,
          cursor: "grab",
          activeCursor: "grabbing",
          onDragStart: () => {
            setIsDragging(true);
            gsap.to(panelRef.current, {
              scale: 1.02,
              duration: 0.2,
              ease: "power2.out",
              zIndex: 1000
            });
          },
          onDrag: function() {
            setModalPosition({ x: this.x, y: this.y });
          },
          onDragEnd: () => {
            setIsDragging(false);
            gsap.to(panelRef.current, {
              scale: 1,
              duration: 0.3,
              ease: "power2.out",
              zIndex: 999
            });
          }
        })[0];
      }

      // Initialize resizing - corner handle (only when not maximized)
      if (!isMaximized && !isMobile) {
        const resizeHandle = panelRef.current.querySelector('.resize-handle');
        if (resizeHandle) {
          resizeInstance.current = Draggable.create(resizeHandle, {
            type: "x,y",
            trigger: resizeHandle,
            cursor: "nw-resize",
            onDragStart: () => {
              setIsResizing(true);
              gsap.set(panelRef.current, { transformOrigin: "top left" });
            },
            onDrag: function() {
              const rect = panelRef.current.getBoundingClientRect();
              const newWidth = Math.max(400, rect.width + this.deltaX);
              const newHeight = Math.max(300, rect.height + this.deltaY);
              
              gsap.set(panelRef.current, {
                width: newWidth + 'px',
                height: newHeight + 'px'
              });
              
              const newSize = { width: newWidth, height: newHeight };
              setModalSize(newSize);
              if (!isMinimized) {
                setNormalSize(newSize);
              }

              // Force editor layout
              if (editorRef.current) {
                setTimeout(() => editorRef.current.layout(), 50);
              }
            },
            onDragEnd: () => {
              setIsResizing(false);
            }
          })[0];
        }
      }

      return () => {
        if (draggableInstance.current) {
          draggableInstance.current.kill();
          draggableInstance.current = null;
        }
        if (resizeInstance.current) {
          resizeInstance.current.kill();
          resizeInstance.current = null;
        }
      };
    }
  }, [showCodePanel, isMaximized, isMinimized, isMobile]);

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

  // Modal control functions
  const toggleMaximize = useCallback(() => {
    if (!panelRef.current) return;
    
    const panel = panelRef.current;
    
    const tl = gsap.timeline({
      defaults: { duration: 0.4, ease: 'power3.inOut' },
      onStart: () => {
        if (!isMaximized) {
          const rect = panel.getBoundingClientRect();
          const currentSize = { width: rect.width, height: rect.height };
          if (!isMinimized) {
            setNormalSize(currentSize);
          }
        }
      },
      onComplete: () => {
        setIsMaximized(!isMaximized);
        if (editorRef.current) {
          setTimeout(() => editorRef.current.layout(), 100);
        }
      }
    });

    if (!isMaximized) {
      tl.to(panel, {
        width: '95vw',
        height: '90vh',
        x: 0,
        y: 0,
        scale: 1,
        borderRadius: '8px',
        transformOrigin: 'center center',
      });
    } else {
      const targetSize = isMinimized ? minimizedSize : normalSize;
      const restoreWidth = targetSize.width + 'px';
      const restoreHeight = targetSize.height + 'px';
      
      tl.to(panel, {
        width: restoreWidth,
        height: restoreHeight,
        x: modalPosition.x,
        y: modalPosition.y,
        borderRadius: '12px',
        scale: 1,
        transformOrigin: 'center center',
      });
    }
  }, [isMaximized, isMinimized, normalSize, modalPosition]);

  const toggleMinimize = useCallback(() => {
    if (!panelRef.current || isMaximized) return;

    const panel = panelRef.current;

    const tl = gsap.timeline({
      defaults: { duration: 0.3, ease: 'power2.inOut' },
      onComplete: () => {
        setIsMinimized(!isMinimized);
        if (editorRef.current) {
          setTimeout(() => editorRef.current.layout(), 100);
        }
      }
    });

    if (!isMinimized) {
      const rect = panel.getBoundingClientRect();
      setNormalSize({ width: rect.width, height: rect.height });
      
      tl.to(panel, {
        width: minimizedSize.width + 'px',
        height: minimizedSize.height + 'px',
        scale: 1,
        borderRadius: '12px'
      });
    } else {
      const restoreWidth = normalSize.width + 'px';
      const restoreHeight = normalSize.height + 'px';
      
      tl.to(panel, {
        width: restoreWidth,
        height: restoreHeight,
        x: modalPosition.x,
        y: modalPosition.y,
        borderRadius: '12px'
      });
    }
  }, [isMinimized, normalSize, modalPosition]);

  const handleClose = () => {
    if (!panelRef.current) return;

    const tl = gsap.timeline({
      onComplete: () => {
        setIsMaximized(false);
        setIsMinimized(false);
        setModalPosition(defaultPosition);
        setModalSize(defaultSize);
        setNormalSize(defaultSize);
        setShowCodePanel(false);
      }
    });

    tl.to(panelRef.current, {
      scale: 0.7,
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: 'power2.in'
    });
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

  if (!showCodePanel) return null;

  return (
    <AnimatePresence>
      {showCodePanel && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.8, y: -30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: -20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed will-change-transform z-[999]"
          style={{
            left: modalPosition.x,
            top: modalPosition.y,
            width: isMaximized ? '95vw' : modalSize.width,
            height: isMaximized ? '90vh' : isMinimized ? minimizedSize.height : modalSize.height,
            backgroundColor: 'var(--color-surface)',
            borderRadius: isMaximized ? '8px' : '12px',
            border: '1px solid var(--color-border)',
            boxShadow: isDragging || isMinimized
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
              : '0 20px 40px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            minWidth: isMaximized ? '95vw' : minimizedSize.width,
            minHeight: isMaximized ? '90vh' : minimizedSize.height,
            maxHeight: isMaximized ? '90vh' : '85vh',
            overflow: 'hidden',
          }}
        >
          {/* HEADER - Single clean header with drag handle */}
          <div
            ref={headerRef}
            className={`flex items-center justify-between px-4 py-3 border-b ${
              !isMaximized ? 'cursor-move' : ''
            } select-none bg-[var(--color-bg-muted)]/80 backdrop-blur-sm`}
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {!isMaximized && (
                <GripVertical className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
              )}
              <div className="p-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
                <Code2 className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>
                  {title}
                </h3>
                <p className="text-xs hidden sm:block" style={{ color: 'var(--color-text-muted)' }}>
                  Monaco Editor with real-time code generation
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
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

              {/* Minimize */}
              <button
                type="button"
                onClick={toggleMinimize}
                disabled={isMaximized}
                className="p-1.5 rounded-md transition-all duration-200 hover:bg-[var(--color-border)] disabled:opacity-50"
                style={{ color: 'var(--color-text-muted)' }}
                title={isMinimized ? 'Restore' : 'Minimize'}
              >
                <div className="w-3 h-0.5 bg-current" />
              </button>
              
              {/* Maximize */}
              <button
                type="button"
                onClick={toggleMaximize}
                className="p-1.5 rounded-md transition-all duration-200 hover:bg-[var(--color-border)]"
                style={{ color: 'var(--color-text-muted)' }}
                title={isMaximized ? 'Restore' : 'Maximize'}
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              
              {/* Close */}
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-md transition-all duration-200 hover:bg-red-500/10 hover:text-red-500"
                style={{ color: 'var(--color-text-muted)' }}
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
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
                        <option value="modal-dark">Modal Dark</option>
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
                    theme={isMobile ? 'modal-dark' : editorTheme}
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
            </>
          )}

          {/* Resize Handle - only when not maximized and not mobile */}
          {!isMaximized && !isMobile && (
            <div
              className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize group opacity-60 hover:opacity-100 transition-opacity"
              title="Resize modal"
            >
              <svg 
                className="w-4 h-4" 
                viewBox="0 0 16 16" 
                fill="currentColor"
                style={{ 
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  pointerEvents: 'none',
                  color: 'var(--color-text-muted)'
                }}
              >
                <path d="M16 16V10h-1v4.3L9.7 9H14V8H8v6h1v-4.3L14.3 15H10v1h6z" />
              </svg>
            </div>
          )}

          {/* Drag indicator for minimized mode */}
          {isMinimized && (
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 opacity-40 pointer-events-none">
              <div className="w-6 h-1 bg-[var(--color-text-muted)] rounded-full" />
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
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalCodePanel;