import React, { useRef, useEffect } from 'react';
import Modal from '@/Components/Modal';
import Editor from '@monaco-editor/react';
import { X, Copy, ExternalLink } from 'lucide-react';
import { useThemeStore } from '@/stores/useThemeStore';

/**
 * FileViewModal - Read-only Monaco editor modal for viewing file contents
 * Used in VoidPage when clicking files in ProjectFilesPanel
 */
const FileViewModal = ({ 
  isOpen, 
  onClose, 
  file, // { name, path, content, language }
  onOpenInSource // Function to open file in SourcePage for editing
}) => {
  const editorRef = useRef(null);
  const { theme } = useThemeStore();

  // Get Monaco editor language based on file extension
  const getLanguage = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const languageMap = {
      'jsx': 'javascript',
      'js': 'javascript',
      'tsx': 'typescript',
      'ts': 'typescript',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml',
    };
    return languageMap[ext] || 'javascript';
  };

  // Copy code to clipboard
  const handleCopy = () => {
    if (file?.content) {
      navigator.clipboard.writeText(file.content);
      // TODO: Show toast notification
    }
  };

  // Handle editor mount
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  if (!file) return null;

  return (
    <Modal 
      show={isOpen} 
      onClose={onClose}
      maxWidth="6xl"
    >
      <div 
        className="flex flex-col h-[80vh]"
        style={{
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-text)'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                {file.name}
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {file.path}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
              style={{ backgroundColor: 'var(--color-surface)' }}
              title="Copy code"
            >
              <Copy size={18} style={{ color: 'var(--color-text-muted)' }} />
            </button>

            {/* Open in Source Button */}
            {onOpenInSource && (
              <button
                onClick={() => {
                  onOpenInSource(file);
                  onClose();
                }}
                className="px-3 py-2 rounded-lg flex items-center gap-2 transition-all"
                style={{ 
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
                title="Open in SourcePage for editing"
              >
                <ExternalLink size={16} />
                <span className="text-sm font-medium">Edit in Source</span>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              <X size={18} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
        </div>

        {/* Monaco Editor - Read Only */}
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={getLanguage(file.name)}
            value={file.content || '// No content'}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            onMount={handleEditorMount}
            options={{
              readOnly: true, // 🔥 READ ONLY
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              folding: true,
              renderWhitespace: 'selection',
              cursorBlinking: 'solid',
              cursorStyle: 'line',
              // Beautiful syntax highlighting colors
              tokenColorCustomizations: {
                comments: '#6A9955', // Green
                keywords: '#569CD6', // Blue
                strings: '#CE9178', // Orange
                numbers: '#B5CEA8', // Light green
                functions: '#DCDCAA', // Yellow
                variables: '#9CDCFE', // Cyan
              }
            }}
          />
        </div>

        {/* Footer - File Info */}
        <div 
          className="flex items-center justify-between p-3 border-t text-xs"
          style={{ 
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg-muted)',
            color: 'var(--color-text-muted)'
          }}
        >
          <div className="flex items-center gap-4">
            <span>Language: {getLanguage(file.name).toUpperCase()}</span>
            <span>Lines: {file.content?.split('\n').length || 0}</span>
            <span>Read-only mode</span>
          </div>
          <div>
            <span className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-surface)' }}>
              View Only - Edit in SourcePage
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FileViewModal;
