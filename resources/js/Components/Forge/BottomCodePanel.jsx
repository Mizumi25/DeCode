import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  GripVertical, 
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

  // Tab icons configuration
  const tabIcons = {
    react: (
      <svg width="16" height="16" viewBox="0 0 30 30" className="flex-shrink-0">
        <path fill="#61DAFB" d="M 10.679688 4.1816406 C 10.068687 4.1816406 9.502 4.3184219 9 4.6074219 C 7.4311297 5.5132122 6.8339651 7.7205462 7.1503906 10.46875 C 4.6127006 11.568833 3 13.188667 3 15 C 3 16.811333 4.6127006 18.431167 7.1503906 19.53125 C 6.8341285 22.279346 7.4311297 24.486788 9 25.392578 C 9.501 25.681578 10.067687 25.818359 10.679688 25.818359 C 11.982314 25.818359 13.48785 25.164589 15 24.042969 C 16.512282 25.164589 18.01964 25.818359 19.322266 25.818359 C 19.933266 25.818359 20.499953 25.681578 21.001953 25.392578 C 22.570814 24.486793 23.167976 22.279432 22.851562 19.53125 C 25.388297 18.431178 27 16.81094 27 15 C 27 13.188667 25.387299 11.568833 22.849609 10.46875 C 23.165872 7.7206538 22.56887 5.5132122 21 4.6074219 C 20.499 4.3174219 19.932312 4.1816406 19.320312 4.1816406 C 18.017686 4.1816406 16.51215 4.8354109 15 5.9570312 C 13.487763 4.8354109 11.981863 4.1816406 10.679688 4.1816406 z M 10.679688 5.9316406 C 11.461321 5.9316406 12.49496 6.3472486 13.617188 7.1171875 C 12.95737 7.7398717 12.311153 8.4479321 11.689453 9.2363281 C 10.681079 9.3809166 9.7303472 9.5916908 8.8496094 9.8554688 C 8.8448793 9.7943902 8.8336776 9.7303008 8.8300781 9.6699219 C 8.7230781 7.8899219 9.114 6.5630469 9.875 6.1230469 C 10.1 5.9930469 10.362688 5.9316406 10.679688 5.9316406 z M 19.320312 5.9316406 C 19.636312 5.9316406 19.9 5.9930469 20.125 6.1230469 C 20.886 6.5620469 21.276922 7.8899219 21.169922 9.6699219 C 21.166295 9.7303008 21.155145 9.7943902 21.150391 9.8554688 C 20.2691 9.5915252 19.317669 9.3809265 18.308594 9.2363281 C 17.686902 8.4480417 17.042616 7.7397993 16.382812 7.1171875 C 17.504962 6.3473772 18.539083 5.9316406 19.320312 5.9316406 z M 15 8.2285156 C 15.27108 8.4752506 15.540266 8.7360345 15.8125 9.0214844 C 15.542718 9.012422 15.274373 9 15 9 C 14.726286 9 14.458598 9.0124652 14.189453 9.0214844 C 14.461446 8.7363308 14.729174 8.4750167 15 8.2285156 z M 15 10.75 C 15.828688 10.75 16.614128 10.796321 17.359375 10.876953 C 17.813861 11.494697 18.261774 12.147811 18.681641 12.875 C 19.084074 13.572033 19.439938 14.285488 19.753906 15 C 19.439896 15.714942 19.084316 16.429502 18.681641 17.126953 C 18.263078 17.852044 17.816279 18.500949 17.363281 19.117188 C 16.591711 19.201607 15.800219 19.25 15 19.25 C 14.171312 19.25 13.385872 19.203679 12.640625 19.123047 C 12.186139 18.505303 11.738226 17.854142 11.318359 17.126953 C 10.915684 16.429502 10.560194 15.714942 10.246094 15 C 10.559972 14.285488 10.915926 13.572033 11.318359 12.875 C 11.737083 12.149909 12.183612 11.499051 12.636719 10.882812 C 13.408289 10.798393 14.199781 10.75 15 10.75 z M 19.746094 11.291016 C 20.142841 11.386804 20.524253 11.490209 20.882812 11.605469 C 20.801579 11.97252 20.702235 12.346608 20.589844 12.724609 C 20.461164 12.483141 20.336375 12.240903 20.197266 12 C 20.054139 11.752196 19.895244 11.529558 19.746094 11.291016 z M 10.251953 11.292969 C 10.103305 11.530776 9.9454023 11.752991 9.8027344 12 C 9.6636666 12.240944 9.5387971 12.483106 9.4101562 12.724609 C 9.29751 12.345829 9.1965499 11.971295 9.1152344 11.603516 C 9.4803698 11.48815 9.86083 11.385986 10.251953 11.292969 z M 7.46875 12.246094 C 7.6794464 13.135714 7.9717297 14.057918 8.3476562 14.998047 C 7.9725263 15.935943 7.6814729 16.856453 7.4707031 17.744141 C 5.7292327 16.903203 4.75 15.856373 4.75 15 C 4.75 14.121 5.701875 13.119266 7.296875 12.322266 C 7.3513169 12.295031 7.4131225 12.272692 7.46875 12.246094 z M 22.529297 12.255859 C 24.270767 13.096797 25.25 14.143627 25.25 15 C 25.25 15.879 24.298125 16.880734 22.703125 17.677734 C 22.648683 17.704969 22.586877 17.727308 22.53125 17.753906 C 22.32043 16.863764 22.030541 15.940699 21.654297 15 C 22.028977 14.062913 22.318703 13.142804 22.529297 12.255859 z M 15 13 C 13.895 13 13 13.895 13 15 C 13 16.105 13.895 17 15 17 C 16.105 17 17 16.105 17 15 C 17 13.895 16.105 13 15 13 z M 9.4101562 17.275391 C 9.5388794 17.516948 9.6655262 17.759008 9.8046875 18 C 9.9476585 18.247625 10.104915 18.470608 10.253906 18.708984 C 9.857159 18.613196 9.4757466 18.509791 9.1171875 18.394531 C 9.1984813 18.02725 9.2976676 17.653633 9.4101562 17.275391 z M 20.589844 17.277344 C 20.702364 17.655759 20.803517 18.02905 20.884766 18.396484 C 20.51963 18.51185 20.13917 18.614014 19.748047 18.707031 C 19.896695 18.469224 20.054598 18.247009 20.197266 18 C 20.336044 17.759557 20.461449 17.518344 20.589844 17.277344 z M 8.8496094 20.144531 C 9.7309004 20.408475 10.682331 20.619073 11.691406 20.763672 C 12.313288 21.552345 12.957085 22.261935 13.617188 22.884766 C 12.495042 23.654481 11.461272 24.070312 10.679688 24.070312 C 10.363687 24.070312 10.1 24.006953 9.875 23.876953 C 9.114 23.437953 8.7230781 22.112031 8.8300781 20.332031 C 8.8337424 20.271023 8.8447938 20.206253 8.8496094 20.144531 z M 21.150391 20.144531 C 21.155182 20.206253 21.166285 20.271023 21.169922 20.332031 C 21.276922 22.112031 20.886 23.436953 20.125 23.876953 C 19.9 24.006953 19.637312 24.070313 19.320312 24.070312 C 18.538728 24.070312 17.504958 23.654609 16.382812 22.884766 C 17.042964 22.261863 17.688542 21.552454 18.310547 20.763672 C 19.318921 20.619083 20.269653 20.408309 21.150391 20.144531 z M 14.1875 20.978516 C 14.457282 20.987578 14.725627 21 15 21 C 15.274373 21 15.542718 20.987578 15.8125 20.978516 C 15.540266 21.263964 15.27108 21.524765 15 21.771484 C 14.72892 21.524749 14.459734 21.263966 14.1875 20.978516 z"></path>
      </svg>
    ),
    html: (
      <svg width="16" height="16" viewBox="0 0 48 48" className="flex-shrink-0">
        <path fill="#E65100" d="M41,5H7l3,34l14,4l14-4L41,5L41,5z"></path>
        <path fill="#FF6D00" d="M24 8L24 39.9 35.2 36.7 37.7 8z"></path>
        <path fill="#FFF" d="M24,25v-4h8.6l-0.7,11.5L24,35.1v-4.2l4.1-1.4l0.3-4.5H24z M32.9,17l0.3-4H24v4H32.9z"></path>
        <path fill="#EEE" d="M24,30.9v4.2l-7.9-2.6L15.7,27h4l0.2,2.5L24,30.9z M19.1,17H24v-4h-9.1l0.7,12H24v-4h-4.6L19.1,17z"></path>
      </svg>
    ),
    css: (
      <svg width="16" height="16" viewBox="0 0 48 48" className="flex-shrink-0">
        <path fill="#0277BD" d="M41,5H7l3,34l14,4l14-4L41,5L41,5z"></path>
        <path fill="#039BE5" d="M24 8L24 39.9 35.2 36.7 37.7 8z"></path>
        <path fill="#FFF" d="M33.1 13L24 13 24 17 28.9 17 28.6 21 24 21 24 25 28.4 25 28.1 29.5 24 30.9 24 35.1 31.9 32.5 32.6 21 32.6 21z"></path>
        <path fill="#EEE" d="M24,13v4h-8.9l-0.3-4H24z M19.4,21l0.2,4H24v-4H19.4z M19.8,27h-4l0.3,5.5l7.9,2.6v-4.2l-4.1-1.4L19.8,27z"></path>
      </svg>
    ),
    tailwind: (
      <svg width="16" height="16" viewBox="0 0 48 48" className="flex-shrink-0">
        <path fill="#00acc1" d="M24,9.604c-6.4,0-10.4,3.199-12,9.597c2.4-3.199,5.2-4.398,8.4-3.599 c1.826,0.456,3.131,1.781,4.576,3.247C27.328,21.236,30.051,24,36,24c6.4,0,10.4-3.199,12-9.598c-2.4,3.199-5.2,4.399-8.4,3.6 c-1.825-0.456-3.13-1.781-4.575-3.247C32.672,12.367,29.948,9.604,24,9.604L24,9.604z M12,24c-6.4,0-10.4,3.199-12,9.598 c2.4-3.199,5.2-4.399,8.4-3.599c1.825,0.457,3.13,1.781,4.575,3.246c2.353,2.388,5.077,5.152,11.025,5.152 c6.4,0,10.4-3.199,12-9.598c-2.4,3.199-5.2,4.399-8.4,3.599c-1.826-0.456-3.131-1.781-4.576-3.246C20.672,26.764,17.949,24,12,24 L12,24z"></path>
      </svg>
    )
  };

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
      className="fixed bottom-4 left-0 transform  z-50 flex flex-col rounded-2xl backdrop-blur-lg border shadow-2xl"
      style={{
        height: getResponsiveHeight(),
        minHeight: codePanelMinimized ? 'auto' : '200px',
        maxHeight: codePanelMinimized ? 'auto' : '80vh',
        backgroundColor: 'rgba(var(--color-surface-rgb), 0.9)',
        
        width: '80%',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Modern Glass Morphism Resize Handle */}
      {!codePanelMinimized && (
        <div
          className="h-3 cursor-ns-resize flex items-center justify-center group transition-all"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          title="Drag to resize panel"
          style={{
            background: 'linear-gradient(180deg, rgba(var(--color-primary-rgb), 0.1) 0%, transparent 100%)',
          }}
        >
          <div 
            className="w-12 h-1 rounded-full transition-all duration-300 group-hover:w-16 group-hover:h-1.5 group-hover:bg-opacity-80"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              opacity: 0.5
            }}
          />
        </div>
      )}
      
      {/* GLASS MORPHISM HEADER */}
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0"
        style={{ 
          background: 'linear-gradient(135deg, rgba(var(--color-surface-rgb), 0.8) 0%, rgba(var(--color-bg-muted-rgb), 0.6) 100%)',
          
          minHeight: '56px',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-xl backdrop-blur-md" style={{ 
            background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.2) 0%, rgba(var(--color-primary-rgb), 0.1) 100%)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}>
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

        {/* GLASS MORPHISM CONTROLS */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Tooltips Toggle */}
          {!isMobile && (
            <div className="flex items-center gap-2 mr-2">
              <button
                onClick={() => setShowTooltips(!showTooltips)}
                className="relative w-10 h-6 rounded-full transition-all backdrop-blur-md"
                style={{
                  background: showTooltips 
                    ? 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.8) 0%, rgba(var(--color-primary-rgb), 0.6) 100%)'
                    : 'linear-gradient(135deg, rgba(var(--color-border-rgb), 0.4) 0%, rgba(var(--color-border-rgb), 0.2) 100%)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <div 
                  className="absolute top-1 w-4 h-4 rounded-full transition-transform backdrop-blur-md"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                    transform: showTooltips ? 'translateX(20px)' : 'translateX(4px)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}
                />
              </button>
            </div>
          )}

          {/* Settings */}
          {!isMobile && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl transition-all backdrop-blur-md"
              style={{ 
                background: showSettings 
                  ? 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.2) 0%, rgba(var(--color-primary-rgb), 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(var(--color-surface-rgb), 0.6) 0%, rgba(var(--color-bg-muted-rgb), 0.4) 100%)',
                color: 'var(--color-text-muted)',
                boxShadow: showSettings 
                  ? '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  : '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
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
              className="hidden sm:flex px-3 py-2 text-xs rounded-xl transition-all backdrop-blur-md items-center gap-2"
              style={{ 
                background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.8) 0%, rgba(var(--color-primary-rgb), 0.6) 100%)',
                color: 'var(--color-text)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              <Move className="w-4 h-4" />
              <span className="hidden md:inline">Move to Sidebar</span>
            </button>
          )}

          {/* Minimize/Expand */}
          <button
            onClick={() => setCodePanelMinimized(!codePanelMinimized)}
            className="p-2 rounded-xl transition-all backdrop-blur-md"
            style={{ 
              background: 'linear-gradient(135deg, rgba(var(--color-surface-rgb), 0.6) 0%, rgba(var(--color-bg-muted-rgb), 0.4) 100%)',
              color: 'var(--color-text-muted)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
            title={codePanelMinimized ? 'Expand' : 'Minimize'}
          >
            {codePanelMinimized ? <Maximize2 className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={handleClosePanel}
            className="p-2 rounded-xl transition-all backdrop-blur-md"
            style={{ 
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
              color: '#ef4444',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
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
              className="p-4 rounded-lg border-b flex-shrink-0 backdrop-blur-md" 
              style={{ 
                background: 'linear-gradient(135deg, rgba(var(--color-bg-muted-rgb), 0.8) 0%, rgba(var(--color-surface-rgb), 0.6) 100%)',
                borderColor: 'rgba(var(--color-border-rgb), 0.2)'
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
                    className="w-full px-3 py-2 rounded-xl border text-sm backdrop-blur-md"
                    style={{ 
                      background: 'rgba(var(--color-surface-rgb), 0.8)',
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
                  className="p-3 rounded-xl text-left transition-all border-2 backdrop-blur-md"
                  style={{
                    background: codeStyle === option.value 
                      ? 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.15) 0%, rgba(var(--color-primary-rgb), 0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(var(--color-bg-muted-rgb), 0.6) 0%, rgba(var(--color-surface-rgb), 0.4) 100%)',
                    color: codeStyle === option.value ? 'var(--color-primary)' : 'var(--color-text)',
                    boxShadow: codeStyle === option.value 
                      ? '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      : '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="font-semibold text-sm">{option.label}</div>
                  {!isMobile && <div className="text-xs opacity-80">{option.desc}</div>}
                </button>
              ))}
            </div>
          </div>
      
          {/* ENHANCED CODE TABS WITH ICONS */}
          <div 
            className="flex gap-1 p-2 flex-shrink-0 backdrop-blur-md"
            style={{ 
              background: 'linear-gradient(135deg, rgba(var(--color-bg-muted-rgb), 0.8) 0%, rgba(var(--color-surface-rgb), 0.6) 100%)'
            }}
          >
            {getAvailableTabs().map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveCodeTab(tab);
                  if (editorRef.current) {
                    setTimeout(() => {
                      editorRef.current.setValue(generatedCode[tab] || '');
                      editorRef.current.layout();
                    }, 50);
                  }
                }}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1 relative flex items-center justify-center gap-2 backdrop-blur-md"
                style={{
                  background: activeCodeTab === tab 
                    ? 'linear-gradient(135deg, rgba(var(--color-surface-rgb), 0.9) 0%, rgba(var(--color-surface-rgb), 0.7) 100%)'
                    : 'transparent',
                  color: activeCodeTab === tab ? 'var(--color-text)' : 'var(--color-text-muted)',
                  boxShadow: activeCodeTab === tab 
                    ? '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    : 'none'
                }}
              >
                {tabIcons[tab]}
                <span className="font-semibold">{tab.toUpperCase()}</span>
                {activeCodeTab === tab && (
                  <div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 rounded-full" 
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
              className="absolute top-3 right-3 z-10 flex gap-2 rounded-xl p-2 backdrop-blur-md"
              style={{ 
                background: 'linear-gradient(135deg, rgba(var(--color-surface-rgb), 0.9) 0%, rgba(var(--color-surface-rgb), 0.7) 100%)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15), 0 1px 0 rgba(255, 255, 255, 0.1)',
                
              }}
            >
              <button
                onClick={formatCode}
                className="p-2 rounded-lg transition-all hover:scale-110"
                style={{ 
                  color: 'var(--color-text)',
                  background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.1) 0%, rgba(var(--color-primary-rgb), 0.05) 100%)'
                }}
                title="Format Code"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg transition-all hover:scale-110"
                style={{ 
                  color: 'var(--color-text)',
                  background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.1) 0%, rgba(var(--color-primary-rgb), 0.05) 100%)'
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
                className="p-2 rounded-lg transition-all hover:scale-110"
                style={{ 
                  color: 'var(--color-text)',
                  background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.1) 0%, rgba(var(--color-primary-rgb), 0.05) 100%)'
                }}
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => generateCode(canvasComponents)}
                className="p-2 rounded-lg transition-all hover:scale-110"
                style={{ 
                  color: 'var(--color-text)',
                  background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.1) 0%, rgba(var(--color-primary-rgb), 0.05) 100%)'
                }}
                title="Regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Monaco Editor */}
            <div 
              className="h-full rounded-xl overflow-hidden border mx-2 mb-2" 
              style={{ 
                borderColor: 'rgba(var(--color-border-rgb), 0.3)',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
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
                    className="flex items-center justify-center h-full min-h-[200px] rounded-xl"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(var(--color-surface-rgb), 0.9) 0%, rgba(var(--color-bg-muted-rgb), 0.7) 100%)'
                    }}
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
          
          {/* Pro Tip - Hidden on mobile to save space */}
          {!isMobile && (
            <div 
              className="text-xs p-3 rounded-lg border mx-2 mb-2 flex items-center gap-2 flex-shrink-0 backdrop-blur-md" 
              style={{ 
                color: 'var(--color-text-muted)', 
                background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.15) 0%, rgba(var(--color-primary-rgb), 0.05) 100%)',
                borderColor: 'rgba(var(--color-primary-rgb), 0.3)'
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