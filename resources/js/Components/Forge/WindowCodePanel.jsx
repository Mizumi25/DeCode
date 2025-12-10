// @/Components/Forge/WindowCodePanel.jsx - NEW Window Mode for Code Panel
import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { 
  X, ChevronDown, ChevronUp, Copy, Download, Maximize2, Minimize2,
  AlignHorizontalDistributeEnd, PanelRight, SquareDashed, ExternalLink
} from 'lucide-react';
import { useThemeStore } from '@/stores/useThemeStore';
import { useForgeStore } from '@/stores/useForgeStore';

const WindowCodePanel = ({
  selectedComponentCode,
  onClose,
  onChangeMode,
  currentMode = 'window'
}) => {
  const editorRef = useRef(null);
  const windowRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 600, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const { theme } = useThemeStore();
  const isDarkMode = theme === 'dark';

  // Handle dragging
  const handleMouseDown = (e) => {
    if (e.target.closest('.window-header') && !e.target.closest('button')) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (isResizing) {
      e.preventDefault();
      e.stopPropagation();
      const newWidth = Math.max(400, resizeStart.width + (e.clientX - resizeStart.x));
      const newHeight = Math.max(300, resizeStart.height + (e.clientY - resizeStart.y));
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove, { passive: false });
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart]);

  // Handle resize start
  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  // Copy code to clipboard
  const handleCopy = () => {
    if (selectedComponentCode) {
      navigator.clipboard.writeText(selectedComponentCode);
    }
  };

  // Download code as file
  const handleDownload = () => {
    if (selectedComponentCode) {
      const blob = new Blob([selectedComponentCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'component-code.jsx';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Toggle maximize
  const handleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
      setPosition({ x: 100, y: 100 });
      setSize({ width: 600, height: 400 });
    } else {
      setIsMaximized(true);
      setPosition({ x: 0, y: 0 });
      setSize({ 
        width: window.innerWidth - 40, 
        height: window.innerHeight - 40 
      });
    }
  };

  const windowStyle = isMaximized ? {
    left: 20,
    top: 20,
    width: 'calc(100vw - 40px)',
    height: 'calc(100vh - 40px)',
  } : {
    left: position.x,
    top: position.y,
    width: size.width,
    height: size.height,
  };

  return (
    <div
      ref={windowRef}
      className="fixed z-[9999] shadow-2xl rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col"
      style={windowStyle}
    >
      {/* Window Header */}
      <div 
        className="window-header flex items-center justify-between px-4 py-2 bg-[var(--color-bg-muted)] border-b border-[var(--color-border)] cursor-move rounded-t-lg"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-[var(--color-text-muted)]" />
          <span className="text-sm font-medium text-[var(--color-text)]">Code Panel - Window Mode</span>
        </div>

        {/* Mode Switch Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChangeMode('bottom')}
            className="p-1.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
            title="Bottom Panel"
          >
            <AlignHorizontalDistributeEnd className="w-4 h-4 text-[var(--color-text-muted)]" />
          </button>
          <button
            onClick={() => onChangeMode('side')}
            className="p-1.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
            title="Side Panel"
          >
            <PanelRight className="w-4 h-4 text-[var(--color-text-muted)]" />
          </button>
          <button
            onClick={() => onChangeMode('modal')}
            className="p-1.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
            title="Modal"
          >
            <SquareDashed className="w-4 h-4 text-[var(--color-text-muted)]" />
          </button>
          <button
            onClick={() => onChangeMode('window')}
            className="p-1.5 bg-[var(--color-primary)] rounded"
            title="Window (Current)"
          >
            <ExternalLink className="w-4 h-4 text-white" />
          </button>

          <div className="w-px h-4 bg-[var(--color-border)] mx-1" />

          <button
            onClick={handleMaximize}
            className="p-1.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? (
              <Minimize2 className="w-4 h-4 text-[var(--color-text-muted)]" />
            ) : (
              <Maximize2 className="w-4 h-4 text-[var(--color-text-muted)]" />
            )}
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
            title="Copy Code"
          >
            <Copy className="w-4 h-4 text-[var(--color-text-muted)]" />
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4 text-[var(--color-text-muted)]" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-red-500 hover:text-white rounded transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={selectedComponentCode || '// Select a component to view its code'}
          theme={isDarkMode ? 'vs-dark' : 'light'}
          options={{
            readOnly: true,
            minimap: { enabled: true },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
          }}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
        />
      </div>

      {/* Resize Handle */}
      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeStart}
          style={{
            background: 'linear-gradient(135deg, transparent 50%, var(--color-border) 50%)'
          }}
        />
      )}
    </div>
  );
};

export default WindowCodePanel;
