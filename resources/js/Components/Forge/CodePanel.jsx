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
import reverseCodeParserService from '../../Services/ReverseCodeParserService.js';
import useCodePanelStore from '@/stores/useCodePanelStore';
import { defineMinimalistTheme, setMinimalistTheme } from '@/utils/monacoTheme';

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
  isMobile = false,
  selectedComponent = null, // 🔥 NEW: Pass selected component for highlighting
  // 🔥 NEW: Reverse parsing props
  onCodeToVisual = null, // Callback when code creates visual components
  onHighlightComponent = null, // Callback to highlight component in canvas
  reverseParsingEnabled = true // Enable/disable reverse parsing
}) => {
  const [editorTheme, setEditorTheme] = useState('minimalist-dark');
  const [fontSize, setFontSize] = useState(isMobile ? 16 : 14); // 🔥 FIX: 16px minimum for mobile
  const [wordWrap, setWordWrap] = useState('on'); // Enable word wrap by default on mobile
  const [minimap, setMinimap] = useState(!isMobile); // Disable minimap on mobile
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(isMobile ? 'off' : 'on');
  const [editorMounted, setEditorMounted] = useState(false);
  const editorRef = useRef(null);
  const editorContainerRef = useRef(null);
  const monacoRef = useRef(null); // 🔥 NEW: Monaco instance
  const decorationsRef = useRef([]); // 🔥 NEW: Decoration IDs
  
  // 🔥 NEW: Reverse parsing state
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [highlightedComponent, setHighlightedComponent] = useState(null);
  const [parsedComponents, setParsedComponents] = useState([]);
  const [isCodeEditing, setIsCodeEditing] = useState(false);
  const [lastCodeChange, setLastCodeChange] = useState('');

  // Code panel store for UI controls
  const { showCodeStyleTabs } = useCodePanelStore();

  // 🔥 NEW: Highlight lines for selected component
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !selectedComponent || !generatedCode.componentLineMap) {
      return;
    }

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const lineMap = generatedCode.componentLineMap;
    
    // Clear previous decorations
    if (decorationsRef.current.length > 0) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    }

    // Get line range for selected component
    const lineInfo = lineMap[selectedComponent];
    if (!lineInfo || !lineInfo[activeCodeTab]) {
      console.log('📍 No line mapping for component:', selectedComponent, 'in tab:', activeCodeTab);
      return;
    }

    const { startLine, endLine } = lineInfo[activeCodeTab];
    
    console.log('🎯 Highlighting lines', startLine, '-', endLine, 'for component:', selectedComponent);

    // Create highlight decorations
    const decorations = [];
    
    // Highlight background for all lines in range
    for (let line = startLine; line <= endLine; line++) {
      decorations.push({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: 'highlighted-code-line',
          glyphMarginClassName: 'highlighted-code-glyph'
        }
      });
    }

    // Add border decoration for the range
    decorations.push({
      range: new monaco.Range(startLine, 1, endLine, 1),
      options: {
        isWholeLine: true,
        linesDecorationsClassName: 'highlighted-code-border'
      }
    });

    // Apply decorations
    decorationsRef.current = editor.deltaDecorations([], decorations);
    
    // Scroll to the highlighted line
    editor.revealLineInCenter(startLine, monaco.editor.ScrollType.Smooth);
    
  }, [selectedComponent, activeCodeTab, generatedCode.componentLineMap, editorMounted]);

  // Mobile-optimized Monaco Editor configuration
  const editorOptions = {
    fontSize: isMobile ? 16 : fontSize, // 🔥 FIX: 16px minimum to prevent mobile zoom
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

  // 🔥 NEW: Typing effect state
  const [isTyping, setIsTyping] = useState(false);
  const [displayedCode, setDisplayedCode] = useState('');
  const typingTimeoutRef = useRef(null);

  // 🔥 NEW: Error detection state
  const [syntaxErrors, setSyntaxErrors] = useState([]);
  const errorMarkersRef = useRef([]);

  // Handle editor mount with mobile optimizations - ENHANCED
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco; // 🔥 Store monaco instance
    setEditorMounted(true);
    
    // 🔥 NEW: Real-time cursor tracking
    if (reverseParsingEnabled) {
      setupReverseParsingTracking(editor, monaco);
    }
    
    // 🎨 Configure beautiful minimalist themes
    console.log('%c🎨 MINIMALIST THEME LOADING...', 'background: #f472b6; color: white; font-size: 20px; padding: 10px; font-weight: bold;');
    
    try {
      defineMinimalistTheme(monaco);
      console.log('%c✅ Theme defined successfully!', 'background: #10b981; color: white; font-size: 16px; padding: 5px;');
    } catch (error) {
      console.error('%c❌ Theme definition failed:', 'background: #ef4444; color: white; font-size: 16px; padding: 5px;', error);
    }
    
    // Set theme based on device and preference
    const isDark = editorTheme === 'vs-dark' || editorTheme === 'mobile-dark' || editorTheme === 'minimalist-dark';
    const theme = isMobile ? 'minimalist-dark' : (isDark ? 'minimalist-dark' : 'minimalist-light');
    
    try {
      monaco.editor.setTheme(theme);
      console.log('%c✨ Theme applied: ' + theme, 'background: #a855f7; color: white; font-size: 16px; padding: 5px;');
    } catch (error) {
      console.error('%c❌ Theme application failed:', 'background: #ef4444; color: white; font-size: 16px; padding: 5px;', error);
    }

    // 🔥 NEW: Set up error detection
    editor.onDidChangeMarkers(() => {
      const model = editor.getModel();
      if (model) {
        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        setSyntaxErrors(markers);
        
        // 🔥 Dispatch error event for canvas error boxes
        window.dispatchEvent(new CustomEvent('code-syntax-errors', {
          detail: { errors: markers, code: model.getValue() }
        }));
      }
    });

    // 🔥 NEW: Highlight selected component in code
    const highlightSelectedComponent = (componentId) => {
      if (!componentId || !editor) return;
      
      const model = editor.getModel();
      if (!model) return;
      
      const code = model.getValue();
      const componentName = componentId.replace(/[^a-zA-Z0-9]/g, '');
      
      // Find component in code (simple regex search)
      const regex = new RegExp(`(?:id|className|data-component-id)=["']${componentId}["']`, 'g');
      const matches = [...code.matchAll(regex)];
      
      if (matches.length > 0) {
        const decorations = matches.map(match => ({
          range: new monaco.Range(
            code.substring(0, match.index).split('\n').length,
            1,
            code.substring(0, match.index).split('\n').length,
            1000
          ),
          options: {
            isWholeLine: true,
            className: 'selected-component-line',
            glyphMarginClassName: 'selected-component-glyph'
          }
        }));
        
        editor.deltaDecorations([], decorations);
      }
    };
    
    // Listen for component selection changes
    window.addEventListener('component-selected', (e) => {
      highlightSelectedComponent(e.detail.componentId);
    });

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

  // 🔥 Reverse parsing helpers
  const getLanguageForTab = useCallback((tab) => {
    switch (tab) {
      case 'react': return 'jsx';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'tailwind': return 'css';
      default: return 'html';
    }
  }, []);

  const highlightComponentInCanvas = useCallback((componentId, { incomplete = false } = {}) => {
    if (onHighlightComponent) {
      onHighlightComponent(componentId, { incomplete });
    } else {
      // Fallback to global event
      window.dispatchEvent(new CustomEvent('canvas-highlight-component', {
        detail: { componentId, incomplete }
      }));
    }
  }, [onHighlightComponent]);

  const parseAndSyncVisual = useCallback((code, tab, cursor) => {
    if (!reverseParsingEnabled) return;
    const language = getLanguageForTab(tab);

    try {
      const components = reverseCodeParserService.parseCodeToComponents(code, language);
      setParsedComponents(components);

      // Find component under cursor
      const compId = reverseCodeParserService.getComponentAtCursor(cursor.lineNumber || cursor.line, cursor.column);
      setHighlightedComponent(compId || null);

      // Notify canvas
      const payload = { 
        components, 
        language, 
        cursor: { line: cursor.lineNumber || cursor.line, column: cursor.column },
      };

      if (onCodeToVisual) {
        onCodeToVisual(payload);
      } else {
        window.dispatchEvent(new CustomEvent('code-to-visual-update', { detail: payload }));
      }

      if (compId) {
        const metaIncomplete = false; // can be enhanced by mapping line->meta
        highlightComponentInCanvas(compId, { incomplete: metaIncomplete });
      }
    } catch (e) {
      console.warn('Reverse parsing failed:', e);
    }
  }, [getLanguageForTab, reverseParsingEnabled, onCodeToVisual, highlightComponentInCanvas]);

  const setupReverseParsingTracking = useCallback((editor, monaco) => {
    const model = editor.getModel();
    if (!model) return;

    // Initial parse
    parseAndSyncVisual(model.getValue() || '', activeCodeTab, { lineNumber: 1, column: 1 });

    // Cursor tracking
    editor.onDidChangeCursorPosition((event) => {
      setCursorPosition({ line: event.position.lineNumber, column: event.position.column });
      const code = model.getValue() || '';
      parseAndSyncVisual(code, activeCodeTab, event.position);
    });

    // Content changes
    editor.onDidChangeModelContent((event) => {
      const code = model.getValue() || '';

      // Detect deletion
      const deletion = reverseCodeParserService.detectDeletion(lastCodeChange, code, cursorPosition.line);
      if (deletion && deletion.componentId) {
        window.dispatchEvent(new CustomEvent('canvas-element-deleted', {
          detail: deletion
        }));
      }

      setLastCodeChange(code);
      parseAndSyncVisual(code, activeCodeTab, editor.getPosition() || { lineNumber: 1, column: 1 });
    });

    // Mobile/touch enhancements: selection change also triggers
    editor.onDidChangeCursorSelection((event) => {
      const pos = event.position || event.selection?.getPosition?.() || editor.getPosition();
      if (!pos) return;
      const code = model.getValue() || '';
      parseAndSyncVisual(code, activeCodeTab, pos);
    });
  }, [activeCodeTab, parseAndSyncVisual, lastCodeChange, cursorPosition.line]);

  // 🔥 ENHANCED: Handle editor change with typing effect and two-way binding
  const handleEditorChange = useCallback((value) => {
    if (value === undefined) return;
    
    // 🔥 Typing effect: Update displayed code with animation
    setIsTyping(true);
    setDisplayedCode(value);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set typing state to false after a delay
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 300);
    
    // 🔥 Two-way binding: Update canvas if code is valid
    if (handleCodeEdit) {
      handleCodeEdit(value, activeCodeTab);
    }

    // 🔥 Reverse parsing: Update canvas from code
    try {
      const cursor = editorRef.current?.getPosition?.() || { lineNumber: 1, column: 1 };
      parseAndSyncVisual(value, activeCodeTab, cursor);
    } catch (e) {
      console.warn('Reverse parse error on change:', e);
    }
    
    // 🔥 Dispatch code change event for canvas rendering
    window.dispatchEvent(new CustomEvent('code-panel-change', {
      detail: { code: value, tab: activeCodeTab }
    }));
  }, [handleCodeEdit, activeCodeTab]);

  // 🔥 FIX: Update editor when activeCodeTab changes (auto-switch from main tab change)
  useEffect(() => {
    if (editorRef.current && generatedCode && generatedCode[activeCodeTab] !== undefined) {
      const currentValue = editorRef.current.getValue();
      const newValue = generatedCode[activeCodeTab] || '';
      
      // Only update if value is actually different
      if (currentValue !== newValue) {
        console.log('🔄 [CodePanel] Updating editor content for tab:', activeCodeTab);
        editorRef.current.setValue(newValue);
        editorRef.current.layout();
      }
    }
  }, [activeCodeTab, generatedCode]);
  
  // 🔥 NEW: Add imports to code based on style
  const addImportsToCode = useCallback((code, tab) => {
    if (!code) return code;
    
    // Check if imports already exist
    if (code.includes('import React') || code.includes('import react')) {
      return code;
    }
    
    let imports = '';
    
    if (tab === 'react' || tab === 'html') {
      if (codeStyle === 'react-tailwind' || codeStyle === 'react-css') {
        imports = "import React from 'react';\n\n";
      } else if (codeStyle === 'html-tailwind' || codeStyle === 'html-css') {
        imports = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Component</title>
    ${codeStyle === 'html-tailwind' ? '<script src="https://cdn.tailwindcss.com"></script>' : '<link rel="stylesheet" href="styles.css">'}
</head>
<body>
`;
      }
    }
    
    return imports + code;
  }, [codeStyle]);

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
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [editorMounted]);

  return (
    <div 
      className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      style={{ 
        minHeight: '200px',
        backgroundColor: isFullscreen ? 'var(--color-surface)' : 'transparent'
      }}
    >
      {/* Header - Responsive for mobile */}
      <div 
        className="flex items-center justify-between p-2 sm:p-4 flex-shrink-0 border-b"
        style={{ 
          backgroundColor: 'var(--color-bg-muted)', 
          borderColor: 'var(--color-border)' 
        }}
      >
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
            </>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-lg transition-colors"
            style={{ 
              color: 'var(--color-text-muted)',
              backgroundColor: isFullscreen ? 'var(--color-primary-soft)' : 'transparent'
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Minimize */}
          <button
            onClick={() => setCodePanelMinimized(!codePanelMinimized)}
            className="p-1.5 sm:p-2 rounded-lg transition-colors"
            style={{ 
              color: 'var(--color-text-muted)',
              backgroundColor: 'transparent'
            }}
            title={codePanelMinimized ? 'Expand' : 'Minimize'}
          >
            {codePanelMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={() => setShowCodePanel(false)}
            className="p-1.5 sm:p-2 rounded-lg transition-colors hover:bg-red-50 text-red-500 hover:text-red-600"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel - Hidden on mobile by default */}
      {showSettings && !codePanelMinimized && !isMobile && (
        <div 
          className="p-4 rounded-lg border flex-shrink-0" 
          style={{ 
            backgroundColor: 'var(--color-bg-muted)', 
            borderColor: 'var(--color-border)' 
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Theme
              </label>
              <select
                value={editorTheme}
                onChange={(e) => {
                  const newTheme = e.target.value;
                  setEditorTheme(newTheme);
                  if (monacoRef.current) {
                    monacoRef.current.editor.setTheme(newTheme);
                  }
                }}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ 
                  backgroundColor: 'var(--color-surface)', 
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <option value="minimalist-dark">Minimalist Dark ✨</option>
                <option value="minimalist-light">Minimalist Light ✨</option>
                <option value="vs-dark">VS Dark</option>
                <option value="vs">VS Light</option>
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
                style={{ accentColor: 'var(--color-primary)' }}
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
          {/* Code Style Selector - Conditional visibility */}
          {showCodeStyleTabs && (
            <div 
              className="p-2 sm:p-4 space-y-2 sm:space-y-3 flex-shrink-0 border-b"
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
          )}
      
          {/* Code tabs - Responsive */}
          <div 
            className="flex gap-1 p-1 sm:p-2 flex-shrink-0"
            style={{ backgroundColor: 'var(--color-bg-muted)' }}
          >
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
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" 
                    style={{ backgroundColor: 'var(--color-primary)' }} 
                  />
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
            <div 
              className="absolute top-2 right-2 z-10 flex gap-1 rounded-lg p-1"
              style={{ backgroundColor: 'var(--color-surface-overlay)' }}
            >
              <button
                onClick={formatCode}
                className="p-1.5 sm:p-2 rounded transition-all"
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
                className="p-1.5 sm:p-2 rounded transition-all"
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
                className="p-1.5 sm:p-2 rounded transition-all"
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
                className="p-1.5 sm:p-2 rounded transition-all"
                style={{ 
                  color: 'var(--color-text)',
                  backgroundColor: 'transparent'
                }}
                title="Regenerate"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Monaco Editor - FIXED with proper dimensions */}
            <div 
              className="h-full rounded-xl overflow-hidden border" 
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Editor
                height="100%"
                width="100%"
                language={getLanguage(activeCodeTab)}
                value={addImportsToCode(generatedCode[activeCodeTab] || '', activeCodeTab)}
                theme={isMobile ? 'minimalist-dark' : (editorTheme || 'minimalist-dark')}
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
        </>
      )}

      {/* Custom CSS for copied notification and selected component highlighting */}
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

        /* 🔥 NEW: Selected component highlighting in code panel */
        .selected-component-line {
          background: rgba(59, 130, 246, 0.2) !important;
          border-left: 3px solid rgba(59, 130, 246, 0.8) !important;
        }

        .selected-component-glyph {
          background: rgba(59, 130, 246, 0.8) !important;
        }

        /* Typing effect animation */
        .typing-effect {
          animation: typingPulse 0.3s ease-in-out;
        }

        @keyframes typingPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        /* Touch device optimizations */
        @media (pointer: coarse), (hover: none) {
          .monaco-editor .margin,
          .monaco-editor .margin-view-overlays {
            background: var(--color-surface-dark, #1a1a1a) !important;
          }
          
          .monaco-editor .current-line {
            background: var(--color-surface-overlay, rgba(255, 255, 255, 0.1)) !important;
          }
          
          .monaco-editor .view-lines {
            font-size: 16px !important; /* 🔥 FIX: 16px minimum to prevent mobile zoom */
            line-height: 24px !important;
          }
          
          /* 🔥 NEW: Prevent mobile zoom on touch */
          .monaco-editor {
            touch-action: manipulation !important;
          }
        }
        
        /* 🔥 NEW: Code highlighting styles */
        .highlighted-code-line {
          background-color: rgba(59, 130, 246, 0.15) !important;
          border-left: 3px solid #3b82f6 !important;
        }
        
        .highlighted-code-glyph {
          background-color: #3b82f6 !important;
          width: 4px !important;
          margin-left: 3px !important;
        }
        
        .highlighted-code-border {
          border-left: 2px solid #3b82f6 !important;
        }
        
        .monaco-editor .margin .highlighted-code-glyph {
          background-color: #3b82f6 !important;
          width: 5px !important;
        }
      `}</style>
    </div>
  );
};

export default CodePanel;