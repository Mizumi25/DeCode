import React, { useState, useEffect } from 'react';
import { X, FileText, Code2, Settings, File } from 'lucide-react';
import Editor from '@monaco-editor/react';

// File icon mapping
const getFileIcon = (fileName, extension) => {
  const iconMap = {
    jsx: { icon: Code2, color: '#61dafb' },
    js: { icon: Code2, color: '#f7df1e' },
    html: { icon: Code2, color: '#e34c26' },
    css: { icon: FileText, color: '#264de4' },
    json: { icon: Settings, color: '#e8bf6a' },
  };
  
  if (fileName === 'package.json') return { icon: Settings, color: '#e8bf6a' };
  if (fileName?.includes('vite.config')) return { icon: Settings, color: '#646cff' };
  if (fileName?.includes('tailwind.config')) return { icon: FileText, color: '#38bdf8' };
  
  return iconMap[extension] || { icon: File, color: 'var(--color-text-muted)' };
};

// Get language from file extension
const getLanguageFromExtension = (ext) => {
  const langMap = {
    jsx: 'javascript',
    js: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown'
  };
  return langMap[ext] || 'javascript';
};

export default function FileViewerModal({ file, onClose }) {
  const [theme, setTheme] = useState('vs-dark');
  
  if (!file) return null;
  
  const { icon: Icon, color } = getFileIcon(file.name, file.extension);
  const language = getLanguageFromExtension(file.extension);
  
  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      onClick={onClose}
    >
      <div 
        className="w-[90vw] h-[85vh] flex flex-col rounded-lg shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ 
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg-muted)'
          }}
        >
          <div className="flex items-center space-x-3">
            <Icon size={20} style={{ color }} />
            <div>
              <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>
                {file.name}
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {file.path}
                {file.isFrame && <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-600">FRAME</span>}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span 
              className="text-xs px-3 py-1.5 rounded-md"
              style={{ 
                backgroundColor: 'var(--color-primary-soft)',
                color: 'var(--color-primary)'
              }}
            >
              Read-only
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Monaco Editor - Read-only */}
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={language}
            value={file.content || '// No content available'}
            theme={theme}
            options={{
              readOnly: true,
              minimap: { enabled: true },
              fontSize: 13,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              renderLineHighlight: 'line',
              padding: { top: 10, bottom: 10 },
              lineNumbers: 'on',
              glyphMargin: false,
              folding: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              renderWhitespace: 'selection',
              automaticLayout: true
            }}
          />
        </div>
        
        {/* Footer */}
        <div 
          className="flex items-center justify-between px-6 py-3 border-t text-xs"
          style={{
            backgroundColor: 'var(--color-bg-muted)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-muted)'
          }}
        >
          <div className="flex items-center space-x-4">
            <span>Language: {language}</span>
            <span>Size: {file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'N/A'}</span>
            {file.frameName && <span>Frame: {file.frameName}</span>}
          </div>
          <span>Read-only view • To edit, navigate to the frame's SourcePage</span>
        </div>
      </div>
    </div>
  );
}
