import React from 'react';
import {
  FilePlus,
  FolderPlus,
  RefreshCw,
  FolderMinus,
  ChevronRight,
  ChevronDown,
  FileText,
  Box,
  Settings,
  Zap,
  Code2
} from 'lucide-react';

export default function ExplorerPanel() {
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
      {/* Explorer Header */}
      <div 
        className="flex items-center justify-between p-3 border-b text-xs uppercase font-semibold"
        style={{ 
          borderColor: 'var(--color-border)', 
          color: 'var(--color-text-muted)',
          backgroundColor: 'var(--color-bg-muted)'
        }}
      >
        <span>DeCode Project</span>
        <div className="flex space-x-2">
          <FilePlus
            size={16}
            className="cursor-pointer hover:text-[var(--color-primary)] transition-colors"
            title="New File"
          />
          <FolderPlus
            size={16}
            className="cursor-pointer hover:text-[var(--color-primary)] transition-colors"
            title="New Folder"
          />
          <RefreshCw
            size={16}
            className="cursor-pointer hover:text-[var(--color-primary)] transition-colors"
            title="Refresh Explorer"
          />
          <FolderMinus
            size={16}
            className="cursor-pointer hover:text-[var(--color-primary)] transition-colors"
            title="Collapse All Folders"
          />
        </div>
      </div>

      {/* File Tree Area */}
      <div className="flex-grow overflow-y-auto p-2 text-sm">
        <div className="mb-2">
          <div 
            className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
            style={{
              ':hover': { backgroundColor: 'var(--color-bg-muted)' }
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <ChevronDown size={14} style={{ color: 'var(--color-text)' }} />
            <span className="font-medium">MyWebsiteProject</span>
          </div>
          <div className="ml-4 space-y-1">
            {/* src folder */}
            <div 
              className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <ChevronRight size={14} style={{ color: 'var(--color-text)' }} />
              <Box size={14} style={{ color: 'var(--color-accent)' }} />
              <span>src</span>
            </div>
            <div className="ml-4 space-y-1">
              <div 
                className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <ChevronRight size={14} style={{ color: 'var(--color-text)' }} />
                <Box size={14} style={{ color: 'var(--color-accent)' }} />
                <span>components</span>
              </div>
              <div 
                className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <ChevronRight size={14} style={{ color: 'var(--color-text)' }} />
                <Box size={14} style={{ color: 'var(--color-accent)' }} />
                <span>layouts</span>
              </div>
              <div 
                className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <ChevronRight size={14} style={{ color: 'var(--color-text)' }} />
                <Box size={14} style={{ color: 'var(--color-accent)' }} />
                <span>pages</span>
              </div>
              {/* Files */}
              <div 
                className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
                style={{ backgroundColor: 'var(--color-primary-soft)' }}
              >
                <FileText size={14} style={{ color: 'var(--color-primary)' }} />
                <span style={{ color: 'var(--color-primary)' }} className="font-medium">App.jsx</span>
              </div>
              <div 
                className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <FileText size={14} style={{ color: 'var(--color-primary)' }} />
                <span>main.jsx</span>
              </div>
              <div 
                className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <Code2 size={14} style={{ color: '#e34c26' }} />
                <span>index.html</span>
              </div>
            </div>

            {/* public folder */}
            <div 
              className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <ChevronRight size={14} style={{ color: 'var(--color-text)' }} />
              <Box size={14} style={{ color: 'var(--color-accent)' }} />
              <span>public</span>
            </div>

            {/* Config files */}
            <div 
              className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <Settings size={14} style={{ color: '#41a6b5' }} />
              <span>.env</span>
            </div>
            <div 
              className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <Settings size={14} style={{ color: '#e8bf6a' }} />
              <span>package.json</span>
            </div>
            <div 
              className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <FileText size={14} style={{ color: 'var(--color-primary)' }} />
              <span>tailwind.config.js</span>
            </div>
            <div 
              className="flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors"
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <Zap size={14} style={{ color: '#e8bf6a' }} />
              <span>vite.config.js</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}